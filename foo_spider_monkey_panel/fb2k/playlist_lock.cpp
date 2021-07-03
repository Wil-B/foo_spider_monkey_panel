#include <stdafx.h>

#include "playlist_lock.h"

#include <utils/guid_helpers.h>

using namespace smp;

namespace
{

class PlaylistLockSmp : public playlist_lock
{
public:
    PlaylistLockSmp( size_t playlistIdx, uint32_t flags );

    bool query_items_add( t_size p_base, const pfc::list_base_const_t<metadb_handle_ptr>& p_data, const bit_array& p_selection ) override;
    bool query_items_reorder( const t_size* p_order, t_size p_count ) override;
    bool query_items_remove( const bit_array& p_mask, bool p_force ) override;
    bool query_item_replace( t_size p_index, const metadb_handle_ptr& p_old, const metadb_handle_ptr& p_new ) override;
    bool query_playlist_rename( const char* p_new_name, t_size p_new_name_len ) override;
    bool query_playlist_remove() override;
    bool execute_default_action( t_size p_item ) override;
    void on_playlist_index_change( t_size p_new_index ) override;
    void on_playlist_remove() override;
    void get_lock_name( pfc::string_base& p_out ) override;
    void show_ui() override;
    t_uint32 get_filter_mask() override;

private:
    size_t playlistIdx_;
    const uint32_t lockMask_;
};

} // namespace

namespace
{

constexpr char kLockName[] = SMP_UNDERSCORE_NAME;

}

namespace
{

PlaylistLockSmp::PlaylistLockSmp( uint32_t playlistIdx, uint32_t flags )
    : playlistIdx_( playlistIdx )
    , lockMask_( flags )
{
}

bool PlaylistLockSmp::query_items_add( size_t /*p_base*/, const pfc::list_base_const_t<metadb_handle_ptr>& /*p_data*/, const bit_array& /*p_selection*/ )
{
    return !( lockMask_ & filter_add );
}

bool PlaylistLockSmp::query_items_reorder( const size_t* /*p_order*/, size_t /*p_count*/ )
{
    return !( lockMask_ & filter_reorder );
}

bool PlaylistLockSmp::query_items_remove( const bit_array& /*p_mask*/, bool /*p_force*/ )
{
    return !( lockMask_ & filter_remove );
}

bool PlaylistLockSmp::query_item_replace( t_size /*p_index*/, const metadb_handle_ptr& /*p_old*/, const metadb_handle_ptr& /*p_new*/ )
{
    return !( lockMask_ & filter_replace );
}

bool PlaylistLockSmp::query_playlist_rename( const char* /*p_new_name*/, t_size /*p_new_name_len*/ )
{
    return !( lockMask_ & filter_rename );
}

bool PlaylistLockSmp::query_playlist_remove()
{
    return !( lockMask_ & filter_remove_playlist );
}

bool PlaylistLockSmp::execute_default_action( size_t /*p_item*/ )
{
    return !( lockMask_ & filter_default_action );
}

void PlaylistLockSmp::on_playlist_index_change( size_t p_new_index )
{
    playlistIdx_ = p_new_index;
}

void PlaylistLockSmp::on_playlist_remove()
{
    try
    {
        PlaylistLockManager::Get().RemoveLock( playlistIdx_ );
    }
    catch ( const qwr::QwrException& )
    {
    }
}

void PlaylistLockSmp::get_lock_name( pfc::string_base& p_out )
{
    p_out = kLockName;
}

void PlaylistLockSmp::show_ui()
{
}

uint32_t PlaylistLockSmp::get_filter_mask()
{
    return lockMask_;
}

} // namespace

namespace smp
{

PlaylistLockManager& PlaylistLockManager::Get()
{
    static PlaylistLockManager plm;
    return plm;
}

void PlaylistLockManager::InitializeLocks()
{
    const auto api = playlist_manager_v2::get();
    for ( const auto i: ranges::views::indices( api->get_playlist_count() ) )
    {
        uint32_t flags;
        if ( api->playlist_get_property_int( i, guid::playlist_attribute_lock_state, flags ) )
        {
            InstallLock( i, flags );
        }
    }
}

void PlaylistLockManager::InstallLock( size_t playlistIndex, uint32_t flags )
{
    qwr::QwrException::ExpectTrue( !!flags, "Can't install playlist lock with no locks specified" );

    const auto api = playlist_manager_v2::get();

    qwr::QwrException::ExpectTrue( playlistIndex < api->get_playlist_count(), "Index is out of bounds" );

    if ( api->playlist_lock_is_present( playlistIndex ) )
    {
        throw qwr::QwrException( "Playlist is already locked" );
    }

    auto lock = fb2k::service_new<PlaylistLockSmp>( playlistIndex, flags );
    if ( !api->playlist_lock_install( playlistIndex, lock ) )
    { // should not happen
        throw qwr::QwrException( "`Internal error: playlist_lock_install` failed" );
    }

    const auto lockId = qwr::unicode::ToU8( utils::GuidToStr( utils::GenerateGuid() ) );

    pfc::array_t<uint8_t> lockIdBinary;
    lockIdBinary.set_data_fromptr( reinterpret_cast<const uint8_t*>( lockId.data() ), lockId.size() );
    api->playlist_set_property( playlistIndex, guid::playlist_attribute_lock_id, lockIdBinary );
    api->playlist_set_property_int( playlistIndex, guid::playlist_attribute_lock_state, flags );

    knownLocks_.try_emplace( lockId, lock );
}

void PlaylistLockManager::RemoveLock( size_t playlistIndex )
{
    const auto api = playlist_manager_v2::get();

    if ( !api->playlist_lock_is_present( playlistIndex ) )
    {
        throw qwr::QwrException( "Playlist does not have a lock" );
    }

    pfc::string8 name;
    api->playlist_lock_query_name( playlistIndex, name );
    qwr::QwrException::ExpectTrue( name.equals( kLockName ), "This playlist lock was not generated by `{}`", SMP_UNDERSCORE_NAME );

    pfc::array_t<char> lockIdBinary;
    if ( !api->playlist_get_property( playlistIndex, guid::playlist_attribute_lock_id, lockIdBinary ) )
    {
        throw qwr::QwrException( "Internal error: playlist with component-owned lock is missing `lock-id` attribute" );
    }

    const auto lockId = qwr::u8string{ lockIdBinary.get_ptr(), lockIdBinary.get_count() };
    const auto lockIt = knownLocks_.find( lockId );
    qwr::QwrException::ExpectTrue( lockIt != knownLocks_.cend(), "Internal error: component-owned lock is not known by component" );

    if ( !api->playlist_lock_uninstall( playlistIndex, lockIt->second ) )
    {
        throw qwr::QwrException( "`playlist_lock_uninstall` failed" );
    }

    api->playlist_remove_property( playlistIndex, guid::playlist_attribute_lock_state );
    api->playlist_remove_property( playlistIndex, guid::playlist_attribute_lock_id );

    knownLocks_.erase( lockId );
}

bool PlaylistLockManager::HasLock( size_t playlistIndex )
{
    const auto api = playlist_manager_v2::get();

    if ( !api->playlist_lock_is_present( playlistIndex ) )
    {
        return false;
    }

    pfc::string8 name;
    api->playlist_lock_query_name( playlistIndex, name );
    return name.equals( kLockName );
}

} // namespace smp

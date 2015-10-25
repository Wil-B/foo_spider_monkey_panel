#pragma once

#include "script_interface_playlist.h"
#include "com_tools.h"

class FbPlaylistManagerTemplate
{
public:
	static STDMETHODIMP GetPlaylistFocusItemHandle(VARIANT_BOOL force, IFbMetadbHandle ** outItem);
	static STDMETHODIMP CreateAutoPlaylist(UINT idx, BSTR name, BSTR query, BSTR sort, UINT flags, UINT * p);
	static STDMETHODIMP CreatePlaylist(UINT playlistIndex, BSTR name, UINT * outPlaylistIndex);
};


// NOTE: Do not use com_object_impl_t<> to initialize, use com_object_singleton_t<> instead.
class FbPlaylistManager : public IDispatchImpl3<IFbPlaylistManager>
{
private:
	IFbPlaylistRecyclerManagerPtr m_fbPlaylistRecyclerManager;

protected:
	FbPlaylistManager() : m_fbPlaylistRecyclerManager(NULL)
	{
	}

public:
	// Methods
	STDMETHODIMP InsertPlaylistItems(UINT playlistIndex, UINT base, __interface IFbMetadbHandleList * handles, VARIANT_BOOL select, UINT * outSize);
	STDMETHODIMP InsertPlaylistItemsFilter(UINT playlistIndex, UINT base, __interface IFbMetadbHandleList * handles, VARIANT_BOOL select, UINT * outSize);
	STDMETHODIMP MovePlaylistSelection(UINT playlistIndex, int delta);
	STDMETHODIMP RemovePlaylistSelection(UINT playlistIndex, VARIANT_BOOL crop);
	STDMETHODIMP GetPlaylistSelectedItems(UINT playlistIndex, __interface IFbMetadbHandleList ** outItems);
	STDMETHODIMP GetPlaylistItems(UINT playlistIndex, IFbMetadbHandleList ** outItems);
	STDMETHODIMP SetPlaylistSelectionSingle(UINT playlistIndex, UINT itemIndex, VARIANT_BOOL state);
	STDMETHODIMP SetPlaylistSelection(UINT playlistIndex, VARIANT affectedItems, VARIANT_BOOL state);
	STDMETHODIMP ClearPlaylistSelection(UINT playlistIndex);
	STDMETHODIMP UndoBackup(UINT playlistIndex);
	STDMETHODIMP UndoRestore(UINT playlistIndex);
	STDMETHODIMP GetPlaylistFocusItemIndex(UINT playlistIndex, INT * outPlaylistItemIndex);
	STDMETHODIMP GetPlaylistFocusItemHandle(VARIANT_BOOL force, IFbMetadbHandle ** outItem);
	STDMETHODIMP SetPlaylistFocusItem(UINT playlistIndex, UINT itemIndex);
	STDMETHODIMP SetPlaylistFocusItemByHandle(UINT playlistIndex, IFbMetadbHandle * item);
	STDMETHODIMP GetPlaylistName(UINT playlistIndex, BSTR * outName);
	STDMETHODIMP CreateAutoPlaylist(UINT idx, BSTR name, BSTR query, BSTR sort, UINT flags, UINT * p);
	STDMETHODIMP CreatePlaylist(UINT playlistIndex, BSTR name, UINT * outPlaylistIndex);
	STDMETHODIMP RemovePlaylist(UINT playlistIndex, VARIANT_BOOL * outSuccess);
	STDMETHODIMP MovePlaylist(UINT from, UINT to, VARIANT_BOOL * outSuccess);
	STDMETHODIMP RenamePlaylist(UINT playlistIndex, BSTR name, VARIANT_BOOL * outSuccess);
	STDMETHODIMP DuplicatePlaylist(UINT from, BSTR name, UINT * outPlaylistIndex);
	STDMETHODIMP EnsurePlaylistItemVisible(UINT playlistIndex, UINT itemIndex);
	STDMETHODIMP GetPlayingItemLocation(IFbPlayingItemLocation ** outPlayingLocation);
	STDMETHODIMP ExecutePlaylistDefaultAction(UINT playlistIndex, UINT playlistItemIndex, VARIANT_BOOL * outSuccess);
	STDMETHODIMP IsPlaylistItemSelected(UINT playlistIndex, UINT playlistItemIndex, UINT * outSeleted);
	STDMETHODIMP SetActivePlaylistContext();

	STDMETHODIMP CreatePlaybackQueueItem(IFbPlaybackQueueItem ** outPlaybackQueueItem);
	STDMETHODIMP RemoveItemFromPlaybackQueue(UINT index);
	STDMETHODIMP RemoveItemsFromPlaybackQueue(VARIANT affectedItems);
	STDMETHODIMP AddPlaylistItemToPlaybackQueue(UINT playlistIndex, UINT playlistItemIndex);
	STDMETHODIMP AddItemToPlaybackQueue(IFbMetadbHandle * handle);
	STDMETHODIMP GetPlaybackQueueCount(UINT * outCount);
	STDMETHODIMP GetPlaybackQueueContents(VARIANT * outContents);
	STDMETHODIMP FindPlaybackQueueItemIndex(IFbMetadbHandle * handle, UINT playlistIndex, UINT playlistItemIndex, INT * outIndex);
	STDMETHODIMP FlushPlaybackQueue();
	STDMETHODIMP IsPlaybackQueueActive(VARIANT_BOOL * outIsActive);

	STDMETHODIMP SortByFormat(UINT playlistIndex, BSTR pattern, VARIANT_BOOL selOnly, VARIANT_BOOL * outSuccess);
	STDMETHODIMP SortByFormatV2(UINT playlistIndex, BSTR pattern, INT direction, VARIANT_BOOL * outSuccess);

	// Properties
	STDMETHODIMP get_PlaybackOrder(UINT * outOrder);
	STDMETHODIMP put_PlaybackOrder(UINT order);
	STDMETHODIMP get_ActivePlaylist(UINT * outPlaylistIndex);
	STDMETHODIMP put_ActivePlaylist(UINT playlistIndex);
	STDMETHODIMP get_PlayingPlaylist(UINT * outPlaylistIndex);
	STDMETHODIMP put_PlayingPlaylist(UINT playlistIndex);
	STDMETHODIMP get_PlaylistCount(UINT * outCount);
	STDMETHODIMP get_PlaylistItemCount(UINT playlistIndex, UINT * outCount);
	STDMETHODIMP get_PlaylistRecyclerManager(__interface IFbPlaylistRecyclerManager ** outRecyclerManager);
};

class FbPlaybackQueueItem : public IDisposableImpl4<IFbPlaybackQueueItem>
{
protected:
	t_playback_queue_item m_playback_queue_item;

	FbPlaybackQueueItem() {}
	FbPlaybackQueueItem(const t_playback_queue_item & playbackQueueItem);
	virtual ~FbPlaybackQueueItem();
	virtual void FinalRelease();

public:
	// Methods
	STDMETHODIMP Equals(IFbPlaybackQueueItem * item, VARIANT_BOOL * outEquals);

	// Properties
	STDMETHODIMP get__ptr(void ** pp);
	STDMETHODIMP get_Handle(IFbMetadbHandle ** outHandle);
	STDMETHODIMP put_Handle(IFbMetadbHandle * handle);
	STDMETHODIMP get_PlaylistIndex(UINT * outPlaylistIndex);
	STDMETHODIMP put_PlaylistIndex(UINT playlistIndex);
	STDMETHODIMP get_PlaylistItemIndex(UINT * outItemIndex);
	STDMETHODIMP put_PlaylistItemIndex(UINT itemIndex);
};

class FbPlayingItemLocation : public IDispatchImpl3<IFbPlayingItemLocation>
{
protected:
	bool m_isValid;
	t_size m_playlistIndex;
	t_size m_itemIndex;

	FbPlayingItemLocation(bool isValid, t_size playlistIndex, t_size itemInex)
		: m_isValid(isValid), m_playlistIndex(playlistIndex), m_itemIndex(itemInex)
	{
	}

public:
	STDMETHODIMP get_IsValid(VARIANT_BOOL * outIsValid);
	STDMETHODIMP get_PlaylistIndex(UINT * outPlaylistIndex);
	STDMETHODIMP get_PlaylistItemIndex(UINT * outPlaylistItemIndex);
};

class FbPlaylistRecyclerManager : public IDispatchImpl3<IFbPlaylistRecyclerManager>
{
public:
	STDMETHODIMP get_Count(UINT * outCount);
	STDMETHODIMP get_Name(UINT index, BSTR * outName);
	STDMETHODIMP get_Content(UINT index, __interface IFbMetadbHandleList ** outContent);
	STDMETHODIMP get_Id(UINT index, UINT * outId);

	STDMETHODIMP Purge(VARIANT affectedItems);
	STDMETHODIMP Restore(UINT index);
	STDMETHODIMP RestoreById(UINT id);
	STDMETHODIMP FindById(UINT id, UINT * outId);
};

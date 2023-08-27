#pragma once

#include <panel/panel_fwd.h>
#include <tasks/cancellable.h>
#include <tasks/events/event_id.h>
#include <tasks/runnable.h>

namespace smp
{

class Event_Mouse;
class Event_Drag;

class EventBase : public Runnable
    , public Cancellable
{
public:
    [[nodiscard]] EventBase( EventId id );
    virtual ~EventBase() = default;

    [[nodiscard]] virtual std::unique_ptr<EventBase> Clone();

    void SetTarget( smp::not_null_shared<panel::PanelAccessor> pTarget );
    [[nodiscard]] EventId GetId() const;

    [[nodiscard]] virtual const qwr::u8string& GetType() const;
    [[nodiscard]] virtual Event_Mouse* AsMouseEvent();
    [[nodiscard]] virtual Event_Drag* AsDragEvent();

protected:
    const EventId id_;
    std::shared_ptr<panel::PanelAccessor> pTarget_;
};

} // namespace smp

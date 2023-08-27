#pragma once

#include <js_backend/objects/core/object_traits.h>
#include <js_backend/objects/dom/event.h>

namespace mozjs
{

class KeyboardEvent;

template <>
struct JsObjectTraits<KeyboardEvent>
{
    using ParentJsType = JsEvent;

    static constexpr bool HasProto = true;
    static constexpr bool HasGlobalProto = true;
    static constexpr bool HasParentProto = true;
    static constexpr bool IsExtendable = true;

    static const JSClass JsClass;
    static const JSFunctionSpec* JsFunctions;
    static const JSPropertySpec* JsProperties;
    static const JsPrototypeId PrototypeId;
    static const JSNative JsConstructor;
};

class KeyboardEvent
    : public JsObjectBase<KeyboardEvent>
    , protected JsEvent
{
    MOZJS_ENABLE_OBJECT_BASE_ACCESS( KeyboardEvent );

    using ParentJsType = JsEvent;

public:
    struct EventProperties
    {
        ParentJsType::EventProperties baseProps;
        bool altKey = false;
        bool ctrlKey = false;
        bool metaKey = false;
        bool shiftKey = false;
        qwr::u8string code;
        std::wstring key;
        uint32_t location;
        bool repeat;
    };

protected:
    struct EventOptions
    {
        ParentJsType::EventOptions baseOptions;
        bool altKey = false;
        bool ctrlKey = false;
        bool metaKey = false;
        bool shiftKey = false;
        qwr::u8string code;
        std::wstring key;
        uint32_t location;
        bool repeat;

        EventProperties ToDefaultProps() const;
    };

public:
    ~KeyboardEvent() override = default;

public:
    static JSObject* Constructor( JSContext* cx, const qwr::u8string& type, JS::HandleValue options = JS::UndefinedHandleValue );
    static JSObject* ConstructorWithOpt( JSContext* cx, size_t optArgCount, const qwr::u8string& type, JS::HandleValue options );

    bool get_AltKey() const;
    const qwr::u8string& get_Code() const;
    bool get_CtrlKey() const;
    bool get_IsComposing() const;
    const std::wstring& get_Key() const;
    bool get_MetaKey() const;
    uint32_t get_Location() const;
    bool get_Repeat() const;
    bool get_ShiftKey() const;

protected:
    [[nodiscard]] KeyboardEvent( JSContext* cx, const qwr::u8string& type, const EventProperties& props );
    [[nodiscard]] KeyboardEvent( JSContext* cx, const qwr::u8string& type, const EventOptions& options = {} );
    [[nodiscard]] size_t GetInternalSize();

    [[nodiscard]] static EventOptions ExtractOptions( JSContext* cx, JS::HandleValue options );

private:
    static std::unique_ptr<KeyboardEvent> CreateNative( JSContext* cx, const qwr::u8string& type, const EventProperties& props );
    static std::unique_ptr<KeyboardEvent> CreateNative( JSContext* cx, const qwr::u8string& type, const EventOptions& options );

private:
    JSContext* pJsCtx_ = nullptr;

    EventProperties props_;
};

} // namespace mozjs

#pragma once

#include <js_engine/native_to_js_converter.h>
#include <js_engine/js_to_native_converter.h>

#include <optional>


namespace mozjs
{

template <int ArgArraySize, typename ArgType, typename... Args>
bool NativeToJsArguments( JSContext * cx,
                          JS::AutoValueArray<ArgArraySize>& wrappedArgs,
                          uint8_t argIndex, ArgType arg, Args&&... args )
{
    return NativeToJsValue( cx, arg, wrappedArgs[argIndex] )
        && NativeToJsArguments( cx, wrappedArgs, argIndex + 1, args... );
}

template <int ArgArraySize>
bool NativeToJsArguments( JSContext * cx,
                          JS::AutoValueArray<ArgArraySize>& wrappedArgs,
                          uint8_t argIndex )
{
    return true;
}

template <typename ReturnType = std::nullptr_t, typename... Args>
std::optional<ReturnType> InvokeJsCallback( JSContext* cx,
                                            JS::HandleObject globalObject,
                                            std::string_view functionName,
                                            Args&&... args )
{
    assert( cx );
    assert( !!globalObject );
    assert( functionName.length() );

    JS::RootedValue retVal( cx );

    if constexpr ( sizeof...( Args ) > 0 )
    {
        JS::AutoValueArray<sizeof...( Args )> wrappedArgs( cx );
        if ( !NativeToJsArguments( cx, wrappedArgs, 0, args... ) )
        {
            return std::nullopt;
        }

        if ( !InvokeJsCallback_Impl( cx, globalObject, functionName, wrappedArgs, &retVal ) )
        {
            return std::nullopt;
        }
    }
    else
    {
        if ( !InvokeJsCallback_Impl( cx, globalObject, functionName, JS::HandleValueArray::empty(), &retVal ) )
        {
            return std::nullopt;
        }
    }

    if ( !JsToNative<ReturnType>::IsValid( cx, retVal ) )
    {
        return std::nullopt;
    }

    return JsToNative<ReturnType>::Convert( cx, retVal );
}

bool InvokeJsCallback_Impl( JSContext* cx,
                            JS::HandleObject globalObject,
                            std::string_view functionName,
                            const JS::HandleValueArray& args,
                            JS::MutableHandleValue rval );

}

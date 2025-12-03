package com.yamal.vanilla_brownfield_custom.bridge

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

abstract class NativeHelloWorldModuleSpec(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    abstract fun hello(name: String)
}

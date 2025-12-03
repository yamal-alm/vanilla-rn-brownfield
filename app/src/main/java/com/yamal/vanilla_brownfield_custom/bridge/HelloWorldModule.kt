package com.yamal.vanilla_brownfield_custom.bridge

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = HelloWorldModule.NAME)
class HelloWorldModule(reactContext: ReactApplicationContext) : NativeHelloWorldModuleSpec(reactContext) {

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    override fun hello(name: String) {
        Log.d(NAME, "Hello $name from Android TurboModule!")
    }

    companion object {
        const val NAME = "HelloWorldModule"
    }
}



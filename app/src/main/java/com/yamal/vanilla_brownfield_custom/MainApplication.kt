package com.yamal.vanilla_brownfield_custom

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {
    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, OpenSourceMergedSoMapping)
        DefaultNewArchitectureEntryPoint.load()
    }

    override val reactNativeHost: ReactNativeHost =
            object : DefaultReactNativeHost(this) {
                override fun getPackages(): List<ReactPackage> =
                    PackageList(this).packages

                override fun getJSMainModuleName() = "index"

                override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
            }

    override val reactHost: ReactHost
        get() = DefaultReactHost.getDefaultReactHost(
            this,
            reactNativeHost
        )
}
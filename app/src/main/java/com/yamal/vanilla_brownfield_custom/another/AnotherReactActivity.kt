package com.yamal.vanilla_brownfield_custom.another

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper

class AnotherReactActivity : ReactActivity() {
    override fun getMainComponentName(): String = "AnotherApp"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        ReactActivityDelegateWrapper(
            this,
            true,
            DefaultReactActivityDelegate(this, mainComponentName, false)
        )

}
package com.yamal.vanilla_brownfield_custom.camera

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate

class CameraActivity : ReactActivity() {
    override fun getMainComponentName(): String = "CameraApp"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, false)
}

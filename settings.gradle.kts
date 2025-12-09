pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }

    includeBuild("node_modules/@react-native/gradle-plugin")
    includeBuild("node_modules/expo-modules-autolinking/android/expo-gradle-plugin")
}

plugins {
    id("com.facebook.react.settings")
    id("expo-autolinking-settings")
}

expoAutolinking {
    projectRoot = file(".")
}

extensions.configure<com.facebook.react.ReactSettingsExtension> {
    autolinkLibrariesFromCommand(
        workingDirectory = file("."),
        command = listOf("npx", "react-native", "config"),
        lockFiles = files("package-lock.json")
    )
}

expoAutolinking.useExpoModules()
expoAutolinking.useExpoVersionCatalog()

includeBuild("node_modules/@react-native/gradle-plugin")
includeBuild(expoAutolinking.reactNativeGradlePlugin)

rootProject.name = "vanilla-brownfield-custom"
include(":app")

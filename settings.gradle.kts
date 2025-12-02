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
}

plugins { id("com.facebook.react.settings") }

extensions.configure<com.facebook.react.ReactSettingsExtension> {
    autolinkLibrariesFromCommand(
        workingDirectory = file(".")
    )
}
includeBuild("node_modules/@react-native/gradle-plugin")

rootProject.name = "vanilla-brownfield-custom"
include(":app")

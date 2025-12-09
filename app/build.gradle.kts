import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    id("com.facebook.react")
}

android {
    namespace = "com.yamal.vanilla_brownfield_custom"
    compileSdk {
        version = release(36)
    }

    defaultConfig {
        applicationId = "com.yamal.vanilla_brownfield_custom"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        getByName("debug") {
            storeFile = file("../keystores/debug.keystore")
            storePassword = "debugdebug"
            keyAlias = "debug"
            keyPassword = "debugdebug"
        }
        create("release") {
            storeFile = file("../keystores/debug.keystore")
            storePassword = "debugdebug"
            keyAlias = "debug"
            keyPassword = "debugdebug"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )

            signingConfig = signingConfigs.getByName("release")

            ndk.debugSymbolLevel = "FULL"
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlin {
        compilerOptions {
            jvmTarget = JvmTarget.JVM_17
        }
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)

    implementation(libs.react.android)
    implementation(libs.hermes.android)

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}

react {
    root = File("../")
    reactNativeDir = File("../node_modules/react-native")
    cliFile = File("../node_modules/react-native/cli.js")
    codegenDir = File("../node_modules/@react-native/codegen")
    entryFile = File("../react/index.js")
    autolinkLibrariesWithApp()
}

val outputFile = rootProject.layout.buildDirectory.file("generated/autolinking/autolinking.json")

val generateAutolinkingJson by tasks.registering(Exec::class) {
    workingDir = project.projectDir.resolve("..").normalize()
    isIgnoreExitValue = false

    commandLine("npx", "react-native", "config")

    doFirst {
        val outFile = outputFile.get().asFile
        outFile.parentFile.mkdirs()
        standardOutput = outFile.outputStream()
    }

    doLast {
        logger.lifecycle("autolinking.json generated in: ${outputFile.get().asFile.absolutePath}")
    }

    outputs.file(outputFile)
}

tasks.named("preBuild") {
    finalizedBy("generateAutolinkingJson")
}
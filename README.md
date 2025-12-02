# Vanilla RN Brownfield

A React Native brownfield application integrated with an Android native project.

[This](https://reactnative.dev/docs/integration-with-existing-apps#3-adding-react-native-to-your-app) is the documentation that have been followed to create this project. 
The main difference is that this project doesn't require the base Android native project to be located inside any /android subfolder. 

## Prerequisites

- Node.js >= 20
- Java Development Kit (JDK) 17
- Android Studio with Android SDK
- React Native CLI
- Gradle

## Initial Setup

### 1. Install Node Modules

First, install all the required npm dependencies:

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

### 2. Verify Android Environment

Make sure you have the Android SDK installed and the `ANDROID_HOME` environment variable set properly:

```bash
echo $ANDROID_HOME
```

If not set, add this to your `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3. Gradle Sync

The project will automatically sync Gradle dependencies when you build. If you want to manually sync:

```bash
cd android
./gradlew clean
cd ..
```

## Working with Debug Build

### Running Debug Build

To build and run the debug version of the app:

1. **Start the Metro bundler** (in one terminal):
   ```bash
   npm start
   ```

2. **Run the Android app** (in another terminal):
   ```bash
   npm run android
   ```

   Or directly using Gradle:
   ```bash
   ./gradlew :app:installDebug
   ```

### Debug Build Features

- Debug signing configuration is pre-configured using `keystores/debug.keystore`
- Hot reloading enabled
- Development menu accessible (shake device or press Cmd+M in emulator)
- Source maps enabled for debugging

### Debugging

- Open Chrome DevTools: In the app, open the development menu and select "Debug"
- Use React Native Debugger for enhanced debugging experience
- Check logs with:
  ```bash
  npx react-native log-android
  ```

## Building Release Version

### 1. Build Release APK

To build a release APK:

```bash
./gradlew :app:assembleRelease
```

The APK will be generated at:
```
app/build/outputs/apk/release/app-release.apk
```

### 2. Build Release App Bundle (AAB)

For Google Play Store distribution:

```bash
./gradlew :app:bundleRelease
```

The bundle will be generated at:
```
app/build/outputs/bundle/release/app-release.aab
```

### 3. Install Release Build on Device

To install the release build directly on a connected device:

```bash
./gradlew :app:installRelease
```

### Release Build Configuration

- **Signing**: Currently uses debug keystore for convenience. For production, update the signing config in `app/build.gradle.kts`
- **Minification**: Disabled by default. Enable ProGuard/R8 by setting `isMinifyEnabled = true` in the release build type


## Troubleshooting

### Node command not found
If you encounter a "node command not found" error, try opening Android Studio from terminal:
```bash
open /Applications/Android\ Studio.app
```

### Clear all caches
```bash
# Clear React Native cache
npm start -- --reset-cache

# Clear Gradle cache
./gradlew clean

# Clear build folders
rm -rf android/app/build
```

## Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Android Developer Guide](https://developer.android.com/)
- [React Native Integration with Existing Apps](https://reactnative.dev/docs/integration-with-existing-apps)


# MedFlow v1 - Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Initial Verification](#initial-verification)
3. [Android SDK Installation](#android-sdk-installation)
4. [USB Device Setup](#usb-device-setup)
5. [Running the App](#running-the-app)
6. [Building for Production](#building-for-production)
7. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Specifications
- **OS**: Windows 10+ / macOS 10.14+ / Linux
- **RAM**: 4GB (8GB recommended)
- **Disk Space**: 5GB free (for Android SDK)
- **Internet**: Required for first download

### Required Software
| Software | Version | Download |
|----------|---------|----------|
| Node.js | 22.11.0+ | https://nodejs.org/ |
| npm | 11.0+ | Included with Node.js |
| Java SDK | 17+ | https://www.oracle.com/java/technologies/downloads/ |
| Android SDK | 24+ | https://developer.android.com/studio |

---

## Initial Verification

### Step 1: Check Prerequisites
```powershell
# Open PowerShell in project folder

# Run verification script:
.\verify-setup.ps1

# This will check:
# ✓ Node.js installation
# ✓ npm installation
# ✓ Java installation
# ✓ ADB installation
```

### Step 2: Check Versions
```powershell
node --version      # Should be v22.11.0+
npm --version       # Should be 11.0+
java -version       # Should be JDK 17+
adb --version       # Should show Android SDK version
```

### Step 3: Verify Project Installation
```bash
# Project dependencies should already be installed
npm list react
npm list react-native

# Both should show versions without errors
```

---

## Android SDK Installation

### Option A: Android Studio (Recommended)

1. **Download Android Studio**
   - Go to https://developer.android.com/studio
   - Download the latest version
   - Run the installer

2. **Initial Setup**
   - Follow the installation wizard
   - Accept license agreements
   - Choose "Standard" installation

3. **Install SDK Platforms**
   - Open Android Studio
   - Go to Tools → SDK Manager
   - Install these SDK Platforms:
     - Android 7.0 (API 24) - MINIMUM
     - Android 10 (API 29)
     - Android 12 (API 31)
     - Android 13 (API 33)
     - Android 14 (API 34) - RECOMMENDED

4. **Install SDK Tools**
   - In SDK Manager, go to "SDK Tools" tab
   - Install:
     - Android SDK Build Tools (latest)
     - Android SDK Platform-Tools
     - Android Emulator (optional)
     - Android SDK Tools

5. **Set ANDROID_HOME Environment Variable**
   ```
   Variable name: ANDROID_HOME
   Variable value: C:\Users\YourUsername\AppData\Local\Android\Sdk
   ```

6. **Add to PATH**
   ```
   Add to PATH:
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   ```

### Option B: Command Line Tools

```powershell
# Download from: https://developer.android.com/tools/releases/cmdline-tools

# Extract and set up:
$env:ANDROID_SDK_ROOT = "C:\Android\sdk"
$env:ANDROID_HOME = "C:\Android\sdk"

# Add to persistent PATH (System Properties → Environment Variables)
```

### Verify Installation
```bash
adb --version          # Should show Android SDK version
sdkmanager --list      # Should list installed packages
```

---

## USB Device Setup

### Enable USB Debugging on Your Device

#### Android 13 and above:
1. Open **Settings**
2. Tap **About phone** → **Build number** (tap 7 times)
3. Go back to **Settings**
4. Open **System** → **Developer options**
5. Enable **USB Debugging**
6. Enable **File Transfer** (MTP mode)

#### Android 12 and below:
1. Open **Settings**
2. Tap **About phone** → **Build number** (tap 7 times)
3. Go back to **Settings**
4. Open **Developer options**
5. Enable **USB Debugging**

### Connect Device via USB

1. **Connect the device:**
   - Plug USB cable into device
   - Plug USB cable into computer

2. **Approve the connection:**
   - A dialog will appear on device
   - Tap **Allow** or **Trust**

3. **Verify connection:**
   ```bash
   adb devices
   ```

   Expected output:
   ```
   List of attached devices
   ABCD1234567890      device
   ```

   If it says "unauthorized":
   - Revoke USB debugging on device
   - Reconnect and tap "Allow" again

### File Transfer Mode

Ensure your device is set to "File Transfer" mode:
1. Pull down notification panel
2. Tap "USB charging"
3. Select "File Transfer" or "MTP"

---

## Running the App

### First Time Setup

```bash
# Navigate to project folder:
cd c:\Users\Asus\Desktop\MedFlow\MedFlowv1

# Ensure dependencies are installed:
npm install

# Verify device connection:
adb devices
```

### Build and Run

```bash
# One command to do everything:
npm run android

# This will:
# 1. Start Metro Bundler
# 2. Compile Android app
# 3. Install on device
# 4. Launch the app
```

### Development Server

```bash
# In one terminal - start dev server:
npm start

# In another terminal - build and run:
npm run android

# Or use dev menu - Press R twice to reload
```

### Hot Reload (Fast Refresh)

After the app is running:

1. **Fast Refresh** (recommended):
   - Edit code in `App.tsx`
   - Save file
   - Changes auto-reload on device (in ~1 second)

2. **Reload** via menu:
   - Shake device or Press `Ctrl+M`
   - Select "Reload"
   - App restarts with code changes

3. **Debug**:
   - Shake device or Press `Ctrl+M`
   - Select "Debug"
   - Opens Chrome DevTools for debugging

---

## Building for Production

### Build Debug APK (for testing)

```bash
cd android
./gradlew assembleDebug
cd ..

# Output: android/app/build/outputs/apk/debug/app-debug.apk
# Use for testing on devices
```

### Build Release APK (for distribution)

#### Option 1: Generate Signing Key (one-time)

```bash
keytool -genkey -v -keystore medflow-release.jks ^
  -keyalg RSA -keysize 2048 -validity 10000 ^
  -alias medflow

# This will ask for:
# - Keystore password
# - Alias password
# - Your name, organization, etc.
# - Save the key safely!
```

#### Option 2: Configure Gradle Signing

```gradle
// android/app/build.gradle

signingConfigs {
    release {
        storeFile file('medflow-release.jks')
        storePassword '...'           // Your keystore password
        keyAlias '...'                // Your alias name
        keyPassword '...'             // Your alias password
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
    }
}
```

#### Build Release APK

```bash
cd android
./gradlew assembleRelease
cd ..

# Output: android/app/build/outputs/apk/release/app-release.apk
# Ready for distribution on Google Play Store
```

### Install APK on Device

```bash
# Debug APK:
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Release APK:
adb install -r android/app/build/outputs/apk/release/app-release.apk

# -r flag allows reinstalling
```

---

## Troubleshooting

### Device Issues

#### Device doesn't appear in `adb devices`
```bash
# Restart ADB server:
adb kill-server
adb start-server

# Reconnect your device
# Then check again:
adb devices
```

#### "Device unauthorized"
- Revoke USB debugging on device
- Unplug USB cable
- Plug back in
- Tap "Allow" when prompted

#### "No device connected to ADB"
1. Check cable connection
2. Try different USB port
3. Try different USB cable
4. Update USB drivers

### Build Issues

#### Build fails with "SDK not found"
```bash
# Verify ANDROID_HOME is set:
echo %ANDROID_HOME%

# If empty, set environment variable to Android SDK path:
# Usually: C:\Users\YourName\AppData\Local\Android\Sdk
```

#### "Unable to locate Android SDK"
```bash
# In project folder:
cd android
./gradlew --version

# Should show Gradle version without errors
```

#### Port 8081 already in use
```powershell
# Find the process:
netstat -ano | findstr :8081

# Kill it (replace <PID> with actual PID):
taskkill /PID <PID> /F

# Then try again:
npm run android
```

### Runtime Issues

#### App crashes on launch
```bash
# Check device logs:
adb logcat | findstr "FATAL\|ERROR"

# Filter for your app:
adb logcat | findstr "ReactNativeJS"

# Clear logs before testing:
adb logcat -c
```

#### Module resolution errors
```bash
# Clear cache and rebuild:
npm start -- --reset-cache

# In another terminal:
npm run android
```

#### Metro bundler crashes
```bash
# Kill all node processes:
taskkill /F /IM node.exe

# Start fresh:
npm start
```

---

## 🎯 Next Steps

1. ✅ Verify system setup with `.\verify-setup.ps1`
2. ✅ Connect Android device via USB
3. ✅ Enable USB Debugging on device
4. ✅ Run `npm run android`
5. ✅ See the app on your device
6. ✅ Edit files in `App.tsx` to start developing

---

## 📱 App Information

| Property | Value |
|----------|-------|
| App Name | MedFlow v1 |
| Version | 1.0.0 |
| React Native | 0.85.0 |
| React | 19.2.3 |
| TypeScript | 5.8.3 |
| Min API Level | 24 (Android 7.0) |
| Target API Level | 34+ (Android 14+) |

---

## 🔗 Useful Resources

- **React Native** - https://reactnative.dev
- **Android Dev** - https://developer.android.com
- **ADB Docs** - https://developer.android.com/tools/adb
- **JavaScript** - https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **TypeScript** - https://www.typescriptlang.org

---

## 📞 Support

If you encounter issues:

1. Check the relevant guide:
   - **Quick setup**: QUICK_START.md
   - **USB debugging**: DEBUGGING_GUIDE.md
   - **Environment setup**: USB_SETUP_GUIDE.md

2. Run verification script:
   ```bash
   .\verify-setup.ps1
   ```

3. Check official docs:
   - React Native: https://reactnative.dev/docs/troubleshooting
   - Android: https://developer.android.com/docs

---

**Your MedFlow v1 app is ready for development! 🚀**

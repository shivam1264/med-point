# MedFlow v1 - USB Mobile Deployment Guide

## 📱 Prerequisites

Before you can run the app on a physical device, ensure you have:

1. **Node.js** (v22.11.0 or higher)
   - Download: https://nodejs.org/

2. **Android SDK** 
   - Install Android Studio: https://developer.android.com/studio
   - Minimum API Level: 24 (Android 7.0)

3. **Java Development Kit (JDK)**
   - JDK 17+ recommended
   - Install via Android Studio or separately

4. **USB Cable**
   - A USB cable to connect your Android device to your computer

---

## 🔧 Environment Setup

### 1. Install Android Studio & SDK
```bash
# Download and install Android Studio from the link above
# During installation, ensure you install:
# - Android SDK
# - Android SDK Platform tools
# - Android Emulator (optional)
```

### 2. Set Environment Variables (Windows)
Create/verify these environment variables:

**ANDROID_HOME:**
- Open: Settings → System → Advanced System Settings → Environment Variables
- New Variable:
  - Variable name: `ANDROID_HOME`
  - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`

**Add to PATH:**
- Add `%ANDROID_HOME%\platform-tools` to your PATH variable
- Add `%ANDROID_HOME%\tools` to your PATH variable

### 3. Verify Installation
```powershell
# Open PowerShell and verify:
adb --version
npm --version
node --version
```

---

## 📲 Enable USB Debugging on Your Android Device

### For Android 10 and above:
1. Open **Settings** → **About phone**
2. Tap **Build number** 7 times
3. Go back → **System** → **Developer options**
4. Enable **USB Debugging**
5. Enable **File Transfer** (MTP mode) when connecting via USB

### For Android 9 and below:
1. Open **Settings** → **About phone**
2. Tap **Build number** 7 times
3. Go back → **Developer options**
4. Enable **USB Debugging**

---

## 🔌 Connect Your Device via USB

1. **Connect** your Android device to your computer using a USB cable
2. **Unlock** your phone (it will display a dialog asking for permission)
3. **Allow** USB Debugging when prompted
4. **Verify** connection:
   ```powershell
   adb devices
   ```
   You should see your device listed:
   ```
   List of attached devices
   XXXXXXXXXXXX    device
   ```

---

## 🚀 Build and Run the App

### Navigate to project directory:
```powershell
cd c:\Users\Asus\Desktop\MedFlow\MedFlowv1
```

### Option 1: Build and Run (Recommended)
```bash
npm run android
```
This command will:
1. Start the Metro bundler
2. Compile the Android app
3. Install the app on your connected device
4. Launch the app

### Option 2: Build APK (for manual installation)
```bash
cd android
./gradlew assembleDebug
cd ..
```
The APK will be available at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Option 3: Build Release APK
```bash
cd android
./gradlew assembleRelease
cd ..
```

---

## 📋 Troubleshooting

### Device not recognized:
```powershell
# Disconnect and reconnect
adb kill-server
adb start-server
adb devices
```

### Permission denied:
1. Revoke USB Debugging permissions on device
2. Reconnect and approve again

### Build fails:
```bash
# Clean build:
cd android
./gradlew clean
cd ..
npm run android
```

### Metro bundler issues:
```powershell
# Kill existing bundler and restart:
npm start -- --reset-cache
```

---

## 🏗️ Project Structure

```
MedFlowv1/
├── android/                 # Android native code
├── ios/                      # iOS native code
├── App.tsx                   # Main React Native component
├── index.js                  # App entry point
├── app.json                  # App configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
└── metro.config.js           # Metro bundler config
```

---

## 📦 Installing Additional Dependencies

To add new packages:
```bash
npm install package-name
# Then rebuild:
npm run android
```

---

## 🎯 Development Workflow

1. **Start development server:**
   ```bash
   npm start
   ```

2. **In another terminal, run on device:**
   ```bash
   npm run android
   ```

3. **Make code changes:**
   - Edit files in the project
   - Changes auto-reload on connected device

4. **View debug logs:**
   ```bash
   adb logcat
   ```

---

## 📱 App Information

- **Name:** MedFlow v1
- **Display Name:** MedFlow v1
- **Version:** 1.0.0
- **React:** 19.2.3
- **React Native:** 0.85.0
- **Min API Level:** 24 (Android 7.0)

---

## 🔗 Useful Links

- React Native Docs: https://reactnative.dev/
- Android Studio: https://developer.android.com/studio
- ADB Commands: https://developer.android.com/tools/adb
- React Native CLI: https://reactnative.dev/docs/cli

---

## ⚠️ Important Notes

- Always keep your device unlocked during development
- Battery saver mode may interfere with debugging
- For release builds, you'll need to sign the APK
- USB Debugging should be disabled in production

---

**Ready to develop! 🚀**

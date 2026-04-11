# MedFlow v1 - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 22.11.0+ installed
- Android SDK with API level 24+ (Android 7.0+)
- Android device or emulator
- USB cable (for physical device)

### Step 1: Verify Your System
```powershell
# Open PowerShell in the project folder:
.\verify-setup.ps1  # Windows PowerShell
# OR
.\verify-setup.bat  # Windows Command Prompt
```

### Step 2: Connect Your Android Device
1. Plug in your Android device via USB
2. Go to Settings → About phone → Tap Build Number 7 times
3. Go to Developer Options → Enable USB Debugging
4. Verify connection:
   ```bash
   adb devices
   ```
   You should see your device listed

### Step 3: Build and Run
```bash
# Navigate to the project folder:
cd c:\Users\Asus\Desktop\MedFlow\MedFlowv1

# Install dependencies (already done, but you can refresh):
npm install

# Run on your device:
npm run android
```

The app will:
- Start the development server (Metro Bundler)
- Compile the Android app
- Install it on your device
- Launch automatically

### Step 4: See Your App
- The MedFlow v1 app should now be running on your device
- You'll see the welcome screen with app status
- Make any code changes in `App.tsx` and they'll auto-reload on the device

---

## 📱 Common Commands

```bash
# Start the development server only
npm start

# Build and run on Android device
npm run android

# Build and run on iOS (Mac only)
npm run ios

# Run linter
npm run lint

# Run tests
npm test

# Build debug APK
cd android && ./gradlew assembleDebug && cd ..

# Build release APK (requires signing)
cd android && ./gradlew assembleRelease && cd ..

# Clean build (if you have issues)
cd android && ./gradlew clean && cd ..
npm install
```

---

## 🔍 Troubleshooting

### "adb: command not found"
- Install Android SDK Platform Tools
- Add `C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools` to PATH

### "Device not recognized"
```bash
adb kill-server
adb start-server
adb devices
```

### "Build failed"
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### "Metro already running on port 8081"
```bash
# Kill the process:
netstat -ano | findstr 8081
taskkill /PID <PID> /F
```

---

## 📖 For Detailed Instructions

See **USB_SETUP_GUIDE.md** for:
- Complete environment setup
- Android SDK installation
- Environment variable configuration
- USB debugging setup
- Advanced troubleshooting
- Development workflow

---

## 🎯 What's Inside

- **React Native 0.85.0** - Latest stable version
- **TypeScript** - Type safety
- **React 19.2.3** - Latest React version
- **Testing Framework** - Jest pre-configured
- **Code Quality** - ESLint and Prettier

---

## 📱 App Details

| Property | Value |
|----------|-------|
| **App Name** | MedFlow v1 |
| **Version** | 1.0.0 |
| **Min API Level** | 24 (Android 7.0) |
| **React Native** | 0.85.0 |
| **React** | 19.2.3 |

---

**Ready to code? Start editing `App.tsx` and watch changes appear on your device! 🎉**

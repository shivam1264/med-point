# MedFlow v1 - USB Debugging & Development Guide

## 🔌 USB Connection & Debugging

### Enable USB Debugging on Your Device

#### For Android 13+:
1. Open **Settings**
2. Go to **About → Build number**
3. Tap 7 times rapidly (you'll see "Developer mode enabled")
4. Go back to **Settings → System → Developer options**
5. Enable **USB Debugging**
6. Enable **USB Configuration** → **File Transfer (MTP)**

#### For Android 12 and below:
1. Open **Settings**
2. Go to **About phone**
3. Tap **Build number** 7 times
4. Go back → **Developer options**
5. Enable **USB Debugging**

### Verify USB Connection

```powershell
# Windows PowerShell
adb devices

# Expected output:
# List of attached devices
# XXXXXXXXXXXXXXXX    device
```

---

## 🐛 Debugging the App

### Method 1: USB Debugging (Recommended)

#### Using ADB Logcat
```bash
# See all logs from your device:
adb logcat

# Filter for your app:
adb logcat | findstr "ReactNativeJS"

# Clear logs before testing:
adb logcat -c
```

#### Using React Native Debug Menu
1. Shake your device Or press `Ctrl+M` in emulator
2. Select **Debug** to open Chrome DevTools
3. You can also select **Reload** to reload the app hot-reload

### Method 2: Chrome DevTools

1. Press `Ctrl+M` on emulator or shake device
2. Select **Open Debugger**
3. Open browser at `http://localhost:8081/debugger-ui`
4. Use Chrome DevTools for debugging

### Method 3: Flipper Integration (Advanced)

```bash
# Install Flipper desktop app from https://fbflipper.com/
# Then no additional setup needed for React Native debugging
```

---

## 🔄 Hot Reload vs Full Reload

### Hot Reload (Fastest)
- Changes to JavaScript code reload instantly
- State is preserved
- Shake device and select **Fast Refresh**

### Full Reload
- Complete app restart
- Press R twice in terminal
- Or shake device and select **Reload**

### Rebuild (when native code changes)
```bash
npm run android
```

---

## 📊 Performance Monitoring

### Monitor Performance
1. Open debug menu (shake device / `Ctrl+M`)
2. Select **Show Perf Monitor**
3. Watch FPS and memory usage

### Check Memory Usage
```bash
adb shell dumpsys meminfo com.medflowv1
```

---

## 🔧 Advanced ADB Commands

### Install APK Directly
```bash
# Build APK first
cd android
./gradlew assembleDebug
cd ..

# Install on device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Install and run
adb install -r android/app/build/outputs/apk/debug/app-debug.apk && adb shell am start -n com.medflowv1/.MainActivity
```

### Uninstall App
```bash
adb uninstall com.medflowv1
```

### Clear App Data
```bash
adb shell pm clear com.medflowv1
```

### View Device Logs
```bash
# All logs
adb logcat

# Only errors
adb logcat *:E

# Only warnings and above
adb logcat *:W

# Real-time with tag filtering
adb logcat | grep "Your.Tag"
```

### Device Information
```bash
# Device model
adb shell getprop ro.product.model

# Android version
adb shell getprop ro.build.version.release

# CPU ABI
adb shell getprop ro.product.cpu.abi

# All properties
adb shell getprop
```

---

## 🚀 Building & Deploying APK

### Debug APK (for development)
```bash
cd android
./gradlew assembleDebug
cd ..
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (for production)

1. **Configure signing first** (one-time setup):
   ```json
   // android/app/build.gradle
   signingConfigs {
       release {
           storeFile file('keystore.jks')
           storePassword 'your_password'
           keyAlias 'your_key_alias'
           keyPassword 'your_key_password'
       }
   }
   ```

2. **Build Release APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   cd ..
   # Output: android/app/build/outputs/apk/release/app-release.apk
   ```

3. **Install on device**:
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

---

## 🎯 Debugging Common Issues

### App Crashes on Launch
```bash
# Check logs
adb logcat | findstr "FATAL\|ERROR"

# Check detailed React error
adb logcat | findstr "ReactNativeJS"
```

### Network Issues
```bash
# Verify device can reach dev server
adb shell ping 192.168.1.X

# Check packager (dev server) is running
curl http://localhost:8081
```

### USB Connection Issues
```bash
# Restart ADB daemon
adb kill-server
adb start-server

# Reconnect device
adb devices

# Toggle USB connection on device
# Turn off USB debugging and back on
```

### Port Already in Use
```bash
# Find what's using port 8081
netstat -ano | findstr :8081

# Kill the process
taskkill /PID <PID> /F
```

---

## 📱 Testing on Physical Devices

### Test on Different Android Versions
- Use multiple devices/emulators with different API levels
- Min API: 24 (Android 7.0)
- Recommended: Test on 24, 28, 31, 33, 34+

### Network Testing
- Test with mobile data (turn off WiFi)
- Test with poor connection (throttling)
- Use Chrome DevTools Network tab for throttling

### Battery Testing
- Monitor battery usage with DevTools
- Avoid excessive re-renders
- Use `useMemo` and `useCallback` appropriately

---

## ✅ Development Checklist

- [ ] Android device connected and recognized
- [ ] USB Debugging enabled
- [ ] Development server running (`npm start`)
- [ ] App installed and running (`npm run android`)
- [ ] Hot reload working (edit code, see changes)
- [ ] Debug menu accessible (shake device)
- [ ] Logs visible in terminal
- [ ] No network connectivity issues

---

## 🔗 Useful Resources

- [React Native Docs](https://reactnative.dev/)
- [ADB Reference](https://developer.android.com/tools/adb)
- [Android Debugging](https://developer.android.com/studio/debug)
- [React DevTools](https://react-devtools.io/)

---

**Happy Debugging! 🐛**

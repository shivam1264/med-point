# 🏥 MedFlow v1 - START HERE

**Welcome to MedFlow v1!** Your React Native CLI app is ready. Follow these steps to run it on your phone.

---

## ⚡ Quick Start (5 Minutes)

### 1️⃣ Connect Your Phone
Plug your Android phone into your computer with a USB cable.

### 2️⃣ Enable USB Debugging
- Go to **Settings** → **About phone**
- Tap **Build number** 7 times
- Go back → **Developer options** → Enable **USB Debugging**

### 3️⃣ Run the App
Open PowerShell in this folder and run:
```bash
npm run android
```

**Done!** The app will install and run on your phone automatically. 🎉

---

## 📚 Need More Help?

| Situation | Read This |
|-----------|-----------|
| "I just want to get it running quickly" | 👉 [QUICK_START.md](QUICK_START.md) |
| "I need complete setup instructions" | 👉 [COMPLETE_SETUP.md](COMPLETE_SETUP.md) |
| "My phone won't connect" | 👉 [USB_SETUP_GUIDE.md](USB_SETUP_GUIDE.md) |
| "The app won't run or has issues" | 👉 [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md) |
| "I want the full overview" | 👉 [SETUP_SUMMARY.md](SETUP_SUMMARY.md) |
| "What's installed?" | 👉 [README.md](README.md) |

---

## ✅ Verification

Before running `npm run android`, verify your system:

```powershell
.\verify-setup.ps1
```

This checks if everything is properly installed. ✓

---

## 🎯 First Steps After Running

Once the app is running on your phone:

1. **See your app** - "MedFlow v1" welcome screen
2. **Make changes** - Edit `App.tsx` file
3. **Watch reload** - Changes appear on phone in 1 second
4. **Open debug menu** - Shake phone or press `Ctrl+M`
5. **View logs** - Run `adb logcat` in terminal

---

## 🚀 Essential Commands

```bash
npm run android         # Build and run on your phone
npm start              # Start development server only
npm test               # Run tests
npm run lint           # Check code quality
npm run android        # Rebuild and run
```

---

## 📋 What's Inside?

This is a **React Native 0.85.0** project with:

- ✅ TypeScript (type-safe code)
- ✅ Android ready (API 24+)
- ✅ iOS ready (optional)
- ✅ Testing framework (Jest)
- ✅ Code formatter (Prettier)
- ✅ Linter (ESLint)
- ✅ Hot reload enabled

---

## 🆘 Common Issues?

### Device not recognized
```bash
adb kill-server
adb start-server
adb devices
```

### Build fails
```bash
npm install
npm run android
```

### Port already in use
```bash
npm start -- --reset-cache
```

**For more troubleshooting**, see [COMPLETE_SETUP.md](COMPLETE_SETUP.md)

---

## 📱 Expected Output

After running `npm run android`, you should see:

```
info Starting the app... (this might take a minute or two)
...
Built the following apk(s):
  • /path/to/MedFlowv1/android/app/build/outputs/apk/debug/app-debug.apk
```

Then the app will:
- 📦 Install on your phone
- 🚀 Launch automatically
- 📺 Show the MedFlow v1 welcome screen

---

## 🎓 Next: Start Coding!

1. Open `App.tsx` in your editor
2. Change some text or colors
3. Save (Ctrl+S)
4. Watch it update on your phone instantly! 🔥

Example:
```typescript
// Change this line in App.tsx
<Text style={[styles.appName, { color: accentColor }]}>
  MedFlow v1
</Text>

// To this:
<Text style={[styles.appName, { color: accentColor }]}>
  MedFlow v1.0.1
</Text>

// Save, and it appears on your phone in ~1 second!
```

---

## 📖 Learn More

- [React Native Docs](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/)
- [Android Developer Guide](https://developer.android.com/)

---

## 🎉 You're Ready!

Your MedFlow v1 app is fully set up and ready to run on your phone.

### Next command to run:
```bash
npm run android
```

**Good luck! Let's build something amazing! 🚀**

---

### 💡 Pro Tips

- **Hot reload**: Save and see changes in 1 second
- **Debug menu**: Shake phone for dev tools
- **View logs**: Run `adb logcat` in terminal
- **Offline dev**: Works offline after first run
- **Multiple devices**: Connect multiple phones and run on any
- **Emulator**: Use Android Emulator instead of physical phone

---

**Questions?** Check the documentation guides for detailed answers.

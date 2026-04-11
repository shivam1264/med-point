# MedFlow Project Requirements

This document outlines the software and environmental requirements needed to clone, build, and run the MedFlow-V1 project.

## 🛠 Prerequisites

Ensure you have the following installed on your system:

### 1. Core Runtime
- **Node.js**: `v22.11.0` or higher (Tested with `v24.14.1`)
- **NPM**: `v10.x` or higher (Tested with `v11.11.0`)
- **Git**: Required for cloning and version control.

### 2. Android Development
- **Java Development Kit (JDK)**: JDK 17 (Required for React Native 0.73+)
- **Android Studio**: Latest version recommended.
- **Android SDK Platform**: API Level 36.
- **Android SDK Build-Tools**: Version `36.0.0`.
- **NDK**: Version `27.1.12297006`.
- **Environment Variables**:
  - `ANDROID_HOME`: Path to your Android SDK.
  - `JAVA_HOME`: Path to your JDK 17.

### 3. iOS Development (macOS only)
- **Xcode**: 15.0 or higher.
- **CocoaPods**: Latest version.
- **Homebrew**: For managing dependencies.

---

## 🚀 Getting Started

Follow these steps to run the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/shivansh-mehra-01/MedFlow-V1.git
cd MedFlow-V1/MedFlowv1
```

### 2. Install Dependencies
```bash
npm install
```
*For iOS:*
```bash
cd ios && pod install && cd ..
```

### 3. Start Metro Bundler
```bash
npm start
```

### 4. Run the Application
**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

---

## 🔒 Security Note
- Never share your `.env` files or API keys.
- Ensure `local.properties` and `*.keystore` files are not tracked by Git (already configured in `.gitignore`).

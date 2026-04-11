@echo off
REM MedFlow v1 - Quick Setup Script for Windows
REM This script helps verify your development environment setup

echo.
echo ================================================================================
echo   MedFlow v1 - Development Environment Setup Verification
echo ================================================================================
echo.

REM Check Node.js
echo [*] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
  echo   ERROR: Node.js is not installed. Please install from https://nodejs.org/
  goto :end
) else (
  for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
  echo   ✓ Node.js !NODE_VERSION! is installed
)

REM Check NPM
echo [*] Checking NPM...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
  echo   ERROR: NPM is not installed
  goto :end
) else (
  for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
  echo   ✓ NPM !NPM_VERSION! is installed
)

REM Check ADB
echo [*] Checking Android Debug Bridge (ADB)...
adb --version >nul 2>&1
if %errorlevel% neq 0 (
  echo   WARNING: ADB is not found. Please ensure Android SDK is installed and PATH is set.
  echo   Set ANDROID_HOME environment variable and add %%ANDROID_HOME%%\platform-tools to PATH
) else (
  for /f "tokens=*" %%i in ('adb --version 2^>^&1 ^| findstr "Android Debug Bridge"') do set ADB_VERSION=%%i
  echo   ✓ ADB is installed
)

REM Check Java
echo [*] Checking Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
  echo   WARNING: Java is not found. Please install JDK 17+ from Oracle or Android Studio.
) else (
  echo   ✓ Java is installed
)

echo.
echo ================================================================================
echo   Environment Check Complete
echo ================================================================================
echo.
echo Next steps:
echo 1. Connect your Android device via USB
echo 2. Enable USB Debugging on your device
echo 3. Run: adb devices (to verify connection)
echo 4. Run: npm run android (to build and run the app)
echo.
echo For detailed setup instructions, see: USB_SETUP_GUIDE.md
echo.

:end
pause

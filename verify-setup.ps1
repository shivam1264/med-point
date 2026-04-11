# MedFlow v1 - Quick Setup Script for Windows PowerShell
# This script helps verify your development environment setup

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  MedFlow v1 - Development Environment Setup Verification" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[*] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js is not installed. Please install from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check NPM
Write-Host "[*] Checking NPM..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  ✓ NPM $npmVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: NPM is not installed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check ADB
Write-Host "[*] Checking Android Debug Bridge (ADB)..." -ForegroundColor Yellow
try {
    $adbVersion = adb --version
    Write-Host "  ✓ ADB is installed" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: ADB is not found." -ForegroundColor Yellow
    Write-Host "  Please ensure Android SDK is installed and PATH is set." -ForegroundColor Yellow
    Write-Host "  Set ANDROID_HOME environment variable and add %ANDROID_HOME%\platform-tools to PATH" -ForegroundColor Yellow
}

# Check Java
Write-Host "[*] Checking Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1
    Write-Host "  ✓ Java is installed" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: Java is not found." -ForegroundColor Yellow
    Write-Host "  Please install JDK 17+ from Oracle or Android Studio." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  Environment Check Complete" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Connect your Android device via USB"
Write-Host "2. Enable USB Debugging on your device"
Write-Host "3. Run: adb devices (to verify connection)"
Write-Host "4. Run: npm run android (to build and run the app)"
Write-Host ""
Write-Host "For detailed setup instructions, see: USB_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"

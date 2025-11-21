@echo off
echo ========================================
echo   🏗️ Building APK with Expo Run Android
echo ========================================
echo.
echo This method handles all native module linking automatically!
echo.

cd /d "%~dp0"

echo 📋 Step 1: Ensure dependencies are installed...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo 🏗️ Step 2: Building APK with expo run:android...
echo.
echo ⚠️  IMPORTANT: This will:
echo    - Handle all native module linking automatically
echo    - Build release APK
echo    - Take 10-15 minutes for first build
echo.
echo ⏳ Starting build...
echo.

npx expo run:android --variant release --no-install

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo   🎉 APK BUILD COMPLETE!
    echo ==========================================
    echo.
    echo 📱 APK Location:
    echo    android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo 📊 Opening APK folder...
    start explorer "android\app\build\outputs\apk\release"
    echo.
    echo ✅ Backend: https://recycle-backend-api-production.up.railway.app
    echo ✅ Ready to install on Android device!
    echo.
) else (
    echo.
    echo ❌ Build failed. Check errors above.
    echo.
)

pause

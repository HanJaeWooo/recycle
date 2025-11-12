@echo off
echo ========================================
echo   🔧 AUTHENTICATION FINAL FIX 🔧
echo ========================================
echo.

echo Step 1: Stopping any existing Node processes...
taskkill /F /IM node.exe 2>nul
echo ✅ Node processes stopped

echo.
echo Step 2: Setting up environment...
cd /d "%~dp0backend\api"
echo ✅ Changed to backend directory

echo.
echo Step 3: Starting backend server with Railway database...
echo 🚀 Server will start on http://localhost:8080
echo 📊 Using Railway PostgreSQL database
echo ⚠️  Keep this window open!
echo.

set DATABASE_URL=postgresql://postgres:YpRuRJveeJZxKoDgmTdSyvHnbSoDohQ@viaduct.proxy.rlwy.net:47046/railway
set PORT=8080
set NODE_ENV=development
set HOST=0.0.0.0

echo Environment variables set:
echo - DATABASE_URL: Set to Railway PostgreSQL
echo - PORT: 8080
echo - NODE_ENV: development
echo.

echo ✨ Starting server...
node server.js

echo.
echo ❌ Server stopped. Press any key to exit...
pause >nul

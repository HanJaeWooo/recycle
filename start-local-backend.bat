@echo off
echo ========================================
echo   STARTING LOCAL BACKEND SERVER
echo ========================================
echo.
echo This will start your backend server locally to fix authentication issues.
echo The server will run on http://localhost:8080
echo.

cd /d "%~dp0backend\api"

echo Setting environment variables...
set DATABASE_URL=postgresql://postgres:YpRuRJveeJZxKoDgmTdSyvHnbSoDohQ@postgres.railway.app:5432/railway
set NODE_ENV=development
set PORT=8080
set HOST=0.0.0.0

echo.
echo Starting server...
echo Press Ctrl+C to stop the server
echo.

node server.js

pause

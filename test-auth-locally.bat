@echo off
echo Testing Authentication Locally
echo ================================

echo.
echo Step 1: Starting local backend server...
cd backend\api
start /B node server.js
timeout /t 3

echo.
echo Step 2: Testing server endpoints...
curl -X GET http://localhost:8080/
echo.
curl -X GET http://localhost:8080/health
echo.

echo.
echo Step 3: Testing auth registration...
curl -X POST http://localhost:8080/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"username\":\"testuser123\",\"password\":\"testpass123\",\"acceptTerms\":true}"

echo.
echo.
echo If you see JSON responses above, your local server is working!
echo If you see connection errors, check the server logs.

pause

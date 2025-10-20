@echo off
echo Creating fresh git repository without old history...
echo.

REM Remove old git folder
rmdir /s /q .git

echo Initializing new git repository...
git init
git add .
git commit -m "Fresh start: Current codebase for APK build"

echo.
echo Setting remote...
git remote add origin https://github.com/davesuballa/recycle.git

echo.
echo Force pushing to GitHub...
git push origin master --force

echo.
echo Done! Now go to expo.dev to build your APK
pause

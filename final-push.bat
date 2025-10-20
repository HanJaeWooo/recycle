@echo off
git commit -m "Clean up: Remove APK and scripts, optimize for GitHub"
echo.
echo Force pushing to GitHub...
git push origin main --force
echo.
echo Done!
pause

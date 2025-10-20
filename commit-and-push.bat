@echo off
echo Committing optimized code...
git commit -m "Remove large files for GitHub compatibility"

echo.
echo Pushing to GitHub...
git push origin main --force

echo.
echo Done! Check GitHub and then build APK on expo.dev
pause

@echo off
setlocal
cd /d "%~dp0"
where npm >nul 2>&1 || (echo Install Node.js 22 LTS first. & pause & exit /b 1)
call npm install --no-audit --no-fund
if errorlevel 1 goto failed
call npm run build -- --base=./
if errorlevel 1 goto failed
if not exist "dist\index.html" goto failed
if not exist "dist\audio\steps.mp3" goto failed
type nul > "dist\.nojekyll"
echo.
echo Upload CONTENTS of dist to the root of your GitHub repository.
start "" explorer.exe "%CD%\dist"
pause
exit /b 0
:failed
echo Build failed. See error above.
pause
exit /b 1

@echo off
setlocal
cd /d "%~dp0"
echo Starting Netlify deployment packager for Star-Leaper...
powershell -ExecutionPolicy Bypass -File ".\deploy_netlify.ps1" %*
pause

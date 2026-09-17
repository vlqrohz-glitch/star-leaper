@echo off
setlocal
cd /d "%~dp0"
title Star-Leaper Local Server (Port 8080)
echo ========================================================
echo   Starting Star-Leaper Local Web Server
echo ========================================================
echo.
echo   Local URL:    http://localhost:8080/
echo   Domain URL:   http://starleaper.io:8080/
echo.
echo Press Ctrl+C in this window when you want to stop the server.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\server.ps1" -Port 8080
pause

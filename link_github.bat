@echo off
setlocal
cd /d "%~dp0"
title Star-Leaper: Link to GitHub
echo ========================================================
echo   Star-Leaper: Push to GitHub ^& Connect Netlify
echo ========================================================
echo.
powershell.exe -ExecutionPolicy Bypass -File ".\link_github.ps1" %*
pause

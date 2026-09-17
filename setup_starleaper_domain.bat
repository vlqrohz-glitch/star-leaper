@echo off
:: One-click setup script to map starleaper.io to localhost
title Star-Leaper: Set Domain to starleaper.io
echo ========================================================
echo   Setting up local domain: http://starleaper.io/
echo ========================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell.exe -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0setup_starleaper_domain.ps1\"'"
pause

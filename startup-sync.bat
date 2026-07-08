@echo off
color 0A
title PhimFlix Startup Sync

cd /d "%~dp0"

:: Doi may chay xong va co Internet (60 giay)
timeout /t 60 /nobreak >nul

echo [%DATE% %TIME%] Dang kiem tra cap nhat tu Ophim...
node sync-ophim.js >> "%~dp0update-log.txt" 2>&1
echo [%DATE% %TIME%] Hoan thanh. >> "%~dp0update-log.txt"

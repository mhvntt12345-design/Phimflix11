@echo off
color 0A
title PhimFlix Startup Sync

cd /d "%~dp0"

:: Doi may chay xong va co Internet (60 giay)
timeout /t 60 /nobreak >nul

echo [%DATE% %TIME%] Dang kiem tra cap nhat tu NguonC (trang 1-3)...
node sync-nguonc.js 1 3 >> "%~dp0update-log.txt" 2>&1
echo [%DATE% %TIME%] Hoan thanh. >> "%~dp0update-log.txt"

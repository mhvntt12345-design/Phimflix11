@echo off
color 0A
title PhimFlix Auto Updater

:: Di chuyen toi thu muc cua file bat dang chay
cd /d "%~dp0"

echo ========================================================
echo HE THONG TU DONG DONG BO PHIMFLIX (SMART SYNC)
echo ========================================================
echo.
echo Dang chay cap nhat... (Doc cau hinh tu sync-nguonc.js)
echo Vui long khong tat cua so nay cho den khi hoan thanh.
echo.

node sync-nguonc.js

echo.
echo ========================================================
echo DA HOAN THANH CAP NHAT!
echo ========================================================
pause

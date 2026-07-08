@echo off
color 0A
title PhimFlix Auto Updater - Daily

:: Di chuyen toi thu muc cua file bat dang chay
cd /d "%~dp0"

echo ========================================================
echo PHIMFLIX - CAP NHAT TAP MO I HANG NGAY (SMART SYNC)
echo ========================================================
echo.
echo [%DATE% %TIME%] Bat dau kiem tra tap moi tu NguonC...
echo.

:: Chay script voi END_PAGE=3 (72 phim moi nhat, du de bat tap moi hang ngay)
node sync-NguonC.js

echo.
echo ========================================================
echo [%DATE% %TIME%] HOAN THANH CAP NHAT!
echo ========================================================
echo.

:: Ghi log
echo [%DATE% %TIME%] PhimFlix daily sync completed >> "%~dp0update-log.txt"

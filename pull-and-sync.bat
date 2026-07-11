@echo off
color 0B
title PhimFlix - Lay Du Lieu Moi Tu GitHub

cd /d "%~dp0"

echo ========================================================
echo PHIMFLIX - LAY DU LIEU MOI NHAT TU GITHUB
echo ========================================================
echo.
echo [%DATE% %TIME%] Dang tai du lieu moi nhat tu GitHub...
echo.

:: Pull latest changes from GitHub
git pull --rebase origin master

if %ERRORLEVEL% neq 0 (
    echo.
    echo !!! LOI: Khong the lay du lieu tu GitHub !!!
    echo Kiem tra ket noi mang hoac thu lai sau.
    pause
    exit /b 1
)

echo.
echo [%DATE% %TIME%] Da lay du lieu moi nhat thanh cong!
echo.
echo ========================================================
echo SAU KHI XONG, HAY LAM MOI TRINH DUYET (F5)
echo DE THAY CAC PHIM MOI DUOC CAP NHAT.
echo ========================================================
echo.
pause

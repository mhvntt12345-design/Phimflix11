@echo off
chcp 65001 >nul
echo.
echo =====================================================
echo   PHIMFLIX — BULK IMPORT (Chay tren may tinh)
echo =====================================================
echo.

REM Cấu hình: sửa 2 số dưới đây
set START_PAGE=1
set END_PAGE=100

echo [?] Trang bat dau: %START_PAGE%
echo [?] Trang ket thuc: %END_PAGE%
echo.
echo Nhan phim bat ky de bat dau, hoac Ctrl+C de huy...
pause >nul

echo.
echo [>>] Dang chay bulk-import.js tu trang %START_PAGE% den %END_PAGE%...
echo.

node bulk-import.js %START_PAGE% %END_PAGE%

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!!] Script bi loi. Kiem tra ket noi mang va thu lai.
    pause
    exit /b 1
)

echo.
echo [>>] Dang push len GitHub...
git add js/nguonc-data.js index.html admin.html
git diff --staged --quiet
if %ERRORLEVEL% NEQ 0 (
    git commit -m "Bulk import movies (trang %START_PAGE%-%END_PAGE%)"
    git pull --rebase origin master
    git push
    echo.
    echo [OK] Da push len GitHub thanh cong!
) else (
    echo [>>] Khong co thay doi moi de push.
)

echo.
echo Hoan thanh! Nhan phim bat ky de dong cua so...
pause >nul

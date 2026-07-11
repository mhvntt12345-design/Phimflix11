@echo off
chcp 65001 >nul
cd /d "%~dp0"

set LOGFILE=%~dp0update-log.txt
echo [%DATE% %TIME%] === Bat dau tu dong cap nhat === >> "%LOGFILE%"

:: Chay bulk-import.js trang 1-5 (50 phim moi nhat + cap nhat tap moi)
node bulk-import.js 1 5

if %ERRORLEVEL% NEQ 0 (
    echo [%DATE% %TIME%] LOI: Script bi loi voi exit code %ERRORLEVEL% >> "%LOGFILE%"
    exit /b 1
)

:: Commit va push len GitHub
git add js/nguonc-data.js index.html admin.html
git diff --staged --quiet
if %ERRORLEVEL% NEQ 0 (
    git commit -m "Auto update %DATE% %TIME%"
    git pull --rebase origin master
    git push
    echo [%DATE% %TIME%] Da push len GitHub thanh cong >> "%LOGFILE%"
) else (
    echo [%DATE% %TIME%] Khong co thay doi moi >> "%LOGFILE%"
)

echo [%DATE% %TIME%] === Hoan thanh === >> "%LOGFILE%"

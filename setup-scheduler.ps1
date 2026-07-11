# ============================================================
#  PHIMFLIX — Cài đặt Tự Động Cập Nhật
#  Cách 1: Startup folder (không cần Admin) — chạy khi bật máy
#  Cách 2: Task Scheduler (cần Admin) — chạy theo lịch giờ cố định
# ============================================================

$ProjectDir = "D:\ANTIGRAVITY\.gemini\antigravity\scratch\phimflix"
$BatFile    = Join-Path $ProjectDir "daily-update.bat"
$VbsFile    = Join-Path $ProjectDir "run-silent.vbs"
$TaskName   = "PhimFlix_AutoUpdate"

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   PHIMFLIX — CAI DAT TU DONG CAP NHAT" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# ── PHUONG AN 1: Startup Folder (KHONG can Admin) ──────────
Write-Host "[1] Cai vao Startup Folder (chay khi bat may)..." -ForegroundColor Yellow
$StartupDir = [System.Environment]::GetFolderPath('Startup')
$ShortcutPath = Join-Path $StartupDir "PhimFlix_AutoUpdate.lnk"

try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = "wscript.exe"
    $Shortcut.Arguments = "`"$VbsFile`" `"$BatFile`""
    $Shortcut.WorkingDirectory = $ProjectDir
    $Shortcut.WindowStyle = 7  # Minimized
    $Shortcut.Description = "PhimFlix: Tu dong cap nhat phim khi bat may"
    $Shortcut.Save()
    Write-Host "   ✅ Da tao shortcut startup: $ShortcutPath" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Loi tao startup shortcut: $_" -ForegroundColor Red
}

# ── PHUONG AN 2: Task Scheduler (can Admin) ────────────────
Write-Host ""
Write-Host "[2] Thu dang ky Task Scheduler (chay luc 07:00 va 19:00)..." -ForegroundColor Yellow

$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($IsAdmin) {
    try {
        $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($existing) { Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false }

        $Action   = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$VbsFile`" `"$BatFile`"" -WorkingDirectory $ProjectDir
        $Trigger1 = New-ScheduledTaskTrigger -Daily -At "07:00"
        $Trigger2 = New-ScheduledTaskTrigger -Daily -At "19:00"
        $Settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 2) -StartWhenAvailable -RunOnlyIfNetworkAvailable:$true
        $Principal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Highest

        Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger1,$Trigger2 -Settings $Settings -Principal $Principal -Description "PhimFlix auto update" -Force | Out-Null
        Write-Host "   ✅ Da dang ky Task Scheduler: $TaskName (07:00 va 19:00 moi ngay)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Loi dang ky Task Scheduler: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  Khong co quyen Admin. Chi cai Startup Folder." -ForegroundColor Yellow
    Write-Host "   De them lich gio co dinh, chay file nay voi 'Run as Administrator'." -ForegroundColor Gray
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   KET QUA CAI DAT" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Startup (khi bat may): Da cai" -ForegroundColor Green
if ($IsAdmin) {
    Write-Host "✅ Task Scheduler (07:00 + 19:00): Da cai" -ForegroundColor Green
} else {
    Write-Host "⚠️  Task Scheduler: Chua cai (can quyen Admin)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Script cap nhat: $BatFile" -ForegroundColor White
Write-Host "Log file:        $ProjectDir\update-log.txt" -ForegroundColor White
Write-Host ""

# Chay thu ngay bay gio
$runNow = Read-Host "Ban co muon CHAY THU NGAY BAY GIO khong? (y/n)"
if ($runNow -eq 'y' -or $runNow -eq 'Y') {
    Write-Host ""
    Write-Host "[>>] Dang chay cap nhat (trang 1-5)..." -ForegroundColor Yellow
    Push-Location $ProjectDir
    & cmd /c "`"$BatFile`""
    Pop-Location
    Write-Host "[OK] Hoan thanh! Kiem tra update-log.txt de xem ket qua." -ForegroundColor Green
}

Write-Host ""
Write-Host "Nhan Enter de dong..." -ForegroundColor Gray
Read-Host | Out-Null

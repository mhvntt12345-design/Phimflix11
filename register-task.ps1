$dir = 'D:\ANTIGRAVITY\.gemini\antigravity\scratch\phimflix'
$vbs = Join-Path $dir 'run-silent.vbs'
$bat = Join-Path $dir 'daily-update.bat'

$action   = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$vbs`" `"$bat`"" -WorkingDirectory $dir
$trigger1 = New-ScheduledTaskTrigger -Daily -At '07:00'
$trigger2 = New-ScheduledTaskTrigger -Daily -At '19:00'
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 2) -StartWhenAvailable -RunOnlyIfNetworkAvailable

try {
    $task = Register-ScheduledTask -TaskName 'PhimFlix_AutoUpdate' -Action $action -Trigger $trigger1,$trigger2 -Settings $settings -RunLevel Limited -Force
    Write-Host "SUCCESS: Task 'PhimFlix_AutoUpdate' da duoc dang ky!" -ForegroundColor Green
    Write-Host "Lich chay: 07:00 va 19:00 moi ngay" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

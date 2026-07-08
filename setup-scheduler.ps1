$wsh = New-Object -ComObject WScript.Shell
$startup = [System.Environment]::GetFolderPath('Startup')
$lnkPath = Join-Path $startup 'PhimFlix Daily Sync.lnk'
$shortcut = $wsh.CreateShortcut($lnkPath)
$shortcut.TargetPath = 'cmd.exe'
$shortcut.Arguments = '/c "D:\ANTIGRAVITY\.gemini\antigravity\scratch\phimflix\startup-sync.bat"'
$shortcut.WindowStyle = 7
$shortcut.WorkingDirectory = 'D:\ANTIGRAVITY\.gemini\antigravity\scratch\phimflix'
$shortcut.Description = 'PhimFlix tu dong cap nhat tap phim moi'
$shortcut.Save()
Write-Host "Da tao shortcut tai: $lnkPath"

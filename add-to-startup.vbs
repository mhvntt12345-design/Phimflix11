Set objShell = CreateObject("WScript.Shell")
Dim startupFolder
startupFolder = objShell.SpecialFolders("Startup")

Dim batPath
batPath = "D:\ANTIGRAVITY\.gemini\antigravity\scratch\phimflix\startup-sync.bat"

' Tao shortcut trong Startup folder
Dim oShortcut
oShortcut = startupFolder & "\PhimFlix Daily Sync.lnk"
Dim objLink
Set objLink = objShell.CreateShortcut(oShortcut)
objLink.TargetPath = "cmd.exe"
objLink.Arguments = "/c """ & batPath & """"
objLink.WindowStyle = 7
objLink.Description = "PhimFlix tu dong cap nhat tap phim moi khi bat may"
objLink.WorkingDirectory = "D:\ANTIGRAVITY\.gemini\antigravity\scratch\phimflix"
objLink.Save

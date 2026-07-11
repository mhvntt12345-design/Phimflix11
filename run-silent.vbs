' Chay file .bat khong hien cua so CMD
' Dung phap: wscript.exe run-silent.vbs "duong-dan-toi-file.bat"
Dim batFile
If WScript.Arguments.Count > 0 Then
    batFile = WScript.Arguments(0)
Else
    batFile = "D:\ANTIGRAVITY\.gemini\antigravity\scratch\phimflix\daily-update.bat"
End If
CreateObject("WScript.Shell").Run "cmd /c """ & batFile & """", 0, False

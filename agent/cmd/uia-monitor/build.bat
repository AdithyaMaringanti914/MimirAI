@echo off
set CSC_PATH="C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if not exist %CSC_PATH% (
set WPF_PATH="C:\Windows\Microsoft.NET\Framework64\v4.0.30319\WPF"
%CSC_PATH% /target:exe /out:UIAMonitor.exe /reference:%WPF_PATH%\UIAutomationClient.dll /reference:%WPF_PATH%\UIAutomationTypes.dll /reference:%WPF_PATH%\WindowsBase.dll /reference:System.Web.Extensions.dll UIAMonitor.cs
echo Build complete.

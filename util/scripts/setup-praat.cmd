@echo off

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\setup-praat.ps1" %1 %2

echo.
pause

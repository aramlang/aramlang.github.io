@echo off
setlocal
cd %~dp0

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\setup-praat.ps1" %1 %2

endlocal
echo.
pause

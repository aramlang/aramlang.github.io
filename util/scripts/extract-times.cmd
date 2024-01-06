@echo off

if "%~1"=="" (
  echo Please provide json segmentation file.
  exit /b
)

powershell -ExecutionPolicy Bypass -File "%~dp0extract-times.ps1" "%~1"

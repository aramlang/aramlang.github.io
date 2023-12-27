@echo off

IF "%~1"=="" (
  echo Please provide current chapter full path as a command line argument.
  exit /b
)

SET PRAAT-WORK-DIR=%~1

start "Praat.exe" "%~dp0Praat.exe" --hide-picture --utf8 --pref-dir="%~dp0"

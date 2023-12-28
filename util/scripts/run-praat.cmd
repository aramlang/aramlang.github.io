@echo off

IF "%~1"=="" (
  echo Please provide current chapter full path as a command line argument.
  exit /b
)

SET PRAAT-WORK-DIR=%~1

SETLOCAL
CD "%~dp0"

Praat.exe --hide-picture --new-send launch-chapter.praat

ENDLOCAL

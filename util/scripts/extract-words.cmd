@echo off
IF "%~1"=="" (
  echo Please provide a command line argument.
  echo .\extract-words.cmd .\01_Mattai_06_09.TextGrid
  exit /b
)

copy /Y wav\%~1 .\ > nul
 
python py\extract-words.py %~1

del %~1

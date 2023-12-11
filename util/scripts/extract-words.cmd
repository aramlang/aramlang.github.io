@echo off
IF "%~1"=="" (
  echo Please provide a command line argument.
  exit /b
)  

copy /Y wav\%~1 .\ > nul
 
python py\extract-words.py %~1

del %~1

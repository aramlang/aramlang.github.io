@echo off
IF "%~1"=="" (
  echo Please provide a command line argument.
  exit /b
)  
 
python py\extract-words.py %~1

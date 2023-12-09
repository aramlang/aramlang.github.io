@echo off
IF "%~1"=="" (
  echo Please provide a command line argument.
  exit /b
)  
 
python py\align-words-textgrid.py %~1

echo %~1 has been aligned


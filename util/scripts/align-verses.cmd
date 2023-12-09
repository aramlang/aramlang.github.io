@echo off
IF "%~1"=="" (
  set TEXTGRID=01_Bereshit_001.TextGrid
) ELSE (
  set TEXTGRID=%1.
)

python py\align-verses-textgrid.py %TEXTGRID%

IF "%~1"=="" (
  pause
)

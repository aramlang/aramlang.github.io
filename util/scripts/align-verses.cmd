@echo off
IF "%~1"=="" (
  set TEXTGRID=wav\01_Mattai_01.TextGrid
) ELSE (
  set TEXTGRID=%1.
)

python py\align-verses-textgrid.py %TEXTGRID%

IF "%~1"=="" (
  pause
)

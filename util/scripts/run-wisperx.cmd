@echo off

IF "%~1"=="" (
  echo Please provide working directory.
  exit /b
)

IF "%~2"=="" (
  echo Please provide file to process.
  exit /b
)

start "whisperx" /D "%~1" /REALTIME whisperx --model large-v2 --align_model "imvladikon/wav2vec2-xls-r-1b-hebrew" --language he --output_format json "%~2"

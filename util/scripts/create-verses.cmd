@echo off
SET audio_file=%1
SET num_intervals=%2

REM Check if both parameters are provided
IF "%audio_file%"=="" (
    echo Error: Audio file parameter missing.
    exit /b 1
)
IF "%num_intervals%"=="" (
    echo Error: Number of intervals parameter missing.
    exit /b 1
)

REM Run the Python script with the provided parameters
python py\create-verses.py %audio_file% %num_intervals%

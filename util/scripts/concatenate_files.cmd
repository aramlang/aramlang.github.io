@echo off
SETLOCAL

REM Check if exactly two command line arguments are provided
IF NOT "%~3"=="" (
    echo Error: Incorrect number of arguments.
    echo Usage: run_concatenate [file_pattern] [output_file]
    EXIT /B 1
)

REM Check if less than two command line arguments are provided
IF "%~2"=="" (
    echo Error: Missing arguments.
    echo Usage: run_concatenate [file_pattern] [output_file]
    EXIT /B 1
)

REM Run the Python script with the provided arguments
python py\concatenate_files.py %1 %2

REM Check the exit code of the Python script
IF NOT %ERRORLEVEL% == 0 (
    echo An error occurred in the Python script.
    EXIT /B 1
)

echo Script executed successfully.
EXIT /B 0

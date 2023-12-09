@ECHO OFF

IF "%~1"=="" (
    ECHO Please provide a command line argument.
    EXIT /b
)

set AUDIOFILE=%1.

IF EXIST "%~dp0out\%AUDIOFILE%m4a" (
    DEL "%~dp0out\%AUDIOFILE%m4a"
)

IF EXIST "%~dp0out\%AUDIOFILE%mp3" (
    DEL "%~dp0out\%AUDIOFILE%mp3"
)

IF EXIST "%~dp0out\%AUDIOFILE%TextGrid" (
    DEL "%~dp0out\%AUDIOFILE%TextGrid"
)

IF NOT EXIST "%~dp0out\" (
    MKDIR "%~dp0out\"
)

ffmpeg -i "%~dp0wav\%AUDIOFILE%wav" "%~dp0out\%AUDIOFILE%m4a"
ffmpeg -i "%~dp0wav\%AUDIOFILE%wav" "%~dp0out\%AUDIOFILE%mp3"

REM Run the Python script with the provided parameters
python py\create-words.py %AUDIOFILE%

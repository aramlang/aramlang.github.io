# Define the file path
iniPath$ = "C:/temp/praat-chapter.ini"

# Check if the file exists
if fileReadable(iniPath$)
    file_Path$ = readFile$(iniPath$)
else
    writeInfoLine: "Missing path " + iniPath$
    exit
endif

Read from file... 'file_Path$'

pathLength = length(file_Path$)
fileName$ = left$(file_Path$, pathLength - 4)
textGrid$ = fileName$ + ".TextGrid"

Read from file... 'textGrid$'

lastSlash = rindex(fileName$, "/")
fileName$ = right$(fileName$, length(fileName$) - lastSlash)

selectObject: "TextGrid " + fileName$

intervalStart = Get start time of interval: 1, 1
startTimes$ = string$(intervalStart)

numberOfIntervals = Get number of intervals... 1
for interval from 2 to numberOfIntervals
    intervalStart = Get start time of interval: 1, interval
    startTimes$ = startTimes$ + "," + string$(intervalStart)
endfor

writeFileLine:  "C:/temp/praat-pipeline.txt", startTimes$

plusObject: "Sound " + fileName$
View & Edit

 
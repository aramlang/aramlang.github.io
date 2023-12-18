clearinfo
iniPath$ = "C:/temp/praat-chapter.ini"
pipeLine$ = "C:\temp\praat-pipeline.txt" 

if fileReadable(iniPath$)
    file_Path$ = readFile$(iniPath$)
else
    appendInfoLine: "Missing path " + iniPath$
    exit
endif

if fileReadable(pipeLine$)
    startTimes$ = readFile$(pipeLine$)
else
    appendInfoLine: "Missing path " + pipeLine$
    exit
endif

j = 1
temp$ = ""

# Loop through each character of the string
for i from 1 to length(startTimes$)
    char$ = mid$(startTimes$, i, 1)
    # Check if the character is a comma
    if char$ = ","
        # If it is, store the built substring in the array and reset temp$
        times[j] = number(temp$)
        j = j + 1
        temp$ = ""
    else
        # If it's not a comma, add the character to the temporary substring
        temp$ = temp$ + char$
    endif
endfor

# Add the last element after the loop
times[j] = number(temp$)

index = 0
selectedTime = Get starting point of interval
for i from 1 to j
    if times[i] == selectedTime
	index = i - 1
    endif
endfor

stringNumber$ = string$(index)
if index < 10
    stringNumber$ = "0" + stringNumber$
endif

pathLength = length(file_Path$)
fileName$ = left$(file_Path$, pathLength - 4)
textGrid$ = fileName$ + ".TextGrid"
wavFile$ = fileName$ + "_" + stringNumber$ + ".wav"

Save whole TextGrid as text file: textGrid$

appendInfoLine: wavFile$
Save selected sound as WAV file: wavFile$

Remove

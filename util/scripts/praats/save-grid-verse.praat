procedure isNumeric: .number$
    .len = length(.number$)
    if .len == 0
        .result = 0
    else
        .result = 1
    endif
    if .result == 1
        for .i from 1 to .len
            char$ = mid$(.number$, .i, 1)
            if char$ <> "0" and char$ <> "1" and char$ <> "2" and char$ <> "3" and char$ <> "4" and char$ <> "5" and char$ <> "6" and char$ <> "7" and char$ <> "8" and char$ <> "9"
                .result = 0
                .i = .len ; break out of the loop
            endif
        endfor
    endif
endproc

verse$ = Get label of interval
@isNumeric: verse$
appendInfoLine: isNumeric.result 
while isNumeric.result == 0 or (length(verse$) <> 3 and length(verse$) == 2)
    Select next tier
    verse$ = Get label of interval
    appendInfoLine: verse$
    @isNumeric: verse$
    appendInfoLine: isNumeric.result
endwhile
Select previous tier
fileBaseName$ = Get label of interval
Select next tier
Select next tier
Select next tier

textGridFile$ = fileBaseName$ + ".TextGrid"
Save whole TextGrid as text file: textGridFile$

lastSlash = rindex(fileBaseName$, "/")
fileName$ = right$(fileBaseName$, length(fileBaseName$) - lastSlash)

uScores = 0
len = length(fileName$)
for i from 1 to len
  if (mid$(fileName$, i, 1) = "_")
    uScores = uScores + 1
  endif
endfor

# is it a chapter file
if uScores == 2
  wavFile$ = fileBaseName$ + "_" + verse$ + ".wav"
  Save selected sound as WAV file: wavFile$
  clearinfo
  writeInfoLine: verse$
else
    # TODO verse extraction
endif

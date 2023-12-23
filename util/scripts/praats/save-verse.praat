procedure isNumeric: .number$
    .len = length(.number$)
    if .len == 0
        .result = 0
    else
        .result = 1
    endif
    if .result == 1
        for i from 1 to .len
            char$ = mid$(.number$, i, 1)
            if char$ <> "0" and char$ <> "1" and char$ <> "2" and char$ <> "3" and char$ <> "4" and char$ <> "5" and char$ <> "6" and char$ <> "7" and char$ <> "8" and char$ <> "9"
                .result = 0
                ; break out of the loop
                i = .len
            endif
        endfor
    endif
endproc

verse$ = Get label of interval
@isNumeric: verse$
while isNumeric.result == 0
    Select next tier
    verse$ = Get label of interval
    @isNumeric: verse$   
endwhile
Select next tier
fileBaseName$ = Get label of interval
Select next tier
Select next tier

textGridFile$ = fileBaseName$ + ".TextGrid"
Save whole TextGrid as text file: textGridFile$

wavFile$ = fileBaseName$ + "_" + verse$ + ".wav"
Save selected sound as WAV file: wavFile$

clearinfo
writeInfo: verse$

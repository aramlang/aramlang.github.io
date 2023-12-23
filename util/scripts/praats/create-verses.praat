form Read Number of Intervals
    natural number_of_intervals 23
endform
if number_of_intervals > 176
   exit "You cannot have more than 176 intervals"
endif

soundObjectName$ = selected$()
lastUscore = rindex(soundObjectName$, "_")
paddedChapter$ = right$(soundObjectName$, length(soundObjectName$) - lastUscore)
if length (paddedChapter$) == 3
    tiers$ = "Text Inter Phonetic Latin Verse Path Current"
else
    tiers$ = "Text Inter Verse Path Current"
endif

tiers = 0
for i from 1 to length(tiers$)
    if mid$(tiers$, i, 1) = " "
        tiers += 1
    endif
endfor
tiers += 1

nfo$ = Info
newlineIndex = index_regex(nfo$, "\n")
nfo$ = replace$(mid$(nfo$, newlineIndex + 1, length(nfo$) - newlineIndex - 1), "Associated file: ", "", 1)
newlineIndex = index_regex(nfo$, "\n")
nfo$ = replace$(left$(nfo$, newlineIndex - 5), "\", "/", 0)

totalDuration = Get total duration
size = totalDuration / number_of_intervals

To TextGrid: tiers$, ""
for interval to number_of_intervals
    endTime = interval * size
    if interval < number_of_intervals
        for i to tiers
            Insert boundary: i, endTime
        endfor
    endif
    @zeroPadded: paddedChapter$, interval
    Set interval text: tiers - 2, interval, zeroPadded.verse$
    Set interval text: tiers - 1, interval, nfo$
    Set interval text: tiers, interval, "TODO"
endfor
textGridObjectName$ = selected$()

plusObject: soundObjectName$
View & Edit
selectObject: textGridObjectName$

procedure zeroPadded: .paddedChapter$ .verse
    .verse$ = string$(.verse)
    if length(.paddedChapter$) == 3
        if .verse < 10
            .verse$ = "00" + .verse$
        elsif .verse < 100
            .verse$ = "0" + .verse$
        endif
    else
        if .verse < 10
            .verse$ = "0" + .verse$
        endif
    endif
endproc

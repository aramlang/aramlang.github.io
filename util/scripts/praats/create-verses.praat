books["01-01"] = 25 ; Mattai 1 has 25 verses
books["01-06"] = 34 ; Mattai 6

books["01-001"] = 31 ; Genesis 1
books["01-002"] = 25 ; Genesis 2

books["02-001"] = 22 ; Exodus 1
books["02-020"] = 23 ; Exodus 20

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

soundObjectName$ = selected$("Sound")
firstUscore = index(soundObjectName$, "_")
lastUscore = rindex(soundObjectName$, "_")
paddedBook$ = left$(soundObjectName$, firstUscore - 1)
paddedChapter$ = right$(soundObjectName$, length(soundObjectName$) - lastUscore)
verses = books[paddedBook$ + "-" + paddedChapter$]
if length (paddedChapter$) == 3
    tiers$ = "Text Inter Phonetic Latin Section Verse Status"
else
    tiers$ = "Text Inter Verse Status"
endif

tiers = 0
for i from 1 to length(tiers$)
    if mid$(tiers$, i, 1) = " "
        tiers += 1
    endif
endfor
tiers += 1

totalDuration = Get total duration
size = totalDuration / verses

textGridId = To TextGrid: tiers$, ""
for interval to verses
    endTime = interval * size
    if interval < verses
        for i to tiers
            Insert boundary: i, endTime
        endfor
    endif
    @zeroPadded: paddedChapter$, interval
    Set interval text: tiers - 1, interval, zeroPadded.verse$
    Set interval text: tiers, interval, "TODO"
endfor

plusObject: "Sound " + soundObjectName$
View & Edit

editor: textGridId
    startTime = Get starting point of interval
    while startTime <> 0
        Select previous interval
        startTime = Get starting point of interval
    endwhile
endeditor

include commons.praat

@exitOnLoaded:

wavFile$ = chapterPath$ + ".wav"
textGridFile$ = chapterPath$ + ".TextGrid"

soundId = Read from file: wavFile$
if fileReadable(textGridFile$)
  @loadVerses
else
  @createVerses
endif

#########################################

procedure exitOnLoaded
  select all
  .numberOfSelected = numberOfSelected()
  if .numberOfSelected > 0 
    for .i to .numberOfSelected
      .fullName$ = selected$(.i)
      .type$ = extractWord$(.fullName$, "")
      if .type$ == "TextGrid"
        selectObject: .fullName$
        .i = .numberOfSelected ; break
      endif
    endfor
    .error$ = "Found " + string$(.numberOfSelected) + " objects already loaded in Praat." + newline$ + "Loading of '" + chapter$ + "' aborted!!" + newline$
    exitScript: .error$
  endif  
endproc

procedure loadVerses
  .textGridId = Read from file: textGridFile$
  plusObject: soundId
  View & Edit
 
  selectObject: .textGridId
  .tiers = Get number of tiers
  .intervals = Get number of intervals: 1
  .activeInterval = 0
  for .i from 1 to .intervals
    .activeInterval = .activeInterval + 1
    .status$ = Get label of interval: .tiers, .i
    if .status$ == "TODO"
      .i = .intervals ; break
    endif
  endfor
  if not .activeInterval
    .activeInterval = 1
  endif
  @selectActiveInterval: .textGridId, .activeInterval
endproc

procedure createVerses
    # phonetic/text/inter common to both torah and peshitta
  .phonetic$ = ""
  .text$ = ""
  .inter$ = ""

  .latin$ = ""
  .male$ = ""

  .delim$ = " "
  if fileReadable(textFile$)
    .texts$ = readFile$(textFile$)
    @split: .texts$, newline$

    .phonetic$ = verseVector$#[1]
    .text$ = verseVector$#[2]
    .inter$ = verseVector$#[3]
    if isTorah
      .latin$ = verseVector$#[4]
      .male$ = verseVector$#[5]
    endif

    @split: .text$, .delim$
    .len = split.len
    .text$# = empty$#(.len)
    for .i from 1 to .len
      .text$#[.i] = verseVector$#[.i]
    endfor

    @split: .phonetic$, .delim$
    if .len <> split.len
      .msg$ = "Phonetic verse count " + string$(split.len) + " <> sefaria verse count " + string$(.len)
      exitScript: .msg$
    endif
    .phonetic$# = empty$#(.len)
    for .i from 1 to .len
      .phonetic$#[.i] = verseVector$#[.i]
    endfor

    @split: .inter$, .delim$
    if .len <> split.len
      appendInfoLine: .inter$
      .msg$ = "Interlinear verse count " + string$(split.len) + " <> sefaria verse count " + string$(.len)
      exitScript: .msg$
    endif
    .inter$# = empty$#(.len)
    for .i from 1 to .len
      .inter$#[.i] = verseVector$#[.i]
    endfor
  else
    .msg$ = "Cannot find or read " + textFile$
    exitScript: .msg$
  endif  

  .verses = verses[bookNo$ + "-" + chapterNo$]
  if isTorah
    .tiers$ = "Phonetic Text Inter Latin Male Verse Status"

    @split: .latin$, .delim$
    if .len <> split.len
      .msg$ = "Latin verse count " + string$(split.len) + " <> sefaria verse count " + string$(.len)
      exitScript: .msg$
    endif
    .latin$# = empty$#(.len)
    for .i from 1 to .len
      .latin$#[.i] = verseVector$#[.i]
    endfor

    @split: .male$, .delim$
    if .len <> split.len
      .msg$ = "Male verse count " + string$(split.len) + " <> sefaria verse count " + string$(.len)
      exitScript: .msg$
    endif
    .male$# = empty$#(.len)
    for .i from 1 to .len
      .male$#[.i] = verseVector$#[.i]
    endfor
  else
    .tiers$ = "Phonetic Text Inter Verse Status"
  endif

  .tiers = 0
  for .i from 1 to length(.tiers$)
    if mid$(.tiers$, .i, 1) = " "
      .tiers += 1
    endif
  endfor
  .tiers += 1

  .totalDuration = Get total duration
  .size = .totalDuration / .verses

  .textGridId = To TextGrid: .tiers$, ""
  for .interval from 1 to .verses
    .endTime = .interval * .size
    if .interval < .verses
      for .j to .tiers
        Insert boundary: .j, .endTime
       endfor
    endif
    if .phonetic$ <> ""
      Set interval text: 1, .interval, .phonetic$#[.interval]
    endif
    if .text$ <> ""
      Set interval text: 2, .interval, .text$#[.interval]
    endif
    if .inter$ <> ""
      Set interval text: 3, .interval, .inter$#[.interval]
    endif
    if .latin$ <> ""
      Set interval text: 4, .interval, .latin$#[.interval]
    endif
    if .male$ <> ""
      Set interval text: 5, .interval, .male$#[.interval]
    endif

    @zeroPadded: .interval
    Set interval text: .tiers - 1, .interval, zeroPadded.verse$
    Set interval text: .tiers, .interval, "TODO"
  endfor
  plusObject: soundId
  View & Edit

  selectObject: .textGridId
  @selectFirstInterval: .textGridId
  Save as text file: textGridFile$
endproc

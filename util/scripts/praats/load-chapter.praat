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

#############################################################

procedure exitOnLoaded
  select all
  .numberOfSelected = numberOfSelected()
  if .numberOfSelected > 0 
    for .i to .numberOfSelected
      .fullName$ = selected$(.i)
      .type$ = extractWord$(.fullName$, "")
      if .type$ == "TextGrid"
        selectObject: .i
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
  .verses = verses[bookNo$ + "-" + chapterNo$]
  if isTorah
    .tiers$ = "Text Male Inter Phonetic Latin Section Verse Status"
  else
    .tiers$ = "Text Male Inter Verse Status"
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
    @zeroPadded: .interval
    Set interval text: .tiers - 1, .interval, zeroPadded.verse$
    Set interval text: .tiers, .interval, "TODO"
  endfor
  plusObject: soundId
  View & Edit

  selectObject: .textGridId
  @selectFirstInterval: .textGridId
endproc


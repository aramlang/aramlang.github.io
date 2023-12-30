include commons.praat

workPath$ = shellDirectory$
@getSlashChapter: workPath$
basePath$ = workPath$ + getSlashChapter.result$
wavFile$ = basePath$ + ".wav"
textGridFile$ = basePath$ + ".TextGrid"

soundId = Read from file: wavFile$
if fileReadable(textGridFile$)
  textGridId = Read from file: textGridFile$
  plusObject: soundId
  View & Edit
 
  selectObject: textGridId
  tiers = Get number of tiers
  intervals = Get number of intervals: 1
  activeInterval = 0
  for i from 1 to intervals
    activeInterval = activeInterval + 1
    status$ = Get label of interval: tiers, i
    if status$ == "TODO"
      i = intervals ; break
    endif
  endfor
  @selectActiveInterval: textGridId, activeInterval
else
  @createVerses: workPath$
endif

procedure createVerses .workPath$
  @getChapter: .workPath$
  @getBookNo: getChapter.result$
  @getChapterNo: getChapter.result$
  
  .bookNo$ = getBookNo.result$
  .chapterNo$ = getChapterNo.result$
  .verses = books[.bookNo$ + "-" + .chapterNo$]

  .isTorah = length(.chapterNo$) == 3
  if .isTorah
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
  for .interval to .verses
    .endTime = .interval * .size
    if .interval < .verses
      for .j to .tiers
        Insert boundary: .j, .endTime
       endfor
    endif
    @zeroPadded: .chapterNo$, .interval
    Set interval text: .tiers - 1, .interval, zeroPadded.verse$
    Set interval text: .tiers, .interval, "TODO"
  endfor
  plusObject: soundId
  View & Edit

  selectObject: .textGridId
  @selectFirstInterval: .textGridId
endproc

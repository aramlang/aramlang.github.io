@init:

procedure init
  # pathSeparator
  if windows
    pathSeparator$ = "\"
  else
    pathSeparator$ = "/"
  endif

  # chapter$ - e.g. 02_Shemot_020
  .chapterIdx = rindex(shellDirectory$, pathSeparator$)
  chapter$ = mid$(shellDirectory$, .chapterIdx + 1, length(shellDirectory$) - .chapterIdx)

  # bookNo$
  .firstUscore = index(chapter$, "_")
  bookNo$ = left$(chapter$, .firstUscore - 1)

  # chapterNo$
  .lastUscore = rindex(chapter$, "_")
  chapterNo$ = right$(chapter$, length(chapter$) - .lastUscore)

  # isTorah
  isTorah = length(chapterNo$) == 3

  # paths
  workPath$ = shellDirectory$ + pathSeparator$
  chapterPath$ = workPath$ + chapter$

  # verseVector
  verseVector$# = empty$#(100) ; largest verse has Esther 8:9 with 90 words 
endproc

##########################################

procedure selectFirstInterval .textGridId
  editor: .textGridId
    .startTime = Get starting point of interval
    while .startTime <> 0
      Select previous interval
      .startTime = Get starting point of interval
    endwhile
  endeditor
endproc

procedure selectActiveInterval .textGridId .activeInterval
  @selectFirstInterval: .textGridId

  editor: .textGridId
    for .i from 1 to .activeInterval - 1
      Select next interval
    endfor
  endeditor
endproc

procedure zeroPadded: .verse
  .verse$ = string$(.verse)
  if isTorah
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

procedure assureFirstTier
  .nfo$ = Editor info
  @extractNfoValue: .nfo$, "Selected tier: "
  .activeTier = number(extractNfoValue.result$)
  while .activeTier <> 1
    Select previous tier
    .nfo$ = Editor info
    @extractNfoValue: .nfo$, "Selected tier: "
    .activeTier = number(extractNfoValue.result$)
  endwhile
  
  @extractNfoValue: .nfo$, "Selection start: "
  .selectionStart = number(extractNfoValue.result$)
  @extractNfoValue: .nfo$, "Selection end: "
  .selectionEnd = number(extractNfoValue.result$)
  
  if .selectionStart == .selectionEnd
    .error$ = "Please select tier #1 working interval." + newline$ + "Only a point selection has been found." + newline$
    exitScript: .error$
  endif
endproc

procedure extractNfoValue .text$, .label$
  .labelPosition = index(.text$, .label$)
  if .labelPosition > 0
    .valuelPosition = .labelPosition + length(.label$)
    .line$ = mid$(.text$, .valuelPosition, length(.text$) - .valuelPosition)
    .endOfLine = index(.line$, newline$)
    if .endOfLine > 0
      .value$ = mid$(.line$, 1, .endOfLine - 1)
      .secondsPos = index(.value$, " seconds")
      if .secondsPos > 0
        .value$ = left$(.value$, .secondsPos - 1)
      endif
    .result$ = .value$
    else
      .result$ = ""
    endif
  else
    .result$ = ""
  endif
endproc

procedure zeroCross
  @assureFirstTier:

  .cnt = 0
  .initialStartTime = Get starting point of interval
  if .initialStartTime <> 0
    Move to nearest zero crossing
    .cnt = .cnt + 1
    .initialStartTime = Get starting point of interval
  endif

  Select next interval
  .startTime = Get starting point of interval

  while .startTime <> .initialStartTime
    if .startTime <> 0
      Move to nearest zero crossing
      .cnt = .cnt + 1
    endif
      Select next interval
      .startTime = Get starting point of interval
    endwhile
endproc

procedure selectChapterTextGrid
  select all
  .numberOfSelected = numberOfSelected()
  .id = 0
  for .i to .numberOfSelected
    .fullName$ = selected$(.i)
    .type$ = extractWord$(.fullName$, "")
    .name$ = extractLine$ (.fullName$, " ")
    if .type$ == "TextGrid" and .name$ == chapter$
      selectObject: .fullName$
      .id = selected()
      .i = .numberOfSelected ; break
    endif
  endfor
endproc

procedure trim: .s$
  .len = length(.s$)
  .lindex = index_regex(.s$, "[^ \n\t\r]")
  .beginning$ = right$(.s$, .len - .lindex + 1)
  .rindex = index_regex(.beginning$, "[ \n\t\r]*$")
  .lrtrim$ = left$(.beginning$, .rindex-1)
  # TextGrid can't handle \t, replace it with actual tabs
  .result$ = replace$(.lrtrim$, "\t", tab$, 0)
endproc

procedure trimmedLabel
  .text$ = Get label of interval
  @trim(.text$)
  .result$ = trim.result$
endproc

procedure split .string$, .delimiter$
  .len = 0
  .substring$ = ""
  for .i from 1 to length(.string$)
    .char$ = mid$(.string$, .i, 1)
    if .char$ == .delimiter$ or .char$ == "־" or .char$ == "׀"
      if .char$ <> .delimiter$
        .substring$ = .substring$ + .char$
      endif
      .len = .len + 1
      verseVector$#[.len] = .substring$
      .substring$ = "" 
    else
      .substring$ = .substring$ + .char$
    endif
  endfor

  if length(.substring$) > 0
    .len = .len + 1
    verseVector$#[.len] = .substring$
  endif
endproc

procedure copySplits dest$#
  .len = size(dest$#)
  for .i from 1 to .len
    dest$#[.i] = verseVector$#[.i]
  endfor
endproc

procedure isNumeric: .number$
  .len = length(.number$)
  if .len == 0
    .result = 0
  else
    .result = 1
  endif
  if .result == 1
    for .i from 1 to .len
      .char$ = mid$(.number$, .i, 1)
      if .char$ <> "0" and .char$ <> "1" and .char$ <> "2" and .char$ <> "3" and .char$ <> "4" and .char$ <> "5" and .char$ <> "6" and .char$ <> "7" and .char$ <> "8" and .char$ <> "9"
        .result = 0
        .i = .len ; break out of the loop
      endif
    endfor
  endif
endproc

procedure uscores: .text$
  .count = 0
  .len = length(.text$)
  for .i from 1 to .len
    if (mid$(.text$, .i, 1) = "_")
      .count = .count + 1
    endif
  endfor
endproc

verses["01-001"] = 31 ; Genesis 1 has 31 verses
verses["01-002"] = 25 ; Genesis 2

verses["02-001"] = 22 ; Exodus 1
verses["02-020"] = 23 ; Exodus 20

verses["01-01"] = 25 ; Mattai 1 has 25 verses
verses["01-06"] = 34 ; Mattai 6

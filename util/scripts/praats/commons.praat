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

procedure uscores: .text$
    .count = 0
    .len = length(.text$)
    for .i from 1 to .len
        if (mid$(.text$, .i, 1) = "_")
            .count = .count + 1
        endif
    endfor
endproc

procedure getPathSeparator .workPath$
    if index(.workPath$, "/") > 0
        .result$ = "/"
    elsif index(.workPath$, "\") > 0
        .result$ = "\"
    else
        .result$ = "\"
    endif
endproc

procedure getSlashChapter .workPath$
    @getPathSeparator: .workPath$
    .separator$ = getPathSeparator.result$
    .idx = rindex(.workPath$, .separator$)
    .result$ = mid$(.workPath$, .idx, length(.workPath$) - .idx + 1)
endproc

procedure getChapter .workPath$
    @getSlashChapter: .workPath$
    .slashChapter$ = getSlashChapter.result$
    .result$ = mid$(.slashChapter$, 2, length(.slashChapter$) - 1)
endproc

procedure getChapterNo .workPath$
    .lastUscore = rindex(.workPath$, "_")
    .result$ = right$(.workPath$, length(.workPath$) - .lastUscore)
endproc

procedure getBookNo .workPath$
    .firstUscore = index(.workPath$, "_")
    .result$ = left$(.workPath$, .firstUscore - 1)
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

procedure assureFirstTier .nfo$
  @extractNfoValue: .nfo$, "Selected tier: "
  .activeTier = number(extractNfoValue.result$)
  if .activeTier <> 1
    .error$ = "Tier #1 needs to be selected to finish the operation." + newline$ + "Instead tier #" + string$(.activeTier) + " has been found selected." + newline$ + "Please put back the selection on tier #1 !!" + newline$ 
    exitScript: .error$
  endif
  
  @extractNfoValue: .nfo$, "Selection start: "
  .selectionStart = number(extractNfoValue.result$)
  @extractNfoValue: .nfo$, "Selection end: "
  .selectionEnd = number(extractNfoValue.result$)
  
  if .selectionStart == .selectionEnd
    .error$ = "Please select working interval on tier #1." + newline$ + "Only a point selection has been found." + newline$
    exitScript: .error$
  endif
endproc

procedure zeroCross
    .nfo$ = Editor info
    @assureFirstTier: .nfo$
    
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

books["01-001"] = 31 ; Genesis 1 has 31 verses
books["01-002"] = 25 ; Genesis 2

books["02-001"] = 22 ; Exodus 1
books["02-020"] = 23 ; Exodus 20

books["01-01"] = 25 ; Mattai 1 has 25 verses
books["01-06"] = 34 ; Mattai 6

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

textGrid$ = selected$("TextGrid")
 
uscores = 0
for i from 1 to length(textGrid$)
    if mid$(textGrid$, i, 1) = "_"
        uscores += 1
    endif
endfor
if uscores <> 2
    exitScript: "A chapter textgrid should have 2 underscores. '" + textGrid$ + "' has " + string$(uscores)
endif

selectObject: "TextGrid " + textGrid$

verse$ = info$()
@isNumeric: verse$
if isNumeric.result == 0
  tiers = Get number of tiers
  verseTier = tiers - 1
  statusTier = tiers
  intervals = Get number of intervals: statusTier
  for i from 1 to intervals
      todo$ = Get label of interval: statusTier, i
      if todo$ == "TODO"
          verse$ = Get label of interval: verseTier, i
          i = intervals
      endif
  endfor
endif

runScript: "verse-edit.praat", verse$

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



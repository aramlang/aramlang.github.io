include commons.praat

textGrid$ = selected$("TextGrid")

@uscores: textGrid$
if uscores.count <> 2
    exitScript: "A chapter textgrid should have 2 underscores. '" + textGrid$ + "' has " + string$(uscores)
endif

selectObject: "TextGrid " + textGrid$

verse$ = info$()
@isNumeric: verse$
if isNumeric.result == 0
  tiers = Get number of tiers
  verseTier = tiers - 1
  statusTier = tiers
  verse$ = Get label of interval: verseTier, 1
  
  intervals = Get number of intervals: statusTier
  for i from 1 to intervals
      status$ = Get label of interval: statusTier, i
      if status$ == "TODO"
          verse$ = Get label of interval: verseTier, i
          i = intervals
      endif
  endfor
endif

runScript: "verse-edit.praat", number(verse$)

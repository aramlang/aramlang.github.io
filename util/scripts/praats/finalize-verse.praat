include verse-commons.praat

tiers = Get number of tiers
verseTier = tiers - 1
sectionTier = tiers

text$ = Get label of interval: verseTier, selectedInterval
verse$ = text$
@isNumeric: verse$
if not isNumeric.result
  errorMsg$ = "Verse tier contains a non-numeric or non-positive value '" + verse$ + "'" + newline$
  exitScript: errorMsg$
endif
if isTorah
  if length(verse$) <> 3
    errorMsg$ = "Verse value expected to be 3 characters long. Found '" + verse$ + "'" + newline$
    exitScript: errorMsg$
  endif
else
  if length(verse$) <> 2
    errorMsg$ = "Verse value expected to be 2 characters long. Found '" + verse$ + "'" + newline$
    exitScript: errorMsg$
  endif
endif

verseFileName$ = chapter$ + "_" + verse$
verseBasePath$ = workPath$ + verseFileName$ 
verseWavPath$ = verseBasePath$ + ".wav"
verseTextGridPath$ = verseBasePath$ + ".TextGrid"
verseSoundId = 0
verseTextGridId = 0

select all
.i = numberOfSelected()
while .i > 0
  .fullName$ = selected$(.i)
  .type$ = extractWord$(.fullName$, "")
  .name$ = extractLine$(.fullName$, " ")
  if verseFileName$ == .name$
    if .type$ == "TextGrid"
      verseTextGridId = selected(.i)
    elsif .type$ == "Sound"
      verseSoundId = selected(.i)
    endif
  endif
  if verseSoundId > 0 and verseTextGridId > 0
    .i = 1 ; break
  endif
  .i = .i - 1
endwhile
if verseSoundId == 0 or verseTextGridId == 0
  selectObject: chapterTextGridId
  errorMsg$ = "Missing sound or textgrid object for " + verseFileName$ + "." + newline$ + "Please load verse objects first !" + newline$
  exitScript: errorMsg$
else
  selectObject: verseSoundId
endif

###########################################


include commons.praat

@selectChapterTextGrid:
chapterTextGridId = selectChapterTextGrid.id

if not chapterTextGridId
  errorMsg$ = chapter$ + " TextGrid is not loaded." + newline$ + "Please run-praat again and do not remove objects." + newline$
  exitScript: errorMsg$
endif

editor(chapterTextGridId)
  @assureFirstTier
  @trimmedLabel
  text$ = trimmedLabel.result$
  if text$ = ""
    errorMsg$ = "Text value cannot be empty !" + newline$
    exitScript: errorMsg$
  endif
  if isTorah
    Select next tier
    @trimmedLabel
    male$ = trimmedLabel.result$
  endif
  
endeditor

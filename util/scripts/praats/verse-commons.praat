include commons.praat

@selectChapterTextGrid:
chapterTextGridId = selectChapterTextGrid.id

if not chapterTextGridId
  errorMsg$ = chapter$ + " TextGrid is not loaded." + newline$ + "Please run-praat again and do not remove objects." + newline$
  exitScript: errorMsg$
endif

editor(chapterTextGridId)
  @assureFirstTier
  selectionStart = assureFirstTier.selectionStart
endeditor

@getSelectedInterval: selectionStart
selectedInterval = getSelectedInterval.result

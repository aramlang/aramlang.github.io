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
  @exitOnEmpty: text$
  
  @split: text$, " "
  words = split.len
  text$# = empty$#(words)
  @copySplits: text$#

  if isTorah
    Select next tier
    @trimmedLabel
    male$ = trimmedLabel.result$
    @exitOnEmpty: male$

    @split: male$, " "
    males = split.len
    @exitOnDiffCount: males
    male$# = empty$#(males)
    @copySplits: male$#
  endif
endeditor

procedure getTier
  .nfo$ = Editor info
  @extractNfoValue: .nfo$, "Selected tier: "
  .activeTier = number(extractNfoValue.result$)
  endeditor
  .result$ = Get tier name: .activeTier
endproc

procedure exitOnEmpty .text$
  if .text$ = ""
    @getTier:
    .tier$ = getTier.result$
    .errorMsg$ = .tier$ + " value cannot be empty !" + newline$
    exitScript: .errorMsg$
  endif
endproc

procedure exitOnDiffCount .splitCount
  if .splitCount <> words
    @getTier:
    .tier$ = getTier.result$
    .errorMsg$ = .tier$ + " word count " + string$(.splitCount) + " <> text word count " + string$(words) + " !" + newline$
    exitScript: .errorMsg$
  endif
endproc
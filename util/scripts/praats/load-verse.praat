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

verseTiers$ = ""
tiers = Get number of tiers
for tier from 1 to tiers
  text$ = Get label of interval: tier, selectedInterval
  tier$ = Get tier name: tier
  if verseTiers$ == ""
    verseTiers$ = tier$
  else
    verseTiers$ = verseTiers$ + " " + tier$
  endif

  @trim: text$
  text$ = trim.result$
  @exitOnEmpty: text$, tier$

  if tier$ == "Inter"
    delim$ = tab$
  else
    delim$ = " "
  endif

  if tier$ == "Text"
    @split: text$, delim$
    words = split.len
    words$# = empty$#(words)
    @copySplits: words$#
  elsif tier$ == "Male"
    @split: text$, delim$
    males = split.len
    @exitOnDiffCount: males, tier$
    
    males$# = empty$#(males)
    @copySplits: males$#
  elsif tier$ == "Inter"
    @split: text$, delim$
    inters = split.len
    @exitOnDiffCount: inters, tier$

    inters$# = empty$#(inters)
    @copySplits: inters$#
  elsif tier$ == "Phonetic"
    @split: text$, delim$
    phonetics = split.len
    @exitOnDiffCount: phonetics, tier$

    phonetics$# = empty$#(phonetics)
    @copySplits: phonetics$#
  elsif tier$ == "Latin"
    @split: text$, delim$
    latins = split.len
    @exitOnDiffCount: latins, tier$

    latins$# = empty$#(latins)
    @copySplits: latins$#
  elsif tier$ == "Section"
    section$ = text$
  elsif tier$ == "Verse"
    verse$ = text$
    @isNumeric: verse$
    if not isNumeric.result
      errorMsg$ = tier$ + " tier contains a non-numeric value '" + verse$ + "'" + newline$
      exitScript: errorMsg$
    endif
  elsif tier$ == "Status"
    status$ = text$
  endif
endfor

verseFileName$ = chapter$ + "_" + verse$
verseBasePath$ = workPath$ + verseFileName$ 
verseWavPath$ = verseBasePath$ + ".wav"
verseTextGridPath$ = verseBasePath$ + ".TextGrid"

@exitOnLoaded

editor(chapterTextGridId)
  Save selected sound as WAV file: verseWavPath$
endeditor

verseSoundId = Read from file: verseWavPath$
if fileReadable(verseTextGridPath$)
  @loadVerse
else
  @createVerse
endif

#######################################

procedure exitOnLoaded
  select all
  .i = numberOfSelected()
  .errorMsg$ = ""
  while .i > 0
    .fullName$ = selected$(.i)
    .type$ = extractWord$(.fullName$, "")
    .name$ = extractLine$(.fullName$, " ")
    if verseFileName$ == .name$ and .errorMsg$ == ""
      .errorMsg$ = .fullName$ + " object already found loaded" + newline$
    endif
    if .type$ == "TextGrid"
      selectObject: .fullName$
      .i = 1 ; break
    endif
    .i = .i - 1
  endwhile
  if .errorMsg$ <> ""
    exitScript: .errorMsg$
  endif
endproc

procedure loadVerse
endproc

procedure createVerse
  .totalDuration = Get total duration
  .size = .totalDuration / words
  .verseTextGridId = To TextGrid: verseTiers$, ""
endproc

procedure exitOnEmpty .text$, .tier$
  if .text$ = ""
    .errorMsg$ = .tier$ + " value cannot be empty !" + newline$
    exitScript: .errorMsg$
  endif
endproc

procedure exitOnDiffCount .splitCount, .tier$
  if .splitCount <> words
    .errorMsg$ = .tier$ + " word count " + string$(.splitCount) + " <> text word count " + string$(words) + " !" + newline$
    exitScript: .errorMsg$
  endif
endproc
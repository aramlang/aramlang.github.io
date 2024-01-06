include verse-commons.praat

verseTiers$ = ""
section$ = ""
tiers = Get number of tiers
for tier from 1 to tiers
  text$ = Get label of interval: tier, selectedChapterInterval
  tier$ = Get tier name: tier
  if verseTiers$ == ""
    verseTiers$ = tier$
  else
    verseTiers$ = verseTiers$ + " " + tier$
  endif

  @trim: text$
  text$ = trim.result$
  if tier$ <> "Section"
    @exitOnEmpty: text$, tier$
  endif

  if tier$ == "Inter"
    delim$ = tab$
  else
    delim$ = " "
  endif

  if tier$ == "Text"
    @split: text$, delim$
    words = split.len
    words$# = empty$#(words)
    for i from 1 to words
      words$#[i] = verseVector$#[i]
    endfor
  elsif tier$ == "Male"
    males$ = text$ 
    @split: males$, delim$
    males = split.len
    @exitOnDiffCount: males, tier$
    
    males$# = empty$#(males)
    for i from 1 to males
      males$#[i] = verseVector$#[i]
    endfor
  elsif tier$ == "Inter"
    splitTier = tier
    @split: text$, delim$
    inters = split.len
    @exitOnDiffCount: inters, tier$

    inters$# = empty$#(inters)
    for i from 1 to inters
      inters$#[i] = verseVector$#[i]
    endfor
  elsif tier$ == "Phonetic"
    @split: text$, delim$
    phonetics = split.len
    @exitOnDiffCount: phonetics, tier$

    phonetics$# = empty$#(phonetics)
    for i from 1 to phonetics
      phonetics$#[i] = verseVector$#[i]
    endfor
  elsif tier$ == "Latin"
    splitTier = tier
    @split: text$, delim$
    latins = split.len
    @exitOnDiffCount: latins, tier$

    latins$# = empty$#(latins)
    for i from 1 to latins
      latins$#[i] = verseVector$#[i]
    endfor
  elsif tier$ == "Section"
    section$ = text$
  elsif tier$ == "Verse"
    verse$ = text$
    @isNumeric: verse$
    if not isNumeric.result
      errorMsg$ = tier$ + " tier contains a non-numeric or non-positive value '" + verse$ + "'" + newline$
      exitScript: errorMsg$
    endif
    if isTorah
      if length(verse$) <> 3
        errorMsg$ = tier$ + " value expected to be 3 characters long. Found '" + verse$ + "'" + newline$
        exitScript: errorMsg$
      endif
    else
      if length(verse$) <> 2
        errorMsg$ = tier$ + " value expected to be 2 characters long. Found '" + verse$ + "'" + newline$
        exitScript: errorMsg$
      endif
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
      .errorMsg$ = .fullName$ + " is loaded already !" + newline$
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
  .verseTextGridId = Read from file: verseTextGridPath$
  plusObject: verseSoundId
  View & Edit
 
  selectObject: .verseTextGridId
  @selectFirstInterval: .verseTextGridId
endproc

procedure createVerse
  .endPoints$ = ""
  if isTorah
    .verseJsonPath$ = verseBasePath$ + ".json"
    .verseEndPointsPath$ = verseBasePath$ + ".txt"
    .segmentPath$ = workPath$ + "segment.txt"

    .cmd$ = exePath$ + "run-wisperx.cmd"
    writeFile: .segmentPath$, males$
    nocheck runSubprocess(.cmd$, workPath$, verseWavPath$)
    .cmd$ = exePath$ + "extract-times.cmd"
    nocheck runSubprocess(.cmd$, .verseJsonPath$)
    if fileReadable(.verseEndPointsPath$)
      .endPoints$ = readFile$(.verseEndPointsPath$)
    endif
  endif

  .points = 0
  if .endPoints$ <> ""
    .wordPoints = words - 1
    @split: .endPoints$, ","
    .points = split.len
    if .points <> .wordPoints
      appendInfoLine: "Warning: wisperx end point count " + string$(.points) + " is different than word end point count " + string$(.wordPoints)
    endif
  endif
  
  .totalDuration = Get total duration
  .defaultSize = .totalDuration / words
  .verseTextGridId = To TextGrid: verseTiers$, ""
  for .interval from 1 to words
    if .interval <= .points
      .endTime = number(verseVector$#[.interval])
    else
      .endTime = .interval * .defaultSize
    endif
      for .j to splitTier
        if .interval < words
          Insert boundary: .j, .endTime
        endif
        .tier$ = Get tier name: .j
        if .tier$ == "Text"
          Set interval text: .j, .interval, words$#[.interval]
        elsif .tier$ == "Male"
          Set interval text: .j, .interval, males$#[.interval]
        elsif .tier$ == "Inter"
          Set interval text: .j, .interval, inters$#[.interval]
        elsif .tier$ == "Phonetic"
          Set interval text: .j, .interval, phonetics$#[.interval]
        elsif .tier$ == "Latin"
          Set interval text: .j, .interval, latins$#[.interval]
        endif
      endfor
  endfor

  if section$ <> ""
    Set interval text: tiers - 2, 1, section$
  endif
  Set interval text: tiers - 1, 1, verse$
  Set interval text: tiers, 1, "TODO"
  plusObject: verseSoundId
  View & Edit

  selectObject: .verseTextGridId
  @selectFirstInterval: .verseTextGridId
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

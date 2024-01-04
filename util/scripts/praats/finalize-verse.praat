include verse-commons.praat

tiers = Get number of tiers
verseTier = tiers - 1
sectionTier = tiers

text$ = Get label of interval: verseTier, selectedChapterInterval
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
  selectObject: verseTextGridId
endif

editor(verseTextGridId)
  @assureFirstTier
  .startTime = Get starting point of interval
  while .startTime <> 0
    Select previous interval
    .startTime = Get starting point of interval
  endwhile
endeditor

intervals = Get number of intervals: 1
soundsSize = 2 * intervals
sounds# = zero#(soundsSize + 1)
i = 0
for interval from 1 to intervals
  i = i + 1
  editor(verseTextGridId)
    sounds#[i] = Extract selected sound (time from 0)
    Select next interval
  endeditor
  if interval < intervals
    whiteLen = 1.02
    whiteName$ = "white02"
  else
    whiteLen = 1.01
    whiteName$ = "white01"
  endif
  i = i + 1
  sounds#[i] = Create Sound as pure tone: whiteName$, 1, 0, whiteLen, 44100, 440, 0.00001, 0.01, 0.01
endfor

selectObject: sounds#[1]
for i from 2 to soundsSize
  plusObject: sounds#[i]
endfor

sounds#[soundsSize + 1] = Concatenate with overlap: 0.01
selectObject: sounds#[soundsSize + 1]
concatenatedWavPath$ =  workPath$ + "P_" + verseFileName$ + ".wav"
Save as WAV file: concatenatedWavPath$

selectObject: sounds#[1]
for i from 2 to soundsSize + 1
  plusObject: sounds#[i]
endfor
Remove

selectObject: verseTextGridId
Set interval text: sectionTier, 1, "DONE"
Save as text file: verseTextGridPath$
plusObject: verseSoundId
Remove

selectObject: chapterTextGridId
Set interval text: sectionTier, selectedChapterInterval, "DONE"
textGridName$ = selected$ ("TextGrid")
textGridPath$ = workPath$ + textGridName$ + ".TextGrid"
Save as text file: textGridPath$
editor(chapterTextGridId)
  Select next interval
endeditor




form Read Verse to Edit
  natural verse 1
endform
if verse > 176
  exitScript: "You cannot have a verse number higher than 176"
endif

include commons.praat

procedure split .string$, .delimiter$
  .len = 0
  .substring$ = ""
  for .i from 1 to length(.string$)
    .char$ = mid$(.string$, .i, 1)
    if .char$ == .delimiter$ or .char$ == "־" or .char$ == "׀"
      if .char$ <> .delimiter$
        .substring$ = .substring$ + .char$
      endif
      .len = .len + 1
      splits$[.len] = .substring$
      .substring$ = "" 
    else
      .substring$ = .substring$ + .char$
    endif
  endfor

  if length(.substring$) > 0
    .len = .len + 1
    splits$[.len] = .substring$
  endif
endproc

select all
soundId = selected("Sound")
selectObject: soundId
nfo$ = Info
@extractNfoValue: nfo$, "Associated file: "
chapterPath$ = left$(extractNfoValue.result$, length(extractNfoValue.result$) - 4) 

select all
gridId = selected("TextGrid")
selectObject: gridId

tiers = Get number of tiers
verseTier = tiers - 1
statusTier = tiers

delim$ = " "
text$ = Get label of interval: 1, verse
@split: text$, delim$
words = split.len
if split.len = 0
  plusObject: soundId
  exitScript: "No words found in chapter grid"
endif

for i from 1 to words
  words$[i] = splits$[i]
endfor

inter$ = Get label of interval: 2, verse
@split: inter$, tab$
inters = split.len
for i from 1 to inters
  inters$[i] = splits$[i]
endfor
if words <> inters
  plusObject: soundId
  error$ = "Words length does not match inters length:  " + string$(words) + " <> " + string$(inters)
  exitScript: error$ 
endif

if tiers > 5
  phonetic$ = Get label of interval: 3, verse
  @split: phonetic$, delim$
  phonetics = split.len
  for i from 1 to phonetics
    phonetics$[i] = splits$[i]
  endfor
  if words <> phonetics
    plusObject: soundId
    error$ = "Words length does not match phonetics length:  " + string$(words) + " <> " + string$(phonetics)
    exitScript: error$ 
  endif

  latin$ = Get label of interval: 4, verse
  @split: latin$, delim$
  latins = split.len
  for i from 1 to latins
    latins$[i] = splits$[i]
  endfor
  if words <> latins
    plusObject: soundId
    error$ = "Words length does not match latins length:  " + string$(words) + " <> " + string$(latins)
    exitScript: error$ 
  endif

  section$ = Get label of interval: verseTier - 1, verse
  tiers$ = "Words Inter Phonetic Latin Section Verse Status"
else
  tiers$ = "Words Inter Verse Status"
endif
verse$ = Get label of interval: verseTier, verse

startTime = Get start time of interval: 1, verse
endTime = Get end time of interval: 1, verse
size = (endTime - startTime) / words

minusObject: soundId
minusObject: gridId

versePath$ = chapterPath$ + "_" + verse$
verseSoundId = Read from file: versePath$ + ".wav"

verseGridId = To TextGrid: tiers$, ""
for interval to words
    endTime = interval * size
    if interval < words
        Insert boundary: 1, endTime ; words
        Insert boundary: 2, endTime ; inters
        if tiers > 5
          Insert boundary: 3, endTime ; phonetics
          Insert boundary: 4, endTime ; latins
        endif
    endif
    Set interval text: 1, interval, words$[interval]
    Set interval text: 2, interval, inters$[interval]
    if tiers > 5
      Set interval text: 3, interval, phonetics$[interval]
      Set interval text: 4, interval, latins$[interval]
    endif
endfor
if tiers > 5
  Set interval text: 5, 1, section$
endif
Set interval text: verseTier, 1, verse$
Set interval text: statusTier, 1, "TODO"

plusObject: verseSoundId
View & Edit

@selectFirstInterval: verseGridId

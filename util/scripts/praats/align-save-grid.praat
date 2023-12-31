include commons.praat

textGridId = selected("TextGrid")

selectObject: textGridId
numberOfTiers = Get number of tiers

if numberOfTiers < 2
    plusObject: soundObject
    exitScript: "The TextGrid must have at least two tiers."
endif

editor(textGridId)
    @zeroCross
endeditor

numberOfIntervals = Get number of intervals: 1
for interval from 1 to numberOfIntervals
  txt$ = Get label of interval: 1, interval
  @trim(txt$)
  trimmedTxt$ = trim.result$
  if txt$ <> trimmedTxt$
    Set interval text: 1, interval, trimmedTxt$
  endif
  endTimes[interval] = Get end time of interval: 1, interval
endfor

for tier from 2 to numberOfTiers
  skipTier = 1
  tierIntervals = Get number of intervals: tier
  if tierIntervals == numberOfIntervals
    for tierInterval from 1 to tierIntervals
      txt$ = Get label of interval: tier, tierInterval
      @trim(txt$)
      trimmedTxt$ = trim.result$
      if txt$ <> trimmedTxt$
        Set interval text: tier, tierInterval, trimmedTxt$
      endif
      content$[tierInterval] = trimmedTxt$
      tierEndTime = Get end time of interval: tier, tierInterval
      if tierEndTime <> endTimes[tierInterval]
        skipTier = 0
      endif
    endfor
    if skipTier == 0
      for tierInterval from 1 to tierIntervals - 1
        Remove right boundary: tier, 1
      endfor
      for tierInterval from 1 to tierIntervals
        # Insert boundary at the end time if not the last interval
        if tierInterval < tierIntervals
            Insert boundary: tier, endTimes[tierInterval]
        endif
        # Copy back the labels
        Set interval text: tier, tierInterval, content$[tierInterval]
      endfor
    endif
  endif
endfor

textGridName$ = selected$ ("TextGrid")
textGridPath$ = workPath$ + textGridName$ + ".TextGrid"
Save as text file: textGridPath$

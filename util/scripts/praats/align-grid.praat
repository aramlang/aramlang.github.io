selectObject: selected("TextGrid")
numberOfTiers = Get number of tiers

if numberOfTiers < 2
    exit "The TextGrid must have at least two tiers."
endif

numberOfIntervals = Get number of intervals: 1
for interval from 1 to numberOfIntervals
    endTimes[interval] = Get end time of interval: 1, interval
endfor

for tier from 2 to numberOfTiers
    skipTier = 1
    tierIntervals = Get number of intervals: tier
    if tierIntervals == numberOfIntervals
        for tierInterval from 1 to tierIntervals
            content$[tierInterval] = Get label of interval: tier, tierInterval
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

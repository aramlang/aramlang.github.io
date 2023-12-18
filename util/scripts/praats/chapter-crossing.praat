clearinfo
initialStartTime = Get starting point of interval
if initialStartTime <> 0
    Move to nearest zero crossing
    initialStartTime = Get starting point of interval
endif

Select next interval
startTime = Get starting point of interval

while startTime <> initialStartTime
    if startTime <> 0
        Move to nearest zero crossing
    endif
    Select next interval
    startTime = Get starting point of interval
endwhile

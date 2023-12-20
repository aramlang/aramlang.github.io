cnt = 0
initialStartTime = Get starting point of interval
if initialStartTime <> 0
    Move to nearest zero crossing
    cnt = cnt + 1
    initialStartTime = Get starting point of interval
endif

Select next interval
startTime = Get starting point of interval

while startTime <> initialStartTime
    if startTime <> 0
        Move to nearest zero crossing
        cnt = cnt + 1
    endif
    Select next interval
    startTime = Get starting point of interval
endwhile

clearinfo
writeInfoLine: string$(cnt) + " intervals zero crossed"

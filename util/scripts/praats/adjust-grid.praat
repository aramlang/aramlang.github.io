form Get Adjustment Number
    comment Please enter a positive or negative floating adjustment number:
    real adjustment_number 0.001
endform

selectObject: selected("TextGrid")
numberOfTiers = Get number of tiers

if numberOfTiers < 2
    exit "The TextGrid must have at least two tiers."
endif

# Get the name of the first tier
tierName$ = Get tier name: 1

# Get the number of intervals in the first tier
numberOfIntervals = Get number of intervals: 1

# Add a new tier after the first tier
Insert interval tier: 2, tierName$

# Loop through each interval in the first tier
for interval to numberOfIntervals
    # Get end time from the first tier
    endTime = Get end time of interval: 1, interval
    # Insert adjusted boundary at the end time if not last interval
    if interval < numberOfIntervals
        Insert boundary: 2, endTime + adjustment_number
    endif

    # Get label from the first tier
    label$ = Get label of interval: 1, interval
    # Set the label for the new tier
     Set interval text: 2, interval, label$
endfor

# Remove the original first tier
Remove tier: 1

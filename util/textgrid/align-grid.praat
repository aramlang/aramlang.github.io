selectObject: selected("TextGrid")
numberOfTiers = Get number of tiers

if numberOfTiers < 2
    exit "The TextGrid must have at least two tiers."
endif

# Assuming you have a TextGrid with at least two tiers

# Get the name of the second tier
tierName$ = Get tier name: 2

# Get the number of intervals in the first tier
numberOfIntervals = Get number of intervals: 1

# Add a new tier after the first tier
Insert interval tier: 2, tierName$

# Loop through each interval in the first tier
for interval to numberOfIntervals
    endTime = Get end time of interval: 1, interval

    # Insert boundary at the start time if not the first interval
    if interval < numberOfIntervals
        Insert boundary: 2, endTime
    endif

    # Get label from the second tier (which is now the third tier)
    label$ = Get label of interval: 3, interval

    # Set the label for the new tier
    Set interval text: 2, interval, label$
endfor

# Remove the original second tier (which is now the third tier)
Remove tier: 3

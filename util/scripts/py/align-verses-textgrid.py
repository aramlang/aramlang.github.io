import textgrid
import sys

def align_intervals_with_words(textgrid_path):
    # Load the TextGrid file
    tg = textgrid.TextGrid.fromFile(textgrid_path)

    # Get the "Verses" tier
    words_tier = tg.getFirst('Verse')

    # Iterate through all tiers except "Verse"
    for tier in tg:
        if tier.name not in ['Verse']:
            for i, interval in enumerate(tier):
                # Align the interval with the corresponding "Verse" interval
                corresponding_word_interval = words_tier[i]
                interval.minTime = corresponding_word_interval.minTime
                interval.maxTime = corresponding_word_interval.maxTime

    # Overwrite the original TextGrid file with the modified version
    tg.write(textgrid_path)

# Usage: python align-textgrid.py path_to_your.TextGrid
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python align-textgrid.py path_to_your.TextGrid")
        sys.exit(1)

    textgrid_path = sys.argv[1]
    align_intervals_with_words(textgrid_path)

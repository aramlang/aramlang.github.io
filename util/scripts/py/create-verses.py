import argparse
import textgrid
from pydub import AudioSegment

def get_audio_length(audio_file):
    audio = AudioSegment.from_file(audio_file)
    return len(audio) / 1000.0  # Convert to seconds

def create_textgrid(num_intervals, audio_file):
    audio_length = get_audio_length(audio_file)
    interval_duration = audio_length / num_intervals
    output_file = audio_file.rsplit('.', 1)[0] + '.TextGrid'

    tg = textgrid.TextGrid()

    # Create the 'Verse' tier
    verse_tier = textgrid.IntervalTier(name='Verse', minTime=0, maxTime=audio_length)
    for i in range(num_intervals):
        start_time = i * interval_duration
        end_time = start_time + interval_duration
        verse_tier.addInterval(textgrid.Interval(start_time, end_time, "Verse_" + str(i+1)))

    # Create the 'VerseNo' tier
    verse_no_tier = textgrid.IntervalTier(name='VerseNo', minTime=0, maxTime=audio_length)
    for i in range(num_intervals):
        start_time = i * interval_duration
        end_time = start_time + interval_duration
        verse_no_tier.addInterval(textgrid.Interval(start_time, end_time, str(i+1)))

    tg.append(verse_tier)
    tg.append(verse_no_tier)

    tg.write(output_file)

def main():
    parser = argparse.ArgumentParser(description="Create a TextGrid file based on an audio file.")
    parser.add_argument("audio_file", type=str, help="Audio file")
    parser.add_argument("num_intervals", type=int, help="Number of intervals")

    args = parser.parse_args()

    create_textgrid(args.num_intervals, args.audio_file)

if __name__ == "__main__":
    main()

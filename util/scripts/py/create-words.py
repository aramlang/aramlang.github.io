import re
import sys
import textgrid
from pydub.utils import mediainfo

def create_textgrid(aramaic_sentence, audio_file_size, output_filename):
    # Split the sentence into words
    words = aramaic_sentence.split()

    # Calculate the duration of each interval
    interval_duration = audio_file_size / len(words)

    # Create a TextGrid object
    tg = textgrid.TextGrid()

    # Add the "Words" tier
    words_tier = textgrid.IntervalTier(name="Words", minTime=0, maxTime=audio_file_size)
    for i, word in enumerate(words):
        start_time = i * interval_duration
        end_time = (i + 1) * interval_duration
        words_tier.add(start_time, end_time, word)
    tg.append(words_tier)

    # Add the "Inter" tier
    inter_tier = textgrid.IntervalTier(name="Inter", minTime=0, maxTime=audio_file_size)
    for i in range(len(words)):
        start_time = i * interval_duration
        end_time = (i + 1) * interval_duration
        inter_tier.add(start_time, end_time, "")
    tg.append(inter_tier)

    # Add the "Segment" tier
    segment_tier = textgrid.IntervalTier(name="Segment", minTime=0, maxTime=audio_file_size)
    segment_tier.add(0, audio_file_size, aramaic_sentence)
    tg.append(segment_tier)

    # Save the TextGrid file
    tg.write(output_filename)

def get_audio_length(audio_file):
    info = mediainfo(audio_file)
    duration = float(info["duration"])
    return duration

def extract_verse_number(filename):
    match = re.search(r'_(\d{2})\.', filename)  
    return match.group(1) if match else None

if __name__ == '__main__':
    input_filename = sys.argv[1]
    chapter_filename = input_filename[:-4]
    chapter_text_grid = 'wav/' + chapter_filename + '.TextGrid'
    verse_number = int(extract_verse_number(input_filename))
        
    # Load Chapter TextGrid file
    tg = textgrid.TextGrid.fromFile(chapter_text_grid)  
    # Get the "Verse" tier
    verse_tier = tg.getFirst('Verse')
    verse_interval = verse_tier[verse_number]
    
    aramaic_sentence = verse_interval.mark   
    audio_length = get_audio_length('wav/' + input_filename + 'wav')
    output_filename = 'wav/' + input_filename + 'TextGrid'

    textgrid_content = create_textgrid(aramaic_sentence, audio_length, output_filename)

    print(f"TextGrid file saved as {output_filename}")

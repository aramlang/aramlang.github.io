import re
import sys
from textgrid import TextGrid
from string import Template
from pydub import AudioSegment
import os

out_folder = 'out'


def extract_verse_number(filename):
    match = re.search(r'_(\d{2})\.', filename)
    return match.group(1) if match else None


def extract_chapter_number(filename):
    match = re.search(r'_(\d{2})_\d{2}\.', filename)
    return match.group(1) if match else None


def process_textgrid(file_path):
    tg = TextGrid.fromFile(file_path)
    # Get the "Words" tier
    words_tier = tg.getFirst('Words')
    inter_tier = tg.getFirst('Inter')

    timestamps = []
    words = []
    for i, word_interval in enumerate(words_tier):
        # Align the interval with the corresponding "Words" interval
        words_interval = words_tier[i]
        inter_interval = inter_tier[i]
        if word_interval.minTime == 0.0:
            xmin = 0.5
        else:
            xmin = word_interval.minTime
            timestamps.append(xmin * 1000)
        xmax = word_interval.maxTime

        word = {
            'w': words_interval.mark,   # Words
            'i': inter_interval.mark,   # Inter
            't': {  # xmin from the Words interval
                's': xmin,
                'e': xmax
            }
        }
        words.append(word)
    return [words, timestamps]


def insert_blanks_in_audio(timestamps, audio_file_name):
    # Load the audio file
    audio = AudioSegment.from_file('wav' + audio_file_name + '.wav')

    # Create a 1-second silent audio segment
    one_second_silence = AudioSegment.silent(duration=1000)

    # Initialize the output audio
    output_audio = AudioSegment.empty()

    last_end = 0
    for timestamp in timestamps:
        # Add the current segment with fade out
        segment = audio[last_end:timestamp].fade_out(50)
        output_audio += segment

        # Add the silent segment
        output_audio += one_second_silence

        # Update the last end point
        last_end = timestamp

    # Add the last segment with fade in
    final_segment = audio[last_end:].fade_in(50)
    output_audio += final_segment

    # Append a final 1-second silence
    output_audio += one_second_silence

    # Extract file name from path and prepend 'P_'
    new_file_name = out_folder + "/P_" + os.path.basename(audio_file_name)

    # Save the output audio
    output_audio.export(new_file_name + '.m4a', format='ipod')
    output_audio.export(new_file_name + '.mp3', format='mp3')


def create_javascript_file(words, filename):
    verse_number = int(extract_verse_number(filename))
    file_template = Template(
        '      [ // Verse $verse_number\n        { w: "$aramaic_verse_number" },\n$content      ],\n')
    content_template = Template(
        '        {\n          w: "$w",\n          i: "$i",\n          t: { s: $s, e: $e }\n        }')
    content = ''
    for index, word in enumerate(words):
        content = content + content_template.substitute(w=word["w"], i=word["i"],
                                                        s=word["t"]["s"], e=word["t"]["e"]) + ('\n' if index == len(words) - 1 else ',\n')

    file_content = file_template.substitute(
        verse_number=verse_number, aramaic_verse_number=_numbers[verse_number], content=content)
    with open(out_folder + filename, 'w', encoding='utf-8') as f:
        f.write(file_content)


def create_html_file(words, filename):
    verse = int(extract_verse_number(filename))
    html_template = Template('''    <div class="row">
      <div class="col">
        <div class="no">
          <a href="#" title="Go Up" lang="syc" class="syr r">$aramaic_verse&nbsp;</a><br>
          <a href="#" title="Go Up" class="enn">$verse&nbsp;</a>
        </div>
      </div>
$content    </div>
''')
    content = ''
    for word, _ in enumerate(words, start=1):
        content = content + f'''      <div class="col">
        <div id="{verse}-{word}w" lang="syc" class="syr t"></div>
        <div id="{verse}-{word}i" class="eng"></div>
      </div>
'''
    html_aramaic_verse = f'<span id="{verse}-0w">{_numbers[verse]}</span>'
    if len(_numbers[verse]) == 1:
        html_aramaic_verse += '&nbsp;'
    html_verse = str(verse)
    if len(html_verse) == 1:
        html_verse += '&nbsp;'

    html_content = html_template.substitute(
        aramaic_verse=html_aramaic_verse, verse=html_verse, content=content)
    with open(out_folder + filename, 'w', encoding='utf-8') as f:
        f.write(html_content)


def create_directory_if_not_exists(directory_name):
    # Check if the directory already exists
    if not os.path.exists(directory_name):
        # Create the directory
        os.makedirs(directory_name)


_numbers = {
    1: "ܐ",
    2: "ܒ",
    3: "ܓ",
    4: "ܕ",
    5: "ܗ",
    6: "ܘ",
    7: "ܙ",
    8: "ܚ",
    9: "ܛ",
    10: "ܝ",
    11: "ܝܐ",
    12: "ܝܒ",
    13: "ܝܓ",
    14: "ܝܕ",
    15: "ܝܗ",
    16: "ܝܘ",
    17: "ܝܙ",
    18: "ܝܚ",
    19: "ܝܛ",
    20: "ܟ",
    21: "ܟܐ",
    22: "ܟܒ",
    23: "ܟܓ",
    24: "ܟܕ",
    25: "ܟܗ",
    26: "ܟܘ",
    27: "ܟܙ",
    28: "ܟܚ",
    29: "ܟܛ",
    30: "ܠ",
    31: "ܠܐ",
    32: "ܠܒ",
    33: "ܠܓ",
    34: "ܠܕ",
    35: "ܠܗ",
    36: "ܠܘ",
    37: "ܠܙ",
    38: "ܠܚ",
    39: "ܠܛ",
    40: "ܡ",
    41: "ܡܐ",
    42: "ܡܒ",
    43: "ܡܓ",
    44: "ܡܕ",
    45: "ܡܗ",
    46: "ܡܘ",
    47: "ܡܙ",
    48: "ܡܚ",
    49: "ܡܛ",
    50: "ܢ"
}

# Main execution
if len(sys.argv) < 2:
    print("Usage: python extract-verse.py <filename>")
    sys.exit(1)

filename = sys.argv[1]
data = process_textgrid(filename)
words = data[0]
timestamps = data[1]

create_directory_if_not_exists(out_folder)
create_javascript_file(words, filename.replace('.TextGrid', '.js'))
create_html_file(words, filename.replace('.TextGrid', '.html'))
insert_blanks_in_audio(timestamps, filename.replace('.TextGrid', ''))

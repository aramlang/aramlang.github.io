import glob
import sys

def concatenate_files(pattern, output_file):
    """Concatenates files matching the pattern into a single file with Unicode support."""
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for filename in glob.glob(pattern):
            with open(filename, 'r', encoding='utf-8') as infile:
                outfile.write(infile.read())
                outfile.write("\n")  # Optional: adds a newline between files

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py [file_pattern] [output_file]")
        sys.exit(1)

    file_pattern = sys.argv[1]
    output_filename = sys.argv[2]

    concatenate_files(file_pattern, output_filename)
    print(f"All files matching {file_pattern} have been concatenated into {output_filename}")

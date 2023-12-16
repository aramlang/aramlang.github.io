def compare_sentences():
    # Reading sentences from input
    sentence1 = input("Enter the first sentence (space-separated): ")
    sentence2 = input("Enter the second sentence (tab-separated): ")

    # Splitting the first sentence by spaces and the second by tabs
    words_sentence1 = sentence1.split(' ')
    words_sentence2 = sentence2.split('\t')

    # Getting the number of words in each sentence
    size_sentence1 = len(words_sentence1)
    size_sentence2 = len(words_sentence2)

    # Printing the sizes
    print(f"Number of words in sentence 1: {size_sentence1}")
    print(f"Number of words in sentence 2: {size_sentence2}\n")

    # Checking if the sizes are equal and printing a warning if not
    if size_sentence1 != size_sentence2:
        print("WARNING: The number of words in the two sentences are not equal!")

# Running the function
compare_sentences()

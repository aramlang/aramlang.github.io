include commons.praat

.workPath$ = environment$("PRAAT-WORK-DIR")
writeInfoLine: .workPath$
@getSlashChapter: .workPath$
basePath$ = .workPath$ + getSlashChapter.result$
wavFile$ = basePath$ + ".wav"
textGridFile$ = basePath$ + ".TextGrid"

Read from file: wavFile$
if fileReadable(textGridFile$)
  Read from file: textGridFile$
endif

select all
View & Edit

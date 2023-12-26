include commons.praat

editorNfo$ = Editor info
@assureFirstTier editorNfo$

@extractNfoValue: editorNfo$, "Data name: "
dateName$ = extractNfoValue.result$
lastUScore = rindex(dateName$, "_")
isTorah = length(mid$(dateName$, lastUScore + 1, length(dateName$) - lastUScore)) == 3

if isTorah == 1
  Select next tier
  Select next tier
  Select next tier
  Select next tier
  Select next tier
  verseTier = 6 ; Torah has the verse at tier #6
else
  Select next tier
  Select next tier
  verseTier = 3 ; Peshitta has the verse at tier #3
endif

verse$ = Get label of interval
@isNumeric: verse$
if isNumeric.result == 0
  exitScript: "Expected a verse number at tier #" + string$(verseTier) + " but found " + "'" + verse$ + "'" + newline$
endif

Select next tier
Select next tier
fileBaseName$ = Get label of interval
textGridFile$ = fileBaseName$ + ".TextGrid"

# TODO go back to 1st tier and selected interval

Save whole TextGrid as text file: textGridFile$

clearinfo

lastSlash = rindex(fileBaseName$, "/")
fileName$ = right$(fileBaseName$, length(fileBaseName$) - lastSlash)
folderName$ = left$(fileBaseName$, lastSlash)
appendInfoLine: "fileName$: " + fileName$
appendInfoLine: "folderName$: " + folderName$
exit

uScores = 0
len = length(fileName$)
for i from 1 to len
  if (mid$(fileName$, i, 1) = "_")
    uScores = uScores + 1
  endif
endfor

# is it a chapter file
if uScores == 2
  wavFile$ = fileBaseName$ + "_" + verse$ + ".wav"
  Save selected sound as WAV file: wavFile$
  clearinfo
  writeInfoLine: verse$
else
  outPath$ = folderName$ + "out/"
  appendInfoLine: outPath$
  exit
  command$ = "mkdir '" + outPath$ + "'"
  runSystem: command$
  
  if length(verse$) = 3
    htmlTemplate$ = "    <div class=""verse"">" + newline$ +
... "      <div class=""verse-number"">" + newline$ +
... "        <div class=""no"">" + newline$ +
... "          <a href=""#"" title=""Go Up"" lang=""he"" class=""heb r"">{hebrew_verse}</a><br>" + newline$ +
... "          <a href=""#"" title=""Go Up"" class=""enn"">{verse}</a>" + newline$ +
... "        </div>" + newline$ + 
... "        <div class=""tran hide""><a href=""#"" title=""Go Up"">&nbsp;&nbsp;</a></div>" + newline$ +
... "      </div>" + newline$ +
... "      <div class=""verse-text"">" + newline$ +
... "{content}      </div>" + newline$ +
... "    </div>" + newline$
    parshatTemplate$ = "        <div class=""col"">" + newline$ +
... "          <div id=""{verse}-{word}w"" lang=""he"" class=""parsh heb t"">{parshat}</div>" + newline$ +
... "          <div id=""{verse}-{word}i"" class=""eng parsh"">&nbsp;</div>" + newline$ +
... "          <div id=""{verse}-{word}t"" class=""tran parsh hide"">{parshat_translit}</div>" + newline$ +
... "        </div>" + newline$
    contentTemplate$ = "        <div class=""col"">" + newline$ +
... "          <div id=""{verse}-{wordNo}w"" lang=""he"" class=""heb t""></div>" + newline$ +
... "          <div id=""{verse}-{wordNo}i"" class=""eng"">{word}</div>" + newline$ +
... "          <div id=""{verse}-{wordNo}t"" class=""tran hide""></div>" + newline$ +
... "        </div>" + newline$
  else
    htmlTemplate$ = "    <div class=""verse"">" + newline$ +
... "      <div class=""verse-number"">" + newline$ +
... "        <div class=""no"">" + newline$ +
... "          <a href=""#"" title=""Go Up"" lang=""syc"" class=""syr r""><span id=""{verse}-0w""></span></a><br>" + newline$ +
... "          <a href=""#"" title=""Go Up"" class=""enn"">{verse}</a>" + newline$ +
... "        </div>" + newline$ +
... "      </div>" + newline$ +
... "      <div class=""verse-text"">" + newline$ +
... "{content}      </div>" + newline$ +
... "    </div>" + newline$    
    contentTemplate$ = "        <div class=""col"">" + newline$ +
... "          <div id=""{verse}-{wordNo}w"" lang=""syc"" class=""syr t{punctuation_class}""></div>" + newline$ +
... "          <div id=""{verse}-{wordNo}i"" class=""eng"">{word}</div>" + newline$ +
... "        </div>" + newline$    
  endif
endif

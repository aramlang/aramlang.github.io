include commons.praat

editorNfo$ = Editor info
@assureFirstTier: editorNfo$

@extractNfoValue: editorNfo$, "Data name: "
fileName$ = extractNfoValue.result$
lastUScore = rindex(fileName$, "_")
isTorah = length(mid$(fileName$, lastUScore + 1, length(fileName$) - lastUScore)) == 3

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

if isTorah == 0
  # TODO go back selected interval
endif

folderName$ = environment$("PRAAT_WORK")
fileBaseName$ = folderName$ + fileName$
textGridFile$ = fileBaseName$ + ".TextGrid"

Save whole TextGrid as text file: textGridFile$

@uscores: fileName$

# is it a chapter file
if uscores.count == 2
  wavFile$ = fileBaseName$ + "_" + verse$ + ".wav"
  Save selected sound as WAV file: wavFile$
  clearinfo
  writeInfo: verse$
else
  outPath$ = folderName$ + "out/"
  appendInfoLine: outPath$
  exit
  command$ = "mkdir '" + outPath$ + "' 2>nul"
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

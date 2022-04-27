
const map = {
  [atorPunct.newLine]: punct.newLine,
  [atorPunct.space]: punct.space,
  [atorLetter.sadheNun]: function (group) {  //punct.harkleanAsteriscus for east assyrian font?
    group.letter = letter.sadhe;
    group.secondLetter = letter.nun;
  },
  [atorPunct.tatweel]: punct.tatweel,
  [atorPunct.parenLeft]: punct.parenLeft,
  [atorPunct.parenRight]: punct.parenRight,
  [atorPunct.one]: punct.one,
  [atorPunct.arabicComma]: punct.arabicComma,

  [atorLetter.alap]: letter.alap,
  [atorLetter.alapMedial]: letter.alap,
  [atorLetter.alapMedial1]: letter.alap,
  [atorLetter.alapFinal]: letter.alap,
  [atorLetter.alapFinal1]: letter.alap,
  [atorHamza.alaphSuperscript]: hamza.alaphSuperscript,

  [atorLetter.beth]: letter.beth,
  [atorLetter.bethLeft]: letter.beth,
  [atorLetter.bethBoth]: letter.beth,
  [atorLetter.bethFinal]: letter.beth,

  [atorLetter.gamal]: letter.gamal,
  [atorLetter.gamalLeft]: letter.gamal,
  [atorLetter.gamalBoth]: letter.gamal,
  [atorLetter.gamalFinal]: letter.gamal,

  [atorLetter.dalath]: letter.dalath,
  [atorLetter.dalathJoined]: letter.dalath,

  [atorLetter.he]: letter.he,
  [atorLetter.heJoined]: letter.he,

  [atorLetter.waw]: letter.waw,
  [atorLetter.wawJoined]: letter.waw,

  [atorLetter.zain]: letter.zain,
  [atorLetter.zainJoined]: letter.zain,

  [atorLetter.heth]: letter.heth,
  [atorLetter.hethLeft]: letter.heth,
  [atorLetter.hethBoth]: letter.heth,
  [atorLetter.hethFinal]: letter.heth,

  [atorLetter.teth]: letter.teth,
  [atorLetter.tethLeft]: letter.teth,
  [atorLetter.tethBoth]: letter.teth,
  [atorLetter.tethFinal]: letter.teth,

  [atorLetter.yudh]: letter.yudh,
  [atorLetter.yudhLeft]: letter.yudh,
  [atorLetter.yudhBoth]: letter.yudh,
  [atorLetter.yudhFinal]: letter.yudh,

  [atorLetter.kaph]: letter.kaph,
  [atorLetter.kaphLeft]: letter.kaph,
  [atorLetter.kaphBoth]: letter.kaph,
  [atorLetter.kaphFinal]: letter.kaph,

  [atorLetter.lamadh]: letter.lamadh,
  [atorLetter.lamadhLeft]: letter.lamadh,
  [atorLetter.lamadhBoth]: letter.lamadh,
  [atorLetter.lamadhFinal]: letter.lamadh,

  [atorLetter.mim]: letter.mim,
  [atorLetter.mimLeft]: letter.mim,
  [atorLetter.mimBoth]: letter.mim,
  [atorLetter.mimFinal]: letter.mim,

  [atorLetter.nun]: letter.nun,
  [atorLetter.nunLeft]: letter.nun,
  [atorLetter.nunBoth]: letter.nun,
  [atorLetter.nunFinal]: letter.nun,

  [atorLetter.semkath]: letter.semkath,
  [atorLetter.semkathLeft]: letter.semkath,
  [atorLetter.semkathBoth]: letter.semkath,
  [atorLetter.semkathFinal]: letter.semkath,

  [atorLetter.e]: letter.e,
  [atorLetter.eLeft]: letter.e,
  [atorLetter.eBoth]: letter.e,
  [atorLetter.eFinal]: letter.e,

  [atorLetter.pe]: letter.pe,
  [atorLetter.peLeft]: letter.pe,
  [atorLetter.peBoth]: letter.pe,
  [atorLetter.peFinal]: letter.pe,

  [atorLetter.sadhe]: letter.sadhe,
  [atorLetter.sadheJoined]: letter.sadhe,

  [atorLetter.qaph]: letter.qaph,
  [atorLetter.qaphLeft]: letter.qaph,
  [atorLetter.qaphBoth]: letter.qaph,
  [atorLetter.qaphBoth]: letter.qaph,

  [atorPunct.endOfParagraph]: punct.endOfParagraph,
  [atorPunct.colonSkewedLeft]: punct.colonSkewedLeft,
  [atorPunct.arabicSemicolon]: punct.arabicSemicolon,
  [atorPunct.period]: punct.period,
  [atorSyame.combiningDiaeresis]: syame.combiningDiaeresis,
  [atorSyame.combiningDiaeresis1]: syame.combiningDiaeresis,
  [atorVowel.rwaha]: function (group) {
    // TODO it has overloaded meanings test well
    switch (group.letter) {
      case letter.waw:
        group.vowel = vowel.rwaha;
        break;
      case letter.beth:
      case letter.gamal:
      case letter.dalath:
      case letter.kaph:
      case letter.pe:
      case letter.taw:
        group.spirant = spirant.qushshaya;
        break;
      default:
        group.mark = mark.combiningDotAbove;
        break;
    }
  },
  [atorMark.combiningDotBelow]: mark.combiningDotBelow,
  [atorVowel.hbasaEsataDotted]: function (group, nextChar) {
    // TODO it has overloaded meanings test well
    switch (group.letter) {
      case letter.waw:
      case letter.yudh:
        group.vowel = vowel.hbasaEsataDotted;
        break;
      case letter.kaph:
        group.mark = map[nextChar] == letter.lamadh // account for KUL
          ? mark.combiningDotBelow
          : spirant.rukkakha;
        break;
      case letter.beth:
      case letter.gamal:
      case letter.dalath:
      case letter.pe:
      case letter.taw:
        group.spirant = spirant.rukkakha;
        break;
      default:
        group.mark = mark.combiningDotBelow;
        break;
    }
  },
  [atorVowel.zqaphaDotted]: vowel.zqaphaDotted,
  [atorVowel.zqaphaDotted1]: vowel.zqaphaDotted,
  [atorVowel.zqaphaDotted2]: vowel.zqaphaDotted,
  [atorVowel.zqaphaDotted3]: vowel.zqaphaDotted,
  [atorVowel.zlamaDottedAngular]: vowel.zlamaDottedAngular,
  [atorVowel.zlamaDottedAngular1]: vowel.zlamaDottedAngular,
  [atorVowel.zlamaDottedHorizontal]: vowel.zlamaDottedHorizontal,
  [atorVowel.zlamaDottedHorizontal1]: vowel.zlamaDottedHorizontal,
  [atorVowel.pthahaDotted]: vowel.pthahaDotted,
  [atorVowel.pthahaDotted1]: vowel.pthahaDotted,
  [atorVowel.pthahaDotted2]: vowel.pthahaDotted,
  [atorMark.feminineDot]: mark.feminineDot,
  [atorSpirant.qushshaya]: mark.combiningDotAbove,
  [atorSpirant.rukkakha]: spirant.rukkakha,  // Ouch: vowel.hbasaEsataDotted for EastAssyrian?
  [atorSpirant.combiningBreveBelow]: spirant.combiningBreveBelow,
  [atorMark.obliqueLineAbove]: mark.obliqueLineAbove,
  [atorMark.obliqueLineAbove1]: mark.obliqueLineAbove,
  [atorMark.cedilla]: mark.cedilla,
  [atorMark.combiningMacron]: mark.combiningMacron,
  [atorMark.combiningMacronBellow]: mark.combiningMacronBellow,
  [atorMark.combiningMacronBellow1]: mark.combiningMacronBellow,
  [atorPunct.cross]: punct.cross,
  [atorLetter.finalTawAlapJoined]: function (group) {
    group.letter = letter.taw;
    group.secondLetter = letter.alap;
  },
  [atorLetter.finalTawAlapUnjoined]: function (group) {
    group.letter = letter.taw;
    group.secondLetter = letter.alap;
  },
  [atorLetter.shin]: letter.shin,
  [atorLetter.shinLeft]: letter.shin,
  [atorLetter.shinBoth]: letter.shin,
  [atorLetter.shinFinal]: letter.shin,

  [atorLetter.taw]: letter.taw,
  [atorLetter.tawJoined]: letter.taw,

  [atorVowel.zlamaDottedAngular2]: vowel.zlamaDottedAngular,

  [atorLetter.rish]: letter.rish,
  [atorLetter.rishJoined]: letter.rish,
  [atorLetter.dalathRishDotless]: letter.dalathRishDotless,

  [atorLetter.heYod]: function (group) {
    group.letter = letter.he;
    group.secondLetter = letter.yudh;
  },

  [atorLetter.lamadhAlap]: function (group) {
    group.letter = letter.lamadh;
    group.secondLetter = letter.alap;
  },
  [atorLetter.lamadhAlapJoined]: function (group) {
    group.letter = letter.lamadh;
    group.secondLetter = letter.alap;
  },
  [atorLetter.rishSyame]: function (group) {
    group.letter = letter.rish;
    group.syame = syame.combiningDiaeresis;
  },
  [atorLetter.rishSyame1]: function (group) {
    group.letter = letter.rish;
    group.syame = syame.combiningDiaeresis;
  }
};

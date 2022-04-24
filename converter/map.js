
const map = {
  [atorPunct.space]: punct.space,
  [atorLetter.sadheNun]: punct.harkleanAsteriscus, // according to assyrian font
  [atorPunct.tatweel]: punct.tatweel,
  [atorPunct.parenLeft]: punct.parenLeft,
  [atorPunct.parenRight]: punct.parenRight,
  [atorPunct.one]: punct.one,
  [atorPunct.arabicComma]: punct.arabicComma,

  [atorLetter.alap]: letter.alap,
  [atorLetter.alapMedial]: letter.alap,

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

  [atorLetter.wow]: letter.wow,
  [atorLetter.wowJoined]: letter.wow,

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

  [atorPunct.endOfParagraph]: punct.endOfParagraph,
  [atorPunct.colonSkewedLeft]: punct.colonSkewedLeft,
  [atorPunct.arabicSemicolon]: punct.arabicSemicolon,
  [atorPunct.period]: punct.period,
  [atorSyame.combiningDiaeresis]: syame.combiningDiaeresis,
  [atourVowel.rwaha]: function (group) {
    // TODO it has overloaded meanings test well
    switch (group.letter) {
      case letter.wow:
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
  [atourVowel.hbasaEsataDotted]: function (group) {
    // TODO it has overloaded meanings test well
    switch (group.letter) {
      case letter.wow:
      case letter.yudh:
        group.vowel = vowel.hbasaEsataDotted;
        break;
      case letter.beth:
      case letter.gamal:
      case letter.dalath:
      case letter.kaph:
      case letter.pe:
      case letter.taw:
        group.spirant = spirant.rukkakha;
        break;
      default:
        group.mark = mark.combiningDotBelow;
        break;
    }
  },
  [atourVowel.zqaphaDotted]: vowel.zqaphaDotted,
  [atourVowel.zqaphaDotted1]: vowel.zqaphaDotted,
  [atourVowel.zqaphaDotted2]: vowel.zqaphaDotted,
  [atourVowel.zqaphaDotted3]: vowel.zqaphaDotted,
  [atourVowel.zlamaDottedAngular]: vowel.zlamaDottedAngular,
  [atourVowel.zlamaDottedAngular1]: vowel.zlamaDottedAngular,
  [atourVowel.zlamaDottedHorizontal]: vowel.zlamaDottedHorizontal,
  [atourVowel.zlamaDottedHorizontal1]: vowel.zlamaDottedHorizontal,
  [atourVowel.pthahaDotted]: vowel.pthahaDotted,
  [atourVowel.pthahaDotted1]: vowel.pthahaDotted,
  [atourVowel.pthahaDotted2]: vowel.pthahaDotted,
  [atourMark.feminineDot]: mark.feminineDot,
  [atorSpirant.qushshaya]: spirant.qushshaya,
  [atorSpirant.rukkakha]: spirant.rukkakha,
  [atourMark.obliqueLineAbove]: mark.obliqueLineAbove,
  [atourMark.obliqueLineAbove1]: mark.obliqueLineAbove,
  [atourMark.cedilla]: mark.cedilla,
  [atourMark.combiningMacron]: mark.combiningMacron,
  [atourMark.combiningMacronBellow]: mark.combiningMacronBellow,
  [atourMark.combiningMacronBellow1]: mark.combiningMacronBellow,
  [atorLetter.alaphSuperscript]: letter.alaphSuperscript,
  [atorPunct.cross]: punct.cross,
  [atorLetter.finalTawAlapJoined]: function(group) {
    group.letter = letter.taw;
    group.secondLetter = letter.alap;
  },
  [atorLetter.finalTawAlapUnjoined]: function(group) {
    group.letter = letter.taw;
    group.secondLetter = letter.alap;
  },
  [atorLetter.shin]: letter.shin,
  [atorLetter.taw]: letter.taw,
  
}

function inverse(obj){
  var retobj = {};
  for(var key in obj){
    retobj[obj[key]] = key;
  }
  return retobj;
}

const punctuation = {
  space: 0x20,               // space
  parenLeft: 0x28,           // (
  parenRight: 0x29,          // )
  one: 0x31,                 // 1
  nonBreakingHyphen: 0x2010, // ‑
  arabicComma: 0x60C,        // ،
  arabicSemicolon: 0x61B,    // ؛
  arabicQuestionMark: 0x61F, // ؟
  westSyriacCross: 0x2670,   // ♰
  eastSyriacCross: 0x2671,   // ♱

  endOfParagraph: 0x700,             // ܀
  supralinearFullStop: 0x701,        // ܒ ܁
  sublinearFullStop: 0x702,          // ܒ܂
  supralinearColon: 0x703,           // ܒ ܃
  sublinearColon: 0x704,             // ܒ܄
  horizontalColon: 0x705,            // ܒ܅ 
  colonSkewedLeft: 0x706,            // ܒ܆
  colonSkewedRight: 0x707,           // ܒ܇
  supralinearColonSkewedLeft: 0x708, // ܒ܈
  sublinearColonSkewedRight: 0x709,  // ܒ܉
  sublinearColonSkewedRight: 0x709,  // ܒ܉
  contraction: 0x70A,                // ܊
  harkleanObelus: 0x70B,             // ܋
  harkleanMetobelus: 0x70C,          // ܌
  harkleanAsteriscus: 0x70D,         // ܍
  abbreviationMark: 0x70F            // ܏
};

const arabicLetterMark = 0x61C;   // invisible

const letter = {
  alaph: 0x710,             // ܐ
  alaphSuperscript: 0x711,  // ܑ
  beth: 0x712,              // ܒ
  gamal: 0x713,             // ܓ
  gamalGarshuni: 0x714,     // ܔ
  dalath: 0x715,            // ܕ
  dalathRishDotless: 0x716, // ܖ
  he: 0x717,                // ܗ
  waw: 0x718,               // ܘ
  zain: 0x719,              // ܙ
  heth: 0x71A,              // ܚ
  teth: 0x71B,              // ܛ
  tethGarshuni: 0x71C,      // ܜ
  yudh: 0x71D,              // ܝ
  yudhHe: 0x71E,            // ܞ
  kaph: 0x71F,              // ܟ
  lamadh: 0x720,            // ܠ
  mim: 0x721,               // ܡ
  nun: 0x722,               // ܢ
  semkath: 0x723,           // ܣ
  semkathFinal: 0x724,      // ܤ
  e: 0x725,                 // ܥ
  pe: 0x726,                // ܦ
  peReversed: 0x727,        // ܧ
  sadhe: 0x728,             // ܨ
  qaph: 0x729,              // ܩ
  rish: 0x72A,              // ܪ
  shin: 0x72B,              // ܫ
  taw: 0x72C,               // ܬ
  bhethPersian: 0x72D,      // ܭ
  ghamalPersian: 0x72E,     // ܮ
  dhalathPersian: 0x72F,    // ܯ
  zhainSogdian: 0x74D,      // ݍ
  khaphSogdian: 0x74E,      // ݎ
  feSogdian: 0x74F          // ݏ
};

const diacritic = {
  combiningTilde: 0x303,        // ̃
  combiningDiaeresis: 0x308,    // ̈ 
  combiningTildeBelow: 0x330,   // ◌̰
  combiningDotBelow: 0x323,     // ̣
  combiningDiaeresisBelow: 0x324, // ̤
  feminineDot: 0x740,           // ܒ݀
  qushshaya: 0x741,             // ܒ݁
  rukkakha: 0x742,              // ܒ݂
  twoVerticalDotsAbove: 0x743,  // ܒ݃
  twoVerticalDotsBelow: 0x744,  // ܒ݄
  threeDotsAbove: 0x745,        // ܒ݅
  threeDotsBelow: 0x746,        // ܒ݆
  obliqueLineAbove: 0x747,      // ܒ݇
  obliqueLineBelow: 0x748,      // ܒ݈
  music: 0x749,                 // ܒ݉
  barrekh: 0x74A                // ܒ݊
};

const vowel = {
  pthahaAbove: 0x730,           // ܰ
  pthahaBelow: 0x731,           // ܱ
  pthahaDotted: 0x732,          // ܒܲ
  zqaphaAbove: 0x733,           // ܳ
  zqaphaBelow: 0x734,           // ܴ
  zqaphaDotted: 0x735,          // ܒܵ
  rbasaAbove: 0x736,            // ܶ
  rbasaBelow: 0x737,            // ܷ
  zlamaDottedHorizontal: 0x738, // ܒܸ
  zlamaDottedAngular: 0x739,    // ܒܹ
  hbasaAbove: 0x73A,            // ܺ
  hbasaBelow: 0x73B,            // ܻ
  hbasaEsataDotted: 0x73C,      // ܘܼ
  esasaAbove: 0x73D,            // ܽ
  esasaBelow: 0x73E,            // ܾ 
  rwaha: 0x73F                  // ܘܿ
}

const asciiToUnicode = {
  0x20: [punctuation.space],
  0x22: [punctuation.harkleanAsteriscus], // not sure for assyrian
  0x23: [punctuation.nonBreakingHyphen],
  0x28: [punctuation.parenLeft],
  0x29: [punctuation.parenRight],
  0x31: [punctuation.one],
  0x3A: [punctuation.arabicComma],
  0x40: [letter.alaph],
  0x41: [letter.alaph],
  0xCD: [letter.alaphSuperscript],
  0x2018: [letter.alaph],
  0x201C: [letter.alaph],
  0x201D: [letter.alaph],
  0x42: [letter.beth],
  0x43: [letter.beth],
  0x44: [letter.beth],
  0x45: [letter.beth],
  0x46: [letter.gamal],
  0x47: [letter.gamal],
  0x48: [letter.gamal],
  0x49: [letter.gamal],
  0x4A: [letter.dalath],
  0x4B: [letter.dalath],
  0x4C: [letter.he],
  0x4D: [letter.he],
  0x4E: [letter.waw],
  0x4F: [letter.waw],
  0x50: [letter.zain],
  0x51: [letter.zain],
  0x52: [letter.heth],
  0x53: [letter.heth],
  0x54: [letter.heth],
  0x55: [letter.heth],
  0x56: [letter.teth],
  0x57: [letter.teth],
  0x58: [letter.teth],
  0x59: [letter.teth],
  0x5A: [letter.yudh],
  0x5B: [letter.yudh],
  0x5C: [letter.yudh],
  0x5D: [letter.yudh],
  0x5E: [letter.kaph],
  0x5F: [letter.kaph],
  0x60: [letter.kaph],
  0x61: [letter.kaph],
  0x62: [letter.lamadh],
  0x63: [letter.lamadh],
  0x64: [letter.lamadh],
  0x65: [letter.lamadh],
  0x66: [letter.mim],
  0x67: [letter.mim],
  0x68: [letter.mim],
  0x69: [letter.mim],
  0x6A: [letter.nun],
  0x6B: [letter.nun],
  0x6C: [letter.nun],
  0x6D: [letter.nun],
  0x6E: [letter.semkath],
  0x6F: [letter.semkath],
  0x70: [letter.semkath],
  0x71: [letter.semkath],
  0x72: [letter.e],
  0x73: [letter.e],
  0x74: [letter.e],
  0x75: [letter.e],
  0x76: [letter.pe],
  0x77: [letter.pe],
  0x78: [letter.pe],
  0x79: [letter.pe],
  0x7A: [letter.sadhe],
  0x7B: [letter.sadhe],
  0x7C: [letter.qaph],
  0x7D: [letter.qaph],
  0x7E: [letter.qaph],
  0xE004: [letter.qaph],
  0x201A: [letter.rish],
  0xE001: [letter.rish],
  0xE002: [letter.rish, diacritic.combiningDiaeresis], // Resh Syame
  0xE003: [letter.rish, diacritic.combiningDiaeresis], // Resh Syame
  0x192: [letter.shin],
  0x201E: [letter.shin],
  0x2026: [letter.shin],
  0x2020: [letter.shin],
  0x2C6: [letter.taw],
  0x2021: [letter.taw],
  0x2030: [letter.dalathRishDotless],
  0x153: [letter.taw, letter.alaph],     // Final Taw Alap unatached
  0x161: [letter.taw, letter.alaph],     // Final Taw Alap atached
  0x2DC: [letter.lamadh, letter.alaph],  // Lamad Alap connected
  0x2014: [letter.lamadh, letter.alaph], // Lamad Alap unconnected
  0x2022: [letter.he, letter.yudh],      // He Yod
  0xAB: [punctuation.endOfParagraph],
  0xAC: [punctuation.colonSkewedRight],
  0xAE: [punctuation.arabicSemicolon],
  0xAF: [diacritic.combiningDotAbove],
  0xB7: [diacritic.zlamaDottedHorizontal],
  0xB0: [diacritic.combiningDiaeresis],
  0xB9: [diacritic.combiningDiaeresisBelow],
  0xD0: [diacritic.combiningDiaeresis],
  0xB8: [diacritic.pthahaDotted],
}

function isDiacritic(char) {
  switch (char) {
    case 0xAF:
    case 0xB7:
    case 0xB8:
      return true;
    default:
      return false;
  }
}

function isLetter(char) {
  switch (char) {
    case 0x40:
    case 0x41:
    case 0x42:
    case 0x43:
    case 0x44:
    case 0x45:
    case 0x46:
    case 0x47:
    case 0x48:
    case 0x49:
    case 0x4A:
    case 0x4B:
    case 0x4C:
    case 0x4D:
    case 0x4E:
    case 0x4F:
    case 0x50:
    case 0x51:
    case 0x52:
    case 0x53:
    case 0x54:
    case 0x55:
    case 0x56:
    case 0x57:
    case 0x58:
    case 0x59:
    case 0x5A:
    case 0x5B:
    case 0x5C:
    case 0x5D:
    case 0x5E:
    case 0x5F:
    case 0x60:
    case 0x61:
    case 0x62:
    case 0x63:
    case 0x64:
    case 0x65:
    case 0x66:
    case 0x67:
    case 0x68:
    case 0x69:
    case 0x6A:
    case 0x6B:
    case 0x6C:
    case 0x6D:
    case 0x6E:
    case 0x6F:
    case 0x70:
    case 0x71:
    case 0x72:
    case 0x73:
    case 0x74:
    case 0x75:
    case 0x76:
    case 0x77:
    case 0x78:
    case 0x79:
    case 0x7A:
    case 0x7B:
    case 0x7C:
    case 0x7D:
    case 0x7E:
    case 0x192:
    case 0x2C6:
    case 0x201A:
    case 0x2026:
    case 0x2020:
    case 0x2021:
    case 0x2030:
    case 0x2018:
    case 0x201C:
    case 0x201D:
    case 0xE001:
    case 0xE003:
    case 0xE004:
    case 0xCD:
    case 0x161:
    case 0x153:
    case 0x2DC:
    case 0x2022:
      return true;
    default:
      return false;
  }
}

function isPunctuation(char) {
  switch (char) {
    case 0x20:
    case 0x22: // need to see, might be a letter combination
    case 0x23:
    case 0x28:
    case 0x29:
    case 0x31:
    case 0x3A:
    case 0xAB:
    case 0xAC:
    case 0xAE:
      return true;
    default:
      return false;
  }
}

function hexaConvert(number) {
  var str = number.toString(16);
  return "0x" + str;
};

function isUnicodeSyame(char) {
  return char == diacritic.combiningDiaeresis || char == diacritic.combiningDiaeresisBelow;
}

function isSyame(char) {
  return char == 0xB0 || char == 0xB9 || char == 0xD0;
}

function isAspiration(char) {
  return null;
}

function mapChar(char, group) {
  var map = asciiToUnicode[char];
  var firstUnicode = map[0],
    secondUnicode = map[1],
    out,
    syame,
    secondLetter;

  if (isPunctuation(char)) {
    return String.fromCharCode(firstUnicode);
  }

  if (isLetter(char)) {
    if (secondUnicode) {
      if (isUnicodeSyame(secondUnicode)) {
        syame = String.fromCharCode(secondUnicode);
      }
      else {
        secondLetter = String.fromCharCode(secondUnicode);
      }
    }
    if (group.sya) {
      syame = group.sya;
    }

    out = String.fromCharCode(firstUnicode)
    if (group.asp) {
      out = out + group.asp;
    }
    if (syame) {
      out = out + syame;
    }
    if (group.dia) {
      out = out + group.dia;
    }
    if (secondLetter) {
      out = out + secondLetter;
    }
    return out;
  }

  if (isDiacritic(char)) {
    group.dia = String.fromCharCode(firstUnicode);
    return null;
  }

  if (isAspiration(char)) {
    group.asp = String.fromCharCode(firstUnicode);
    return null;
  }

  if (isSyame(char)) {
    group.sya = String.fromCharCode(firstUnicode);
  }

  return null;
}

/** @module calSyriac */
import { Writing, Mapper } from './aramaic-mapper.js';
import {
  allConsonants as calConsonants,
  vowels as calVowels,
  diacritics as calDiacritics,
  isVowel,
  isBdwlPrefix
} from './cal-code-util.js';
import {
  consonants as syriacConsonants,
  easternCommonVowels as easternSyriacCommonVowels,
  easternOnlyVowels as easternSyriacOnlyVowels,
  westernVowels as westernSyriacVowels,
  commonDiacritics as syriacDiacritics,
  consonantsByName as syriacConsonantsByName,
  easternVowelsByName as syriacEasternVowelsByName,
  westernVowelsByName as syriacWesternVowelsByName,
  diacriticsByName as syriacDiacriticsByName
} from './syriac-code-util.js';

/**
 * @private
 * CAL source writing
 * @const
 * @type { Writing }
 */
const calWriting = new Writing(calConsonants, calVowels, calDiacritics);

const reversedPe = '\u0727';
const horizontalColon = '\u0705'; // ܅ Syriac Horizontal Colon - joins two words closely together in a context to which a rising tone is suitable

/**
 * @private
 * Syriac destination writing with Eastern vowels
 * @const
 * @type { Writing }
 */
const easternSyriacWriting = new Writing(
  // + Palestinian and Hebrew Shin
  Object.freeze(
    syriacConsonants.concat(reversedPe, syriacConsonantsByName.semkath)
  ),
  Object.freeze(
    // duplicate the . under diacritic for i and u
    easternSyriacCommonVowels.concat(
      [syriacEasternVowelsByName.hbasaEsasa].concat(easternSyriacOnlyVowels)
    )
  ),
  syriacDiacritics.concat(syriacDiacriticsByName.breve)
);

const easternCallback = (word, i, fromTo) => {
  let m = '';
  const c = word.charAt(i);
  switch (c) {
    case '+':
      m = horizontalColon;
      break;
    default:
      m = map(c, fromTo);
      break;
  }
  return m;
}

/**
 * Aramaic Eastern Mapper
 * @const
 * @type { Mapper }
 */
export const easternMapper = new Mapper(calWriting, easternSyriacWriting, easternCallback);

/**
 * @private
 * Syriac destination writing with Western vowels
 * @const
 * @type { Writing }
 */
const westernSyriacWriting = new Writing(
  // + Palestinian and Hebrew Shin
  Object.freeze(
    syriacConsonants.concat(reversedPe, syriacConsonantsByName.semkath)
  ),
  // CAL eastern short E and O mapped to western Rbasa and Esasa respectively
  Object.freeze(
    westernSyriacVowels.concat(
      syriacWesternVowelsByName.rbasa,
      syriacWesternVowelsByName.esasa
    )
  ),
  syriacDiacritics.concat(syriacDiacriticsByName.rukkakha)
);

/**
 * @private
 * Return true Y|w+vowel is flipped a la Sedra
 * @param { string } word word to test
 * @param { number } index position in word to start checking from
 * @returns { boolean } true if Y|w+vowel is flipped
 */
const isYwFlipped = (word, index) => {
  if (index < 1) {
    return false; // can't start word with a vowel
  }
  if (isVowel(word.charAt(index - 1))) {
    return false; // can't follow vowel by vowel
  }
  if (word.charAt(index - 1) === ')') {
    return index === 1 || isBdwlPrefix(word, index - 2); // initial Alap is followed by vowel
  }
  return true;
};

/**
 * @private
 * Maps input character to Syriac char
 * @param { string } c input character
 * @param { Object.<string, string> } fromTo mapping dictionary
 * @returns { string } Syriac mapped char
 */
const map = (c, fromTo) => fromTo[c] || c;

/**
 * @private
 * Customized mapping callback
 * @param { string } word input word
 * @param { number } i current index in the word
 * @param { Object.<string, string> } fromTo mapping dictionary
 * @returns { string } Syriac mapped char
 */
const westernCallback = (word, i, fromTo) => {
  let m = '';
  const c = word.charAt(i);
  switch (c) {
    case 'y':
      m =
        word.charAt(i + 1) === 'i'
          ? isYwFlipped(word, i)
            ? `${syriacWesternVowelsByName.hbasa}${syriacConsonantsByName.yod}`
            : `${syriacConsonantsByName.yod}${syriacWesternVowelsByName.hbasa}`
          : word.charAt(i + 1) === 'e'
            ? isYwFlipped(word, i)
              ? `${syriacWesternVowelsByName.rbasa}${syriacConsonantsByName.yod}`
              : `${syriacConsonantsByName.yod}${syriacWesternVowelsByName.rbasa}`
            : map(c, fromTo);
      break;
    case 'w':
      m =
        word.charAt(i + 1) === 'u'
          ? isYwFlipped(word, i)
            ? `${syriacWesternVowelsByName.esasa}${syriacConsonantsByName.waw}`
            : `${syriacConsonantsByName.waw}${syriacWesternVowelsByName.esasa}`
          : word.charAt(i + 1) === 'O'
            ? `${syriacWesternVowelsByName.zqapha}${syriacConsonantsByName.waw}`
            : map(c, fromTo);
      break;
    case '+':
      m = horizontalColon;
      break;
    default:
      m = map(c, fromTo);
      break;
  }
  return m;
};

/**
 * Aramaic Western Mapper
 * @const
 * @type { Mapper }
 */
export const westernMapper = new Mapper(
  calWriting,
  westernSyriacWriting,
  westernCallback
);

/**
 * Convert from CAL to Eastern Syriac Unicode - only vowels differ from western
 * @static
 * @param {string} word input word in CAL code transliteration
 * @returns {string} the input word converted to Eastern Syriac Unicode
 */
export const toEasternSyriac = word => easternMapper.map(word);

/**
 * Convert from CAL to Western Syriac Unicode - only vowels differ from eastern
 * @static
 * @param {string} word input word in CAL code transliteration
 * @returns {string} the input word converted to Western Syriac Unicode
 */
export const toWesternSyriac = word => westernMapper.map(word);
/** @module calHebrew */
import { Writing, Mapper } from './aramaic-mapper.js';
import {
  allConsonants as calConsonants,
  vowels as calVowels,
  diacriticsByName,
  isDotted
} from './cal-code-util.js';
import {
  consonants as hebrewConsonants,
  commonVowels as hebrewCommonVowels,
  easternCommonVowels as hebrewEasternVowels,
  endify
} from './hebrew-code-util.js';

/**
 * @private
 * CAL source writing
 * @const
 * @type { Writing }
 */
const calWriting = new Writing(calConsonants, calVowels);

/**
 * @private
 * Hebrew destination writing
 * @const
 * @type { Writing }
 */
const hebrewWriting = new Writing(
  // + Palestinian and Hebrew Shin
  Object.freeze(hebrewConsonants.concat('\u05E4', '\u05E9')),
  Object.freeze(hebrewCommonVowels.concat(hebrewEasternVowels))
);
const shin = '\u05E9';
const dottedShin = `${shin}\u05C1`;
const dottedSin = `${shin}\u05C2`;

/**
 * @private
 * Customized mapping callback
 * @param { string } word input word
 * @param { number } i current index in the word
 * @param { Object.<string, string> } fromTo mapping dictionary
 * @param { Object } wordProps optional word settings
 * @returns { string } Hebrew mapped char
 */
const callback = (word, i, fromTo, wordProp) => {
  const c = word.charAt(i);
  switch (c) {
    case diacriticsByName.qushaya:
      return '\u05BC'; //  ּ HEBREW POINT DAGESH
    case diacriticsByName.rukkakha:
    case diacriticsByName.lineaOccultans:
    case diacriticsByName.seyame:
    case diacriticsByName.dotAbove:
    case diacriticsByName.dotBelow:
    case diacriticsByName.breve:
      return ''; // leave letter un-dotted as no equivalent exists
    case '&':
      return wordProp.isDotted ? dottedSin : shin;
    case '$':
      return wordProp.isDotted ? dottedShin : shin;
    case 'O':
      return word.charAt(i - 1) === 'w' ? '\u05BA' : '\u05B9'; // holam haser or holam
    case 'u':
      return word.charAt(i - 1) === 'w' ? '\u05BC' : '\u05BB'; // shuruq or qubuts
    default:
      return fromTo[c] || c;
  }
};

/**
 * Hebrew Mapper
 * @const
 * @type { Mapper }
 */
export const mapper = new Mapper(calWriting, hebrewWriting, callback);
mapper.multiples = [dottedShin, dottedSin];

/**
 * Convert from CAL to Hebrew Unicode
 * @static
 * @param { string } word input word in CAL code transliteration
 * @returns { string } the input word converted to Hebrew Unicode
 */
export const toHebrew = word => {
  const wordProp = Object.freeze(
    Object.create(null, {
      isDotted: { value: isDotted(word), enumerable: true }
    })
  );
  const mappedWord = mapper.map(word, wordProp);
  return endify(mappedWord);
};
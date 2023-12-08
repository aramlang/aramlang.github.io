/** @module syriacCal */
import { Writing, Mapper } from './aramaic-mapper.js';
import {
  allConsonants as syriacAllConsonants,
  allVowels as syriacAllVowels,
  allDiacritics as syriacAllDiacritics,
  isConsonant as isSyriacConsonant,
  consonantsByName as syriacConsonantsByName,
  easternVowelsByName,
  westernVowelsByName
} from './syriac-code-util.js';
import {
  consonants,
  commonVowels,
  easternVowels,
  diacritics
} from './cal-code-util.js';

/**
 * @private
 * Syriac Writing Definition
 * @const
 * @type { Writing }
 */
const syriacWriting = new Writing(
  syriacAllConsonants,
  syriacAllVowels,
  syriacAllDiacritics
);

/**
 * @private
 * Mapped Cal Writing Definition
 * @const
 * @type { Writing }
 */
const calWriting = new Writing(
  Object.freeze(
    consonants.concat([
      ')', //  ܑ Syriac Letter Superscript Alaph - used in East Syriac texts to indicate an etymological Alaph
      'g', // ܔ Syriac Letter Gamal Garshuni - Garshuni ج (jim); used in Garshuni documents
      'd', // ܖ Syriac Letter Dotless Dalath Rish - ܕ or ܪ without a dot, used in old Syriac texts; ambiguous form for undifferentiated early dalath/rish
      'T', // ܜ Syriac Letter Teth Garshuni - Garshuni ظ (tha); used in Garshuni documents
      'yh', // ܞ Syriac Letter Yudh He - The characters for Yah; mostly used in East Syriac texts
      's', // ܤ Syriac Letter Final Semkath - A variant form of ܣ with a tail
      'P', // ܧ Syriac Letter Reversed Pe - Christian Palestinian Aramaic Pe; used in Christian Palestinian Aramaic
      'b', // ܭ Syriac Letter Persian Bheth
      'g', // ܮ Syriac Letter Persian Ghamal
      'd', // ܯ Syriac Letter Persian Dhalath
      'z', // ݍ Syriac Letter Sogdian Zhain
      'k', // ݎ Syriac Letter Sogdian Khaph
      'p', // ݏ Syriac Letter Sogdian Fe
      ')', // ء Arabic Letter Hamza  - Garshuni hamzah
      'ng', //  Syriac Letter Malayalam Nga → \u0D19 ങ malayalam letter nga
      'y', //  Syriac Letter Malayalam Ja → \u0D1C ജ malayalam letter ja
      'ny', //  Syriac Letter Malayalam Nya → \u0D1E ഞ malayalam letter nya
      'tt', //  Syriac Letter Malayalam Tta → \u0D1F ട malayalam letter tta
      'nn', //  Syriac Letter Malayalam Nna → \u0D23 ണ malayalam letter nna
      'nnn', //  Syriac Letter Malayalam Nnna → \u0D29 ഩ malayalam letter nnna
      'bh', //  Syriac Letter Malayalam Bha → \u0D2D ഭ malayalam letter bha
      'r', //  Syriac Letter Malayalam Ra → \u0D30 ര malayalam letter ra
      'll', //  Syriac Letter Malayalam Lla → \u0D33 ള malayalam letter lla
      'lll', //  Syriac Letter Malayalam Llla → \u0D34 ഴ malayalam letter llla
      'ss' //  Syriac Letter Malayalam Ssa → \u0D37 ഷ malayalam letter ssa
    ])
  ),
  Object.freeze(
    commonVowels
      .slice(0, 4)
      .concat(easternVowels) // matching syriac eastern
      .concat(commonVowels) // matching syriac western above
      .concat(commonVowels) // matching syriac western below
      .concat([
        'a', //  َ Arabic fatha - Garshuni: a
        'i', //  ِ Arabic kasra - Garshuni: i
        'u', //  ُ Arabic damma - Garshuni: u
        'a', //  ً Arabic fathatan - Garshuni: an
        'i', //  ٍ Arabic kasratan - Garshuni: in
        'u', //  ٌ Arabic dammatan - Garshuni: un
        'o' //  ٰ Arabic letter superscript alef - Garshuni: long a
      ])
  ),
  Object.freeze(
    diacritics.concat([
      '', // ̃  Swadaya combining tilde
      '', // ̰  Swadaya combining tilde below
      '', // ̮  Swadaya combining breve below
      "'", // ̊  Western Syriac Qushshaya variation: combining ring above
      ',', // ̥  Western Syriac Rukkakha variation: combining ring below
      '_', // ̄  Horizontal Line Above: combining macron
      '_', // ̱  Horizontal Line Below: combining macron below
      '_', //  ݈ Syriac Oblique Line Below • indication of a silent letter • also used to indicate numbers multiplied by a certain constant
      '*', // ̤  Seyame Below: combining diaeresis below
      '', //  ݀ Syriac Feminine Dot • feminine marker used with the Taw feminine suffix
      '', // ̇  Combining dot above: Use ܒ̇ on the feminine he ending: ܟܬܒܗ̇ ‘her book’, to mark present tense: ܟ̇ܬܒ ‘he is writing’, etc.
      '', // ̣  Combining dot below: Use ܒ̣ to mark past tense: ܟ̣ܬܒ ‘he wrote’, etc.
      '', //  ݃ Syriac Two Vertical Dots Above • accent mark used in ancient manuscripts
      '', //  ݄ Syriac Two Vertical Dots Below • accent mark used in ancient manuscripts
      '', //  ݅ Syriac Three Dots Above • diacritic used in Turoyo for letters not found in Syriac
      '', //  ݆ Syriac Three Dots Below • diacritic used in Turoyo for letters not found in Syriac
      '', //  ݉ Syriac Music • a music mark • also used in the Syrian Orthodox Anaphora book to mark the breaking of the Eucharist bread
      '', //  ݊ Syriac Barrekh • a diacritic cross used in liturgical texts
      '', // ̭  Turoyo combining circumflex accent below
      '', //  ٓ Arabic maddah above - Garshuni
      '', //  ٔ Arabic hamza above - Garshuni
      '', //  َ Arabic hamza below - Garshuni
      '' //  ّ Arabic shadda - Garshuni
    ])
  )
);

const { waw, yod } = syriacConsonantsByName;
const { hbasaEsasa } = easternVowelsByName;
const westernHbasa = westernVowelsByName.hbasa;
const westernRbasa = westernVowelsByName.rbasa;
const westernEsasa = westernVowelsByName.esasa;
const westernZqapha = westernVowelsByName.zqapha;

/**
 * @private
 * Maps input character to CAL char
 * @param { string } c Syriac input character
 * @param { Object.<string, string> } fromTo mapping dictionary
 * @returns { string } CAL mapped char
 */
const mapCallback = (word, i, toFrom) => {
  const c = word.charAt(i);
  const to = () => toFrom[c] || (toFrom[c] === '' ? '' : c);
  let m;
  switch (c) {
    case westernHbasa: // Hbasa Above/Below
    case '\u073B':
      m =
        word.charAt(i + 1) === yod && (!word.charAt(i + 2) || isSyriacConsonant(word.charAt(i + 2)))
          ? 'yi' // Western stores as (iy)
          : to();
      break;
    case westernRbasa: // Rbasa Above/below
    case '\u0737':
      m =
        word.charAt(i + 1) === yod && (!word.charAt(i + 2) || isSyriacConsonant(word.charAt(i + 2)))
          ? 'ye' // Sedra stores as (ey)
          : to();
      break;
    case westernEsasa: // Esasa Above/Below
    case '\u073E':
      m =
        word.charAt(i + 1) === waw && (!word.charAt(i + 2) || isSyriacConsonant(word.charAt(i + 2)))
          ? 'wu' // Western stores as (uw)
          : to();
      break;
    case westernZqapha: // Zqapha Above/Below
    case '\u0734':
      m =
        word.charAt(i + 1) === waw && (!word.charAt(i + 2) || isSyriacConsonant(word.charAt(i + 2)))
          ? 'wO' // Eastern O stored as (ow) in Western
          : to();
      break;
    case hbasaEsasa: // Eastern below dot
      m =
        word.charAt(i - 1) === waw
          ? 'u' // / w followed by below dot => u
          : to();
      break;
    default:
      m = to();
      break;
  }
  return m;
};

/**
 * Aramaic Mapper
 * @const
 * @type { Mapper }
 */
export const mapper = new Mapper(syriacWriting, calWriting, mapCallback);

/**
 * Convert from Syriac Unicode to CAL
 * @static
 * @param {string} word input word in Syriac Unicode
 * @returns {string} the input word converted to CAL
 */
export const toCal = word => mapper.map(word);
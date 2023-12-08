/** @module syriacCodeUtil */
import { hasDotting, clearDotting, getSort } from './aramaic-mapper.js';

/**
 * CAL consonant name to value map
 * @constant
 * @type { Object.<string, string> }
*/
export const consonantsByName = Object.freeze(
  Object.create(null, {
    alaph: { value: '\u0710', enumerable: true }, // ܐ Syriac Letter Alaph
    beth: { value: '\u0712', enumerable: true }, // ܒ Syriac Letter Beth
    gamal: { value: '\u0713', enumerable: true }, // ܓ Syriac Letter Gamal
    dalath: { value: '\u0715', enumerable: true }, // ܕ Syriac Letter Dalath

    he: { value: '\u0717', enumerable: true }, // ܗ Syriac Letter He
    waw: { value: '\u0718', enumerable: true }, // ܘ Syriac Letter Waw
    zayn: { value: '\u0719', enumerable: true }, // ܙ Syriac Letter Zain

    heth: { value: '\u071A', enumerable: true }, // ܚ Syriac Letter Heth
    teth: { value: '\u071B', enumerable: true }, // ܛ Syriac Letter Teth
    yod: { value: '\u071D', enumerable: true }, // ܝ Syriac Letter Yudh

    kaph: { value: '\u071F', enumerable: true }, // ܟ Syriac Letter Kaph
    lamadh: { value: '\u0720', enumerable: true }, // ܠ Syriac Letter Lamadh
    mim: { value: '\u0721', enumerable: true }, // ܡ Syriac Letter Mim
    nun: { value: '\u0722', enumerable: true }, // ܢ Syriac Letter Nun

    semkath: { value: '\u0723', enumerable: true }, // ܣ Syriac Letter Semkath
    e: { value: '\u0725', enumerable: true }, // ܥ Syriac Letter E
    pe: { value: '\u0726', enumerable: true }, // ܦ Syriac Letter Pe
    sadhe: { value: '\u0728', enumerable: true }, // ܨ Syriac Letter Sadhe

    qoph: { value: '\u0729', enumerable: true }, // ܩ Syriac Letter Qaph
    resh: { value: '\u072A', enumerable: true }, // ܪ Syriac Letter Rish
    shin: { value: '\u072B', enumerable: true }, // ܫ Syriac Letter Shin
    taw: { value: '\u072C', enumerable: true } // ܬ Syriac Letter Taw
  })
);

const l = consonantsByName;
/**
 * Syriac base 22 consonants
 * @constant
 * @type { string[] }
*/
export const consonants = Object.freeze([
  // abgad
  l.alaph,
  l.beth,
  l.gamal,
  l.dalath,

  // hawaz
  l.he,
  l.waw,
  l.zayn,

  // ḥaṭy
  l.heth,
  l.teth,
  l.yod,

  // kalman
  l.kaph,
  l.lamadh,
  l.mim,
  l.nun,

  // saʿpac
  l.semkath,
  l.e,
  l.pe,
  l.sadhe,

  // qarshat
  l.qoph,
  l.resh,
  l.shin,
  l.taw
]);

/**
 * Syriac extra consonants: Garshuni, ancient, Persian, Sogdian, Palestinian, etc.
 * @constant
 * @type { string[] }
*/
export const extraConsonants = Object.freeze([
  '\u0711', //  ܑ Syriac Letter Superscript Alaph - used in East Syriac texts to indicate an etymological Alaph
  '\u0714', // ܔ Syriac Letter Gamal Garshuni - Garshuni ج (jim); used in Garshuni documents
  '\u0716', // ܖ Syriac Letter Dotless Dalath Rish - ܕ or ܪ without a dot, used in old Syriac texts; ambiguous form for undifferentiated early dalath/rish
  '\u071C', // ܜ Syriac Letter Teth Garshuni - Garshuni ظ (tha); used in Garshuni documents
  '\u071E', // ܞ Syriac Letter Yudh He - The characters for Yah; mostly used in East Syriac texts
  '\u0724', // ܤ Syriac Letter Final Semkath - A variant form of ܣ with a tail
  '\u0727', // ܧ Syriac Letter Reversed Pe - Christian Palestinian Aramaic Pe; used in Christian Palestinian Aramaic
  '\u072D', // ܭ Syriac Letter Persian Bheth
  '\u072E', // ܮ Syriac Letter Persian Ghamal
  '\u072F', // ܯ Syriac Letter Persian Dhalath
  '\u074D', // ݍ Syriac Letter Sogdian Zhain
  '\u074E', // ݎ Syriac Letter Sogdian Khaph
  '\u074F', // ݏ Syriac Letter Sogdian Fe
  '\u0621', // ء Arabic Letter Hamza  - Garshuni hamzah
  '\u0860', //  Syriac Letter Malayalam Nga → \u0D19 ങ malayalam letter nga
  '\u0861', //  Syriac Letter Malayalam Ja → \u0D1C ജ malayalam letter ja
  '\u0862', //  Syriac Letter Malayalam Nya → \u0D1E ഞ malayalam letter nya
  '\u0863', //  Syriac Letter Malayalam Tta → \u0D1F ട malayalam letter tta
  '\u0864', //  Syriac Letter Malayalam Nna → \u0D23 ണ malayalam letter nna
  '\u0865', //  Syriac Letter Malayalam Nnna → \u0D29 ഩ malayalam letter nnna
  '\u0866', //  Syriac Letter Malayalam Bha → \u0D2D ഭ malayalam letter bha
  '\u0867', //  Syriac Letter Malayalam Ra → \u0D30 ര malayalam letter ra
  '\u0868', //  Syriac Letter Malayalam Lla → \u0D33 ള malayalam letter lla
  '\u0869', //  Syriac Letter Malayalam Llla → \u0D34 ഴ malayalam letter llla
  '\u086A' //  Syriac Letter Malayalam Ssa → \u0D37 ഷ malayalam letter ssa
]);

/**
 * All Syriac consonants including Garshuni, Persian, Sogdian and Palestinian, etc.
 * @constant
 * @type { string[] }
 */
export const allConsonants = Object.freeze(consonants.concat(extraConsonants));

/**
 * Syriac punctuation
 * @constant
 * @type { string[] }
*/
export const punctuation = Object.freeze([
  '\u0700', // ܀ Syriac End of Paragraph - marks the end of a paragraph
  '\u0701', // ܁ Syriac Supralinear Full Stop - marks interrogations, imperatives, and pauses, especially in Biblical texts
  '\u0702', // ܂ Syriac Sublinear Full Stop - marks subordinate clauses and minor pauses, especially in Biblical texts
  '\u0703', // ܃ Syriac Supralinear Colon - marks expressions of wonder and has a distinct pausal value in Biblical texts
  '\u0704', // ܄ Syriac Sublinear Colon - used at the end of verses of supplications
  '\u0705', // ܅ Syriac Horizontal Colon - joins two words closely together in a context to which a rising tone is suitable
  '\u0706', // ܆ Syriac Colon Skewed Left - marks a dependent clause
  '\u0707', // ܇ Syriac Colon Skewed Right - marks the end of a subdivision of the apodosis, or latter part of a Biblical verse
  '\u0708', // ܈ Syriac Supralinear Colon Skewed Left - marks a minor phrase division
  '\u0709', // ܉ Syriac Sublinear Colon Skewed Left - marks the end of a real or rhetorical question
  '\u070A', // ܊ Syriac Contraction - a contraction mark, mostly used in East Syriac; placed at the end of an incomplete word
  '\u070B', // ܋ Syriac Harklean Obelus - marks the beginning of a phrase, word, or morpheme that has a marginal note - similar to UTF ÷ division sign
  '\u070C', // ܌ Syriac Harklean Metobelus - marks the end of a section with a marginal note
  '\u070D', // ܍ Syriac Harklean Asteriscus - marks the beginning of a phrase, word, or morpheme that has a marginal note
  '\u070F', // ܏ܫܘ Syriac Abbreviation Mark - marks the beginning of a Syriac abbreviation

  '\u060C', // ، Arabic COMMA - also used with Thaana and Syriac in modern text
  '\u061B', // ؛ Arabic Semicolon - also used with Thaana and Syriac in modern text
  '\u061F', // ؟ Arabic Question Mark - also used with Thaana and Syriac in modern text
  '\u0021' // ! Exclamation Mark - regular ASCII exclamation mark
]);

/**
 * Eastern vowel name to value map
 * @constant
 * @type { Object.<string, string> }
*/
export const easternVowelsByName = Object.freeze(
  Object.create(null, {
    pthaha: { value: '\u0732', enumerable: true },
    zqapha: { value: '\u0735', enumerable: true },
    rbasa: { value: '\u0739', enumerable: true },
    hbasaEsasa: { value: '\u073C', enumerable: true },

    zlama: { value: '\u0738', enumerable: true },
    rwaha: { value: '\u073F', enumerable: true }
  })
);

const ev = easternVowelsByName;
/**
 * Eastern common vowels - common to Western Syriac as well
 * @constant
 * @type { string[] }
*/
export const easternCommonVowels = Object.freeze([
  ev.pthaha, //  ܲ Syriac Pthaha Dotted
  ev.zqapha, //  ܵ Syriac Zqapha Dotted
  ev.rbasa, //  ܹ Syriac Dotted Zlama Angular
  ev.hbasaEsasa //  ܼ Syriac Hbasa-Esasa Dotted
]);

/**
 * Eastern only vowels
 * @constant
 * @type { string[] }
*/
export const easternOnlyVowels = Object.freeze([
  ev.zlama, //  ܸ Syriac Dotted Zlama Horizontal
  ev.rwaha //  ܿ Syriac Rwaha
]);

/**
 * Eastern vowels
 * @constant
 * @type { string[] }
*/
export const easternVowels = Object.freeze(
  easternCommonVowels.concat(easternOnlyVowels)
);

/**
 * Western vowel name to value map
 * @constant
 * @type { Object.<string, string> }
*/
export const westernVowelsByName = Object.freeze(
  Object.create(null, {
    pthaha: { value: '\u0730', enumerable: true },
    zqapha: { value: '\u0733', enumerable: true },
    rbasa: { value: '\u0736', enumerable: true },
    hbasa: { value: '\u073A', enumerable: true },
    esasa: { value: '\u073D', enumerable: true }
  })
);

const wv = westernVowelsByName;
/**
 * Western vowels
 * @constant
 * @type { string[] }
*/
export const westernVowels = Object.freeze([
  wv.pthaha, //  ܰ Syriac Pthaha Above
  wv.zqapha, //  ܳ Syriac Zqapha Above
  wv.rbasa, //  ܶ Syriac Rbasa Above
  wv.hbasa, //  ܺ Syriac Hbasa Above
  wv.esasa //  ܽ Syriac Esasa Above
]);

/**
 * Western vowels below line
 * @constant
 * @type { string[] }
*/
export const westernVowelsBellow = Object.freeze([
  '\u0731', //  ܱ Syriac Pthaha Below
  '\u0734', //  ܴ Syriac Zqapha Below
  '\u0737', //  ܷ Syriac Rbasa Below
  '\u073B', //  ܻ Syriac Hbasa Below
  '\u073E' //  ܾ Syriac Esasa Below
]);

/**
 * All Western vowels
 * @constant
 * @type { string[] }
 */
export const allWesternVowels = westernVowels.concat(westernVowelsBellow);

/**
 * Garshuni vowels
 * @constant
 * @type { string[] }
 */
export const garshuniVowels = Object.freeze([
  '\u064E', //  َ Arabic fatha - Garshuni: a
  '\u0650', //  ِ Arabic kasra - Garshuni: i
  '\u064F', //  ُ Arabic damma - Garshuni: u
  '\u064B', //  ً Arabic fathatan - Garshuni: an
  '\u064D', //  ٍ Arabic kasratan - Garshuni: in
  '\u064C', //  ٌ Arabic dammatan - Garshuni: un
  '\u0670' //  ٰ Arabic letter superscript alef - Garshuni: long a
]);

/**
 * Eastern/Western and Garshuni vowels
 * @constant
 * @type { string[] }
 */
export const allVowels = easternVowels
  .concat(allWesternVowels)
  .concat(garshuniVowels);

/**
 * Diacritics name map
 * @constant
 * @type { Object.<string, string> }
*/
export const diacriticsByName = Object.freeze(
  Object.create(null, {
    qushaya: { value: '\u0741', enumerable: true },
    rukkakha: { value: '\u0742', enumerable: true },
    lineaOccultans: { value: '\u0747', enumerable: true },
    seyame: { value: '\u0308', enumerable: true }
  })
);

const d = diacriticsByName;
/**
 * Diacritics common to both Eastern and Western
 * Qushaya, Rukkakha, Line under, Seyame
 * @constant
 * @type { string[] }
*/
export const commonDiacritics = Object.freeze([
  d.qushaya, //  ݁ Syriac Qushshaya • indicates a plosive pronunciation
  d.rukkakha, //  ݂ Syriac Rukkakha • indicates an aspirated (spirantized) pronunciation
  d.lineaOccultans, //  ݇ Syriac Oblique Line Above • indication of a silent letter
  d.seyame // ̈  Seyame, Rebwe: combining diaeresis
]);

/**
 * Swadaya Eastern diacritics
 * @constant
 * @type { string[] }
*/
export const swadayaDiacritics = Object.freeze([
  '\u0303', // ̃  Swadaya combining tilde
  '\u0330', // ̰  Swadaya combining tilde below
  '\u032E' // ̮  Swadaya combining breve below
]);

/**
 * Other diacritics: Qushaya, Rukkakha, Line variations, etc.
 * @constant
 * @type { string[] }
*/
export const otherDiacritics = Object.freeze([
  '\u030A', // ̊  Western Syriac Qushshaya variation: combining ring above
  '\u0325', // ̥  Western Syriac Rukkakha variation: combining ring below
  '\u0304', // ̄  Horizontal Line Above: combining macron
  '\u0331', // ̱  Horizontal Line Below: combining macron below
  '\u0748', //  ݈ Syriac Oblique Line Below • indication of a silent letter • also used to indicate numbers multiplied by a certain constant
  '\u0324', // ̤  Seyame Below: combining diaeresis below
  '\u0740', //  ݀ Syriac Feminine Dot • feminine marker used with the Taw feminine suffix
  '\u0307', // ̇  Combining dot above: Use ܒ̇ on the feminine he ending: ܟܬܒܗ̇ ‘her book’, to mark present tense: ܟ̇ܬܒ ‘he is writing’, etc.
  '\u0323', // ̣  Combining dot below: Use ܒ̣ to mark past tense: ܟ̣ܬܒ ‘he wrote’, etc.
  '\u0743', //  ݃ Syriac Two Vertical Dots Above • accent mark used in ancient manuscripts
  '\u0744', //  ݄ Syriac Two Vertical Dots Below • accent mark used in ancient manuscripts
  '\u0745', //  ݅ Syriac Three Dots Above • diacritic used in Turoyo for letters not found in Syriac
  '\u0746', //  ݆ Syriac Three Dots Below • diacritic used in Turoyo for letters not found in Syriac
  '\u0749', //  ݉ Syriac Music • a music mark • also used in the Syrian Orthodox Anaphora book to mark the breaking of the Eucharist bread
  '\u074A', //  ݊ Syriac Barrekh • a diacritic cross used in liturgical texts
  '\u032D', // ̭  Turoyo combining circumflex accent below
  '\u0653', //  ٓ Arabic maddah above - Garshuni
  '\u0654', //  ٔ Arabic hamza above - Garshuni
  '\u0655', //  َ Arabic hamza below - Garshuni
  '\u0651' //  ّ Arabic shadda - Garshuni
]);

/**
 * Eastern and Western diacritics
 * @constant
 * @type { string[] }
 */
export const allDiacritics = commonDiacritics
  .concat(swadayaDiacritics)
  .concat(otherDiacritics);

/**
 * Other symbols
 * @constant
 * @type { Array.<string> }
 */
export const other = Object.freeze([
  '\u2670', // ♰ West Syriac Cross
  '\u2671' // ♱ East Syriac Cross
]);

/**
 * Vowels and diacritics: used for consonantal only mapping
 * @constant
 * @type { Array.<string> }
 */
export const dotting = Object.freeze(allVowels.concat(allDiacritics));

/**
 * CAL to ordinal ASCII value. Used for sorting:
 * a b c d e f g h i j k l m n o p q r s t u v
 * w x y z { | }
 * @constant
 * @type { Object.<string, string> }
*/
export const letterAsciiMap = Object.freeze(
  Object.create(null, {
    [l.alaph]: { value: 'a', enumerable: true },
    [l.beth]: { value: 'b', enumerable: true },
    [l.gamal]: { value: 'c', enumerable: true },
    [l.dalath]: { value: 'd', enumerable: true },

    [l.he]: { value: 'e', enumerable: true },
    [l.waw]: { value: 'f', enumerable: true },
    [l.zayn]: { value: 'g', enumerable: true },

    [l.heth]: { value: 'h', enumerable: true },
    [l.teth]: { value: 'i', enumerable: true },
    [l.yod]: { value: 'j', enumerable: true },

    [l.kaph]: { value: 'k', enumerable: true },
    [l.lamadh]: { value: 'l', enumerable: true },
    [l.mim]: { value: 'm', enumerable: true },
    [l.nun]: { value: 'n', enumerable: true },

    [l.semkath]: { value: 'o', enumerable: true },
    [l.e]: { value: 'p', enumerable: true },
    [l.pe]: { value: 'q', enumerable: true },
    [l.sadhe]: { value: 'r', enumerable: true },

    [l.qoph]: { value: 's', enumerable: true },
    [l.resh]: { value: 't', enumerable: true },
    [l.shin]: { value: 'u', enumerable: true },
    [l.taw]: { value: 'v', enumerable: true },

    ['\u0711']: { value: 'a', enumerable: true }, //  ܑ Syriac Letter Superscript Alaph - used in East Syriac texts to indicate an etymological Alaph
    ܔ: { value: 'c', enumerable: true }, // ܔ Syriac Letter Gamal Garshuni - Garshuni ج (jim); used in Garshuni documents
    ܖ: { value: 'd', enumerable: true }, // ܖ Syriac Letter Dotless Dalath Rish - ܕ or ܪ without a dot, used in old Syriac texts; ambiguous form for undifferentiated early dalath/rish
    ܜ: { value: 'i', enumerable: true }, // ܜ Syriac Letter Teth Garshuni - Garshuni ظ (tha); used in Garshuni documents
    ܞ: { value: 'je', enumerable: true }, // ܞ Syriac Letter Yudh He - The characters for Yah; mostly used in East Syriac texts
    ܤ: { value: 'o', enumerable: true }, // ܤ Syriac Letter Final Semkath - A variant form of ܣ with a tail
    ܧ: { value: 'q', enumerable: true }, // ܧ Syriac Letter Reversed Pe - Christian Palestinian Aramaic Pe; used in Christian Palestinian Aramaic
    ܭ: { value: 'b', enumerable: true }, // ܭ Syriac Letter Persian Bheth
    ܮ: { value: 'c', enumerable: true }, // ܮ Syriac Letter Persian Ghamal
    ܯ: { value: 'd', enumerable: true }, // ܯ Syriac Letter Persian Dhalath
    ݍ: { value: 'g', enumerable: true }, // ݍ Syriac Letter Sogdian Zhain
    ݎ: { value: 'k', enumerable: true }, // ݎ Syriac Letter Sogdian Khaph
    ݏ: { value: 'q', enumerable: true }, // ݏ Syriac Letter Sogdian Fe
    ء: { value: 'a', enumerable: true }, // ء Arabic Letter Hamza  - Garshuni hamzah

    [ev.pthaha]: { value: 'w', enumerable: true }, // a
    [wv.pthaha]: { value: 'w', enumerable: true }, // a
    ['\u0731']: { value: 'w', enumerable: true }, // a  ܱ Syriac Pthaha Below
    ['\u064E']: { value: 'w', enumerable: true }, //  َ Arabic fatha - Garshuni: a
    ['\u064B']: { value: 'w', enumerable: true }, //  ً Arabic fathatan - Garshuni: an
    [ev.zqapha]: { value: 'x', enumerable: true }, // o
    [wv.zqapha]: { value: 'x', enumerable: true }, // o
    ['\u0734']: { value: 'x', enumerable: true }, // o  ܴ Syriac Zqapha Below
    ['\u0670']: { value: 'x', enumerable: true }, //  ٰ Arabic letter superscript alef - Garshuni: long a
    [ev.rbasa]: { value: 'y', enumerable: true }, // e
    [wv.rbasa]: { value: 'y', enumerable: true }, // e
    ['\u0737']: { value: 'y', enumerable: true }, // e  ܷ Syriac Rbasa Below
    [ev.zlama]: { value: 'z', enumerable: true }, // E
    [ev.hbasa]: { value: '{', enumerable: true }, // i
    [wv.hbasa]: { value: '{', enumerable: true }, // i
    ['\u073B']: { value: '{', enumerable: true }, // i  ܻ Syriac Hbasa Below
    ['\u0650']: { value: '{', enumerable: true }, //  ِ Arabic kasra - Garshuni: i
    ['\u064D']: { value: '{', enumerable: true }, //  ٍ Arabic kasratan - Garshuni: in
    [ev.esasa]: { value: '|', enumerable: true }, // u
    [wv.esasa]: { value: '|', enumerable: true }, // u
    ['\u073E']: { value: '|', enumerable: true }, // u  ܾ Syriac Esasa Below
    ['\u064F']: { value: '|', enumerable: true }, //  ُ Arabic damma - Garshuni: u
    ['\u064C']: { value: '|', enumerable: true }, //  ٌ Arabic dammatan - Garshuni: un
    [ev.rwaha]: { value: '}', enumerable: true }, // O

    [d.qushaya]: { value: '', enumerable: true },
    [d.rukkakha]: { value: ',', enumerable: true },
    [d.lineaOccultans]: { value: '', enumerable: true },
    [d.seyame]: { value: '', enumerable: true },

    ['\u0303']: { value: '', enumerable: true }, // ̃  Swadaya combining tilde
    ['\u0330']: { value: '', enumerable: true }, // ̰  Swadaya combining tilde below
    ['\u032E']: { value: '', enumerable: true }, // ̮  Swadaya combining breve below

    ['\u030A']: { value: '', enumerable: true }, // ̊  Western Syriac Qushshaya variation: combining ring above
    ['\u0325']: { value: '', enumerable: true }, // ̥  Western Syriac Rukkakha variation: combining ring below
    ['\u0304']: { value: '', enumerable: true }, // ̄  Horizontal Line Above: combining macron
    ['\u0331']: { value: '', enumerable: true }, // ̱  Horizontal Line Below: combining macron below
    ['\u0748']: { value: '', enumerable: true }, //  ݈ Syriac Oblique Line Below • indication of a silent letter • also used to indicate numbers multiplied by a certain constant
    ['\u0324']: { value: '', enumerable: true }, // ̤  Seyame Below: combining diaeresis below
    ['\u0740']: { value: '', enumerable: true }, //  ݀ Syriac Feminine Dot • feminine marker used with the Taw feminine suffix
    ['\u0307']: { value: '', enumerable: true }, // ̇  Combining dot above: Use ܒ̇ on the feminine he ending: ܟܬܒܗ̇ ‘her book’, to mark present tense: ܟ̇ܬܒ ‘he is writing’, etc.
    ['\u0323']: { value: '', enumerable: true }, // ̣  Combining dot below: Use ܒ̣ to mark past tense: ܟ̣ܬܒ ‘he wrote’, etc.
    ['\u0743']: { value: '', enumerable: true }, //  ݃ Syriac Two Vertical Dots Above • accent mark used in ancient manuscripts
    ['\u0744']: { value: '', enumerable: true }, //  ݄ Syriac Two Vertical Dots Below • accent mark used in ancient manuscripts
    ['\u0745']: { value: '', enumerable: true }, //  ݅ Syriac Three Dots Above • diacritic used in Turoyo for letters not found in Syriac
    ['\u0746']: { value: '', enumerable: true }, //  ݆ Syriac Three Dots Below • diacritic used in Turoyo for letters not found in Syriac
    ['\u0749']: { value: '', enumerable: true }, //  ݉ Syriac Music • a music mark • also used in the Syrian Orthodox Anaphora book to mark the breaking of the Eucharist bread
    ['\u074A']: { value: '', enumerable: true }, //  ݊ Syriac Barrekh • a diacritic cross used in liturgical texts
    ['\u032D']: { value: '', enumerable: true }, // ̭  Turoyo combining circumflex accent below
    ['\u0653']: { value: '', enumerable: true }, //  ٓ Arabic maddah above - Garshuni
    ['\u0654']: { value: '', enumerable: true }, //  ٔ Arabic hamza above - Garshuni
    ['\u0655']: { value: '', enumerable: true }, //  َ Arabic hamza below - Garshuni
    ['\u0651']: { value: '', enumerable: true } //  ّ Arabic shadda - Garshuni
  })
);

/**
 * Is character c a Syriac consonant? All Eastern and Western and Garshuni, etc.
 * @param { string } c input character
 * @returns { boolean } true if c is Syriac consonant
 */
export const isConsonant = c => allConsonants.indexOf(c) > -1;

/**
 * Is character c a Eastern vowel?
 * @param { string } c input character
 * @returns { boolean } true if c is Eastern vowel
 */
export const isEasternVowel = c => easternVowels.indexOf(c) > -1;

/**
 * Is character c a Western vowel?
 * @param { string } c input character
 * @returns { boolean } true if c is Western vowel
 */
export const isWesternVowel = c => allWesternVowels.indexOf(c) > -1;

/**
 * Is character c a vowel? Includes both Eastern and Western.
 * @param { string } c input character
 * @returns { boolean } true if c is a vowel
 */
export const isVowel = c => allVowels.indexOf(c) > -1;

/**
 * Is character c a diacritic common to both Eastern and Western.
 * @param { string } c input character
 * @returns { boolean } true if c is a common diacritic
 */
export const isCommonDiacritic = c => commonDiacritics.indexOf(c) > -1;

/**
 * Is character c a Swadaya Eastern diacritic
 * @param { string } c input character
 * @returns { boolean } true if c is a Swadaya Eastern diacritic
 */
export const isSwadayaDiacritic = c => swadayaDiacritics.indexOf(c) > -1;

/**
 * Is character c other diacritic: common diacritic variations,
 * Western or Turoyo variations, etc.
 * @param { string } c input character
 * @returns { boolean } true if c is other type of diacritic
 */
export const isOtherDiacritic = c => otherDiacritics.indexOf(c) > -1;

/**
 * Is character c a diacritic.
 * @param { string } c input character
 * @returns { boolean } true if c is a diacritic
 */
export const isDiacritic = c => allDiacritics.indexOf(c) > -1;

/**
 * Is character c a punctuation character.
 * @param { string } c input character
 * @returns { boolean } true if c is punctuation
 */
export const isPunctuation = c => punctuation.indexOf(c) > -1;

/**
 * Returns true if c is other character
 * @param { string } c input character
 * @returns { boolean } true if c is other character
 */
export const isOther = c => other.indexOf(c) > -1;

/**
 * Returns true if c is dotting character
 * @param { string } c input character
 * @returns { boolean } true if c is dotting
 */
export const isDotting = c => dotting.indexOf(c) > -1;

/**
 * Return true if input word has vowels or diacritics
 * @param { string } word input word
 * @returns { boolean } true if word has vowels or diacritics
 */
export const isDotted = hasDotting(isDotting);

/**
 * Remove dotting (vowels and diacritics), leaving consonantal word only.
 * @param { string } word input word to be processed
 * @returns { string } consonantal word
 */
export const removeDotting = clearDotting(isDotting);

/**
 * Comparator function to be used for sorting CAL words
 * @static
 * @param { string } word1 first word to compare
 * @param { string } word2 second word to compare
 * @returns { number } -1, 0, 1 depending on word sorting
 */
export const sort = getSort(letterAsciiMap, isConsonant);
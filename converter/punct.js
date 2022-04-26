// according to Atornew98 font
const atorPunct = {
  newLine: 0xA,                     // \n
  space: 0x20,                      // ' '
  tatweel: 0x23,                    // ـ
  parenLeft: 0x28,                  // (
  parenRight: 0x29,                 // )
  one: 0x31,                        // 1

  arabicComma: 0x3A,                // ،
  endOfParagraph: 0xAB,             // ܀
  colonSkewedLeft: 0xAC,            // ܒ܆
  arabicSemicolon: 0xAE,            // ؛
  period: 0xAF,                     // .
  cross: 0xCE,                      // ♱
}

// according to EastAssyrian font
const punct = {
  newLine: 0xA,                     // \n
  space: 0x20,                      // ' '
  tatweel: 0x640,                   // ـ
  parenLeft: 0x28,                  // (
  parenRight: 0x29,                 // )
  one: 0x31,                        // 1
  period: 0x2E,                     // .

  arabicComma: 0x60C,               // ،
  arabicSemicolon: 0x61B,           // ؛
  arabicQuestionMark: 0x61F,        // ؟
  westSyriacCross: 0x2670,          // ♰
  eastSyriacCross: 0x2671,          // ♱

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
  abbreviationMark: 0x70F,           // ܏
  cross: letter.feSogdian,           // ♱
}

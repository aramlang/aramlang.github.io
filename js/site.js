'use strict';
import books from './peshitta.js'
import { removeDotting } from './cal-code-util.js'
import { toHebrew } from './cal-hebrew.js';
import { toEasternSyriac, toWesternSyriac } from './cal-syriac.js';

export default (bookNo, chapterNo) => {
  verses = books[bookNo][chapterNo];
  page.info = {
    book: {
      w: books[bookNo - 1][0],
      i: books[bookNo - 1][1],
      n: bookNo
    },
    chapter: {
      w: verses[0][0],
      n: chapterNo
    }
  };
  page.range = {
    minVerse: parseInt(controls.startVerse.value),
    maxVerse: parseInt(controls.endVerse.value)
  };

  const key = getWordKey();
  controls.book.innerHTML = getBook(key);
  controls.chapter.innerHTML = getChapter(key);
  controls.zawaeLabel.innerHTML = getZawaeLabel(key);
  for (let i = page.range.minVerse; i <= page.range.maxVerse; i++) {
    var cues = [0];
    page.cues[i] = cues;
    let words = verses[i];
    for (let j = 0; j < words.length; j++) {
      let wobj = words[j];
      let word = j ? toEasternSyriac(wobj.w) : cal_syr_no[wobj.w];
      wobj[key] = word;

      // cache DOM refs
      let id = i + '-' + j;
      page.elements.word[id] = document.getElementById(id + 'w');
      page.elements.word[id].innerText = word;
      if (j) {
        page.elements.inter[id] = document.getElementById(id + 'i');
        cues.push(wobj.t);
      }
    }
  }

  let maxWidth = 0;
  const noElems = document.querySelectorAll('.no');
  for (let i = 0; i < noElems.length; i++) {
    const width = noElems[i].getBoundingClientRect().width;
    if (width > maxWidth) {
      maxWidth = width;
    }
  }
  for (let i = 0; i < noElems.length; i++) {
    noElems[i].style.width = maxWidth + 'px';
  }

  let event = new CustomEvent('pageCompleted', { detail: page });
  document.dispatchEvent(event);
}

const page = {};

page.isMobileEdge = navigator.userAgent.includes('Edg') && (
  navigator.userAgent.includes('Mobile') || navigator.userAgent.includes('Android') || navigator.userAgent.includes('iPhone'));

// let getPassiveSupported detect if true
const passiveSupported = page.passiveSupported = (() => {
  let passiveSupported = false;
  try {
    const options = {
      // This function will be called when the browser attempts to access the passive property.
      get passive() {
        passiveSupported = true;
        return false;
      }
    };
    window.addEventListener("test", null, options);
    window.removeEventListener("test", null, options);
  } catch (err) {
    passiveSupported = false;
  }
  return passiveSupported;
})();

const controls = {};
const elemIds = ['stickyHeader', 'fontFamily', 'book', 'chapter', 'zawae', 'zawaeLabel', 'startVerse', 'endVerse', 'gotoChapter'];
for (let i = 0; i < elemIds.length; i++) {
  const elemId = elemIds[i];
  if (!(controls[elemId] = document.getElementById(elemId))) {
    const msg = `Could not find page element with id ${elemId}`;
    alert(msg);
    throw new Error(msg);
  }
}

const cal_syr_no = {
  ")": "ܐ",
  "b": "ܒ",
  "g": "ܓ",
  "d": "ܕ",
  "h": "ܗ",
  "w": "ܘ",
  "z": "ܙ",
  "x": "ܚ",
  "T": "ܛ",
  "y": "ܝ",
  "y)": "ܝܐ",
  "yb": "ܝܒ",
  "yg": "ܝܓ",
  "yd": "ܝܕ",
  "yh": "ܝܗ",
  "yw": "ܝܘ",
  "yz": "ܝܙ",
  "yx": "ܝܚ",
  "yT": "ܝܛ",
  "k": "ܟ",
  "k)": "ܟܐ",
  "kb": "ܟܒ",
  "kg": "ܟܓ",
  "kd": "ܟܕ",
  "kh": "ܟܗ",
  "kw": "ܟܘ",
  "kz": "ܟܙ",
  "kx": "ܟܚ",
  "kT": "ܟܛ",
  "l": "ܠ",
  "l)": "ܠܐ",
  "lb": "ܠܒ",
  "lg": "ܠܓ",
  "ld": "ܠܕ",
  "lh": "ܠܗ",
  "lw": "ܠܘ",
  "lz": "ܠܙ",
  "lx": "ܠܚ",
  "lT": "ܠܛ",
  "m": "ܡ",
  "m)": "ܡܐ",
  "mb": "ܡܒ",
  "mg": "ܡܓ",
  "md": "ܡܕ",
  "mh": "ܡܗ",
  "mw": "ܡܘ",
  "mz": "ܡܙ",
  "mx": "ܡܚ",
  "mT": "ܡܛ",
  "n": "ܢ"
}

const cal_heb_no = {
  ")": "א",
  "b": "ב",
  "g": "ג",
  "d": "ד",
  "h": "ה",
  "w": "ו",
  "z": "ז",
  "x": "ח",
  "T": "ט",
  "y": "י",
  "y)": "יא",
  "yb": "יב",
  "yg": "יג",
  "yd": "יד",
  "yh": "טו",
  "yw": "טז",
  "yz": "יז",
  "yx": "יח",
  "yT": "יט",
  "k": "כ",
  "k)": "כא",
  "kb": "כב",
  "kg": "כג",
  "kd": "כד",
  "kh": "כה",
  "kw": "כו",
  "kz": "כז",
  "kx": "כח",
  "kT": "כט",
  "l": "ל",
  "l)": "לא",
  "lb": "לב",
  "lg": "לג",
  "ld": "לד",
  "lh": "לה",
  "lw": "לו",
  "lz": "לז",
  "lx": "לח",
  "lT": "לט",
  "m": "מ",
  "m)": "מא",
  "mb": "מב",
  "mg": "מג",
  "md": "מד",
  "mh": "מה",
  "mw": "מו",
  "mz": "מז",
  "mx": "מח",
  "mT": "מט",
  "n": "נ"
}

page.cues = [[]]; // 1 based indexes
page.elements = {
  word: {},
  inter: {}
};
let verses;
const bookCache = {};
const chapterCache = {};
const zawaeLabelCache = {};

const getBook = (key) => {
  let cached = bookCache[key]
  if (cached) {
    return cached;
  }

  const prefix = 'korwuzwut,o)';
  switch (controls.fontFamily.value) {
    case 'syr':
    case 'est':
      cached = controls.zawae.checked
        ? `&nbsp;${toEasternSyriac(prefix)}&nbsp;ܕ${toEasternSyriac(page.info.book.w)}`
        : `&nbsp;${toEasternSyriac(removeDotting(prefix))}&nbsp;ܕ${toEasternSyriac(removeDotting(page.info.book.w))}`;
      break;
    case 'heb':
      cached = controls.zawae.checked
        ? `&nbsp;${toHebrew(prefix)}&nbsp;ד${toHebrew(page.info.book.w)}`
        : `&nbsp;${toHebrew(removeDotting(prefix))}&nbsp;ד${toHebrew(removeDotting(page.info.book.w))}`;
      break;
    case 'ser':
      cached = controls.zawae.checked
        ? `&nbsp;${toWesternSyriac(prefix)}&nbsp;ܕ${toWesternSyriac(page.info.book.w)}`
        : `&nbsp;${toWesternSyriac(removeDotting(prefix))}&nbsp;ܕ${toWesternSyriac(removeDotting(page.info.book.w))}`;
      break;
    default:
      cached = controls.zawae.checked
        ? `&nbsp;${prefix}&nbsp;d${page.info.book.w}`
        : `&nbsp;${removeDotting(prefix)}&nbsp;d${removeDotting(page.info.book.w)}`;
      break;
  }

  bookCache[key] = cached
  return cached;
}

const getChapter = (key) => {
  let cached = chapterCache[key]
  if (cached) {
    return cached;
  }

  const prefix = 'cxoxo)';
  switch (controls.fontFamily.value) {
    case 'syr':
    case 'est':
      cached = controls.zawae.checked
        ? `&nbsp;${toEasternSyriac(prefix)}&nbsp;${cal_syr_no[page.info.chapter.w]}`
        : `&nbsp;${toEasternSyriac(removeDotting(prefix))}&nbsp;${cal_syr_no[page.info.chapter.w]}`;
      break;
    case 'heb':
      cached = controls.zawae.checked
        ? `&nbsp;${toHebrew(prefix)}&nbsp;${cal_heb_no[page.info.chapter.w]}`
        : `&nbsp;${toHebrew(removeDotting(prefix))}&nbsp;${cal_heb_no[page.info.chapter.w]}`;
      break;
    case 'ser':
      cached = controls.zawae.checked
        ? `&nbsp;${toWesternSyriac(prefix)}&nbsp;${cal_syr_no[page.info.chapter.w]}`
        : `&nbsp;${toWesternSyriac(removeDotting(prefix))}&nbsp;${cal_syr_no[page.info.chapter.w]}`;
      break;
    default:
      cached = controls.zawae.checked
        ? `&nbsp;${prefix}&nbsp;${page.info.chapter.w}`
        : `&nbsp;${removeDotting(prefix)}&nbsp;${page.info.chapter.w}`;
      break;
  }

  chapterCache[key] = cached
  return cached;
}

const getZawaeLabel = (key) => {
  let cached = zawaeLabelCache[key]
  if (cached) {
    return cached;
  }

  const text = 'zow(*e)';
  switch (controls.fontFamily.value) {
    case 'syr':
    case 'est':
      cached = controls.zawae.checked
        ? `&nbsp;${toEasternSyriac(text)}`
        : `&nbsp;${toEasternSyriac(removeDotting(text))}`;
      break;
    case 'heb':
      cached = controls.zawae.checked
        ? `&nbsp;${toHebrew(text)}`
        : `&nbsp;${toHebrew(removeDotting(text))}`;
      break;
    case 'ser':
      cached = controls.zawae.checked
        ? `&nbsp;${toWesternSyriac(text)}`
        : `&nbsp;${toWesternSyriac(removeDotting(text))}`;
      break;
    default:
      cached = controls.zawae.checked
        ? `&nbsp;${text}`
        : `&nbsp;${removeDotting(text)}`;
      break;
  }

  zawaeLabelCache[key] = cached
  return cached;
}

const getWordKey = () => {
  switch (controls.fontFamily.value) {
    case 'syr':
    case 'est':
      return controls.zawae.checked ? 'a' : 'c';
    case 'heb':
      return controls.zawae.checked ? 'h' : 'j';
    case 'ser':
      return controls.zawae.checked ? 's' : 'c'; // consonant can be re-used for serto
    case 'cal':
      return controls.zawae.checked ? 'w' : 'x'; // CAL
    default:
      return '';
  }
}

const togglePunctuation = (elem) => {
  if (controls.zawae.checked) {
    elem.classList.replace('nsunc', 'sunc');
    elem.classList.replace('nsun', 'sun');
    elem.classList.replace('ndot', 'dot');
    elem.classList.replace('ncln', 'cln');
    elem.classList.replace('nsunp', 'sunp');
    elem.classList.replace('nlpar', 'lpar');
  }
  else {
    elem.classList.replace('sunc', 'nsunc');
    elem.classList.replace('sun', 'nsun');
    elem.classList.replace('dot', 'ndot');
    elem.classList.replace('cln', 'ncln');
    elem.classList.replace('sunp', 'nsunp');
    elem.classList.replace('lpar', 'nlpar');
  }
}

const toggleText = (event) => {
  event && event.stopImmediatePropagation();

  const globalKey = getWordKey();
  controls.book.innerHTML = getBook(globalKey);
  controls.chapter.innerHTML = getChapter(globalKey);
  controls.zawaeLabel.innerHTML = getZawaeLabel(globalKey);
  for (let i = page.range.minVerse; i <= page.range.maxVerse; i++) {
    let words = verses[i];
    for (let j = 0; j < words.length; j++) {
      let wobj = words[j];
      // verse number have no vowels so we can re-use 'h' or 'a' or 'w' cache
      const key = j == 0
        ? (controls.fontFamily.value == 'heb' ?
          'h' :
          controls.fontFamily.value == 'cal'
            ? 'w'
            : 'a')
        : globalKey;
      let word = wobj[key];
      if (!word) {
        const fontFamily = controls.fontFamily.value
        switch (fontFamily) {
          case 'syr':
          case 'est':
          case 'ser':
            if (controls.zawae.checked) {
              wobj[key] = word = toWesternSyriac(wobj.w); // eastern is already cached from page loading
            }
            else {
              wobj[key] = word = toEasternSyriac(removeDotting((wobj.w))); // consonant is good for all 3
            }
            break;
          case 'heb':
            if (j == 0) {
              wobj[key] = word = cal_heb_no[wobj.w];
            }
            else {
              wobj[key] = word = toHebrew(controls.zawae.checked ? wobj.w : removeDotting((wobj.w)));
            }
            break;
          default:
            wobj[key] = word = (controls.zawae.checked || j == 0)
              ? wobj.w
              : removeDotting(wobj.w);
            break;
        }
      }
      const id = i + '-' + j;
      j && togglePunctuation(page.elements.word[id]);
      page.elements.word[id].innerText = word;
    }
  }
}

controls.fontFamily.addEventListener('change', (event) => {
  event.stopImmediatePropagation();
  let newFont = controls.fontFamily.value;
  let options = controls.fontFamily.options;
  for (let i = 0; i < options.length; i++) {
    let oldFont = options[i].value;
    if (oldFont == newFont || !page.elements.word[`${page.range.minVerse}-1`].classList.contains(oldFont)) {
      continue;
    }
    document.querySelectorAll(`.${oldFont}`).forEach(
      element => element.classList.replace(oldFont, newFont)
    );
  }
  toggleText();
}, (passiveSupported ? { passive: true } : false));

controls.zawae.addEventListener('change', toggleText, (passiveSupported ? { passive: true } : false));

controls.stickyHeader.addEventListener('click', (event) => {
  event.stopImmediatePropagation();
  if (controls.stickyHeader.checked) {
    document.getElementsByTagName('header')[0].classList.add('sticky');
  } else {
    document.getElementsByTagName('header')[0].classList.remove('sticky');
  }
}, (passiveSupported ? { passive: true } : false));

function zeroFill(number, totalLength) {
  const numberString = number.toString();
  return numberString.padStart(totalLength, '0');
}

controls.gotoChapter.addEventListener('change',
  function () {
    const bookFill = zeroFill(page.info.book.n, 2);
    const bookName = page.info.book.i;
    const chapterFill = zeroFill(controls.gotoChapter.value, 2);
    const selectedPage = `${bookFill}_${bookName}_${chapterFill}.html`;
    window.location.href = selectedPage;
  },
  (passiveSupported ? { passive: true } : false));

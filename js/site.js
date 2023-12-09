'use strict';
import books from './peshitta.js'
import { toCal as syriacToCal } from './syriac-cal.js';
import { toHebrew } from './cal-hebrew.js';
import { toWesternSyriac } from './cal-syriac.js';

export default (bookNo, chapterNo) => {
  verses = books[bookNo][chapterNo];
  page.info = {
    book: {
      w: books[0][0],
      p: books[0][1],
      n: bookNo
    },
    chapter: {
      w: verses[0][0],
      n: chapterNo
    }
  };

  for (let i = 1; i < verses.length; i++) {
    var cues = [0];
    page.cues.push(cues);
    let words = verses[i];
    for (let j = 0; j < words.length; j++) {
      let wobj = words[j];
      let word = wobj.w;
      let id = i + '-' + j;
      if (j == 0) {
        page.elements.word[id] = document.getElementById(id + 'w');
        continue;
      }
      let interlinear = wobj.i;
      cues.push(wobj.t);

      // cache DOM refs
      page.elements.word[id] = document.getElementById(id + 'w');
      page.elements.inter[id] = document.getElementById(id + 'i');

      page.elements.word[id].innerText = word;
      page.elements.inter[id].innerText = interlinear;
    }
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
const elemIds = ['stickyHeader', 'fontFamily', 'book', 'chapter', 'zawae', 'zawaeLabel'];
for (let i = 0; i < elemIds.length; i++) {
  const elemId = elemIds[i];
  if (!(controls[elemId] = document.getElementById(elemId))) {
    const msg = `Could not find page element with id ${elemId}`;
    alert(msg);
    throw new Error(msg);
  }
}

const syr_heb_no = {
  "ܐ": "א",
  "ܒ": "ב",
  "ܓ": "ג",
  "ܕ": "ד",
  "ܗ": "ה",
  "ܘ": "ו",
  "ܙ": "ז",
  "ܚ": "ח",
  "ܛ": "ט",
  "ܝ": "י",
  "ܝܐ": "יא",
  "ܝܒ": "יב",
  "ܝܓ": "יג",
  "ܝܕ": "יד",
  "ܝܗ": "טו",
  "ܝܘ": "טז",
  "ܝܙ": "יז",
  "ܝܚ": "יח",
  "ܝܛ": "יט",
  "ܟ": "כ",
  "ܟܐ": "כא",
  "ܟܒ": "כב",
  "ܟܓ": "כג",
  "ܟܕ": "כד",
  "ܟܗ": "כה",
  "ܟܘ": "כו",
  "ܟܙ": "כז",
  "ܟܚ": "כח",
  "ܟܛ": "כט",
  "ܠ": "ל",
  "ܠܐ": "לא",
  "ܠܒ": "לב",
  "ܠܓ": "לג",
  "ܠܕ": "לד",
  "ܠܗ": "לה",
  "ܠܘ": "לו",
  "ܠܙ": "לז",
  "ܠܚ": "לח",
  "ܠܛ": "לט",
  "ܡ": "מ",
  "ܡܐ": "מא",
  "ܡܒ": "מב",
  "ܡܓ": "מג",
  "ܡܕ": "מד",
  "ܡܗ": "מה",
  "ܡܘ": "מו",
  "ܡܙ": "מז",
  "ܡܚ": "מח",
  "ܡܛ": "מט",
  "ܢ": "נ"
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
const consonantsRegex = /[\u0710-\u072F]+/gu;

const getConsonants = (text) => {
  if (typeof text !== 'string') return '';
  return (text.match(consonantsRegex) || []).join('');
}

const getHebrew = (text) => toHebrew(syriacToCal(text));

const getSerto = (text) => toWesternSyriac(syriacToCal(text));

const getBook = (key) => {
  let cached = bookCache[key]
  if (cached) {
    return cached;
  }

  const prefix = 'ܟܵܪܘܼܙܘܼܬ݂ܵܐ';
  switch (controls.fontFamily.value) {
    case 'syr':
    case 'est':
      cached = controls.zawae.checked
        ? `&nbsp;${prefix}&nbsp;ܕ${page.info.book.w}`
        : `&nbsp;${getConsonants(prefix)}&nbsp;ܕ${getConsonants(page.info.book.w)}`;
      break;
    case 'heb':
      cached = controls.zawae.checked
        ? `&nbsp;${getHebrew(prefix)}&nbsp;${getHebrew('ܕ')}${getHebrew(page.info.book.w)}`
        : `&nbsp;${getHebrew(getConsonants(prefix))}&nbsp;${getHebrew('ܕ')}${getHebrew(getConsonants(page.info.book.w))}`;
      break;
    default:
      cached = controls.zawae.checked
        ? `&nbsp;${getSerto(prefix)}&nbsp;ܕ${page.info.book.w}`
        : `&nbsp;${getConsonants(prefix)}&nbsp;ܕ${getConsonants(page.info.book.w)}`;
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

  const prefix = 'ܨܚܵܚܵܐ';
  switch (controls.fontFamily.value) {
    case 'syr':
    case 'est':
      cached = controls.zawae.checked
        ? `&nbsp;${prefix}&nbsp;${page.info.chapter.w}`
        : `&nbsp;${getConsonants(prefix)}&nbsp;${getConsonants(page.info.chapter.w)}`;
      break;
    case 'heb':
      cached = controls.zawae.checked
        ? `&nbsp;${getHebrew(prefix)}&nbsp;${getHebrew(page.info.chapter.w)}`
        : `&nbsp;${getHebrew(getConsonants(prefix))}&nbsp;${getHebrew(getConsonants(page.info.chapter.w))}`;
      break;
    default:
      cached = controls.zawae.checked
        ? `&nbsp;${getSerto(prefix)}&nbsp;${page.info.chapter.w}`
        : `&nbsp;${getConsonants(prefix)}&nbsp;${getConsonants(page.info.chapter.w)}`;
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

  const text = 'ܙܵܘܥܹ̈ܐ';
  switch (controls.fontFamily.value) {
    case 'syr':
    case 'est':
      cached = controls.zawae.checked
        ? `&nbsp;${text}`
        : `&nbsp;${getConsonants(text)}`;
      break;
    case 'heb':
      cached = controls.zawae.checked
        ? `&nbsp;${getHebrew(text)}`
        : `&nbsp;${getHebrew(getConsonants(text))}`;
      break;
    default:
      cached = controls.zawae.checked
        ? `&nbsp;${getSerto(text)}`
        : `&nbsp;${getConsonants(text)}`;
      break;
  }

  zawaeLabelCache[key] = cached
  return cached;
}

const getWordKey = () => {
  switch (controls.fontFamily.value) {
    case 'syr':
    case 'est':
      return controls.zawae.checked ? 'w' : 'c';
    case 'heb':
      return controls.zawae.checked ? 'h' : 'j';
    default:
      return controls.zawae.checked ? 's' : 'q';
  }
}

const toggleText = (event) => {
  event && event.stopImmediatePropagation();

  const key = getWordKey();
  controls.book.innerHTML = getBook(key);
  controls.chapter.innerHTML = getChapter(key);
  controls.zawaeLabel.innerHTML = getZawaeLabel(key);
  for (let i = 1; i < verses.length; i++) {
    let words = verses[i];
    for (let j = 0; j < words.length; j++) {
      let wobj = words[j];
      let word = wobj[key];
      if (!word) {
        switch (controls.fontFamily.value) {
          case 'syr':
          case 'est':
            wobj[key] = word = controls.zawae.checked ? wobj.w : getConsonants((wobj.w));
            break;
          case 'heb':
            if (j == 0) {
              wobj[key] = word = syr_heb_no[wobj.w];
            }
            else {
              wobj[key] = word = controls.zawae.checked ? getHebrew(wobj.w) : getHebrew(getConsonants((wobj.w)));
            }
            break;
          default:
            wobj[key] = word = controls.zawae.checked ? getSerto(wobj.w) : getConsonants((wobj.w));
            break;
        }
      }
      page.elements.word[i + '-' + j].innerText = word;
    }
  }
}

controls.fontFamily.addEventListener('change', (event) => {
  event.stopImmediatePropagation();
  let newFont = controls.fontFamily.value;
  let options = controls.fontFamily.options;
  for (let i = 0; i < options.length; i++) {
    let oldFont = options[i].value;
    if (oldFont == newFont || !page.elements.word['1-1'].classList.contains(oldFont)) {
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

'use strict';
import books from './peshitta.js'

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
    for (let j = 1; j < words.length; j++) {
      let wobj = words[j];
      let word = wobj.w;
      let interlinear = wobj.i;
      let id = i + '-' + j;
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

const getBook = (key) => {
  let cached = bookCache[key]
  if (cached) {
    return cached;
  }

  const prefix = 'ܟܵܪܘܼܙܘܼܬ݂ܵܐ';
  cached = controls.zawae.checked
    ? `&nbsp;${prefix}&nbsp;ܕ${page.info.book.w}`
    : `&nbsp;${getConsonants(prefix)}&nbsp;ܕ${getConsonants(page.info.book.w)}`;
  bookCache[key] = cached
  return cached;
}

const getChapter = (key) => {
  let cached = chapterCache[key]
  if (cached) {
    return cached;
  }

  const prefix = 'ܨܚܵܚܵܐ';
  cached = controls.zawae.checked
    ? `&nbsp;${prefix}&nbsp;${page.info.chapter.w}`
    : `&nbsp;${getConsonants(prefix)}&nbsp;${getConsonants(page.info.chapter.w)}`;
  chapterCache[key] = cached
  return cached;
}

const getZawaeLabel = (key) => {
  let cached = zawaeLabelCache[key]
  if (cached) {
    return cached;
  }

  const text = 'ܙܵܘܥܹ̈ܐ';
  cached = controls.zawae.checked
    ? `&nbsp;${text}`
    : `&nbsp;${getConsonants(text)}`;
  zawaeLabelCache[key] = cached
  return cached;
}

const getWordKey = () => controls.zawae.checked ? 'w' : 'c';

const toggleText = (event) => {
  event.stopImmediatePropagation();

  const key = getWordKey();
  controls.book.innerHTML = getBook(key);
  controls.chapter.innerHTML = getChapter(key);
  controls.zawaeLabel.innerHTML = getZawaeLabel(key);
  for (let i = 1; i < verses.length; i++) {
    let words = verses[i];
    for (let j = 1; j < words.length; j++) {
      let wobj = words[j];
      let word = wobj[key];
      if (!word) {
        wobj[key] = word = controls.zawae.checked ? wobj.w : getConsonants((wobj.w));
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

'use strict';

(function () {
  const niqqud = document.getElementById('niqqud');
  const transliterate = document.getElementById('transliterate');
  const syllables = document.getElementById('syllables');
  const stickyHeader = document.getElementById('sticky-header');
  const passiveSupported = window.getPassiveSupported();

  if (!niqqud || !transliterate || !syllables || !stickyHeader) {
    console.error('Could not find required page element');
    return;
  }

  function toggleText(event) {
    event.stopImmediatePropagation();

    let reveal = '';
    switch (niqqud.value) {
      case 'vowels':
        reveal = '.hide[id$=v]';
        break;
      case 'cantillation':
        reveal = '.hide[id$=a]';
        break;
      default:
        reveal = '.hide[id$=c]';
        break;
    }

    const shows = document.querySelectorAll('.show');
    const hides = document.querySelectorAll(reveal);
    shows.forEach(elem => elem.classList.replace('show', 'hide'));
    hides.forEach(elem => elem.classList.replace('hide', 'show'));
  }
  niqqud.addEventListener('change', toggleText, (passiveSupported ? { passive: true } : false));

  transliterate.addEventListener('change', function (event) {
    event.stopImmediatePropagation();
    if (transliterate.value == 'academic' || transliterate.value == 'general') {
      syllables.disabled = false;
      let reveal = transliterate.value == 'academic' ? '.ntran[id$=t]' : '.ntran[id$=g]';
      let hide = transliterate.value == 'academic' ? '.tran[id$=g]' : '.tran[id$=t]';
      document.querySelectorAll(hide).forEach(
        ntran => ntran.classList.replace('tran', 'ntran'));
      document.querySelectorAll(reveal).forEach(
        ntran => ntran.classList.replace('ntran', 'tran'));
    }
    else {
      syllables.disabled = true;
      document.querySelectorAll('.tran').forEach(
        tran => tran.classList.replace('tran', 'ntran'));
    }
  }, (passiveSupported ? { passive: true } : false));

  syllables.addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    if (syllables.checked) {
      document.querySelectorAll('span.h').forEach(
        h => h.classList.replace('h', 's'));
      return;
    }
    document.querySelectorAll('span.s').forEach(
      s => s.classList.replace('s', 'h'));
  }, (passiveSupported ? { passive: true } : false));

  stickyHeader.addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    if (stickyHeader.checked) {
      document.getElementsByTagName('header')[0].classList.add('sticky');
    } else {
      document.getElementsByTagName('header')[0].classList.remove('sticky');
    }
  }, (passiveSupported ? { passive: true } : false));
})();

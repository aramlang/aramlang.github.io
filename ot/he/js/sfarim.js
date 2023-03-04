'use strict';

(function () {
  const niqqud = document.getElementById('niqqud');
  const transliterate = document.getElementById('transliterate');
  const passiveSupported = window.getPassiveSupported();

  if (!niqqud || !transliterate) {
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

  transliterate.addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    if (transliterate.value == 'academic' || transliterate.value == 'general') {
      document.querySelectorAll('.ntran').forEach(
        ntran => ntran.classList.replace('ntran', 'tran'));
    }
    else {
      document.querySelectorAll('.tran').forEach(
        tran => tran.classList.replace('tran', 'ntran'));
    }
  }, (passiveSupported ? { passive: true } : false));
})();

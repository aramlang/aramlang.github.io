'use strict';

(function () {
  const niqqud = document.getElementById('niqqud');
  const passiveSupported = window.getPassiveSupported();

  if (!niqqud) {
    console.error('Could not find required niqqud element');
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
})();

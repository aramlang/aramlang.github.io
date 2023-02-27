'use strict';

(function() {

  const zawae = document.getElementById('zawae');
  const passiveSupported = getPassiveSupported();

  if (!zawae) {
    console.error('Could not find required page element');
    return;
  }

  zawae.addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    const shows = document.querySelectorAll('.show');
    const hides = document.querySelectorAll('.hide');
    shows.forEach(elem => elem.classList.replace('show', 'hide'));
    hides.forEach(elem => elem.classList.replace('hide', 'show'));
  }, (passiveSupported ? { passive: true } : false));

})();

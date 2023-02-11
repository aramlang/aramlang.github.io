(function () {
  const passiveSupported = window.sapra.passiveSupported;
  const fontFamilySelect = document.getElementById('font-family');
  if (!fontFamilySelect) {
    console.error("Missing 'font-family' select element");
    return;
  }

  fontFamilySelect.addEventListener('change', function (event) {
    event.stopImmediatePropagation();
    let newFont = fontFamilySelect.value;
    var options = fontFamilySelect.children;
    for (let i = 0; i < options.length; i++) {
      let oldFont = options[i].value;
      if (oldFont == newFont) {
        continue;
      }
      document.querySelectorAll(`.${oldFont}`).forEach(
        element => element.classList.replace(oldFont, newFont)
      );
    }
  }, (passiveSupported ? { passive: true } : false));
})();

const audioAvailable = document.body.dataset.audio === 'true';
const chapterSelect = document.getElementById('gotoChapter');

if (!audioAvailable) {
  chapterSelect.addEventListener('change', () => {
    const chapter = chapterSelect.value.padStart(2, '0');
    window.location.href = `01_Mattai_${chapter}.html`;
  });
} else {
  const volume = document.getElementById('volume');
  const volumeButton = document.getElementById('volumeBtn');
  const volumePanel = document.querySelector('.volume-panel');
  const volumeLevel = document.getElementById('volumeLevel');
  const closeVolume = document.getElementById('closeVolume');
  const main = document.getElementById('reader-main');

  for (const [activeId, nextId] of [['playBtn', 'pauseBtn'], ['pauseBtn', 'playBtn']]) {
    const button = document.getElementById(activeId);
    button.addEventListener('click', () => {
      if (document.activeElement === button) {
        requestAnimationFrame(() => document.getElementById(nextId).focus({ preventScroll: true }));
      }
    });
  }

  volumePanel.addEventListener('click', event => event.stopPropagation());
  volumeLevel.addEventListener('input', () => {
    Howler.volume(Number(volumeLevel.value));
  });
  closeVolume.addEventListener('click', () => volume.click());

  // The shared player owns the overlay; keep its visibility and keyboard focus in sync.
  new MutationObserver(() => {
    const open = volume.style.display === 'block';
    volume.setAttribute('aria-hidden', String(!open));
    volumeButton.setAttribute('aria-expanded', String(open));
    if (open) {
      volumeLevel.value = String(Howler.volume());
      volumeLevel.focus();
    } else if (volume.contains(document.activeElement)) {
      volumeButton.focus();
    }
  }).observe(volume, { attributes: true, attributeFilter: ['style'] });

  volume.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      volume.click();
    } else if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === closeVolume) {
        event.preventDefault();
        volumeLevel.focus();
      } else if (!event.shiftKey && document.activeElement === volumeLevel) {
        event.preventDefault();
        closeVolume.focus();
      }
    }
  });

  document.addEventListener('pageCompleted', () => {
    main.querySelectorAll('.verse-text .col').forEach(column => {
      const button = column.querySelector('a, button')
        ? column.querySelector('[id$="w"]')
        : column;
      button.classList.add('word-audio');
      button.setAttribute('role', 'button');
      button.tabIndex = 0;
      button.title = 'Play this word';
      if (button !== column) {
        button.setAttribute('aria-describedby', column.querySelector('[id$="i"]').id);
      }
    });
  });

  main.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    const button = event.target;
    if (button.matches('.word-audio')) {
      event.preventDefault();
      const word = button.matches('.col') ? button.querySelector('[id$="w"]') : button;
      word.click();
    }
  });

  main.addEventListener('click', event => {
    if (event.target.matches('.col[role="button"]')) {
      event.target.querySelector('[id$="w"]').click();
    }
  });
}

'use strict';

document.addEventListener('pageCompleted', (event) => {
  class Player {
    constructor() {
      this.regularPlaylist = this.loadPlaylist();
      this.pausePlaylist = null; // load upon request only
      this.playlist = this.regularPlaylist;
      this.highlighted = {};
      this.paused = {};
      for (let i = page.range.minVerse; i <= page.range.maxVerse; i++) {
        this.highlighted[i] = {};
        this.paused[i] = {}
      }
      this.index = page.range.minVerse;
      this.requestHighlightId = 0;
      this.startWord = 1;       // to prevent pausing before saying the word
      this.suspendStep = false; // set to true if suspending of this.step logic is wanted
      this.blankAudio = 0;      // start with no blank audio
    }
    get sound() {
      return this.playlist[this.index].howl;
    }
    get hasPause() {
      return this.blankAudio > 0;
    }
    get usePauseTimer() {
      return this.blankAudio > 1;
    }
    get pauseTime() {
      return this.blankAudio > 1 ? (this.blankAudio - 1) * 1000 : 0;
    }
    step() {
      const self = this;
      if (self.suspendStep) {
        return;
      }

      const sound = self.sound;
      if (!sound.playing()) {
        return;
      }

      // Determine our current seek position.
      const seek = sound.seek() || 0;
      const verseCues = page.cues[self.index];
      for (let i = this.findClosestIndex(seek); i < verseCues.length; i++) {
        if (i <= 0) {
          break;
        }

        if (i in self.highlighted[self.index]) { // word already highlighted, move on
          if (this.usePauseTimer && seek > (this.getCueEnd(verseCues, i) + 0.3) && !self.paused[self.index][i] && sound.playing()) {
            sound.pause();
            self.paused[self.index][i] = true;
            self.wordTimeout = setTimeout(() => {
              if (sound == self.sound) {
                sound.play();
              }
            }, this.pauseTime);
          }
          break;
        }

        // word needs to be highlighted
        let id = `${self.index}-${i}`;
        let elems = self.highlighted[self.index][i] = [];
        for (const key in page.elements) {
          let elem = page.elements[key][id];
          elem.classList.add('highlight');
          elems.push(elem);
        }

        window.requestAnimationFrame(() => {
          const elem = page.elements.inter[id];
          if (!isInViewport(elem)) {
            elem.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest"
            });
          }
        });
        break;
      }
    }
    play() {
      const sound = this.sound;
      if (!sound.playing()) {
        sound.play();
        enable('pauseBtn');
      }
      if (!this.requestHighlightId) {
        this.requestHighlight();
      }
    }
    pause() {
      this.sound.pause();
      enable('playBtn');
    }
    skip(direction) {
      // Get the next track based on the direction of the track.
      let index = page.range.minVerse;
      if (direction === 'prev') {
        index = this.index - 1;
        if (index < parseInt(controls.startVerse.value)) {
          index = controls.endVerse.value;
          if (controls.loop.checked) {
            this.skipTo(index);
          }
          else {
            this.index = index;
          }
        }
        else {
          this.skipTo(index);
        }
      } else {
        index = this.index + 1;
        if (index > parseInt(controls.endVerse.value)) {
          index = parseInt(controls.startVerse.value);
          if (controls.loop.checked) {
            this.skipTo(index);
          }
          else {
            this.index = index;
          }
        }
        else {
          this.skipTo(index);
        }
      }
    }
    skipTo(index, position) {
      if (!position) {
        this.startWord = 1;
      }

      this.clearHighlighted();
      let sound = this.sound;
      if (this.index != index) {
        sound.pause();
        sound.seek(0);

        this.index = index;
        sound = this.sound // new sound
      }

      if (position) {
        sound.seek(position);
      }

      this.play();
    }
    volume(val) {
      // Update the global volume (affecting all Howls).
      Howler.volume(val);

      // Update the display on the slider.
      let barWidth = (val * 90) / 100;
      controls.barFull.style.width = (barWidth * 100) + '%';
      controls.sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
    }
    rate(rate) {
      // enumerate Howls and set the rate for all.
      for (let i = page.range.minVerse; i <= page.range.maxVerse; i++) {
        this.regularPlaylist[i].howl.rate(rate);
      }
      if (!this.pausePlaylist) {
        return;
      }
      for (let i = page.range.minVerse; i <= page.range.maxVerse; i++) {
        this.pausePlaylist[i].howl.rate(rate);
      }
    }
    loadPlaylist(rate) {
      const self = this;
      const book = page.info.book.i;
      const bookNo = page.info.book.n.toString().padStart(2, '0');
      const chapterNo = page.info.chapter.n.toString().padStart(2, '0');
      const playlist = [{}]; // 1 based index
      const ext = [page.isMobileEdge ? 'mp3' : 'm4a', page.isMobileEdge ? 'm4a' : 'mp3'];
      const usePause = this.hasPause;
      let pendingTracks = page.range.maxVerse - page.range.minVerse + 1;
      let audioPrefix = '';

      if (usePause) {
        controls.loadingScreen.style.display = 'block';
        audioPrefix = 'P_';
      }

      for (let i = page.range.minVerse; i <= page.range.maxVerse; i++) {
        const verseNo = i.toString().padStart(2, '0');
        const title = `${book} ${chapterNo}:${verseNo}`;
        const file = `${bookNo}_${book}_${chapterNo}_${verseNo}`;
        const howl = new Howl({
          src: [`../../media/${audioPrefix}${file}.${ext[0]}`],
          html5: false,
          preload: true,
          onplayerror: function (_, e) {
            alert(`Error playing audio ${e}`);
            controls.loadingScreen.style.display = 'none';
          },
          onloaderror: function (_, e) {
            switch (e) {
              case 1:
                alert('You aborted the audio playback.');
                break;
              case 2:
                alert(
                  `'${file}'\n either does not exist or there was a network failure`
                );
                break;
              case 3:
                alert(
                  'The audio playback was aborted due to a corruption problem or because your browser does not support it.'
                );
                break;
              case 4:
                alert(`'${file}' cannot be played.\n\nFile might not exist or is not supported.`);
                break;
              default:
                alert('An unknown error occurred.');
                break;
            }
            controls.loadingScreen.style.display = 'none';
          },
          onend: function () {
            enable('playBtn');
            self.clearHighlighted();
            self.skip('next');
          },
        });
        if (rate && rate != 1) {
          howl.rate(rate);
        }
        howl.once('load', () => {
          if (--pendingTracks < 1) {
            controls.loadingScreen.style.display = 'none';
          }
        });
        playlist[i] = { title, howl };
      }
      return playlist;
    }
    switchPlaylist(newPlaylist) {
      const currentSound = this.sound; // current sound
      const isPlaying = currentSound.playing() || this.wordTimeout > 0;
      if (isPlaying) {
        this.clearPauseTimeout();
        currentSound.pause();
      }
      currentSound.seek(0);

      const verse = this.highlighted[this.index];
      const wordNos = Object.keys(verse);
      const wordNo = wordNos.length > 0 ? Math.max(...(wordNos.map(Number))) : 1;
      const verseCues = page.cues[this.index];
      const position = this.getCueStart(verseCues, wordNo, true);

      this.playlist = newPlaylist;
      const newSound = this.sound; // new sound
      newSound.seek(position);
      if (isPlaying) {
        newSound.play();
      }
    }
    setPlaylist(blankAudio) {
      try {
        player.suspendStep = true;
        this.blankAudio = blankAudio;
        if (this.hasPause) {
          if (!this.pausePlaylist) {
            this.pausePlaylist = this.loadPlaylist(this.sound.rate());
          }
          if (this.playlist != this.pausePlaylist) {
            this.switchPlaylist(this.pausePlaylist);
          }
        }
        else if (this.playlist != this.regularPlaylist) {
          this.switchPlaylist(this.regularPlaylist);
        }
      } catch (ex) {
        alert(ex)
      } finally {
        player.suspendStep = false;
      }
    }
    requestHighlight() {
      // to simplify logic, we will continually poll for highlight once first interaction with audio
      if (!this.requestHighlightId) {
        this.requestHighlightId = window.setInterval(this.step.bind(this), 20);
      }
    }
    clearHighlighted() {
      let self = this;
      for (let verseNo in self.highlighted) {
        const verseHighlighted = self.highlighted[verseNo];
        for (let wordNo in verseHighlighted) {
          const words = verseHighlighted[wordNo];
          words.forEach(word => word.classList.remove('highlight'));
        }
        self.highlighted[verseNo] = {};
      }
      for (let verseNo in self.paused) {
        const versePaused = self.paused[verseNo];
        for (let wordNo in versePaused) {
          versePaused[wordNo] = false;
        }
        self.highlighted[verseNo] = {};
      }
      self.clearPauseTimeout()
    }
    clearPauseTimeout() {
      if (this.wordTimeout) {
        clearTimeout(this.wordTimeout);
        this.wordTimeout = 0;
      }
    }
    findClosestIndex(seek) {
      const cues = page.cues[this.index];
      let i = 0;
      for (; i < cues.length; i++) {
        let val = this.getCueStart(cues, i);
        let diff = seek - val;
        if (diff < 0) {
          break;
        }
      }
      return i - 1;
    }
    getCueStart(verseCues, wordId, adjust) {
      const seek = verseCues[wordId].s + (this.hasPause ? (wordId > 0 ? (wordId - 1) : 0) : 0); // add wordId - 1 seconds if pause
      return seek + (adjust ? 0.01 : 0);
    }
    getCueEnd(verseCues, wordId) {
      return verseCues[wordId].e + (this.hasPause ? (wordId > 0 ? (wordId - 1) : 0) : 0); // add wordId - 1 seconds if pause
    }
  }

  const page = event.detail;
  const passiveSupported = page.passiveSupported; // let getPassiveSupported detect if true

  // Cache references to DOM elements.
  const controls = {};
  const elemIds = ['playBtn', 'pauseBtn', 'volumeBtn', 'loading', 'volume', 'barEmpty', 'barFull', 'sliderBtn', 'startVerse', 'endVerse', 'loop', 'speed', 'loadingScreen', 'wordPause'];
  for (let i = 0; i < elemIds.length; i++) {
    const elemId = elemIds[i];
    if (!(controls[elemId] = document.getElementById(elemId))) {
      alert(`Could not find page element with id ${elemId}`);
      return;
    }
  }

  const toggleVolume = () => {
    let display = (controls.volume.style.display === 'block') ? 'none' : 'block';

    setTimeout(() => {
      controls.volume.style.display = display;
    }, (display === 'block') ? 0 : 500);
    controls.volume.className = (display === 'block') ? 'fadein' : 'fadeout';
  }

  const enable = (button) => {
    controls.loading.style.display = button === 'loading' ? 'block' : 'none';
    controls.playBtn.style.display = button === 'playBtn' ? 'block' : 'none';
    controls.pauseBtn.style.display = button === 'pauseBtn' ? 'block' : 'none';
  }

  const getVerseWord = (id) => {
    let split;
    return id && (split = id.split('-')).length > 1 ? split : [null, null];
  }

  const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  let sliderDown = false;
  const move = (event) => {
    if (sliderDown) {
      let x = event.clientX || event.touches[0].clientX;
      let startX = window.innerWidth * 0.05;
      let layerX = x - startX;
      let per = Math.min(1, Math.max(0, layerX / parseFloat(controls.barEmpty.scrollWidth)));
      player.volume(per);
    }
  };

  // Bind our player controls.
  controls.playBtn.addEventListener('click', () => {
    player.clearPauseTimeout();
    player.play();
  }, (passiveSupported ? { passive: true } : false));

  controls.pauseBtn.addEventListener('click', () => {
    player.clearPauseTimeout();
    player.pause();
  }, (passiveSupported ? { passive: true } : false));

  controls.wordPause.addEventListener('change', () => {
    player.setPlaylist(parseInt(controls.wordPause.value.trim() || 0));
  }, (passiveSupported ? { passive: true } : false));

  controls.volumeBtn.addEventListener('click', () => {
    toggleVolume();
  }, (passiveSupported ? { passive: true } : false));

  controls.volume.addEventListener('click', () => {
    toggleVolume();
  }, (passiveSupported ? { passive: true } : false));

  // Setup the event listeners to enable dragging of volume slider.
  controls.barEmpty.addEventListener('click', (event) => {
    let per = event.layerX / parseFloat(controls.barEmpty.scrollWidth);
    player.volume(per);
  }, (passiveSupported ? { passive: true } : false));

  controls.sliderBtn.addEventListener('mousedown', () => {
    sliderDown = true;
  }, (passiveSupported ? { passive: true } : false));

  controls.sliderBtn.addEventListener('touchstart', () => {
    sliderDown = true;
  }, (passiveSupported ? { passive: true } : false));

  controls.volume.addEventListener('mouseup', () => {
    sliderDown = false;
  }, (passiveSupported ? { passive: true } : false));

  controls.volume.addEventListener('touchend', () => {
    sliderDown = false;
  }, (passiveSupported ? { passive: true } : false));

  controls.volume.addEventListener('mousemove', move, (passiveSupported ? { passive: true } : false));

  controls.volume.addEventListener('touchmove', move, (passiveSupported ? { passive: true } : false));

  controls.speed.addEventListener('change', (event) => {
    event.stopImmediatePropagation();
    let target = event.target;
    if (!target || !target.id || !target.id.startsWith('speed')) {
      return;
    }
    let rate = parseFloat(target.value);
    player.rate(rate);
  }, (passiveSupported ? { passive: true } : false));

  document.querySelector('main').addEventListener('click', (event) => {
    event.stopImmediatePropagation();
    const target = event.target;
    if (!target || !target.id || target.classList.contains('parsh')) { return; }

    let id = target.id.match(/(\d+-\d+)/);
    if (!id || !(id = id[0])) { return; }
    const [verseId, wordId] = getVerseWord(id);
    let verseCues, cue;
    if (!verseId || !wordId || !(verseCues = page.cues[verseId]) || !(cue = player.getCueStart(verseCues, wordId, true))) { return; }

    const verseNo = parseInt(verseId);
    const startNo = parseInt(controls.startVerse.value);
    const endNo = parseInt(controls.endVerse.value);
    if (verseNo < startNo) {
      controls.startVerse.value = verseId;
    }

    if (verseNo > endNo) {
      controls.endVerse.value = verseId;
    }

    player.startWord = wordId;
    player.skipTo(verseNo, cue);
  }, (passiveSupported ? { passive: true } : false));

  startVerse.addEventListener('change', (event) => {
    event.stopImmediatePropagation();
    let start = parseInt(startVerse.value);
    let end = parseInt(endVerse.value);

    if (start > end) {
      endVerse.value = startVerse.value;
      start = end = parseInt(startVerse.value);
    }

    if (!controls.loop.checked) {
      return;
    }
    const sound = player.sound;
    if (!sound) {
      return;
    }

    const current = player.index;
    if (current < start || current > end) {
      if (sound.playing()) {
        player.skipTo(start);
      }
      else {
        player.index = start;
      }
    }
  }, (passiveSupported ? { passive: true } : false));

  endVerse.addEventListener('change', (event) => {
    event.stopImmediatePropagation();
    let start = parseInt(startVerse.value);
    let end = parseInt(endVerse.value);

    if (start > end) {
      startVerse.value = endVerse.value;
      start = end = parseInt(startVerse.value);
    }

    if (!controls.loop.checked) {
      return;
    }
    const sound = player.sound;
    if (!sound) {
      return;
    }
    if (!sound.playing()) {
      return;
    }

    const current = player.index;
    if (current < start || current > end) {
      player.skipTo(start);
    }
  }, (passiveSupported ? { passive: true } : false));

  const player = new Player();
});

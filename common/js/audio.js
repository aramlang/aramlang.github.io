'use strict';

function getPassiveSupported() {
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
}

function setupAudio(
  suffixes,   // list of id suffixes to highlight in page,
  book,       // current book name
  chapter     // current chapter
) {

  // #region Init

  const audio = document.getElementById('audio');
  const audioTrack = document.getElementById('audio-track');
  const loop = document.getElementById('loop');
  const chapterLoop = document.getElementById('chapter-loop');
  const startVerse = document.getElementById('start-verse');
  const endVerse = document.getElementById('end-verse');
  const startChapter = document.getElementById('start-chapter');
  const endChapter = document.getElementById('end-chapter');

  const fontFamily = document.getElementById('font-family');
  const speed = document.getElementById('speed');
  const gotoChapter = document.getElementById('goto-chapter');
  const wordPause = document.getElementById('word-pause');

  const supportedRates = [];       // supported audio speed rates
  const hashPrefix = '#ch'         // prefix to prepend to next page hash
  const startAdjustment = 0.005;   // some start time tolerance
  const endAdjustment = 0.005;     // some end time tolerance
  const cues = {};                 // cue dtos

  let highlighted = [];            // highlighted elements
  let changedFromSpeed = false;    // flag to prevent event circular running
  let startTime = startAdjustment; // current loop start time
  let endTime;                     // current loop end time

  if (!audio || !audioTrack || !loop || !startVerse || !endVerse || !chapterLoop || !startChapter || !endChapter) {
    console.error('Could not find required page element');
    return;
  }

  const maxVerse = startVerse.options.length;     // number of verses in this chapter
  const maxChapter = startChapter.options.length; // number of chapters in this book
  const passiveSupported = getPassiveSupported(); // let getPassiveSupported detect if true

  // #endregion

  // #region Audio

  const [startTimer, clearTimer, startPauseTimer] = (function () {
    let currentTimer;

    function clear() {
      if (!currentTimer) {
        return;
      }

      window.clearTimeout(currentTimer);
      currentTimer = null;
    }

    function start() {
      clearTimer();
      // 'ended' event handles looping when maxVerse
      if (!loop.checked || endVerse.value == maxVerse + '' || audio.paused) {
        return;
      }

      const isPartial = audio.currentTime > startTime + startAdjustment;
      const timeout = isPartial ? endTime - audio.currentTime : endTime - startTime;
      currentTimer = window.setTimeout(seekStart, (timeout * 1000) / audio.playbackRate);
    }

    function startPause(wordLength) {
      clearTimer();
      pause();

       // TODO take into account looping
      const timeout = (wordLength * 1000 * getWordPause()) / audio.playbackRate;
      window.setTimeout(play, timeout);
    }

    return [start, clear, startPause];
  })();

  function play() {
    if (audio.paused) {
      audio.play();
    }
  }

  function pause() {
    if (!audio.paused) {
      audio.pause();
    }
  }

  function getWordPause() {
    return wordPause ? parseFloat(wordPause.value) : 0;
  }

  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function unhighlight() {
    if (!highlighted || !highlighted.length) {
      return;
    }

    highlighted.forEach(elem => elem.classList.remove('highlight'));
    highlighted = [];
  }

  function getVerse(id) {
    return id && id.split('-')[0];
  }

  function getWord(id) {
    return id && id.split('-')[1];
  }

  function getVerseWord(id) {
    let split;
    return id && (split = id.split('-')).length > 1 ? split : [null, null];
  }

  function isFirstWord(word) {
    return '1' == word;
  }

  function isSet(variable) {
    return typeof variable != "undefined";
  }

  function isLoaded() {
    return window.isFinite(audio.duration) && !window.isNaN(audio.duration);
  }

  function seekStart() {
    if (!isSet(startTime) || !isSet(endTime) || startTime >= endTime || !isLoaded()) {
      console.warn("Exiting 'seekStart' doing nothing", {
        isLoaded: isLoaded(),
        duration: audio.duration,
        startTime,
        endTime
      });
      return;
    }
    // will trigger 'seeked/playing'
    audio.currentTime = startTime;
  }

  function seekWord(word) {
    if (!isSet(word) || !isLoaded()) {
      console.warn("Exiting 'seekWord' doing nothing");
      return;
    }

    const loopStart = word.startTime - startAdjustment;
    // will trigger 'seeked/playing'
    audio.currentTime = loopStart < startAdjustment ? startAdjustment : loopStart;
  }

  function nextChapter() {
    const start = parseInt(startChapter.value);
    const end = parseInt(endChapter.value);
    if (start == end == chapter) {
      play();
    }

    const next = (chapter < end ? (chapter + 1) : start) + '';
    window.location.href = `${book}${next}.html${hashPrefix}${start}-${end}`;
    return true;
  }

  function getClosestRate(newRate) {
    let closestRate = supportedRates[0];
    let closestDifference = Math.abs(newRate - closestRate);

    supportedRates.forEach((rate) => {
      const difference = Math.abs(newRate - rate);
      if (difference < closestDifference) {
        closestRate = rate;
        closestDifference = difference;
      }
    });
    return closestRate;
  }

  audio.textTracks[0].addEventListener('cuechange', function (event) {
    event.stopImmediatePropagation();
    let vttCue = event.target.activeCues[0], id, isFirst;
    if (!vttCue || !vttCue.id) { return; }

    id = vttCue.id;
    isFirst = isFirstWord(getWord(id));
    if (isFirst) {
      unhighlight();
    }

    function highlight() {
      for (let i = 0; i < suffixes.length; i++) {
        let suffix = suffixes[i];
        let eid = suffix ? (id + suffix) : id;
        let elem = document.getElementById(eid);

        if (!elem) {
          continue;
        }

        highlighted.push(elem);
        elem.classList.add('highlight');
        if (isFirst && !audio.seeking && !audio.paused && !isInViewport(elem)) {
          elem.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
          });
        }
      }
    }

    function handlePause() {
      const times = getWordPause();
      if (!times) {
        return;
      }

      const wordLength = vttCue.endTime - vttCue.startTime;
      startPauseTimer(wordLength);
    }

    // vttCue.addEventListener('enter', highlight); seems to be called only for captions/subtitles with videos
    highlight();
    vttCue.addEventListener('exit', handlePause); 
  }, (passiveSupported ? { passive: true } : false));

  audio.addEventListener('loadedmetadata', function (event) {
    // console.log('loadedmetadata')
    event.stopImmediatePropagation();
    if (Object.keys(cues).length) { return; }

    setAdjustedEndTime(audio.duration);
    const vttCues = audioTrack.track.cues;
    if (!vttCues) { return; }

    for (let i = 0; i < vttCues.length; i++) {
      let vttCue = vttCues[i];
      let id = vttCue.id;
      let verse = getVerse(id);
      let cue = {
        id: id,
        startTime: vttCue.startTime,
        endTime: vttCue.endTime,
        cueIndex: i
      };
      let verseCues = cues[verse];
      if (!verseCues) {
        verseCues = cues[verse] = [];
      }
      verseCues.push(cue);
      if (i == 1) {
        if (cue.startTime < startAdjustment) {
          console.warn(`Verse ${1} cue startTime '${cue.startTime}' is less than startAdjustment '${startAdjustment}'`)
        }

        setAdjustedStartTime(cue.startTime);
      }
    }
  }, (passiveSupported ? { passive: true } : false));


  audio.addEventListener('playing', function (event) {
    // console.log('playing')
    event.stopImmediatePropagation();
    if (!loop.checked || getWordPause()) {
      clearTimer();
      return;
    }

    if (audio.currentTime < startTime || audio.currentTime > endTime) {
      seekStart();
    }
    else {
      startTimer();
    }
  }, (passiveSupported ? { passive: true } : false));

  audio.addEventListener('seeked', function (event) {
    // console.log('seeked')
    event.stopImmediatePropagation();
    unhighlight();
    clearTimer();
  }, (passiveSupported ? { passive: true } : false));

  audio.addEventListener('ratechange', function (event) {
    // console.log('ratechange')
    event.stopImmediatePropagation();
    startTimer();
    if (!speed) { return; }

    if (changedFromSpeed) { // avoid circular event invocation
      changedFromSpeed = false;
      return;
    }

    speed.value = getClosestRate(audio.playbackRate)
  }, (passiveSupported ? { passive: true } : false));

  audio.addEventListener('ended', function (event) {
    // console.log('ended')
    event.stopImmediatePropagation();
    unhighlight();
    if (loop.checked) {
      play();
    } else if (chapterLoop.checked) {
      nextChapter();
    }
  }, (passiveSupported ? { passive: true } : false));

  audio.addEventListener('error', function (e) {
    // console.log('error')
    e.stopImmediatePropagation();
    let src = audio.getAttribute('src');
    switch (e.target.error.code) {
      case e.target.error.MEDIA_ERR_ABORTED:
        alert('You aborted the audio playback.');
        break;
      case e.target.error.MEDIA_ERR_NETWORK:
        alert(
          "'" + src + "'\n either does not exist or there was a network failure"
        );
        break;
      case e.target.error.MEDIA_ERR_DECODE:
        alert(
          'The audio playback was aborted due to a corruption problem or because your browser does not support it.'
        );
        break;
      case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        alert(
          "'" +
          src +
          "' cannot be played.\n\nFile might not exist or is not supported."
        );
        break;
      default:
        alert('An unknown error occurred.');
        break;
    }
  }, (passiveSupported ? { passive: true } : false));

  // #endregion

  // #region Setup

  function setAdjustedStartTime(newStartTime) {
    const loopStart = newStartTime - startAdjustment;
    startTime = loopStart < startAdjustment ? startAdjustment : loopStart;
  }

  function setAdjustedEndTime(newEndTime) {
    const loopEnd = newEndTime + endAdjustment;
    endTime = loopEnd < endAdjustment ? endAdjustment : loopEnd;
  }

  function setStartTimeFromCue() {
    let words, word;
    if ((words = cues[startVerse.value]) && (word = words[0])) {
      setAdjustedStartTime(word.startTime);
    }
  }

  function setEndTimeFromCue() {
    let words, word;
    if ((words = cues[endVerse.value]) && (word = words[words.length - 1])) {
      setAdjustedEndTime(word.endTime);
    }
  }

  document.querySelector('main').addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    const target = event.target;
    if (!target || !target.id) { return; }

    let id = target.id.match(/(\d+-\d+)/);
    if (!id || !(id = id[0])) { return; }
    const [verseId, wordId] = getVerseWord(id);
    let verse, word;
    if (!verseId || !wordId || !(verse = cues[verseId]) || !(word = verse[wordId - 1])) { return; }

    const verseNo = parseInt(verseId);
    const startNo = parseInt(startVerse.value);
    const endNo = parseInt(endVerse.value);
    if (verseNo < startNo) {
      startVerse.value = verseId;
      setStartTimeFromCue();
    }

    if (verseNo > endNo) {
      endVerse.value = verseId;
      setEndTimeFromCue();
    }

    seekWord(word);
    play();
  }, (passiveSupported ? { passive: true } : false));

  loop.addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    if (loop.checked) {
      chapterLoop.checked = false
    }
    else {
      clearTimer();
    }
  }, (passiveSupported ? { passive: true } : false));

  chapterLoop.addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    chapterLoop.checked && (loop.checked = false);
  }, (passiveSupported ? { passive: true } : false));

  document.querySelectorAll('[href="#up"]').forEach((element) => {
    element && element.addEventListener('click', (event) => {
      event.stopImmediatePropagation();
      event.preventDefault();
      window.scrollTo(0, 0);
    });
  });

  fontFamily && fontFamily.addEventListener('change', function (event) {
    event.stopImmediatePropagation();
    let newFont = fontFamily.value;
    var options = fontFamily.options;
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

  speed && speed.addEventListener('change', function (event) {
    event.stopImmediatePropagation();
    let target = event.target;
    if (!target || !target.id || !target.id.startsWith('speed')) {
      return;
    }

    changedFromSpeed = true;
    let rate = parseFloat(target.value);
    if (isFinite(audio.duration) && isFinite(rate)) {
      audio.playbackRate = rate;
    }
  }, (passiveSupported ? { passive: true } : false));

  gotoChapter && gotoChapter.addEventListener('change', function (event) {
    event.stopImmediatePropagation();
    if (gotoChapter.value == chapter) {
      return;
    }

    var navChapter = gotoChapter.value;
    gotoChapter.value = chapter;
    const padChapter = `${navChapter}`.padStart(2, "0");
    const page = `${book}${padChapter}.html`;
    window.location.href = page;
  }, (passiveSupported ? { passive: true } : false));

  function setupLoop() {
    startVerse.addEventListener('change', function (event) {
      event.stopImmediatePropagation();
      const start = parseInt(startVerse.value);
      const end = parseInt(endVerse.value);

      if (start > end) {
        endVerse.value = startVerse.value;
        setEndTimeFromCue();
      }

      setStartTimeFromCue();

      if (!loop.checked || !isLoaded()) {
        return;
      }

      if (audio.currentTime < startTime || audio.currentTime > endTime) {
        seekStart();
      }
      else {
        startTimer();
      }
    }, (passiveSupported ? { passive: true } : false));

    endVerse.addEventListener('change', function (event) {
      event.stopImmediatePropagation();
      const start = parseInt(startVerse.value);
      const end = parseInt(endVerse.value);

      if (start > end) {
        startVerse.value = endVerse.value;
        setStartTimeFromCue();
      }

      setEndTimeFromCue();

      if (!loop.checked || !isLoaded()) {
        return;
      }

      if (audio.currentTime < startTime || audio.currentTime > endTime) {
        seekStart();
      }
      else {
        startTimer();
      }
    }, (passiveSupported ? { passive: true } : false));
  }

  function setupChapterLoop() {
    let hash = window.location.hash;
    if (hash && hash.startsWith(hashPrefix)) {
      let startValue = 1;
      let endValue = maxChapter;

      hash = hash.replace(hashPrefix, '');
      const split = hash.split('-');
      const start = parseInt(split[0]);
      const end = parseInt(split[1]);

      if (start > 0 && start <= maxChapter) {
        startValue = start;
      }

      if (end > 0 && end <= maxChapter) {
        endValue = end;
      }

      startChapter.value = startValue;
      endChapter.value = endValue;

      loop.checked = false;
      chapterLoop.checked = true;
      play();
    }

    startChapter.addEventListener('change', function (event) {
      event.stopImmediatePropagation();
      let start = parseInt(startChapter.value);
      let end = parseInt(endChapter.value);
      if (start > end) {
        endChapter.value = startChapter.value;
      }
    }, (passiveSupported ? { passive: true } : false));

    endChapter.addEventListener('change', function () {
      let start = parseInt(startChapter.value);
      let end = parseInt(endChapter.value);
      if (start > end) {
        startChapter.value = endChapter.value;
      }
    }, (passiveSupported ? { passive: true } : false));
  }

  // #endregion

  function includes(str, search) {
    return str.indexOf(search) != -1;
  }

  function fixAudioSrc() {
    if (!includes(window.location.hostname, 'github')) {
      return;
    }
    const aacSrc = document.getElementById('aac-src');
    const m4aSrc = document.getElementById('m4a-src');
    const mp3Src = document.getElementById('mp3-src');
    let src, path = window.location.pathname;
    if (path.endsWith('.html')) {
      path = path.substring(0, path.lastIndexOf('/') + 1)
    }
    const lfs = 'https://media.githubusercontent.com/media/aramlang/aramlang.github.io/main';
    if (aacSrc && aacSrc.src) {
      src = aacSrc.src.substring(aacSrc.src.indexOf(path))
      aacSrc.src = `${lfs}${src}`;
    }
    if (m4aSrc && m4aSrc.src) {
      src = m4aSrc.src.substring(m4aSrc.src.indexOf(path))
      m4aSrc.src = `${lfs}${src}`;
    }
    if (mp3Src && mp3Src.src) {
      src = mp3Src.src.substring(mp3Src.src.indexOf(path))
      mp3Src.src = `${lfs}${src}`;
    }
  }

  function setSupportedRates() {
    for (let i = 0; i < speed.options.length; i++) {
      supportedRates.push(window.parseFloat(speed.options[i].value));
    }
  }

  setupLoop();
  setupChapterLoop();
  fixAudioSrc();
  setSupportedRates();

  (audio.preload == 'none') && audio.load();
  audio.loop && (audio.loop = false); // looping handled via events
}

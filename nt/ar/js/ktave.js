function setupAudio(
  maxVerse, // number of verses in this chapter
  suffixes  // list of id suffixes to highlight in page
) {
  'use strict';

  // #region Init

  const audio = document.getElementById('audio');
  const audioTrack = document.getElementById('audio-track');
  const loop = document.getElementById('loop');
  const startVerse = document.getElementById('start-verse');
  const endVerse = document.getElementById('end-verse');
  const zawae = document.getElementById('zawae');

  const startAdjustment = 0.010;   // adjustment for start of loop due to low timerupdate frequency
  const endAdjustment = 0.100;     // adjustment for end of loop due to low timerupdate frequency
  const cues = {};                 // cue dtos
  let highlighted = [];            // highlighted elements
  let passiveSupported = false;    // let setPassiveSupported detect if true
  let startTime = startAdjustment; // current loop start time
  let endTime;                     // current loop end time

  if (!audio || !audioTrack || !loop || !startVerse || !endVerse) {
    return;
  }

  function setPassiveSupported() {
    try {
      const options = {
        get passive() { // This function will be called when the browser attempts to access the passive property.
          passiveSupported = true;
          return false;
        }
      };

      window.addEventListener("test", null, options);
      window.removeEventListener("test", null, options);
    } catch (err) {
      passiveSupported = false;
    }
  }
  setPassiveSupported();

  // #endregion

  // #region Audio

  const [startTimer, clearTimer] = (function () {
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
      currentTimer = window.setTimeout(seekStart, (timeout * 1000 * 1) / audio.playbackRate);
    }

    return [start, clear];
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

  function isHidden(elem) {
    if (!elem || !elem.parentNode) {
      return true;
    }

    var computedStyle = window.getComputedStyle(elem.parentNode, null);
    return computedStyle.display == 'none' || computedStyle.visibility == 'hidden';
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
        if (isHidden(elem)) {
          continue;
        }

        highlighted.push(elem);
        elem.classList.add('highlight');
        if (isFirst && !audio.seeking && !audio.paused && !isInViewport(elem)) {
          elem.scrollIntoView();
        }
      }
    }

    // cue.addEventListener('enter', highlight); seems to be called only for captions/subtitles with videos
    highlight();
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
    if (!loop.checked) {
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
  }, (passiveSupported ? { passive: true } : false));

  audio.addEventListener('ended', function (event) {
    // console.log('ended')
    event.stopImmediatePropagation();
    unhighlight();
    if (loop.checked) {
      play();
      seekStart();
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
    const loopEnd = newEndTime - endAdjustment;
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

  function setupLoop() {
    for (let i = 1; i <= maxVerse; i++) {
      let opt = document.createElement('option');
      opt.value = i;
      opt.id = 'start' + i;
      opt.innerHTML = i;
      startVerse.appendChild(opt);

      opt = document.createElement('option');
      opt.id = 'end' + i;
      opt.value = i;
      opt.innerHTML = i;
      endVerse.appendChild(opt);
    }

    endVerse.value = maxVerse;

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

  document.querySelector('main').addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    const target = event.target;
    if (!target || target.nodeName != 'TD' || !target.id) { return; }

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

  document.getElementById('font-family').addEventListener('change', function (event) {
    event.stopImmediatePropagation();
    let fontFamily = event.target.value;
    let elements = document.getElementsByClassName('swadaya');
    for (let i = 0; i < elements.length; i++) {
      const element = elements.item(i);
      element.style.fontFamily = fontFamily;
    }
  }, (passiveSupported ? { passive: true } : false));

  zawae.addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    const textShows = document.querySelectorAll('.show-text');
    const textHides = document.querySelectorAll('.hide-text');
    const rowShows = document.querySelectorAll('.show-row');
    const rowHides = document.querySelectorAll('.hide-row');
    textShows.forEach(elem => {
      elem.classList.remove('show-text');
      elem.classList.add('hide-text');
    });
    textHides.forEach(elem => {
      elem.classList.remove('hide-text');
      elem.classList.add('show-text');
    });
    rowShows.forEach(elem => {
      elem.classList.remove('show-row');
      elem.classList.add('hide-row');
    });
    rowHides.forEach(elem => {
      elem.classList.remove('hide-row');
      elem.classList.add('show-row');
    });
  }), (passiveSupported ? { passive: true } : false)

  loop.addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    if (!loop.checked) {
      clearTimer();
    }
  }), (passiveSupported ? { passive: true } : false)

  document.querySelectorAll('[href="#header"]').forEach((element) => {
    element && element.addEventListener('click', (event) => {
      event.stopImmediatePropagation();
      event.preventDefault();
      window.scrollTo(0, 0);
    });
  });

  // #endregion

  setupLoop();
}

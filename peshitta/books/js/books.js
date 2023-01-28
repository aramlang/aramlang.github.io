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

  const startAdjustment = 0.015;   // adjustment for start of loop due to low timerupdate frequency
  const endAdjustment = 0.250;     // adjustment for end of loop due to low timerupdate frequency
  const cues = {};                 // cue dtos
  let startTime = startAdjustment; // current loop start time
  let endTime;                     // current loop end time

  if (!audio || !audioTrack || !loop || !startVerse || !endVerse) {
    return;
  }

  // #endregion

  // #region Audio

  function pause() {
    if (!audio.paused) {
      audio.pause();
    }
  }

  function seekStart() {
    if (!startTime || !endTime || startTime >= endTime) { return; }
    audio.currentTime = startTime;
  }

  function unhighlight() {
    document.querySelectorAll('.highlight').forEach(elem => elem.classList.remove('highlight'));
  }

  audio.textTracks[0].addEventListener('cuechange', function (event) {
    let vttCue = event.target.activeCues[0], id;
    if (!vttCue || !vttCue.id) { return; }

    id = vttCue.id;

    function highlight() {
      for (let i = 0; i < suffixes.length; i++) {
        let suffix = suffixes[i];
        let eid = suffix ? (id + suffix) : id;
        let elem = document.getElementById(eid);
        if (elem) {
          elem.classList.add('highlight');
        }
      }
    }

    // cue.addEventListener('enter', highlight); seems to be called only for captions/subtitles with videos
    highlight();
  });

  audio.addEventListener('loadedmetadata', function (event) {
    if (Object.keys(cues).length) { return; }

    endTime = audio.duration;
    const vttCues = audioTrack.track.cues;
    if (!vttCues) { return; }

    for (let i = 0; i < vttCues.length; i++) {
      let vttCue = vttCues[i];
      let id = vttCue.id;
      let verse = id.split('-')[0];
      let cue = {
        id: id,
        startTime: vttCue.startTime,
        endTime: vttCue.endTime,
        cueIndex: i
      };
      if (!cues[verse]) {
        cues[verse] = [];
      }
      cues[verse].push(cue);
    }
  });

  audio.addEventListener('seeked', unhighlight);
  audio.addEventListener('ended', unhighlight);

  audio.addEventListener('timeupdate', function (event) {
    if (!loop.checked) { return; }
    let time = event.target.currentTime;
    if (!time || !startTime || !endTime || startTime >= endTime) { return; }

    if (time < startTime) {
      seekStart();
    }

    if (time >= endTime) {
      seekStart();
    }
  });

  audio.addEventListener('error', function (e) {
    var src = audio.getAttribute('src');
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
  });

  // #endregion

  // #region Setup

  function setupLoop() {
    function setStartTime() {
      let words, word;
      if ((words = cues[startVerse.value]) && (word = words[0])) {
        let loopStart = word.startTime - startAdjustment;
        startTime = loopStart < startAdjustment ? startAdjustment : loopStart;
      }
    }

    function setEndTime() {
      let words, word;
      if ((words = cues[endVerse.value]) && (word = words[words.length - 1])) {
        let loopEnd = word.endTime - endAdjustment;
        endTime = loopEnd < endAdjustment ? endAdjustment : loopEnd;
      }
    }

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

    startVerse.addEventListener('change', function () {
      let start = parseInt(startVerse.value);
      let end = parseInt(endVerse.value);
      if (start > end) {
        endVerse.value = startVerse.value;
        setEndTime();
      }

      setStartTime();
      if (loop.checked) {
        pause();
      }
    });

    endVerse.addEventListener('change', function () {
      let start = parseInt(startVerse.value);
      let end = parseInt(endVerse.value);
      if (start > end) {
        startVerse.value = endVerse.value;
        setStartTime();
      }

      setEndTime();
      if (loop.checked) {
        pause();
      }
    });
  }

  document.querySelectorAll('[href="#header"]').forEach((element) => {
    element && element.addEventListener('click', (event) => {
      window.scrollTo(0, 0);
      event.preventDefault();
    });
  });

  document.getElementById('font-family').addEventListener('change', function (event) {
    let fontFamily = event.target.value;
    let elements = document.getElementsByClassName('swadaya');
    for (let i = 0; i < elements.length; i++) {
      const element = elements.item(i);
      element.style.fontFamily = fontFamily;
    }
  });

  zawae.addEventListener('click', function () {
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
  })

  loop.addEventListener('click', function () {
    audio.loop = loop.checked;
  })

  // #endregion

  setupLoop();
}

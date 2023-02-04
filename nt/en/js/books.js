function setupAudio(
  maxVerse,   // number of verses in this chapter
  maxChapter, // number of chapters in this book
  suffixes,   // list of id suffixes to highlight in page,
  book,       // current book name
  chapter     // current chapter
) {
  'use strict';

  // #region Init

  const audio = document.getElementById('audio');
  const audioTrack = document.getElementById('audio-track');
  const loop = document.getElementById('loop');
  const chapterLoop = document.getElementById('chapter-loop');
  const startVerse = document.getElementById('start-verse');
  const endVerse = document.getElementById('end-verse');
  const startChapter = document.getElementById('start-chapter');
  const endChapter = document.getElementById('end-chapter');

  const hashPrefix = '#ch'         // prefix to prepend to next page hash
  const startAdjustment = 0.010;   // adjustment for start of loop due to low timerupdate frequency
  const endAdjustment = 0.100;     // adjustment for end of loop due to low timerupdate frequency
  const cues = {};                 // cue dtos
  let passiveSupported = false;    // let setPassiveSupported detect if true
  let startTime = startAdjustment; // current loop start time
  let endTime;                     // current loop end time

  if (!audio || !audioTrack || !loop || !startVerse || !endVerse || !chapterLoop || !startChapter || !endChapter) {
    console.error('Could not find page element');
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

  function play() {
    if (audio.paused) {
      audio.play();
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

  function seekStart() {
    if (!startTime || !endTime || startTime >= endTime) { return; }
    audio.currentTime = startTime;
  }

  function unhighlight() {
    document.querySelectorAll('.highlight').forEach(elem => elem.classList.remove('highlight'));
  }

  function getVerse(id) {
    return id && id.split('-')[0];
  }

  function getWord(id) {
    return id && id.split('-')[1];
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
          if (!isInViewport(elem)) {
            elem.scrollIntoView();
          }
        }
      }
    }

    // cue.addEventListener('enter', highlight); seems to be called only for captions/subtitles with videos
    highlight();
    vttCue.addEventListener('exit', unhighlight, (passiveSupported ? { passive: true } : false));
  }, (passiveSupported ? { passive: true } : false));

  audio.addEventListener('loadedmetadata', function (event) {
    if (Object.keys(cues).length) { return; }

    endTime = audio.duration;
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
      if (!cues[verse]) {
        cues[verse] = [];
      }
      cues[verse].push(cue);
      if (!i && vttCue.startTime < startAdjustment) {
        console.warn(`First cue startTime '${vttCue.startTime}' is less than startAdjustment '${startAdjustment}'`)
      }
    }
  }, (passiveSupported ? { passive: true } : false));

  audio.addEventListener('seeked', unhighlight, (passiveSupported ? { passive: true } : false));
  audio.addEventListener('ended', function () {
    unhighlight();

    if (!chapterLoop.checked) { return; }

    let start = parseInt(startChapter.value);
    let end = parseInt(endChapter.value);
    if (start == end == chapter) {
      play();
      return;
    }

    let next = (chapter < end ? (chapter + 1) : start) + '';
    window.location.href = `${book}${next}.html${hashPrefix}${start}-${end}`;
  }, (passiveSupported ? { passive: true } : false));

  audio.addEventListener('timeupdate', function (event) {
    if (!loop.checked) {
      return;
    }

    let time = event.target.currentTime;
    if (!time || !startTime || !endTime || startTime >= endTime) {
      console.warn("Exiting 'timeupdate' doing nothing");
      console.warn({
        time,
        startTime,
        endTime
      })
      return;
    }

    if (time < startTime) {
      seekStart();
    }

    if (time >= endTime) {
      seekStart();
    }
  }, (passiveSupported ? { passive: true } : false));

  audio.addEventListener('error', function (e) {
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

    startVerse.addEventListener('change', function () {
      let start = parseInt(startVerse.value);
      let end = parseInt(endVerse.value);
      if (start > end) {
        endVerse.value = startVerse.value;
        setEndTime();
      }

      setStartTime();

      console.log({
        startVerse: startVerse.value,
        endVerse: endVerse.value,
        startTime,
        endTime
      });
    }, (passiveSupported ? { passive: true } : false));

    endVerse.addEventListener('change', function () {
      let start = parseInt(startVerse.value);
      let end = parseInt(endVerse.value);
      if (start > end) {
        startVerse.value = endVerse.value;
        setStartTime();
      }

      setEndTime();

      console.log({
        startVerse: startVerse.value,
        endVerse: endVerse.value,
        startTime,
        endTime
      });
    }, (passiveSupported ? { passive: true } : false));
  }

  function setupChapterLoop() {
    for (let i = 1; i <= maxChapter; i++) {
      let opt = document.createElement('option');
      opt.value = i;
      opt.id = 'startChapter' + i;
      opt.innerHTML = i;
      startChapter.appendChild(opt);

      opt = document.createElement('option');
      opt.id = 'endChapter' + i;
      opt.value = i;
      opt.innerHTML = i;
      endChapter.appendChild(opt);
    }

    let startValue = 1;
    let endValue = maxChapter;
    if (window.location.hash) {
      var hash = window.location.hash.replace(hashPrefix, '');
      let split = hash.split('-');
      let start = parseInt(split[0]);
      let end = parseInt(split[1]);

      if (start > 0 && start <= maxChapter) {
        startValue = start;
      }

      if (end > 0 && end <= maxChapter) {
        endValue = end;
      }

      audio.loop = loop.checked = false;
      chapterLoop.checked = true;
      play();
    }

    startChapter.value = startValue;
    endChapter.value = endValue;

    startChapter.addEventListener('change', function () {
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

  document.querySelectorAll('div.text div[id]').forEach((div) =>
    div.addEventListener('click', function (event) {
      let target = event.currentTarget;
      if (!target || target.nodeName != 'DIV' || !target.id) { return; }

      let id = target.id.match(/(\d+-\d+)/);
      if (!id || !(id = id[0])) { return; }
      let verseId = getVerse(id);
      let wordId = getWord(id);
      let verse, word;
      if (!verseId || !wordId || !(verse = cues[verseId]) || !(word = verse[wordId - 1])) { return; }
      audio.currentTime = word.startTime - startAdjustment;

      let verseNo = parseInt(verseId);
      let startNo = parseInt(startVerse.value);
      let endNo = parseInt(endVerse.value);
      if (verseNo < startNo) {
        startVerse.value = verseId;
        setStartTime();
      }

      if (verseNo > endNo) {
        endVerse.value = verseId;
        setEndTime();
      }

      play();
      event.preventDefault();
      event.stopImmediatePropagation();
    }, (passiveSupported ? { passive: true } : false))
  );

  document.querySelectorAll('[href="#header"]').forEach((element) => {
    element && element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.scrollTo(0, 0);
    }, (passiveSupported ? { passive: true } : false));
  });

  loop.addEventListener('click', function () {
    loop.checked && (chapterLoop.checked = false);
    audio.loop = loop.checked;
  }, (passiveSupported ? { passive: true } : false));

  chapterLoop.addEventListener('click', function () {
    chapterLoop.checked && (loop.checked = false);
    audio.loop = loop.checked;
  }, (passiveSupported ? { passive: true } : false));

  // #endregion

  setupLoop();
  setupChapterLoop();
}

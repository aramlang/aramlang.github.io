window.onload = function () {
  'use strict';

  // #region Vars

  const audioElement = document.getElementById('audio');
  const loopElement = document.getElementById('loop');
  const sectionLoopElement = document.getElementById('section-loop');
  const wordStopElement = document.getElementById('word-stop');
  const sectionStopElement = document.getElementById('section-stop');

  const classic = 'music/classic/';
  const halleluyah = 'song.mp3';
  const halleluyahPath = classic + halleluyah;
  const jubilenium = 'nash01.mp3';
  const jubileniumPath = classic + jubilenium;
  const raza = 'raza.mp3';
  const razaPath = classic + raza;
  const classicList = [halleluyahPath, jubileniumPath, razaPath];
  const wordAdjustment = 0.01;
  const cueAdjustment = 0.001;

  const tracks = {
    [halleluyah]: halleluyahPath + '.txt',
    [jubilenium]: jubileniumPath + '.txt',
    [raza]: razaPath + '.txt'
  };

  var songIndex = 0;            // song index in the current playlist
  var playList = classicList;   // currently active playlist
  var currentSong = halleluyah; // current song name
  var activeCue = null;         // used as word cue search reference point
  var timerCue = null;          // used for word start/stop times
  var currentTimer = null;      // currently active timer
  var lastUnhighlight = null;   // last unhighlight function - called on song end
  var lazySpeakWord = null;     // if word of different song was clicked, need to load song first and then speakWord
  var lazySpeakSection = null;  // if section of different song was clicked, need to load song first and then speakSection
  var sections = {};            // song sections build from cue info, after song has loaded
  var flatCues = {};            // cue dtos arrays
  var activeSection = null;     // set to currently active section when a section link was clicked

  // #endregion

  // #region Audio

  audioElement.addEventListener('error', function (e) {
    var src = audioElement.getAttribute('src');
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

  function playSong() {
    if (lastUnhighlight) {
      lastUnhighlight();
      lastUnhighlight = null;
    }
    resetTimer();
    activeSection = null;
    activeCue = null;

    var song = playList[songIndex];
    currentSong = getFileName(song);
    pauseMedia();
    audioElement.setAttribute('src', fixUrl(song));
    setActiveTrack();
    playMedia();
    // need both calls for window to scroll when hash not changed
    window.location.hash = '#';
    window.location.hash = '#' + currentSong;
  }

  function playNext() {
    if (handleSectionEnd()) { return; }

    var isLast = songIndex === playList.length - 1;
    if (isLast && !loopElement.checked) { return; }
    songIndex = isLast ? 0 : songIndex + 1;

    playSong();
  }

  audioElement.addEventListener('ended', playNext, false);

  // #endregion

  // #region Play

  var anchors = document.querySelectorAll('a[href$=".mp3"], a[href$=".m3u"]');
  for (var i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener('click', function (e) {
      e.preventDefault();

      songIndex = 0;
      var anchorSrc = e.currentTarget.href;
      playList = endsWith(anchorSrc, '.m3u') ? classicList : [anchorSrc];

      playSong();
    });
  }


  function cuechangeHandler(event) {
    var vttCue = event.target.activeCues[0];
    var id;
    if (!vttCue || !(id = vttCue.id)) { return; }

    var prefix = getWordIdPrefix();
    id = getWordId(id);
    var latinId = prefix + '-e-' + id;
    var latinId0 = prefix + '-e-' + id + '~0';
    var swadayaId = prefix + '-m-' + id;
    var sertoId = prefix + '-s-' + id;
    var ashuritId = prefix + '-a-' + id;
    var latinHighlighter = document.getElementById(latinId);
    var latinHighlighter0 = document.getElementById(latinId0);
    var swadayatHighlighter = document.getElementById(swadayaId);
    if (currentSong != raza) {
      var sertoHighlighter = document.getElementById(sertoId);
      var ashuritHighlighter = document.getElementById(ashuritId);
    }

    function highlight() {
      // setAttribute works for both svg and html
      if (latinHighlighter) { latinHighlighter.setAttribute('class', 'highlight'); }
      if (latinHighlighter0) { latinHighlighter0.setAttribute('class', 'highlight'); }
      if (swadayatHighlighter) { swadayatHighlighter.setAttribute('class', 'highlight'); }
      if (sertoHighlighter) { sertoHighlighter.setAttribute('class', 'highlight'); }
      if (ashuritHighlighter) { ashuritHighlighter.setAttribute('class', 'highlight'); }
    }

    function unhighlight() {
      if (latinHighlighter) { latinHighlighter.setAttribute('class', 'unhighlight'); }
      if (latinHighlighter0) { latinHighlighter0.setAttribute('class', 'unhighlight'); }
      if (swadayatHighlighter) { swadayatHighlighter.setAttribute('class', 'unhighlight'); }
      if (sertoHighlighter) { sertoHighlighter.setAttribute('class', 'unhighlight'); }
      if (ashuritHighlighter) { ashuritHighlighter.setAttribute('class', 'unhighlight'); }
    }

    if (
      !latinHighlighter &&
      !latinHighlighter0 &&
      !swadayatHighlighter &&
      !sertoHighlighter &&
      !ashuritHighlighter
    ) { return; }

    highlight(); // cue.addEventListener('enter', highlight); seems to be called only for captions/subtitles with videos
    vttCue.addEventListener('exit', unhighlight);
    lastUnhighlight = unhighlight;
    activeCue = fromVttCue(vttCue);
  }

  var textTracks = audioElement.textTracks;
  for (var i = 0; i < textTracks.length; i++) {
    textTracks[i].addEventListener('cuechange', cuechangeHandler);
  }

  function startHandler(e) {
    stopCurrentTimer();
    if (!timerCue || !wordStopElement.checked) { return; }
    currentTimer = window.setTimeout(pauseMedia, ((timerCue.endTime - timerCue.startTime - wordAdjustment) *
      1000 * 1) / audioElement.playbackRate);
  }

  function resetTimer() {
    stopCurrentTimer();
    if (timerCue) {
      timerCue = null;
    }
  }

  function stopHandler(e) {
    if (timerCue) {
      audioElement.currentTime = timerCue.endTime - cueAdjustment;
    }
    resetTimer();
    activeSection = null;
  }

  function timeupdateHandler(event) {
    var time = event.target.currentTime;
    if (!time) { return; }

    // due to timeupdate low granularity, setTimeout would normally kick in before
    if (wordStopElement.checked && timerCue && time >= timerCue.endTime) {
      pauseMedia();
    }
    else if (activeSection && time >= activeSection[activeSection.length - 1].endTime) {
      handleSectionEnd();
    }
  }

  function loadedmetadataHandler(event) {
    const unnamedSection = '_unnamed';
    if (!sections[currentSong]) {
      var vttCues = getActiveTrak().track.cues;
      var songSections = sections[currentSong] = {};
      var songFlatCues = flatCues[currentSong] = [];
      var unnamedIndex = 0, bangIndex = 0, sectionIndex = 0,
        lastSectionName = null, sectionName = null, cue = null, id = null,
        initSection = function () {
          if (!lastSectionName) { lastSectionName = unnamedSection + (++unnamedIndex); }
          if (songSections[lastSectionName]) { return; };
          sectionIndex = 0;
          songSections[lastSectionName] = [];
        },
        addCue = function (vttCue, trackIndex) {
          initSection();
          var cue = {
            id: getWordId(id),
            startTime: vttCue.startTime,
            endTime: vttCue.endTime,

            sectionName: lastSectionName,
            sectionIndex: sectionIndex++,
            trackIndex: trackIndex
          };
          songSections[lastSectionName].push(cue);
          songFlatCues.push(cue);
        };

      for (var i = 0; i < vttCues.length; i++) {
        cue = vttCues[i];
        id = cue.id;
        if (!id || (bangIndex = id.indexOf('!')) < 0) {
          // within current section scope or unnamed section
          addCue(cue, i);
          continue;
        }
        sectionName = id.substring(bangIndex + 1);
        if (!sectionName) {
          // end section marker
          addCue(cue, i);
          lastSectionName = null;
          continue;
        }
        // start section
        lastSectionName = sectionName;
        addCue(cue, i);
      }
    }
    if (lazySpeakWord) {
      lazySpeakWord();
      lazySpeakWord = null;
    }
    else if (lazySpeakSection) {
      lazySpeakSection();
      lazySpeakSection = null;
    }
  }

  audioElement.addEventListener('play', startHandler);
  audioElement.addEventListener('pause', stopHandler);
  audioElement.addEventListener('timeupdate', timeupdateHandler);
  audioElement.addEventListener('loadedmetadata', loadedmetadataHandler);

  function speakWord(event) {
    var element = event.target;
    var wordCompleteId = element.id;
    if (!wordCompleteId || !(element instanceof HTMLSpanElement) && !(element instanceof SVGRectElement)) { return; }

    var wordId = wordCompleteId.substring(wordCompleteId.lastIndexOf('-') + 1).replace(/~.*/, '');
    function wordClosure() {
      var cue = getWordCue(wordId)
      if (!cue) { return; }

      resetTimer();
      if (activeSection && activeSection.indexOf(cue) == -1) {
        activeSection = null;
      }
      timerCue = cue;
      audioElement.currentTime = timerCue.startTime + cueAdjustment;
      playMedia();
    }

    if (fixAudioSource(wordCompleteId)) {
      lazySpeakWord = wordClosure;
    }
    else {
      wordClosure();
    }
  }

  function speakSection(event) {
    var element = event.target;
    var sectionId = element.id;
    if (!sectionId || !(element instanceof HTMLAnchorElement)) { return; }
    event.preventDefault();

    function sectionClosure() {
      var songSections = sections[currentSong];
      if (!songSections) { return; }
      var section = songSections[sectionId];
      if (!section) { return; }

      var cue = section[0];
      if (!cue) { return; }

      resetTimer();
      activeSection = section;
      audioElement.currentTime = cue.startTime + cueAdjustment;
      playMedia();
    }

    if (fixAudioSource(sectionId)) {
      lazySpeakSection = sectionClosure;
    }
    else {
      sectionClosure();
    }
  }

  document.getElementById('lg-container').addEventListener('click', speakWord);
  document.getElementById('lg-svg').addEventListener('click', speakWord);
  document.getElementById('nd-container').addEventListener('click', speakWord);
  document.getElementById('nd-svg').addEventListener('click', speakWord);
  document.getElementById('rz-container').addEventListener('click', speakWord);
  var sectionPlayAnchors = document.getElementsByClassName('section-play');
  for (var i = 0; i < sectionPlayAnchors.length; i++) {
    sectionPlayAnchors[i].addEventListener('click', speakSection);
  }

  sectionLoopElement.addEventListener('click', function () {
    if (sectionStopElement.checked) { sectionStopElement.checked = false; }
  });
  sectionStopElement.addEventListener('click', function () {
    if (sectionLoopElement.checked) { sectionLoopElement.checked = false; }
  });

  // #endregion

  // #region Utility

  function playMedia() {
    if (audioElement.paused) {
      audioElement.play();
    }
  }

  function pauseMedia() {
    if (!audioElement.paused) {
      audioElement.pause();
    }
  }

  function stopCurrentTimer() {
    if (!currentTimer) { return; }
    window.clearTimeout(currentTimer);
    currentTimer = null;
  }

  function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  function includes(str, search) {
    return str.indexOf(search) != -1;
  }

  function getFileName(path) {
    return path.substring(path.lastIndexOf('/') + 1);
  }

  function fixUrl(url) {
    return includes(window.location.hostname, 'github')
      ? 'https://media.githubusercontent.com/media/aramlang/aramlang.github.io/main/peshitta/music/' +
      classic +
      getFileName(url)
      : url;
  }

  function getWordCue(wordId) {
    if (!wordId) { return null; }

    if (!activeCue) { activeCue = flatCues[currentSong][0]; }
    var forward = wordId >= activeCue.id;
    var search = forward ? searchSectionForward : searchSectionBackward;
    var cue = search(wordId);
    if (cue) { return cue; }
    search = forward ? searchSectionBackward : searchSectionForward;
    cue = search(wordId);
    if (cue) { return cue; }

    search = forward ? searchCuesForward : searchCuesBackward;
    cue = search(wordId);
    if (cue) { return cue; }
    search = forward ? searchCuesBackward : searchCuesForward;
    cue = search(wordId);
    return cue;
  }

  function searchCuesForward(wordId) {
    var cues = flatCues[currentSong];
    for (var i = activeCue.trackIndex + 1; i < cues.length; i++) {
      if (cues[i].id == wordId) { return cues[i]; }
    }
    return null;
  }

  function searchCuesBackward(wordId) {
    var cues = flatCues[currentSong];
    for (var i = activeCue.trackIndex - 1; i >= 0; i--) {
      if (cues[i].id == wordId) { return cues[i]; }
    }
    return null;
  }

  function searchSectionForward(wordId) {
    var sectionName = activeCue.sectionName;
    var sectionIndex = activeCue.sectionIndex;
    var cues = sections[currentSong][sectionName];

    for (var i = sectionIndex; i < cues.length; i++) {
      if (cues[i].id == wordId) { return cues[i]; }
    }
    return null;
  }

  function searchSectionBackward(wordId) {
    var sectionName = activeCue.sectionName;
    var sectionIndex = activeCue.sectionIndex;
    var cues = sections[currentSong][sectionName];

    for (var i = sectionIndex - 1; i >= 0; i--) {
      if (cues[i].id == wordId) { return cues[i]; }
    }
    return null;
  }

  Array.prototype.find =
    Array.prototype.find ||
    function (callback) {
      if (this === null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      } else if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function');
      }
      var list = Object(this);
      // Makes sures is always has an positive integer as length.
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      for (var i = 0; i < length; i++) {
        var element = list[i];
        if (callback.call(thisArg, element, i, list)) { return element; }
      }
    };

  function getWordIdPrefix() {
    var prefix;
    switch (getFileName(audioElement.getAttribute('src'))) {
      case halleluyah:
        prefix = 'lg';
        break;
      case jubilenium:
        prefix = 'nd';
        break;
      case raza:
        prefix = 'rz';
        break;
      default:
        break;
    }
    return prefix;
  }

  function fixAudioSource(wordId) {
    var prefixFromSong = getWordIdPrefix();
    var prefixFromWordId = wordId.substring(0, 2)
    if (prefixFromSong == prefixFromWordId) { return false; }

    pauseMedia();
    switch (prefixFromWordId) {
      case 'lg':
        document.getElementById(halleluyah + '-a').click();
        break;
      case 'nd':
        document.getElementById(jubilenium + '-a').click();
        break;
      case 'rz':
        document.getElementById(raza + '-a').click();
        break;
      default:
        break;
    }
    return true;
  }

  function getWordId(completeWordId) {
    return completeWordId.replace(/!.*/g, '');
  }

  function fromVttCue(vttCue) {
    var vttCues = getActiveTrak().track.cues;
    for (var i = 0; i < vttCues.length; i++) {
      if (vttCues[i] === vttCue) { break; };
    }
    return flatCues[currentSong][i == vttCues.length ? 0 : i];
  }

  function handleSectionEnd() {
    var isHandled = false;
    if (!activeSection) { return isHandled; }

    if (sectionLoopElement.checked) {
      audioElement.currentTime = activeSection[0].startTime;
      isHandled = true;
      playMedia();
    }
    else {
      if (sectionStopElement.checked) {
        isHandled = true;
        pauseMedia();
      }
      activeSection = null;
    }
    return isHandled;
  }

  function getActiveTrak() {
    return document.getElementById(currentSong + '-track');
  }

  function setActiveTrack() {
    getActiveTrak().selected = true;
  }

  // #endregion

  // #region Startup

  audioElement.setAttribute('src', fixUrl(halleluyahPath));
  setActiveTrack();

  // #endregion
};

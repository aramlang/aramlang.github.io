function setupAudio(
  audioParent,  // element where to insert audio elements
  songSrc,      // song media file
  songCueFile,  // song WebVTT cue file
  prefixes,     // list of id prefixes to highlight in page
  hashId        // element to navigate for to have song text in focus, can be undefined
) {

  'use strict';
  const audioHtml =
    '<div>' +
    '<input type="checkbox" id="loop" name="loop" value="loop" checked>' +
    '<label for="loop" title="Play song continuously">Repeat Song</label>' +
    '<input type="checkbox" id="section-loop" name="section-loop" value="section-loop">' +
    '<label for="section-loop" title="Play song section continuously">Repeat Section</label>' +
    '<input type="checkbox" id="section-stop" name="section-stop" value="section-stop">' +
    '<label for="section-stop" title="Stop after playing clicked song section">Section Stop</label>' +
    '<input type="checkbox" id="word-loop" name="word-loop" value="word-loop">' +
    '<label for="word-loop" title="Play song word continuously">Repeat Word</label>' +
    '<input type="checkbox" id="word-stop" name="word-stop" value="word-stop" checked>' +
    '<label for="word-stop" title="Stop after playing clicked word">Word Stop</label>' +
    '</div>' +
    '<audio id="audio" loop preload controls>' +
    '<source src="' + songSrc + '" type="audio/mp3">' +
    '<track default kind="metadata" srclang="en-US" src="' + songCueFile + '" />' +
    'Your browser does not support the audio tag.' +
    'You can <a href="' + songSrc + '">download media</a> instead.' +
    '</audio>';
  audioParent.innerHTML += audioHtml;

  const audio = document.getElementById('audio');
  const songLoop = document.getElementById('loop');
  const sectionLoop = document.getElementById('section-loop');
  const sectionStop = document.getElementById('section-stop');
  const wordLoop = document.getElementById('word-loop');
  const wordStop = document.getElementById('word-stop');
  const data = {
  };

  // #region Audio

  audio.addEventListener('error', function (e) {
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

  function cuechangeHandler(event) {
    var vttCue = event.target.activeCues[0],
      phrases = [], phrase, id, phraseId;
    if (!vttCue || !vttCue.id) { return; }

    id = removeSectionId(vttCue.id);
    for (var i = 0; i < prefixes.length; i++) {
      phraseId = prefixes[i] + id;
      phrase = document.getElementById(phraseId);
      if (phrase) {
        phrases.push(phrase);
      }
    }
    if (!phrases.length) { return; }

    function highlight() {
      for (var h = 0; h < phrases.length; h++) {
        setClass(phrases[h], 'highlight', 'unhighlight');
      } 
    }

    function unhighlight() {
      for (var u = 0; u < phrases.length; u++) {
        setClass(phrases[u], 'unhighlight', 'highlight');
      }
    }

    highlight(); // cue.addEventListener('enter', highlight); seems to be called only for captions/subtitles with videos
    vttCue.addEventListener('exit', unhighlight);
    data.unhighlight = unhighlight;
  }

  var textTracks = audio.textTracks;
  for (var i = 0; i < textTracks.length; i++) {
    textTracks[i].addEventListener('cuechange', cuechangeHandler);
  }

  // #endregion

  // #region Audio Control

  songLoop.addEventListener('click', function () {
    audio.loop = songLoop.checked;
  });

  var anchors = document.querySelectorAll('a[href$=".mp3"]');
  for (var i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener('click', function (e) {
      e.preventDefault();
      playSong();
    });
  }

  // #endregion

  // #region Helper

  function playSong() {
    playAudio();
    // need both calls for window to scroll when hash not changed
    if (hashId) {
      window.location.hash = '#';
      window.location.hash = '#' + hashId;
    }
  }

  function playAudio() {
    if (audio.paused) {
      audio.play();
    }
  }

  function removeSectionId(vttCueId) {
    return vttCueId.replace(/!.*/g, '');
  }

  function setClass(element, addClass, removeClass) {
    var newClass = element.getAttribute('class');
    if (newClass) {
      newClass = newClass.replace(removeClass, '').trim();
    }
    newClass = newClass + ' ' + addClass;
    element.setAttribute('class', newClass);
  }

  //#endregion
}

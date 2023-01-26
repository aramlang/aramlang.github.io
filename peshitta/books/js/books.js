function setupAudio(maxVerse) {

  // #region Init

  const audio = document.getElementById("audio");
  const audioTrack = document.getElementById("audio-track");
  const loop = document.getElementById("loop");
  const startVerse = document.getElementById("start-verse");
  const endVerse = document.getElementById("end-verse");
  const adjustment = 0.002;
  let startTime = adjustment;
  let endTime;
  const cues = {};  // cue dtos

  if (!audio || !audioTrack || !startVerse || !endVerse) {
    return;
  }

  // #endregion

  // #region Audio

  function pause() {
    if (!audio.paused) {
      audio.pause();
    }
  }

  function unhighlight() {
    document.querySelectorAll(".highlight").forEach(elem => elem.classList.remove("highlight"));
  }

  audio.textTracks[0].addEventListener('cuechange', function (event) {
    let vttCue = event.target.activeCues[0], aramaic, english, id;
    if (!vttCue || !vttCue.id) { return; }

    id = vttCue.id;
    aramaic = document.getElementById(id);
    english = document.getElementById(id + "e");
    if (!aramaic || !english) { return; }

    function highlight() {
      aramaic.classList.add("highlight");
      english.classList.add("highlight");
    }
    // cue.addEventListener('enter', highlight); seems to be called only for captions/subtitles with videos
    highlight();
  });

  audio.addEventListener("loadedmetadata", function (event) {
    if (Object.keys(cues).length) { return; }

    endTime = audio.duration;
    const vttCues = audioTrack.track.cues;
    if (!vttCues) { return; }

    for (let i = 0; i < vttCues.length; i++) {
      let vttCue = vttCues[i];
      let id = vttCue.id;
      let verse = id.split("-")[0];
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

  audio.addEventListener("seeked", unhighlight);

  audio.addEventListener("timeupdate", function (event) {
    if (!loop.checked) { return; }
    let time = event.target.currentTime;
    if (!time || !startTime || !endTime || startTime >= endTime) { return; }

    if (time < startTime) {
      audio.currentTime = startTime - adjustment;
    }

    if (time >= endTime) {
      audio.currentTime = startTime - adjustment;
    }
  });

  audio.addEventListener("error", function (e) {
    var src = audio.getAttribute("src");
    switch (e.target.error.code) {
      case e.target.error.MEDIA_ERR_ABORTED:
        alert("You aborted the audio playback.");
        break;
      case e.target.error.MEDIA_ERR_NETWORK:
        alert(
          "'" + src + "'\n either does not exist or there was a network failure"
        );
        break;
      case e.target.error.MEDIA_ERR_DECODE:
        alert(
          "The audio playback was aborted due to a corruption problem or because your browser does not support it."
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
        alert("An unknown error occurred.");
        break;
    }
  });

  // #endregion

  // #region Setup

  function setupLoop() {
    if (!startVerse || !endVerse) {
      return;
    }
    function setStartTime() {
      let words, word;
      if ((words = cues[startVerse.value]) && (word = words[0])) {
        startTime = word.startTime;
      }
    }

    function setEndTime() {
      let words, word;
      if ((words = cues[endVerse.value]) && (word = words[words.length - 1])) {
        endTime = word.endTime;
      }
    }

    for (let i = 1; i <= maxVerse; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.id = "start" + i;
      opt.innerHTML = i;
      startVerse.appendChild(opt);

      opt = document.createElement("option");
      opt.id = "end" + i;
      opt.value = i;
      opt.innerHTML = i;
      endVerse.appendChild(opt);
    }
    endVerse.value = maxVerse;
    startVerse.addEventListener("change", function () {
      let start = parseInt(startVerse.value);
      let end = parseInt(endVerse.value);
      if (start > end) {
        for (let i = 1; i <= maxVerse; i++) {
          document.getElementById("end" + i).removeAttribute("selected");
        }
        document.getElementById("end" + start).setAttribute("selected", true);
        setEndTime();
      }

      setStartTime();
      if (loop.checked) {
        pause();
      }
    });

    endVerse.addEventListener("change", function () {
      let start = parseInt(startVerse.value);
      let end = parseInt(endVerse.value);
      if (start > end) {
        for (let i = 1; i <= maxVerse; i++) {
          document.getElementById("start" + i).removeAttribute("selected");
        }
        document.getElementById("start" + end).setAttribute("selected", true);
        setStartTime();
      }

      setEndTime();
      if (loop.checked) {
        pause();
      }
    });
  }

  document.querySelectorAll('[href="#header"]').forEach((element) => {
    element && element.addEventListener("click", (event) => {
      window.scrollTo(0, 0);
      event.preventDefault();
    });
  });

  document.getElementById("font-family").addEventListener("change", function (event) {
    let fontFamily = event.target.value;
    let elements = document.getElementsByClassName("swadaya");
    for (let i = 0; i < elements.length; i++) {
      const element = elements.item(i);
      element.style.fontFamily = fontFamily;
    }
  });

  loop.addEventListener("click", function () {
    audio.loop = loop.checked;
  })

  // #endregion

  setupLoop();
}
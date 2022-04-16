window.onload = function () {
  'use strict';
  // #region Variables

  const webVttHeader = "WEBVTT\n\n";
  const maxSnapshots = 24;
  const startAdjustment = 0.001;
  const wordAdjustment = 0.05;
  const defaultSnapshot = '00:00:00.000';
  var suspendSnapshot = false;
  var snapshotEndTime = 0;
  var currentCounter = 0;
  var downloadUrl = null;
  var fileName = '';
  var isVideo = true;

  var mediaUrlInput = document.getElementById('media-url-input');
  var loadButton = document.getElementById('load-button');
  var videoCheckbox = document.getElementById('video-checkbox');

  var audio = document.getElementById('audio-control');
  var video = document.getElementById('video-control');
  var output = document.getElementById('output-textarea');
  var mediaDiv = document.getElementById('media-div');
  var snapshotDiv = document.getElementById('snapshot-div');

  var backButton = document.getElementById('back-button');
  var backSecondsInput = document.getElementById('back-seconds-input');
  var currentCounterInput = document.getElementById('current-counter-input');
  var recordButton = document.getElementById('record-button');
  var startTimeInput = document.getElementById('start-time-input');
  var endTimeInput = document.getElementById('end-time-input');
  var endTimeButton = document.getElementById('end-time-button');
  var outputButton = document.getElementById('output-button');
  var recordCheckbox = document.getElementById('record-checkbox');
  var idPrefixInput = document.getElementById('id-prefix-input');
  var idSuffixInput = document.getElementById('id-suffix-input');
  var downloadWebvttAnchor = document.getElementById('download-webvtt');
  var ssinput = {
    ss1: document.getElementById('ss-1'),
    ss2: document.getElementById('ss-2'),
    ss3: document.getElementById('ss-3'),
    ss4: document.getElementById('ss-4'),
    ss5: document.getElementById('ss-5'),
    ss6: document.getElementById('ss-6'),
    ss7: document.getElementById('ss-7'),
    ss8: document.getElementById('ss-8'),
    ss9: document.getElementById('ss-9'),
    ss10: document.getElementById('ss-10'),
    ss11: document.getElementById('ss-11'),
    ss12: document.getElementById('ss-12'),
    ss13: document.getElementById('ss-13'),
    ss14: document.getElementById('ss-14'),
    ss15: document.getElementById('ss-15'),
    ss16: document.getElementById('ss-16'),
    ss17: document.getElementById('ss-17'),
    ss18: document.getElementById('ss-18'),
    ss19: document.getElementById('ss-19'),
    ss20: document.getElementById('ss-20'),
    ss21: document.getElementById('ss-21'),
    ss22: document.getElementById('ss-22'),
    ss23: document.getElementById('ss-23'),
    ss24: document.getElementById('ss-24')
  };

  // #endregion

  // #region Header

  function load(e) {
    var url = mediaUrlInput.value.trim().replace(/\\/g, '/');
    if (!url) {
      alert('Please set audio or video URL');
      return;
    }

    fileName = url.substring(url.lastIndexOf('/') + 1);
    var comment = 'NOTE ' + webVttEscape(fileName) + '\n';
    if (!startsWith(output.value, (webVttHeader + comment))) { log(comment); }

    resetControls();

    url = url.replace(/\#/g, '%23');
    if (isVideo) {
      video.width = mediaDiv.offsetWidth - 15;
      video.setAttribute('src', url);
    } else {
      audio.setAttribute('src', url);
      mediaDiv.style.width = audio.offsetWidth + 'px';;
    }
  }

  mediaUrlInput.addEventListener('keyup', function (event) {
    if (event.key == 'Enter') { load(event); }
  });
  loadButton.addEventListener('click', load);
  videoCheckbox.addEventListener('click', function (e) {
    isVideo = e.currentTarget.checked;
    if (isVideo) {
      pauseMedia(audio);
      audio.removeAttribute('src');
      audio.load();

      audio.className = 'media-hide';
      video.className = 'media-show';
    } else {
      pauseMedia(video);
      video.removeAttribute('src');
      video.load();

      audio.className = 'media-show';
      video.className = 'media-hide';
    }

    resetControls();
  });

  // #endregion

  // #region Processing

  backButton.addEventListener('click', function (e) {
    var media = getMedia();
    if (!isFinite(media.duration)) { return; }
    var seconds = backSecondsInput.value / 10;
    var time = media.currentTime - seconds;
    if (time < 0) { time = startAdjustment; }
    media.currentTime = time;
  });

  outputButton.addEventListener('click', function (e) {
    var media = getMedia();
    if (!isFinite(media.duration)) { return; }

    var startEndTime = getStartEndTime();
    var startTime = startEndTime.startTime;
    var endTime = startEndTime.endTime;

    if (startTime > media.duration || endTime > media.duration || startTime > endTime || startTime < 0 || endTime < 0) {
      alert('Invalid start or end time entered');
      return;
    }

    log(getId(++currentCounter) + '\n' + startTimeInput.value + ' --> ' + endTimeInput.value + '\n');
    
    startTime = endTime + startAdjustment;
    if (startTime > media.duration) { startTime = media.duration; }
    setStartTime(startTime);
    setEndTime(media.duration);
    setSuspendSnapshot(false);
    media.currentTime = startTime;
    currentCounterInput.value = currentCounter;
  });

  function snapshotHandler(event) {
    var media = getMedia();
    if (!isFinite(media.duration)) { return; }

    var input = getSnapshotInput(event.target);
    if (!input) { return; }
    setEndTime(getSeekTime(input));

    var startEndTime = getStartEndTime(),
      startTime = startEndTime.startTime,
      endTime = startEndTime.endTime;

    snapshotEndTime = endTime;
    setSuspendSnapshot(true);
    media.currentTime = startTime;
    playMedia(media);
  }

  function getSnapshotInput(element) {
    var isInput = element instanceof HTMLInputElement;
    var isButton = !isInput && element instanceof HTMLButtonElement;
    return isInput
      ? element
      : isButton ? endTimeInput : undefined;
  }

  snapshotDiv.addEventListener('click', snapshotHandler);
  snapshotDiv.addEventListener('keyup', function (event) {
    if (event.key == 'Enter') { snapshotHandler(event); }
  });

  recordButton.addEventListener('click', function (event) {
    setSuspendSnapshot(!suspendSnapshot);
  });
  startTimeInput.addEventListener('change', function (event) {
    var time = getSeekTime(startTimeInput, true);
    setStartTime(time);
  });
  endTimeButton.addEventListener('click', snapshotHandler);
  endTimeButton.addEventListener('keyup', function (event) {
    if (event.key != 'Enter') { return; }
    snapshotHandler(event);
  });
  endTimeInput.addEventListener('change', function (event) {
    var time = getSeekTime(endTimeInput, true);
    setEndTime(time);
  });
  endTimeInput.addEventListener('keyup', function (event) {
    if (event.key != 'Enter') { return; }
    snapshotHandler(event);
  });

  currentCounterInput.addEventListener('change', function (e) {
    currentCounter = e.target.value;
  });

  function showMediaError() {
    alert('File cannot be played. It might not exist or format is not supported.');
  }
  audio.addEventListener('error', showMediaError);
  video.addEventListener('error', showMediaError);
  recordCheckbox.addEventListener('click', function (e) {
    resetControls()
  });

  function startHandler(e) {
    if (snapshotEndTime) {
      var media = getMedia();
      setTimeout(
        function () {
          if (!snapshotEndTime) { return; }
          pauseMedia(media);
        },
        (snapshotEndTime - getSeekTime(startTimeInput) - wordAdjustment) * 1000 * 1 / media.playbackRate)
    }
    if (!recordCheckbox.checked) { return; }

    var currentTime = !e.target.currentTime ? startAdjustment : e.target.currentTime;
    var formattedTime = setStartTime(currentTime);
    setEndTime(e.target.duration);
    log(getId(++currentCounter));
    log(formattedTime + ' --> ', true);
    currentCounterInput.value = currentCounter;
  }

  function stopHandler(e) {
    if (snapshotEndTime) {
      // cannot always stop exactly at snapshotEndTime
      setEndTime(snapshotEndTime);
      e.target.currentTime = snapshotEndTime;
      snapshotEndTime = 0;
    }
    if (!recordCheckbox.checked) { return; }

    var formattedTime = setEndTime(e.target.currentTime);
    log(formattedTime + '\n');
  }

  function loadedmetadataHandler(e) {
    startTimeInput.readOnly = endTimeInput.readOnly = false;
    setEndTime(e.target.duration);
  }

  function timeupdateHandler(event) {
    var time = event.target.currentTime;
    if (!time) { return; }

    // due to timeupdate low granularity, setTimeout would normally kick before
    if (snapshotEndTime && time >= snapshotEndTime) { pauseMedia(getMedia()); }
    if (suspendSnapshot) { return; }

    var decTime = time;
    for (var i = 1; i < maxSnapshots; i++) {
      setInputTime(ssinput['ss' + i], ssinput['ss' + (i + 1)].dataset.time);
    }
    setEndTime(decTime);
    setInputTime(ssinput['ss' + maxSnapshots], decTime);
  }

  audio.addEventListener('play', startHandler);
  audio.addEventListener('pause', stopHandler);
  audio.addEventListener('loadedmetadata', loadedmetadataHandler);
  audio.addEventListener('timeupdate', timeupdateHandler);

  video.addEventListener('play', startHandler);
  video.addEventListener('pause', stopHandler);
  video.addEventListener('loadedmetadata', loadedmetadataHandler);
  video.addEventListener('timeupdate', timeupdateHandler);

  output.addEventListener('input', function (event) {
    if (event.target.value !== '') {
      window.addEventListener(
        'beforeunload', beforeUnloadListener, { capture: true });
    } else {
      window.removeEventListener(
        'beforeunload', beforeUnloadListener, { capture: true });
    }
  });

  // #endregion

  // #region Footer

  document.getElementById('reload-button').addEventListener('click', load);

  document.getElementById('clear-button').addEventListener('click', function (e) {
    window.removeEventListener('beforeunload', beforeUnloadListener, {
      capture: true
    });
    output.value = '';
    if (mediaUrlInput.value.trim()) {
      load();
    }
  });

  document.getElementById('copy-button').addEventListener('click', function (e) {
    var tempTextarea = document.createElement("textarea");
    document.body.appendChild(tempTextarea);
    tempTextarea.value = output.value;
    tempTextarea.select();

    var result = false;
    try {
      result = document.execCommand("copy");
      window.removeEventListener('beforeunload', beforeUnloadListener, {
        capture: true
      });
    } catch (err) {
      console.log("Copy error: " + err);
    }

    document.body.removeChild(tempTextarea);
    return result;
  });

  function getVttObject() {
    var isValid = true,
      cues = [],
      regions = [],
      parsingErrors = [],
      exception = null;

    try {
      var vtt = output.value,
        parser = new WebVTT.Parser(window, WebVTT.StringDecoder());

      parser.oncue = function (cue) {
        cues.push(cue);
      };
      parser.onregion = function (region) {
        regions.push(region);
      }
      parser.onparsingerror = function (err) {
        isValid = false;
        parsingErrors.push(err);
      }

      parser.parse(vtt);
      parser.flush();
    } catch (ex) {
      isValid = false;
      exception = ex;
    }

    return {
      isValid: isValid,
      cues: cues,
      regions: regions,
      parsingErrors: parsingErrors,
      exception: exception
    };
  }

  function getVttText() {
    var o = getVttObject();
    return {
      isValid: o.isValid,
      content: JSON.stringify({
        cues: o.cues,
        regions: o.regions
      }),
      parsingErrors: o.parsingErrors,
      exception: o.exception
    };
  }

  function getVttParseMessage(vtt) {
    return vtt.isValid
      ? 'WebVTT content is valid'
      : vtt.parsingErrors.length
        ? ("WebVTT content is invalid:\n" + vtt.parsingErrors.map(function (e) { return e.message }).join())
        : ("An exception happened while parsing WebVTT:\n" + vtt.exception);
  }

  function continueOnVttError(vtt) {
    if (!vtt.isValid) {
      var message = getVttParseMessage(vtt) + '\nContinue?';
      return confirm(message);
    }
    return true;
  }

  document.getElementById('clear-button').addEventListener('click', function (e) {
    window.removeEventListener('beforeunload', beforeUnloadListener, {
      capture: true
    });
    output.value = '';
    if (mediaUrlInput.value.trim()) {
      load();
    }
  });

  function save(webVtt, type, ext) {
    if (!webVtt) {
      alert('Nothing to save');
      return;
    }
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    var blob = new Blob([webVtt], {
      type: 'text/plain;charset=utf-8'
    });
    downloadUrl = URL.createObjectURL(blob);
    downloadWebvttAnchor.setAttribute('href', downloadUrl);
    var saveFile = fileName ? fileName : 'webvtt';
    var extIndex = saveFile.lastIndexOf('.');
    if (extIndex < 0) {
      extIndex = saveFile.length;
    }
    var webVttFileName = saveFile.substring(0, extIndex) + type + '.' + (ext ? ext : 'txt');
    downloadWebvttAnchor.setAttribute('download', webVttFileName);
    downloadWebvttAnchor.click();
    window.removeEventListener('beforeunload', beforeUnloadListener, {
      capture: true
    });
  }

  document.getElementById('parse-button').addEventListener('click', function (e) {
    var vtt = getVttText();
    alert(getVttParseMessage(vtt));
  });

  document.getElementById('save-button').addEventListener('click', function (e) {
    if (!continueOnVttError(getVttText())) { return; }
    var webVtt = output.value.replace(/\r/g, '');
    save(webVtt, '-vtt');
  });

  document.getElementById('save-blob-button').addEventListener('click', function (e) {
    if (!continueOnVttError(getVttText())) { return; }
    var webVtt = output.value.replace(/\r/g, '').replace(/\n/g, '\\n').replace(/"/g, '\\"').replace(/'/g, "\\'");
    save(webVtt, '-blob');
  });

  document.getElementById('save-json-button').addEventListener('click', function (e) {
    var vtt = getVttText();
    if (!continueOnVttError(vtt)) { return; }
    save(vtt.content, '-json', 'js');
  });

  // #endregion

  // #region Utility

  function getMedia() {
    return isVideo ? video : audio;
  }

  function getId(counter) {
    return idPrefixInput.value + counter + idSuffixInput.value;
  }

  function playMedia(media) {
    if (media && media.paused) { media.play(); }
  }

  function pauseMedia(media) {
    if (media && !media.paused) { media.pause(); }
  }

  function setSuspendSnapshot(value) {
    suspendSnapshot = value
    if (suspendSnapshot) {
      recordButton.className = '';
      recordButton.title = 'Time snapshot suspended';
    }
    else {
      recordButton.className = 'recording';
      recordButton.title = 'Time snapshot active';
    }
  }

  function getStartEndTime() {
    var media = getMedia(),
      startTime = getSeekTime(startTimeInput),
      endTime = getSeekTime(endTimeInput);
    if (startTime > endTime) {
      var vtt = getVttObject();
      if (vtt.isValid && vtt.cues.length) {
        vtt.cues.sort(function (c1, c2) {
          return (c2.startTime - c1.startTime);
        });
        var cue = vtt.cues.find(function (c) {
          return c.startTime < endTime;
        });
        if (cue) {
          setStartTime(startTime = cue.startTime);
        }
      }
      if (startTime > endTime) {
        setStartTime(startTime = startAdjustment);
      }
      if (endTime < startTime) {
        setEndTime(endTime = (media.duration ?? startTime))
      }
    }
    return {
      startTime: startTime,
      endTime: endTime
    }
  }

  function resetControls() {
    setSuspendSnapshot(false);
    snapshotEndTime = currentCounterInput.value = currentCounter = 0;

    setStartTime(startAdjustment);
    setEndTime(startAdjustment);
    for (var prop in ssinput) {
      ssinput[prop].value = defaultSnapshot;
    }
  }

  function beforeUnloadListener(event) {
    event.preventDefault();
    return event.returnValue = "Latest changes have not been copied or saved\n.Are you sure you want to exit page?";
  };

  function getSeekTime(input, compute) {
    return bounded(compute ?
      WebVTT.parseTimeStamp(input.value.trim()) :
      parseFloat(input.dataset.time));
  }

  function log(str, skipNewLine) {
    var content = output.value;
    if (!startsWith(content, webVttHeader)) { content = webVttHeader + content; }
    output.value = content + str + (skipNewLine ? '' : '\n');

    const event = new Event('input', { 'bubbles': true, 'cancelable': true });
    output.dispatchEvent(event);
  }

  function bounded(secs) {
    var time = secs;
    if (time <= 0) { time = 0; }
    else {
      var duration = getMedia().duration;
      if (isFinite(duration) && time > duration) { time = duration; }
    }
    return time;
  }

  function setInputTime(input, secs) {
    var time = bounded(secs);
    input.dataset.time = time;
    return input.value = getTimestamp(time);
  }

  function setStartTime(time) {
    return setInputTime(startTimeInput, time);
  }

  function setEndTime(time) {
    return setInputTime(endTimeInput, time);
  }

  function startsWith(str, search) {
    return str.indexOf(search) == 0;
  }

  function getTimestamp(exactSeconds) {
    var validSeconds = exactSeconds < 0 ? 0 : exactSeconds;
    var allSeconds = Math.floor(validSeconds);

    var milliseconds = Math.floor(validSeconds * 1000) % 1000;
    var seconds = allSeconds % 60;
    var minuteSeconds = (allSeconds - seconds) % 3600;
    var minutes = minuteSeconds / 60;
    var hours = (allSeconds - minuteSeconds - seconds) / 3600;

    return (hours < 10 ? '0' : '') + hours + ':' +
      (minutes < 10 ? '0' : '') + minutes + ':' +
      (seconds < 10 ? '0' : '') + seconds + '.' +
      (milliseconds < 100 ? '0' : '') + (milliseconds < 10 ? '0' : '') + milliseconds;
  }

  function webVttEscape(str) {
    var r = "";
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      switch (c) {
        case '>':
          r += '&gt;';
          break;
        case '<':
          r += '&lt;';
          break;
        case '&':
          r += '&amp;';
          break;
        default:
          r += c;
          break;
      }
    }
    return r;
  }

  // #endregion

  // #region Startup

  mediaUrlInput.focus();
  mediaDiv.style.width = video.offsetWidth + 'px';

  // #endregion
};

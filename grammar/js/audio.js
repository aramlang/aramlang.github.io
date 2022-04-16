window.onload = function() {
  var audioElement = document.getElementById('audio');
  if (!audioElement) return;

  audioElement.addEventListener('error', function(e) {
    var src = audioElement.getAttribute('src');
    switch (e.target.error.code) {
      case e.target.error.MEDIA_ERR_ABORTED:
        alert('You aborted the audio playback.');
        break;
      case e.target.error.MEDIA_ERR_NETWORK:
       alert("'" + src + "'\n either does not exist or there was a network failure");
       break;
      case e.target.error.MEDIA_ERR_DECODE:
       alert('The audio playback was aborted due to a corruption problem or because your browser does not support it.');
       break;
      case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
       alert("'" + src + "' cannot be played.\n\nFile may not exist.");
       break;
      default:
       alert('An unknown error occurred.');
       break;
    }
  });

  var anchors = document.querySelectorAll('a[href$=".mp3"]');
  var len = anchors.length;
  for (var i = 0; i < len; i++) {
    anchors[i].addEventListener('click', function(e) {
      e.preventDefault ? e.preventDefault() : (e.returnValue = false);
      var anchorSrc = e.currentTarget.href;
      var audioSrc = audioElement.getAttribute('src');
      if (anchorSrc != audioSrc) {
        audioElement.setAttribute('src', anchorSrc);
      }
      audioElement.play();
    });
  }
};

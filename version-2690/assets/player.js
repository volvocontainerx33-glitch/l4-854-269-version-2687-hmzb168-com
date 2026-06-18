(function () {
  window.initPlayer = function (id, src) {
    var video = document.getElementById(id);
    if (!video) return;
    var button = document.querySelector('[data-player-button="' + id + '"]');
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) return;
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function start() {
      attach();
      if (button) button.classList.add("is-hidden");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (button) button.classList.remove("is-hidden");
        });
      }
    }

    if (button) button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) start();
    });
    video.addEventListener("play", function () {
      if (button) button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      if (button) button.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  };
})();

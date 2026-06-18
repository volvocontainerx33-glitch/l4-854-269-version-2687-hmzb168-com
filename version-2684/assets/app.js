(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });

  function initMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-tags") || ""
    ].join(" ").toLowerCase();
  }

  function initSearch() {
    var panel = document.querySelector("[data-search-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-search-input]");
    var region = panel.querySelector("[data-region-filter]");
    var type = panel.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-state");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input && initial) {
      input.value = initial;
    }
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var content = textOf(card);
        var passKeyword = !q || content.indexOf(q) !== -1;
        var passRegion = !regionValue || (card.getAttribute("data-region") || "").indexOf(regionValue) !== -1;
        var cardType = (card.getAttribute("data-type") || "").toLowerCase();
        var passType = !typeValue || cardType.indexOf(typeValue.toLowerCase()) !== -1 || content.indexOf(typeValue.toLowerCase()) !== -1;
        var show = passKeyword && passRegion && passType;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    var button = panel.querySelector(".form-btn");
    if (button) {
      button.addEventListener("click", apply);
    }
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-box"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var mask = box.querySelector(".play-mask");
      if (!video) {
        return;
      }
      var url = video.getAttribute("data-play-url");
      var started = false;
      var hls = null;
      function attach() {
        if (started || !url) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }
      function play() {
        attach();
        video.controls = true;
        if (mask) {
          mask.classList.add("is-hidden");
        }
        var action = video.play();
        if (action && action.catch) {
          action.catch(function () {});
        }
      }
      if (mask) {
        mask.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!started) {
          play();
          return;
        }
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }
})();

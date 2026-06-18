(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function getCardText(card) {
    return (card.getAttribute("data-search") || "").toLowerCase();
  }

  function sortCards(grid, mode) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    if (mode === "default") {
      cards.sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
      return;
    }
    cards.sort(function (a, b) {
      if (mode === "rating") {
        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
      }
      if (mode === "views") {
        return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
      }
      if (mode === "year") {
        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
      }
      return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
    });
    cards.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  function applyFilters(panel) {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var region = panel.querySelector("[data-region-filter]");
    var type = panel.querySelector("[data-type-filter]");
    var year = panel.querySelector("[data-year-filter]");
    var sorter = panel.querySelector("[data-sort-select]");
    var empty = panel.querySelector("[data-filter-empty]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var keyword = input ? input.value.trim().toLowerCase() : "";
    var regionValue = region ? region.value : "";
    var typeValue = type ? type.value : "";
    var yearValue = year ? year.value : "";
    var shown = 0;

    cards.forEach(function (card) {
      var matchesKeyword = !keyword || getCardText(card).indexOf(keyword) !== -1;
      var matchesRegion = !regionValue || (card.getAttribute("data-region") || "").indexOf(regionValue) !== -1;
      var matchesType = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
      var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
      var visible = matchesKeyword && matchesRegion && matchesType && matchesYear;
      card.style.display = visible ? "" : "none";
      if (visible) {
        shown += 1;
      }
    });

    if (sorter) {
      sortCards(grid, sorter.value);
    }
    if (empty) {
      empty.classList.toggle("is-visible", shown === 0);
    }
  }

  function bindFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!panel || !grid) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var input = panel.querySelector("[data-filter-input]");
    if (input && initialQuery) {
      input.value = initialQuery;
    }
    Array.prototype.slice.call(panel.querySelectorAll("input, select")).forEach(function (control) {
      control.addEventListener("input", function () {
        applyFilters(panel);
      });
      control.addEventListener("change", function () {
        applyFilters(panel);
      });
    });
    Array.prototype.slice.call(panel.querySelectorAll("[data-view]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var mode = button.getAttribute("data-view");
        grid.classList.toggle("list-mode", mode === "list");
        Array.prototype.slice.call(panel.querySelectorAll("[data-view]")).forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
      });
    });
    applyFilters(panel);
  }

  function initPlayer(options) {
    var root = document.querySelector(options.selector);
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var status = root.querySelector(".player-status");
    var stream = options.stream;
    var initialized = false;
    var pendingPlay = false;
    var hls = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (pendingPlay && cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    function attachStream() {
      if (!video || initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.addEventListener("loadedmetadata", function () {
          if (pendingPlay) {
            playVideo();
          }
        }, { once: true });
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pendingPlay) {
            playVideo();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          setStatus("播放暂时不可用");
        });
        return;
      }
      video.src = stream;
    }

    function begin() {
      pendingPlay = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      setStatus("");
      attachStream();
      playVideo();
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (cover && video.currentTime === 0) {
          cover.classList.remove("is-hidden");
        }
      });
      video.addEventListener("error", function () {
        setStatus("播放暂时不可用");
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    bindMobileNav();
    bindHero();
    bindFilters();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();

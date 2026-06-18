(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var next = slider.querySelector(".hero-next");
    var prev = slider.querySelector(".hero-prev");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        move(1);
      }, 5200);
    }

    if (next) next.addEventListener("click", function () { move(1); restart(); });
    if (prev) prev.addEventListener("click", function () { move(-1); restart(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); restart(); });
    });
    restart();
  }

  function initCatalogs() {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";
    var sections = Array.prototype.slice.call(document.querySelectorAll(".catalog-section"));
    sections.forEach(function (section) {
      var input = section.querySelector("[data-list-search]");
      var sort = section.querySelector("[data-list-sort]");
      var list = section.querySelector(".searchable-list");
      if (!list) return;
      var cards = Array.prototype.slice.call(list.children);

      function apply() {
        var value = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-hidden-card", value && haystack.indexOf(value) === -1);
        });
      }

      function sortCards() {
        if (!sort) return;
        var mode = sort.value;
        var sorted = cards.slice();
        sorted.sort(function (a, b) {
          if (mode === "latest") return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          if (mode === "popular") return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
          if (mode === "likes") return Number(b.getAttribute("data-likes") || 0) - Number(a.getAttribute("data-likes") || 0);
          return Number(a.getAttribute("data-id") || 0) - Number(b.getAttribute("data-id") || 0);
        });
        sorted.forEach(function (card) { list.appendChild(card); });
        cards = sorted;
      }

      if (input) {
        if (queryValue) input.value = queryValue;
        input.addEventListener("input", apply);
      }
      if (sort) {
        sort.addEventListener("change", function () {
          sortCards();
          apply();
        });
      }
      apply();
    });
  }

  function initBackTop() {
    var button = document.querySelector(".back-top");
    if (!button) return;
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCatalogs();
    initBackTop();
  });
})();

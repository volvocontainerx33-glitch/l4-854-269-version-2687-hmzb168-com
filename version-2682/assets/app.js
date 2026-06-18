(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var search = scope.querySelector("[data-search]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-key]"));
            var grid = scope.parentElement.querySelector("[data-card-grid]") || document.querySelector("[data-card-grid]");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
            var active = {};

            function apply() {
                var query = normalize(search ? search.value : "");
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchesText = !query || text.indexOf(query) !== -1;
                    var matchesFilters = Object.keys(active).every(function (key) {
                        var value = active[key];
                        if (!value || value === "all") {
                            return true;
                        }
                        return normalize(card.getAttribute("data-" + key)) === normalize(value);
                    });
                    card.classList.toggle("is-hidden", !(matchesText && matchesFilters));
                });
            }

            if (search) {
                search.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var key = button.getAttribute("data-filter-key");
                    var value = button.getAttribute("data-filter-value");
                    active[key] = value;
                    buttons
                        .filter(function (item) {
                            return item.getAttribute("data-filter-key") === key;
                        })
                        .forEach(function (item) {
                            item.classList.toggle("is-active", item === button);
                        });
                    apply();
                });
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();

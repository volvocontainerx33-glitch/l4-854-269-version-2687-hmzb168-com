(function () {
    var body = document.body;
    var rootPath = body.getAttribute("data-root-path") || "";

    var navToggle = document.querySelector("[data-nav-toggle]");
    var siteNav = document.querySelector("[data-site-nav]");

    if (navToggle && siteNav) {
        navToggle.addEventListener("click", function () {
            siteNav.classList.toggle("is-open");
            body.classList.toggle("is-nav-open", siteNav.classList.contains("is-open"));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === currentSlide);
        });
    }

    function startHeroTimer() {
        if (slides.length < 2) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            startHeroTimer();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(currentSlide - 1);
            startHeroTimer();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(currentSlide + 1);
            startHeroTimer();
        });
    }

    showSlide(0);
    startHeroTimer();

    function imageTag(item) {
        return '<img src="' + rootPath + item.cover + '" alt="' + escapeHtml(item.title) + '封面" loading="lazy" onerror="this.remove();">';
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character];
        });
    }

    function renderSearchResults(query, panel) {
        var data = window.SEARCH_INDEX || [];
        var normalized = query.trim().toLowerCase();

        if (!normalized) {
            panel.innerHTML = "";
            panel.classList.remove("is-open");
            return;
        }

        var results = data.filter(function (item) {
            var haystack = [item.title, item.genre, item.type, item.year, item.tags].join(" ").toLowerCase();
            return haystack.indexOf(normalized) !== -1;
        }).slice(0, 14);

        if (!results.length) {
            panel.innerHTML = '<div class="search-result"><div></div><div><strong>没有找到匹配影片</strong><span>换一个片名、类型或年份试试</span></div></div>';
            panel.classList.add("is-open");
            return;
        }

        panel.innerHTML = results.map(function (item) {
            return '<a class="search-result" href="' + rootPath + item.url + '">' +
                '<span class="search-result-poster">' + imageTag(item) + '</span>' +
                '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.type + ' · ' + item.genre) + '</span></span>' +
                '</a>';
        }).join("");
        panel.classList.add("is-open");
    }

    var globalSearch = document.querySelector("[data-global-search]");
    var searchPanel = document.querySelector("[data-search-panel]");

    if (globalSearch && searchPanel) {
        globalSearch.addEventListener("input", function () {
            renderSearchResults(globalSearch.value, searchPanel);
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest(".global-search")) {
                searchPanel.classList.remove("is-open");
            }
        });
    }

    var localSearch = document.querySelector("[data-local-search]");
    var localCount = document.querySelector("[data-filter-count]");
    var localCards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));

    function filterLocalCards() {
        if (!localSearch || !localCards.length) {
            return;
        }

        var query = localSearch.value.trim().toLowerCase();
        var visible = 0;

        localCards.forEach(function (card) {
            var haystack = [
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-category")
            ].join(" ").toLowerCase();
            var matched = !query || haystack.indexOf(query) !== -1;
            card.classList.toggle("hidden-card", !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (localCount) {
            localCount.textContent = "当前显示 " + visible + " 部";
        }
    }

    if (localSearch) {
        localSearch.addEventListener("input", filterLocalCards);
        filterLocalCards();
    }
})();

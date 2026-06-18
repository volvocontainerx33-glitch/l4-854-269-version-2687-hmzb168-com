(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("is-missing");
        }, { once: true });
    });

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let activeIndex = 0;
        let timer = null;

        function setActive(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function nextSlide() {
            setActive(activeIndex + 1);
        }

        function restartTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(nextSlide, 5600);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                setActive(activeIndex - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                nextSlide();
                restartTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setActive(Number(dot.dataset.heroDot || 0));
                restartTimer();
            });
        });

        restartTimer();
    }

    const cardList = document.querySelector("[data-card-list]");
    const localSearch = document.querySelector(".js-local-search");
    const sortSelect = document.querySelector(".js-sort");

    if (cardList) {
        const cards = Array.from(cardList.querySelectorAll("[data-movie-card]"));

        function applyListState() {
            const keyword = localSearch ? localSearch.value.trim().toLowerCase() : "";
            const sortedCards = cards.slice();
            const sortMode = sortSelect ? sortSelect.value : "default";

            if (sortMode === "year") {
                sortedCards.sort(function (a, b) {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
            }

            if (sortMode === "score") {
                sortedCards.sort(function (a, b) {
                    return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
                });
            }

            if (sortMode === "title") {
                sortedCards.sort(function (a, b) {
                    return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
                });
            }

            sortedCards.forEach(function (card) {
                cardList.appendChild(card);
                const haystack = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.genre].join(" ").toLowerCase();
                card.style.display = haystack.includes(keyword) ? "" : "none";
            });
        }

        if (localSearch) {
            localSearch.addEventListener("input", applyListState);
        }

        if (sortSelect) {
            sortSelect.addEventListener("change", applyListState);
        }
    }

    const searchResults = document.querySelector("[data-search-results]");
    const searchStatus = document.querySelector("[data-search-status]");
    const searchInput = document.querySelector("[data-search-input]");

    if (searchResults && searchStatus && window.SEARCH_MOVIES) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        function makeCard(movie) {
            const tags = movie.tags.slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");

            return "<article class="movie-card">" +
                "<a class="poster" href="" + movie.url + "" aria-label="" + escapeHtml(movie.title) + "">" +
                    "<img src="" + movie.cover + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
                    "<span class="poster-play">▶</span>" +
                "</a>" +
                "<div class="movie-card-body">" +
                    "<div class="movie-meta"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
                    "<h3><a href="" + movie.url + "">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class="tag-row">" + tags + "</div>" +
                "</div>" +
            "</article>";
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function runSearch(query) {
            const keyword = query.trim().toLowerCase();
            if (!keyword) {
                searchStatus.textContent = "请输入关键词，查找片名、类型、年份或标签。";
                searchResults.innerHTML = "";
                return;
            }

            const matches = window.SEARCH_MOVIES.filter(function (movie) {
                const haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.oneLine, movie.tags.join(" ")].join(" ").toLowerCase();
                return haystack.includes(keyword);
            }).slice(0, 160);

            searchStatus.textContent = matches.length ? "搜索结果：" + query : "没有找到相关内容";
            searchResults.innerHTML = matches.map(makeCard).join("");
            searchResults.querySelectorAll("img").forEach(function (image) {
                image.addEventListener("error", function () {
                    image.classList.add("is-missing");
                }, { once: true });
            });
        }

        runSearch(initialQuery);
    }
}());

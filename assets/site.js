(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
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

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initCardFilters() {
        var panel = qs('[data-filter-panel]');
        var list = qs('[data-card-list]');
        if (!panel || !list) {
            return;
        }
        var search = qs('[data-card-search]', panel);
        var year = qs('[data-year-filter]', panel);
        var type = qs('[data-type-filter]', panel);
        var cards = qsa('.movie-card', list);

        function value(node) {
            return node ? String(node.value || '').trim().toLowerCase() : '';
        }

        function apply() {
            var keyword = value(search);
            var yearValue = value(year);
            var typeValue = value(type);
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type')
                ].join(' ').toLowerCase();
                var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var passYear = !yearValue || String(card.getAttribute('data-year')) === yearValue;
                var passType = !typeValue || String(card.getAttribute('data-type')).toLowerCase() === typeValue;
                card.classList.toggle('is-filtered-out', !(passKeyword && passYear && passType));
            });
        }

        [search, year, type].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
    }

    function createResultCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a class="card-cover" href="' + escapeAttr(item.href) + '" aria-label="' + escapeAttr(item.title) + '">',
            '<img src="' + escapeAttr(item.cover) + '" alt="' + escapeAttr(item.title) + '" loading="lazy">',
            '<span class="card-play">▶</span>',
            '</a>',
            '<div class="card-body">',
            '<div class="card-meta"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
            '<h3><a href="' + escapeAttr(item.href) + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p class="card-desc compact">' + escapeHtml(item.desc) + '</p>',
            '<div class="card-tags">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, '&#96;');
    }

    function initSearchPage() {
        var results = qs('[data-search-results]');
        var title = qs('[data-search-title]');
        var input = qs('[data-search-input]');
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = String(params.get('q') || '').trim();
        if (input) {
            input.value = query;
        }
        var normalized = query.toLowerCase();
        var matched = window.SEARCH_INDEX.filter(function (item) {
            if (!normalized) {
                return true;
            }
            var haystack = [
                item.title,
                item.desc,
                item.category,
                item.year,
                item.region,
                item.type,
                (item.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.indexOf(normalized) !== -1;
        }).slice(0, 160);
        if (title) {
            title.textContent = query ? '“' + query + '”的搜索结果' : '精选搜索结果';
        }
        results.innerHTML = matched.map(createResultCard).join('');
    }

    function initMoviePlayer(source) {
        var video = qs('[data-player]');
        var overlay = qs('[data-play-overlay]');
        if (!video || !source) {
            return;
        }
        var hls = null;
        var attached = false;

        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                attached = true;
                return;
            }
            video.src = source;
            attached = true;
        }

        function start(event) {
            if (event) {
                event.preventDefault();
            }
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!attached) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initCardFilters();
        initSearchPage();
    });

    window.Site = {
        initMoviePlayer: initMoviePlayer
    };
}());

(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var menu = document.querySelector('.mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var isHidden = menu.hasAttribute('hidden');
            if (isHidden) {
                menu.removeAttribute('hidden');
            } else {
                menu.setAttribute('hidden', 'hidden');
            }
            button.setAttribute('aria-expanded', String(isHidden));
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    }

    function populateFilterOptions(panel, cards) {
        var regionSelect = panel.querySelector('[data-filter-region]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var regions = [];
        var types = [];

        cards.forEach(function (card) {
            var region = card.getAttribute('data-region') || '';
            var type = card.getAttribute('data-type') || '';
            if (region && regions.indexOf(region) === -1) {
                regions.push(region);
            }
            if (type && types.indexOf(type) === -1) {
                types.push(type);
            }
        });

        regions.sort().forEach(function (region) {
            var option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });

        types.sort().forEach(function (type) {
            var option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });
    }

    function setupFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var results = document.querySelector('[data-filter-results]');
        if (!panel || !results) {
            return;
        }

        var cards = Array.prototype.slice.call(results.querySelectorAll('[data-filter-card]'));
        var keywordInput = panel.querySelector('[data-filter-keyword]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var sortSelect = panel.querySelector('[data-filter-sort]');
        var count = panel.querySelector('[data-filter-count]');
        var largeSearch = document.querySelector('[data-large-search]');
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get('q') || '';

        populateFilterOptions(panel, cards);

        if (keywordInput && initialKeyword) {
            keywordInput.value = initialKeyword;
        }
        if (largeSearch && initialKeyword) {
            largeSearch.value = initialKeyword;
        }

        function applySort() {
            var sorted = cards.slice();
            var sortValue = sortSelect ? sortSelect.value : 'default';
            if (sortValue === 'year-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
            } else if (sortValue === 'year-asc') {
                sorted.sort(function (a, b) {
                    return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                });
            } else if (sortValue === 'title') {
                sorted.sort(function (a, b) {
                    return normalize(a.textContent).localeCompare(normalize(b.textContent), 'zh-Hans-CN');
                });
            }
            sorted.forEach(function (card) {
                results.appendChild(card);
            });
        }

        function applyFilters() {
            var keyword = normalize(keywordInput ? keywordInput.value : '');
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute('data-search') + ' ' + card.textContent);
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                var matchesRegion = !region || cardRegion === region;
                var matchesType = !type || cardType === type;
                var show = matchesKeyword && matchesRegion && matchesType;
                card.classList.toggle('is-hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
            }
        }

        [keywordInput, regionSelect, typeSelect, sortSelect].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener('input', function () {
                applySort();
                applyFilters();
            });
            control.addEventListener('change', function () {
                applySort();
                applyFilters();
            });
        });

        applySort();
        applyFilters();
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupFilters();
    });
}());

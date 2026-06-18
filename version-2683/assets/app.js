(() => {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initMobileNav() {
    const toggle = qs('[data-mobile-toggle]');
    const nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    const root = qs('[data-hero-carousel]');
    if (!root) {
      return;
    }
    const slides = qsa('[data-hero-slide]', root);
    const dots = qsa('[data-hero-dot]', root);
    const prev = qs('[data-hero-prev]', root);
    const next = qs('[data-hero-next]', root);
    if (!slides.length) {
      return;
    }

    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    prev?.addEventListener('click', () => {
      show(index - 1);
      start();
    });

    next?.addEventListener('click', () => {
      show(index + 1);
      start();
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = Number(dot.dataset.heroDot || 0);
        show(target);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initFilterPanels() {
    qsa('[data-filter-panel]').forEach((panel) => {
      const section = panel.closest('section') || document;
      const cards = qsa('[data-movie-card]', section);
      const chips = qsa('[data-filter-value]', panel);
      chips.forEach((chip) => {
        chip.addEventListener('click', () => {
          const value = chip.dataset.filterValue || 'all';
          chips.forEach((item) => item.classList.toggle('active', item === chip));
          cards.forEach((card) => {
            const haystack = [
              card.dataset.title,
              card.dataset.genre,
              card.dataset.tags,
              card.dataset.region,
              card.dataset.year,
            ].join(' ');
            card.hidden = value !== 'all' && !haystack.includes(value);
          });
        });
      });
    });
  }

  function cardTemplate(movie) {
    const escapedTitle = escapeHtml(movie.title);
    const escapedLine = escapeHtml(movie.one_line || '');
    const cover = escapeHtml(movie.cover || '1.jpg');
    const url = escapeHtml(movie.url || '#');
    return `
      <article class="movie-card movie-card-compact" data-movie-card>
        <a href="${url}" title="${escapedTitle} 在线观看">
          <div class="card-cover">
            <img src="${cover}" alt="${escapedTitle}" loading="lazy" onerror="this.classList.add('is-missing'); this.removeAttribute('src');">
            <span class="play-dot">▶</span>
          </div>
          <div class="card-body">
            <div class="card-category">${escapeHtml(movie.category || '')}</div>
            <h3>${escapedTitle}</h3>
            <p>${escapedLine}</p>
            <div class="card-meta">
              <span>${escapeHtml(movie.year || '')}</span>
              <span>${escapeHtml(movie.region || '')}</span>
              <span>${escapeHtml(movie.type || '')}</span>
            </div>
          </div>
        </a>
      </article>`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function initSearchPage() {
    const form = qs('[data-search-page-form]');
    const results = qs('#search-results');
    const status = qs('#search-status');
    if (!form || !results || !status || !window.MOVIES) {
      return;
    }

    const input = qs('input[name="q"]', form);
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    input.value = initialQuery;

    const render = (query) => {
      const q = query.trim().toLowerCase();
      if (!q) {
        const starter = window.MOVIES.slice(0, 24);
        results.innerHTML = starter.map(cardTemplate).join('');
        status.textContent = '默认展示首页精选，输入关键词后即时筛选。';
        return;
      }
      const matched = window.MOVIES.filter((movie) => {
        const haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.one_line,
          movie.category,
        ].join(' ').toLowerCase();
        return haystack.includes(q);
      });
      results.innerHTML = matched.slice(0, 240).map(cardTemplate).join('');
      status.textContent = `找到 ${matched.length} 条结果${matched.length > 240 ? '，当前展示前 240 条' : ''}。`;
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = input.value.trim();
      const url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      render(query);
    });

    input.addEventListener('input', () => render(input.value));

    qsa('[data-search-suggestion]').forEach((button) => {
      button.addEventListener('click', () => {
        input.value = button.dataset.searchSuggestion || '';
        form.dispatchEvent(new Event('submit'));
      });
    });

    render(initialQuery);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initHeroCarousel();
    initFilterPanels();
    initSearchPage();
  });
})();

/* =============================================================
   Sindo Landing — interactive layer (header, promo, drawer, deal)
   ============================================================= */
(function () {
  'use strict';

  // ── Drawer menu ──
  const drawer = document.getElementById('drawer');
  const menuBtn = document.getElementById('header-menu');
  if (drawer && menuBtn) {
    const open = () => { drawer.hidden = false; document.body.style.overflow = 'hidden'; };
    const close = () => { drawer.hidden = true; document.body.style.overflow = ''; };
    menuBtn.addEventListener('click', open);
    drawer.querySelectorAll('[data-close-drawer]').forEach(el => el.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // ── Rotating promo strip ──
  const promoTrack = document.getElementById('promo-track');
  if (promoTrack) {
    const msgs = Array.from(promoTrack.querySelectorAll('.promo-msg'));
    if (msgs.length > 1) {
      let idx = 0;
      msgs.forEach((m, i) => m.classList.toggle('active', i === 0));
      const tick = () => {
        msgs[idx].classList.remove('active');
        idx = (idx + 1) % msgs.length;
        msgs[idx].classList.add('active');
      };
      let timer = setInterval(tick, 4000);
      promoTrack.parentElement.addEventListener('mouseenter', () => clearInterval(timer));
      promoTrack.parentElement.addEventListener('mouseleave', () => { timer = setInterval(tick, 4000); });
      document.querySelector('.promo-prev')?.addEventListener('click', () => { tick(); clearInterval(timer); timer = setInterval(tick, 4000); });
      document.querySelector('.promo-next')?.addEventListener('click', () => { tick(); clearInterval(timer); timer = setInterval(tick, 4000); });
    }
  }

  // ── Category icon tiles ──
  const catTiles = document.getElementById('cat-tiles');
  if (catTiles && typeof CATEGORIES !== 'undefined') {
    const ICONS = {
      'Beauty & Skin': '💆‍♀️',
      'Bone & Joint': '🦴',
      'Herbal': '🌿',
      'Minerals': '🧂',
      'Prenatal': '🤰',
      'Sleep & Relaxation': '🌙',
      'Vitamins': '💊',
      'Sports': '🏃',
      'Bath & Personal Care': '🛁',
      'Grocery': '🛒',
      'Home': '🏠',
      'Baby & Kids': '👶',
      'Pets': '🐾',
      'Serums & Essences': '💧',
      'Treatments & Patches': '🩹',
      'Sun Care': '☀️',
      'Lip Care': '💋',
      'Moisturizers & Creams': '🧴',
      'Toner & Essence': '🌊'
    };
    catTiles.innerHTML = CATEGORIES.map(cat => `
      <a class="cat-tile" href="categories.html#cat-${slug(cat)}">
        <span class="cat-tile-icon" aria-hidden="true">${ICONS[cat] || '🛍️'}</span>
        <span class="cat-tile-label">${cat}</span>
      </a>
    `).join('');
  }

  // ── Top brands grid ──
  const brandGrid = document.getElementById('brand-grid');
  if (brandGrid && typeof BRANDS !== 'undefined') {
    const COLORS = {
      'California Gold Nutrition': '#1e40af',
      'NOW Foods': '#166534',
      "Nature's Way": '#15803d',
      'LifeSeasons': '#7c3aed',
      'Eclectic Herb': '#a16207'
    };
    brandGrid.innerHTML = BRANDS.map(b => `
      <a class="brand-tile" href="categories.html?brand=${encodeURIComponent(b)}" style="--c: ${COLORS[b] || '#6b7280'};">
        <span class="brand-tile-letter">${b[0]}</span>
        <span class="brand-tile-name">${b}</span>
      </a>
    `).join('');
  }

  // ── Deal timer (24 hours from page load, refreshes daily) ──
  const dealTimer = document.getElementById('deal-timer');
  if (dealTimer) {
    const update = () => {
      const now = Date.now();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const ms = endOfDay.getTime() - now;
      if (ms <= 0) { dealTimer.textContent = '00:00:00'; return; }
      const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
      const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
      dealTimer.textContent = `${h}:${m}:${s}`;
    };
    update();
    setInterval(update, 1000);
  }

  // ── Recently-viewed section (uses widgets.js localStorage) ──
  const rvSection = document.getElementById('section-rv');
  const rvStrip = document.getElementById('rv-strip');
  if (rvSection && rvStrip && typeof PRODUCTS !== 'undefined') {
    const render = () => {
      let recent = [];
      try { recent = JSON.parse(localStorage.getItem('sindo_recently_viewed_v1') || '[]'); } catch {}
      if (!recent.length) { rvSection.hidden = true; return; }
      const items = recent.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean).slice(0, 8);
      if (!items.length) { rvSection.hidden = true; return; }
      rvSection.hidden = false;
      rvStrip.innerHTML = items.map(p => `
        <a class="card card-mini" href="product.html?itemId=${encodeURIComponent(p.id)}" data-go-product="${p.id}">
          <div class="thumb">
            <img src="${p.image}" alt="${p.title}" loading="lazy" decoding="async" onerror="this.style.opacity=0">
          </div>
          <div class="info">
            <div class="brand">${p.brand}</div>
            <div class="title" title="${p.title}">${p.title.length > 50 ? p.title.slice(0, 47) + '…' : p.title}</div>
            <div class="price">S$${p.priceSgd.toFixed(2)}</div>
          </div>
        </a>
      `).join('');
    };
    render();
    // Expose for clear button
    window.sindoClearRecent = () => { localStorage.removeItem('sindo_recently_viewed_v1'); render(); };
  }

  // ── Live search suggest (lite autocomplete) ──
  const searchInput = document.getElementById('header-search-input');
  const suggestBox = document.getElementById('header-search-suggest');
  if (searchInput && suggestBox && typeof PRODUCTS !== 'undefined') {
    let timer;
    const close = () => { suggestBox.hidden = true; suggestBox.innerHTML = ''; };
    const open = () => { if (suggestBox.innerHTML) suggestBox.hidden = false; };
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      const q = searchInput.value.trim().toLowerCase();
      if (q.length < 2) { close(); return; }
      timer = setTimeout(() => {
        const hits = PRODUCTS
          .map(p => {
            const hay = `${p.title} ${p.brand} ${p.category}`.toLowerCase();
            let score = 0;
            if (p.title.toLowerCase().startsWith(q)) score = 100;
            else if (p.brand.toLowerCase().startsWith(q)) score = 50;
            else if (hay.includes(q)) score = 10;
            return { p, score };
          })
          .filter(r => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6);
        if (!hits.length) { close(); return; }
        suggestBox.innerHTML = `
          ${hits.map(({ p }) => `
            <a class="search-suggest-item" href="product.html?itemId=${encodeURIComponent(p.id)}" role="option">
              <img class="search-suggest-thumb" src="${p.image}" alt="" loading="lazy" onerror="this.style.opacity=0">
              <div>
                <div class="search-suggest-title">${highlight(p.title, q)}</div>
                <div class="search-suggest-meta">${p.brand} · S$${p.priceSgd.toFixed(2)}</div>
              </div>
            </a>
          `).join('')}
          <a class="search-suggest-more" href="search.html?q=${encodeURIComponent(searchInput.value)}">See all results for "${escapeHtml(searchInput.value)}" →</a>
        `;
        open();
      }, 120);
    });
    searchInput.addEventListener('blur', () => setTimeout(close, 180));
    searchInput.addEventListener('focus', open);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !suggestBox.hidden) close();
    });
  }

  // ── Helpers ──
  function slug(s) {
    return (s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  function escapeHtml(s) {
    return (s ?? '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function highlight(text, q) {
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return escapeHtml(text);
    return escapeHtml(text.slice(0, idx)) + '<mark>' + escapeHtml(text.slice(idx, idx + q.length)) + '</mark>' + escapeHtml(text.slice(idx + q.length));
  }
})();

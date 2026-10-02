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
  // ── Recommended-for-you personalization ──
  const recSection = document.getElementById('section-rec');
  const recStrip = document.getElementById('rec-strip');

  function getRecentlyViewed() {
    try { return JSON.parse(localStorage.getItem('sindo_recently_viewed_v1') || '[]'); } catch { return []; }
  }
  function getWishlist() {
    try { return JSON.parse(localStorage.getItem('sindo_wishlist_v1') || '[]'); } catch { return []; }
  }

  function buildRecommendations() {
    if (!recStrip || typeof PRODUCTS === 'undefined') return;
    const recent = getRecentlyViewed();
    const wishlist = getWishlist();

    // Strategy: score each product by
    // - same brand as recently-viewed (+30)
    // - same category as recently-viewed (+15)
    // - in wishlist already (skip — don't recommend what's saved)
    // - high rating (+10)
    // - within ±20% price of recently-viewed median (+5)
    const recentProducts = recent.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
    const brands = new Set(recentProducts.map(p => p.brand));
    const categories = new Set(recentProducts.map(p => p.category));
    const priceMedian = recentProducts.length
      ? recentProducts.map(p => p.priceSgd).sort((a, b) => a - b)[Math.floor(recentProducts.length / 2)]
      : null;

    const scored = PRODUCTS
      .filter(p => !wishlist.includes(p.id) && !recent.includes(p.id))
      .map(p => {
        let score = 0;
        if (brands.has(p.brand)) score += 30;
        if (categories.has(p.category)) score += 15;
        if (p.rating >= 4.7) score += 10;
        if (priceMedian && Math.abs(p.priceSgd - priceMedian) / priceMedian <= 0.2) score += 5;
        if (p.reviews >= 30000) score += 5;
        return { p, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(r => r.p);

    // Fallback: if no signals yet, show top-rated products
    const recs = scored.length ? scored : PRODUCTS.sort((a, b) => b.rating - a.rating).slice(0, 6);

    recSection.hidden = false;
    recStrip.innerHTML = recs.map(p => `
      <a class="card card-mini" href="product.html?itemId=${encodeURIComponent(p.id)}" data-go-product="${p.id}">
        <div class="thumb">
          <img src="${p.image}" alt="${p.title}" loading="lazy" decoding="async" onerror="this.style.opacity=0">
        </div>
        <div class="info">
          <div class="brand">${p.brand}</div>
          <div class="title" title="${p.title}">${p.title.length > 50 ? p.title.slice(0, 47) + '…' : p.title}</div>
          <div class="rating">★ ${p.rating} <span class="muted">(${p.reviews.toLocaleString('en-US')})</span></div>
          <div class="price">S$${p.priceSgd.toFixed(2)}</div>
        </div>
      </a>
    `).join('');
    attachWishlistHearts?.(recStrip);
  }

  buildRecommendations();

  if (rvSection && rvStrip) {
    const render = () => {
      const recent = getRecentlyViewed();
      if (!recent.length) { rvSection.hidden = true; buildRecommendations(); return; }
      const items = recent.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean).slice(0, 8);
      if (!items.length) { rvSection.hidden = true; buildRecommendations(); return; }
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
      buildRecommendations();
    };
    render();
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

/* ── Cookie consent banner ── */
(function () {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  const KEY = 'sindo_cookie_consent_v1';
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch {}
  if (!stored) {
    setTimeout(() => { banner.classList.add('shown'); banner.hidden = false; }, 1200);
  }
  const close = (val) => {
    try { localStorage.setItem(KEY, JSON.stringify({ decision: val, at: Date.now() })); } catch {}
    banner.classList.remove('shown');
    setTimeout(() => { banner.hidden = true; }, 250);
  };
  document.getElementById('cookie-accept')?.addEventListener('click', () => close('accept'));
  document.getElementById('cookie-decline')?.addEventListener('click', () => close('decline'));
})();

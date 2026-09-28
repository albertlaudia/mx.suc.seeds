/* =============================================================
   Sindo Customer Widgets — wishlist, reviews, newsletter, recently-viewed
   Pure client-side persistence via localStorage
   Shared across all customer-facing pages
   ============================================================= */

(function () {
  'use strict';

  // ── Storage keys ──
  const KEYS = {
    wishlist: 'sindo_wishlist_v1',
    reviews: 'sindo_reviews_v1',
    subs: 'sindo_subscribers_v1',
    recent: 'sindo_recently_viewed_v1',
  };

  // ── Storage helpers ──
  const read = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
    catch { return fallback; }
  };
  const write = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  };
  const fire = (name, detail = {}) => {
    document.dispatchEvent(new CustomEvent(`sindo:${name}`, { detail }));
  };

  // ── Wishlist ──
  const wishlist = {
    list() { return read(KEYS.wishlist, []); },          // ['now-mag-glyc-180', ...]
    has(id) { return this.list().includes(id); },
    add(id) {
      const l = this.list();
      if (!l.includes(id)) { l.push(id); write(KEYS.wishlist, l); fire('wishlist:change'); }
    },
    remove(id) {
      const l = this.list().filter(x => x !== id);
      write(KEYS.wishlist, l); fire('wishlist:change');
    },
    toggle(id) { this.has(id) ? this.remove(id) : this.add(id); },
    count() { return this.list().length; },
    clear() { write(KEYS.wishlist, []); fire('wishlist:change'); },
  };
  window.sindoWishlist = wishlist;

  // ── Reviews ──
  const reviews = {
    list() { return read(KEYS.reviews, []); },
    listFor(productId) { return this.list().filter(r => r.productId === productId); },
    count(productId) { return this.listFor(productId).length; },
    add(productId, data) {
      const review = {
        id: 'rv-' + Date.now(),
        productId,
        author: data.author || 'Anonymous',
        rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
        title: data.title || '',
        body: data.body || '',
        verified: false,
        helpful: 0,
        createdAt: new Date().toISOString(),
      };
      const l = this.list();
      l.unshift(review);
      write(KEYS.reviews, l);
      fire('reviews:change', { productId });
      return review;
    },
    helpful(reviewId) {
      const l = this.list();
      const r = l.find(x => x.id === reviewId);
      if (r) { r.helpful = (r.helpful || 0) + 1; write(KEYS.reviews, l); fire('reviews:change', { productId: r.productId }); }
    },
    average(productId) {
      const l = this.listFor(productId);
      if (!l.length) return null;
      return l.reduce((sum, r) => sum + r.rating, 0) / l.length;
    },
    countAll() { return this.list().length; },
  };
  window.sindoReviews = reviews;

  // ── Newsletter ──
  const subs = {
    list() { return read(KEYS.subs, []); },
    isSubscribed(email) {
      return this.list().some(s => s.email.toLowerCase() === email.toLowerCase());
    },
    add(email) {
      email = (email || '').trim().toLowerCase();
      if (!email.includes('@')) return { ok: false, error: 'Invalid email' };
      if (this.isSubscribed(email)) return { ok: false, error: 'Already subscribed' };
      const l = this.list();
      l.push({ email, at: new Date().toISOString() });
      write(KEYS.subs, l);
      fire('subs:change');
      return { ok: true };
    },
    count() { return this.list().length; },
  };
  window.sindoSubs = subs;

  // ── Recently viewed ──
  const recent = {
    list() { return read(KEYS.recent, []); },            // [{id, viewedAt}, ...]
    add(productId) {
      const l = this.list().filter(x => x.id !== productId);
      l.unshift({ id: productId, viewedAt: new Date().toISOString() });
      write(KEYS.recent, l.slice(0, 8));                // keep last 8
      fire('recent:change');
    },
    count() { return this.list().length; },
    clear() { write(KEYS.recent, []); fire('recent:change'); },
  };
  window.sindoRecent = recent;

  // ── Toasts (small UX detail) ──
  function toast(message, kind = 'success') {
    let t = document.getElementById('sindo-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'sindo-toast';
      t.className = 'admin-toast';
      t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.className = `admin-toast show ${kind}`;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.className = 'admin-toast', 2500);
  }
  window.sindoToast = toast;

  // ── Heart icon factory (used by PDP, listings) ──
  function attachWishlistHearts(root = document) {
    root.querySelectorAll('[data-wishlist-product]').forEach(btn => {
      const id = btn.dataset.wishlistProduct;
      const update = () => {
        const on = wishlist.has(id);
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
        const label = btn.querySelector('.wish-label');
        if (label) label.textContent = on ? 'Saved' : 'Save';
      };
      btn.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        const was = wishlist.has(id);
        wishlist.toggle(id);
        toast(was ? 'Removed from wishlist' : 'Saved to wishlist ♥');
      });
      update();
    });
  }
  window.attachWishlistHearts = attachWishlistHearts;

  // ── Auto-wire on DOMContentLoaded ──
  document.addEventListener('DOMContentLoaded', () => {
    attachWishlistHearts(document);
    updateWishlistBadge();
    wireNewsletterForms();
    wireReviewForms();
    renderRecentlyViewed();
    showNewsletterModal();
  });
  document.addEventListener('sindo:wishlist:change', () => {
    updateWishlistBadge();
    attachWishlistHearts(document);                       // re-sync buttons
  });

  // ── Wishlist count badge in header ──
  function updateWishlistBadge() {
    const n = wishlist.count();
    document.querySelectorAll('[data-wishlist-count]').forEach(el => {
      el.textContent = n;
      el.style.display = n > 0 ? '' : 'none';
    });
  }

  // ── Newsletter form submit ──
  function wireNewsletterForms() {
    document.querySelectorAll('form[data-newsletter]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const email = form.email?.value || form.querySelector('input[type=email]')?.value;
        const r = subs.add(email);
        if (r.ok) {
          toast('Subscribed — check your inbox for the welcome discount');
          form.reset();
        } else {
          toast(r.error, 'error');
        }
      });
    });
  }

  // ── Newsletter modal (first-visit only) ──
  function showNewsletterModal() {
    if (sessionStorage.getItem('sindo_modal_shown')) return;
    if (!('SHO_PRODUCTS' in window) && !window.location.pathname.match(/^\/(v2|kbeauty|index)/)) return;
    // Show after 8 seconds on home/v2/kbeauty
    setTimeout(() => {
      const modal = document.createElement('div');
      modal.id = 'newsletter-modal';
      modal.className = 'admin-modal';
      modal.innerHTML = `
        <div class="admin-modal-content" style="background:linear-gradient(135deg,#fff5f7,#fce4ec);max-width:520px;">
          <div style="text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🎉</div>
            <h3 style="font-family:var(--ff-display);font-size:32px;letter-spacing:-0.02em;line-height:1.1;margin-bottom:12px;">10% off your first order</h3>
            <p style="color:var(--c-text-2);margin-bottom:20px;">Subscribe to our wellness journal for new-arrival alerts, routine guides, and a welcome discount.</p>
            <form data-newsletter style="display:flex;gap:8px;flex-direction:column;">
              <input type="email" name="email" required placeholder="your@email.com"
                style="height:44px;padding:0 16px;border-radius:var(--r-md);border:1px solid var(--c-border);background:white;font-size:var(--fs-md);">
              <button type="submit" class="btn btn-primary" style="height:44px;font-size:var(--fs-md);">Subscribe & get 10% off</button>
            </form>
            <button type="button" id="modal-close" style="background:transparent;border:none;color:var(--c-text-muted);font-size:13px;margin-top:16px;cursor:pointer;">No thanks</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelector('#modal-close').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
      sessionStorage.setItem('sindo_modal_shown', '1');
    }, 8000);
  }

  // ── Review form submit + helpful votes ──
  function wireReviewForms() {
    document.querySelectorAll('form[data-review-form]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const pid = form.dataset.reviewForm;
        const data = Object.fromEntries(new FormData(form));
        const r = reviews.add(pid, data);
        if (r) {
          toast('Review submitted — thank you!');
          form.reset();
          refreshReviewsList(pid);
          updateAggregate(pid);
        }
      });
    });
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-review-helpful]');
      if (btn) {
        const id = btn.dataset.reviewHelpful;
        reviews.helpful(id);
        btn.textContent = `👍 Helpful (${parseInt(btn.dataset.count || 0) + 1})`;
        btn.disabled = true;
        btn.dataset.count = String(parseInt(btn.dataset.count || 0) + 1);
      }
    });
  }

  // ── Refresh reviews list (used after submit) ──
  function refreshReviewsList(productId) {
    const list = document.querySelector('[data-reviews-list]');
    if (!list || list.dataset.productId !== productId) return;
    renderReviews(productId);
  }

  // ── Render reviews for current PDP ──
  function renderReviews(productId) {
    const list = document.querySelector('[data-reviews-list]');
    if (!list || list.dataset.productId !== productId) return;
    const userReviews = reviews.listFor(productId);
    if (!userReviews.length) {
      list.innerHTML = '<p class="muted" style="padding:24px;text-align:center;">No reviews yet. Be the first to review this product.</p>';
      return;
    }
    list.innerHTML = userReviews.map(r => `
      <article class="review" style="padding:16px;border-bottom:1px solid var(--c-border);">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
          <strong>${escape(r.author)}</strong>
          ${r.verified ? '<span class="pill" style="margin-left:6px;">Verified buyer</span>' : ''}
          <span class="muted" style="margin-left:auto;font-size:12px;">${formatDate(r.createdAt)}</span>
        </div>
        <div style="color:#f59e0b;letter-spacing:2px;margin-bottom:6px;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        ${r.title ? `<h4 style="font-size:15px;margin:0 0 6px;">${escape(r.title)}</h4>` : ''}
        <p style="margin:0;color:var(--c-text-2);">${escape(r.body)}</p>
        <button class="btn btn-ghost btn-sm" data-review-helpful="${r.id}" data-count="${r.helpful || 0}" style="margin-top:8px;">👍 Helpful (${r.helpful || 0})</button>
      </article>
    `).join('');
  }
  function updateAggregate(productId) {
    const avg = reviews.average(productId);
    const cnt = reviews.count(productId);
    const el = document.querySelector('[data-reviews-aggregate]');
    if (!el) return;
    if (avg !== null) {
      el.querySelector('[data-rating-avg]').textContent = avg.toFixed(1);
      el.querySelector('[data-rating-count]').textContent = `(${cnt} customer review${cnt === 1 ? '' : 's'})`;
    }
  }

  function escape(s) {
    return (s ?? '').toString()
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return ''; }
  }

  // ── Recently viewed (render on PDP) ──
  function renderRecentlyViewed() {
    const wrap = document.querySelector('[data-recently-viewed]');
    if (!wrap) return;
    const list = recent.list().filter(x => x.id !== wrap.dataset.currentProduct);
    if (!list.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    const products = (window.SHO_PRODUCTS || []).concat(window.KBEAUTY?.products || []);
    const items = list.slice(0, 4).map(x => {
      const p = products.find(q => q.id === x.id);
      if (!p) return null;
      const isKb = window.KBEAUTY?.products?.includes(p);
      return `
        <a href="${isKb ? '#' : 'product.html?id=' + p.id}" class="product-card" data-recent-id="${p.id}">
          <div class="product-card-media"><img src="${p.image}" alt="${escape(p.title)}" loading="lazy" decoding="async"></div>
          <div class="product-card-body">
            <div class="product-card-brand">${escape(p.brand)}</div>
            <div class="product-card-title">${escape(p.title?.slice(0, 40))}${(p.title?.length || 0) > 40 ? '…' : ''}</div>
            <div class="product-card-price">S$${(p.priceSgd ?? p.price).toFixed(2)}</div>
          </div>
        </a>
      `;
    }).filter(Boolean).join('');
    if (!items) { wrap.style.display = 'none'; return; }
    const root = wrap.querySelector('[data-recent-grid]');
    if (root) root.innerHTML = items;
    const clear = wrap.querySelector('[data-recent-clear]');
    if (clear) clear.onclick = () => { recent.clear(); wrap.style.display = 'none'; };
  }
  document.addEventListener('sindo:recent:change', renderRecentlyViewed);

  // ── Re-render on cart/wishlist events ──
  document.addEventListener('sindo:reviews:change', e => {
    renderReviews(e.detail.productId);
    updateAggregate(e.detail.productId);
  });

  // ── Inject PDP-related stuff when renderProduct runs ──
  const _orig = window.renderProduct;
  window.renderProduct = function (...args) {
    const ret = _orig?.apply(this, args);
    setTimeout(() => {
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      if (!id) return;
      recent.add(id);
      attachWishlistHearts(document);
      renderReviews(id);
      updateAggregate(id);
    }, 50);
    return ret;
  };

  console.info('[Sindo] widgets ready · wishlist', wishlist.count(), '· reviews', reviews.countAll(), '· subs', subs.count(), '· recent', recent.count());
})();

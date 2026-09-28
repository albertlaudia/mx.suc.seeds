/* =============================================================
   Sindo Admin Shell — top bar + sidebar + auth gate (shared)
   Detects shopadmin vs console context via data-console="true"
   ============================================================= */
(function () {
  'use strict';

  const IS_CONSOLE = document.body.dataset.console === 'true';
  const AUTH_KEY = IS_CONSOLE ? 'katalog_console_auth' : 'sindo_admin_auth';
  const LOGIN_PATH = IS_CONSOLE ? 'login.html' : 'login.html';

  // ── Auth gate ──
  if (!location.pathname.endsWith('/login.html')) {
    if (!sessionStorage.getItem(AUTH_KEY)) {
      const parts = location.pathname.split('/');
      parts[parts.length - 1] = 'login.html';
      location.href = parts.join('/');
      return;
    }
  }

  // ── Sidebar HTML (different for shopadmin vs console) ──
  const SHOP_SIDEBAR = `
<aside class="admin-sidebar">
  <div class="admin-brand">
    <div class="logo">S</div>
    <div>
      <div class="name">Sindo Wellness</div>
      <small>Shop admin</small>
    </div>
  </div>
  <nav class="admin-nav">
    <div class="admin-nav-section">Overview</div>
    <a href="index.html" data-nav="index.html"><span>📊</span> Dashboard</a>
    <a href="orders.html" data-nav="orders.html"><span>📦</span> Orders <span class="badge" data-orders-count>0</span></a>
    <a href="products.html" data-nav="products.html"><span>🧴</span> Products</a>

    <div class="admin-nav-section">Customers</div>
    <a href="customers.html" data-nav="customers.html"><span>👥</span> Customers <span class="badge" data-customers-count>0</span></a>
    <a href="reviews.html" data-nav="reviews.html"><span>⭐</span> Reviews <span class="badge" data-reviews-count>0</span></a>
    <a href="subscribers.html" data-nav="subscribers.html"><span>✉️</span> Subscribers</a>

    <div class="admin-nav-section">Settings</div>
    <a href="shipping.html" data-nav="shipping.html"><span>🚚</span> Shipping</a>
    <a href="payment.html" data-nav="payment.html"><span>💳</span> Payment</a>
    <a href="settings.html" data-nav="settings.html"><span>⚙️</span> Settings</a>
  </nav>

  <div class="admin-sidebar-footer">
    <div class="admin-user">
      <div class="avatar" id="avatar-letter">S</div>
      <div class="admin-user-info">
        <div class="name" id="auth-email">owner@seeds.scaleupcrm.com</div>
        <div class="role">Shop owner</div>
      </div>
      <button id="logout" class="btn btn-ghost btn-sm" aria-label="Sign out">⎋</button>
    </div>
  </div>
</aside>
`;

  const CONSOLE_SIDEBAR = `
<aside class="admin-sidebar">
  <div class="admin-brand" style="background:linear-gradient(135deg,#c4476a,#a93558);">
    <div class="logo">K</div>
    <div>
      <div class="name">Katalog.id</div>
      <small>Platform console</small>
    </div>
  </div>
  <nav class="admin-nav">
    <div class="admin-nav-section">Overview</div>
    <a href="index.html" data-nav="index.html"><span>📊</span> Dashboard</a>
    <a href="tenants.html" data-nav="tenants.html"><span>🏪</span> Tenants</a>
    <a href="billing.html" data-nav="billing.html"><span>💳</span> Billing</a>

    <div class="admin-nav-section">Operations</div>
    <a href="audit.html" data-nav="audit.html"><span>🔒</span> Audit log</a>
    <a href="settings.html" data-nav="settings.html"><span>⚙️</span> Platform settings</a>
  </nav>

  <div class="admin-sidebar-footer">
    <div class="admin-user">
      <div class="avatar" id="avatar-letter" style="background:linear-gradient(135deg,#c4476a,#a93558);">P</div>
      <div class="admin-user-info">
        <div class="name" id="auth-email">platform@seeds.com</div>
        <div class="role">Platform admin</div>
      </div>
      <button id="logout" class="btn btn-ghost btn-sm" aria-label="Sign out">⎋</button>
    </div>
  </div>
</aside>
`;

  const SHELL = IS_CONSOLE ? CONSOLE_SIDEBAR : SHOP_SIDEBAR;

  function escapeHtml(s) {
    return (s ?? '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── Mount shell ──
  const root = document.getElementById('admin-root');
  if (!root) {
    console.error('[admin-shell] missing #admin-root');
    return;
  }

  const title = document.body.dataset.pageTitle || 'Dashboard';
  const subtitle = document.body.dataset.pageSubtitle || '';
  const pageActions = document.body.dataset.pageActions || '';

  const eyebrow = IS_CONSOLE
    ? 'Katalog.id · Platform console'
    : 'Sindo Wellness · Shop admin';
  const storefrontLink = IS_CONSOLE
    ? '<a href="../index.html" target="_blank" class="btn btn-ghost btn-sm">↗ View storefront</a>'
    : '<a href="../index.html" target="_blank" class="btn btn-ghost btn-sm">↗ View storefront</a>';
  const crossLink = IS_CONSOLE
    ? '<a href="../shopadmin/login.html" class="btn btn-ghost btn-sm">Shop admin →</a>'
    : '<a href="../console/login.html" class="btn btn-ghost btn-sm">Platform admin →</a>';

  root.innerHTML = `
    <div class="admin-shell">
      ${SHELL}
      <main class="admin-main">
        <div class="admin-header">
          <div>
            <span class="eyebrow">${eyebrow}</span>
            <h1 style="font-family: var(--ff-display); font-size: 32px; font-weight: 400; margin-top: 4px; letter-spacing: -0.025em;">${escapeHtml(title)}</h1>
            <p style="font-size: var(--fs-md); color: var(--c-text-muted); margin-top: 6px;">${escapeHtml(subtitle)}</p>
          </div>
          <div class="admin-header-actions">
            ${storefrontLink}
            ${crossLink}
            ${pageActions}
          </div>
        </div>
        <div id="page-root"></div>
      </main>
    </div>
  `;

  // ── Active link ──
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.admin-nav a').forEach(a => {
    if (a.dataset.nav === path) a.classList.add('active');
    else a.classList.remove('active');
  });

  // ── Inject user from auth ──
  try {
    const auth = JSON.parse(sessionStorage.getItem(AUTH_KEY) || '{}');
    if (auth.email) {
      const e = document.getElementById('auth-email');
      if (e) e.textContent = auth.email;
      const av = document.getElementById('avatar-letter');
      if (av) av.textContent = (auth.email[0] || (IS_CONSOLE ? 'P' : 'S')).toUpperCase();
    }
  } catch {}

  // ── Logout ──
  document.getElementById('logout').addEventListener('click', () => {
    if (confirm('Sign out?')) {
      sessionStorage.removeItem(AUTH_KEY);
      location.href = 'login.html';
    }
  });

  // ── Toast helper (used by pages) ──
  window.sindoToast = function (msg, kind = 'success') {
    let t = document.getElementById('admin-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'admin-toast';
      t.className = 'admin-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = `admin-toast show ${kind}`;
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  };
})();

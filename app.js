// Mock user-journey runtime — Sindo × Sindo Shipping
// Full journey: home → product → cart → checkout → order → tracking

// ─── Currency / formatting ──────────────────────────────────────────────────
function formatIdr(n) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}
function escapeHtml(s) {
  return (s ?? "").toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function slugify(s) {
  return (s || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Lazy-load helper ───────────────────────────────────────────────────────
// Defers non-visible images via IntersectionObserver so first paint stays fast
function lazyImgAttrs(extra = "") {
  return `loading="lazy" decoding="async"${extra ? " " + extra : ""}`;
}

// ─── Cart state (localStorage) ───────────────────────────────────────────────
const CART_KEY = "sindo_cart_v1";
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}
function setCart(c) {
  localStorage.setItem(CART_KEY, JSON.stringify(c));
  updateCartBadge();
}
function addToCart(productId, qty = 1) {
  const c = getCart();
  c[productId] = (c[productId] || 0) + qty;
  setCart(c);
  showToast(`Ditambahkan ke keranjang`);
}
function removeFromCart(productId) {
  const c = getCart();
  delete c[productId];
  setCart(c);
}
function updateQty(productId, qty) {
  const c = getCart();
  if (qty <= 0) delete c[productId];
  else c[productId] = qty;
  setCart(c);
}
function clearCart() { setCart({}); }
function cartItems() {
  const c = getCart();
  return Object.entries(c)
    .map(([id, qty]) => {
      const p = PRODUCTS.find(x => x.id === id);
      return p ? { ...p, qty, lineTotal: p.priceIdr * qty } : null;
    })
    .filter(Boolean);
}
function cartTotal() {
  return cartItems().reduce((s, i) => s + i.lineTotal, 0);
}
function updateCartBadge() {
  const c = getCart();
  const n = Object.values(c).reduce((s, q) => s + q, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = n);
}

// ─── Single shipping option — Sindo Shipping × S$20/kg ──────────────────────
// Fee is computed from cart weight, not stored (one option only).
function getShipping(items) {
  const opt = SHIPPING.options[0];
  const itemsList = items || (typeof cartItems === "function" ? cartItems() : []);
  const calc = window.computeShippingFee(itemsList);
  return {
    id: opt.id,
    courier: opt.courier,
    etaDays: opt.etaDays,
    note: opt.note,
    priceIdr: calc.feeIdr,
    totalKg: calc.totalKg,
    totalGrams: calc.totalGrams,
    ratePerKg: calc.ratePerKg
  };
}

// ─── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:white;padding:12px 20px;border-radius:10px;font-size:14px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.2);";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

// ─── Shared header (lazy-loaded product card images + brand link) ───────────
function renderHeader() {
  document.querySelectorAll("header.header .row").forEach(row => {
    const brand = row.querySelector(".brand");
    if (brand) {
      brand.innerHTML = `Sindo<small>Wellness SG · Dikirim oleh Sindo Shipping</small>`;
    }
  });
}

// ─── Render: home page ──────────────────────────────────────────────────────
function renderHome() {
  renderHeader();
  const nav = document.getElementById("nav-cats");
  if (nav) {
    nav.innerHTML = [
      ...CATEGORIES.map(c => `<a href="#cat-${slugify(c)}">${escapeHtml(c)}</a>`),
      `<a href="track.html" style="color:#0ea5e9;font-weight:600;">📦 Lacak Pesanan</a>`,
    ].join("");
  }
  const banner = document.getElementById("prod-count");
  if (banner) banner.textContent = `${PRODUCTS.length}`;
  const ts = document.getElementById("extract-time");
  if (ts) ts.textContent = `${EXTRACT_INFO.extractedAt} · snapshot ${EXTRACT_INFO.snapshotId}`;

  // Featured: top 3 by price
  const featured = [...PRODUCTS].sort((a, b) => b.priceIdr - a.priceIdr).slice(0, 3);
  document.getElementById("featured").innerHTML = featured.map(productCard).join("");

  // Group by category
  document.getElementById("cats").innerHTML = CATEGORIES.map(cat => {
    const items = PRODUCTS.filter(p => p.category === cat).sort((a, b) => b.priceIdr - a.priceIdr);
    return `
      <section class="cat" id="cat-${slugify(cat)}">
        <h2 class="cat-title">${escapeHtml(cat)}</h2>
        <div class="grid">${items.map(productCard).join("")}</div>
      </section>`;
  }).join("");

  bindCardEvents();
  updateCartBadge();
}

function bindCardEvents() {
  document.querySelectorAll("[data-go-product]").forEach(el => {
    el.onclick = (e) => {
      if (e.target.closest("[data-add-cart]")) return;
      window.location.href = `product.html?id=${el.dataset.goProduct}`;
    };
  });
  document.querySelectorAll("[data-add-cart]").forEach(el => {
    el.onclick = (e) => {
      e.stopPropagation();
      addToCart(el.dataset.addCart);
    };
  });
}

// ─── Render: product detail page ────────────────────────────────────────────
function renderProduct() {
  renderHeader();
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) {
    document.querySelector("main").innerHTML = "<p style='padding:40px;text-align:center;'>Produk tidak ditemukan. <a href='index.html'>Kembali ke toko</a></p>";
    return;
  }
  document.title = `${p.title} · Sindo`;

  const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);

  document.querySelector("main").innerHTML = `
    <div class="breadcrumb"><a href="index.html">Toko</a> &rsaquo; <a href="index.html#cat-${slugify(p.category)}">${escapeHtml(p.category)}</a> &rsaquo; <span>${escapeHtml(p.title.slice(0, 50))}…</span></div>
    <div class="container">
      <div class="pdp">
        <div class="pdp-img">
          <img ${lazyImgAttrs()} src="${p.image}" alt="${escapeHtml(p.title)}" onerror="this.parentNode.innerHTML='<div class=no-img>no image</div>'"/>
        </div>
        <div class="pdp-info">
          <div class="pdp-brand">${escapeHtml(p.brand)}</div>
          <h1>${escapeHtml(p.title)}</h1>
          <div class="pdp-rating">★ ${p.rating} <span style="color:#9ca3af;margin-left:8px;">(${p.reviews.toLocaleString("id-ID")} ulasan)</span></div>
          <div class="pdp-price">${formatIdr(p.priceIdr)}</div>

          <a class="pdp-source" href="${p.url}" target="_blank" rel="noopener noreferrer">
            <div class="src-icon">iH</div>
            <div class="src-text">
              <div class="src-label">Sumber produk</div>
              <div class="src-host">Lihat di iHerb.com →</div>
            </div>
            <div class="src-arrow">↗</div>
          </a>

          <div class="pdp-desc">${escapeHtml(p.description)}</div>

          <div class="pdp-ingredients">
            <strong>Komposisi:</strong> ${escapeHtml(p.ingredients)}
          </div>

          <div class="qty-row">
            <div class="qty">
              <button data-qty-dec aria-label="Kurangi">−</button>
              <input id="qty" type="text" value="1" readonly />
              <button data-qty-inc aria-label="Tambah">+</button>
            </div>
            <button class="btn-primary" data-add-to-cart>🛒 Tambah ke Keranjang</button>
          </div>
          <a class="btn-wa-lg" href="${waDirect(p)}" target="_blank" rel="noreferrer">💬 Tanya via WhatsApp</a>

          <div class="pdp-perks">
            <div class="perk"><span>🚚</span><span>Dikirim dari Singapura via <strong>${SHIPPING.partner}</strong> · S$20/kg, bea cukai termasuk</span></div>
            <div class="perk"><span>💳</span><span>Bayar via QRIS / BCA / VA setelah pesan</span></div>
            <div class="perk"><span>✓</span><span>Garansi 100% Original iHerb</span></div>
            <div class="perk"><span>📦</span><span>Nomor resi otomatis begitu pembayaran dikonfirmasi</span></div>
          </div>
          <div style="margin-top:6px;font-size:11px;color:#9ca3af;">GTIN: <span class="mono" style="background:#f3f4f6;padding:2px 6px;border-radius:3px;">${escapeHtml(p.gtin)}</span></div>
        </div>
      </div>

      ${related.length ? `
        <section class="section" style="padding-top:48px;">
          <h2 class="section-title">Produk Serupa</h2>
          <div class="grid">${related.map(productCard).join("")}</div>
        </section>
      ` : ""}
    </div>
  `;

  let qty = 1;
  document.querySelector("[data-qty-inc]").onclick = () => { qty++; document.getElementById("qty").value = qty; };
  document.querySelector("[data-qty-dec]").onclick = () => { if (qty > 1) { qty--; document.getElementById("qty").value = qty; } };
  document.querySelector("[data-add-to-cart]").onclick = () => {
    addToCart(p.id, qty);
    setTimeout(() => window.location.href = "cart.html", 600);
  };
  bindCardEvents();
  updateCartBadge();
}

// ─── Render: cart ───────────────────────────────────────────────────────────
function renderCart() {
  renderHeader();
  const items = cartItems();
  const c = document.querySelector("main");
  if (items.length === 0) {
    c.innerHTML = `
      <div class="empty-state">
        <div style="font-size:48px;color:#d1d5db;">🛒</div>
        <h2>Keranjang kosong</h2>
        <p>Tambahkan produk dari toko untuk mulai memesan.</p>
        <a href="index.html" class="btn-primary" style="display:inline-block;width:auto;margin-top:20px;text-decoration:none;">Mulai Belanja</a>
      </div>`;
    updateCartBadge();
    return;
  }

  const subtotal = cartTotal();
  const ship = getShipping(items);
  c.innerHTML = `
    <div class="cart-wrap">
      <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;">Keranjang</h1>
      <div style="color:#6b7280;font-size:13px;margin-bottom:16px;">${items.length} produk</div>
      ${items.map(i => `
        <div class="cart-row">
          <img ${lazyImgAttrs()} src="${i.image}" alt="" onerror="this.style.opacity=0"/>
          <div class="info">
            <div class="title">${escapeHtml(i.title)}</div>
            <div class="meta">${escapeHtml(i.brand)} · ${escapeHtml(i.size || '')} · GTIN ${escapeHtml(i.gtin)}</div>
          </div>
          <div class="qty">
            <button data-cart-dec="${i.id}">−</button>
            <input type="text" value="${i.qty}" readonly />
            <button data-cart-inc="${i.id}">+</button>
          </div>
          <div style="text-align:right;">
            <div class="price-col">${formatIdr(i.lineTotal)}</div>
            <button class="remove" data-cart-rm="${i.id}">Hapus</button>
          </div>
        </div>
      `).join("")}
      <div class="cart-summary">
        <div class="row"><span class="muted">Subtotal</span><strong>${formatIdr(subtotal)}</strong></div>
        <div class="row"><span class="muted">Pengiriman (${escapeHtml(ship.courier)} · ${ship.totalKg} kg × ${formatIdr(ship.ratePerKg)}/kg)</span><strong>${formatIdr(ship.priceIdr)}</strong></div>
        <div class="row total"><span>Total</span><span>${formatIdr(subtotal + ship.priceIdr)}</span></div>
        <a href="checkout.html" class="btn-primary" style="display:block;text-align:center;margin-top:16px;text-decoration:none;">Lanjut ke Pembayaran →</a>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-cart-inc]").forEach(el => {
    el.onclick = () => { const c = getCart(); c[el.dataset.cartInc] = (c[el.dataset.cartInc] || 0) + 1; setCart(c); renderCart(); };
  });
  document.querySelectorAll("[data-cart-dec]").forEach(el => {
    el.onclick = () => { const c = getCart(); c[el.dataset.cartDec] = Math.max(1, (c[el.dataset.cartDec] || 1) - 1); setCart(c); renderCart(); };
  });
  document.querySelectorAll("[data-cart-rm]").forEach(el => {
    el.onclick = () => { removeFromCart(el.dataset.cartRm); renderCart(); };
  });
  updateCartBadge();
}

// ─── Render: checkout ───────────────────────────────────────────────────────
function renderCheckout() {
  renderHeader();
  const items = cartItems();
  if (items.length === 0) {
    window.location.href = "cart.html";
    return;
  }
  const subtotal = cartTotal();
  const ship = getShipping();

  document.querySelector("main").innerHTML = `
    <div class="container">
      <div class="steps">
        <div class="step done">1. Keranjang</div>
        <div class="step active">2. Pembayaran</div>
        <div class="step">3. Selesai</div>
      </div>
      <div class="checkout">
        <form id="checkout-form">
          <div class="form-section">
            <h3>Informasi Kontak</h3>
            <div class="field">
              <label>Nama *</label>
              <input name="name" required placeholder="Nama lengkap"/>
            </div>
            <div class="field">
              <label>WhatsApp *</label>
              <input name="phone" required placeholder="+62xxx" value="+62"/>
            </div>
            <div class="field">
              <label>Email</label>
              <input name="email" type="email" placeholder="untuk notifikasi"/>
            </div>
          </div>

          <div class="form-section">
            <h3>Alamat Pengiriman</h3>
            <div class="field">
              <label>Alamat lengkap *</label>
              <textarea name="address" required rows="3" placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan"></textarea>
            </div>
            <div class="field-row">
              <div class="field"><label>Kota *</label><input name="city" required placeholder="Jakarta"/></div>
              <div class="field"><label>Kode Pos *</label><input name="postcode" required placeholder="12345"/></div>
            </div>
            <div class="field">
              <label>Provinsi</label>
              <select name="province">
                <option>DKI Jakarta</option><option>Jawa Barat</option><option>Jawa Tengah</option>
                <option>Jawa Timur</option><option>Banten</option><option>Yogyakarta</option>
                <option>Bali</option><option>Sumatera Utara</option><option>Lainnya</option>
              </select>
            </div>
            <div class="field">
              <label>Catatan pesanan (opsional)</label>
              <textarea name="notes" rows="2" placeholder="Misal: Kirim setelah jam 5 sore, atau request packing"></textarea>
            </div>
          </div>

          <div class="form-section">
            <h3>Pengiriman (${escapeHtml(SHIPPING.partner)})</h3>
            <div class="ship-options">
              <div class="ship-opt selected" data-ship-fixed>
                <div class="ship-radio"></div>
                <div class="ship-body">
                  <div class="ship-courier">
                    ${escapeHtml(SHIPPING.options[0].courier)}
                    <span class="ship-badge">S$20/kg · Bea cukai termasuk</span>
                  </div>
                  <div class="ship-meta">${escapeHtml(SHIPPING.options[0].etaDays)} · Berat paket: <strong>${ship.totalKg} kg</strong> (${(ship.totalGrams/1000).toFixed(2)} kg aktual) · ${escapeHtml(SHIPPING.options[0].note)}</div>
                </div>
                <div class="ship-price">${formatIdr(ship.priceIdr)}</div>
              </div>
              <p style="font-size:12px;color:#6b7280;margin-top:8px;">ℹ Berat dibulatkan ke atas ke kg terdekat (praktik standar kurir). Dihitung dari berat kemasan masing-masing produk di keranjang Anda.</p>
            </div>
          </div>

          <div class="form-section">
            <h3>Metode Pembayaran</h3>
            <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px;">
              <strong>💳 Transfer Bank Manual</strong>
              <p style="font-size:13px;color:#6b7280;margin-top:4px;">Setelah pesan, Anda akan menerima instruksi transfer ke rekening BCA/QRIS/Mandiri. Pesanan dikonfirmasi setelah pembayaran terverifikasi (maks 24 jam). Begitu dikonfirmasi, nomor resi ${escapeHtml(SHIPPING.partner)} akan diterbitkan otomatis.</p>
            </div>
          </div>

          <button type="submit" class="btn-primary" style="width:100%;padding:14px;font-size:15px;">Konfirmasi Pesanan →</button>
        </form>

        <div class="summary-box">
          <h3>Ringkasan Pesanan</h3>
          ${items.map(i => `
            <div class="summary-item">
              <img ${lazyImgAttrs()} src="${i.image}" alt="" onerror="this.style.opacity=0"/>
              <div class="title-col">
                <div class="t">${escapeHtml(i.title)}</div>
                <div class="q">× ${i.qty}</div>
              </div>
              <div class="p">${formatIdr(i.lineTotal)}</div>
            </div>
          `).join("")}
          <div class="divider"></div>
          <div class="summary-totals">
            <div class="row"><span>Subtotal</span><span>${formatIdr(subtotal)}</span></div>
            <div class="row"><span>Pengiriman (${ship.totalKg} kg × ${formatIdr(ship.ratePerKg)}/kg)</span><span>${formatIdr(ship.priceIdr)}</span></div>
            <div class="row total"><span>Total</span><span>${formatIdr(subtotal + ship.priceIdr)}</span></div>
          </div>
          <div style="margin-top:16px;padding:12px;background:white;border-radius:8px;font-size:12px;color:#6b7280;">
            ✓ Bayar di langkah berikutnya<br/>
            ✓ Pesanan aman selama 24 jam<br/>
            ✓ Bebas biaya admin<br/>
            ✓ Resi otomatis begitu dikonfirmasi
          </div>
        </div>
      </div>
    </div>
  `;

  // No shipping picker — single option, fee auto-computed from cart weight

  document.getElementById("checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const customer = Object.fromEntries(fd.entries());
    const shippingOpt = getShipping();
    const total = subtotal + shippingOpt.priceIdr;
    // Generate order + tracking refs
    const ref = `${TENANT.slug.toUpperCase().slice(0,5)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const tracking = `SS-${new Date().toISOString().slice(0,7).replace('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const order = {
      ref,
      tracking,
      shipping: shippingOpt,
      customer,
      items: cartItems(),
      subtotal,
      shippingFee: shippingOpt.priceIdr,
      total,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24*60*60*1000).toISOString(),
      eta: shippingOpt.etaDays,
    };
    sessionStorage.setItem("sindo_last_order", JSON.stringify(order));
    sessionStorage.setItem(`sindo_track_${tracking}`, JSON.stringify({
      order,
      shipment: { currentStage: "pending", events: [], courier: shippingOpt.courier }
    }));
    clearCart();
    window.location.href = `order.html?ref=${ref}`;
  });
  updateCartBadge();
}

// ─── Render: order success ──────────────────────────────────────────────────
function renderOrder() {
  renderHeader();
  const orderJson = sessionStorage.getItem("sindo_last_order");
  if (!orderJson) {
    window.location.href = "index.html";
    return;
  }
  const o = JSON.parse(orderJson);

  document.querySelector("main").innerHTML = `
    <div class="success-wrap">
      <div class="steps">
        <div class="step done">1. Keranjang</div>
        <div class="step done">2. Pembayaran</div>
        <div class="step active">3. Selesai</div>
      </div>

      <div class="success-card">
        <div class="check">✓</div>
        <h1>Pesanan Berhasil Dibuat</h1>
        <p style="color:#4b5563;">Pesanan Anda menunggu pembayaran. Begitu dikonfirmasi, ${escapeHtml(SHIPPING.partner)} akan langsung menerbitkan nomor resi.</p>
        <div class="ref">${escapeHtml(o.ref)}</div>
        <div style="margin-top:16px;font-size:14px;color:#6b7280;">Total</div>
        <div style="font-size:32px;font-weight:800;color:#d23f3f;margin-top:4px;">${formatIdr(o.total)}</div>
        <div style="font-size:12px;color:#9ca3af;margin-top:6px;">Kedaluarsa ${new Date(o.expiresAt).toLocaleString("id-ID")}</div>
      </div>

      <div class="payment-instructions">
        <h2>💳 Instruksi Pembayaran</h2>
        <p style="font-size:13px;color:#92400e;margin-bottom:8px;">Mohon transfer <strong>tepat</strong> sejumlah total di atas dan cantumkan referensi <span style="font-family:monospace;background:#fef3c7;padding:2px 6px;border-radius:4px;">${escapeHtml(o.ref)}</span> pada berita transfer.</p>
        ${TENANT.banks.map(b => `
          <div class="bank-card">
            <div class="label">${escapeHtml(b.label)}</div>
            <div class="mono">${escapeHtml(b.bank)} · ${escapeHtml(b.accountNumber)}</div>
            <div class="name">a/n ${escapeHtml(b.accountName)}</div>
            <button class="copy-btn" data-copy="${escapeHtml(b.accountNumber)}">Salin nomor</button>
          </div>
        `).join("")}
        <a class="wa-cta" href="https://wa.me/${TENANT.whatsappClean}?text=${encodeURIComponent(`Halo ${TENANT.name}, saya sudah transfer untuk pesanan ${o.ref} sebesar ${formatIdr(o.total)}. Mohon dicek.`)}" target="_blank" rel="noreferrer">
          💬 Kirim Bukti Transfer via WhatsApp
        </a>
      </div>

      <div class="tracking-prelude">
        <h2>📦 Pengiriman oleh ${escapeHtml(SHIPPING.partner)}</h2>
        <div class="track-card">
          <div>
            <div style="font-size:12px;color:#6b7280;">Nomor Resi (otomatis setelah pembayaran)</div>
            <div class="track-number">${escapeHtml(o.tracking)}</div>
            <div style="font-size:12px;color:#9ca3af;margin-top:4px;">${escapeHtml(o.shipping.courier)} · ETA ${escapeHtml(o.eta)}</div>
          </div>
          <a class="btn-track" href="track.html?n=${encodeURIComponent(o.tracking)}">Lacak Pengiriman →</a>
        </div>
        <p style="font-size:13px;color:#6b7280;margin-top:12px;">Setelah pembayaran terverifikasi (maks 24 jam), nomor resi ini akan aktif dan Anda bisa melacak paket dari <em>Singapura</em> hingga <em>alamat Anda</em> via ${escapeHtml(SHIPPING.partner)}.</p>
      </div>

      <div style="text-align:center;margin-top:32px;font-size:13px;color:#6b7280;">
        Ada pertanyaan? <a href="https://wa.me/${TENANT.whatsappClean}" target="_blank" rel="noreferrer" style="color:#16a34a;font-weight:600;">Chat WhatsApp →</a>
      </div>
    </div>
  `;
  updateCartBadge();

  document.querySelectorAll("[data-copy]").forEach(el => {
    el.onclick = () => {
      navigator.clipboard.writeText(el.dataset.copy);
      showToast("Nomor rekening disalin");
    };
  });
}

// ─── Render: tracking page ──────────────────────────────────────────────────
function renderTrack() {
  renderHeader();
  const params = new URLSearchParams(location.search);
  const initialRef = params.get("n") || "";

  document.querySelector("main").innerHTML = `
    <div class="container">
      <div class="track-hero">
        <h1>📦 Lacak Pengiriman</h1>
        <p>Masukkan nomor resi dari ${escapeHtml(SHIPPING.partner)} untuk melihat status real-time paket Anda.</p>
        <form id="track-form" class="track-form">
          <input id="track-input" name="n" placeholder="contoh: SS-202609-A1B2C" value="${escapeHtml(initialRef)}" autocomplete="off"/>
          <button type="submit" class="btn-primary">Lacak</button>
        </form>
        <div class="track-demos">
          Coba demo:
          <button class="demo-btn" data-demo="SS-202609-DEMO1">SS-202609-DEMO1</button>
          <button class="demo-btn" data-demo="SS-202609-DEMO2">SS-202609-DEMO2</button>
          <button class="demo-btn" data-demo="SS-202609-DEMO3">SS-202609-DEMO3</button>
        </div>
      </div>
      <div id="track-result"></div>
    </div>
  `;

  const form = document.getElementById("track-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    const v = document.getElementById("track-input").value.trim().toUpperCase();
    if (!v) return;
    if (v !== initialRef.toUpperCase()) {
      const u = new URL(location.href);
      u.searchParams.set("n", v);
      history.replaceState(null, "", u);
    }
    renderTrackResult(v);
  };

  document.querySelectorAll("[data-demo]").forEach(el => {
    el.onclick = () => {
      document.getElementById("track-input").value = el.dataset.demo;
      form.requestSubmit();
    };
  });

  if (initialRef) {
    renderTrackResult(initialRef.trim().toUpperCase());
  }
}

function renderTrackResult(trackingNumber) {
  const r = document.getElementById("track-result");
  // Priority: live session data from order success > mock demo data > deterministic fallback
  const live = sessionStorage.getItem(`sindo_track_${trackingNumber}`);
  const mock = MOCK_TRACKING[trackingNumber];
  let shipment, order;

  if (live) {
    const data = JSON.parse(live);
    shipment = data.shipment;
    order = data.order;
  } else if (mock) {
    shipment = { currentStage: mock.currentStage, events: [], courier: mock.courier };
    order = { tracking: trackingNumber, ref: trackingNumber };
  } else {
    // Deterministic fallback so ANY tracking# shows something
    const stageIdx = hashString(trackingNumber) % SHIPPING.stages.length;
    shipment = { currentStage: SHIPPING.stages[stageIdx].id, events: [], courier: "Sindo Shipping × JNE JIK" };
    order = { tracking: trackingNumber, ref: trackingNumber };
  }

  // Build event timeline up to current stage
  const stageIndex = SHIPPING.stages.findIndex(s => s.id === shipment.currentStage);
  const timeline = SHIPPING.stages.slice(0, stageIndex + 1).map((s, i) => {
    const isLast = i === stageIndex;
    return { ...s, done: true, current: isLast };
  });

  r.innerHTML = `
    <div class="track-result-card">
      <div class="track-result-head">
        <div>
          <div style="font-size:12px;color:#6b7280;">Nomor Resi</div>
          <div class="track-number" style="font-size:18px;">${escapeHtml(trackingNumber)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;color:#6b7280;">Status</div>
          <div class="track-status ${shipment.currentStage}">${escapeHtml(SHIPPING.stages[stageIndex].label)}</div>
        </div>
      </div>

      <div class="track-meta-row">
        <div><span>🚚</span> Kurir: <strong>${escapeHtml(shipment.courier)}</strong></div>
        <div><span>📍</span> Dari: <strong>Singapura (Yishun hub)</strong></div>
        <div><span>🛬</span> Tujuan: <strong>Indonesia</strong></div>
      </div>

      <div class="track-timeline">
        ${timeline.map((s, i) => `
          <div class="tl-item ${s.current ? 'current' : 'done'}">
            <div class="tl-dot">
              ${s.current ? '<div class="tl-pulse"></div>' : '✓'}
            </div>
            <div class="tl-body">
              <div class="tl-label">${escapeHtml(s.label)}</div>
              <div class="tl-desc">${escapeHtml(s.desc)}</div>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="track-foot">
        ${shipment.currentStage === 'delivered'
          ? '✅ Paket sudah diterima. Terima kasih telah berbelanja di Sindo!'
          : `⏳ Estimasi sampai: <strong>${shipment.currentStage === 'transit' ? 'Hari ini' : '2-5 hari kerja'}</strong>. Update otomatis setiap ada perubahan status.`}
      </div>

      ${order && order.items ? `
        <div class="track-items">
          <h4>Isi paket</h4>
          ${order.items.map(i => `
            <div class="track-item">
              <img ${lazyImgAttrs()} src="${i.image}" alt="" onerror="this.style.opacity=0"/>
              <div>
                <div class="ti-title">${escapeHtml(i.title)}</div>
                <div class="ti-meta">${escapeHtml(i.brand)} × ${i.qty}</div>
              </div>
              <div class="ti-price">${formatIdr(i.lineTotal)}</div>
            </div>
          `).join("")}
        </div>
      ` : ''}

      <div class="track-note">
        🛈 <strong>Mock preview</strong>: data ini deterministik untuk demo platform. Pada produksi, ${escapeHtml(SHIPPING.partner)} menarik data dari <code>api.sindo.id/v1/shipments/${escapeHtml(trackingNumber)}</code>.
      </div>
    </div>
  `;

  // Smooth scroll to result
  r.scrollIntoView({ behavior: "smooth", block: "start" });
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─── Render: WA deep link from product card ─────────────────────────────────
function waDirect(p) {
  return `https://wa.me/${TENANT.whatsappClean}?text=${encodeURIComponent(
    `Halo ${TENANT.name}, saya tertarik dengan produk:%0A%0A${p.title}%0ABrand: ${p.brand}%0AHarga: ${formatIdr(p.priceIdr)}%0AGTN: ${p.gtin}%0A%0AMohon konfirmasi stok dan ongkir ke kota saya.`
  )}`;
}

// ─── Reusable product card HTML ────────────────────────────────────────────
function productCard(p) {
  return `
    <article class="card" data-go-product="${p.id}">
      <div class="img">
        <img ${lazyImgAttrs()} src="${p.image}" alt="${escapeHtml(p.title)}" onerror="this.parentNode.innerHTML='<div class=no-img>no image</div>'"/>
      </div>
      <div class="body">
        <div class="brand-tag">${escapeHtml(p.brand)}</div>
        <div class="title">${escapeHtml(p.title)}</div>
        <div class="rating">★ ${p.rating} <span class="muted">(${p.reviews.toLocaleString("id-ID")})</span></div>
        <div class="price">${formatIdr(p.priceIdr)}</div>
        <button class="btn-wa" data-add-cart="${p.id}">+ Keranjang</button>
      </div>
    </article>
  `;
}

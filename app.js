// Mock user-journey runtime — Sindo × Sindo Shipping
// Full journey: home → product → cart → checkout → order → tracking → search → categories → blog

// ─── Currency / formatting ──────────────────────────────────────────────────
function formatIdr(n) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}
function formatSgd(n) {
  return "S$" + Number(n).toFixed(2);
}
function formatPriceDual(p) {
  if (p.priceSgd != null && p.priceIdr != null) {
    return `<span class="price-sgd">${formatSgd(p.priceSgd)}</span><span class="price-idr">${formatIdr(p.priceIdr)}</span>`;
  }
  return formatIdr(p.priceIdr);
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
  showToast(`Added to cart`);
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

// ─── Single shipping option — Sindo Shipping × S$20/100g ─────────────────────
function getShipping(items) {
  const opt = SHIPPING.options[0];
  const itemsList = items || (typeof cartItems === "function" ? cartItems() : []);
  const calc = window.computeShippingFee(itemsList);
  return {
    id: opt.id, courier: opt.courier, etaDays: opt.etaDays, note: opt.note,
    priceIdr: calc.feeIdr, totalGrams: calc.totalGrams,
    ratePer100g: calc.ratePer100g, lineItems: calc.lineItems
  };
}

// ─── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:white;padding:12px 20px;border-radius:10px;font-size:14px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.2);max-width:90%;text-align:center;";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

// ─── Shared header / nav ────────────────────────────────────────────────────
function renderHeader() {
  document.querySelectorAll("header.header .row").forEach(row => {
    const brand = row.querySelector(".brand");
    if (brand) {
      brand.innerHTML = `Sindo<small>iHerb-sourced · Shipped from Singapore</small>`;
    }
  });
}

// ─── Product card (shared) ──────────────────────────────────────────────────
function productCard(p) {
  const img = p.image || "";
  return `
    <div class="card" data-go-product="${escapeHtml(p.id)}">
      <div class="thumb">
        <img ${lazyImgAttrs()} src="${img}" alt="${escapeHtml(p.title)}" onerror="this.parentNode.innerHTML='<div class=no-img>no image</div>'"/>
        <div class="src-badge">iHerb</div>
      </div>
      <div class="info">
        <div class="brand">${escapeHtml(p.brand)}</div>
        <div class="title">${escapeHtml(p.title)}</div>
        <div class="rating">★ ${p.rating} <span class="reviews">(${p.reviews.toLocaleString("en-US")})</span></div>
        <div class="price">${formatPriceDual(p)}</div>
        <div class="actions">
          <button class="btn-add" data-add-cart="${escapeHtml(p.id)}" aria-label="Add to cart">+ Add to cart</button>
        </div>
      </div>
    </div>`;
}

// ─── Render: home page ──────────────────────────────────────────────────────
function renderHome() {
  renderHeader();
  const nav = document.getElementById("nav-cats");
  if (nav) {
    const topCats = CATEGORIES.slice(0, 5);
    nav.innerHTML = [
      ...topCats.map(c => `<a href="categories.html#cat-${slugify(c)}">${escapeHtml(c)}</a>`),
      `<a href="blog.html" style="color:var(--accent);font-weight:600;">📝 Blog</a>`,
      `<a href="track.html" style="color:#0ea5e9;font-weight:600;">📦 Track</a>`,
    ].join("");
  }
  const banner = document.getElementById("prod-count");
  if (banner) banner.textContent = `${PRODUCTS.length}`;
  const ts = document.getElementById("extract-time");
  if (ts) ts.textContent = `${EXTRACT_INFO.extractedAt} · snapshot ${EXTRACT_INFO.snapshotId}`;

  const featured = [...PRODUCTS].sort((a, b) => b.priceIdr - a.priceIdr).slice(0, 3);
  document.getElementById("featured").innerHTML = featured.map(productCard).join("");

  document.getElementById("cats").innerHTML = CATEGORIES.map(cat => {
    const items = PRODUCTS.filter(p => p.category === cat).sort((a, b) => b.priceIdr - a.priceIdr);
    return `
      <section class="cat" id="cat-${slugify(cat)}">
        <h2 class="cat-title">${escapeHtml(cat)} <span class="muted">(${items.length})</span></h2>
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
    document.querySelector("main").innerHTML = `
      <div class="container" style="padding:40px;text-align:center;">
        <h2>Product not found</h2>
        <p>The product you're looking for is no longer in our catalog.</p>
        <p><a class="btn-primary" href="index.html">← Back to store</a></p>
      </div>`;
    return;
  }
  document.title = `${p.title} · Sindo Wellness`;
  const canonical = document.querySelector("link[rel=canonical]");
  if (canonical) canonical.href = `https://seeds.scaleupcrm.com/product.html?id=${p.id}`;

  // Inject per-product structured data (Schema.org Product)
  let ld = document.querySelector("script[data-ld=product]");
  if (!ld) {
    ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.setAttribute("data-ld", "product");
    document.head.appendChild(ld);
  }
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": p.title,
    "image": [p.image, ...(p.additionalImages || [])].filter(Boolean),
    "description": p.description,
    "sku": p.gtin || p.id,
    "gtin13": p.gtin || undefined,
    "brand": { "@type": "Brand", "name": p.brand },
    "offers": {
      "@type": "Offer",
      "url": `https://seeds.scaleupcrm.com/product.html?id=${p.id}`,
      "priceCurrency": "IDR",
      "price": p.priceIdr,
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "Sindo Wellness" }
    },
    "aggregateRating": p.rating ? {
      "@type": "AggregateRating",
      "ratingValue": p.rating,
      "reviewCount": p.reviews
    } : undefined
  });

  const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);

  document.querySelector("main").innerHTML = `
    <div class="breadcrumb container">
      <a href="index.html">Store</a> &rsaquo;
      <a href="categories.html#cat-${slugify(p.category)}">${escapeHtml(p.category)}</a> &rsaquo;
      <span>${escapeHtml(p.title.slice(0, 50))}${p.title.length > 50 ? "…" : ""}</span>
    </div>
    <div class="container">
      <div class="pdp">
        <div class="pdp-img">
          <img ${lazyImgAttrs()} src="${p.image}" alt="${escapeHtml(p.title)}" onerror="this.parentNode.innerHTML='<div class=no-img>no image</div>'"/>
        </div>
        <div class="pdp-info">
          <div class="pdp-brand">${escapeHtml(p.brand)}</div>
          <h1>${escapeHtml(p.title)}</h1>
          <div class="pdp-rating">★ ${p.rating} <span class="muted">(${p.reviews.toLocaleString("en-US")} iHerb reviews)</span></div>
          <div class="pdp-price">${formatPriceDual(p)}</div>

          <a class="pdp-source" href="${p.url}" target="_blank" rel="noopener noreferrer">
            <div class="src-icon">iH</div>
            <div class="src-text">
              <div class="src-label">Product source</div>
              <div class="src-host">View on iHerb.com →</div>
            </div>
            <div class="src-arrow">↗</div>
          </a>

          <div class="pdp-desc">${escapeHtml(p.description)}</div>

          <div class="pdp-ingredients">
            <strong>Ingredients:</strong> ${escapeHtml(p.ingredients)}
          </div>

          <div class="qty-row">
            <div class="qty">
              <button data-qty-dec aria-label="Decrease">−</button>
              <input id="qty" type="text" value="1" readonly />
              <button data-qty-inc aria-label="Increase">+</button>
            </div>
            <button class="btn-primary" data-add-cart="${escapeHtml(p.id)}" id="pdp-add">Add to cart</button>
          </div>

          <div class="pdp-meta">
            <div><strong>Size:</strong> ${escapeHtml(p.size || "—")}</div>
            <div><strong>Weight:</strong> ${p.weightGrams}g</div>
            <div><strong>GTIN:</strong> <span class="mono">${escapeHtml(p.gtin || "—")}</span></div>
          </div>

          <div class="pdp-disclaimer">
            Supplements are not medicines. Consult your doctor before use if pregnant, nursing, or under medical treatment.
          </div>
        </div>
      </div>

      ${related.length ? `
        <section style="margin: 48px 0;">
          <h2 style="margin-bottom: 16px;">Related products</h2>
          <div class="grid">${related.map(productCard).join("")}</div>
        </section>
      ` : ""}
    </div>
  `;

  // Bind qty + add to cart
  let qty = 1;
  const qtyEl = document.getElementById("qty");
  document.querySelector("[data-qty-dec]").onclick = () => { qty = Math.max(1, qty - 1); qtyEl.value = qty; };
  document.querySelector("[data-qty-inc]").onclick = () => { qty += 1; qtyEl.value = qty; };
  document.getElementById("pdp-add").onclick = () => addToCart(p.id, qty);
  bindCardEvents();
  updateCartBadge();
}

// ─── Render: cart page ───────────────────────────────────────────────────────
function renderCart() {
  renderHeader();
  const root = document.getElementById("cart-root");
  const items = cartItems();
  if (items.length === 0) {
    root.innerHTML = `
      <div class="container empty-cart">
        <h2>Your cart is empty</h2>
        <p>Browse our catalog and add products to start an order.</p>
        <p><a class="btn-primary" href="index.html">Browse products →</a></p>
      </div>`;
    updateCartBadge();
    return;
  }
  const ship = getShipping(items);
  root.innerHTML = `
    <div class="container cart-page">
      <h1>Your cart</h1>
      <div class="cart-grid">
        <div class="cart-items">
          ${items.map(it => `
            <div class="cart-row">
              <img ${lazyImgAttrs(`width="80" height="80"`)} src="${it.image}" alt="${escapeHtml(it.title)}"/>
              <div class="cart-row-info">
                <div class="cart-row-brand">${escapeHtml(it.brand)}</div>
                <div class="cart-row-title"><a href="product.html?id=${it.id}">${escapeHtml(it.title)}</a></div>
                <div class="cart-row-meta">${escapeHtml(it.size || "")} · ${it.weightGrams}g</div>
                <div class="cart-row-shipping">📦 ${it.qty} × ${it.weightGrams}g × Rp 3.200/100g = <strong>${formatIdr(Math.ceil((it.qty * it.weightGrams) / 100) * 3200)}</strong></div>
              </div>
              <div class="cart-row-controls">
                <div class="qty">
                  <button data-cart-dec="${escapeHtml(it.id)}" aria-label="Decrease">−</button>
                  <input value="${it.qty}" readonly />
                  <button data-cart-inc="${escapeHtml(it.id)}" aria-label="Increase">+</button>
                </div>
                <div class="cart-row-price">${formatIdr(it.lineTotal)}</div>
                <button class="cart-row-remove" data-cart-remove="${escapeHtml(it.id)}">Remove</button>
              </div>
            </div>
          `).join("")}
        </div>
        <div class="cart-summary">
          <h3>Order summary</h3>
          <div class="row"><span>Subtotal (${items.reduce((s, i) => s + i.qty, 0)} items)</span><span>${formatIdr(cartTotal())}</span></div>
          <div class="row">
            <span>Shipping (${ship.totalGrams}g)<br><span class="muted">Sindo Shipping × S$20/100g</span></span>
            <span>${formatIdr(ship.priceIdr)}</span>
          </div>
          <div class="row total"><span>Total</span><span>${formatIdr(cartTotal() + ship.priceIdr)}</span></div>
          <a class="btn-primary" href="checkout.html">Proceed to checkout →</a>
          <p class="muted" style="font-size:12px; margin-top:12px;">Payment by bank transfer. Shipping fee includes customs for shipments up to 1.5 kg.</p>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-cart-inc]").forEach(el => el.onclick = () => {
    const id = el.dataset.cartInc;
    const cur = getCart()[id] || 0;
    updateQty(id, cur + 1);
    renderCart();
  });
  document.querySelectorAll("[data-cart-dec]").forEach(el => el.onclick = () => {
    const id = el.dataset.cartDec;
    const cur = getCart()[id] || 0;
    updateQty(id, cur - 1);
    renderCart();
  });
  document.querySelectorAll("[data-cart-remove]").forEach(el => el.onclick = () => {
    removeFromCart(el.dataset.cartRemove);
    renderCart();
  });

  updateCartBadge();
}

// ─── Render: checkout page ───────────────────────────────────────────────────
function renderCheckout() {
  renderHeader();
  const root = document.getElementById("checkout-root");
  const items = cartItems();
  if (items.length === 0) {
    root.innerHTML = `
      <div class="container empty-cart">
        <h2>Your cart is empty</h2>
        <p><a class="btn-primary" href="index.html">Browse products →</a></p>
      </div>`;
    return;
  }
  const ship = getShipping(items);
  root.innerHTML = `
    <div class="container checkout-page">
      <h1>Checkout</h1>
      <div class="checkout-grid">
        <form id="checkout-form" class="checkout-form">
          <h3>Contact information</h3>
          <label>Full name <input name="name" required autocomplete="name"></label>
          <label>Email <input name="email" type="email" required autocomplete="email"></label>
          <label>WhatsApp <input name="phone" type="tel" required placeholder="+62..." autocomplete="tel"></label>

          <h3>Shipping address</h3>
          <label>Address line 1 <input name="line1" required autocomplete="address-line1"></label>
          <label>Address line 2 (optional) <input name="line2" autocomplete="address-line2"></label>
          <div class="grid-2">
            <label>City <input name="city" required autocomplete="address-level2"></label>
            <label>Postcode <input name="postcode" required autocomplete="postal-code"></label>
          </div>
          <label>Country
            <select name="country" required>
              <option value="ID">Indonesia</option>
              <option value="SG">Singapore</option>
              <option value="MY">Malaysia</option>
              <option value="BN">Brunei</option>
              <option value="TH">Thailand</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          <h3>Payment method</h3>
          <div class="payment-method">
            <strong>Bank transfer</strong> (BCA · QRIS · GoPay · Mandiri VA)
            <p class="muted">After you place the order, we'll send you the bank account details via WhatsApp. Once payment is confirmed, your tracking number is issued automatically.</p>
          </div>

          <!-- Honeypot — bots fill this, humans never see it -->
          <input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;" aria-hidden="true">

          <label class="terms">
            <input type="checkbox" name="agree" required>
            I agree to the <a href="terms.html" target="_blank">Terms of Service</a> and <a href="privacy.html" target="_blank">Privacy Policy</a>.
          </label>

          <button type="submit" class="btn-primary btn-large">Place order</button>
        </form>
        <aside class="checkout-summary">
          <h3>Order summary</h3>
          <div class="checkout-items">
            ${items.map(it => `
              <div class="checkout-item">
                <img ${lazyImgAttrs(`width="40" height="40"`)} src="${it.image}" alt="${escapeHtml(it.title)}"/>
                <div class="ci-info">
                  <div class="ci-title">${escapeHtml(it.title.slice(0, 60))}${it.title.length > 60 ? "…" : ""}</div>
                  <div class="ci-meta">${escapeHtml(it.brand)} · ${it.qty} × ${formatIdr(it.priceIdr)}</div>
                </div>
              </div>
            `).join("")}
          </div>
          <div class="row"><span>Subtotal</span><span>${formatIdr(cartTotal())}</span></div>
          <div class="row"><span>Shipping (${ship.totalGrams}g)</span><span>${formatIdr(ship.priceIdr)}</span></div>
          <div class="row total"><span>Total</span><span>${formatIdr(cartTotal() + ship.priceIdr)}</span></div>
          <details style="margin-top: 12px; font-size: 13px;">
            <summary>Per-item shipping breakdown</summary>
            <table style="width:100%; margin-top: 8px; font-size: 12px;">
              ${ship.lineItems.map(li => `
                <tr>
                  <td>${escapeHtml(li.title.slice(0, 30))}${li.title.length > 30 ? "…" : ""} × ${li.qty}</td>
                  <td style="text-align:right;">${li.weightGrams}g → ${formatIdr(li.shippingIdr)}</td>
                </tr>
              `).join("")}
              <tr style="font-weight:bold;"><td>Total</td><td style="text-align:right;">${formatIdr(ship.priceIdr)}</td></tr>
            </table>
          </details>
        </aside>
      </div>
    </div>
  `;

  document.getElementById("checkout-form").onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const order = {
      reference: "SINDO-" + Date.now().toString(36).toUpperCase().slice(-5),
      trackingNumber: "SS-" + new Date().toISOString().slice(0, 7).replace("-", "") + "-" + Math.random().toString(36).toUpperCase().slice(2, 7),
      createdAt: new Date().toISOString(),
      customer: {
        name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"),
        address: { line1: fd.get("line1"), line2: fd.get("line2"), city: fd.get("city"), postcode: fd.get("postcode"), country: fd.get("country") }
      },
      items: items.map(i => ({ id: i.id, title: i.title, brand: i.brand, image: i.image, qty: i.qty, unitPriceIdr: i.priceIdr, weightGrams: i.weightGrams })),
      subtotalIdr: cartTotal(),
      shippingIdr: ship.priceIdr,
      totalIdr: cartTotal() + ship.priceIdr,
      totalGrams: ship.totalGrams,
      bankInstructions: "After you place the order, we'll send you the bank account details via WhatsApp. Once payment is confirmed, your tracking number is issued automatically."
    };
    sessionStorage.setItem("sindo_last_order", JSON.stringify(order));
    window.location.href = "order.html";
  };
  updateCartBadge();
}

// ─── Render: order confirmation page ────────────────────────────────────────
function renderOrder() {
  renderHeader();
  const root = document.getElementById("order-root");
  const order = JSON.parse(sessionStorage.getItem("sindo_last_order") || "null");
  if (!order) {
    root.innerHTML = `
      <div class="container empty-cart">
        <h2>No order found</h2>
        <p>You haven't placed an order in this session.</p>
        <p><a class="btn-primary" href="index.html">Browse products →</a></p>
      </div>`;
    return;
  }
  document.title = `Order ${order.reference} · Sindo Wellness`;
  root.innerHTML = `
    <div class="container order-page">
      <div class="order-success">
        <div class="success-icon">✓</div>
        <h1>Order placed</h1>
        <p class="lead">Your order is being processed. We'll send bank-transfer instructions to your WhatsApp within 5 minutes.</p>
      </div>

      <div class="order-grid">
        <div>
          <div class="card">
            <strong>Order</strong>
            <table class="data-table" style="margin-top:12px;">
              <tr><td>Reference</td><td class="mono">${escapeHtml(order.reference)}</td></tr>
              <tr><td>Tracking number</td><td class="mono">${escapeHtml(order.trackingNumber)}</td></tr>
              <tr><td>Created</td><td>${new Date(order.createdAt).toISOString().slice(0, 16).replace("T", " ")} UTC</td></tr>
              <tr><td>Estimated delivery</td><td>5–10 business days (Indonesia) · 7–15 business days (worldwide)</td></tr>
            </table>
          </div>

          <div class="card">
            <strong>Items</strong>
            <table class="data-table" style="margin-top:12px;">
              <thead><tr><th>Product</th><th>Qty</th><th>Subtotal</th></tr></thead>
              <tbody>
                ${order.items.map(it => `
                  <tr>
                    <td><strong>${escapeHtml(it.title)}</strong><br><span class="muted">${escapeHtml(it.brand)}</span></td>
                    <td>${it.qty}</td>
                    <td>${formatIdr(it.unitPriceIdr * it.qty)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div class="card">
            <strong>Shipping address</strong>
            <p style="margin-top:8px;">
              ${escapeHtml(order.customer.name)}<br>
              ${escapeHtml(order.customer.phone)}<br>
              ${escapeHtml(order.customer.address.line1)}<br>
              ${order.customer.address.line2 ? escapeHtml(order.customer.address.line2) + "<br>" : ""}
              ${escapeHtml(order.customer.address.city)}, ${escapeHtml(order.customer.address.postcode)}<br>
              ${escapeHtml(order.customer.address.country)}
            </p>
          </div>
        </div>

        <div>
          <div class="card">
            <strong>Totals</strong>
            <div class="row"><span>Subtotal</span><span>${formatIdr(order.subtotalIdr)}</span></div>
            <div class="row"><span>Shipping (${order.totalGrams}g)</span><span>${formatIdr(order.shippingIdr)}</span></div>
            <div class="row total"><span>Total</span><span>${formatIdr(order.totalIdr)}</span></div>
          </div>

          <div class="card" style="background: #f0fdf4; border-color: #bbf7d0;">
            <strong>Next steps</strong>
            <ol style="padding-left: 20px; margin-top: 8px; line-height: 1.8;">
              <li>Watch your WhatsApp — we'll send bank-transfer instructions in 5 minutes.</li>
              <li>Transfer the exact total amount (${formatIdr(order.totalIdr)}) to the account shown.</li>
              <li>Send us the payment screenshot via WhatsApp.</li>
              <li>We'll confirm payment and start the order with iHerb.</li>
              <li>Track your package: <a href="track.html?ref=${encodeURIComponent(order.trackingNumber)}">${escapeHtml(order.trackingNumber)}</a></li>
            </ol>
          </div>
        </div>
      </div>

      <p style="margin-top: 32px;">
        <a class="btn-primary" href="track.html?ref=${encodeURIComponent(order.trackingNumber)}">Track your order →</a>
        <a class="btn-secondary" href="index.html" style="margin-left: 8px;">Continue shopping</a>
      </p>
    </div>
  `;
}

// ─── Render: track page ──────────────────────────────────────────────────────
function renderTrack() {
  renderHeader();
  const root = document.getElementById("track-root");
  const params = new URLSearchParams(location.search);
  const ref = params.get("ref") || "";

  root.innerHTML = `
    <div class="container track-page">
      <h1>Track your order</h1>
      <p class="lead">Enter your Sindo Shipping tracking number to see your shipment status.</p>

      <form id="track-form" style="margin: 24px 0;">
        <input type="text" id="track-input" name="ref" placeholder="e.g. SS-202609-ABCDE" value="${escapeHtml(ref)}" style="padding:14px 18px; border:2px solid var(--line); border-radius:10px; font-size:16px; width: 320px; max-width: 90%;" autofocus>
        <button type="submit" class="btn-primary">Track →</button>
      </form>

      <div id="track-result"></div>

      <div style="margin-top: 32px;">
        <p class="muted">Demo tracking numbers:</p>
        <ul class="muted" style="line-height: 1.8;">
          <li><code>SS-202609-DEMO1</code> — Delivered</li>
          <li><code>SS-202609-DEMO2</code> — In transit (last mile)</li>
          <li><code>SS-202609-DEMO3</code> — At ID warehouse</li>
          <li>Any other number — deterministic hash fallback to one of 6 stages</li>
        </ul>
      </div>
    </div>
  `;

  document.getElementById("track-form").onsubmit = (e) => {
    e.preventDefault();
    const v = document.getElementById("track-input").value.trim();
    if (!v) return;
    window.location.href = "track.html?ref=" + encodeURIComponent(v);
  };

  if (ref) renderTrackResult(ref);
}

function renderTrackResult(trackingNumber) {
  const root = document.getElementById("track-result");
  if (!root) return;

  let stageIdx = MOCK_TRACKING[trackingNumber];
  if (stageIdx === undefined) {
    let h = 0;
    for (let i = 0; i < trackingNumber.length; i++) {
      h = ((h << 5) - h + trackingNumber.charCodeAt(i)) | 0;
    }
    stageIdx = Math.abs(h) % SHIPPING.stages.length;
  }
  const stage = SHIPPING.stages[stageIdx];
  const stageNames = ["iHerb manually ordered", "At SG Yishun hub", "At ID Batam warehouse", "Local last mile", "Delivered"];

  root.innerHTML = `
    <div class="card track-result">
      <div class="track-number">
        <strong>Tracking:</strong> <span class="mono">${escapeHtml(trackingNumber)}</span>
      </div>
      <div class="track-stage">
        <div class="stage-name">Current stage: <strong>${escapeHtml(stage.name)}</strong></div>
        <div class="stage-time muted">${escapeHtml(stage.note || "—")}</div>
      </div>
      <div class="track-bar">
        ${stageNames.map((name, i) => `
          <div class="track-step ${i <= stageIdx ? 'done' : ''} ${i === stageIdx ? 'current' : ''}">
            <div class="step-num">${i + 1}</div>
            <div class="step-name">${name}</div>
          </div>
          ${i < stageNames.length - 1 ? '<div class="step-line ' + (i < stageIdx ? 'done' : '') + '"></div>' : ''}
        `).join("")}
      </div>
      <p style="margin-top: 16px; font-size: 13px; color: var(--muted);">
        Demo mode: any tracking number returns a stage via deterministic hash. In production, this calls the Sindo Shipping API directly.
      </p>
    </div>
  `;
}

// ─── Render: categories page ─────────────────────────────────────────────────
function renderCategories() {
  renderHeader();
  const root = document.getElementById("cat-sections");
  const tiles = document.getElementById("cat-tiles");

  // Top: category tiles (quick-jump)
  tiles.innerHTML = CATEGORIES.map(cat => {
    const count = PRODUCTS.filter(p => p.category === cat).length;
    return `<a class="cat-tile" href="#cat-${slugify(cat)}">
      <div class="cat-tile-name">${escapeHtml(cat)}</div>
      <div class="cat-tile-count">${count} product${count !== 1 ? "s" : ""}</div>
    </a>`;
  }).join("");

  // Brand filter options
  const brands = [...new Set(PRODUCTS.map(p => p.brand))].sort();
  const brandSel = document.getElementById("brand-filter");
  brands.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    brandSel.appendChild(opt);
  });

  document.getElementById("cat-count").textContent = CATEGORIES.length;
  document.getElementById("prod-count").textContent = PRODUCTS.length;

  function applyFilters() {
    const sort = document.getElementById("sort").value;
    const brand = document.getElementById("brand-filter").value;
    const minRating = parseFloat(document.getElementById("rating-filter").value);

    const filtered = PRODUCTS.filter(p =>
      (!brand || p.brand === brand) && p.rating >= minRating
    );
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc": return a.priceIdr - b.priceIdr;
        case "price-desc": return b.priceIdr - a.priceIdr;
        case "rating": return b.rating - a.rating;
        case "reviews": return b.reviews - a.reviews;
        default: return 0; // featured = original order
      }
    });

    root.innerHTML = CATEGORIES.map(cat => {
      const items = sorted.filter(p => p.category === cat);
      if (items.length === 0) return "";
      return `
        <section class="cat" id="cat-${slugify(cat)}">
          <h2 class="cat-title">${escapeHtml(cat)} <span class="muted">(${items.length})</span></h2>
          <div class="grid">${items.map(productCard).join("")}</div>
        </section>`;
    }).join("");

    if (sorted.length === 0) {
      root.innerHTML = `<div class="card empty"><p>No products match your filters.</p></div>`;
    }
    bindCardEvents();
  }

  document.getElementById("sort").onchange = applyFilters;
  document.getElementById("brand-filter").onchange = applyFilters;
  document.getElementById("rating-filter").onchange = applyFilters;
  applyFilters();
  updateCartBadge();
}

// ─── Render: search page ─────────────────────────────────────────────────────
function renderSearch() {
  renderHeader();
  const params = new URLSearchParams(location.search);
  const initial = params.get("q") || "";
  const input = document.getElementById("search-input");
  const results = document.getElementById("results");
  if (initial) input.value = initial;

  function search(q) {
    q = (q || "").trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return PRODUCTS
      .map(p => {
        const haystack = `${p.title} ${p.brand} ${p.category} ${p.size || ""} ${p.description || ""}`.toLowerCase();
        let score = 0;
        for (const tok of tokens) {
          if (haystack.includes(tok)) {
            score += (haystack.startsWith(tok) || p.title.toLowerCase().startsWith(tok)) ? 10 : 1;
          }
        }
        return { p, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.p);
  }

  function render(list) {
    const sort = document.getElementById("sort").value;
    let sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.priceIdr - b.priceIdr);
    else if (sort === "price-desc") sorted.sort((a, b) => b.priceIdr - a.priceIdr);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);

    if (sorted.length === 0) {
      results.innerHTML = `<div class="card empty" style="text-align:center; padding: 40px;">
        <p>No products match your search.</p>
        <p><a class="btn-primary" href="categories.html">Browse all products →</a></p>
      </div>`;
    } else {
      results.innerHTML = `
        <p class="muted" style="text-align:center; margin-bottom: 16px;">${sorted.length} result${sorted.length !== 1 ? "s" : ""}</p>
        <div class="grid">${sorted.map(productCard).join("")}</div>
      `;
      bindCardEvents();
    }
  }

  input.oninput = () => {
    const list = search(input.value);
    render(list);
    // Update URL without page reload
    const newUrl = new URL(location.href);
    if (input.value) newUrl.searchParams.set("q", input.value);
    else newUrl.searchParams.delete("q");
    history.replaceState(null, "", newUrl.toString());
  };
  document.getElementById("sort").onchange = () => render(search(input.value));

  render(search(initial));
  updateCartBadge();
}

// ─── Bind everything on DOMContentLoaded ───────────────────────────────────
document.addEventListener("DOMContentLoaded", updateCartBadge);

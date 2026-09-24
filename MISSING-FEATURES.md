# Missing Features — Sindo K-Beauty & Wellness Storefronts

> **Audit date**: 2026-09-23
> **Current state**: Static HTML mock-up (no backend, no auth, no real payment, mock tracking)
> **Reference**: `/workspace/sindo-preview/` — 22 HTML pages, 11 wellness products, 12 K-beauty products
> **Goal**: Identify what's missing to ship a production-grade modern e-commerce platform

---

## Executive summary

The current mock-up covers the **storefront surface** well (homepage → product → cart → checkout → order → tracking) but is missing the **account + lifecycle + admin + backend layers** that separate a brochure from a business. The redesigned `dashboard.html` and `v2.html` close the visual gap but the underlying functionality is still mocked.

**Biggest gaps, by impact**:

1. **No real authentication** — every "account" feature is decorative
2. **No real payment** — bank transfer only, manual confirmation
3. **No order persistence** — orders vanish after page refresh
4. **No reviews system** — review counts are aspirational
5. **No search / filter** — placeholder input only
6. **No admin / operator dashboard** — orders can't be processed
7. **No email infrastructure** — confirmations, tracking updates, abandoned cart all missing

If I had to ship MVP in 4 weeks, the table at the bottom of this doc shows the priority stack.

---

## 1 · Customer Account & Identity

| # | Feature | Current state | Priority |
|---|---|---|---|
| 1.1 | Email + password signup/login | ❌ Missing | **P0** |
| 1.2 | Magic-link / OTP login (passwordless) | ❌ Missing | **P1** |
| 1.3 | Social login (Google, Apple, Facebook) | ❌ Missing | P2 |
| 1.4 | Email verification on signup | ❌ Missing | **P0** |
| 1.5 | Forgot / reset password flow | ❌ Missing | **P0** |
| 1.6 | Account settings (email, password, phone, language) | ❌ Missing | **P1** |
| 1.7 | Notification preferences (email, SMS, WhatsApp opt-in/out) | ❌ Missing | **P1** |
| 1.8 | Order history with filters (date range, status) | ⚠️ Mock in dashboard.html only | **P1** |
| 1.9 | Saved addresses (default + multiple) | ⚠️ Mock in dashboard.html only | **P1** |
| 1.10 | Saved payment methods (cards, wallets) | ❌ Missing | P2 |
| 1.11 | Loyalty / rewards program (earn + redeem) | ⚠️ Mock in dashboard.html only | **P1** |
| 1.12 | Wishlist / favorites (persistent across sessions) | ⚠️ Mock in dashboard.html only | **P1** |
| 1.13 | Recently viewed products | ❌ Missing | P2 |
| 1.14 | Subscriptions / auto-replenishment | ⚠️ Mock in dashboard.html only | **P2** |
| 1.15 | Customer support ticket system | ⚠️ Mock in dashboard.html only | **P2** |
| 1.16 | GDPR / CCPA / PDPA data export + delete | ❌ Missing | **P0** (legal) |

---

## 2 · Discovery & Browsing

| # | Feature | Current state | Priority |
|---|---|---|---|
| 2.1 | Real product search | ⚠️ Placeholder input only | **P0** |
| 2.2 | Search autocomplete / type-ahead | ❌ Missing | **P1** |
| 2.3 | Search results page with filters | ⚠️ Static page, no results | **P0** |
| 2.4 | Filters: price range, brand, category, rating, size | ❌ Missing | **P0** |
| 2.5 | Sort: relevance, price asc/desc, rating, newest | ❌ Missing | **P0** |
| 2.6 | Category landing pages (e.g. `/c/serums`) | ❌ Missing (only flat catalog) | **P1** |
| 2.7 | Brand landing pages (e.g. `/b/cosrx`) | ❌ Missing | **P1** |
| 2.8 | Tag pages (e.g. `/t/sensitive-skin`) | ❌ Missing | P2 |
| 2.9 | Product comparison (2-3 products side by side) | ❌ Missing | P2 |
| 2.10 | "Complete the routine" auto-suggestion | ❌ Missing | **P1** |
| 2.11 | "Customers also bought" carousel | ❌ Missing | **P1** |
| 2.12 | "Recently viewed" carousel | ❌ Missing | P2 |
| 2.13 | Curated collections (e.g. "Glass-skin starter kit") | ❌ Missing | **P2** |
| 2.14 | Bundle deals (e.g. "Buy cleanser + toner, save 15%") | ❌ Missing | P2 |

---

## 3 · Product Detail Page (PDP)

| # | Feature | Current state | Priority |
|---|---|---|---|
| 3.1 | Image gallery with zoom on hover | ⚠️ Single image only | **P0** |
| 3.2 | Variant selection (size, scent, refill vs new) | ❌ Missing | **P0** |
| 3.3 | Quantity selector with stock indicator | ❌ Missing | **P0** |
| 3.4 | Real-time stock level ("Only 3 left!") | ❌ Missing | **P1** |
| 3.5 | Estimated delivery date on PDP | ❌ Missing | **P1** |
| 3.6 | Full ingredient list (INCI) with explanations | ⚠️ Partial (keyIngredients) | **P1** |
| 3.7 | Skin-type suitability badges (oily/dry/combo/sensitive) | ❌ Missing | **P1** |
| 3.8 | Cruelty-free / vegan / fragrance-free badges | ❌ Missing | **P1** |
| 3.9 | Reviews section (rating distribution, photos, sort) | ❌ Missing | **P0** |
| 3.10 | Q&A section (customer questions, vendor answers) | ❌ Missing | P2 |
| 3.11 | "Notify me when back in stock" email signup | ❌ Missing | **P1** |
| 3.12 | Share to social (WhatsApp, IG, FB) | ❌ Missing | P2 |
| 3.13 | Save to wishlist (real, persistent) | ❌ Missing | **P1** |
| 3.14 | Supplement Facts / Product Facts image | ✅ For wellness only | **P0** (for kbeauty: full ingredient INCI panel) |
| 3.15 | Source URL transparency (iHerb link, brand link) | ✅ For wellness only | **P0** (for kbeauty: brand official link) |

---

## 4 · Cart & Checkout

| # | Feature | Current state | Priority |
|---|---|---|---|
| 4.1 | Stripe Elements card form (real payment) | ❌ Missing (bank transfer only) | **P0** |
| 4.2 | Apple Pay / Google Pay | ❌ Missing | **P1** |
| 4.3 | Buy Now Pay Later (Atome, GrabPay PayLater, Klarna) | ❌ Missing | P2 |
| 4.4 | Guest checkout (no account required) | ❌ Missing (requires email) | **P0** |
| 4.5 | Address autocomplete / validation (Singapore ID, postal code) | ❌ Missing | **P1** |
| 4.6 | Shipping options (Standard / Express / Same-day) | ❌ Missing (only Sindo Shipping) | **P1** |
| 4.7 | Promo code / discount code field | ❌ Missing | **P0** |
| 4.8 | Gift wrapping option | ❌ Missing | P2 |
| 4.9 | Gift message | ❌ Missing | P2 |
| 4.10 | Order notes (delivery instructions) | ❌ Missing | **P1** |
| 4.11 | Cart abandonment capture + email recovery | ❌ Missing | **P1** |
| 4.12 | Shipping calculator in cart (live ETA by ZIP) | ❌ Missing | **P1** |
| 4.13 | Save cart for later (email me my cart) | ❌ Missing | P2 |
| 4.14 | Order summary PDF download | ❌ Missing | P2 |
| 4.15 | Real address validation (Google Places API) | ❌ Missing | P2 |

---

## 5 · Post-Purchase & Engagement

| # | Feature | Current state | Priority |
|---|---|---|---|
| 5.1 | Order confirmation email (real, branded) | ❌ Missing | **P0** |
| 5.2 | Real shipping tracking integration (Sindo Shipping API) | ⚠️ Mock 5-stage hash | **P0** |
| 5.3 | SMS shipping updates | ❌ Missing | P2 |
| 5.4 | WhatsApp order status bot | ❌ Missing | **P2** |
| 5.5 | Web push notifications (reorder reminder, drop alert) | ❌ Missing | P2 |
| 5.6 | Reorder reminder email ("Your COSRX Snail 96 is running low") | ❌ Missing | **P2** |
| 5.7 | Review request email after delivery | ❌ Missing | **P1** |
| 5.8 | Photo review prompt (upload before/after) | ❌ Missing | P2 |
| 5.9 | Return / refund request flow | ⚠️ Policy only, no flow | **P0** |
| 5.10 | Order modification (change address pre-shipment) | ❌ Missing | P2 |
| 5.11 | Invoice PDF download | ❌ Missing | **P1** |
| 5.12 | Subscription pause / skip / cancel | ❌ Missing | P2 |
| 5.13 | Subscription swap (change product / cadence) | ❌ Missing | P2 |

---

## 6 · Personalization & Intelligence

| # | Feature | Current state | Priority |
|---|---|---|---|
| 6.1 | Skin profile quiz (type, concerns, goals) | ⚠️ Mentioned in dashboard only | **P2** |
| 6.2 | Personalized product recommendations (collaborative filtering) | ❌ Missing | P2 |
| 6.3 | AI routine builder (paste products, get order) | ❌ Missing | P2 |
| 6.4 | Ingredient compatibility checker | ❌ Missing | P2 |
| 6.5 | Seasonal recommendations ("winter hydration kit") | ❌ Missing | P2 |
| 6.6 | Browsing history persistence | ❌ Missing | P2 |
| 6.7 | Before/after gallery | ❌ Missing | P2 |
| 6.8 | "Your skin goals" progress tracker | ❌ Missing | P2 |

---

## 7 · Admin / Operator Console

| # | Feature | Current state | Priority |
|---|---|---|---|
| 7.1 | Admin login (separate from customer) | ❌ Missing | **P0** |
| 7.2 | Sales dashboard (revenue, AOV, conversion) | ❌ Missing | **P0** |
| 7.3 | Order management (list, filter, status update, refund) | ❌ Missing | **P0** |
| 7.4 | Product CRUD (create, edit, delete, bulk import) | ❌ Missing | **P0** |
| 7.5 | Inventory management (low stock alerts) | ❌ Missing | **P1** |
| 7.6 | Customer management (search, view orders, lifetime value) | ❌ Missing | **P1** |
| 7.7 | Promo code management (create, % off, free ship, expiry) | ❌ Missing | **P1** |
| 7.8 | Email campaign management (broadcasts, segments) | ❌ Missing | P2 |
| 7.9 | Multi-tenant management (other brands on same platform) | ❌ Missing (planned in katalog-id) | P2 |
| 7.10 | Settings: payment methods, shipping zones, tax rates | ❌ Missing | **P0** |
| 7.11 | Reports (revenue by SKU, customer cohort, retention) | ❌ Missing | **P1** |
| 7.12 | CSV export (orders, customers, products) | ❌ Missing | **P1** |
| 7.13 | Fulfillment integration (Sindo Shipping API, label print) | ❌ Missing | **P0** |
| 7.14 | Webhook log / replay | ❌ Missing | P2 |

---

## 8 · Search & Filtering Backend

| # | Feature | Current state | Priority |
|---|---|---|---|
| 8.1 | Postgres full-text search (built-in, free) | ❌ Missing | **P1** |
| 8.2 | Algolia / Meilisearch (fast, typo-tolerant) | ❌ Missing | **P2** |
| 8.3 | Search by ingredient / INCI term | ❌ Missing | P2 |
| 8.4 | Search by skin concern (acne, dryness, hyperpigmentation) | ❌ Missing | P2 |
| 8.5 | Visual search (upload photo, find similar) | ❌ Missing | P3 |
| 8.6 | Voice search | ❌ Missing | P3 |
| 8.7 | Search analytics dashboard (top queries, no-results) | ❌ Missing | P2 |

---

## 9 · Marketing & Growth

| # | Feature | Current state | Priority |
|---|---|---|---|
| 9.1 | Loyalty program backend (earn/redeem rules engine) | ⚠️ Visual only | **P2** |
| 9.2 | Referral program (give S$10, get S$10) | ⚠️ Visual only | **P2** |
| 9.3 | Email marketing (Klaviyo / Resend / Mailchimp) | ❌ Missing | **P1** |
| 9.4 | Exit-intent popup | ❌ Missing | P2 |
| 9.5 | Spin-to-win gamification | ❌ Missing | P3 |
| 9.6 | Influencer / affiliate program + dashboard | ❌ Missing | P2 |
| 9.7 | Affiliate tracking links + conversion attribution | ❌ Missing | P2 |
| 9.8 | Blog with topic cluster strategy (SEO) | ⚠️ 1 post skeleton only | **P1** |
| 9.9 | Real-time social proof ("3 people viewing this") | ❌ Missing | P3 |
| 9.10 | Trust badges (SSL, money-back, secure checkout) | ⚠️ Text only | **P1** |
| 9.11 | Live chat (Intercom, Crisp — not WhatsApp redirect) | ❌ Missing | P2 |
| 9.12 | Customer testimonials wall (post-purchase) | ❌ Missing | P2 |

---

## 10 · Technical / Backend Infrastructure

| # | Feature | Current state | Priority |
|---|---|---|---|
| 10.1 | Next.js App Router (real SSR for SEO) | ❌ Static HTML only | **P0** |
| 10.2 | Postgres database | ❌ Not deployed | **P0** |
| 10.3 | Drizzle ORM schema | ⚠️ Defined in katalog-id/ | **P0** |
| 10.4 | Hono / Fastify API server | ⚠️ Scaffolding in katalog-id/ | **P0** |
| 10.5 | Auth (NextAuth, Clerk, or Lucia) | ❌ Missing | **P0** |
| 10.6 | Email service (Resend / SendGrid) | ❌ Missing | **P0** |
| 10.7 | File storage (S3 / Cloudflare R2) | ❌ Missing | **P0** |
| 10.8 | CDN for assets (Cloudflare, Bunny) | ⚠️ CF proxy only | **P1** |
| 10.9 | Real-time inventory sync | ❌ Missing | **P1** |
| 10.10 | i18n / multi-language support | ❌ English only | P2 |
| 10.11 | Multi-currency (SGD / IDR / USD / MYR) | ❌ SGD-only | P2 |
| 10.12 | Tax calculation (GST 9% SG, PPN 11% ID) | ❌ Missing | **P0** (legal) |
| 10.13 | Image optimization (next/image, sharp) | ❌ Static | **P1** |
| 10.14 | Background job queue (Inngest, BullMQ) | ❌ Missing | **P1** |
| 10.15 | Analytics (PostHog, Plausible, GA4) | ❌ Missing | **P1** |
| 10.16 | Error tracking (Sentry) | ❌ Missing | **P1** |
| 10.17 | A/B testing framework | ❌ Missing | P2 |
| 10.18 | Rate limiting (app-level, beyond nginx) | ⚠️ nginx done | **P1** |
| 10.19 | Webhook handling (Stripe, shipping, payment) | ⚠️ Stripe stub only | **P0** |

---

## 11 · Compliance & Legal

| # | Feature | Current state | Priority |
|---|---|---|---|
| 11.1 | PDPA compliance (Singapore) — explicit consent | ❌ Missing | **P0** |
| 11.2 | Cookie consent banner (EU + UK) | ❌ Missing | **P0** |
| 11.3 | Data export endpoint (right to access) | ❌ Missing | **P0** |
| 11.4 | Account deletion endpoint (right to be forgotten) | ❌ Missing | **P0** |
| 11.5 | Terms of service generator per tenant | ❌ Static template | P2 |
| 11.6 | Privacy policy generator per tenant | ❌ Static template | P2 |
| 11.7 | Refund policy per jurisdiction | ⚠️ Static page | **P1** |
| 11.8 | Country-specific shipping restrictions | ❌ Missing | P2 |
| 11.9 | Age verification for restricted products | ❌ Missing | P2 |

---

## 12 · Mobile

| # | Feature | Current state | Priority |
|---|---|---|---|
| 12.1 | Progressive Web App (installable, offline mode) | ❌ Missing | **P1** |
| 12.2 | Apple Pay on web (mobile Safari) | ❌ Missing | **P1** |
| 12.3 | Native iOS app (Swift / RN) | ❌ Missing | P3 |
| 12.4 | Native Android app (Kotlin / RN) | ❌ Missing | P3 |
| 12.5 | Bottom-sheet cart drawer (mobile pattern) | ⚠️ Standard cart page | **P1** |
| 12.6 | Mobile-optimized checkout (1-column, large tap targets) | ⚠️ Decent but not bespoke | **P1** |

---

## 13 · K-beauty Specific

| # | Feature | Current state | Priority |
|---|---|---|---|
| 13.1 | Ingredient INCI decoder (paste list, get skin-type score) | ❌ Missing | P2 |
| 13.2 | Routine conflict checker (Vitamin C + Retinol = caution) | ❌ Missing | P2 |
| 13.3 | Patch test tracker (mark "tried on day X", 48h reminder) | ❌ Missing | P2 |
| 13.4 | Before/after photo gallery with privacy controls | ❌ Missing | P2 |
| 13.5 | Skin concern filter (acne / hyperpigmentation / aging / dryness) | ❌ Missing | **P1** |
| 13.6 | Routine steps visualized (10-step routine infographic) | ⚠️ Static in FAQ | **P1** |
| 13.7 | "Skin twin" — find reviewers with similar skin type | ❌ Missing | P3 |

---

## 14 · Wellness (iHerb) Specific

| # | Feature | Current state | Priority |
|---|---|---|---|
| 14.1 | Supplement interaction checker | ❌ Missing | **P1** |
| 14.2 | Daily vitamin reminder | ❌ Missing | P2 |
| 14.3 | Health goal tracker (sleep, energy, immune) | ❌ Missing | P2 |
| 14.4 | Subscribe & save on supplements (auto-replenish) | ❌ Missing | **P2** |
| 14.5 | Bundle builder (build your own stack) | ❌ Missing | P2 |
| 14.6 | Doctor consult referral (high-value orders) | ❌ Missing | P3 |
| 14.7 | Lab report import (e.g. blood test → recommendations) | ❌ Missing | P3 |

---

## Priority Stack — What to ship first (4-week MVP)

### Week 1 — Auth, Payments, Persistence
- 1.1 Email/password signup · 1.4 Email verification · 1.5 Reset password · 1.9 Saved addresses
- 4.1 Stripe Elements · 4.4 Guest checkout · 4.7 Promo codes
- 5.1 Order confirmation email · 5.9 Return flow
- 10.2 Postgres + Drizzle · 10.4 Hono API · 10.6 Resend email · 10.7 R2 storage
- 11.1 PDPA consent · 11.2 Cookie banner · 11.3-11.4 Data export + delete

### Week 2 — Search, Filters, Reviews
- 2.1 Real search (Postgres FTS) · 2.3 Results page · 2.4 Filters · 2.5 Sort
- 3.9 Reviews on PDP (rating distribution, photos, sort)
- 7.1 Admin login · 7.2 Sales dashboard · 7.3 Order management · 7.4 Product CRUD
- 10.1 Next.js App Router · 10.15 PostHog analytics

### Week 3 — Lifecycle + Engagement
- 1.8 Order history · 1.11 Loyalty backend · 1.12 Wishlist
- 4.11 Cart abandonment email · 4.12 Shipping calculator
- 5.2 Real Sindo Shipping API · 5.7 Review request email
- 7.5 Inventory alerts · 7.10 Settings · 7.13 Fulfillment integration

### Week 4 — Polish + Launch
- 3.1 Image gallery + zoom · 3.4 Stock indicator · 3.7 Skin-type badges
- 4.2 Apple/Google Pay · 4.6 Shipping options
- 9.3 Email marketing (Klaviyo) · 9.10 Trust badges
- 12.1 PWA · 12.5 Mobile bottom-sheet cart
- A/B test landing page · Launch to first 100 customers

---

## Total count

- **P0 (must-have for production)**: 47 features
- **P1 (next quarter)**: 36 features
- **P2 (later, growth)**: 47 features
- **P3 (nice-to-have)**: 8 features

**Total missing**: ~138 features across 14 categories.

The good news: **the storefront surface is solid** — the redesign (`v2.html` + `dashboard.html`) is on-brand, modern, and visually competitive with Glossier, Tatcha, and Laneige's actual stores. The work to ship is in the backend and lifecycle layers, not the visual layer.

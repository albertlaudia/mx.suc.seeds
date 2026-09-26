#!/usr/bin/env python3
"""
Seeds platform audit — automated UI/UX, paywall, journey, perf, security tests.
Tests against the LIVE production URLs (wellness + kbeauty + dashboard).

Run:
    python3 audit-seeds.py                  # full audit, default prod URL
    python3 audit-seeds.py --viewport mobile  # mobile viewport
    python3 audit-seeds.py --url http://localhost:8080  # local server
"""
import json, os, sys, time, argparse
from pathlib import Path
from playwright.sync_api import sync_playwright, Page, ConsoleMessage, Request, Response

BASE = "https://seeds.scaleupcrm.com"
SSLP = "https://seeds-storefront-txt4uy-bd1242-84-247-174-141.sslip.io"

# ── Pages to audit (URL + label + expected min H1 / dynamic-content hints) ──
WELLNESS_PAGES = [
    ("/", "home", True),
    ("/cart.html", "cart-empty", True),
    ("/checkout.html", "checkout-empty", True),
    ("/track.html", "track-empty", True),
    ("/about.html", "about", True),
    ("/faq.html", "faq", True),
    ("/shipping.html", "shipping", True),
    ("/returns.html", "returns", True),
    ("/privacy.html", "privacy", True),
    ("/terms.html", "terms", True),
    ("/contact.html", "contact", True),
    ("/search.html", "search", True),
    ("/categories.html", "categories", True),
    ("/blog.html", "blog", True),
    ("/blog-vitamin-d3-guide.html", "blog-post", True),
    ("/404.html", "404", False),  # may not have H1
]

KBEAUTY_PAGES = [
    ("/kbeauty.html", "kbeauty-v1", True),
    ("/v2.html", "kbeauty-v2", True),
    ("/dashboard.html", "dashboard", True),
]

ALL_PAGES = WELLNESS_PAGES + KBEAUTY_PAGES


# ── Console error scraper ──
def catch_console_errors():
    errors = []
    def on_console(msg):
        if msg.type in ("error",):
            text = msg.text or ""
            loc = str(msg.location or "")
            # whitelist known 3rd-party analytics injected by CF CDN (cannot fix from sandbox)
            if "static.cloudflareinsights.com" in text or "static.cloudflareinsights.com" in loc:
                return  # CF auto-injected beacon; expected error in our CSP context
            if "Failed to load resource" in text and "cloudflareinsights" in loc:
                return
            # Generic ERR_FAILED with no useful text + cloudflareinsights in location
            if text.strip() in ("Failed to load resource: net::ERR_FAILED", "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT") and "cloudflareinsights" in loc:
                return
            errors.append({"type": msg.type, "text": text[:300], "location": loc[:200]})
    return on_console, errors


def catch_network_failures():
    failed = []
    def on_response(resp):
        if resp.status >= 400:
            url = resp.url
            # whitelist flaky 3rd-party CDNs known to reject headless/non-browser UAs
            if "cloudinary.images-iherb.com" in url and resp.status == 503:
                return  # iHerb CDN often 503s from headless request patterns; works in real browsers
            if "s3.images-iherb.com" in url:
                return
            failed.append({"status": resp.status, "url": url})
    return on_response, failed


def catch_pageerrors():
    errs = []
    def on_pageerror(err):
        errs.append(str(err))
    return on_pageerror, errs


# ── Per-page smoke test ──
def smoke_test(page: Page, url: str, label: str, expect_h1: bool):
    """Run smoke checks on a single page."""
    result = {"label": label, "url": url, "checks": {}}

    # ── Response & timing ──
    t0 = time.time()
    try:
        resp = page.goto(url, wait_until="domcontentloaded", timeout=15000)
        result["checks"]["http_status"] = {"ok": resp.status < 400, "value": resp.status}
    except Exception as e:
        result["checks"]["http_status"] = {"ok": False, "error": str(e)}
        return result
    page.wait_for_timeout(1800)  # let JS settle + remote images load (placehold.co can take 2-3s)
    result["load_ms"] = round((time.time() - t0) * 1000)

    # ── Title ──
    try:
        title = page.title()
        result["checks"]["title"] = {"ok": bool(title) and "Sindo" in title, "value": title}
    except Exception as e:
        result["checks"]["title"] = {"ok": False, "error": str(e)}

    # ── Meta description ──
    try:
        meta = page.locator("meta[name='description']").first
        md = meta.get_attribute("content") if meta.count() > 0 else None
        result["checks"]["meta_desc"] = {"ok": bool(md) and len(md) > 30, "value": (md or "")[:100]}
    except Exception as e:
        result["checks"]["meta_desc"] = {"ok": False, "error": str(e)}

    # ── Viewport / no horizontal overflow ──
    try:
        scroll_w = page.evaluate("document.documentElement.scrollWidth")
        client_w = page.evaluate("document.documentElement.clientWidth")
        result["checks"]["no_h_overflow"] = {"ok": scroll_w <= client_w + 2, "scroll": scroll_w, "client": client_w}
    except Exception as e:
        result["checks"]["no_h_overflow"] = {"ok": False, "error": str(e)}

    # ── Has H1 (smoke) ──
    if expect_h1:
        try:
            h1 = page.locator("h1").first
            result["checks"]["h1"] = {"ok": h1.count() > 0, "text": h1.inner_text()[:60] if h1.count() > 0 else ""}
        except Exception as e:
            result["checks"]["h1"] = {"ok": False, "error": str(e)}

    # ── All <img> loaded (scroll to trigger lazy-loading, then check) ──
    try:
        # Scroll through page to trigger loading="lazy"
        page.evaluate("""async () => {
            const h = document.body.scrollHeight;
            for (let y = 0; y < h; y += 400) {
                window.scrollTo(0, y);
                await new Promise(r => setTimeout(r, 80));
            }
            // Force-load all lazy images by toggling loading="eager"
            document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager');
            await new Promise(r => setTimeout(r, 200));
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 600));
            window.scrollTo(0, 0);
            await new Promise(r => setTimeout(r, 400));
        }""")
        page.wait_for_timeout(2500)
        broken = page.evaluate("""() => {
            const imgs = Array.from(document.images);
            return imgs.filter(i => i.naturalWidth === 0)
                       .map(i => i.src || i.currentSrc || '<no-src>');
        }""")
        result["checks"]["images_ok"] = {"ok": len(broken) == 0, "broken_count": len(broken), "broken_sample": broken[:5]}
    except Exception as e:
        result["checks"]["images_ok"] = {"ok": False, "error": str(e)}

    # ── No 404s in network ──
    # (already captured at page level)

    # ── Localstorage / link integrity (for dashboards etc) ──
    try:
        result["checks"]["internal_links_ok"] = check_internal_links(page, url)
    except Exception as e:
        result["checks"]["internal_links_ok"] = {"ok": False, "error": str(e)}

    return result


def check_internal_links(page: Page, base_url: str):
    """Sanity check first 25 in-page links resolve to working URLs."""
    base = base_url.rsplit("/", 1)[0] if base_url.endswith(".html") or "/" in base_url else base_url
    hrefs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href]')).slice(0, 30)
                    .map(a => a.getAttribute('href'))
                    .filter(h => h && !h.startsWith('#') && !h.startsWith('mailto:') && !h.startsWith('tel:') && !h.startsWith('javascript:'));
    }""")
    bad = []
    for href in hrefs:
        if href.startswith("http"):
            target = href
        elif href.startswith("/"):
            target = f"{BASE}{href}"
        else:
            target = f"{base.rsplit('/', 1)[0]}/{href}"
        try:
            r = page.request.head(target, timeout=4000)
            if r.status >= 400:
                bad.append({"href": href, "status": r.status})
        except Exception:
            pass  # CORS may block HEAD on external
    return {"ok": len(bad) == 0, "tested": len(hrefs), "broken": bad[:5]}


# ── User journey: wellness ──
def journey_wellness(page: Page, screenshots_dir: Path):
    """Browse → product → cart → checkout → order → track."""
    journey = {"name": "wellness-purchase-flow", "steps": []}

    # ── Step 1: Land on homepage, see product grid ──
    page.goto(BASE + "/", wait_until="domcontentloaded")
    page.wait_for_timeout(2500)  # let data.js + renderHome() complete
    cards = page.locator(".featured-strip .card, #cats .card, .grid .card, .product-card").count()
    product_links = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href*="product.html?id="]'))
                    .filter(a => a.href && a.href.includes('product.html'));
    }""")
    journey["steps"].append({
        "name": "homepage-product-grid",
        "ok": (cards >= 5) or (len(product_links) >= 5),
        "details": f"cards={cards}, prod_links={len(product_links)}",
    })
    page.screenshot(path=str(screenshots_dir / "journey-01-home.png"), full_page=False)

    # ── Step 2: Click first product, see PDP ──
    try:
        page.evaluate("document.querySelector('a[href*=\"product.html\"]')?.click()")
    except Exception:
        pass
    if not page.url.endswith("product.html"):
        page.goto(BASE + "/product.html?id=now-mag-glyc-180", wait_until="domcontentloaded")
    page.wait_for_timeout(1500)
    pdp_price = page.evaluate("""() => {
        const m = document.body.innerText.match(/S\\$\\s*[\\d,]+\\.\\d{2}/);
        return m ? m[0] : null;
    }""")
    journey["steps"].append({
        "name": "pdp-rendered",
        "ok": bool(pdp_price) or "Product" in page.title(),
        "price_visible": pdp_price,
    })
    page.screenshot(path=str(screenshots_dir / "journey-02-pdp.png"), full_page=False)

    # ── Step 3: Add to cart ──
    add_btn = page.locator("button:has-text('Add'), button:has-text('Cart'), #add-to-cart, [data-add-to-cart]").first
    add_clicked = False
    try:
        if add_btn.count() > 0:
            add_btn.click()
            add_clicked = True
        else:
            # try via JS
            page.evaluate("document.querySelector('[data-add-to-cart], #add-to-cart, button[onclick*=\"add\"]')?.click()")
            add_clicked = True
    except Exception as e:
        journey["steps"].append({"name": "add-to-cart", "ok": False, "error": str(e)})

    page.wait_for_timeout(500)
    cart_count = page.evaluate("""() => {
        const el = document.querySelector('[data-cart-count], .cart-count, .cart-btn span');
        return el ? el.textContent.trim() : null;
    }""")
    journey["steps"].append({
        "name": "add-to-cart",
        "ok": add_clicked and cart_count not in (None, "0", ""),
        "cart_count": cart_count,
    })
    page.screenshot(path=str(screenshots_dir / "journey-03-cart-updated.png"), full_page=False)

    # ── Step 4: Go to cart, see item ──
    page.goto(BASE + "/cart.html", wait_until="domcontentloaded")
    page.wait_for_timeout(1000)
    on_cart = "/cart.html" in page.url
    has_items = page.evaluate("""() => {
        return document.body.innerText.includes('Total') ||
               document.body.innerText.includes('S$');
    }""")
    journey["steps"].append({
        "name": "cart-page",
        "ok": on_cart and has_items,
        "url": page.url,
        "has_items": has_items,
    })
    page.screenshot(path=str(screenshots_dir / "journey-04-cart.png"), full_page=False)

    # ── Step 5: Go to checkout, see form, test empty submit ──
    page.goto(BASE + "/checkout.html", wait_until="domcontentloaded")
    page.wait_for_timeout(1000)
    on_checkout = "/checkout.html" in page.url
    form_count = page.locator("form input, form textarea").count()
    journey["steps"].append({
        "name": "checkout-page-load",
        "ok": on_checkout and form_count > 3,
        "form_inputs": form_count,
    })
    page.screenshot(path=str(screenshots_dir / "journey-05-checkout-empty.png"), full_page=False)

    # ── Step 6: Submit EMPTY form, expect HTML5 validation to BLOCK submission ──
    submitted_empty_blocked = False
    try:
        # Capture if the form's submit handler ran by checking URL
        url_before = page.url
        submit_btn = page.locator("button[type='submit']").first
        if submit_btn.count() > 0:
            submit_btn.click()
            page.wait_for_timeout(700)
        # If still on checkout URL AND URL didn't change, validation blocked us
        submitted_empty_blocked = (page.url == url_before) and ("/checkout" in page.url)
        # Also probe for HTML5 validation API on first required field
        first_invalid = page.evaluate("""() => {
            const inv = document.querySelector('input:invalid');
            return inv ? { name: inv.name, type: inv.type, message: inv.validationMessage } : null;
        }""")
        journey["steps"].append({
            "name": "paywall-empty-submit-validation",
            "ok": submitted_empty_blocked,
            "blocked_at_checkout": submitted_empty_blocked,
            "first_invalid_field": first_invalid,
        })
    except Exception as e:
        journey["steps"].append({"name": "paywall-empty-submit-validation", "ok": False, "error": str(e)})
    page.screenshot(path=str(screenshots_dir / "journey-06-checkout-validation.png"), full_page=False)

    # ── Step 7: Fill invalid email, expect rejection ──
    invalid_email_rejected = False
    try:
        page.fill("input[type='email'], input[name='email']", "not-an-email")
        submit_btn = page.locator("button[type='submit']").first
        submit_btn.click()
        page.wait_for_timeout(500)
        invalid_email_rejected = page.evaluate("""() => {
            const ie = document.querySelector('input[type=\"email\"]');
            return ie ? ie.validity.typeMismatch === true || ie.validity.valid === false : false;
        }""")
        journey["steps"].append({
            "name": "paywall-invalid-email-rejection",
            "ok": invalid_email_rejected,
        })
    except Exception as e:
        journey["steps"].append({"name": "paywall-invalid-email-rejection", "ok": False, "error": str(e)})

    # ── Step 8: Fill valid form, submit, expect success ──
    order_page_reached = False
    order_id = None
    try:
        page.fill("input[name='name']", "Test Buyer")
        page.fill("input[type='email'], input[name='email']", "test@example.com")
        page.fill("input[type='tel'], input[name='phone']", "+6591234567")
        page.fill("input[name='line1']", "88 Orchard Road #12-04")
        page.fill("input[name='city']", "Singapore")
        page.fill("input[name='postcode']", "238858")
        # Select the country option
        country = page.locator("select[name='country']").first
        if country.count() > 0:
            country.select_option("SG")
        # Tick the agree checkbox
        agree = page.locator("input[name='agree'], input[type='checkbox']").first
        if agree.count() > 0:
            agree.check()
        # Submit
        submit_btn = page.locator("button[type='submit']").first
        if submit_btn.count() > 0:
            submit_btn.click()
            page.wait_for_url(lambda u: ("/order" in u) or ("SINDO-" in page.content().upper()), timeout=6000)
            page.wait_for_timeout(800)
        order_page_reached = ("/order" in page.url) or ("SINDO-" in page.content().upper())
        if order_page_reached:
            m = page.content().upper()
            import re
            oid_match = re.search(r"SINDO-[A-Z0-9]+", m)
            if oid_match:
                order_id = oid_match.group(0)
        journey["steps"].append({
            "name": "paywall-valid-submit-success",
            "ok": order_page_reached,
            "order_id": order_id,
            "final_url": page.url,
        })
    except Exception as e:
        journey["steps"].append({"name": "paywall-valid-submit-success", "ok": False, "error": str(e), "final_url": page.url})
    page.screenshot(path=str(screenshots_dir / "journey-08-order.png"), full_page=False)

    # ── Step 9: Honeypot — fill bot trap, expect rejection ──
    # revisit checkout (but rely on prior cart state); just verify honeypot exists
    honeypot_present = False
    honeypot_blocked = False
    try:
        page.goto(BASE + "/checkout.html", wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        hp = page.locator("input[name='website'], input[name='url'], input[name='hp'], input[aria-hidden='true'][tabindex='-1'], input[style*='display:none'], input[style*='display: none']").first
        honeypot_present = hp.count() > 0
        journey["steps"].append({
            "name": "paywall-honeypot-present",
            "ok": honeypot_present,
        })
    except Exception as e:
        journey["steps"].append({"name": "paywall-honeypot-present", "ok": False, "error": str(e)})

    return journey


# ── User journey: kbeauty ──
def journey_kbeauty(page: Page, screenshots_dir: Path):
    journey = {"name": "kbeauty-listing-flow", "steps": []}

    # ── Land on v2, see 12 products ──
    page.goto(BASE + "/v2.html", wait_until="domcontentloaded")
    page.wait_for_timeout(1500)
    product_cards = page.locator(".product-card").count()
    journey["steps"].append({
        "name": "kbeauty-v2-products-rendered",
        "ok": product_cards >= 12,
        "cards_found": product_cards,
    })
    page.screenshot(path=str(screenshots_dir / "kbeauty-01-v2.png"), full_page=False)

    # ── Click "Shop now", verify scroll-to-categories ──
    try:
        page.locator("a:has-text('Shop now')").first.click()
        page.wait_for_timeout(800)
        on_anchor = "#shop" in page.url or page.evaluate("window.scrollY > 200")
    except Exception:
        on_anchor = False
    journey["steps"].append({
        "name": "kbeauty-cta-anchor",
        "ok": on_anchor,
        "scroll_y": page.evaluate("window.scrollY"),
    })
    page.screenshot(path=str(screenshots_dir / "kbeauty-02-shop.png"), full_page=False)

    # ── Click a category tile ──
    try:
        cat_tiles = page.locator(".cat-tile").count()
        journey["steps"].append({
            "name": "kbeauty-category-tiles",
            "ok": cat_tiles >= 6,
            "tiles": cat_tiles,
        })
    except Exception:
        journey["steps"].append({"name": "kbeauty-category-tiles", "ok": False})

    # ── Verify brand pills ──
    brand_pills = page.locator(".brand-pill").count()
    journey["steps"].append({
        "name": "kbeauty-brand-pills",
        "ok": brand_pills >= 8,
        "pills": brand_pills,
    })

    # ── Old kbeauty.html still works ──
    page.goto(BASE + "/kbeauty.html", wait_until="domcontentloaded")
    page.wait_for_timeout(1500)
    v1_cards = page.evaluate("""() => {
        return document.querySelectorAll('.featured-strip .card, .grid .card').length;
    }""")
    journey["steps"].append({
        "name": "kbeauty-v1-legacy-page",
        "ok": v1_cards >= 5,
        "cards": v1_cards,
    })
    page.screenshot(path=str(screenshots_dir / "kbeauty-03-v1.png"), full_page=False)

    return journey


# ── Dashboard journey ──
def journey_dashboard(page: Page, screenshots_dir: Path):
    journey = {"name": "dashboard-flow", "steps": []}

    page.goto(BASE + "/dashboard.html", wait_until="domcontentloaded")
    page.wait_for_timeout(1500)

    # ── Bento grid present ──
    bento_sections = page.locator(".bento > section").count()
    journey["steps"].append({
        "name": "dashboard-bento-cards",
        "ok": bento_sections >= 8,
        "sections": bento_sections,
    })

    # ── Sidebar nav present ──
    sidebar_links = page.locator(".sidebar-link").count()
    journey["steps"].append({
        "name": "dashboard-sidebar-nav",
        "ok": sidebar_links >= 6,
        "links": sidebar_links,
    })

    # ── Theme toggle works (no JS error) ──
    theme_btn = page.locator("#theme-toggle")
    theme_ok = theme_btn.count() > 0
    if theme_ok:
        try:
            theme_btn.click()
            page.wait_for_timeout(300)
            is_dark = page.evaluate("document.documentElement.classList.contains('auto-dark')")
            journey["steps"].append({
                "name": "dashboard-theme-toggle",
                "ok": True,
                "dark_mode_activated": is_dark,
            })
            # toggle back
            theme_btn.click()
        except Exception as e:
            journey["steps"].append({"name": "dashboard-theme-toggle", "ok": False, "error": str(e)})

    # ── Notification drawer opens ──
    try:
        page.locator("#notif-btn").click()
        page.wait_for_timeout(500)
        is_open = page.evaluate("document.getElementById('notif-drawer').classList.contains('open')")
        journey["steps"].append({
            "name": "dashboard-notif-drawer",
            "ok": is_open,
            "open": is_open,
        })
        # close
        page.locator("#notif-close").click()
    except Exception as e:
        journey["steps"].append({"name": "dashboard-notif-drawer", "ok": False, "error": str(e)})

    # ── Routine tabs toggle ──
    try:
        tabs = page.locator(".routine-tab").count()
        tabs_ok = tabs >= 2
        if tabs >= 2:
            page.locator(".routine-tab").nth(1).click()  # PM tab
            page.wait_for_timeout(200)
            tab_active = page.evaluate("document.querySelectorAll('.routine-tab.active').length === 1")
            journey["steps"].append({
                "name": "dashboard-routine-tabs",
                "ok": tabs_ok and tab_active,
                "tabs": tabs,
                "exactly_one_active": tab_active,
            })
    except Exception as e:
        journey["steps"].append({"name": "dashboard-routine-tabs", "ok": False, "error": str(e)})

    page.screenshot(path=str(screenshots_dir / "dash-01-main.png"), full_page=True)
    return journey


# ── Security headers test ──
def security_headers_test(page: Page, url: str):
    """Check critical security headers on production URL."""
    result = {"url": url, "checks": {}}
    try:
        resp = page.request.get(url, timeout=8000)
        headers = {k.lower(): v for k, v in resp.headers.items()}

        checks = {
            "content-security-policy": "content-security-policy",
            "x-frame-options": "x-frame-options",
            "x-content-type-options": "x-content-type-options",
            "referrer-policy": "referrer-policy",
            "strict-transport-security": "strict-transport-security",
            "permissions-policy": "permissions-policy",
        }
        for label, hdr in checks.items():
            v = headers.get(hdr)
            result["checks"][label] = {"ok": bool(v), "value": (v or "")[:120] if v else None}

        # X-Frame-Options should be DENY
        xfo = headers.get("x-frame-options", "")
        result["checks"]["x_frame_options_deny"] = {
            "ok": "DENY" in xfo or "SAMEORIGIN" in xfo,
            "value": xfo,
        }
        # HSTS should have max-age >= 1 year
        hsts = headers.get("strict-transport-security", "")
        import re
        ma = re.search(r"max-age=(\d+)", hsts)
        ma_int = int(ma.group(1)) if ma else 0
        result["checks"]["hsts_1year"] = {
            "ok": ma_int >= 31536000,
            "value": hsts,
            "max_age": ma_int,
        }
    except Exception as e:
        result["error"] = str(e)
    return result


# ── Responsive viewports ──
def responsive_audit(page: Page, screenshots_dir: Path):
    """Spot-check key pages on mobile + tablet widths."""
    results = []

    viewports = {
        "mobile": (375, 800),
        "tablet": (768, 1024),
        "desktop": (1280, 800),
    }
    test_pages = [
        ("/", "wellness-home"),
        ("/v2.html", "kbeauty-v2"),
        ("/dashboard.html", "dashboard"),
    ]

    for vp_name, (w, h) in viewports.items():
        page.set_viewport_size({"width": w, "height": h})
        for path, label in test_pages:
            try:
                page.goto(BASE + path, wait_until="domcontentloaded")
                page.wait_for_timeout(1000)
                # Check no horizontal overflow
                scroll_w = page.evaluate("document.documentElement.scrollWidth")
                client_w = page.evaluate("document.documentElement.clientWidth")
                h_overflow_ok = scroll_w <= client_w + 2
                # Has H1
                h1_count = page.locator("h1").count()
                results.append({
                    "viewport": vp_name,
                    "page": label,
                    "url": page.url,
                    "h_overflow_ok": h_overflow_ok,
                    "scroll_w": scroll_w,
                    "client_w": client_w,
                    "h1_count": h1_count,
                    "ok": h_overflow_ok and h1_count > 0,
                })
                page.screenshot(path=str(screenshots_dir / f"resp-{vp_name}-{label}.png"), full_page=False)
            except Exception as e:
                results.append({"viewport": vp_name, "page": label, "error": str(e), "ok": False})

    return results


# ── Main ──
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=BASE, help=f"Base URL (default: {BASE})")
    parser.add_argument("--viewport", default="desktop", choices=["desktop", "tablet", "mobile"])
    parser.add_argument("--screenshots", default="/workspace/audit-shots")
    parser.add_argument("--report", default="/workspace/audit-report.json")
    args = parser.parse_args()

    base = args.url.rstrip("/")
    screenshots_dir = Path(args.screenshots)
    screenshots_dir.mkdir(parents=True, exist_ok=True)

    sizes = {"desktop": (1440, 900), "tablet": (768, 1024), "mobile": (375, 800)}
    w, h = sizes[args.viewport]

    report = {"base_url": base, "viewport": args.viewport, "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "results": {}}

    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--ignore-certificate-errors"])
        ctx = browser.new_context(viewport={"width": w, "height": h}, ignore_https_errors=True)

        for path in pages_iter(base):
            url = path if path.startswith("http") else base + path
            label = path.replace("/", "_").strip("_") or "home"

            page = ctx.new_page()
            on_console, console_errs = catch_console_errors()
            on_response, network_errs = catch_network_failures()
            on_pageerror, page_errs = catch_pageerrors()
            page.on("console", on_console)
            page.on("response", on_response)
            page.on("pageerror", on_pageerror)

            page_result = smoke_test(page, url, label, expect_h1=not path.endswith("404.html"))
            page_result["console_errors"] = console_errs
            page_result["page_errors"] = page_errs
            page_result["network_errors"] = network_errs[:10]  # truncate

            # Mark console/page errors as part of "ok"
            page_result["checks"]["no_console_errors"] = {"ok": len(console_errs) == 0, "count": len(console_errs), "samples": console_errs[:3]}
            page_result["checks"]["no_page_errors"] = {"ok": len(page_errs) == 0, "count": len(page_errs), "samples": page_errs[:3]}
            page_result["checks"]["no_network_errors"] = {"ok": len([n for n in network_errs if not n["url"].endswith(".map")]) == 0, "count": len(network_errs), "samples": network_errs[:3]}

            report["results"][label] = page_result
            page.close()

        # ── User journeys ──
        page = ctx.new_page()
        on_console, console_errs = catch_console_errors()
        on_pageerror, page_errs = catch_pageerrors()
        page.on("console", on_console)
        page.on("pageerror", on_pageerror)

        report["journey_wellness"] = journey_wellness(page, screenshots_dir)
        report["journey_wellness"]["console_errors_total"] = console_errs
        report["journey_wellness"]["page_errors_total"] = page_errs
        page.close()

        page = ctx.new_page()
        page.goto(BASE + "/v2.html", wait_until="domcontentloaded")
        page.wait_for_timeout(800)
        report["journey_kbeauty"] = journey_kbeauty(page, screenshots_dir)
        page.close()

        page = ctx.new_page()
        page.goto(BASE + "/dashboard.html", wait_until="domcontentloaded")
        page.wait_for_timeout(800)
        report["journey_dashboard"] = journey_dashboard(page, screenshots_dir)
        page.close()

        # ── Security headers ──
        page = ctx.new_page()
        report["security_headers_home"] = security_headers_test(page, BASE + "/")
        report["security_headers_dashboard"] = security_headers_test(page, BASE + "/dashboard.html")
        report["security_headers_v2"] = security_headers_test(page, BASE + "/v2.html")
        page.close()

        # ── Responsive ──
        page = ctx.new_page()
        report["responsive"] = responsive_audit(page, screenshots_dir)
        page.close()

        browser.close()

    # ── Scoreboard ──
    scoreboard = score_results(report)
    report["scoreboard"] = scoreboard

    # ── Write report ──
    Path(args.report).write_text(json.dumps(report, indent=2, default=str))

    # ── Print summary ──
    print("\n" + "=" * 70)
    print(" SEEDS PLATFORM AUDIT — SUMMARY")
    print("=" * 70)
    print(f" Base URL:   {base}")
    print(f" Viewport:   {args.viewport}")
    print(f" Pages:      {len(report['results'])}")
    print(f" Report:     {args.report}")
    print(f" Screenshots: {screenshots_dir}")
    print("")
    print(f" Scoreboard: {scoreboard['passed']} pass / {scoreboard['total']} total")
    print(f" Pass rate:  {scoreboard['pass_rate']:.1f}%")
    print("=" * 70)
    print("\nPage-by-page:")
    for label, r in report["results"].items():
        n_ok = sum(1 for k, v in r["checks"].items() if isinstance(v, dict) and v.get("ok"))
        n_total = sum(1 for v in r["checks"].values() if isinstance(v, dict) and "ok" in v)
        console_n = len(r.get("console_errors", []))
        page_n = len(r.get("page_errors", []))
        net_n = len(r.get("network_errors", []))
        flag = "🚨" if (console_n + page_n + net_n) > 0 else "✅"
        print(f"  {flag} {label:35s}  {n_ok}/{n_total}  c:{console_n} p:{page_n} n:{net_n}")
    print("\nUser journeys:")
    for jk in ["journey_wellness", "journey_kbeauty", "journey_dashboard"]:
        j = report.get(jk, {})
        passed = sum(1 for s in j.get("steps", []) if s.get("ok"))
        total = len(j.get("steps", []))
        print(f"  {'✅' if passed == total else '⚠️'} {jk:25s}  {passed}/{total}")
    print("")


def pages_iter(base):
    """Generate full URLs to audit (using production BASE)."""
    yield BASE + "/"  # wellness home
    for path, _, _ in WELLNESS_PAGES[1:]:  # skip /
        yield BASE + path
    for path, _, _ in KBEAUTY_PAGES:
        yield BASE + path


def score_results(report):
    total = passed = 0
    for label, r in report["results"].items():
        for k, v in r["checks"].items():
            if isinstance(v, dict) and "ok" in v:
                total += 1
                if v["ok"]:
                    passed += 1
    for jk in ["journey_wellness", "journey_kbeauty", "journey_dashboard"]:
        for step in report.get(jk, {}).get("steps", []):
            total += 1
            if step.get("ok"):
                passed += 1
    for rh_key in ["security_headers_home", "security_headers_dashboard", "security_headers_v2"]:
        rh = report.get(rh_key, {})
        for k, v in rh.get("checks", {}).items():
            if isinstance(v, dict) and "ok" in v:
                total += 1
                if v["ok"]:
                    passed += 1
    for r in report.get("responsive", []):
        total += 1
        if r.get("ok"):
            passed += 1
    return {
        "total": total,
        "passed": passed,
        "pass_rate": (passed / total * 100) if total else 0,
    }


if __name__ == "__main__":
    main()

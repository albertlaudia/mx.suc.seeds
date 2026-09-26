// Sindo K-Beauty — curated K-beauty catalog (v1)
// 12 products across 6 routine-step categories
// All product names + descriptions sourced from public brand sites (cosrx.com, beautyofjoseon.com, laneige.com, anua.kr, skin1004.com, somebymi.com, innisfree.com, roundlab.co.kr, tirtir.global)
// Pricing model: SGD base + SGD 3/100g shipping + 10% markup (matches wellness storefront)
//
// Image strategy: placehold.co branded-color placeholders. Replace with real product CDN
// URLs once sources are confirmed (suggestion: brand official CDNs first, Unsplash fallback).

window.KBEAUTY = {
  products: [
    {
      id: "cosrx-snail-96",
      brand: "COSRX",
      title: "COSRX Advanced Snail 96 Mucin Power Essence",
      category: "Serums & Essences",
      priceSgd: 22.50,
      rating: 4.8,
      reviews: 28431,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%230066cc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ECOSRX%20Snail%2096%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "100 ml",
      shortDesc: "96% snail secretion filtrate. Repairs, hydrates, plumps. The global #1 essence.",
      longDesc: "A lightweight, essence-type formula with 96% snail secretion filtrate that delivers nourishment and hydration to damaged, dull skin. Helps repair skin while providing rich hydration and a healthy glow. Free from parabens, sulfates, and phthalates.",
      keyIngredients: "Snail Secretion Filtrate (96%), Sodium Hyaluronate, Panthenol, Allantoin, Arginine",
      url: "https://www.cosrx.com/products/advanced-snail-96-mucin-power-essence",
      weightGrams: 180,
      howToUse: "After cleansing and toning, apply 2–3 drops to face and neck. Pat gently until absorbed. Use AM and PM.",
      featured: true
    },
    {
      id: "boj-sun-relief",
      brand: "Beauty of Joseon",
      title: "Beauty of Joseon Relief Sun SPF50+ PA++++",
      category: "Sun Care",
      priceSgd: 18.00,
      rating: 4.9,
      reviews: 41208,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%231a3a6e%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EBOJ%20Relief%20Sun%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "50 ml",
      shortDesc: "Rice + probiotics. Lightweight, no white cast. The internet's favorite SPF.",
      longDesc: "A lightweight chemical sunscreen formulated with rice bran extract and grain ferment filtrate to soothe and brighten the skin while providing SPF50+ PA++++ protection. No white cast, non-greasy finish suitable for all skin tones.",
      keyIngredients: "Oryza Sativa (Rice) Bran Extract, Grain Ferment Filtrate, Chemical UV Filters",
      url: "https://www.beautyofjoseon.com/products/relief-sun",
      weightGrams: 90,
      howToUse: "Apply generously as the last step of morning skincare. Reapply every 2 hours during sun exposure.",
      featured: true
    },
    {
      id: "boj-glow-serum",
      brand: "Beauty of Joseon",
      title: "Beauty of Joseon Glow Deep Serum Rice + Alpha Arbutin",
      category: "Serums & Ampoules",
      priceSgd: 22.00,
      rating: 4.7,
      reviews: 18912,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%231a3a6e%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EBOJ%20Glow%20Serum%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "30 ml",
      shortDesc: "Rice bran + alpha arbutin. Brightens dark spots, evens tone. Gentle on sensitive skin.",
      longDesc: "A brightening serum formulated with 2% alpha arbutin and 30% rice bran water to fade hyperpigmentation and even out skin tone. Lightweight, fast-absorbing, suitable for daily AM/PM use.",
      keyIngredients: "Alpha Arbutin 2%, Oryza Sativa (Rice) Bran Water 30%, Niacinamide",
      url: "https://www.beautyofjoseon.com/products/glow-serum",
      weightGrams: 60,
      howToUse: "Apply 2–3 drops after toner. Pat gently. Use AM and PM. Always follow with SPF in the morning.",
      featured: true
    },
    {
      id: "laneige-lip-mask",
      brand: "Laneige",
      title: "Laneige Lip Sleeping Mask Berry",
      category: "Lip Care",
      priceSgd: 20.00,
      rating: 4.8,
      reviews: 52109,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%237ab8d8%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ELaneige%20Lip%20Mask%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "20 g",
      shortDesc: "Overnight berry mask. Wakes you up with soft, plump lips. The global #1 lip mask.",
      longDesc: "An overnight lip mask enriched with Berry Mix Complex™ and Moisture Wrap™ to deliver intense hydration and nourishment while you sleep. Wakes you up with visibly smoother, plumper, more radiant lips.",
      keyIngredients: "Berry Mix Complex (raspberry, strawberry, blueberry, cranberry), Hyaluronic Acid, Vitamin C",
      url: "https://www.laneige.com/int/en/products/lip-sleeping-mask.html",
      weightGrams: 60,
      howToUse: "Before bed, apply a generous layer to clean lips. Leave overnight. Wipe off excess in the morning.",
      featured: true
    },
    {
      id: "laneige-water-bank",
      brand: "Laneige",
      title: "Laneige Water Bank Blue Hyaluronic Cream",
      category: "Moisturizers & Creams",
      priceSgd: 38.00,
      rating: 4.7,
      reviews: 8204,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%237ab8d8%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ELaneige%20Water%20Bank%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "50 ml",
      shortDesc: "Blue Hyaluronic Acid. 24h deep hydration for dehydrated skin.",
      longDesc: "A rich yet lightweight moisturizer formulated with Blue Hyaluronic Acid — a next-generation HA with 2000× smaller particles for deeper dermal penetration. Provides 24-hour deep hydration and strengthens the moisture barrier.",
      keyIngredients: "Blue Hyaluronic Acid, Squalane, Ceramide NP, Panthenol",
      url: "https://www.laneige.com/int/en/products/water-bank-blue-hyaluronic-cream.html",
      weightGrams: 130,
      howToUse: "Apply a pearl-sized amount as the last step of evening routine. Use AM after serum and SPF.",
      featured: true
    },
    {
      id: "anua-heartleaf",
      brand: "Anua",
      title: "Anua Heartleaf 77% Soothing Toner",
      category: "Toner & Essence",
      priceSgd: 28.00,
      rating: 4.9,
      reviews: 38502,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%233a8a8a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EAnua%20Heartleaf%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "250 ml",
      shortDesc: "77% Houttuynia cordata extract. The 2025 viral toner for reactive, redness-prone skin.",
      longDesc: "A lightweight, watery toner formulated with 77% heartleaf (Houttuynia cordata) extract to soothe irritation, calm redness, and balance reactive skin. Layers easily under serums and actives.",
      keyIngredients: "Houttuynia Cordata Extract (77%), Centella Asiatica Extract, Panthenol, Sodium Hyaluronate",
      url: "https://www.anua.kr/products/heartleaf-77-soothing-toner",
      weightGrams: 290,
      howToUse: "After cleansing, apply to palms and pat into skin. Layer 2–3 times for extra hydration. Use AM and PM."
    },
    {
      id: "skin1004-centella",
      brand: "SKIN1004",
      title: "SKIN1004 Madagascar Centella Ampoule",
      category: "Serums & Ampoules",
      priceSgd: 25.00,
      rating: 4.8,
      reviews: 16720,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%234a9eb8%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESKIN1004%20Centella%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "100 ml",
      shortDesc: "Madagascar Centella Asiatica. Soothes, repairs, calms post-treatment skin.",
      longDesc: "A concentrated centella ampoule formulated with 100% Madagascar Centella Asiatica extract to soothe, repair, and strengthen compromised skin. Ideal post-laser, post-acne, or for chronic redness.",
      keyIngredients: "Centella Asiatica Extract (Madagascar), Madecassoside, Asiaticoside, Panthenol",
      url: "https://skin1004.com/products/madagascar-centella-ampoule",
      weightGrams: 180,
      howToUse: "Apply 2–3 drops after toner. Pat gently until absorbed. Use AM and PM."
    },
    {
      id: "somebymi-toner",
      brand: "Some By Mi",
      title: "Some By Mi AHA-BHA-PHA 30 Days Miracle Toner",
      category: "Toner & Essence",
      priceSgd: 21.00,
      rating: 4.7,
      reviews: 24108,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23d97a3a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESome%20By%20Mi%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "150 ml",
      shortDesc: "Triple-acid exfoliating toner. AHA + BHA + PHA. The clinic-favorite for acne-prone skin.",
      longDesc: "A multi-acid toner combining AHA (glycolic), BHA (salicylic), and PHA (gluconolactone) to gently exfoliate, unclog pores, and smooth texture without irritation. Tea tree and centella soothe inflammation.",
      keyIngredients: "AHA, BHA, PHA, Tea Tree Leaf Extract, Centella Asiatica Extract, Niacinamide",
      url: "https://www.somebymi.com/products/aha-bha-pha-30-days-miracle-toner",
      weightGrams: 210,
      howToUse: "After cleansing, soak a cotton pad and sweep across face. Avoid the eye area. Start every other night to build tolerance."
    },
    {
      id: "innisfree-green-tea",
      brand: "Innisfree",
      title: "Innisfree Green Tea Seed Hyaluronic Cream",
      category: "Moisturizers & Creams",
      priceSgd: 26.00,
      rating: 4.6,
      reviews: 12018,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%235a8a3a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EInnisfree%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "50 ml",
      shortDesc: "Jeju green tea + 5-HA complex. Light, breathable hydration for oily-combo skin.",
      longDesc: "A lightweight gel-cream formulated with Jeju green tea extract and a 5-Hyaluronic Acid complex to deliver oil-free hydration and strengthen the moisture barrier. Absorbs instantly — ideal under makeup.",
      keyIngredients: "Camellia Sinensis (Green Tea) Seed Extract, 5-Type Hyaluronic Acid Complex, Glycerin, Betaine",
      url: "https://www.innisfree.com/products/green-tea-seed-hyaluronic-cream",
      weightGrams: 130,
      howToUse: "Apply a pea-sized amount as the last step of AM/PM routine."
    },
    {
      id: "roundlab-1025",
      brand: "Round Lab",
      title: "Round Lab 1025 Dokdo Lotion",
      category: "Moisturizers & Creams",
      priceSgd: 26.00,
      rating: 4.8,
      reviews: 14709,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%237a8a8a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ERound%20Lab%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "200 ml",
      shortDesc: "Deep-sea water + 3-HA. Mineral-balanced hydration. Holds up in tropical humidity.",
      longDesc: "A mineral-balanced lotion formulated with Ulleungdo deep-sea water and three molecular weights of hyaluronic acid. Lightweight yet deeply hydrating — holds up in tropical climates without feeling sticky.",
      keyIngredients: "Deep Sea Water (Ulleungdo), 3-Type Hyaluronic Acid, Panthenol, Allantoin",
      url: "https://roundlab.co.kr/products/1025-dokdo-lotion",
      weightGrams: 250,
      howToUse: "After serum, apply a generous amount and pat gently. Use AM and PM."
    },
    {
      id: "cosrx-pimple-patch",
      brand: "COSRX",
      title: "COSRX Acne Pimple Master Patch",
      category: "Treatments & Patches",
      priceSgd: 8.50,
      rating: 4.8,
      reviews: 67401,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%230066cc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ECOSRX%20Patch%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "24 patches",
      shortDesc: "Hydrocolloid pimple patches. The original, still the best. Works overnight.",
      longDesc: "Medical-grade hydrocolloid patches that absorb pus and oil from active blemishes while protecting them from external contamination and picking. Works overnight — visibly flatter, less red by morning.",
      keyIngredients: "Hydrocolloid (medical-grade), Cellulose Gum",
      url: "https://www.cosrx.com/products/acne-pimple-master-patch",
      weightGrams: 25,
      howToUse: "Apply to clean, dry skin directly over the blemish. Leave 6–8 hours or overnight. Replace as needed."
    },
    {
      id: "tirtir-cushion",
      brand: "TIRTIR",
      title: "TIRTIR Mask Fit Red Cushion 18 g (Refill)",
      category: "Treatments & Patches",
      priceSgd: 32.00,
      rating: 4.6,
      reviews: 9420,
      image: "data:image/svg+xml,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23d97a8a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Oswald%2CInter%2Csans-serif%22%20font-size%3D%2270%22%20font-weight%3D%22600%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ETIRTIR%20Red%3C%2Ftext%3E%3C%2Fsvg%3E",
      size: "18 g refill",
      shortDesc: "Mask Fit technology. 24h semi-matte coverage. Doubles as event makeup.",
      longDesc: "A buildable, semi-matte cushion foundation with TIRTIR's Mask Fit technology that grips the skin for 24-hour wear without caking or transferring. Includes refill pan only — pair with original case.",
      keyIngredients: "Niacinamide, Hyaluronic Acid, Adenosine, Propolis Extract",
      url: "https://www.tirtir.global/products/mask-fit-red-cushion",
      weightGrams: 80,
      howToUse: "Press the included puff into the cushion, then pat onto skin. Build coverage where needed."
    }
  ],
  categories: [
    "Toner & Essence",
    "Serums & Ampoules",
    "Moisturizers & Creams",
    "Sun Care",
    "Treatments & Patches",
    "Lip Care"
  ],
  brands: [
    "COSRX",
    "Beauty of Joseon",
    "Laneige",
    "Anua",
    "SKIN1004",
    "Some By Mi",
    "Innisfree",
    "Round Lab",
    "TIRTIR"
  ],
  brandColors: {
    "COSRX": "#0066cc",
    "Beauty of Joseon": "#1a3a6e",
    "Laneige": "#7ab8d8",
    "Anua": "#3a8a8a",
    "SKIN1004": "#4a9eb8",
    "Some By Mi": "#d97a3a",
    "Innisfree": "#5a8a3a",
    "Round Lab": "#7a8a8a",
    "TIRTIR": "#d97a8a"
  },
  shipping: { ratePer100gSgd: 3, markupPct: 10 },

  // iHerb-style legal disclaimers — rendered into footer of every kbeauty page.
  // Keep wording identical across all kbeauty pages so legal review only needs one source.
  legal: {
    reviewDisclaimer: 'Product reviews reflect the views and opinions expressed by individual contributors and not those of Sindo K-Beauty. Sindo K-Beauty does not verify or endorse any claims made in these reviews. Customer ratings and review counts are aggregated from publicly available sources; individual results may vary.',
    fdaDisclaimer: 'Statements regarding cosmetic products have not been evaluated by the U.S. Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease or health condition. Reviews citing "results" or "efficacy" describe the personal experience of the reviewer, not a guarantee of performance.',
    trademarkNotice: 'All brand names (including COSRX, Beauty of Joseon, Laneige, Anua, SKIN1004, Some By Mi, Innisfree, Round Lab, TIRTIR) and product names referenced on this storefront are the property of their respective owners. Mention does not imply endorsement by or affiliation with the brand owners.'
  }
};

// Sort by category for stable rendering
window.KBEAUTY.products.sort((a, b) => a.category.localeCompare(b.category));

// Convenience accessors for future product/cart/checkout pages
window.KBEAUTY.findProduct = function(id) {
  return window.KBEAUTY.products.find(p => p.id === id);
};
window.KBEAUTY.productsByCategory = function() {
  const out = {};
  window.KBEAUTY.categories.forEach(c => {
    out[c] = window.KBEAUTY.products.filter(p => p.category === c);
  });
  return out;
};
window.KBEAUTY.shippingFee = function(product) {
  if (!product) return { shippingSgd: 0, subtotalSgd: 0, markupSgd: 0, totalSgd: 0 };
  const cents = Math.ceil((product.weightGrams || 100) / 100) * 100;
  const shippingSgd = (cents / 100) * window.KBEAUTY.shipping.ratePer100gSgd;
  const subtotalSgd = product.priceSgd + shippingSgd;
  const markupSgd = subtotalSgd * (window.KBEAUTY.shipping.markupPct / 100);
  return { shippingSgd, subtotalSgd, markupSgd, totalSgd: subtotalSgd + markupSgd };
};

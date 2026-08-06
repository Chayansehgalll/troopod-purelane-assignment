# Purelane Homepage — AI Product Engineer Assignment

## Context

This is my first Shopify theme build. I used an AI agent to write most of the Liquid, CSS, and JS, with me directing the architecture, verifying output against the design, configuring the theme editor, and debugging what broke. AI workflow notes below are honest about where the agent broke and where I caught it.

## Deliverables

- **Dev store:** https://purelane-dev-4qhpbu7t.myshopify.com
- **Storefront password:** ChayanSehgal
- **Repo:** https://github.com/Chayansehgalll/troopod-purelane-assignment

## Sections Shipped

All 5 required sections implemented as production-ready Shopify sections on stock Dawn:

1. **Hero** (`sections/purelane-hero.liquid`) — Merchant-editable headline + accent word, subheading, two CTAs, badge blocks (up to 3), product carousel with 1/2/3-product slides and animated price tags per slide.

2. **Shop / Product Grid** (`sections/purelane-shop.liquid`) — Pulls real Shopify collection. Handles sold out (disabled button + overlay), missing image (SVG placeholder), and long titles (2-line clamp). AJAX add-to-cart with live cart bubble update. Uses reusable `snippets/purelane-product-card.liquid`.

3. **Reviews Rail** (`sections/purelane-reviews.liquid`) — CSS-only infinite marquee, track duplicated for seamless loop, pauses on hover/focus. Merchant-editable review blocks (star rating, title, body, author, product context).

4. **Best Selling Combos** (`sections/purelane-combos.liquid`) — Horizontal snap-scroll rail of merchant-editable combo cards. Each combo takes up to 3 product pickers, benefit captions, savings pill, corner flag, price row, CTA. Featured combo gets amber border and primary teal CTA.

5. **Bundles Tiers** (`sections/purelane-bundles.liquid`) — Three-tier pricing grid with product image row (2–5 products per tier). Merchant-editable tag, quantity display, price + compare-at, per-unit line, benefits checklist, CTA. Middle tier styles as best value.

## What I Changed From the Prototype

The prototype was a single 148KB HTML file with hardcoded everything. I flagged and fixed:

- **Hardcoded prices and product data** — moved to Shopify products, product metafields, and section settings so a merchant can edit without a developer.
- **Duplicated base64 SVG bottle assets** — replaced with real product images via `image_url` filter and responsive `srcset`/`sizes`.
- **Water animation caustics** — dropped from production. Beautiful, but ~40KB of SVG filters with `feTurbulence` + `feDisplacementMap` — heavy on mobile paint. Replaced with clean gradient background. Would reintroduce as an optional section, gated behind desktop-only media query + `prefers-reduced-motion: no-preference`.
- **Class name collisions** — every class prefixed `pl-` to avoid Dawn conflicts and future theme merges.
- **Marquee driven by JS** — moved to pure CSS `@keyframes`; JS only handles pause-on-hover for accessibility.
- **Missing focus states** — added `:focus-visible` outlines throughout.
- **Reveal animations blocking initial render** — respected `prefers-reduced-motion` throughout.
- **Missing semantic markup** — added proper `<article>`, `<section>`, `role="list"`, `aria-labelledby`.

## Metafield Definitions

Product-level metafields under `custom` namespace:

- `badge_label` — Single line text (e.g. "Best seller", "Top rated", "New")
- `review_score` — Decimal
- `review_count` — Integer

## Architecture Decisions

- **All classes prefixed `pl-`** — zero risk of colliding with Dawn's own classes or future theme merges.
- **`window.Purelane.init(root)` public API** — animations re-bind on `shopify:section:load` so the theme editor stays functional as blocks are reordered.
- **Snippets for reusable pieces** — `purelane-product-card`, `purelane-combo-stack-item`, `purelane-badge-icon`, `purelane-hero-product` — DRY across sections.
- **CSS custom properties** — colors, spacing, radii scoped in `purelane-base.css` — palette changes in one place.
- **Light-theme (V2) palette as canonical** — the prototype shipped a dark and light version; light matched the brand.
- **Section-local CSS files** loaded via `stylesheet_tag` per section — no monolithic bundle; each section is self-contained and can be pulled independently.

## What I'd Do With More Time

- **Metaobjects for reviews, combos, and bundles** instead of blocks — currently 16-block/section limit; metaobjects would allow unlimited plus reuse across pages.
- **Native Shopify Bundles integration** — the combo/bundle CTAs currently link to `/collections/all`; a proper bundle picker page or Shopify Bundles API integration would be next.
- **Section Rendering API for progressive-enhanced add-to-cart** — the current version is JS-only.
- **Section groups** for hero/announcement zone so merchants can reorder the top of the page.
- **Reintroduce water animation** as an optional decorative section (desktop + no-reduced-motion + `content-visibility: auto`).
- **Real Shopify pricing on combos and bundles** — currently the prices are section settings; ideally these read from Shopify Bundles or a Selling Plan Group.

## AI Workflow Notes

This build was done end-to-end with an AI agent as the primary code writer. My role was direction, verification, debugging feedback, and merchant configuration.

**What worked well:**
- Agent generated full Liquid section files with valid schema on the first pass most of the time.
- CSS extraction from the 148KB prototype — agent isolated the light-theme palette and produced clean design tokens.
- Repetitive patterns (schema JSON, block presets, snippet parameters) — agent handled these faster than I could type.
- Debugging Shopify CLI errors — pasting the error output back gave me a fix within one round trip.

**Where the agent broke:**
- **Liquid syntax edge cases** — filters inside array brackets (`delays[forloop.index0 | modulo: 4]`) don't parse; had to extract to a separate `assign`. Agent produced this pattern multiple times before I caught it.
- **File placement** — agent sometimes generated a section file but I created it in `snippets/` by mistake. The error surfaced only on push. Would be nice to have a linter that flags "schema tag in snippet folder".
- **Product metafield access** — first pass used `product.metafields.custom.badge_label` directly instead of `.value`. Silent failure in production.
- **Missing files** — a few times I ran `shopify theme push` and got errors because I hadn't saved a file or hadn't created one referenced in `templates/index.json`.

**What I'd systematise for 20 more of these:**
- Pre-commit Liquid linter that catches the array/filter class of errors before push.
- A schema-JSON validator in the loop — Shopify's own linter catches it eventually but slow.
- A section scaffold command — every section starts with the same imports and wrapper structure.
- Better checklist for file placement: schema goes in `sections/`, everything else in `snippets/`.
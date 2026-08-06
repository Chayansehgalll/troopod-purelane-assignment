# Purelane Homepage — AI Product Engineer Assignment

## Deliverables

- **Dev store:** https://purelane-dev-4qhpbu7t.myshopify.com
- **Storefront password:** [paste from Step 10]
- **Repo:** [your GitHub repo URL]

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

**What I delegated to agents:**
- First-pass Liquid scaffolding — schema JSON is repetitive; agents nail this.
- CSS diff between the prototype's dark and light themes — agent extracted the deltas quickly.
- Base64 asset audit — identifying which SVGs were reused vs. one-off.
- Regex-based find-and-replace for class prefixing.

**Where agents failed me:**
- **Liquid array-with-filter syntax** — `delays[forloop.index0 | modulo: 4]` won't parse; Shopify requires the modulo in a separate `assign`. Agent produced this repeatedly. Fixed by hand.
- **File placement** — agent generated correct file content but sometimes wrote to `snippets/` when a section was needed. Always caught by the CLI push at least, but wasted round trips.
- **Product metafield access** — agents defaulted to `product.metafields.custom.foo` when the correct pattern for typed metafields is `.value` chained on. Would break silently.
- **Schema JSON validity** — occasional invalid preset structures. Shopify's linter caught them but slowed things.

**If I had to do 20 of these:**
- **Schema generator CLI** — pass a spec, get a valid section skeleton with block scaffolding, preset defaults, and typed metafield accessors.
- **Pre-commit Liquid linter** — catch the array/filter/modulo class of errors before push. Would save 10+ minutes per section.
- **Pattern library** — the four card variants (product / combo / tier / review) share ~60% structure. A single `pl-card` primitive with slots would remove hundreds of lines of duplicated CSS.
- **Scaffold section template** — every section starts with the same imports, wrapper, panel head, reveal setup. `sections/_scaffold.liquid` with placeholders would remove boilerplate.
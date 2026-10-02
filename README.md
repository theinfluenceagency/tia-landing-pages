# TIA landing pages

React builds for The Influence Agency's paid landing pages, mounted into thin Webflow shell pages.
Layout, copy and imagery come from the React component. The form stays a native Webflow form, so
submissions, email notifications, the thank-you redirect and Lead Legend keep working unchanged.

## How a page is put together

1. **Webflow shell page**, one per LP, noindex and out of the sitemap. It contains only:
   - an HTML Embed: `<div id="tia-lp-root" data-lp="seo"></div>`
   - a native Webflow Form Block wrapped in `<div id="tia-form-shell">`, parked off-screen by page CSS
   - footer code that loads the bundle:
     `<script type="module" src="https://cdn.jsdelivr.net/gh/theinfluenceagency/tia-landing-pages@<tag>/dist/seo-lp.js"></script>`
2. **React bundle** (`dist/seo-lp.js`, built here). On mount it renders the whole page, then moves the
   Webflow form into the hero card (`src/lib/webflowForm.jsx`). DOM listeners survive the move, so
   Webflow's own submit handler still runs. It also writes the tier options into the `Tier` select,
   because Webflow's Data API cannot set select options.

## Editing copy

All copy lives in `src/pages/<lp>/<Page>.jsx`, in plain arrays near the top of the component
(`achievements`, `tiers`, `pillars`, `cases`, `steps`, `faqs`, `verticals`). Edit, build, tag, push.

## Build and release

```bash
npm install
npm run build                       # writes dist/<page>-lp.js, dist/<page>-lp.css,
                                    # dist/<page>-lp.prerender.html and dist/assets/
git add -A && git commit -m "..."
git tag v0.1.1 && git push && git push --tags
```

jsDelivr serves a new tag within a few minutes at
`https://cdn.jsdelivr.net/gh/theinfluenceagency/tia-landing-pages@v0.1.1/dist/seo-lp.js`.
Update the tag in the Webflow page's footer code and publish the Webflow page.

Pin to a tag, never to `main`, so a half-finished commit can never reach a live ad destination.

### Pre-rendered markup (v0.3.0+)

`scripts/prerender.mjs` renders each page to static HTML so the Webflow shell carries the full
copy before JavaScript runs (Google Ads rated landing page experience BELOW_AVERAGE while the
shell was an empty div). Three things live in Webflow per page and must be refreshed on every
release that changes copy or styles:

1. `#tia-lp-root` carries the page's scope class (`tia-seo` / `tia-aeo`) and contains one HTML
   Embed whose code is `dist/<page>-lp.prerender.html` (under Webflow's 50,000-character embed cap;
   the script splits into several embeds if a page outgrows it).
2. The page head links `dist/<page>-lp.css` from the release tag and neutralises the embed wrapper:
   `#tia-lp-root > .w-embed { display: contents }`.
3. The footer script tag points at the same release tag.

The bundle's `createRoot(...).render()` replaces the pre-rendered children with the identical
React tree, so there is no visible change when it mounts.
Set `VITE_ASSET_BASE` in `.env.production` to the release URL so the team photo and any other
repo-hosted assets resolve.

### Offer, pricing dose and form (v0.4.0+)

Both pages lead with "Get my free SEO/AEO opportunities proposal" rather than "Request a quote".
The SEO page shows its price once in the hero ("Retainers from $3,500/month", matching the ad
headline) and the three-tier section sits after the FAQ, retitled to what each retainer includes.
The budget select on both forms is optional and defaults to "Not sure yet, show me what it would
take"; the message field is optional. No phone number and no instant booking by design: leads are
still qualified by a human before any call. Rationale and the competitor audit behind it live in
the project doc `claude/COMPETITOR_LP_RESEARCH.md`.

## Pages

| Entry | Component | Webflow page | Form name | Thank-you |
|---|---|---|---|---|
| `dist/seo-lp.js` | `src/pages/seo/SEOLandingPage.jsx` | `/seo-lp` | SEO LP Quote Form | `/seo-lp-thank-you` |
| `dist/aeo-lp.js` | `src/pages/aeo/AEOLandingPage.jsx` | `/aeo` | AEO LP Quote Form | `/aeo-thank-you` |

Each entry is built on its own (`npm run build` runs `LP=<name> vite build` per page) so every bundle is
self-contained: no shared chunk, so the two pages can be pinned to different tags.

The AEO page was ported from a static design export: everything below the hero is the export's HTML
(class names prefixed `aeo-`, assets in `public/assets/aeo/`) rendered with `dangerouslySetInnerHTML`,
and the header, hero and form are JSX. Its icons use the Font Awesome kit the Webflow site already loads.

## Adding a landing page

1. Copy `src/pages/seo` to `src/pages/<name>` and edit the component.
2. Add `src/entries/<name>-lp.jsx` that mounts it, and register it in `vite.config.js` under `input`.
3. Duplicate the SEO LP shell page in Webflow, set the new form name, ID and redirect, and point its
   footer script at `dist/<name>-lp.js`.

## Local preview

`preview/seo-lp.html` mimics the Webflow shell, including a Webflow-shaped form block.
`node preview/shoot.mjs` screenshots desktop and mobile and confirms the form was adopted.
CDN images do not load inside the sandboxed preview; they do on the real page.

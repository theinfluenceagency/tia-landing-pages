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
npm run build                       # writes dist/<page>-lp.js and dist/assets/
git add -A && git commit -m "..."
git tag v0.1.1 && git push && git push --tags
```

jsDelivr serves a new tag within a few minutes at
`https://cdn.jsdelivr.net/gh/theinfluenceagency/tia-landing-pages@v0.1.1/dist/seo-lp.js`.
Update the tag in the Webflow page's footer code and publish the Webflow page.

Pin to a tag, never to `main`, so a half-finished commit can never reach a live ad destination.
Set `VITE_ASSET_BASE` in `.env.production` to the release URL so the team photo and any other
repo-hosted assets resolve.

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

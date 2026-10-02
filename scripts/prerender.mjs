// Pre-renders each landing page component to static HTML so the Webflow shell page carries the
// full copy before JavaScript runs. The bundle then mounts over it (createRoot replaces the
// pre-rendered children with an identical tree, so there is no visible change).
//
// Why: Google Ads' landing page experience rated every non-brand keyword BELOW_AVERAGE while the
// shell's server HTML was an empty #tia-lp-root. Shipping the markup inline gives the ads crawler,
// Lighthouse and first paint the real page.
//
// Usage: node scripts/prerender.mjs            (both pages, production env)
//        node scripts/prerender.mjs seo-lp     (one page)
// Output: dist/<lp>.prerender.html  body markup without the <style> tag, split into chunks that fit
//                                   a Webflow HTML Embed (50,000 characters each)
//         dist/<lp>.css             the component's CSS, served from jsDelivr and linked in the
//                                   shell page head so the pre-rendered markup is styled at once
import { createServer } from "vite";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const PAGES = {
  "seo-lp": { module: "/src/pages/seo/SEOLandingPage.jsx", scope: "tia-seo" },
  "aeo-lp": { module: "/src/pages/aeo/AEOLandingPage.jsx", scope: "tia-aeo" },
};
const EMBED_LIMIT = 50000; // Webflow HTML Embed character cap
const only = process.argv[2];
const targets = only ? [only] : Object.keys(PAGES);

const server = await createServer({
  mode: "production",
  logLevel: "error",
  server: { middlewareMode: true },
  appType: "custom",
});

mkdirSync("dist", { recursive: true });
for (const lp of targets) {
  const { module, scope } = PAGES[lp];
  const mod = await server.ssrLoadModule(module);
  const Page = mod.default;
  let html = renderToStaticMarkup(React.createElement(Page));

  // Decorative inline SVG icons (Lucide, all aria-hidden) are dropped from the pre-render: they
  // are ~40% of the markup, carry no text, and React draws them the moment it mounts.
  html = html.replace(/<svg\b[\s\S]*?<\/svg>/g, "");

  // Lift the component's <style> block(s) out into a stylesheet.
  const styles = [];
  html = html.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => {
    styles.push(css);
    return "";
  });
  // @import is only valid at the top of a stylesheet; hoist any that sit mid-file.
  // renderToStaticMarkup HTML-escapes text inside <style>; undo that for a real stylesheet.
  const unescape = (t) => t.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  const imports = [];
  let css = unescape(styles.join("\n")).replace(/@import\s+url\([^)]*\)\s*;?/g, (m) => { imports.push(m.trim().replace(/;?$/, ";")); return ""; });
  css = [...new Set(imports)].join("\n") + "\n" + css;
  writeFileSync(`dist/${lp}.css`, css);

  // Split on top-level section boundaries so each Webflow embed holds whole sections.
  // The wrapper div (class tia-seo / tia-aeo) is dropped: the shell's #tia-lp-root carries that
  // class instead, and .w-embed wrappers are neutralised with display:contents in the page head.
  const open = html.match(/^<div class="([^"]*)">/);
  if (!open || !open[1].includes(scope)) throw new Error(`${lp}: unexpected root markup`);
  let inner = html.slice(open[0].length, html.lastIndexOf("</div>"));
  const parts = inner.split(/(?=<(?:section|header|footer|nav|div)\b)/).filter(Boolean);
  // Re-join tiny fragments: split points inside nested markup are harmless because every piece
  // is appended in order, but we only accept a split where the depth is zero.
  const chunks = [];
  let buf = "", depth = 0;
  const tagRe = /<\/?([a-zA-Z][\w-]*)[^>]*?(\/?)>/g;
  const VOID = new Set(["img", "br", "hr", "input", "meta", "link", "source", "path", "circle", "rect", "line", "polyline", "polygon", "use"]);
  for (const p of parts) {
    if (depth === 0 && buf && buf.length + p.length > EMBED_LIMIT) {
      chunks.push(buf);
      buf = "";
    }
    buf += p;
    let m;
    tagRe.lastIndex = 0;
    while ((m = tagRe.exec(p))) {
      const tag = m[1].toLowerCase();
      if (VOID.has(tag) || m[2] === "/") continue;
      depth += m[0].startsWith("</") ? -1 : 1;
    }
  }
  if (buf) chunks.push(buf);
  for (const c of chunks) {
    if (c.length > EMBED_LIMIT) throw new Error(`${lp}: a chunk is ${c.length} chars, over the embed limit`);
  }
  writeFileSync(`dist/${lp}.prerender.html`, chunks.join("\n<!--SPLIT-->\n"));
  console.log(`${lp}: ${chunks.length} embed chunk(s) ${chunks.map((c) => c.length).join(" + ")} chars, css ${css.length} chars, root class "${open[1]}"`);
}
await server.close();
process.exit(0);

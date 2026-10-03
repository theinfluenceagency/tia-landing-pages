import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const lp of ["seo-lp","aeo-lp"]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs=[]; p.on("pageerror", e=>errs.push(e.message));
  await p.goto(`http://localhost:4173/${lp}.html`, { waitUntil: "load" }); await p.waitForTimeout(1200);
  const info = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, video: !!document.querySelector('.aeo-t-video iframe'), collageH: document.querySelector('.aeo-collage, .collage')?.getBoundingClientRect().height, ctas: [...document.querySelectorAll('.hero-ctas .btn, .aeo-hero-cta .aeo-btn')].map(b=>Math.round(b.getBoundingClientRect().width)) }));
  console.log(lp, JSON.stringify(info), errs.join('|'));
  await p.screenshot({ path: `/tmp/mob/${lp}-desk.png` }); await p.close();
}
await b.close();

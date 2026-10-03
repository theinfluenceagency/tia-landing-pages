import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const lp of ["seo-lp","aeo-lp"]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs=[]; p.on("pageerror", e=>errs.push(e.message));
  await p.goto(`http://localhost:4173/${lp}.html`, { waitUntil: "load" });
  await p.waitForTimeout(1500);
  const info = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth; const out=[];
    document.querySelectorAll('#tia-lp-root *').forEach(el=>{ if (el.closest('.accred, .aeo-marquee, .wf-hp, .sticky-cta')) return; const r=el.getBoundingClientRect(); if(r.width && (r.right>vw+1 || r.left<-1)) out.push(el.tagName+'.'+String(el.className).slice(0,30)+' L'+Math.round(r.left)+' R'+Math.round(r.right)); });
    const btn=[...document.querySelectorAll('a.btn,.aeo-btn,button,input[type=submit]')].filter(b=>b.scrollWidth>b.clientWidth+1).map(b=>b.textContent||b.value);
    return {vw, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, overflow:[...new Set(out)].slice(0,12), btnOverflow: btn, video: !!document.querySelector('.aeo-t-video iframe')};
  });
  console.log(lp, JSON.stringify(info), errs.join('|'));
  await p.screenshot({ path: `/tmp/mob/${lp}-fold.png` });
  await p.screenshot({ path: `/tmp/mob/${lp}-full.png`, fullPage: true });
  await p.close();
}
await b.close();

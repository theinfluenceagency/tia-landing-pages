import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }); 
for (const [w,h,name] of [[1920,1080,'w1920'],[1440,900,'w1440']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto("http://localhost:4176/preview.html", { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const info = await p.evaluate(() => { const r=e=>{const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.width)]}; const hero=document.querySelector('.lp-hero'); const req=[...document.querySelectorAll('#wf-form-SEO-LP-Quote-Form input,#wf-form-SEO-LP-Quote-Form select,#wf-form-SEO-LP-Quote-Form textarea')].filter(e=>e.type!=='hidden'&&e.type!=='submit').map(e=>e.id+':'+e.required); return { vp: innerWidth, hero: r(hero), grid: r(document.querySelector('.hero-grid')), cols: [...document.querySelector('.hero-grid').children].map(r), labels:[...document.querySelectorAll('#wf-form-SEO-LP-Quote-Form label')].map(l=>l.textContent.trim()), req }; });
  console.log(name, JSON.stringify(info));
  await p.screenshot({ path: `preview/${name}-fold.png` });
}
await b.close();

import { chromium } from "playwright";
const [,, url, out, w=1440, h=900, full='0'] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url, { waitUntil: "load" });
await p.waitForTimeout(1500);
await p.screenshot({ path: out, fullPage: full==='1' });
await b.close();

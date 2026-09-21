import { chromium } from "playwright";
const url = process.argv[2] || "http://localhost:4173/preview.html";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(async () => chromium.launch());
const errors = [];
for (const [name, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp });
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${name} console: ${m.text()}`); });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const state = await page.evaluate(() => {
    const slot = document.querySelector(".wf-slot");
    const form = document.querySelector("#quote-form form");
    const sel = document.querySelector('select[name="Tier"]');
    return {
      slotState: slot && slot.dataset.state,
      formInsideCard: !!form,
      formId: form && form.id,
      tierOptions: sel ? [...sel.options].map((o) => o.textContent) : null,
      shellEmpty: !document.querySelector("#tia-form-shell form"),
      h1: document.querySelector(".tia-seo h1")?.textContent.trim(),
    };
  });
  console.log(name, JSON.stringify(state));
  await page.screenshot({ path: `preview/${name}-fold.png` });
  await page.screenshot({ path: `preview/${name}-full.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log("errors:", errors.length ? errors : "none");

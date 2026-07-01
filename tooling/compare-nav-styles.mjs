import { chromium } from "playwright";

function pick(styles) {
  return {
    fontFamily: styles.fontFamily,
    fontWeight: styles.fontWeight,
    fontSize: styles.fontSize,
    letterSpacing: styles.letterSpacing,
    textTransform: styles.textTransform,
  };
}

async function sample(page, url, navLabel) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const wordmark = await page.locator('a[aria-label="Grounded Art home"] span').first();
  const navLink = page.locator("header nav[aria-label='Main'] a, header nav[aria-label='Main'] button").filter({ hasText: new RegExp(navLabel, "i") }).first();

  const wordmarkStyles = pick(await wordmark.evaluate((el) => getComputedStyle(el)));
  const navStyles = pick(await navLink.evaluate((el) => getComputedStyle(el)));

  return { url, wordmarkStyles, navStyles };
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const landing = await sample(page, "http://localhost:3000/about", "Map");
  const app = await sample(page, "http://localhost:3001/profile", "Map");

  console.log(JSON.stringify({ landing, app }, null, 2));

  const keys = ["fontFamily", "fontWeight", "fontSize", "letterSpacing", "textTransform"];
  const diffs = [];
  for (const key of keys) {
    if (landing.wordmarkStyles[key] !== app.wordmarkStyles[key]) {
      diffs.push({ target: "wordmark", key, landing: landing.wordmarkStyles[key], app: app.wordmarkStyles[key] });
    }
    if (landing.navStyles[key] !== app.navStyles[key]) {
      diffs.push({ target: "nav", key, landing: landing.navStyles[key], app: app.navStyles[key] });
    }
  }

  console.log("\nDIFFS:", JSON.stringify(diffs, null, 2));
  await browser.close();
})();

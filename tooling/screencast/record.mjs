// Records a showcase screencast of the Grounded Art web app by driving the real running app with
// Playwright. It walks the feed and its temporal views and toggles light and dark, saving a video
// to ./recordings. The full stack (Postgres, API, web) must be running first; see README.md.

import { mkdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3001/app").replace(/\/$/, "");
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "recordings");
const VIEWPORT = { width: 1366, height: 900 };

// Beat lengths, in milliseconds. Override DEMO_SPEED to slow down or speed up the whole walk.
const SPEED = Number(process.env.DEMO_SPEED ?? 1);
const beat = (ms) => Math.round(ms * SPEED);

// Shows a small caption pinned to the viewport so the showcase explains each step.
async function caption(page, text) {
  await page.evaluate((label) => {
    let el = document.getElementById("__demo_caption");
    if (!el) {
      el = document.createElement("div");
      el.id = "__demo_caption";
      Object.assign(el.style, {
        position: "fixed",
        left: "50%",
        bottom: "36px",
        transform: "translateX(-50%)",
        zIndex: "999999",
        padding: "11px 20px",
        borderRadius: "9999px",
        background: "rgba(22,19,14,0.92)",
        color: "#f4efe2",
        font: "500 15px/1.2 system-ui, -apple-system, sans-serif",
        boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
        pointerEvents: "none",
      });
      document.body.appendChild(el);
    }
    el.textContent = label;
  }, text);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: OUT_DIR, size: VIEWPORT },
  });
  const page = await context.newPage();
  const video = page.video();

  // Closing the context flushes a video even when the walk never ran, so discard it on failure
  // rather than leaving an empty clip behind.
  async function fail(message) {
    console.error(`\n${message}\n`);
    await context.close();
    if (video) rmSync(await video.path(), { force: true });
    await browser.close();
    process.exit(1);
  }

  let response;
  try {
    response = await page.goto(`${BASE_URL}/feed`, { waitUntil: "networkidle", timeout: 15000 });
  } catch (error) {
    await fail(
      `Could not reach ${BASE_URL}/feed.\n` +
        `Start the stack first (Postgres, API, and web). See tooling/screencast/README.md.\n` +
        error.message,
    );
  }
  if (!response || !response.ok()) {
    await fail(`${BASE_URL}/feed returned ${response ? response.status() : "no response"}.`);
  }

  await caption(page, "Grounded Art — the feed, kept current");
  await page.waitForTimeout(beat(2800));

  await caption(page, "What is on this weekend");
  await page.click('a[href$="/feed?view=this_weekend"]');
  await page.waitForTimeout(beat(2600));

  await caption(page, "Opening this week");
  await page.click('a[href$="/feed?view=opening_this_week"]');
  await page.waitForTimeout(beat(2600));

  await caption(page, "Closing soon");
  await page.click('a[href$="/feed?view=closing_soon"]');
  await page.waitForTimeout(beat(2600));

  await caption(page, "Light and dark");
  await page.click("nav button");
  await page.waitForTimeout(beat(2600));

  await caption(page, "Built for Cape Town's art scene");
  await page.waitForTimeout(beat(2000));

  await context.close();
  await browser.close();

  if (video) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dest = join(OUT_DIR, `grounded-art-${stamp}.webm`);
    renameSync(await video.path(), dest);
    console.log(`\nSaved screencast to ${dest}\n`);
  }
}

main();

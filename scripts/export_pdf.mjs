import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { preview } from "vite";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const outputDir = resolve(projectRoot, "output", "pdf");
const outputPath = resolve(outputDir, "low-emission-wheat-offtake-report.pdf");

const browserCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const executablePath = browserCandidates.find((candidate) => existsSync(candidate));
if (!executablePath) {
  throw new Error("Chrome or Edge was not found. Set CHROME_PATH to a Chromium executable.");
}

await mkdir(outputDir, { recursive: true });

const previewServer = await preview({
  root: projectRoot,
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
});

const browser = await chromium.launch({ executablePath, headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4173/?pdf=1", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForSelector(".wh-root", { state: "visible", timeout: 30_000 });

  // Wait for every photograph/logo to decode. The map and ticker are not
  // mounted in PDF mode, so there are no WebGL/network animations to settle.
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
    null,
    { timeout: 120_000 },
  );

  // A PDF cannot play the Farmer Voices videos. Seek each one to an actual
  // frame so Chromium prints a representative still instead of a black box.
  await page.evaluate(async () => {
    const waitFor = (target, event, timeout = 20_000) => new Promise((resolveWait) => {
      if (event === "loadeddata" && target.readyState >= 2) return resolveWait();
      const timer = setTimeout(resolveWait, timeout);
      target.addEventListener(event, () => {
        clearTimeout(timer);
        resolveWait();
      }, { once: true });
    });

    for (const video of document.querySelectorAll("video")) {
      video.muted = true;
      video.preload = "auto";
      video.load();
      await waitFor(video, "loadeddata");
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.min(2, Math.max(0.1, video.duration * 0.12));
        await waitFor(video, "seeked", 10_000);
      }
      video.pause();
    }
  });

  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await Promise.race([document.fonts.ready, new Promise((resolveWait) => setTimeout(resolveWait, 10_000))]);
    }
    window.dispatchEvent(new Event("beforeprint"));
  });

  await page.waitForTimeout(1_000);

  await page.pdf({
    path: outputPath,
    format: "A4",
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: '<div style="width:100%;padding:0 8mm 2mm;text-align:right;font:7px Arial,sans-serif;color:#7A6A54"><span class="pageNumber"></span></div>',
    tagged: true,
    outline: true,
  });

  if (pageErrors.length) {
    console.warn(`PDF created with ${pageErrors.length} page error(s):\n${pageErrors.join("\n")}`);
  }
  console.log(outputPath);
} finally {
  await browser.close();
  await new Promise((resolveClose) => previewServer.httpServer.close(resolveClose));
}

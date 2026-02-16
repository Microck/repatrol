import path from "node:path";

import { chromium } from "playwright";

import { startDemoServer } from "../src/server.js";
import { ensureDir } from "../src/fs-utils.js";

function parseHeadless(argv: string[]): boolean {
  return argv.includes("--headless");
}

async function main(): Promise<number> {
  const headless = parseHeadless(process.argv.slice(2));
  const gameDir = path.resolve("demo/buggy_web_game");
  const server = await startDemoServer(gameDir, "127.0.0.1", 0);

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    await page.goto(server.baseUrl, { waitUntil: "domcontentloaded" });
    await page.locator("#startBtn").click();
    await page.locator("#boostBtn").click();

    const outDir = path.resolve("artifacts/screenshots");
    await ensureDir(outDir);
    const outPath = path.join(outDir, `smoke-${Date.now()}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`OK: wrote screenshot: ${outPath}`);
    return 0;
  } catch (error) {
    console.error(`ERROR: smoke run failed: ${String(error)}`);
    return 2;
  } finally {
    await context.close();
    await browser.close();
    await server.close();
  }
}

void main().then((code) => {
  process.exit(code);
});

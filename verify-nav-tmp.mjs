import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const target = process.argv[2];
const url = pathToFileURL(resolve(target)).href;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(url);
await page.waitForTimeout(500);

const active = await page.evaluate(() => {
  const links = [...document.querySelectorAll('#site-header [data-nav-page]')];
  return links.map((l) => ({
    page: l.dataset.navPage,
    text: l.textContent.trim(),
    active: l.hasAttribute('aria-current'),
  }));
});

console.log(target);
console.table(active);

await page.screenshot({ path: process.argv[3] || 'nav-check.png', clip: { x: 0, y: 0, width: 1400, height: 260 } });
await browser.close();

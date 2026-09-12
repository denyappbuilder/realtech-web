// Usage: PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/verify-mobile-images.mjs http://localhost:4321
// Optional browser tooling stays outside application dependencies.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.argv[2] || 'http://localhost:4321';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [width, dpr] of [[390, 1.75], [412, 1.75], [430, 3], [1280, 1.75]]) {
    const context = await browser.newContext({ viewport: { width, height: 823 }, deviceScaleFactor: dpr, isMobile: width < 900 });
    const page = await context.newPage();
    for (const [path, selector] of [['/', '.hero-visual img'], ['/clanky/claude-code-tydenni-limit-zari/', '.article-hero img']]) {
      await page.goto(origin + path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const result = await page.locator(selector).evaluate(img => {
        const source = img.closest('picture')?.querySelector('source[type="image/webp"]');
        const preload = document.querySelector('link[rel="preload"][as="image"]');
        return { currentSrc: img.currentSrc, width: img.getBoundingClientRect().width,
          sizes: source?.sizes || img.sizes, preloadSizes: preload?.imageSizes,
          complete: img.complete && img.naturalWidth > 0,
          requests: performance.getEntriesByType('resource').filter(r => r.name.includes('/images/clanky/claude-code-tydenni-limit-zari')).map(r => r.name) };
      });
      console.log(JSON.stringify({ viewportWidth: width, dpr, path, ...result }));
      assert.ok(result.complete, 'Hero must load');
      if (width <= 412) {
        assert.match(result.currentSrc, /-640\.webp$/, 'Mobile slot must select the existing 640w WebP, not the 1280w original');
      } else {
        assert.doesNotMatch(result.currentSrc, /-640\.webp$/, 'Keep full resolution on desktop and high-DPR phones');
      }
      assert.equal(result.sizes, result.preloadSizes, 'Preload and picture must select the same candidate');
      assert.equal(new Set(result.requests).size, 1, 'Do not fetch both small and full hero');
    }
    await context.close();
  }
} finally { await browser.close(); }

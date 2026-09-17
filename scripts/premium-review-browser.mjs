// Built-preview regression: PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs node scripts/premium-review-browser.mjs URL [results.json]
import fs from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const base = process.argv[2];
if (!base) throw new Error('Pass a built-preview URL');
const rows = [];
const identity = value => value === 'none' || value === 'matrix(1, 0, 0, 1, 0, 0)';
async function hoverContrast(page, selector, theme, key) {
  const el = page.locator(selector).first();
  await el.hover();
  await page.waitForTimeout(300);
  const result = await el.evaluate(e => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    function rgba(color) {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data];
    }
    const ancestors = [];
    for (let n = e; n; n = n.parentElement) ancestors.unshift(n);
    let bg = [255, 255, 255];
    for (const n of ancestors) {
      const v = rgba(getComputedStyle(n).backgroundColor), a = v[3] / 255;
      bg = bg.map((x, i) => v[i] * a + x * (1 - a));
    }
    const style = getComputedStyle(e), fg = rgba(style.color);
    const lum = rgb => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
    const l1 = lum(fg.slice(0, 3)), l2 = lum(bg);
    return { contrast: (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05), transparent: rgba(style.backgroundColor)[3] === 0, underline: style.textDecorationLine.includes('underline') };
  });
  rows.push({ theme, key, ...result, passed: result.contrast >= 4.5 && (!key.includes('hero') || (result.transparent && result.underline)) });
}
try {
  for (const theme of ['light', 'dark', 'system-dark']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: theme === 'light' ? 'light' : 'dark' });
    if (theme !== 'system-dark') await page.addInitScript(t => localStorage.setItem('theme', t), theme);
    await page.goto(new URL('/', base).href, { waitUntil: 'networkidle' });
    for (const [selector, key] of [['.hero-actions .btn-primary', 'hero'], ['.nl-note a:first-of-type', 'privacy'], ['.nl-note a:last-of-type', 'youtube']]) await hoverContrast(page, selector, theme, key);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // The first card is a deliberately hidden mobile rail on desktop.
    for (const [selector, image, key] of [['.card:visible', '.card-thumb img', 'reduced-card'], ['.video-card:visible', '.vc-thumb img', 'reduced-video']]) {
      const card = page.locator(selector).first();
      await card.hover();
      const transform = await card.locator(image).first().evaluate(e => getComputedStyle(e).transform);
      rows.push({ theme, key, transform, passed: identity(transform) });
    }
    const hero = page.locator('.hero-actions .btn-primary').first();
    await hero.hover();
    const arrow = await hero.evaluate(e => getComputedStyle(e, '::after').transform);
    rows.push({ theme, key: 'reduced-arrow', transform: arrow, passed: identity(arrow) });
    const nav = page.locator('nav.main a').first();
    await nav.hover();
    const underline = await nav.evaluate(e => { const s = getComputedStyle(e, '::after'); return { transform: s.transform, content: s.content, transition: s.transitionDuration }; });
    rows.push({ theme, key: 'reduced-nav-underline', ...underline, passed: underline.transform === 'matrix(1, 0, 0, 1, 0, 0)' && underline.content !== 'none' && underline.transition === '0s' });
    await page.goto(new URL('/o-nas/', base).href, { waitUntil: 'networkidle' });
    await hoverContrast(page, '.hero-actions .btn-primary', theme, 'about-hero');
    await page.close();
  }
  for (const width of [390, 1280, 1440]) for (const dpr of [1, 2]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: dpr });
    await page.goto(new URL('/', base).href, { waitUntil: 'networkidle' });
    const result = await page.locator('.hero-visual img').evaluate(async e => {
      const asset = new Image(); asset.src = e.currentSrc; await asset.decode();
      const box = e.getBoundingClientRect();
      const source = e.closest('picture').querySelector('source[srcset]');
      const preload = document.querySelector('link[rel="preload"][as="image"]');
      return { assetWidth: asset.naturalWidth, effectiveDensity: Math.min(asset.naturalWidth / box.width, asset.naturalHeight / box.height), sharedPreload: source.sizes === preload.imageSizes && source.srcset === preload.imageSrcset };
    });
    rows.push({ key: 'cover-density', width, dpr, ...result, passed: result.sharedPreload && result.effectiveDensity >= 1 && (width > 900 ? result.assetWidth === 1280 : result.assetWidth === (dpr === 2 ? 960 : 640)) });
    await page.close();
  }
} catch (error) {
  rows.push({ passed: false, error: error.message });
} finally {
  await browser.close();
  const output = JSON.stringify(rows, null, 2);
  if (process.argv[3]) fs.writeFileSync(process.argv[3], output);
  console.log(output);
  process.exitCode = rows.length !== 30 || rows.some(row => !row.passed) ? 1 : 0;
}

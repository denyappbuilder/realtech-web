// Kolo 20: LCP první řady, srcset karet, h1→h2 hierarchie, logo TECH dark.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(koren, 'src/styles/global.css'), 'utf8');
const karta = readFileSync(join(koren, 'src/components/ArticleCard.astro'), 'utf8');
const nahled = readFileSync(join(koren, 'src/lib/karta-nahled.js'), 'utf8');
const hub = readFileSync(join(koren, 'src/pages/temata/index.astro'), 'utf8');

function kontrast(fg, bg) {
  const lum = (hex) => {
    const h = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => {
      const c = parseInt(h.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

test('kolo 20: nahledKarty umí thumbWebpSrcset 640w+1280w', () => {
  assert.match(nahled, /thumbWebpSrcset/);
  assert.match(nahled, /640w, \$\{fullWebp\} 1280w/);
});

test('kolo 20: ArticleCard má eager + titleTag a srcset sizes', () => {
  assert.match(karta, /eager\?:\s*boolean/);
  assert.match(karta, /titleTag\?:\s*'h2' \| 'h3'/);
  // Kolo 21: konstanta se přestěhovala do karta-nahled.js (KARTA_SIZES),
  // aby ji sdílel i imagesizes preloadu na výpisech.
  assert.match(karta, /KARTA_SIZES/);
  assert.match(karta, /thumbWebpSrcset/);
});

test('kolo 20: hub /temata/ má h2 a srcset sizes', () => {
  assert.match(hub, /<h2><a href=\{\`\/temata\/\$\{t\.slug\}\/\`\}>/);
  assert.match(hub, /thumbWebpSrcset/);
  assert.match(hub, /loading=\{i < 3 \? 'eager' : 'lazy'\}/);
});

test('kolo 20: logo TECH v darku bere --signal-dark (≥4,5:1)', () => {
  assert.match(
    css,
    /:root\[data-theme="dark"\] \.logo \.tech[\s\S]*?color:\s*var\(--signal-dark\)/,
  );
  assert.ok(kontrast('#F0554F', '#171B21') >= 4.5);
});

test('kolo 20: card-body styly platí i pro h2', () => {
  assert.match(css, /\.card-body h2,\s*\.card-body h3\s*\{/);
  assert.match(css, /\.card-body h2 a::after,\s*\.card-body h3 a::after/);
});

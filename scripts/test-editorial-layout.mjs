import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('archive image and preload share compact-mobile slot sizes without changing other card contexts', () => {
 const source=read('src/components/ArticleArchivePage.astro');
 assert.ok(source.includes('KARTA_SIZES_ARCHIVE'), 'archive uses layout-specific sizes');
 assert.match(source,/sizes: KARTA_SIZES_ARCHIVE/);
 assert.match(source,/sizes=\{KARTA_SIZES_ARCHIVE\}/);
 assert.match(read('src/lib/karta-nahled.js'),/export const KARTA_SIZES_ARCHIVE = '\(max-width: 580px\) 96px,/);
});
test('privacy newsletter heading does not collide with the site-wide signup landmark', () => {
 const source=read('src/pages/gdpr.astro');
 assert.ok(!source.includes('id="newsletter"'),'privacy heading must have a unique id');
 assert.ok(source.includes('id="newsletter-udaje"'));

 assert.ok(read('src/layouts/Base.astro').includes('id="newsletter"'));
});

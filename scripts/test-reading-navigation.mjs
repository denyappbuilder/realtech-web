import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
const helper = new URL('../src/lib/reading-navigation.js', import.meta.url);
test('reading progress measures only article text, not media or recommendations', async () => {
  const { articleProgress } = await import(helper);
  assert.equal(typeof articleProgress, 'function');
  assert.equal(articleProgress({ top: 1000, bottom: 4000 }, 800, 100), 0);
  assert.equal(articleProgress({ top: 100, bottom: 3100 }, 800, 100), 0);
  assert.equal(articleProgress({ top: -1050, bottom: 1950 }, 800, 100), 50);
  assert.equal(articleProgress({ top: -2200, bottom: 800 }, 800, 100), 100);
  assert.equal(articleProgress({ top: -4200, bottom: -1200 }, 800, 100), 100);
  assert.equal(articleProgress({ top: 100, bottom: 400 }, 800, 100), 100);
  assert.equal(articleProgress({ top: 200, bottom: 500 }, 800, 100), 0);
});
test('current section follows reading order, including backward scroll and the preface', async () => {
  assert.ok(existsSync(helper), 'reading navigation is implemented');
  const { currentSection } = await import(helper);
  assert.equal(currentSection([{id:'a',top:240}, {id:'b',top:480}],120), null);
  assert.equal(currentSection([{id:'a',top:40}, {id:'b',top:121}],120), 'a');
  assert.equal(currentSection([{id:'a',top:-30}, {id:'b',top:120}],120), 'b');
  assert.equal(currentSection([],120), null);
});

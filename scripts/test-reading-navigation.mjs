import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
const helper = new URL('../src/lib/reading-navigation.js', import.meta.url);
test('current section follows reading order, including backward scroll and the preface', async () => {
  assert.ok(existsSync(helper), 'reading navigation is implemented');
  const { currentSection } = await import(helper);
  assert.equal(currentSection([{id:'a',top:240}, {id:'b',top:480}],120), null);
  assert.equal(currentSection([{id:'a',top:40}, {id:'b',top:121}],120), 'a');
  assert.equal(currentSection([{id:'a',top:-30}, {id:'b',top:120}],120), 'b');
  assert.equal(currentSection([],120), null);
});

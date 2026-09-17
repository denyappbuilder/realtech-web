import test from 'node:test';
import assert from 'node:assert/strict';
import { popisProVyhledavace } from '../src/lib/popis-pro-vyhledavace.js';

const first = 'Podrobný přehled vysvětluje všechny důležité změny pro české uživatele.';
const tail = ' Další velmi dlouhá věta podrobně vysvětluje všechny technické souvislosti a praktické dopady pro uživatele zařízení.'.repeat(2);

test('č. is an abbreviation, not a sentence boundary', () => {
  const partial = `${first} Viz technický dokument č.`;
  assert.equal(popisProVyhledavace(`${partial} 42 s podrobnými informacemi.${tail}`, partial.length), first);
});

for (const ending of ['2026', '3.8', '42']) {
  test(`sentence ending in ${ending} remains a complete sentence`, () => {
    const sentence = `Podrobný přehled vysvětluje všechny důležité změny vydání ${ending}.`;
    assert.equal(popisProVyhledavace(sentence + tail, sentence.length + 20), sentence);
  });
}

for (const continuation of ['17. září 2026', '17. 9. 2026', 'vs. VRAM', 'např. paměť', 'č. 42']) {
  test(`preserves internal ${continuation}`, () => {
    const sentence = `Podrobný přehled vysvětluje všechny důležité změny pro ${continuation} a jejich praktické dopady.`;
    assert.equal(popisProVyhledavace(sentence + tail, sentence.length), sentence);
  });
}

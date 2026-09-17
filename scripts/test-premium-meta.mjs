import test from 'node:test';
import assert from 'node:assert/strict';
import { popisProVyhledavace } from '../src/lib/popis-pro-vyhledavace.js';

test('premium: RTX metadata stops at a real sentence, not vs.', () => {
  const first = 'NVIDIA na IFA 2026 potvrdila RTX Spark PC s Windows na říjen (Lenovo Yoga Pro 9n, Yoga 9n, Acer).';
  const text = `${first} Sjednocená paměť vs. VRAM, agenti, hry a kontrolní seznam před koupí.`;
  assert.equal(popisProVyhledavace(text), first);
});

test('premium: Czech abbreviations and spaced dates do not become sentence ends', () => {
  for (const fragment of ['např. NVIDIA', 'tj. paměť', 'tzv. agenti', '17. září', '17. 9. 2026']) {
    const first = 'Tento přehled vysvětluje, co nová technologie znamená pro české čtenáře.';
    assert.equal(popisProVyhledavace(`${first} Další část popisuje ${fragment} a praktické možnosti použití pro všechny zájemce o tuto technologii.`, 115), first);
  }
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { seoTitulek } from '../src/lib/seo-titulek.js';

test('prázdný a nullový nadpis vrací značku', () => {
  assert.equal(seoTitulek(''), 'REALTECH CZ');
  assert.equal(seoTitulek('  \n\t  ', { znacka: 'Vlastní značka' }), 'Vlastní značka');
  assert.equal(seoTitulek(null, { znacka: 'Vlastní značka' }), 'Vlastní značka');
  assert.equal(seoTitulek(undefined, { znacka: '' }), '');
});

test('zachovatCely vrací pouze oříznutý celý nadpis a ignoruje limit i značku', () => {
  assert.equal(
    seoTitulek('  Celý redakční titulek — včetně vysvětlení  ', {
      zachovatCely: true,
      limit: 12,
      znacka: 'Jiná značka',
    }),
    'Celý redakční titulek — včetně vysvětlení',
  );
});

test('em dash a en dash s okolními mezerami oddělují vysvětlení', () => {
  assert.equal(
    seoTitulek('Dostatečně dlouhý háček — vysvětlení'),
    'Dostatečně dlouhý háček — REALTECH CZ',
  );
  assert.equal(
    seoTitulek('Dostatečně dlouhý háček – vysvětlení'),
    'Dostatečně dlouhý háček — REALTECH CZ',
  );
});

test('spojovník není oddělovač a krátký háček před pomlčkou nezahodí zbytek', () => {
  assert.equal(
    seoTitulek('Dostatečně dlouhý háček - vysvětlení'),
    'Dostatečně dlouhý háček - vysvětlení — REALTECH CZ',
  );
  assert.equal(
    seoTitulek('Krátký háček — podstatné vysvětlení'),
    'Krátký háček — podstatné vysvětlení — REALTECH CZ',
  );
});

test('přesná hranice limitu přijme titulek se značkou', () => {
  assert.equal(
    seoTitulek('Alpha beta', { limit: 18, znacka: 'BRAND' }),
    'Alpha beta — BRAND',
  );
});

test('přesná hranice limitu přijme jádro bez značky', () => {
  assert.equal(
    seoTitulek('Alpha beta', { limit: 10, znacka: 'BRAND' }),
    'Alpha beta',
  );
});

test('dlouhý titulek se zkrátí na vhodné hranici slova', () => {
  assert.equal(
    seoTitulek('Alpha beta gamma delta epsilon zeta', { limit: 25, znacka: 'B' }),
    'Alpha beta gamma delta…',
  );
});

test('bez vhodné mezery se použije celý řez před výpustkou', () => {
  assert.equal(
    seoTitulek('abcdefghij klmnopqrstuvwxyz', { limit: 20, znacka: 'B' }),
    'abcdefghij klmnopqr…',
  );
});

test('koncová interpunkce se před výpustkou odstraní', () => {
  for (const interpunkce of ['.', ',', ';', ':', '–', '—', '-']) {
    assert.equal(
      seoTitulek(`Alpha beta gamma${interpunkce} delta epsilon`, {
        limit: 23,
        znacka: 'B',
      }),
      'Alpha beta gamma…',
      interpunkce,
    );
  }
});

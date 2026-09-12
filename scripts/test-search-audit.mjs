import assert from 'node:assert/strict';
import test from 'node:test';
import { nactiModal } from './test-search-modal-loader.mjs';

const article = { s: 'astra', t: 'Astra', d: '', k: 'AI', b: '', p: '2026-09-11' };

for (const invalid of [{ error: 'temporary failure' }, [null], [{ ...article, t: null }]]) {
  test(`malformed index is not cached and can be retried: ${JSON.stringify(invalid)}`, async () => {
    let attempts = 0;
    const modal = nactiModal({ fetch: async () => ({
      ok: true, json: async () => ++attempts === 1 ? invalid : [article],
    }) });
    assert.deepEqual(Array.from(await modal.loadIndex()), []);
    assert.equal(modal.dejIndex(), null);
    assert.equal(modal.dejIndexSelhal(), true);
    await modal.loadIndex();
    assert.equal(modal.search('Astra')[0].s, 'astra');
    assert.equal(attempts, 2);
  });
}

test('Tab from close wraps to input even when result links match a[href]', async () => {
  const modal = nactiModal({ hledatelne: [article] });
  await modal.open(modal.spoustec);
  modal.input.tabIndex = 0;
  modal.odkaz.tabIndex = 0; // the last sequential control (close button)
  const option = { tabIndex: -1 };
  modal.overlay.querySelectorAll = () => [modal.input, modal.odkaz, option];
  modal.odkaz.focus();
  let prevented = false;
  modal.dokument.dispatch('keydown', {
    key: 'Tab', preventDefault() { prevented = true; },
  });
  assert.equal(prevented, true, 'native Tab would leave the dialog');
  assert.equal(modal.dokument.activeElement, modal.input);
});

test('reopening search clears the previous keyboard navigation target', async () => {
  const modal = nactiModal({ hledatelne: [article] });
  await modal.open(modal.spoustec);
  modal.input.value = 'Astra';
  modal.input.dispatch('input');
  assert.equal(modal.dejCurrent().length, 1);
  modal.close();
  void modal.open(modal.spoustec);
  assert.equal(modal.input.value, '');
  assert.equal(modal.results.hidden, true);
  assert.equal(modal.dejCurrent().length, 0);
});

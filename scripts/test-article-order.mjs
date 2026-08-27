import assert from 'node:assert/strict';
import test from 'node:test';
import { compareArticlesByDateDescThenId } from '../src/lib/article-order.js';

function entry(id, date) {
  return { id, data: { date: new Date(date) } };
}

test('pozdější timestamp téhož dne předběhne date-only i abecedně dřívější slug', () => {
  const nscale = entry('anthropic-nscale-45-miliard', '2026-08-27T00:00:00.000Z');
  const hugging = entry('nvidia-hugging-face-12-9-miliard', '2026-08-27T13:18:00.000Z');
  const drivejsi = entry('aaa-drivejsi-cas', '2026-08-27T08:00:00.000Z');

  const serazene = [nscale, hugging, drivejsi].sort(compareArticlesByDateDescThenId);
  assert.deepEqual(serazene.map(({ id }) => id), [
    'nvidia-hugging-face-12-9-miliard',
    'aaa-drivejsi-cas',
    'anthropic-nscale-45-miliard',
  ]);
  assert.ok(
    compareArticlesByDateDescThenId(hugging, nscale) < 0,
    'Hugging Face musí být před Nscale, přestože nvidia- je až za anthropic-',
  );
});

test('dva date-only stejného dne: ID je jen nouzový tie-break, ne řazení podle času', () => {
  const a = entry('aaa', '2026-08-20T00:00:00.000Z');
  const z = entry('zzz', '2026-08-20T00:00:00.000Z');
  assert.ok(compareArticlesByDateDescThenId(a, z) < 0);
  assert.equal(a.data.date.valueOf(), z.data.date.valueOf());
});

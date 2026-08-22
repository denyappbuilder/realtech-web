import assert from 'node:assert/strict';
import test from 'node:test';

import { loadLatest } from './test-404-frontmatter-loader.mjs';

function article(id, date, draft = false) {
  return {
    id,
    data: {
      date: new Date(`${date}T00:00:00.000Z`),
      draft,
    },
  };
}

test('404: vybere přesně tři nejnovější veřejné články podle data', async () => {
  const latest = await loadLatest([
    article('verejny-nejstarsi', '2024-01-10'),
    article('draft-nejnovejsi', '2030-12-31', true),
    article('verejny-druhy', '2026-04-20'),
    article('verejny-ctvrty', '2025-06-15'),
    article('draft-mezi', '2027-08-01', true),
    article('verejny-prvni', '2026-11-05'),
    article('verejny-treti', '2026-01-02'),
  ]);

  assert.deepEqual(
    latest.map(({ id }) => id),
    ['verejny-prvni', 'verejny-druhy', 'verejny-treti'],
  );
  assert.equal(latest.length, 3);
  assert.ok(latest.every(({ data }) => data.draft === false));
});

test('404: při méně než třech veřejných článcích výsledek nedoplní draftem', async () => {
  const latest = await loadLatest([
    article('draft-budouci', '2031-01-01', true),
    article('verejny-starsi', '2024-03-12'),
    article('draft-dalsi', '2030-01-01', true),
    article('verejny-novejsi', '2025-09-08'),
  ]);

  assert.deepEqual(
    latest.map(({ id }) => id),
    ['verejny-novejsi', 'verejny-starsi'],
  );
  assert.equal(latest.length, 2);
  assert.ok(latest.every(({ data }) => data.draft === false));
});

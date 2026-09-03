import assert from 'node:assert/strict';
import test from 'node:test';

import './test-sitemap-register.mjs';

const { setArticles } = await import('./test-sitemap-mocks/state.mjs');

setArticles([]);
const config = (await import('../astro.config.mjs?heading-id-test')).default;
const rehypeAsciiHeadingIds = config.markdown.rehypePlugins[0];

const text = (value) => ({ type: 'text', value });
const element = (tagName, children, properties) => ({
  type: 'element',
  tagName,
  ...(properties === undefined ? {} : { properties }),
  children,
});
const root = (children) => ({ type: 'root', children });

function transform(tree) {
  rehypeAsciiHeadingIds()(tree);
  return tree;
}

test('převede českou diakritiku a odstraní interpunkci z fragmentu', () => {
  const heading = element('h2', [
    text('Příliš žluťoučký kůň: ceny, slevy & FAQ?!'),
  ]);

  transform(root([heading]));

  assert.equal(
    heading.properties.id,
    'prilis-zlutoucky-kun-ceny-slevy-faq',
  );
});

test('složí text ze všech vnořených uzlů a zachová ostatní properties', () => {
  const heading = element(
    'h3',
    [
      text('Jak '),
      element('em', [text('fungují')]),
      text(' '),
      element('a', [text('Wi-Fi '), element('code', [text('7')])]),
    ],
    { className: ['odkaz'], 'data-kind': 'guide' },
  );

  transform(root([heading]));

  assert.deepEqual(heading.properties, {
    className: ['odkaz'],
    'data-kind': 'guide',
    id: 'jak-funguji-wi-fi-7',
  });
});

test('mění pouze h2 až h4, ale strom prochází i pod jinými elementy', () => {
  const headings = ['h1', 'h2', 'h3', 'h4', 'h5'].map((tagName) =>
    element(tagName, [text(`Nadpis ${tagName}`)], { id: `puvodni-${tagName}` }),
  );
  const paragraph = element('p', [text('Běžný text')], { id: 'puvodni-p' });

  transform(root([element('section', [...headings, paragraph])]));

  assert.deepEqual(
    headings.map((heading) => heading.properties.id),
    ['puvodni-h1', 'nadpis-h2', 'nadpis-h3', 'nadpis-h4', 'puvodni-h5'],
  );
  assert.equal(paragraph.properties.id, 'puvodni-p');
});

test('prázdný slug nepřidá id ani nepřepíše existující fragment', () => {
  const withoutProperties = element('h2', [text('… ?! —')]);
  const withExistingId = element(
    'h4',
    [element('span', [text('!!!')])],
    { id: 'stabilni-fragment', className: ['kotva'] },
  );

  transform(root([withoutProperties, withExistingId]));

  assert.equal(withoutProperties.properties, undefined);
  assert.deepEqual(withExistingId.properties, {
    id: 'stabilni-fragment',
    className: ['kotva'],
  });
});

test('omezí výsledné id přesně na 60 znaků', () => {
  const heading = element('h2', [text('A'.repeat(61))]);

  transform(root([heading]));

  assert.equal(heading.properties.id, 'a'.repeat(60));
  assert.equal(heading.properties.id.length, 60);
});

test(
  'codex-testy-web/HEADING-ID-001: zkrácení nenechá na konci fragmentu oddělovač',
  () => {
    const heading = element('h2', [text(`${'a'.repeat(59)} závěr`)]);

    transform(root([heading]));

    assert.equal(heading.properties.id, 'a'.repeat(59));
  },
);

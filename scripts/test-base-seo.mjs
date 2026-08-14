import assert from 'node:assert/strict';
import test from 'node:test';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createComponent } from 'astro/runtime/server/index.js';

import './base-astro-register.mjs';

const { default: Base } = await import('../src/layouts/Base.astro');

const site = new URL('https://realtech.cz/');
const container = await AstroContainer.create();

const BaseWithSite = createComponent(async (result, props, slots) => {
  const createAstro = result.createAstro;
  result.createAstro = (...args) => {
    const astro = createAstro(...args);
    Object.defineProperty(astro, 'site', { value: site });
    return astro;
  };
  return Base(result, props, slots);
});

function attributesFor(html, identifyingAttribute, identifyingValue) {
  for (const match of html.matchAll(/<(?:link|meta)\b[^>]*>/g)) {
    const attributes = Object.fromEntries(
      [...match[0].matchAll(/\s([\w:-]+)="([^"]*)"/g)]
        .map((attribute) => [attribute[1], attribute[2]]),
    );
    if (attributes[identifyingAttribute] === identifyingValue) {
      return attributes;
    }
  }
  assert.fail(`V HTML chybí ${identifyingAttribute}="${identifyingValue}"`);
}

async function renderBase(requestUrl, image) {
  return container.renderToString(BaseWithSite, {
    partial: true,
    props: { title: 'SEO URL test', image },
    request: new Request(requestUrl),
  });
}

test('canonical používá Astro.site a pathname bez query/hash a og:url je totožné', async () => {
  const html = await renderBase(
    'https://prichozi.example/clanky/seo-hranice/?utm_source=test#fragment',
    '/images/social/seo-hranice.jpg',
  );
  const canonical = attributesFor(html, 'rel', 'canonical').href;
  const ogUrl = attributesFor(html, 'property', 'og:url').content;

  assert.equal(canonical, 'https://realtech.cz/clanky/seo-hranice/');
  assert.equal(ogUrl, canonical);
});

test('kořenový image vstup převede na absolutní og:image vůči Astro.site', async () => {
  const html = await renderBase(
    'https://prichozi.example/produkty/?varianta=2#detail',
    '/images/social/produkt.jpg',
  );

  assert.equal(
    attributesFor(html, 'property', 'og:image').content,
    'https://realtech.cz/images/social/produkt.jpg',
  );
});

test('absolutní image vstup zachová jako og:image beze změny', async () => {
  const html = await renderBase(
    'https://prichozi.example/video/?autoplay=1#prehravac',
    'https://i.ytimg.com/vi/seo-test/maxresdefault.jpg',
  );

  assert.equal(
    attributesFor(html, 'property', 'og:image').content,
    'https://i.ytimg.com/vi/seo-test/maxresdefault.jpg',
  );
});

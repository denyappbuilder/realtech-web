import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const archiveSource = readFileSync(
  new URL('../src/components/ArticleArchivePage.astro', import.meta.url),
  'utf8',
);

const scriptBlocks = [...archiveSource.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(
  scriptBlocks.length,
  1,
  `ArticleArchivePage.astro má ${scriptBlocks.length} holých <script> bloků, čekal se právě 1`,
);

const clientScript = ts.transpileModule(scriptBlocks[0][1], {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;

class TestElement {
  constructor(tagName, { attributes = {}, text = '' } = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.children = [];
    this.parent = null;
    this.listeners = new Map();
    this.textContent = text;
    this.value = '';
    this.classList = {
      add: (...names) => this.#setClasses([...this.#classes(), ...names]),
      remove: (...names) => this.#setClasses(this.#classes().filter((name) => !names.includes(name))),
      contains: (name) => this.#classes().includes(name),
    };
  }

  get className() {
    return this.getAttribute('class') ?? '';
  }

  set className(value) {
    this.setAttribute('class', value);
  }

  #classes() {
    return (this.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
  }

  #setClasses(names) {
    this.setAttribute('class', [...new Set(names)].join(' '));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  toggleAttribute(name, force) {
    const enabled = force === undefined ? !this.attributes.has(name) : force;
    if (enabled) this.setAttribute(name, '');
    else this.removeAttribute(name);
    return enabled;
  }

  append(...nodes) {
    for (const child of nodes) {
      child.parent = this;
      this.children.push(child);
    }
  }

  remove() {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter((child) => child !== this);
    this.parent = null;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type) {
    for (const listener of this.listeners.get(type) ?? []) listener({ type, target: this });
  }

  querySelector(selector) {
    if (selector.startsWith('a[href^="/clanky/"]')) {
      return this.children.flatMap((child) => [
        ...(child.tagName === 'A' && (child.getAttribute('href') ?? '').startsWith('/clanky/') ? [child] : []),
        ...(child.querySelector(selector) ? [child.querySelector(selector)] : []),
      ])[0] ?? null;
    }
    return null;
  }

  querySelectorAll(selector) {
    if (selector === 'a' || selector === 'img') {
      return this.children.flatMap((child) => [
        ...(child.tagName === selector.toUpperCase() ? [child] : []),
        ...child.querySelectorAll(selector),
      ]);
    }
    return [];
  }
}

const card = (id, text = id, { category = 'Test' } = {}) => {
  const element = new TestElement('article', {
    attributes: { class: 'card', 'data-slug': id, 'data-category': category },
    text,
  });
  const odkaz = new TestElement('a', { attributes: { href: `/clanky/${id}/` }, text });
  element.append(odkaz);
  return element;
};

const waitFor = async (predicate, message) => {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (predicate()) return;
    await Promise.resolve();
  }
  assert.fail(message);
};

const createFetchController = () => {
  const pending = [];
  const urls = [];

  return {
    urls,
    fetch(url) {
      urls.push(url);
      return new Promise((resolve, reject) => pending.push({ url, resolve, reject }));
    },
    async next(expectedUrl) {
      await waitFor(() => pending.length > 0, `fetch ${expectedUrl} nebyl zavolán`);
      const request = pending.shift();
      assert.equal(request.url, expectedUrl);
      return {
        succeed(body) {
          request.resolve({
            ok: true,
            json: async () => body,
            text: async () => JSON.stringify(body),
          });
        },
        fail(status = 500) {
          request.resolve({
            ok: false,
            status,
            json: async () => { throw new Error('neparsovat'); },
            text: async () => '',
          });
        },
      };
    },
  };
};

const INDEX = [
  { s: 'first-page', t: 'První na straně 1', d: 'Popis first', k: 'Test', b: '', p: '2026-09-01' },
  { s: 'page-2', t: 'Článek ze strany 2', d: 'Popis page', k: 'Test', b: 'úryvek', p: '2026-08-01' },
  { s: 'page-3', t: 'Článek ze strany 3', d: 'Jiný popis', k: 'AI Report', b: '', p: '2026-07-01' },
];

const createArchive = () => {
  const allChip = new TestElement('button', { attributes: { class: 'chip active', 'data-cat': '' } });
  const grid = new TestElement('div', { attributes: { id: 'articles-grid', 'aria-busy': 'false' } });
  grid.append(card('first-page', 'first-page'));
  const empty = new TestElement('p', { attributes: { class: 'filter-empty', hidden: '' } });
  const loading = new TestElement('p', {
    attributes: { class: 'filter-loading', hidden: '' },
    text: 'Načítám index článků…',
  });
  const pagination = new TestElement('nav', { attributes: { class: 'archive-pagination' } });
  const search = new TestElement('input', { attributes: { id: 'art-search' } });
  const fetchController = createFetchController();

  const document = {
    createElement(tagName) {
      return new TestElement(tagName);
    },
    getElementById(id) {
      return id === 'articles-grid' ? grid : id === 'art-search' ? search : null;
    },
    querySelector(selector) {
      return {
        '.filter-empty': empty,
        '.filter-loading': loading,
        '.archive-pagination': pagination,
        '.chip.active': allChip,
      }[selector] ?? null;
    },
    querySelectorAll(selector) {
      if (selector === '.cat-filter .chip') return [allChip];
      if (selector === '#articles-grid .card') return [...grid.children];
      throw new Error(`Neočekávaný selektor: ${selector}`);
    },
  };

  const location = { pathname: '/clanky/', search: '' };
  vm.runInNewContext(clientScript, {
    document,
    window: {
      setTimeout(fn) {
        fn();
        return 1;
      },
      clearTimeout() {},
    },
    fetch: fetchController.fetch,
    URLSearchParams,
    location,
    history: { replaceState() {} },
  }, { filename: 'ArticleArchivePage.client.js' });

  return { fetchController, grid, loading, search, pagination, empty };
};

const startFilteredLoad = (archive) => {
  archive.search.value = 'page';
  archive.search.dispatch('input');
};

const slugs = (archive) => archive.grid.children
  .filter((item) => !item.hasAttribute('hidden'))
  .map((item) => item.getAttribute('data-slug'));

test('selhání indexu dovolí nový pokus a nenačítá HTML stran', async () => {
  const archive = createArchive();
  startFilteredLoad(archive);
  const first = await archive.fetchController.next('/search-index.json');
  first.fail();
  await waitFor(
    () => archive.loading.textContent.includes('nepodařilo načíst'),
    'uživatel nedostal zprávu o selhání načítání indexu',
  );

  assert.deepEqual(archive.fetchController.urls, ['/search-index.json']);
  assert.equal(archive.grid.getAttribute('aria-busy'), 'false');

  startFilteredLoad(archive);
  await archive.fetchController.next('/search-index.json');
  assert.deepEqual(archive.fetchController.urls, [
    '/search-index.json',
    '/search-index.json',
  ]);
});

test('úspěšný index doplní karty mimo stranu 1 a nenačítá /clanky/strana/', async () => {
  const archive = createArchive();
  startFilteredLoad(archive);
  const req = await archive.fetchController.next('/search-index.json');
  req.succeed(INDEX);
  await waitFor(
    () => archive.grid.getAttribute('aria-busy') === 'false'
      && archive.grid.children.some((item) => item.hasAttribute('data-from-index')),
    'index se nenačetl nebo se nedoplnily karty',
  );

  assert.deepEqual(slugs(archive), ['page-2']);
  assert.equal(
    archive.grid.children.find((item) => item.getAttribute('data-slug') === 'page-2')?.hasAttribute('data-from-index'),
    true,
  );
  assert.equal(archive.pagination.hasAttribute('hidden'), true);
  assert.doesNotMatch(archive.fetchController.urls.join(' '), /\/clanky\/strana\//);
});

test('vyčištění dotazu smaže karty z indexu a vrátí stránkování', async () => {
  const archive = createArchive();
  startFilteredLoad(archive);
  const req = await archive.fetchController.next('/search-index.json');
  req.succeed(INDEX);
  await waitFor(
    () => archive.grid.children.some((item) => item.hasAttribute('data-from-index')),
    'karta z indexu se nepřipojila',
  );

  archive.search.value = '';
  archive.search.dispatch('input');
  await waitFor(
    () => !archive.grid.children.some((item) => item.hasAttribute('data-from-index')),
    'karty z indexu po vyčištění dotazu zůstaly',
  );

  assert.deepEqual(slugs(archive), ['first-page']);
  assert.equal(archive.pagination.hasAttribute('hidden'), false);
  assert.equal(archive.empty.hasAttribute('hidden'), true);
});

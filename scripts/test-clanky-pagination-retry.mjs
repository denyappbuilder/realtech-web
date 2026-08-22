import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const archiveSource = readFileSync(
  new URL('../src/components/ArticleArchivePage.astro', import.meta.url),
  'utf8',
);

const scriptStartMarker = '<script>\n      const archive =';
const scriptStart = archiveSource.indexOf(scriptStartMarker);
assert.notEqual(scriptStart, -1, 'klientský skript archivu v komponentě chybí');
const scriptBodyStart = scriptStart + '<script>\n      '.length;
const scriptEnd = archiveSource.indexOf('\n    </script>', scriptBodyStart);
assert.notEqual(scriptEnd, -1, 'klientský skript archivu nemá koncový tag');

const clientScript = ts.transpileModule(
  archiveSource.slice(scriptBodyStart, scriptEnd),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } },
).outputText;

class TestElement {
  constructor(tagName, { attributes = {}, text = '' } = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.children = [];
    this.listeners = new Map();
    this.textContent = text;
    this.value = '';
    this.classList = {
      add: (...names) => this.#setClasses([...this.#classes(), ...names]),
      remove: (...names) => this.#setClasses(this.#classes().filter((name) => !names.includes(name))),
      contains: (name) => this.#classes().includes(name),
    };
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

  toggleAttribute(name, force) {
    const enabled = force === undefined ? !this.attributes.has(name) : force;
    if (enabled) this.setAttribute(name, '');
    else this.removeAttribute(name);
    return enabled;
  }

  append(child) {
    this.children.push(child);
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type) {
    for (const listener of this.listeners.get(type) ?? []) listener({ type, target: this });
  }

  cloneNode() {
    return new TestElement(this.tagName, {
      attributes: Object.fromEntries(this.attributes),
      text: this.textContent,
    });
  }
}

const card = (id, text = id) => new TestElement('article', {
  attributes: { class: 'card', 'data-card-id': id, 'data-category': 'Test' },
  text,
});

class ParsedDocument {
  constructor(html) {
    this.parsedCards = [...html.matchAll(/<article class="card" data-card-id="([^"]+)">([^<]*)<\/article>/g)]
      .map((match) => card(match[1], match[2]));
  }

  querySelectorAll(selector) {
    assert.equal(selector, '#articles-grid .card');
    return this.parsedCards;
  }
}

class TestDOMParser {
  parseFromString(html, type) {
    assert.equal(type, 'text/html');
    return new ParsedDocument(html);
  }
}

const pageHtml = (...ids) => ids
  .map((id) => `<article class="card" data-card-id="${id}">${id}</article>`)
  .join('');

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
        succeed(html) {
          request.resolve({ ok: true, text: async () => html });
        },
        fail(status = 500) {
          request.resolve({ ok: false, status, text: async () => '' });
        },
      };
    },
  };
};

const createArchive = () => {
  const archive = new TestElement('section', { attributes: { 'data-archive': '', 'data-total-pages': '3' } });
  const allChip = new TestElement('button', { attributes: { class: 'chip active', 'data-cat': '' } });
  const grid = new TestElement('div', { attributes: { id: 'articles-grid', 'aria-busy': 'false' } });
  grid.append(card('first-page'));
  const empty = new TestElement('p', { attributes: { class: 'filter-empty', hidden: '' } });
  const loading = new TestElement('p', {
    attributes: { class: 'filter-loading', hidden: '' },
    text: 'Načítám celý archiv pro hledání…',
  });
  const pagination = new TestElement('nav', { attributes: { class: 'archive-pagination' } });
  const search = new TestElement('input', { attributes: { id: 'art-search' } });
  const fetchController = createFetchController();

  const document = {
    getElementById(id) {
      return id === 'articles-grid' ? grid : id === 'art-search' ? search : null;
    },
    querySelector(selector) {
      return {
        '[data-archive]': archive,
        '.filter-empty': empty,
        '.filter-loading': loading,
        '.archive-pagination': pagination,
        '.chip.active': allChip,
      }[selector] ?? null;
    },
    querySelectorAll(selector) {
      if (selector === '.cat-filter .chip') return [allChip];
      if (selector === '#articles-grid .card') return grid.children;
      throw new Error(`Neočekávaný selektor: ${selector}`);
    },
    importNode(node) {
      return node.cloneNode(true);
    },
  };

  const location = { pathname: '/clanky/', search: '' };
  vm.runInNewContext(clientScript, {
    document,
    fetch: fetchController.fetch,
    DOMParser: TestDOMParser,
    URLSearchParams,
    location,
    history: { replaceState() {} },
  }, { filename: 'ArticleArchivePage.client.js' });

  return { fetchController, grid, loading, search };
};

const startFilteredLoad = (archive) => {
  archive.search.value = 'page';
  archive.search.dispatch('input');
};

const failOnThirdPage = async (archive) => {
  startFilteredLoad(archive);
  const page2 = await archive.fetchController.next('/clanky/strana/2/');
  page2.succeed(pageHtml('page-2'));
  const page3 = await archive.fetchController.next('/clanky/strana/3/');
  page3.fail();
  await waitFor(
    () => archive.loading.textContent.includes('nepodařilo načíst'),
    'uživatel nedostal zprávu o selhání načítání archivu',
  );
};

const cardIds = (archive) => archive.grid.children.map((item) => item.getAttribute('data-card-id'));

test('selhání uprostřed načítání zachová připojenou stránku a dovolí nový pokus', async () => {
  const archive = createArchive();
  await failOnThirdPage(archive);

  assert.deepEqual(cardIds(archive), ['first-page', 'page-2']);
  assert.equal(archive.grid.getAttribute('aria-busy'), 'false');

  startFilteredLoad(archive);
  const retryPage2 = await archive.fetchController.next('/clanky/strana/2/');
  retryPage2.succeed(pageHtml('page-2'));
  await archive.fetchController.next('/clanky/strana/3/');

  assert.deepEqual(archive.fetchController.urls, [
    '/clanky/strana/2/',
    '/clanky/strana/3/',
    '/clanky/strana/2/',
    '/clanky/strana/3/',
  ]);
});

test('retry po pádu uprostřed archivu nepřipojí již načtené karty podruhé', {
  todo: '[codex-testy-web/ARCHIVE-RETRY-001] produkce musí při retry deduplikovat nebo navázat od první chybějící stránky',
}, async () => {
  const archive = createArchive();
  await failOnThirdPage(archive);

  startFilteredLoad(archive);
  const retryPage2 = await archive.fetchController.next('/clanky/strana/2/');
  retryPage2.succeed(pageHtml('page-2'));
  const retryPage3 = await archive.fetchController.next('/clanky/strana/3/');
  retryPage3.succeed(pageHtml('page-3'));
  await waitFor(
    () => archive.grid.getAttribute('aria-busy') === 'false',
    'opakované načtení archivu se nedokončilo',
  );

  assert.deepEqual(cardIds(archive), ['first-page', 'page-2', 'page-3']);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../astro.config.mjs';
import { isUnifiedProcessor } from '@astrojs/markdown-remark';

test('Astro migration preserves HTML-aware inline whitespace', () => {
  assert.equal(config.compressHTML, true);
});

test('Astro migration explicitly preserves the unified Markdown plugin pipeline', () => {
  assert.ok(isUnifiedProcessor(config.markdown.processor));
  assert.deepEqual(config.markdown.processor.options.rehypePlugins.map((plugin) => plugin.name), [
    'rehypeAsciiHeadingIds', 'rehypeCtaInline', 'rehypeXEmbedy', 'rehypeTabulky', 'rehypeChecklist',
  ]);
});

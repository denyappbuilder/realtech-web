import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';
test('visible article, home and card decks plus archive index share safe excerpt derivation',()=>{
 for(const file of ['pages/clanky/[...id].astro','pages/index.astro','components/ArticleCard.astro','pages/search-index.json.js']) {
  const source=readFileSync(new URL(`../src/${file}`,import.meta.url),'utf8');
  assert.match(source,/articleLead\(/,file);
 }
});
const helper=new URL('../src/lib/article-lead.js',import.meta.url);
test('confirmed mid-word excerpt uses complete authored text without changing source',async()=>{
 assert.ok(existsSync(helper),'article lead helper exists');
 const { articleLead }=await import(helper);
 const source=readFileSync(new URL('../src/content/clanky/claude-cowork-docs-slides-checklist.md',import.meta.url),'utf8');
 const [,frontmatter,body]=source.split('---');
 const {description}=yaml.load(frontmatter);
 const lead=articleLead(description,body);
 assert.equal(lead,'Anthropic 16. září 2026 oznámil, že Cowork přestává být samostatný prostor a stává se součástí hlavního chatu Claude.');
 assert.ok(body.trimStart().startsWith(lead));
 assert.ok(description.endsWith('rozh'),'source remains unchanged');
 assert.equal(articleLead('Autorský perex bez tečky','Jiný začátek článku.'),'Autorský perex bez tečky');
 assert.equal(articleLead('Úplná věta.','Úplná věta. Další odstavec.'),'Úplná věta.');
 assert.equal(articleLead('',''), '');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { nactiModal } from './test-search-modal-loader.mjs';
import { filtrujIndex } from '../src/lib/archiv-filtr.js';
test('malformed index slugs never become navigation targets; a clean retry still works', async()=>{
 for(const slug of ['bad" data-qa="injected','../outside','//example.com','%2foutside']) {
  let calls=0;
  const modal=nactiModal({fetch:async()=>({ok:true,json:async()=>++calls===1 ? [{...items[0],s:slug}] : items})});
  await modal.loadIndex();
  assert.equal(modal.dejIndex(),null,slug);
  assert.equal(modal.dejIndexSelhal(),true);
  await modal.loadIndex();
  assert.equal(modal.search('Claude').length,8);
 }
});
test('date strings and slug attributes are escaped even when render receives malformed data',()=>{
 const modal=nactiModal();
 modal.render([{...items[0],s:'test" data-qa="injected',p:'<img src=x data-qa=injected>'}],'Claude');
 assert.doesNotMatch(modal.results.innerHTML,/<img|s\/test" data-qa/);
 assert.match(modal.results.innerHTML,/&lt;img/);
});
const items=Array.from({length:12},(_,i)=>({s:`claude-${i}`,t:`Claude pro klienty ${i}`,d:'',k:'AI Report',b:'České návody',p:'2026-09-18'}));
test('search preview exposes actual total and a query-preserving archive route, then clears stale route',()=>{
 const modal=nactiModal({hledatelne:items});
 modal.render(modal.search('  Claude klienty  '),'  Claude klienty  ');
 assert.equal(modal.allResults.hidden,false);
 assert.equal(modal.allResults.href,'/clanky/?q=Claude%20klienty');
 assert.equal(modal.allResults.textContent,'Všechny výsledky (12)');
 assert.match(modal.hint.innerHTML,/12 výsledků.*8/s);
 assert.equal((modal.results.innerHTML.match(/role="option"/g)||[]).length,8);
 modal.render(modal.search('   '),'   ');
 assert.equal(modal.allResults.hidden,true);
});
test('multiword archive query finds the same complete set as modal, including accents',()=>{
 const modal=nactiModal({hledatelne:items});
 assert.equal(modal.search('ceske klienty').length,8);
 assert.equal(filtrujIndex(items,{kat:'',q:'ceske klienty'}).length,12);
 assert.equal(filtrujIndex(items,{kat:'Mobily',q:'ceske klienty'}).length,0);
});

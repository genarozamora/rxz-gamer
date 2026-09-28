const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const api = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname, '../lib/store-metrics.ts'), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, {exports:api});
test('paid total excludes pending, rejected and cancelled orders', () => {
  const report = api.summarizeMetrics([{event_name:'purchase',metadata:{order_id:'duplicate'}}], [
    {id:'a',status:'pending_payment',total:900}, {id:'b',status:'cancelled',total:800},
    {id:'c',status:'preparing_shipment',total:'120'}, {id:'d',status:'delivered',total:80},
    {id:'e',status:'payment_rejected',total:500},
  ]);
  assert.equal(report.orders,5); assert.equal(report.cancelled,1); assert.equal(report.paid,2); assert.equal(report.revenue,200);
});
test('campaign counts use visits, not all interactions attributed to a source', () => {
  const report=api.summarizeMetrics([
    {event_name:'campaign_visit',metadata:{utm_source:'whatsapp'}},
    {event_name:'product_view',product_id:'6',metadata:{campaign:{utm_source:'whatsapp'}}},
    {event_name:'add_to_cart',product_id:'6',metadata:{campaign:{utm_source:'whatsapp'}}},
    {event_name:'share_store',metadata:{}}, {event_name:'copy_store_link',metadata:{}},
  ],[]);
  assert.equal(report.views,1); assert.equal(report.carts,1); assert.equal(report.shares,2);
  assert.equal(report.sources[0][1],1); assert.equal(report.popular[0][0],'6');
});
test('empty periods show zero actual orders and no fabricated conversion', () => {
  const report=api.summarizeMetrics([],[]); assert.equal(report.revenue,0);assert.equal(report.orders,0);assert.equal(report.views,0);
});
test('search metrics normalize queries and separate no-result opportunities', () => {
  const report=api.summarizeMetrics([
    {event_name:'search',metadata:{query:'Mouse'}},
    {event_name:'search',metadata:{query:' mouse '}},
    {event_name:'search_no_results',metadata:{query:'Auriculares'}},
    {event_name:'search_no_results',metadata:{}},
  ],[]);
  assert.equal(report.searches,4); assert.equal(report.noResultSearches,2);
  assert.equal(report.queries[0][0],'mouse'); assert.equal(report.queries[0][1],2);
  assert.equal(report.emptyQueries[0][0],'auriculares'); assert.equal(report.emptyQueries[0][1],1);
});

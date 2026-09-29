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
test('cart and category interactions are summarized without treating them as people', () => {
  const report=api.summarizeMetrics([
    {event_name:'view_cart',metadata:{items:2}},
    {event_name:'view_cart',metadata:{items:1}},
    {event_name:'remove_from_cart',product_id:'3',metadata:{}},
    {event_name:'filter_use',metadata:{filter:'sort',value:'price-asc'}},
    {event_name:'category_view',metadata:{category:'Mouse'}},
    {event_name:'category_view',metadata:{category:'Mouse'}},
  ],[]);
  assert.equal(report.cartViews,2); assert.equal(report.cartRemovals,1); assert.equal(report.filterUses,1);
  assert.equal(report.categories[0][0],'Mouse'); assert.equal(report.categories[0][1],2);
});
test('products added to cart are ranked independently from product views', () => {
  const report=api.summarizeMetrics([
    {event_name:'product_view',product_id:'1',metadata:{}},
    {event_name:'add_to_cart',product_id:'7',metadata:{}},
    {event_name:'add_to_cart',product_id:'7',metadata:{}},
    {event_name:'add_to_cart',product_id:'1',metadata:{}},
  ],[]);
  assert.equal(report.popular[0][0],'1'); assert.equal(report.popularAdded[0][0],'7'); assert.equal(report.popularAdded[0][1],2);
});
test('events saved through the compatibility alias count as their real event', () => {
  const report=api.summarizeMetrics([
    {event_name:'resume_cart',metadata:{event_alias:'search_no_results',query:'headset'}},
    {event_name:'resume_cart',product_id:'3',metadata:{event_alias:'remove_from_cart'}},
    {event_name:'resume_cart',metadata:{event_alias:'category_view',category:'Controles'}},
  ],[]);
  assert.equal(report.searches,1); assert.equal(report.noResultSearches,1); assert.equal(report.cartRemovals,1);
  assert.equal(report.categories[0][0],'Controles');
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const api = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname, '../lib/admin-tools.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: api });
test('finds customer and order terms across fields, accents and spaces', () => {
  assert.equal(api.matchesAdminSearch('  jose  rxz-12 ', ['José Pérez', 'RXZ-12', null]), true);
  assert.equal(api.matchesAdminSearch('rxz-13', ['RXZ-12']), false);
  assert.equal(api.matchesAdminSearch(' ', [null]), true);
});
test('dispatch queue includes both verified and preparing orders only', () => {
  assert.equal(api.matchesOrderStatus('payment_verified', 'preparing'), true);
  assert.equal(api.matchesOrderStatus('preparing_shipment', 'preparing'), true);
  assert.equal(api.matchesOrderStatus('shipped', 'preparing'), false);
  assert.equal(api.matchesOrderStatus('receipt_uploaded', 'receipt_uploaded'), true);
  assert.equal(api.matchesOrderStatus('cancelled', 'all'), true);
});
test('editing the cover preserves remaining photos and never mutates source', () => {
  const gallery = ['cover.jpg', 'back.jpg', 'package.jpg'];
  assert.deepEqual(Array.from(api.productEditorImages('new.jpg', gallery)), ['new.jpg', 'back.jpg', 'package.jpg']);
  assert.deepEqual(Array.from(api.productEditorImages('cover.jpg', gallery)), gallery);
  assert.deepEqual(gallery, ['cover.jpg', 'back.jpg', 'package.jpg']);
  assert.deepEqual(Array.from(api.productEditorImages('photo.jpg')), ['photo.jpg']);
});

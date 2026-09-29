const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const api = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname, '../lib/checkout-validation.ts'), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, {exports:api});

test('accepts real Argentine checkout fields', () => {
  assert.equal(api.validFullName('María Pérez'), true);
  assert.equal(api.validArgentinePhone('351 555 1234'), true);
  assert.equal(api.validAddress('San Martín 123'), true);
  assert.equal(api.validCity('Villa Allende'), true);
  assert.equal(api.validPostalCode('X5105ABC'), true);
  assert.equal(api.validEmail('cliente@example.com'), true);
});

test('rejects fabricated or malformed checkout fields', () => {
  assert.equal(api.validFullName('Genaro1'), false);
  assert.equal(api.validArgentinePhone('1111111111'), false);
  assert.equal(api.validAddress('sin altura'), false);
  assert.equal(api.validCity('Córdoba 2'), false);
  assert.equal(api.validPostalCode('123'), false);
  assert.equal(api.validEmail('sin-arroba'), false);
});

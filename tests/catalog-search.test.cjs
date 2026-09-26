const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exportsUnderTest = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname, '../lib/catalog-search.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: exportsUnderTest });
const { matchesCatalogSearch } = exportsUnderTest;
const keyboard = { brand: 'AULA', name: 'F75 HE Magnetic Gaming Keyboard', category: 'Teclados', subtitle: 'Hall Effect • Rapid Trigger • 8000 Hz', variants: [{ label: 'Gradient Gray' }, { label: 'Black Contour' }] };
test('finds Spanish categories even when product names are English', () => {
  assert.equal(matchesCatalogSearch(keyboard, 'teclado'), true);
  assert.equal(matchesCatalogSearch(keyboard, 'mouse'), false);
});
test('matches separate words, accents, case and extra spaces', () => {
  assert.equal(matchesCatalogSearch(keyboard, '  TÉCLADO   AULA  '), true);
  assert.equal(matchesCatalogSearch(keyboard, 'f75 gradient'), true);
  assert.equal(matchesCatalogSearch(keyboard, 'aula rojo'), false);
});
test('empty and whitespace-only queries retain the catalogue', () => {
  assert.equal(matchesCatalogSearch(keyboard, ''), true);
  assert.equal(matchesCatalogSearch(keyboard, '   '), true);
});

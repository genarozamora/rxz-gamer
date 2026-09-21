const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
const catalogue = source.slice(source.indexOf('const ALL_PRODUCTS'), source.indexOf('export const PRODUCTS'));
const products = JSON.parse(JSON.stringify(vm.runInNewContext(ts.transpile(catalogue + '; ALL_PRODUCTS.filter(p => [1,3,6,7].includes(p.id));'))));
const moduleExports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'lib/verified-product.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: moduleExports });
const { mergeVerifiedProduct } = moduleExports;

test('reviewed facts and colours survive old managed catalogue records', () => {
  for (const reference of products) {
    const record = {
      ...reference, price: 123456, old_price: 234567, stock: 2,
      description: 'Old model copy', subtitle: 'Old model',
      specs: [{ label: 'Switches', value: 'Kailh Black Mamba' }],
      features: ['Unverified 200 hours'], images: ['/old-bundle.png'],
      variants: [...reference.variants.map((v, i) => ({ ...v, stock: i, image: '/wrong-colour.png' })), { id: 'red', stock: 50 }],
    };
    const merged = mergeVerifiedProduct(record, reference);
    assert.equal(merged.price, 123456);
    assert.equal(merged.oldPrice, 234567);
    assert.equal(merged.stock, 2);
    assert.deepEqual(merged.specs, reference.specs);
    assert.deepEqual(merged.images, reference.images);
    assert.equal(merged.description, reference.description);
    assert.deepEqual(Array.from(merged.variants, v => v.id), reference.variants.map(v => v.id));
    assert.deepEqual(Array.from(merged.variants, v => v.stock), reference.variants.map((_, i) => i));
    for (const v of merged.variants) assert.equal(v.image, reference.variants.find(r => r.id === v.id).image);
  }
});

test('reviewed facts are not applied to a different brand', () => {
  const merged = mergeVerifiedProduct({ id: 1, brand: 'Different brand', name: 'Other', price: 1, stock: 1, specs: [] }, products[0]);
  assert.equal(merged.name, 'Other');
  assert.equal(merged.specs.length, 0);
});

test('model-specific corrections and stock variants', () => {
  const x3 = products.find(p => p.id === 1);
  assert.equal(x3.variants.map(v => v.id).join(','), 'black,white');
  assert.equal(x3.variants.map(v => v.stock).join(','), '1,2');
  assert.ok(!/Kailh|HUANO|4000 Hz|200 horas|300 mAh/.test(JSON.stringify(x3)));
  assert.ok(x3.specs.some(s => s.value.includes('Bluetooth 5.4')));
  assert.ok(x3.images.every(i => !/4k/i.test(i)));
  assert.match(x3.specs.find(s => s.label === 'Incluye').value, /receptor inalámbrico 8K/i);
  const f75 = products.find(p => p.id === 6);
  assert.equal(f75.variants.map(v => v.id).join(','), 'black-contour,gradient-gray');
  assert.equal(f75.variants.map(v => v.stock).join(','), '3,1');
  assert.ok(f75.specs.find(s => s.label === 'Autonomía declarada').value.includes('23 h'));
  assert.ok(!/25–50/.test(JSON.stringify(f75)));
  assert.match(f75.specs.find(s => s.label === 'Incluye').value, /extractor/i);
  const gamesir = products.find(p => p.id === 3);
  assert.match(gamesir.specs.find(s => s.label === 'Incluye').value, /base de carga RGB.*receptor USB 2\.4 GHz.*cable USB-C.*manual/i);
  assert.ok(!fs.readFileSync(path.join(root, 'lib/package-preview.ts'), 'utf8').includes('gamesir-nova2-lite-2.jpg'));
  assert.ok(!source.includes('batterySummary'));
});

test('all active gallery, variant and fallback images exist and decode', async () => {
  for (const product of products) {
    assert.equal(new Set(product.images).size, product.images.length);
    for (const variant of product.variants) assert.ok(product.images.includes(variant.image));
  }
  const images = new Set(products.flatMap(p => [...p.images, p.fallbackImage, ...p.variants.map(v => v.image)]));
  for (const image of images) {
    assert.ok(!image.includes('bundle-rxz'));
    const file = path.join(root, 'public', image.slice(1));
    assert.ok(fs.existsSync(file), image);
    const { width, height } = await sharp(file).metadata();
    assert.ok(width > 0 && height > 0, image);
    await sharp(file).stats();
  }
});

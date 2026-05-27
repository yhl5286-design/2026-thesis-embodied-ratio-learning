import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const m = html.match(/\/\/__RS_TRANSFORMS_START__([\s\S]*?)\/\/__RS_TRANSFORMS_END__/);
assert.ok(m, 'RS_TRANSFORMS 마커 구간을 찾을 수 없음');
const pure = {};
new Function('exports', m[1] + '\nexports.equivScale=equivScale;exports.unitChange=unitChange;exports.countForUnit=countForUnit;exports.unitFraction=unitFraction;')(pure);

test('equivScale: 2:3 ×2 = 4:6', () => {
  assert.deepEqual(pure.equivScale([2,3], 2), [4,6]);
});
test('equivScale: 4:6 ÷2 = 2:3 (정수만)', () => {
  assert.deepEqual(pure.equivScale([4,6], 0.5), [2,3]);
});
test('equivScale: 비정수 결과는 null', () => {
  assert.equal(pure.equivScale([2,3], 0.5), null);
});
test('countForUnit: 한 마디 ♩(=1박) 4개', () => {
  assert.equal(pure.countForUnit('quarter'), 4);
});
test('countForUnit: 𝅗𝅥=2, ♪=8, ♬=16, 3연음=3', () => {
  assert.equal(pure.countForUnit('half'), 2);
  assert.equal(pure.countForUnit('eighth'), 8);
  assert.equal(pure.countForUnit('sixteenth'), 16);
  assert.equal(pure.countForUnit('triplet'), 3);
});
test('countForUnit: 알 수 없는 키는 0', () => {
  assert.equal(pure.countForUnit('unknown'), 0);
});
test('unitFraction: ♩ = 1/4, ♪ = 1/8, 3연음 = 1/3', () => {
  assert.deepEqual(pure.unitFraction('quarter'), [1,4]);
  assert.deepEqual(pure.unitFraction('eighth'), [1,8]);
  assert.deepEqual(pure.unitFraction('triplet'), [1,3]);
});
test('unitChange: ♩→♪ 변환은 개수 2배', () => {
  assert.equal(pure.unitChange('quarter','eighth').countMultiplier, 2);
});
test('unitChange: ♩→𝅗𝅥 변환은 개수 1/2', () => {
  assert.equal(pure.unitChange('quarter','half').countMultiplier, 0.5);
});

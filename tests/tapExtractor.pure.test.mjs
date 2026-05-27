import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const m = html.match(/\/\/__TAP_EXTRACTOR_START__([\s\S]*?)\/\/__TAP_EXTRACTOR_END__/);
assert.ok(m, 'TAP_EXTRACTOR 마커 구간을 찾을 수 없음');
const pure = {};
new Function('exports', m[1] + '\nexports.extractBeats=extractBeats;exports.medianInterval=medianInterval;')(pure);

test('extractBeats: 등간격 3박이면 3을 반환', () => {
  assert.equal(pure.extractBeats([0, 1000, 2000], 3000), 3);
});
test('extractBeats: ±20% 간격 변동 허용해서 4박 추출', () => {
  assert.equal(pure.extractBeats([0, 750, 1500, 2250], 3000), 4);
});
test('extractBeats: 두드림 1개면 0박(추출 불가)', () => {
  assert.equal(pure.extractBeats([100], 3000), 0);
});
test('extractBeats: 빈 배열 0', () => {
  assert.equal(pure.extractBeats([], 3000), 0);
});
test('extractBeats: 마디 길이 0이면 0 (방어)', () => {
  assert.equal(pure.extractBeats([0, 1000], 0), 0);
});
test('medianInterval: 정수 간격들 중앙값', () => {
  assert.equal(pure.medianInterval([0, 1000, 2000, 3000]), 1000);
});
test('medianInterval: 한 점 또는 빈은 0', () => {
  assert.equal(pure.medianInterval([5]), 0);
  assert.equal(pure.medianInterval([]), 0);
});
test('extractBeats: 매우 빠른 노이즈 두드림(<50ms)은 1개로 합쳐짐', () => {
  assert.equal(pure.extractBeats([0, 30, 1000, 2000], 3000), 3);
});

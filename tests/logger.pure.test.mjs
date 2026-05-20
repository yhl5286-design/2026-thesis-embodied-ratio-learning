import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// index.html에서 //__LOGGER_PURE_START__ ~ //__LOGGER_PURE_END__ 구간을 추출해 평가
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const m = html.match(/\/\/__LOGGER_PURE_START__([\s\S]*?)\/\/__LOGGER_PURE_END__/);
assert.ok(m, 'LOGGER_PURE 마커 구간을 찾을 수 없음');
const pure = {};
new Function('exports', m[1] + '\nexports.decideBatch=decideBatch;exports.applyOverflow=applyOverflow;exports.coalesce=coalesce;')(pure);

test('decideBatch: 크기 도달 시 true', () => {
  assert.equal(pure.decideBatch(10, 0, { batchSize: 10, batchMs: 5000 }), true);
});
test('decideBatch: 시간 경과 시 true', () => {
  assert.equal(pure.decideBatch(1, 5000, { batchSize: 10, batchMs: 5000 }), true);
});
test('decideBatch: 둘 다 미달이면 false', () => {
  assert.equal(pure.decideBatch(3, 1000, { batchSize: 10, batchMs: 5000 }), false);
});
test('decideBatch: 빈 큐는 false', () => {
  assert.equal(pure.decideBatch(0, 99999, { batchSize: 10, batchMs: 5000 }), false);
});
test('applyOverflow: 상한 초과 시 오래된 것부터 드롭하고 개수 반환', () => {
  const q = [1, 2, 3, 4, 5];
  const dropped = pure.applyOverflow(q, 3);
  assert.equal(dropped, 2);
  assert.deepEqual(q, [3, 4, 5]);
});
test('applyOverflow: 상한 이하면 0', () => {
  const q = [1, 2];
  assert.equal(pure.applyOverflow(q, 5), 0);
  assert.deepEqual(q, [1, 2]);
});
test('coalesce: 같은 상태 연속은 마지막만(머문 상태)', () => {
  const out = pure.coalesce([{ t: 0, state: 'a' }, { t: 1, state: 'a' }, { t: 2, state: 'b' }]);
  assert.deepEqual(out.map(p => p.state), ['a', 'b']);
});

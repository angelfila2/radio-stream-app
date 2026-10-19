const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createRequire } = require('node:module');

// The override crosses uuid's major versions. Exercise xcode's actual consumer
// API as well as the buffer-boundary behavior fixed by the security release.
const fromXcode = createRequire(require.resolve('xcode'));
const uuid = fromXcode('uuid');

test('xcode still generates valid project identifiers with the uuid override', () => {
  const project = require('xcode').project('example.pbxproj');
  project.hash = { project: { objects: {} } };
  const ids = new Set(Array.from({ length: 100 }, () => project.generateUuid()));
  assert.equal(ids.size, 100);
  for (const id of ids) assert.match(id, /^[0-9A-F]{24}$/);
});

test('uuid rejects the undersized output buffer from the security advisory', () => {
  assert.throws(() => uuid.v5('example', uuid.v5.DNS, new Uint8Array(8)), RangeError);
});

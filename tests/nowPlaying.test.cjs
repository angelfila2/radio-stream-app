const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../utils/nowPlaying.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const sandbox = { exports: {} };
vm.runInNewContext(compiled, sandbox);
const { parseNowPlaying } = sandbox.exports;
const plain = (value) => JSON.parse(JSON.stringify(value));

test('parses a synthetic ICY format and preserves separators in titles', () => {
  assert.deepEqual(plain(parseNowPlaying('ARTIST ONE [+] ARTIST TWO - EXAMPLE SONG - LIVE')), {
    artist: 'ARTIST ONE & ARTIST TWO', title: 'EXAMPLE SONG - LIVE',
  });
});

test('missing or blank metadata falls back instead of inventing a song', () => {
  for (const value of [undefined, null, '', '  ', '\0']) {
    assert.equal(parseNowPlaying(value), null);
  }
});

test('programme-only metadata is displayed without inventing an artist', () => {
  assert.deepEqual(plain(parseNowPlaying('Radio Live')), { title: 'Radio Live', artist: null });
});

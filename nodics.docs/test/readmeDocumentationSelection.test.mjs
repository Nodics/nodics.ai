/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.docs/test/readmeDocumentationSelection @description Checks README links against current owner selections without accepting frozen or misleading targets. @layer test @owner nodics.docs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { assertReadmeDocumentationLink } from '../scripts/audit-hardening.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-readme-selection-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const owner = 'modules/example';
  const readme = owner + '/README.md';
  const payload = 'module.exports = {};\n';
  const checksum = createHash('sha256').update(payload).digest('hex');
  function write(file, value) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), value);
  }
  function select(version, file) {
    write(owner + '/data/manifest.json', JSON.stringify({ sections: { documentation: {
      version, sourceMode: 'cms-records', generatedHashes: { [file]: checksum }
    } } }));
    write(owner + '/data/' + file, payload);
  }
  function link(target) {
    write(readme, '# Example\n\n## Documentation\n\n[Guide](' + target + ')\n');
  }
  return { root, owner, readme, write, select, link };
}

test('README follows the selected successor and leaves frozen source bytes intact', t => {
  const f = fixture(t);
  const old = 'docs-v001/records/documentation/exampleComponentData.js';
  const next = 'docs-v002/records/documentation/exampleComponentData.js';
  f.select('0.0.1', old);
  f.link('data/' + old);
  assertReadmeDocumentationLink(f.root, f.readme, f.owner);
  const frozen = fs.readFileSync(path.join(f.root, f.owner, 'data', old));
  f.select('0.0.2', next);
  assert.throws(() => assertReadmeDocumentationLink(f.root, f.readme, f.owner), /manifest-selected/);
  f.link('data/' + next);
  assert.equal(assertReadmeDocumentationLink(f.root, f.readme, f.owner),
    path.join(f.root, f.owner, 'data', next));
  assert.deepEqual(fs.readFileSync(path.join(f.root, f.owner, 'data', old)), frozen);
});

test('README selection accepts unused successor filenames without a hardcoded version', t => {
  const f = fixture(t);
  const selected = 'docs-v007/records/documentation/exampleRelease008ComponentData.js';
  f.select('0.0.8', selected);
  f.link('data/' + selected);
  assertReadmeDocumentationLink(f.root, f.readme, f.owner);
  f.write(f.readme, '## Documentation\n\n`' + f.owner + '/data/' + selected + '`\n');
  assertReadmeDocumentationLink(f.root, f.readme, f.owner);
});

test('a current-looking label cannot disguise a frozen or remote link target', t => {
  const f = fixture(t);
  const selected = 'docs-v002/records/documentation/exampleComponentData.js';
  f.select('0.0.2', selected);
  for (const target of ['data/docs-v001/records/documentation/exampleComponentData.js', 'https://example.test/guide']) {
    f.write(f.readme, '## Documentation\n\n[`' + f.owner + '/data/' + selected + '`](' + target + ')\n');
    assert.throws(() => assertReadmeDocumentationLink(f.root, f.readme, f.owner), /manifest-selected/);
  }
});

test('selected links require actual checksum-qualified records and a Documentation section', t => {
  const f = fixture(t);
  const selected = 'docs-v002/records/documentation/exampleComponentData.js';
  f.select('0.0.2', selected);
  f.link('data/' + selected);
  f.write(f.owner + '/data/' + selected, 'modified');
  assert.throws(() => assertReadmeDocumentationLink(f.root, f.readme, f.owner), /checksum mismatch/);
  fs.unlinkSync(path.join(f.root, f.owner, 'data', selected));
  assert.throws(() => assertReadmeDocumentationLink(f.root, f.readme, f.owner), /is missing/);
  f.write(f.readme, '# Example\nNo deep documentation.\n');
  assert.throws(() => assertReadmeDocumentationLink(f.root, f.readme, f.owner), /missing Documentation section/);
});

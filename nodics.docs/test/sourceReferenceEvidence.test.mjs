/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module nodics.docs/test/sourceReferenceEvidence @description Proves pinned external citations remain independent of sibling checkouts and reject stale, substituted or escaping evidence. @owner nodics.docs @layer test */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { validateFrameworkSourceEvidence } from '../scripts/source-reference-evidence.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');

test('external references use exact Git evidence, never an arbitrary or missing sibling checkout', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-doc-reference-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const frameworkRoot = path.join(root, 'framework'), ownerRoot = path.join(frameworkRoot, 'module');
    const snapshotRoot = path.join(frameworkRoot, 'fixtures'), sibling = path.join(root, 'sample');
    fs.mkdirSync(ownerRoot, { recursive: true }); fs.mkdirSync(snapshotRoot);
    const document = { id: 'sample-guide', blocks: [{ kind: 'paragraph', text: 'Source reference only.' }] };
    const evidence = '../../sample/README.md#scope', source = '# Scope\n\nPinned reference.\n';
    fs.writeFileSync(path.join(snapshotRoot, 'README.md'), source);
    const record = { repository: 'sample', commit: 'a'.repeat(40), gitPath: 'README.md', kind: 'file',
        snapshot: 'README.md', sha256: hash(source), url: 'https://github.com/Nodics/sample/blob/' + 'a'.repeat(40) + '/README.md' };
    const manifest = { schemaVersion: 1, documents: { [document.id]: { owner: 'module', articleBlocksSha256: hash(JSON.stringify(document.blocks)), references: { [evidence]: 'source' } } }, sources: { source: record } };
    const save = value => fs.writeFileSync(path.join(snapshotRoot, 'manifest.json'), JSON.stringify(value));
    const inspect = () => validateFrameworkSourceEvidence({ frameworkRoot, ownerRoot, snapshotRoot, document, evidence });
    save(manifest); assert.equal(inspect().kind, 'PINNED_EXTERNAL_REFERENCE');
    fs.mkdirSync(sibling); fs.writeFileSync(path.join(sibling, 'README.md'), 'Unrelated current sibling');
    assert.equal(inspect().sha256, hash(source));
    const reject = mutate => { const changed = structuredClone(manifest); mutate(changed); save(changed); assert.throws(inspect); save(manifest); };
    reject(x => delete x.documents[document.id].references[evidence]);
    reject(x => x.documents[document.id].articleBlocksSha256 = 'changed');
    reject(x => x.documents[document.id].owner = 'foreign');
    reject(x => x.sources.source.commit = 'main');
    reject(x => x.sources.source.gitPath = 'different.md');
    reject(x => x.sources.source.url = x.sources.source.url.replace('github.com', 'example.com'));
    reject(x => x.sources.source.snapshot = '../module/outside.md');
    fs.writeFileSync(path.join(snapshotRoot, 'README.md'), 'changed'); assert.throws(inspect, /snapshot/);
    fs.writeFileSync(path.join(snapshotRoot, 'README.md'), source);
    document.blocks[0].text = 'Unreviewed article change'; assert.throws(inspect, /requalification/);
    document.blocks[0].text = 'Source reference only.';
    fs.unlinkSync(path.join(snapshotRoot, 'README.md')); fs.symlinkSync(path.join(sibling, 'README.md'), path.join(snapshotRoot, 'README.md'));
    assert.throws(inspect, /snapshot/);
});

test('current Framework citations still require real files and valid anchors', t => {
    const frameworkRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-doc-local-reference-'));
    t.after(() => fs.rmSync(frameworkRoot, { recursive: true, force: true }));
    fs.writeFileSync(path.join(frameworkRoot, 'README.md'), '# Present\n');
    const input = { frameworkRoot, ownerRoot: frameworkRoot, document: { id: 'local', blocks: [] } };
    assert.equal(validateFrameworkSourceEvidence({ ...input, evidence: 'README.md#present' }).anchor, 'present');
    assert.throws(() => validateFrameworkSourceEvidence({ ...input, evidence: 'README.md#missing' }), /anchor/);
    assert.throws(() => validateFrameworkSourceEvidence({ ...input, evidence: 'missing.js' }), /Missing source/);
});

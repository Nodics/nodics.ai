/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/dataReleaseManifestGeneratorContract
 * @description Protects order-independent immutable data-release comparison in the aggregate-manifest generator.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(__dirname, '../bin/generate-data-release-manifests.js'), 'utf8');

assert(source.includes('function sameFileMap(left, right)'),
    'The manifest generator must compare file maps through one explicit helper');
assert(source.includes("Object.entries(left || {}).sort"),
    'The manifest generator must normalize file paths before comparison');
assert(source.includes('if (!sameFileMap(existing.files, files))'),
    'Release drift detection must use the order-independent comparison');
assert(source.includes('function releaseRootsFor(dataRoot, dataType)'),
    'The manifest generator must discover versioned release folders from the data root');
assert(source.includes("sourceRoot: entry.name"),
    'The manifest generator must derive sourceRoot from versioned release directory names');
assert(source.includes("sectionCode !== releaseRoot.sectionCode && contribution"),
    'Named destination-qualified sections must be distinguished from the conventional release section');
assert(source.includes("contribution.kind === 'DATA_RELEASE' && contribution.dataType === dataType"),
    'Only same-type data-release contributions may claim files from conventional generation');
assert.match(source, /releaseFiles = filesBelow\(releaseRoot\.root\)\.filter\(file =>\s*file !== 'release\.descriptor\.json' && !contributionFiles\.has\(file\)\)/,
    'Named contribution files and release metadata must stay outside conventional payload generation');

console.log('Data release manifest generator contract validated');

const test = require('node:test');
const os = require('node:os');
const vm = require('node:vm');
const policy = require('../../nData/nImport/import/src/service/release/defaultDataReleaseService');
const planner = require('../src/service/project/defaultProjectDataManifestService');

test('generator preserves retained roots and rejects drift without inventing conventional releases', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-generator-retention-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const data = path.join(root, 'data');
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'example.inventory', nodics: { kind: 'module' } }));
    for (const sourceRoot of ['core-v001', 'core-v002']) {
        fs.mkdirSync(path.join(data, sourceRoot, 'records'), { recursive: true });
        fs.writeFileSync(path.join(data, sourceRoot, 'records/item.js'), 'module.exports = {};\n');
    }
    const manifest = planner.planForwardRelease({ dataRoot: data, sectionCode: 'inventory', sourceRoot: 'core-v002', version: '1.0.1', manifest: {
        contractVersion: 2, module: 'example.inventory', sections: { inventory: {
            kind: 'DATA_RELEASE', dataType: 'core', sourceRoot: 'core-v001', version: '1.0.0', files: policy.sourceRootFiles(data, 'core-v001')
        } }
    } });
    const manifestPath = path.join(data, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    const run = () => vm.runInNewContext(source, {
        require, __dirname: path.join(root, 'a/b/c/d'), process: { argv: [] }, console: { log() {} }
    });
    const before = fs.readFileSync(manifestPath);
    run();
    assert.deepStrictEqual(fs.readFileSync(manifestPath), before);
    assert.deepStrictEqual(Object.keys(JSON.parse(before).sections), ['inventory']);
    fs.writeFileSync(path.join(data, 'core-v001/records/item.js'), 'changed');
    assert.throws(run, /Retained release tree checksum/);
    assert.deepStrictEqual(fs.readFileSync(manifestPath), before);
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/test/emptyConventionalReleaseDiscovery @description Protects empty refactor scaffolding versus declared or unsafe release failures using disposable source files only. @layer test @owner import */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const service = require('../src/service/release/defaultDataReleaseService');

/** Supplies isolated source discovery and in-memory ports; never starts a runtime or accesses a customer database. */
function fixture(t, aggregate) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'empty-release-discovery-'));
    const data = path.join(root, 'data');
    const original = { CONFIG: global.CONFIG, NODICS: global.NODICS, SERVICE: global.SERVICE };
    t.after(() => {
        Object.assign(global, original);
        fs.rmSync(root, { recursive: true, force: true });
    });
    for (const source of ['core', 'core-v001'])
        for (const directory of ['headers/identity', 'records/identity'])
            fs.mkdirSync(path.join(data, source, directory), { recursive: true });
    if (aggregate) fs.writeFileSync(path.join(data, 'manifest.json'), JSON.stringify({ contractVersion: 2, module: 'example.inventory', sections: {} }));
    const state = require('./helpers/releaseExecution')({ modules: { 'example.inventory': { name: 'example.inventory', path: root, index: '1' } } });
    return { root, data, state };
}

for (const aggregate of [false, true]) {
    test(`undeclared empty legacy/versioned scaffolding produces no release, aggregate=${aggregate}`, t => {
        const f = fixture(t, aggregate);
        assert.deepEqual(service.discoverReleases('core'), []);
        assert.deepEqual(f.state.imports, []);
        assert.deepEqual(f.state.installations, []);
        fs.writeFileSync(path.join(f.data, 'core-v001/headers/itemHeader.js'), 'module.exports = {};\n');
        fs.writeFileSync(path.join(f.data, 'core-v001/records/itemData.js'), 'module.exports = { record0: { code: "item" } };\n');
        const discovered = service.discoverReleases('core');
        assert.equal(discovered.length, 1);
        assert.equal(discovered[0].releaseCode, 'example.inventory:core-v001');
        assert.equal(discovered[0].invalidManifest, undefined);
        assert.equal(discovered[0].declaredFiles.length, 2);
    });
}

test('an explicitly declared empty source remains an invalid release', t => {
    const f = fixture(t, true);
    fs.writeFileSync(path.join(f.data, 'manifest.json'), JSON.stringify({ contractVersion: 2, module: 'example.inventory', sections: {
        foundation: { kind: 'DATA_RELEASE', dataType: 'core', sourceRoot: 'core-v001', version: '0.0.1',
            owningDomain: 'example.inventory', lifecycle: 'REFERENCE', environmentScope: ['ALL'],
            sensitivity: 'INTERNAL', versioningPolicy: 'NONE', publicationPolicy: 'NONE',
            initialPublicationPolicy: 'NONE', removalPolicy: 'RETAIN' }
    } }));
    const discovered = service.discoverReleases('core');
    assert.equal(discovered.length, 1);
    assert.equal(discovered[0].releaseCode, 'example.inventory:foundation');
    assert.equal(discovered[0].invalidManifest, true);
    assert.match(discovered[0].invalidReason, /file count/);
});

test('a malformed aggregate remains visible even when its conventional folders are empty', t => {
    const f = fixture(t, false);
    fs.writeFileSync(path.join(f.data, 'manifest.json'), '{');
    const discovered = service.discoverReleases('core');
    assert.equal(discovered.length, 1);
    assert.equal(discovered[0].invalidManifest, true);
    assert.match(discovered[0].invalidReason, /JSON/);
});

test('descriptor-only conventional sources retain their invalid release evidence', t => {
    const f = fixture(t, false);
    fs.writeFileSync(path.join(f.data, 'core-v001/release.descriptor.json'), '{}\n');
    const discovered = service.discoverReleases('core');
    assert.equal(discovered.length, 1);
    assert.equal(discovered[0].invalidManifest, true);
    assert.match(discovered[0].invalidReason, /file count/);
});

test('empty directory symlinks cannot masquerade as safe empty source scaffolding', t => {
    const f = fixture(t, false);
    fs.symlinkSync(path.join(f.data, 'core/records'), path.join(f.data, 'core-v001/records/escape'), 'dir');
    const discovered = service.discoverReleases('core');
    assert.equal(discovered.length, 1);
    assert.equal(discovered[0].invalidManifest, true);
    assert.match(discovered[0].invalidReason, /symlink/);
});

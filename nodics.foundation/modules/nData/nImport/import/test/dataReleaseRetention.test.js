/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/test/dataReleaseRetention @description Independent retained-root integrity, discovery and receipt identity contracts. @layer test @owner import */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const service = require('../src/service/release/defaultDataReleaseService');

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-retention-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const data = path.join(root, 'data');
    for (const source of ['sample-v001', 'sample-v002', 'core-v001']) {
        fs.mkdirSync(path.join(data, source, 'records'), { recursive: true });
        fs.writeFileSync(path.join(data, source, 'records/item.js'), 'module.exports = { record0: { code: "item" } };\n');
    }
    fs.writeFileSync(path.join(data, 'sample-v001/release.descriptor.json'), '{}\n');
    const section = {
        kind: 'DATA_RELEASE', dataType: 'sample', sourceRoot: 'sample-v001', version: '1.0.0',
        owningDomain: 'example.inventory', lifecycle: 'PUBLISHABLE', destinationRole: 'WCMS_STAGED',
        environmentScope: ['LOCAL'], sensitivity: 'PUBLIC', versioningPolicy: 'IMMUTABLE',
        publicationPolicy: 'REQUIRED', initialPublicationPolicy: 'ADMIN_INITIATED', removalPolicy: 'UNPUBLISH_OR_RETIRE',
        files: Object.fromEntries(Object.entries(service.sourceRootFiles(data, 'sample-v001')).filter(([file]) => !file.endsWith('release.descriptor.json')))
    };
    const manifest = { contractVersion: 2, module: 'example.inventory', sections: {
        inventory: { ...section, version: '1.0.1', sourceRoot: 'sample-v002', files: service.sourceRootFiles(data, 'sample-v002') }
    }, retainedRoots: { 'sample-v001': { files: service.sourceRootFiles(data, 'sample-v001'), sections: { inventory: section } } } };
    const write = () => fs.writeFileSync(path.join(data, 'manifest.json'), JSON.stringify(manifest));
    write();
    require('./helpers/releaseExecution')({ modules: { 'example.inventory': { name: 'example.inventory', path: root, index: '1' } } });
    return { root, data, manifest, write };
}

test('retention hides only historical roots and preserves unrelated conventional defaults and receipt identity', t => {
    const f = fixture(t);
    const sample = service.discoverReleases('sample');
    assert.deepEqual(sample.map(item => item.releaseCode), ['example.inventory:inventory']);
    assert.equal(sample[0].manifestValid, undefined);
    assert.equal(sample[0].version, '1.0.1');
    assert.equal(sample[0].sourceRoot, 'sample-v002');
    const old = service.inspectManifest({ name: 'example.inventory', path: f.root }, 'sample', path.join(f.data, 'manifest.json'), f.manifest.retainedRoots['sample-v001'].sections.inventory, 'inventory');
    assert.equal(old.releaseCode, sample[0].releaseCode);
    assert.notEqual(old.checksum, sample[0].checksum);
    assert.equal(service.installationCode('exampleTenant', old), service.installationCode('exampleTenant', sample[0]));
    const installed = { version: old.version, checksum: old.checksum, status: 'CURRENT', runId: 'historical-run' };
    const snapshot = structuredClone(installed);
    assert.equal(service.validateUpgradePolicy(sample[0], installed), true);
    const projected = service.toCatalogueItem(sample[0], installed, false);
    assert.equal(projected.status, 'UPDATE_AVAILABLE');
    assert.equal(projected.installedChecksum, old.checksum);
    assert.equal(projected.installedVersion, '1.0.0');
    assert.deepEqual(installed, snapshot);
    assert.throws(() => service.validateUpgradePolicy({ ...sample[0], version: old.version }, installed), /without a version change/);
    assert.equal(service.discoverReleases('core')[0].releaseCode, 'example.inventory:core-v001');
    delete f.manifest.retainedRoots; f.write();
    assert(service.discoverReleases('sample').some(item => item.releaseCode === 'example.inventory:sample-v001'));
});

test('retained bytes, metadata and membership are immutable; invalid retention prevents fallback discovery', t => {
    for (const relative of ['records/item.js', 'release.descriptor.json', 'records/extra.js']) {
        const f = fixture(t);
        fs.writeFileSync(path.join(f.data, 'sample-v001', relative), 'changed');
        assert.throws(() => service.validateRetainedRoots(f.data, f.manifest), /checksum|membership/);
        const releases = service.discoverReleases('sample');
        assert.equal(releases.length, 1);
        assert.equal(releases[0].checksum, 'invalid-release');
    }
});

test('retention rejects malformed maps, conflicts, identity/version drift, missing sources and traversal', t => {
    const f = fixture(t);
    for (const mutate of [
        m => { m.retainedRoots = []; },
        m => { m.retainedRoots['../escape'] = m.retainedRoots['sample-v001']; },
        m => { m.sections.other = { kind: 'CONTENT_PACK', contentPath: 'sample-v001/records' }; },
        m => { m.sections.other = { kind: 'DATA_RELEASE', sourceRoot: 'sample-v001' }; },
        m => { m.sections.inventory.version = '1.0.0'; },
        m => { delete m.sections.inventory; },
        m => { m.sections.inventory.sourceRoot = 'sample-v099'; },
        m => { m.sections.inventory.files = { '../escape': 'a'.repeat(64) }; },
        m => { m.retainedRoots['sample-v001'].sections.inventory.files = { '../escape': 'a'.repeat(64) }; },
        m => { m.retainedRoots['sample-v001'].files['../escape'] = 'a'.repeat(64); },
        m => { m.retainedRoots['sample-v001'].sections.inventory.files = { 'sample-v001/release.descriptor.json': m.retainedRoots['sample-v001'].files['sample-v001/release.descriptor.json'] }; },
    ]) {
        const manifest = structuredClone(f.manifest); mutate(manifest);
        assert.throws(() => service.validateRetainedRoots(f.data, manifest));
    }
});

test('retention rejects linked roots and linked descendants, including links within the data directory', t => {
    const f = fixture(t);
    fs.symlinkSync(path.join(f.data, 'sample-v002/records/item.js'), path.join(f.data, 'sample-v001/records/link.js'));
    assert.throws(() => service.validateRetainedRoots(f.data, f.manifest), /symlink/);
    fs.unlinkSync(path.join(f.data, 'sample-v001/records/link.js'));
    fs.renameSync(path.join(f.data, 'sample-v001'), path.join(f.data, 'original'));
    fs.symlinkSync(path.join(f.data, 'original'), path.join(f.data, 'sample-v001'));
    assert.throws(() => service.validateRetainedRoots(f.data, f.manifest), /symlink/);
});

test('CONTENT_PACK retention preserves identity and verifies native hashes, aggregate checksum and contentPath sequence', t => {
    const f = fixture(t);
    const packService = require('../src/service/contentPack/defaultContentPackService');
    fs.cpSync(path.join(f.data, 'core-v001'), path.join(f.data, 'core-v002'), { recursive: true });
    const pack = (contentPath, version) => {
        const generatedHashes = service.sourceRootFiles(f.data, contentPath);
        return { kind: 'CONTENT_PACK', pack: 'example.documentation', contentPath, version, generatedHashes,
            releaseChecksum: packService.createReleaseChecksum(generatedHashes) };
    };
    const previous = pack('core-v001', '0.8.1');
    const manifest = { contractVersion: 2, module: 'example.inventory', sections: { documentation: pack('core-v002', '0.8.2') },
        retainedRoots: { 'core-v001': { files: service.sourceRootFiles(f.data, 'core-v001'), sections: { documentation: previous } } } };
    assert.deepEqual([...service.validateRetainedRoots(f.data, manifest)], ['core-v001']);
    fs.writeFileSync(path.join(f.data, 'manifest.json'), JSON.stringify(manifest));
    assert.deepEqual(service.discoverReleases('core'), [], 'Neither historical nor active content packs become conventional data releases');
    const before = structuredClone(previous);
    for (const mutate of [
        m => { m.sections.documentation.pack = 'renamed.pack'; },
        m => { m.sections.documentation.version = '0.8.0'; },
        m => { m.sections.documentation.contentPath = 'core-v001'; },
        m => { m.sections.documentation.releaseChecksum = 'a'.repeat(64); },
        m => { m.retainedRoots['core-v001'].sections.documentation.releaseChecksum = 'a'.repeat(64); },
        m => { m.retainedRoots['core-v001'].sections.documentation.generatedHashes = { '../escape': 'a'.repeat(64) }; },
    ]) {
        const candidate = structuredClone(manifest); mutate(candidate);
        assert.throws(() => service.validateRetainedRoots(f.data, candidate));
    }
    assert.deepEqual(previous, before);
    fs.writeFileSync(path.join(f.data, 'core-v001/records/item.js'), 'tampered');
    assert.throws(() => service.validateRetainedRoots(f.data, manifest), /checksum/);
});

test('section retention permits active sibling changes but prevents retired payload prefix replay and overlapping claims', t => {
    const f = fixture(t);
    const root = 'sample-v001';
    const retained = f.manifest.retainedRoots[root];
    retained.scope = 'SECTIONS';
    retained.files = { ...retained.sections.inventory.files };
    fs.mkdirSync(path.join(f.data, root, 'headers'));
    fs.writeFileSync(path.join(f.data, root, 'headers/sibling.js'), 'module.exports = { target: { row: { options: { dataFilePrefix: "item" } } } };');
    fs.writeFileSync(path.join(f.data, root, 'records/itemSibling.js'), 'module.exports = {};');
    const actual = service.sourceRootFiles(f.data, root);
    f.manifest.sections.sibling = { ...retained.sections.inventory, version: '0.0.0', files: {
        [root + '/headers/sibling.js']: actual[root + '/headers/sibling.js'],
        [root + '/records/itemSibling.js']: actual[root + '/records/itemSibling.js']
    } };
    f.write();
    assert.deepEqual([...service.validateRetainedRoots(f.data, f.manifest)], [root]);
    fs.writeFileSync(path.join(f.data, root, 'records/itemSibling.js'), 'module.exports = { changed: true };');
    assert.doesNotThrow(() => service.validateRetainedRoots(f.data, f.manifest));
    const sibling = service.discoverReleases('sample').find(item => item.sectionCode === 'sibling');
    assert(sibling.declaredFiles.includes(root + '/records/itemSibling.js'));
    assert(!sibling.declaredFiles.includes(root + '/records/item.js'), 'Broad prefix must not replay retained records');
    f.manifest.sections.sibling.files[root + '/records/item.js'] = actual[root + '/records/item.js'];
    assert.throws(() => service.validateRetainedRoots(f.data, f.manifest), /conflict/);
    delete f.manifest.sections.sibling.files[root + '/records/item.js'];
    retained.files[root + '/records/itemSibling.js'] = actual[root + '/records/itemSibling.js'];
    assert.throws(() => service.validateRetainedRoots(f.data, f.manifest), /checksum|exactly/);
});

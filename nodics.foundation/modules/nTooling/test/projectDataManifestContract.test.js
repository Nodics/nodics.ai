/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectDataManifestContract
 * @description Exercises arbitrary project module manifests, full-plan validation, immutable releases, and filesystem containment.
 * @layer test
 * @owner nTooling
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const service = require('../src/service/project/defaultProjectDataManifestService');
function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'project-manifest-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'example.application', nodics: { kind: 'application' } }));
    const data = path.join(root, 'modules/warehouse/data');
    fs.mkdirSync(path.join(data, 'core-v001/records'), { recursive: true });
    fs.writeFileSync(path.join(data, '../package.json'), JSON.stringify({ name: 'example.warehouse', nodics: { kind: 'module' } }));
    fs.writeFileSync(path.join(data, 'core-v001/records/items.js'), 'module.exports = { record0: { code: "warehouse-item" } };');
    const manifest = { contractVersion: 2, module: 'example.warehouse', sections: { core: {
        kind: 'DATA_RELEASE', dataType: 'core', version: '0.0.0', files: { 'core-v001/records/items.js': 'outdated' }
    } } };
    const manifestPath = path.join(data, 'manifest.json');
    const write = () => fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    write();
    return { root, data, manifest, manifestPath, write };
}
test('generic checksum command only refreshes declared development files in the selected module', t => {
    const f = fixture(t);
    assert.throws(() => service.run({ projectRoot: f.root, check: true }), /require refresh/);
    const result = service.run({ projectRoot: f.root, module: 'example.warehouse' });
    assert.deepEqual(result, [{ module: 'example.warehouse', changedFiles: 1 }]);
    assert.equal(service.run({ projectRoot: f.root, check: true })[0].changedFiles, 0);
    assert.throws(() => service.plan({ projectRoot: f.root, module: 'unavailable' }), /unavailable/);
    assert.equal(fs.existsSync(path.join(f.root, 'data')), false, 'No invented application pack');
});
test('an immutable or escaping release prevents every manifest write', t => {
    const f = fixture(t);
    f.manifest.sections.stable = { kind: 'DATA_RELEASE', version: '1.0.0', files: { 'core-v001/records/items.js': 'outdated' } };
    f.write();
    const before = fs.readFileSync(f.manifestPath, 'utf8');
    assert.throws(() => service.run({ projectRoot: f.root }), /Immutable release/);
    assert.equal(fs.readFileSync(f.manifestPath, 'utf8'), before);
    delete f.manifest.sections.stable;
    f.manifest.sections.core.files = { '../package.json': 'outdated' }; f.write();
    assert.throws(() => service.run({ projectRoot: f.root }), /leaves the owning/);
    const outside = path.join(f.root, 'outside.js'); fs.writeFileSync(outside, 'outside');
    fs.symlinkSync(outside, path.join(f.data, 'core-v001/records/escape.js'));
    f.manifest.sections.core.files = { 'core-v001/records/escape.js': 'outdated' }; f.write();
    assert.throws(() => service.run({ projectRoot: f.root }), /outside its owning/);
});

test('manifest paths and section shapes are validated before writes', t => {
    const f = fixture(t);
    for (const invalid of [[], null, 'invalid']) {
        f.manifest.sections = invalid; f.write();
        assert.throws(() => service.plan({ projectRoot: f.root }), /contractVersion 2/);
    }
    f.manifest.sections = { core: null }; f.write();
    assert.throws(() => service.plan({ projectRoot: f.root }), /section must be an object/);
    const outside = path.join(f.root, 'external-manifest.json');
    fs.renameSync(f.manifestPath, outside);
    fs.symlinkSync(outside, f.manifestPath);
    assert.throws(() => service.run({ projectRoot: f.root }), /outside its owning project module/);
});

test('forward planning retains exact historical metadata and files without writing or changing identity', t => {
    const f = fixture(t);
    service.run({ projectRoot: f.root });
    const manifest = JSON.parse(fs.readFileSync(f.manifestPath));
    manifest.sections.core.sourceRoot = 'core-v001';
    manifest.sections.core.version = '1.0.0';
    fs.writeFileSync(path.join(f.data, 'core-v001/release.descriptor.json'), '{}\n');
    fs.cpSync(path.join(f.data, 'core-v001'), path.join(f.data, 'core-v002'), { recursive: true });
    fs.writeFileSync(path.join(f.data, 'core-v002/records/items.js'), 'module.exports = { record0: { code: "next" } };');
    const before = fs.readFileSync(f.manifestPath);
    const next = service.planForwardRelease({ dataRoot: f.data, manifest, sectionCode: 'core', sourceRoot: 'core-v002', version: '1.0.1' });
    assert.deepEqual(fs.readFileSync(f.manifestPath), before);
    assert.deepEqual(next.retainedRoots['core-v001'].sections.core, manifest.sections.core);
    assert(next.retainedRoots['core-v001'].files['core-v001/release.descriptor.json']);
    assert.equal(next.sections.core.version, '1.0.1');
    assert.equal(manifest.sections.core.version, '1.0.0');
    fs.writeFileSync(f.manifestPath, JSON.stringify(next));
    assert.equal(service.run({ projectRoot: f.root, check: true })[0].changedFiles, 0);
    fs.cpSync(path.join(f.data, 'core-v002'), path.join(f.data, 'core-v003'), { recursive: true });
    const third = service.planForwardRelease({ dataRoot: f.data, manifest: next, sectionCode: 'core', sourceRoot: 'core-v003', version: '1.0.2' });
    assert.deepEqual(Object.keys(third.retainedRoots), ['core-v001', 'core-v002']);
    assert.deepEqual(third.retainedRoots['core-v001'], next.retainedRoots['core-v001']);
    assert.deepEqual(third.retainedRoots['core-v002'].sections.core, next.sections.core);
    for (const options of [ { version: '1.0.0' }, { sourceRoot: 'core-v001' }, { sourceRoot: '../escape' } ]) {
        assert.throws(() => service.planForwardRelease({ dataRoot: f.data, manifest, sectionCode: 'core', sourceRoot: 'core-v002', version: '1.0.1', ...options }));
    }
    fs.writeFileSync(path.join(f.data, 'core-v001/records/items.js'), 'changed');
    assert.throws(() => service.planForwardRelease({ dataRoot: f.data, manifest, sectionCode: 'core', sourceRoot: 'core-v002', version: '1.0.1' }), /Immutable release/);
    assert.throws(() => service.run({ projectRoot: f.root }), /checksum/);
    assert.deepEqual(JSON.parse(fs.readFileSync(f.manifestPath)), next);
});

test('section-scoped forward planning leaves shared-root siblings active and independently mutable', t => {
    const f = fixture(t);
    service.run({ projectRoot: f.root });
    const manifest = JSON.parse(fs.readFileSync(f.manifestPath));
    manifest.sections.core.sourceRoot = 'core-v001';
    manifest.sections.core.version = '1.0.0';
    fs.writeFileSync(path.join(f.data, 'core-v001/records/sibling.js'), 'module.exports = {};');
    const policy = require('../../nData/nImport/import/src/service/release/defaultDataReleaseService');
    manifest.sections.sibling = { ...manifest.sections.core, version: '0.0.0', files: {
        'core-v001/records/sibling.js': policy.sourceRootFiles(f.data, 'core-v001')['core-v001/records/sibling.js']
    } };
    fs.mkdirSync(path.join(f.data, 'core-v002/records'), { recursive: true });
    fs.copyFileSync(path.join(f.data, 'core-v001/records/items.js'), path.join(f.data, 'core-v002/records/items.js'));
    const next = service.planForwardRelease({ dataRoot: f.data, manifest, sectionCode: 'core', sourceRoot: 'core-v002', version: '1.0.1', retentionScope: 'SECTIONS' });
    assert.deepEqual(next.sections.sibling, manifest.sections.sibling);
    assert.deepEqual(next.retainedRoots['core-v001'].files, manifest.sections.core.files);
    assert.equal(next.retainedRoots['core-v001'].scope, 'SECTIONS');
    assert(!Object.keys(next.sections.core.files).some(file => file.endsWith('sibling.js')));
    fs.writeFileSync(path.join(f.data, 'core-v001/records/sibling.js'), 'module.exports = { changed: true };');
    assert.doesNotThrow(() => policy.validateRetainedRoots(f.data, next));
    fs.writeFileSync(f.manifestPath, JSON.stringify(next));
    assert.equal(service.run({ projectRoot: f.root })[0].changedFiles, 1);
    assert.deepEqual(JSON.parse(fs.readFileSync(f.manifestPath)).retainedRoots, next.retainedRoots);
});

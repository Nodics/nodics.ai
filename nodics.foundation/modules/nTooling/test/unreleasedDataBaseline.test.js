/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/unreleasedDataBaseline @description Current source-baseline assertions, never runtime release restrictions. @layer test @owner nTooling */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const service = require('../src/service/project/defaultProjectDataManifestService');
const release = require('../../nData/nImport/import/src/service/release/defaultDataReleaseService');
const importRoot = path.resolve(__dirname, '../../nData/nImport/import');

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-unreleased-source-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'import', nodics: { kind: 'module' } }));
    const section = JSON.parse(fs.readFileSync(path.join(importRoot, 'data/manifest.json'))).sections.permissionCatalogue;
    for (const file of Object.keys(section.files)) {
        const destination = path.join(root, 'data', file);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(path.join(importRoot, 'data', file), destination);
    }
    const manifest = { contractVersion: 2, module: 'import', sections: { permissionCatalogue: section } };
    const write = () => fs.writeFileSync(path.join(root, 'data/manifest.json'), JSON.stringify(manifest));
    write();
    return { root, manifest, write, check: () => service.validateUnreleasedBaseline({ projectRoot: root }) };
}

test('baseline is read-only, checks the Release 0 version and excludes deliberate test modules', t => {
    const f = fixture(t);
    f.manifest.sections.permissionCatalogue.version = '7.8.9'; f.write();
    assert.throws(f.check, /Release 0 data requires manifest version/);
    f.manifest.sections.permissionCatalogue.version = '0.0.1'; f.write();
    const before = fs.readFileSync(path.join(f.root, 'data/manifest.json'));
    const excluded = path.join(f.root, 'test/fixtures/versioned');
    fs.mkdirSync(path.join(excluded, 'data/sample-v902'), { recursive: true });
    fs.writeFileSync(path.join(excluded, 'package.json'), JSON.stringify({ name: 'deliberateTest', nodics: { kind: 'module' } }));
    fs.writeFileSync(path.join(excluded, 'data/manifest.json'), '{invalid test-only manifest');
    const result = f.check();
    assert.equal(result.effects, false);
    assert.equal(result.sections[0].version, '0.0.1');
    assert.deepEqual(fs.readFileSync(path.join(f.root, 'data/manifest.json')), before);
});

test('baseline rejects non-v001 sources and retained snapshots including within v001', t => {
    const f = fixture(t);
    fs.mkdirSync(path.join(f.root, 'data/sample-v902'));
    assert.throws(f.check, /v001/);
    fs.rmdirSync(path.join(f.root, 'data/sample-v902'));
    f.manifest.retainedRoots = {}; f.write();
    assert.throws(f.check, /retained|retain/);
    delete f.manifest.retainedRoots;
    f.manifest.sections.permissionCatalogue.sourceRoot = 'init-v002'; f.write();
    assert.throws(f.check, /v001/);
});

test('canonical owner validation rejects missing files and checksum drift without refresh', t => {
    const f = fixture(t), file = Object.keys(f.manifest.sections.permissionCatalogue.files)[0];
    const absolute = path.join(f.root, 'data', file), before = fs.readFileSync(absolute);
    fs.unlinkSync(absolute);
    assert.throws(f.check);
    fs.writeFileSync(absolute, Buffer.concat([before, Buffer.from('\n// drift\n')]));
    assert.throws(f.check);
    fs.writeFileSync(absolute, before);
    assert.equal(f.check().effects, false);
});

test('superseded files left inside v001 are not shipping baseline payload', t => {
    const f = fixture(t);
    fs.writeFileSync(path.join(f.root, 'data/init-v001/superseded.js'), 'module.exports = {};');
    assert.throws(f.check, /Unselected baseline payload/);
});

test('canonical prerequisite pins detect missing targets, changed versions and changed hashes', t => {
    const f = fixture(t);
    const owner = Object.assign(Object.create(release), { configuration: () => require('../../nData/nImport/import/config/properties').data.dataReleases });
    const descriptor = owner.inspectManifest({ name: 'import', path: f.root }, 'init', path.join(f.root, 'data/manifest.json'), f.manifest.sections.permissionCatalogue, 'permissionCatalogue', true);
    const pin = { moduleName: 'import', sectionCode: 'permissionCatalogue', version: descriptor.version, checksum: descriptor.checksum };
    f.manifest.sections.consumer = { ...structuredClone(f.manifest.sections.permissionCatalogue), prerequisites: [pin] }; f.write();
    assert.equal(f.check().sections.length, 2);
    for (const patch of [{ sectionCode: 'missing' }, { version: '9.9.9' }, { checksum: '0'.repeat(64) }]) {
        f.manifest.sections.consumer.prerequisites = [{ ...pin, ...patch }]; f.write();
        assert.throws(f.check, /prerequisite drift/);
    }
});

test('offline inspection never evaluates bootstrap records or replaces runtime discovery', t => {
    const f = fixture(t);
    const section = f.manifest.sections.permissionCatalogue;
    const file = 'init-v001/records/bootstrapProbe.js';
    fs.mkdirSync(path.dirname(path.join(f.root, 'data', file)), { recursive: true });
    fs.writeFileSync(path.join(f.root, 'data', file), 'throw new Error("bootstrap must not execute");');
    const hash = require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(f.root, 'data', file))).digest('hex');
    f.manifest.sections.bootstrapProbe = { ...structuredClone(section), files: { [file]: hash } };
    f.write();
    const original = release.currentReleaseFiles;
    assert.equal(f.check().sections.length, 2);
    assert.equal(release.currentReleaseFiles, original);
    const owner = Object.assign(Object.create(release), { configuration: () => require('../../nData/nImport/import/config/properties').data.dataReleases });
    assert.throws(() => owner.inspectManifest({ name: 'import' }, 'init', path.join(f.root, 'data/manifest.json'), f.manifest.sections.bootstrapProbe, 'bootstrapProbe', true), /bootstrap must not execute/);
});

test('current framework shipping manifests use the unreleased owner baseline', () => {
    const frameworkRoot = path.resolve(__dirname, '../../../..');
    const result = service.validateUnreleasedBaseline({ projectRoot: frameworkRoot });
    assert.ok(result.sections.length > 0);
});

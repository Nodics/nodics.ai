/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/test/contentPackIsolation @description Proves optional documentation cannot import adjacent business files or escape its selected release. @layer test @owner import */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const definition = require('../src/service/contentPack/defaultContentPackService');
const releaseHarness = require('./helpers/releaseExecution');

/** Builds an independent partner pack containing records, a header and binary media. */
function fixture(t, contentPath = 'docs-v001') {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-pack-isolation-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const write = (file, bytes) => {
        fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        fs.writeFileSync(path.join(root, file), bytes);
    };
    const files = {
        'headers/partnerHeader.js': Buffer.from('module.exports = {};\n'),
        'records/documentation/partnerPageData.js': Buffer.from('module.exports = [{code:"guide"}];\n'),
        'assets/documentation/image.png': Buffer.from([137, 80, 78, 71, 0, 255])
    };
    const hashes = {};
    for (const [file, bytes] of Object.entries(files)) {
        const relative = contentPath + '/' + file;
        write('data/' + relative, bytes);
        hashes[relative] = crypto.createHash('sha256').update(bytes).digest('hex');
    }
    write('data/' + contentPath + '/headers/customerUsersHeader.js', 'module.exports = {users:{}};');
    write('data/' + contentPath + '/records/customerUsersData.js', 'module.exports = [{code:"employee"}];');
    const section = { kind: 'CONTENT_PACK', pack: 'partner.catalogue', version: '0.0.0', contentPath, generatedHashes: hashes };
    const save = () => write('data/manifest.json', JSON.stringify({ contractVersion: 2, module: 'partner.catalogue', sections: { documentation: section } }));
    save();
    global.CONFIG = { get: key => key === 'data' ? { dataDirName: 'temp' } : undefined };
    global.NODICS = { getEnvironmentPath: () => root, getServerPath: () => path.join(root, 'runtime') };
    global.CLASSES = { DataImportError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    const service = Object.assign({}, definition);
    const context = { enabled: true, configuration: { allowedContractVersions: [2] },
        pack: { manifestPack: 'partner.catalogue' }, source: { type: 'LOCAL_PROJECT', manifestPath: 'data/manifest.json', manifestSection: 'documentation' } };
    return { root, files, section, save, write, service, context };
}

test('staging copies only declared files including binary media, even for legacy shared roots', t => {
    for (const folder of ['docs-v001', 'core-v001']) {
        const f = fixture(t, folder);
        const release = f.service.inspectRelease(f.context);
        const staged = f.service.prepareStaging(f.context, release, 'allowlisted');
        for (const [file, bytes] of Object.entries(f.files)) assert.deepEqual(fs.readFileSync(path.join(staged.inputPath, file)), bytes);
        assert.equal(fs.existsSync(path.join(staged.inputPath, 'headers/customerUsersHeader.js')), false);
        assert.equal(fs.existsSync(path.join(staged.inputPath, 'records/customerUsersData.js')), false);
        assert.equal(fs.existsSync(path.join(f.root, 'data', folder, 'headers/partnerHeader.js')), true);
    }
});

test('source changes after inspection fail closed and clean up incomplete staging', t => {
    const f = fixture(t);
    const release = f.service.inspectRelease(f.context);
    f.write('data/docs-v001/records/documentation/partnerPageData.js', 'changed');
    assert.throws(() => f.service.prepareStaging(f.context, release, 'changed'), /changed before staging/);
    assert.equal(fs.existsSync(path.join(f.root, 'runtime/temp/import/content-packs/changed')), false);
});

test('undiscoverable nested or absent headers fail before local import and clean staging', t => {
    for (const nested of [true, false]) {
        const f = fixture(t);
        const original = 'docs-v001/headers/partnerHeader.js';
        const hash = f.section.generatedHashes[original];
        delete f.section.generatedHashes[original];
        if (nested) {
            const replacement = 'docs-v001/headers/documentation/partnerHeader.js';
            f.write('data/' + replacement, f.files['headers/partnerHeader.js']);
            f.section.generatedHashes[replacement] = hash;
        }
        f.save();
        const release = f.service.inspectRelease(f.context);
        assert.throws(() => f.service.prepareStaging(f.context, release, 'undiscoverable'), /discoverable/);
        assert.equal(fs.existsSync(path.join(f.root, 'runtime/temp/import/content-packs/undiscoverable')), false);
    }
});

test('staged Media pointers resolve through finalized header release roots', t => {
    const f = fixture(t);
    const staged = f.service.prepareStaging(f.context, f.service.inspectRelease(f.context), 'media-roots');
    const headers = require('../src/service/header/defaultHeaderProcessService');
    const hydration = require('../src/service/media/defaultMediaReleaseAssetHydrationService');
    const sourceFile = path.join(staged.inputPath, 'records/documentation/partnerPageData.js');
    const assetBaseRoots = headers.resolveAssetBaseRoots([sourceFile]);
    assert.deepEqual(assetBaseRoots, [staged.inputPath]);
    const request = { header: { options: { assetBaseRoots } },
        sourceDataFile: path.join(staged.outputPath, 'data/partnerPageData_processing.js') };
    assert.equal(hydration.resolveSourcePath(request, 'assets/documentation/image.png'),
        path.join(staged.inputPath, 'assets/documentation/image.png'));
});

test('declared files cannot escape the selected content root even within the same repository', t => {
    const f = fixture(t);
    const bytes = Buffer.from('module.exports = [];');
    f.write('data/core-v001/records/users.js', bytes);
    f.section.generatedHashes['core-v001/records/users.js'] = crypto.createHash('sha256').update(bytes).digest('hex');
    f.save();
    assert.throws(() => f.service.inspectRelease(f.context), /escapes/);
});

test('symlinked files and content roots cannot cross repository or pack boundaries', t => {
    const f = fixture(t);
    const file = path.join(f.root, 'data/docs-v001/assets/documentation/image.png');
    const outside = path.join(f.root, 'outside.png');
    fs.copyFileSync(file, outside);
    fs.unlinkSync(file);
    fs.symlinkSync(outside, file);
    assert.throws(() => f.service.inspectRelease(f.context), /symlink/);
    fs.unlinkSync(file);
    fs.copyFileSync(outside, file);
    const external = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-external-pack-'));
    t.after(() => fs.rmSync(external, { recursive: true, force: true }));
    fs.cpSync(path.join(f.root, 'data/docs-v001'), path.join(external, 'docs'), { recursive: true });
    fs.rmSync(path.join(f.root, 'data/docs-v001'), { recursive: true });
    fs.symlinkSync(path.join(external, 'docs'), path.join(f.root, 'data/docs-v001'));
    assert.throws(() => f.service.inspectRelease(f.context), /symlink/);
});

test('empty or array checksum maps are invalid packs', t => {
    const f = fixture(t);
    for (const hashes of [{}, []]) {
        f.section.generatedHashes = hashes;
        f.save();
        assert.throws(() => f.service.inspectRelease(f.context), /incompatible/);
    }
});

test('documentation is excluded from all business release discovery and activation plans', async t => {
    for (const folder of ['docs-v001', 'core-v001']) {
        const f = fixture(t, folder);
        const owner = { name: 'partner.catalogue', path: f.root };
        const harness = releaseHarness({ modules: { 'partner.catalogue': owner }, runtimeRole: 'WCMS_STAGED' });
        for (const type of ['init', 'core', 'sample']) assert.deepEqual(harness.service.discoverReleases(type), []);
        assert.deepEqual(harness.service.discoverReleases(), []);
        await assert.rejects(harness.service.preparePlan({ releaseRequest: { dataType: 'core', modules: [owner.name] } }), /unavailable/);
        assert.equal(harness.imports.length, 0);
    }
});

test('explicit composition stages selected sources once and binds child checksums', t => {
    const parent = fixture(t), child = fixture(t);
    const childFile = 'docs-v001/records/documentation/childPageData.js';
    const bytes = Buffer.from('module.exports = [{code:"child"}];\n');
    child.write('data/' + childFile, bytes);
    child.section.generatedHashes = { [childFile]: crypto.createHash('sha256').update(bytes).digest('hex') };
    child.save();
    parent.service.resolveRepositoryPath = source => source.type === 'LOCAL_PROJECT' ? parent.root : child.root;
    const include = { manifestPack: 'partner.catalogue', source: { type: 'LOCAL_SIBLING', repositoryName: 'partner.child', manifestPath: 'data/manifest.json', manifestSection: 'documentation' } };
    parent.section.includes = [include, include]; parent.save();
    const release = parent.service.inspectRelease(parent.context);
    const staging = parent.service.prepareStaging(parent.context, release, 'composed');
    assert.deepEqual(fs.readFileSync(path.join(staging.inputPath, 'records/documentation/childPageData.js')), bytes);
    assert.equal(fs.existsSync(path.join(staging.inputPath, 'records/customerUsersData.js')), false);
    child.write('data/' + childFile, 'changed');
    assert.throws(() => parent.service.prepareStaging(parent.context, release, 'changed-child'), /changed before staging/);
    child.section.generatedHashes[childFile] = crypto.createHash('sha256').update('changed').digest('hex'); child.save();
    assert.notEqual(parent.service.inspectRelease(parent.context).checksum, release.checksum);
    parent.section.includes = [include, { ...include, manifestPack: 'wrong.identity' }]; parent.save();
    assert.throws(() => parent.service.inspectRelease(parent.context), /identity|incompatible/);
});

test('composition rejects cycles, missing sections and conflicting files before import', t => {
    const f = fixture(t);
    f.section.includes = [{ manifestPack: 'partner.catalogue', source: f.context.source }]; f.save();
    assert.throws(() => f.service.inspectRelease(f.context), /cycle/);
    f.section.includes[0].source = { ...f.context.source, manifestSection: 'absent' }; f.save();
    assert.throws(() => f.service.inspectRelease(f.context), /unavailable/);
    const child = fixture(t);
    child.write('data/docs-v001/records/documentation/partnerPageData.js', 'conflicting');
    child.section.generatedHashes['docs-v001/records/documentation/partnerPageData.js'] = crypto.createHash('sha256').update('conflicting').digest('hex'); child.save();
    f.service.resolveRepositoryPath = source => source.type === 'LOCAL_PROJECT' ? f.root : child.root;
    f.section.includes = [{ manifestPack: 'partner.catalogue', source: { type: 'LOCAL_SIBLING', repositoryName: 'partner.child', manifestPath: 'data/manifest.json', manifestSection: 'documentation' } }]; f.save();
    const release = f.service.inspectRelease(f.context);
    assert.throws(() => f.service.prepareStaging(f.context, release, 'conflict'), /conflicting files/);
});

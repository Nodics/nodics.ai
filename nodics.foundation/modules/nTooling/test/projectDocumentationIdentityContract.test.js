/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/projectDocumentationIdentityContract @description Verifies canonical CMS records, read-only commands, Media declarations and integrity failures for arbitrary application owners. @layer test @owner nTooling */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const contract = require('../src/service/defaultApplicationDocumentationContractService');
const script = path.resolve(__dirname, '../src/service/project/defaultProjectDocumentationContentService.mjs');

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'documentation-records-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const directory = path.join(root, 'data/docs-v001/records/documentation');
    fs.mkdirSync(directory, { recursive: true });
    const assets = path.join(root, 'data/docs-v001/assets/documentation');
    fs.mkdirSync(assets, { recursive: true });
    fs.writeFileSync(path.join(assets, 'image.png'), Buffer.from([137, 80, 78, 71]));
    const paragraph = 'A beginner business developer and operator inspect the documented application before production publication. Review ownership, access policies, source evidence, validation and rejected requests before changing deployment configuration. ';
    const blocks = ['Purpose', 'Ownership', 'Usage', 'Common mistakes', 'Verification'].flatMap(title => [
        { kind: 'heading', level: 2, text: title },
        { kind: 'paragraph', text: paragraph.repeat(5) }
    ]);
    blocks.push({ kind: 'image', mediaCode: 'warehouseImage', alt: 'Warehouse ownership' });
    const properties = { code: 'warehouse.guide', title: 'Warehouse guide', summary: 'Warehouse operating guidance.',
        slug: 'warehouse-guide', locale: 'en', parentId: 'warehouse', hierarchyPath: ['Warehouse', 'Warehouse guide'], hierarchyDepth: 2,
        section: 'warehouse', sectionTitle: 'Warehouse', group: 'warehouse', groupTitle: 'Warehouse operations',
        documentType: 'overview', audience: ['business', 'developer', 'operator'], accessMode: 'PUBLIC', lifecycleState: 'ONLINE',
        maturityState: 'operational', relatedPages: [], sourceEvidence: ['data/manifest.json'], visualRequirements: ['image'],
        source: { functionalModule: 'warehouse.application', owner: 'warehouse.application' }, blocks };
    const sections = [{ code: 'warehouse', title: 'Warehouse', order: 10, summary: 'Warehouse operations.', accessMode: 'PUBLIC', lifecycleState: 'ONLINE' }];
    const records = {
        Component: { navigation: { renderer: 'documentation.component.navigation', properties: { sections, items: [{ code: 'warehouse.guide', section: 'warehouse', sectionTitle: 'Warehouse', groupTitle: 'Warehouse operations', order: 10 }] } },
            article: { code: 'warehouseArticle', renderer: 'documentation.component.article', properties } },
        PageMetadata: { page: { documentId: 'warehouse.guide', title: 'Warehouse guide', articleComponent: 'warehouseArticle', ownerFunctionalModule: 'warehouse.application' } },
        Product: { product: { code: 'warehouseDocumentation', name: 'Warehouse', publicRootPath: '/help/warehouse', channels: ['web'] } },
        Media: { image: { code: 'warehouseImage', access: 'PUBLIC', asset: { sourceFile: 'assets/documentation/image.png' } } }
    };
    const write = suffix => fs.writeFileSync(path.join(directory, 'warehouse' + suffix + 'Data.js'), 'module.exports = ' + JSON.stringify(records[suffix]) + ';\n');
    Object.keys(records).forEach(write);
    const generatedHashes = Object.fromEntries(Object.keys(records).map(suffix => {
        const file = 'docs-v001/records/documentation/warehouse' + suffix + 'Data.js';
        return [file, contract.sha256(fs.readFileSync(path.join(root, 'data', file)))];
    }));
    generatedHashes['docs-v001/assets/documentation/image.png'] = contract.sha256(fs.readFileSync(path.join(assets, 'image.png')));
    const section = { ...contract.buildReleaseSection({ catalogue: { pack: 'warehouse.application', version: '0.0.0', sourceMode: 'cms-records' },
        sourceAuthority: 'data/docs-v001/records/documentation', contentPath: 'docs-v001', generatedHashes,
        sites: ['warehouseSite'], pages: 1, components: 2, routes: 1 }) };
    const manifest = { contractVersion: 2, module: 'warehouse.application', sections: { documentation: section } };
    const manifestFile = path.join(root, 'data/manifest.json');
    const refresh = () => {
        for (const file of Object.keys(generatedHashes)) generatedHashes[file] = contract.sha256(fs.readFileSync(path.join(root, 'data', file)));
        section.releaseChecksum = contract.releaseChecksum(generatedHashes);
        fs.writeFileSync(manifestFile, JSON.stringify(manifest));
    };
    refresh();
    return { root, records, write, refresh, generatedHashes, section, run: args => spawnSync(process.execPath, [script, ...(args || [])], { cwd: root, env: { ...process.env, NODICS_PROJECT_ROOT: root }, encoding: 'utf8' }) };
}

test('selected application records are authoritative and compatibility commands are read-only', t => {
    const f = fixture(t);
    const before = fs.readFileSync(path.join(f.root, 'data/manifest.json'));
    for (const args of [[], ['--check']]) { const result = f.run(args); assert.equal(result.status, 0, result.stderr); }
    assert.deepEqual(fs.readFileSync(path.join(f.root, 'data/manifest.json')), before);
    assert.equal(fs.existsSync(path.join(f.root, 'docs')), false);
    const catalogue = contract.readDataCatalogue(f.root);
    assert.equal(catalogue.pack, 'warehouse.application');
    assert.equal(catalogue.publication.publicRootPath, '/help/warehouse');
    assert.equal(catalogue.documents[0].blocks.at(-1).mediaCode, 'warehouseImage');
    assert.match(catalogue.documents[0].body, /Warehouse ownership/);
});

test('record and asset tampering fail validation without rewriting source or manifest', t => {
    const f = fixture(t), manifest = fs.readFileSync(path.join(f.root, 'data/manifest.json'));
    fs.appendFileSync(path.join(f.root, 'data/docs-v001/records/documentation/warehouseComponentData.js'), '\n// changed bytes\n');
    const result = f.run(); assert.notEqual(result.status, 0); assert.match(result.stderr, /checksum mismatch/);
    assert.deepEqual(fs.readFileSync(path.join(f.root, 'data/manifest.json')), manifest);
    f.write('Component');
    fs.appendFileSync(path.join(f.root, 'data/docs-v001/assets/documentation/image.png'), 'changed');
    assert.throws(() => contract.validateDataRelease(f.root), /checksum mismatch/);
});

test('Media identity is required and raw source URLs cannot bypass release declarations', t => {
    const f = fixture(t), image = f.records.Component.article.properties.blocks.at(-1);
    image.mediaCode = 'undeclared'; f.write('Component'); f.refresh();
    assert.throws(() => contract.validateDataRelease(f.root), /declared Media identity/);
    image.mediaCode = 'warehouseImage'; image.source = 'https://example.com/image.png'; f.write('Component'); f.refresh();
    assert.throws(() => contract.validateDataRelease(f.root), /declared Media identity/);
});

test('unsafe record and asset paths cannot leave the owning module', t => {
    const f = fixture(t);
    f.records.Media.image.asset.sourceFile = '../../../../outside.png'; f.write('Media'); f.refresh();
    assert.throws(() => contract.validateDataRelease(f.root), /inside its owning module/);
    assert.throws(() => contract.containedPath(f.root, '../outside.js', 'record'), /inside its owning module/);
});

test('release checksum ordering matches the existing content-pack importer including assets', t => {
    const f = fixture(t);
    const importer = require('../../nData/nImport/import/src/service/contentPack/defaultContentPackService');
    assert.equal(contract.releaseChecksum(f.generatedHashes), importer.createReleaseChecksum(f.generatedHashes));
});

test('symlinked assets cannot cross ownership boundaries', t => {
    const f = fixture(t);
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'documentation-outside-'));
    t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
    const target = path.join(outside, 'image.png');
    fs.writeFileSync(target, Buffer.from([137, 80, 78, 71]));
    const asset = path.join(f.root, 'data/docs-v001/assets/documentation/image.png');
    fs.unlinkSync(asset);
    fs.symlinkSync(target, asset);
    assert.throws(() => contract.validateDataRelease(f.root), /symlink/);
});

test('changed executable record bytes are rejected before loading them', t => {
    const f = fixture(t);
    const file = path.join(f.root, 'data/docs-v001/records/documentation/warehouseComponentData.js');
    fs.appendFileSync(file, '\nthrow new Error("record executed before validation");');
    assert.throws(() => contract.validateDataRelease(f.root), /checksum mismatch/);
});

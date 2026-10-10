/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/dataBaselineConsolidationContract @description Verifies the initial framework baseline inventory and declarations after unreleased release consolidation. @layer test @owner nTooling */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const contract = require('../src/service/defaultApplicationDocumentationContractService');
const root = path.resolve(__dirname, '../../../..');

/** Finds production manifests without interpreting inert test fixtures as importable releases. */
function manifests(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        if (!entry.isDirectory() || entry.name.startsWith('.') || ['node_modules', 'test', 'logs', 'temp', 'generated', 'dist', 'coverage'].includes(entry.name)) return [];
        const next = path.join(directory, entry.name);
        if (entry.name === 'data') return fs.existsSync(path.join(next, 'manifest.json')) ? [path.join(next, 'manifest.json')] : [];
        return manifests(next);
    });
}

test('initial production release folders use v001 and every declared file matches its checksum', () => {
    const found = manifests(root);
    assert(found.length > 20);
    for (const file of found) {
        const directory = path.dirname(file), manifest = JSON.parse(fs.readFileSync(file));
        for (const entry of fs.readdirSync(directory)) {
            if (/^(docs|init|core|sample|project)-v\d{3}$/.test(entry)) assert.match(entry, /-v001$/, file + ': ' + entry);
        }
        for (const section of Object.values(manifest.sections || {})) {
            if (['DATA_RELEASE', 'CONTENT_PACK'].includes(section.kind)) {
                assert.equal(section.version, '0.0.1', file + ': unreleased initial baseline');
            }
            for (const [relative, checksum] of Object.entries(section.files || section.generatedHashes || {})) {
                const source = contract.containedPath(directory, relative, 'Declared data file');
                assert.equal(contract.sha256(fs.readFileSync(source)), checksum, file + ': ' + relative);
            }
            if (section.generatedHashes) assert.equal(section.releaseChecksum, contract.releaseChecksum(section.generatedHashes), file);
        }
    }
});

test('documentation is a separate optional pack and never part of a business section', () => {
    const catalogues = [];
    for (const file of manifests(root)) {
        const manifest = JSON.parse(fs.readFileSync(file));
        const documentationFiles = new Set(Object.keys(manifest.sections?.documentation?.generatedHashes || {}));
        for (const section of Object.values(manifest.sections || {})) {
            if (section.kind === 'DATA_RELEASE') {
                for (const relative of Object.keys(section.files || {})) {
                    assert.doesNotMatch(relative, /(^docs-v\d{3}\/|\/(records|assets)\/documentation\/)/, file);
                    assert.equal(documentationFiles.has(relative), false, file + ': ' + relative);
                }
            }
        }
        const docs = manifest.sections?.documentation;
        if (!docs) continue;
        assert.equal(docs.kind, 'CONTENT_PACK', file);
        assert.equal(docs.contentPath, 'docs-v001', file);
        assert.equal(docs.installationPolicy, 'OPTIONAL_AXIS_INITIATED', file);
        for (const relative of Object.keys(docs.generatedHashes || {})) assert(relative.startsWith('docs-v001/'), file + ': ' + relative);
        if (!Object.values(manifest.sections).some(section => section.kind === 'DATA_RELEASE')) {
            const owner = { name: manifest.module, path: path.dirname(path.dirname(file)) };
            const harness = require('../../nData/nImport/import/test/helpers/releaseExecution')({ modules: { [owner.name]: owner } });
            assert.deepEqual(harness.service.discoverReleases(), [], file + ' must not create synthetic business releases');
        }
        const ownerRoot = path.dirname(path.dirname(file));
        const catalogue = contract.validateDataRelease(ownerRoot);
        catalogues.push({ ...catalogue, documents: catalogue.documents.filter(document => document.ownerRoot === ownerRoot) });
    }
    assert(catalogues.length > 0);
    const graph = contract.validateReferenceGraph(catalogues);
    assert.equal(graph.documents, catalogues.reduce((count, catalogue) => count + catalogue.documents.length, 0));
});

test('Profile baseline declares identity and every previously separate authorization contribution', () => {
    const manifest = require('../../../../nodics.platform/modules/profile/data/manifest.json');
    const files = Object.keys(manifest.sections['init-v001'].files);
    for (const suffix of ['defaultEmployeeData.js', 'defaultServiceEmployeeData.js', 'defaultBootstrapUserGroupsData.js', 'runtimeConfigurationUserGroupsData.js', 'runtimeConfigurationUpdateUserGroupsData.js', 'serviceAccountCircaUserGroupsData.js', 'backofficeCircaUserGroupsData.js']) {
        assert(files.some(file => file.endsWith('/' + suffix)), suffix + ' must remain importable');
    }
});

test('canonical CMS guides do not direct maintainers to retired Markdown authoring sources', () => {
    for (const file of manifests(root)) {
        const directory = path.dirname(file), manifest = JSON.parse(fs.readFileSync(file));
        const section = manifest.sections?.documentation;
        if (!section) continue;
        for (const relative of Object.keys(section.generatedHashes || {}).filter(name => name.endsWith('ComponentData.js'))) {
            const rows = require(contract.containedPath(directory, relative, 'CMS documentation'));
            for (const row of Object.values(rows)) {
                const blocks = JSON.stringify(row.properties?.blocks || []);
                assert.doesNotMatch(blocks, /docs\/pages|owning module `docs\/`|authored Markdown|documentation generator|canonical Markdown|Add or update Markdown|authored.*under `docs`|canonical.*under `docs`/i, file);
            }
        }
    }
});

test('current baseline instructions reference consolidated releases rather than removed source folders', () => {
    const sources = [
        ['nodics.platform/modules/axis', 'axisDocumentationComponentData.js', 'axis.overview'],
        ['nodics.communication/modules/commsCore', 'commsCoreDocumentationComponentData.js', 'communication.email-sms-templates'],
        ['nodics.accelerators/modules/waste/modules/eWaste', 'eWasteDocumentationComponentData.js', 'accelerators.circa-collection-reference'],
        ['nodics.accelerators/modules/waste/modules/eWaste', 'eWasteDocumentationComponentData.js', 'accelerators.circa-data-network'],
    ];
    for (const [owner, file, id] of sources) {
        const records = require(path.join(root, owner, 'data/docs-v001/records/documentation', file));
        const guide = Object.values(records).find(row => row.properties?.code === id);
        assert(guide, id + ' must remain canonical');
        const content = JSON.stringify(guide.properties.blocks);
        assert.doesNotMatch(content, /(?:core|sample|init)-v00[2-9]/, id);
        assert.match(content, /(?:core|sample)-v001/, id);
    }
});

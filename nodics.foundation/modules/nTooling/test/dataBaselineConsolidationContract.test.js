/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/dataBaselineConsolidationContract @description Verifies v001 source folders, versioned receipts and single-owner identity definitions in current manifests. @layer test @owner nTooling */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const { isDeepStrictEqual } = require('node:util');
const contract = require('../src/service/defaultApplicationDocumentationContractService');
const releases = require('../../nData/nImport/import/src/service/release/defaultDataReleaseService');
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

/** Visits source syntax without executing arbitrary data modules or bootstrap bindings. */
function visit(node, inspect) {
    if (!node || typeof node !== 'object') return;
    inspect(node);
    for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(child => visit(child, inspect));
        else if (value && typeof value === 'object') visit(value, inspect);
    }
}

/** Resolves inert record values; computed definitions must be reviewed, never guessed. */
function literal(node) {
    assert(node, 'Missing static identity value');
    if (node.type === 'Literal') return node.value;
    if (node.type === 'ArrayExpression') return node.elements.map(literal);
    assert.equal(node.type, 'ObjectExpression', 'Identity definitions must be explicit data');
    return Object.fromEntries(node.properties.map(property => {
        assert.equal(property.type, 'Property');
        assert.equal(property.computed, false);
        return [property.key.name ?? property.key.value, literal(property.value)];
    }));
}

/** Reads the declared schema and record binding, independent of a file's name. */
function groupBindings(file) {
    const bindings = [];
    visit(acorn.parse(fs.readFileSync(file, 'utf8'), { ecmaVersion: 'latest' }), node => {
        if (node.type !== 'ObjectExpression') return;
        const properties = new Map(node.properties.filter(property => property.type === 'Property')
            .map(property => [property.key.name ?? property.key.value, property.value]));
        if (properties.get('schemaName')?.value !== 'userGroup') return;
        bindings.push({ prefix: literal(properties.get('dataFilePrefix')), operation: literal(properties.get('operation')) });
    });
    return bindings;
}

/** Normalizes only set-valued group fields; active state and other metadata stay significant. */
function groupDefinition(row) {
    assert.equal(typeof row.code, 'string');
    return { ...row, parentGroups: [...(row.parentGroups || [])].sort(), permissions: [...(row.permissions || [])].sort() };
}

/** Rejects identical copies as well as conflicting grants under the same persisted identity. */
function singleGroupOwners(definitions) {
    const owners = new Map();
    for (const definition of definitions) {
        const previous = owners.get(definition.row.code);
        if (previous) {
            const relation = isDeepStrictEqual(groupDefinition(previous.row), groupDefinition(definition.row)) ? 'identical copy' : 'conflicting definition';
            assert.fail(`${definition.row.code}: ${relation}: ${previous.source} <> ${definition.source}`);
        }
        owners.set(definition.row.code, definition);
    }
    return owners;
}

/** Derives authoritative group rows from every current manifest's schema headers. */
function identityInventory() {
    const sections = new Map(), definitions = [];
    for (const file of manifests(root)) {
        const directory = path.dirname(file), manifest = JSON.parse(fs.readFileSync(file));
        for (const [code, section] of Object.entries(manifest.sections || {})) {
            const source = `${manifest.module}:${code}`;
            sections.set(source, { section, directory });
            const files = Object.keys(section.files || {});
            for (const header of files.filter(relative => relative.includes('/headers/') && relative.endsWith('.js'))) {
                for (const binding of groupBindings(path.join(directory, header))) {
                    const matching = files.filter(relative => relative.includes('/records/') && path.basename(relative) === binding.prefix + '.js');
                    assert.equal(matching.length, 1, `${source}: exact manifest record binding for ${header}`);
                    assert.equal(section.owningDomain, manifest.module, source);
                    if (['accessGroups', 'businessAccessGroups', 'specialAccessGroups'].includes(code)) assert.equal(binding.operation, 'ensureReferenceAll', source);
                    const recordFile = contract.containedPath(directory, matching[0], 'Group records');
                    const rows = require(recordFile);
                    for (const [key, row] of Object.entries(rows)) definitions.push({ source: `${source}/${matching[0]}#${key}`, file: recordFile, row });
                }
            }
        }
    }
    return { sections, definitions };
}

/** Scans authored data only; inert historical test/evidence files are never production sources. */
function sourceFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        if (entry.name.startsWith('.')) return [];
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? sourceFiles(file) : entry.name.endsWith('.js') ? [file] : [];
    });
}

test('production release folders match declared manifest versions and every file checksum', () => {
    const found = manifests(root);
    assert(found.length > 20);
    for (const file of found) {
        const directory = path.dirname(file), manifest = JSON.parse(fs.readFileSync(file));
        const declaredRoots = new Set(Object.values(manifest.sections || {}).flatMap(section =>
            [section.sourceRoot, section.contentPath].filter(value => typeof value === 'string')));
        for (const declaredRoot of declaredRoots)
            assert(fs.existsSync(path.join(directory, declaredRoot)), file + ': missing declared root ' + declaredRoot);
        for (const section of Object.values(manifest.sections || {})) {
            if (['DATA_RELEASE', 'CONTENT_PACK'].includes(section.kind)) {
                assert.match(section.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, file + ': numeric semantic release version');
                assert.notEqual(section.version, '0.0.0', file + ': pinned releases cannot use mutable development receipts');
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
        assert.match(docs.contentPath, /^docs-v\d{3}$/, file);
        assert.equal(docs.installationPolicy, 'OPTIONAL_AXIS_INITIATED', file);
        for (const relative of Object.keys(docs.generatedHashes || {})) assert(relative.startsWith(docs.contentPath + '/'), file + ': ' + relative);
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

test('Profile Init pins module-owned identity prerequisites instead of legacy group payloads', () => {
    const { sections } = identityInventory();
    const init = sections.get('profile:init-v001').section;
    const prerequisites = new Map((init.prerequisites || []).map(ref => [ref.moduleName + ':' + ref.sectionCode, ref]));
    assert.equal(prerequisites.size, init.prerequisites.length, 'Prerequisites cannot repeat');
    // Section codes are manifest keys; do not infer domain participation from a filename.
    const identitySections = [...sections].filter(([key]) => /:(permissionCatalogue|accessGroups|enterpriseRoles|businessAccessGroups|businessAccessRoles)$/.test(key));
    const laterOptionalOwners = new Set(['commercialAgreement:permissionCatalogue', 'wasteCarbon:permissionCatalogue', 'wasteReward:permissionCatalogue']);
    assert(identitySections.length > 20);
    for (const key of laterOptionalOwners) {
        const section = sections.get(key)?.section;
        assert(section, `Optional owner ${key} must declare its permission catalogue`);
        assert.equal(section.selectionPolicy, 'EXPLICIT', key);
        assert.equal(prerequisites.has(key), false, `${key} must not become an implicit bootstrap grant`);
    }
    for (const [key, { section }] of identitySections) {
        if (laterOptionalOwners.has(key)) continue;
        const ref = prerequisites.get(key);
        assert(ref, `Profile Init must pin ${key}`);
        assert.equal(ref.version, section.version, key);
        const checksum = contract.sha256(Object.keys(section.files).sort().map(file => file + ':' + section.files[file]).join('|') +
            (section.prerequisites?.length ? '|prerequisites:' + JSON.stringify(section.prerequisites) : ''));
        assert.equal(ref.checksum, checksum, key);
    }
    // Optional special-access packs are not implicit bootstrap selections, but their pins are still authoritative.
    for (const [key, { section }] of [...sections].filter(([key]) => /:(permissionCatalogue|accessGroups|enterpriseRoles|businessAccessGroups|businessAccessRoles|specialAccessGroups|specialAccessRoles)$/.test(key))) {
        for (const ref of section.prerequisites || []) {
            const targetKey = ref.moduleName + ':' + ref.sectionCode;
            const target = sections.get(targetKey)?.section;
            assert(target, `${key}: prerequisite ${targetKey} must exist`);
            assert.equal(ref.version, target.version, `${key} -> ${targetKey}`);
            const checksum = contract.sha256(Object.keys(target.files).sort().map(file => file + ':' + target.files[file]).join('|') +
                (target.prerequisites?.length ? '|prerequisites:' + JSON.stringify(target.prerequisites) : ''));
            assert.equal(ref.checksum, checksum, `${key} -> ${targetKey}`);
        }
    }
    assert(!Object.keys(init.files).some(file => file.includes('/records/groups/')), 'Profile Init must consume owner prerequisites');
});

test('every current group has exactly one manifest owner and no undeclared duplicate source', () => {
    const { definitions } = identityInventory();
    const groupFiles = new Set(definitions.map(definition => definition.file));
    const owners = singleGroupOwners(definitions);
    assert(owners.size > 20);
    const orphaned = [];
    for (const manifest of manifests(root)) {
        for (const file of sourceFiles(path.dirname(manifest))) {
            if (groupFiles.has(file)) continue;
            visit(acorn.parse(fs.readFileSync(file, 'utf8'), { ecmaVersion: 'latest' }), node => {
                if (node.type !== 'ObjectExpression') return;
                const fields = new Map(node.properties.filter(property => property.type === 'Property')
                    .map(property => [property.key.name ?? property.key.value, property.value]));
                const code = fields.get('code')?.value;
                if (typeof code !== 'string') {
                    if (fields.has('code') && fields.has('active') && fields.has('parentGroups') && fields.has('permissions')) {
                        orphaned.push(`${path.relative(root, file)}: undeclared computed group identity requires owner/reference review`);
                    }
                    return;
                }
                if (!owners.has(code) && !fields.has('parentGroups')) return;
                // A business record referring to a group code is not itself a group definition.
                if (!fields.has('active') || (!fields.has('permissions') && !fields.has('parentGroups') && fields.get('name')?.value !== code)) return;
                let row;
                try { row = literal(node); }
                catch {
                    orphaned.push(`${path.relative(root, file)}: ${code}: undeclared computed definition requires owner/reference review`);
                    return;
                }
                const owner = owners.get(code);
                orphaned.push(`${path.relative(root, file)}: ${code}: ${owner ?
                    (isDeepStrictEqual(groupDefinition(row), groupDefinition(owner.row)) ? 'identical copy of ' : 'conflicts with ') + owner.source :
                    'group definition has no manifest owner'}`);
            });
        }
    }
    assert.deepEqual(orphaned, [], 'Undeclared group sources must be removed or moved to inert historical test fixtures after reference review');
});

test('single-owner comparison rejects renamed copies and changed grants without relying on filenames', () => {
    const row = { code: 'exampleGroup', active: true, parentGroups: ['b', 'a'], permissions: ['read', 'edit'] };
    const owner = { source: 'domain:accessGroups/records/arbitrary.js#record9', row };
    const renamed = { source: 'profile:init/records/unrelated.js#other', row: { ...row, parentGroups: ['a', 'b'], permissions: ['edit', 'read'] } };
    assert.throws(() => singleGroupOwners([owner, renamed]), /identical copy/);
    for (const change of [{ permissions: ['read', 'approve'] }, { parentGroups: ['adminGroup'] }, { active: false }]) {
        assert.throws(() => singleGroupOwners([owner, { ...renamed, row: { ...row, ...change } }]), /conflicting definition/);
    }
    assert.equal(singleGroupOwners([owner, { ...renamed, row: { ...row, code: 'otherGroup' } }]).size, 2);
});

test('v001 source folders permit incremental versions while receipts reject same-version drift and downgrade', () => {
    const owner = { ...releases, configuration: () => ({ allowDowngrade: false }), error: (code, message) => new Error(code + ': ' + message) };
    const receipt = { version: '0.0.1', checksum: 'old', status: 'CURRENT' };
    const before = structuredClone(receipt);
    assert.equal(owner.validateUpgradePolicy({ sourceRoot: 'init-v001', version: '0.0.2', checksum: 'new' }, receipt), true);
    assert.equal(owner.validateUpgradePolicy({ sourceRoot: 'init-v001', version: '0.0.3', checksum: 'successor' }, { version: '0.0.2', checksum: 'new' }), true);
    assert.equal(owner.validateUpgradePolicy({ sourceRoot: 'init-v001', version: '0.0.1', checksum: 'new-pack' }, undefined), true);
    assert.equal(owner.validateUpgradePolicy({ version: '0.0.1', checksum: 'old' }, receipt), true);
    assert.throws(() => owner.validateUpgradePolicy({ version: '0.0.1', checksum: 'new' }, receipt), /without a version change/);
    assert.throws(() => owner.validateUpgradePolicy({ version: '0.0.1', checksum: 'old' }, { version: '0.0.2', checksum: 'new' }), /downgrade/);
    assert.deepEqual(receipt, before, 'Validation must not rewrite historical receipts');
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

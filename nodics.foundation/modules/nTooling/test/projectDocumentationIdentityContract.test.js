/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectDocumentationIdentityContract
 * @description Generates a separate project's catalogue and proves names, routes, owners, channels, and invalid-output boundaries.
 * @layer test
 * @owner nTooling
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const script = path.resolve(__dirname, '../src/service/project/defaultProjectDocumentationContentService.mjs');
function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'documentation-identity-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    fs.mkdirSync(path.join(root, 'docs/pages'), { recursive: true });
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'warehouse.application' }));
    const paragraph = 'A beginner business developer and operator can inspect the documented source before production publication. The catalogue describes ownership and the application selects its own names, routes, identifiers and channels. Review the generated records and validate them before applying the declared data release. ';
    const content = '# Warehouse guide\n\n' + ['Purpose', 'Ownership', 'Usage', 'Common mistakes', 'Verification'].map(title =>
        '## ' + title + '\n\n' + paragraph.repeat(3)).join('\n\n') + '\n\n| Item | Owner |\n| --- | --- |\n| Content | Application |\n';
    fs.writeFileSync(path.join(root, 'docs/pages/guide.md'), content);
    const catalogue = {
        pack: 'warehouse.application', title: 'Warehouse', version: '0.0.0',
        publication: { recordPrefix: 'warehouseDocumentation', codePrefix: 'warehouseDocs', sectionCode: 'warehouse',
            owningDomain: 'warehouse.documentation', keyword: 'warehouse', routeRoot: '/manual/warehouse',
            publicRootPath: '/help/warehouse', label: 'Warehouse', shortLabel: 'Warehouse', channels: ['web'] },
        navigationSections: [{ code: 'warehouse', title: 'Warehouse', order: 10, summary: 'Warehouse operating guide.', accessMode: 'PUBLIC', lifecycleState: 'ONLINE' }],
        documents: [{ id: 'warehouse.guide', title: 'Warehouse guide', summary: 'Warehouse documentation for application users.',
            locale: 'en', content: 'docs/pages/guide.md', slug: 'warehouse-guide', parentId: 'warehouse',
            hierarchyPath: ['Warehouse', 'Warehouse guide'], hierarchyDepth: 2, navigationSection: 'Warehouse', navigationSectionCode: 'warehouse',
            navigationGroup: 'Warehouse operations', navigationOrder: 10, documentType: 'overview', audience: ['business', 'developer', 'operator'],
            sourceOwner: 'warehouse.application', sourcePath: 'docs/pages/guide.md', accessMode: 'PUBLIC', lifecycleState: 'ONLINE',
            maturityState: 'operational', relatedPages: [], sourceEvidence: ['docs/catalogue.json', 'docs/pages/guide.md'], visualRequirements: ['table'] }]
    };
    const write = () => fs.writeFileSync(path.join(root, 'docs/catalogue.json'), JSON.stringify(catalogue));
    write();
    return { root, catalogue, write, run: (args = []) => spawnSync(process.execPath, [script, ...args], {
        cwd: root, env: { ...process.env, NODICS_PROJECT_ROOT: root }, encoding: 'utf8'
    }) };
}
test('documentation generation uses the selected application identity and remains deterministic', t => {
    const f = fixture(t), result = f.run();
    assert.equal(result.status, 0, result.stderr);
    const records = relative => require(path.join(f.root, 'data/core-v001/records/documentation', relative));
    const product = records('warehouseDocumentationProductData.js').record0;
    assert.equal(product.code, 'warehouseDocumentationProduct');
    assert.equal(product.ownerFunctionalModule, 'warehouse.application');
    assert.equal(product.publicRootPath, '/help/warehouse');
    assert.deepEqual(product.channels, ['web']);
    const routes = records('warehouseDocumentationRouteData.js');
    assert.equal(routes.record0.path, '/manual/warehouse');
    const values = suffix => Object.values(records('warehouseDocumentation' + suffix + 'Data.js'));
    const header = require(path.join(f.root, 'data/core-v001/headers/warehouseDocumentationContentPackHeader.js'));
    const order = Object.keys(header.cms);
    assert(order.indexOf('warehouseDocumentationTemplateData') >= 0);
    assert(order.indexOf('warehouseDocumentationTemplateData') < order.indexOf('warehouseDocumentationSlotData'));
    const rootNode = values('Node').find(node => node.code === 'warehouseDocsNodeRoot');
    assert(rootNode);
    assert.equal(Object.hasOwn(rootNode, 'parentNode'), false);
    for (const page of values('PageMetadata')) {
        assert(page.businessSummary);
        assert(page.technicalSummary);
    }
    for (const dashboard of values('Dashboard')) {
        assert(dashboard.summary);
        assert(dashboard.contentArea);
        assert(Array.isArray(dashboard.cards));
    }
    for (const policy of values('AccessPolicy')) {
        assert(['PUBLIC', 'AUTHENTICATED', 'ROLE_BASED'].includes(policy.accessMode));
        assert(Array.isArray(policy.lifecycleVisibility));
    }
    for (const state of values('PublicationState')) {
        assert(state.checksum);
        assert.equal(state.stagedVersion, f.catalogue.version);
        if (state.lifecycleState === 'ONLINE') assert.equal(state.onlineVersion, f.catalogue.version);
        assert(['DRAFT', 'STAGED', 'REVIEW_IN_PROGRESS', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'ONLINE', 'ARCHIVED', 'RETIRED', 'ROLLBACK_PENDING', 'PUBLICATION_FAILED'].includes(state.lifecycleState));
        for (const field of ['onlineVersion', 'previousOnlineVersion', 'submittedBy', 'submittedAt', 'reviewer', 'reviewedAt', 'approver', 'approvedAt', 'publisher', 'publishedAt']) {
            assert.notEqual(state[field], null, field + ' must be omitted rather than null for fresh-schema imports');
        }
    }
    for (const metadata of values('SearchMetadata')) {
        assert(metadata.searchText);
        assert.equal(metadata.indexState, 'INDEX_READY');
    }
    const manifest = JSON.parse(fs.readFileSync(path.join(f.root, 'data/manifest.json')));
    for (const [relative, hash] of Object.entries(manifest.sections.documentation.generatedHashes)) {
        assert(fs.existsSync(path.join(f.root, 'data', relative)));
        assert.match(hash, /^[a-f0-9]{64}$/);
    }
    assert.equal(JSON.parse(fs.readFileSync(path.join(f.root, 'data/manifest.json'))).module, 'warehouse.application');
    const check = f.run(['--check']); assert.equal(check.status, 0, check.stderr);
    assert.equal(fs.existsSync(path.join(f.root, 'data/core-v001/records/documentation/kickoffDocumentationProductData.js')), false);
});
test('unsafe publication identifiers fail before any generated data is written', t => {
    const f = fixture(t); f.catalogue.publication.recordPrefix = '../escape'; f.write();
    const result = f.run(); assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Invalid documentation publication identifier/);
    assert.equal(fs.existsSync(path.join(f.root, 'data')), false);
});

test('immutable documentation changes fail before writes and forward releases preserve old output', t => {
    const f = fixture(t);
    f.catalogue.version = '1.0.0'; f.write();
    let result = f.run(); assert.equal(result.status, 0, result.stderr);
    const manifestPath = path.join(f.root, 'data/manifest.json');
    const previousManifest = fs.readFileSync(manifestPath, 'utf8');
    const oldFiles = Object.keys(JSON.parse(previousManifest).sections.documentation.generatedHashes);
    const snapshots = oldFiles.map(file => [file, fs.readFileSync(path.join(f.root, 'data', file), 'utf8')]);
    const source = path.join(f.root, 'docs/pages/guide.md');
    fs.appendFileSync(source, '\nAn additional reviewed operating requirement.\n');
    result = f.run();
    assert.notEqual(result.status, 0); assert.match(result.stderr, /Immutable documentation release changed/);
    assert.equal(fs.readFileSync(manifestPath, 'utf8'), previousManifest);
    f.catalogue.version = '1.0.1'; f.write();
    result = f.run();
    assert.notEqual(result.status, 0); assert.match(result.stderr, /Immutable documentation path would be overwritten/);
    for (const [file, content] of snapshots) assert.equal(fs.readFileSync(path.join(f.root, 'data', file), 'utf8'), content);
    f.catalogue.publication.contentPath = 'core-v002'; f.write();
    result = f.run(); assert.equal(result.status, 0, result.stderr);
    for (const [file, content] of snapshots) assert.equal(fs.readFileSync(path.join(f.root, 'data', file), 'utf8'), content);
    const current = JSON.parse(fs.readFileSync(manifestPath));
    assert.equal(current.sections.documentation.contentPath, 'core-v002');
    assert(Object.keys(current.sections.documentation.generatedHashes).every(file => file.startsWith('core-v002/')));
    assert.deepEqual(current.retainedRoots['core-v001'].sections.documentation,
        JSON.parse(previousManifest).sections.documentation);
    assert.deepEqual(current.retainedRoots['core-v001'].files,
        JSON.parse(previousManifest).sections.documentation.generatedHashes);
    result = f.run(['--check']); assert.equal(result.status, 0, result.stderr);
    f.catalogue.version = '0.9.0'; f.catalogue.publication.contentPath = 'core-v003'; f.write();
    result = f.run(); assert.notEqual(result.status, 0); assert.match(result.stderr, /must not move backwards/);
    assert.equal(fs.existsSync(path.join(f.root, 'data/core-v003')), false);
});

test('retained documentation tampering fails before a subsequent generation writes output', t => {
    const f = fixture(t);
    f.catalogue.version = '1.0.0'; f.write();
    let result = f.run(); assert.equal(result.status, 0, result.stderr);
    f.catalogue.version = '1.0.1'; f.catalogue.publication.contentPath = 'core-v002'; f.write();
    result = f.run(); assert.equal(result.status, 0, result.stderr);
    const manifestPath = path.join(f.root, 'data/manifest.json');
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    fs.appendFileSync(path.join(f.root, 'data/core-v001/headers/warehouseDocumentationContentPackHeader.js'), '\n// drift\n');
    f.catalogue.version = '1.0.2'; f.catalogue.publication.contentPath = 'core-v003'; f.write();
    result = f.run(); assert.notEqual(result.status, 0); assert.match(result.stderr, /Retained release/);
    assert.equal(fs.existsSync(path.join(f.root, 'data/core-v003')), false);
    assert.equal(fs.readFileSync(manifestPath, 'utf8'), manifest);
});

test('an occupied forward path or unsafe destination never partially writes a release', t => {
    const f = fixture(t);
    f.catalogue.version = '1.0.0'; f.write();
    let result = f.run(); assert.equal(result.status, 0, result.stderr);
    const manifest = fs.readFileSync(path.join(f.root, 'data/manifest.json'), 'utf8');
    f.catalogue.version = '1.0.1'; f.catalogue.publication.contentPath = 'core-v002'; f.write();
    const occupied = path.join(f.root, 'data/core-v002/headers/warehouseDocumentationContentPackHeader.js');
    fs.mkdirSync(path.dirname(occupied), { recursive: true }); fs.writeFileSync(occupied, 'preserved previous artifact');
    result = f.run(); assert.notEqual(result.status, 0); assert.match(result.stderr, /already contains different content/);
    assert.equal(fs.existsSync(path.join(f.root, 'data/core-v002/records')), false);
    assert.equal(fs.readFileSync(occupied, 'utf8'), 'preserved previous artifact');
    assert.equal(fs.readFileSync(path.join(f.root, 'data/manifest.json'), 'utf8'), manifest);
    f.catalogue.publication.contentPath = '../outside'; f.write();
    result = f.run(); assert.notEqual(result.status, 0); assert.match(result.stderr, /governed core-vNNN/);
});

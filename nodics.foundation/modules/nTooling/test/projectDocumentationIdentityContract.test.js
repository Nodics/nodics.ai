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

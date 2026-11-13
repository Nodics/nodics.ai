/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const service = require('../src/service/defaultApplicationDocumentationContractService');

// Source validation must catch the lifecycle/delivery collision before any import.
assert.doesNotThrow(() => service.validateCmsRouteDeliveryStates([
    { code: 'draft', deliveryState: 'DRAFT' },
    { code: 'published', deliveryState: 'ONLINE' },
    { code: 'ownerDefault' }
]));
assert.throws(() => service.validateCmsRouteDeliveryStates([
    { code: 'invalidRoute', deliveryState: 'STAGED' }
]), error => error.code === 'ERR_TOOL_DOC_00005' && error.message.includes('invalidRoute'));

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-app-docs-'));
fs.mkdirSync(path.join(root, 'docs/pages'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/pages/overview.md'), '# Overview\n\n## Verification\n\nSafe application documentation.\n');
fs.writeFileSync(path.join(root, 'docs/pages/strict.md'), [
    '# Strict overview',
    '',
    'This beginner documentation explains the business problem, developer ownership, operator responsibility, and production evidence for a reusable Nodics capability.',
    '',
    '## Business purpose',
    '',
    'Business users need a clear explanation of what the capability changes and why the documentation exists.',
    '',
    '## Developer contract',
    '',
    'Developers need source ownership, extension boundaries, configuration guidance, and generated evidence.',
    '',
    '| Area | Evidence |',
    '| --- | --- |',
    '| Ownership | Source-backed catalogue metadata |',
    '',
    '```mermaid',
    'flowchart LR',
    '  Source["Authored documentation"] --> Metadata["Catalogue visual requirements"]',
    '  Metadata --> Page["Generated WCMS page metadata"]',
    '```',
    '',
    '## Operator guidance',
    '',
    'Operators need publication, recovery, audit, and production validation guidance.',
    '',
    '## Common mistakes',
    '',
    '- Hiding missing implementation behind vague prose.',
    '',
    '## Verification',
    '',
    'Verify the catalogue, generated records, release manifest, and rendered documentation page.'
].join('\n'));
const catalogue = { pack: 'sample.application', version: '0.0.0', documents: [{ id: 'sample.overview', content: 'docs/pages/overview.md' }] };
const validated = service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: catalogue });
assert.strictEqual(validated.documents.length, 1);

const strictCatalogue = {
    pack: 'sample.application',
    version: '0.0.0',
    navigationSections: [{
        code: 'sample-section',
        title: 'Sample Section',
        order: 10,
        summary: 'Reusable section metadata for generated documentation navigation.',
        accessMode: 'PUBLIC',
        lifecycleState: 'ONLINE'
    }],
    documents: [{
        id: 'sample.strict',
        title: 'Strict overview',
        summary: 'Strict enterprise documentation metadata and quality sample.',
        locale: 'en',
        content: 'docs/pages/strict.md',
        slug: 'sample-strict',
        parentId: 'sample-section.sample-group',
        hierarchyPath: ['Sample Documentation', 'Sample Section', 'Sample Group', 'Strict overview'],
        hierarchyDepth: 4,
        navigationSection: 'Sample Section',
        navigationSectionCode: 'sample-section',
        navigationGroup: 'Sample Group',
        navigationOrder: 10,
        documentType: 'overview',
        audience: ['business', 'developer', 'operator'],
        sourceOwner: 'sample.application',
        sourcePath: 'docs/pages/strict.md',
        accessMode: 'PUBLIC',
        lifecycleState: 'ONLINE',
        maturityState: 'operational',
        relatedPages: [],
        sourceEvidence: ['docs/catalogue.json', 'docs/pages/strict.md'],
        visualRequirements: ['table', 'diagram']
    }]
};
const strictValidated = service.validateCatalogue({
    ownerRoot: root,
    sourceDirectory: 'docs',
    cataloguePath: 'docs/catalogue.json',
    catalogue: strictCatalogue,
    requireNavigationSections: true,
    requireEnterpriseMetadata: true,
    validateContentQuality: true,
    minimumWordCount: 50
});
assert.strictEqual(strictValidated.documents.length, 1);

assert.throws(() => service.validateCatalogue({
    ownerRoot: root,
    sourceDirectory: 'docs',
    cataloguePath: 'docs/catalogue.json',
    catalogue: Object.assign({}, strictCatalogue, {
        navigationSections: strictCatalogue.navigationSections.concat([{
            code: 'empty-section',
            title: 'Empty Section',
            order: 20,
            summary: 'Section metadata must not be publishable without at least one page.',
            accessMode: 'PUBLIC',
            lifecycleState: 'ONLINE'
        }])
    }),
    requireNavigationSections: true,
    requireEnterpriseMetadata: true
}), error => error.code === 'ERR_TOOL_DOC_00011');

const generatedHashes = { 'sample-v001/content/records/docs/samplePageData.js': service.sha256('page') };
const section = service.buildReleaseSection({ catalogue: catalogue, generatedHashes: generatedHashes, contentPath: 'sample-v001/content', owningDomain: 'sample.docs', sourceAuthority: 'docs/catalogue.json', sites: ['sampleDocumentationSite'], pages: 1, components: 1, routes: 1 });
assert.strictEqual(section.installationPolicy, 'OPTIONAL_AXIS_INITIATED');
assert.strictEqual(section.destinationRole, 'WCMS_STAGED');
assert.strictEqual(section.publicationPolicy, 'REQUIRED');
assert.strictEqual(section.versioningPolicy, 'IMMUTABLE');

assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'data/docs', cataloguePath: 'data/docs/catalogue.json', catalogue: catalogue }), error => error.code === 'ERR_TOOL_DOC_00002');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: { pack: 'sample', version: '0', documents: [{ id: 'sample.overview', content: '../outside.md' }] } }), error => error.code === 'ERR_TOOL_DOC_00001');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: catalogue, requireNavigationSections: true }), error => error.code === 'ERR_TOOL_DOC_00008');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: Object.assign({}, strictCatalogue, { documents: [{ id: 'sample.missing', content: 'docs/pages/overview.md' }] }), requireNavigationSections: true, requireEnterpriseMetadata: true }), error => error.code === 'ERR_TOOL_DOC_00009');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: Object.assign({}, strictCatalogue, { documents: [Object.assign({}, strictCatalogue.documents[0], { visualRequirements: ['screenshot'] })] }), requireNavigationSections: true, requireEnterpriseMetadata: true, validateContentQuality: true, minimumWordCount: 50 }), error => error.code === 'ERR_TOOL_DOC_00010');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: Object.assign({}, strictCatalogue, { documents: [Object.assign({}, strictCatalogue.documents[0], { content: 'docs/pages/overview.md' })] }), requireNavigationSections: true, requireEnterpriseMetadata: true, validateContentQuality: true }), error => error.code === 'ERR_TOOL_DOC_00010');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: Object.assign({}, strictCatalogue, { documents: [Object.assign({}, strictCatalogue.documents[0], { relatedPages: ['missing.page'] })] }), requireNavigationSections: true, requireEnterpriseMetadata: true }), error => error.code === 'ERR_TOOL_DOC_00011');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: Object.assign({}, strictCatalogue, { documents: [strictCatalogue.documents[0], Object.assign({}, strictCatalogue.documents[0], { id: 'sample.strict-two', slug: 'sample-strict-two', sourcePath: 'docs/pages/strict.md' })] }), requireNavigationSections: true, requireEnterpriseMetadata: true }), error => error.code === 'ERR_TOOL_DOC_00011');
assert.throws(() => service.validateReleaseSection(Object.assign({}, section, { destinationRole: 'WCMS_ONLINE' })), error => error.code === 'ERR_TOOL_DOC_00007');

// The owner runbook correction is a forward Staged release, never a rewrite of published history.
{
    const owner = path.resolve(__dirname, '..');
    const manifest = require('../data/manifest.json').sections.documentation;
    assert.strictEqual(manifest.version, '0.0.3');
    assert.strictEqual(manifest.contentPath, 'docs-v001');
    assert.strictEqual(fs.existsSync(path.join(owner, 'data/docs-v002')), false);
    assert.strictEqual(manifest.sourceAuthority, 'data/docs-v001/records/documentation');
    for (const [file, hash] of Object.entries(manifest.generatedHashes)) {
        assert.ok(file.startsWith('docs-v001/'));
        assert.strictEqual(service.sha256(fs.readFileSync(path.join(owner, 'data', file))), hash, file);
    }
    const current = service.validateDataRelease(owner, 'documentation');
    const article = current.documents.find(document => document.id === 'framework.release-upgrade-compatibility');
    for (const phrase of ['releaseRequest.forceCurrent:true', 'LOCAL recovery', 'qualifyZeroWorkRecoveries',
        'validationOnly:false', 'recordsRead', 'recordsFinalized', 'recordsDispatched', 'recordsSucceeded',
        'recordsFailed', 'recordsSkipped', 'Missing counters are not zero', 'Custom installers',
        'non-Local deployments', 'Prerequisite-reference releases', 'isZeroWorkRecovery',
        'original installation runId, revision', 'new NO_DATA or explicit zero-success', 'receipt-only'])
        assert.ok(article.body.includes(phrase), phrase);
    assert.ok(!article.body.includes('Do not reset successful writes, force-current, invent receipts'));
    const newComponents = require('../data/docs-v001/records/documentation/nToolingDocumentationComponentData');
    for (const [key, component] of Object.entries(newComponents)) {
        assert.ok(component.code, key);
        assert.ok(component.properties.source.sourcePath.startsWith('data/docs-v001/'));
    }
    const component = Object.values(newComponents).find(row => row.properties.code === article.id).properties;
    const pages = require('../data/docs-v001/records/documentation/nToolingDocumentationPageMetadataData');
    const page = Object.values(pages).find(row => row.documentId === article.id);
    assert.strictEqual(component.source.checksum, service.sha256(article.body));
    assert.strictEqual(page.sourceChecksum, component.source.checksum);
    assert.strictEqual(page.sourceWordCount, service.countWords(article.body));
    assert.ok(component.searchText.includes('Missing counters are not zero'));
    for (const state of Object.values(require('../data/docs-v001/records/documentation/nToolingDocumentationPublicationStateData'))) {
        assert.strictEqual(state.lifecycleState, 'STAGED');
        assert.strictEqual(state.stagedVersion, manifest.version);
        assert.ok(state.author);
        for (const key of ['onlineVersion', 'actor', 'reviewer', 'approver', 'publisher'])
            assert.strictEqual(state[key], undefined);
        assert.deepStrictEqual(state.auditTrail, []);
    }
}

fs.rmSync(root, { recursive: true, force: true });
console.log('Application documentation contract validated');

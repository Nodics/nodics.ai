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
    const frozen = {
        'records/documentation/nToolingDocumentationNodeData.js': '53759a29b6405ee28afd5430bc3183e53f92de41dc0057f43cb2ecada57f8468',
        'records/documentation/nToolingDocumentationPageMetadataData.js': '7b100466ca27fa28759f7223a69b72363440e10b6feed39ae266c027b351989a',
        'records/documentation/nToolingDocumentationPublicationStateData.js': 'd42f010383db90923fbce002a6f3b21dcc4115fb83a39e71fbead87d220ab38f',
        'records/documentation/nToolingDocumentationSearchMetadataData.js': '5ba0ad2c4cd98c666509f031fad702da84de5e78061544b49e01ef803239b59e',
        'records/documentation/nToolingDocumentationComponentData.js': '8d062258d22f6b92de4db5ae1f3a4cbd508d45af2537cd1003f1a0bb8283d1f7',
        'records/documentation/nToolingDocumentationPageData.js': '7081a23e8cf0d2f8f2f7dd98b77f5d5cc8928ebda030cf7798d0c1d3700c8a56',
        'records/documentation/nToolingDocumentationRouteData.js': '0fc0d3ec27bfa41de02e0130176210e4200ae47a1e6cf8ded413c9132a2a5406',
        'headers/100_nToolingDocumentationContentPackHeader.js': '13efda5c2a7ba01a47b1c042046d15ad6d174bef26c2c09c9b5e5b3ee55da391'
    };
    for (const [file, hash] of Object.entries(frozen))
        assert.strictEqual(service.sha256(fs.readFileSync(path.join(owner, 'data/docs-v001', file))), hash, file);
    assert.strictEqual(manifest.version, '0.0.2');
    assert.strictEqual(manifest.contentPath, 'docs-v002');
    const previous = Object.assign({}, manifest, {
        version: '0.0.1', contentPath: 'docs-v001',
        sourceAuthority: 'data/docs-v001/records/documentation',
        generatedHashes: Object.fromEntries(Object.entries(frozen).map(([file, hash]) => ['docs-v001/' + file, hash]))
    });
    previous.releaseChecksum = service.releaseChecksum(previous.generatedHashes);
    service.validateGeneration(previous, manifest);
    assert.throws(() => service.validateGeneration(previous, Object.assign({}, manifest, { version: '0.0.1' })),
        error => error.code === 'ERR_TOOL_DOC_00006');
    const current = service.validateDataRelease(owner, 'documentation');
    const article = current.documents.find(document => document.id === 'framework.release-upgrade-compatibility');
    for (const phrase of ['releaseRequest.forceCurrent:true', 'LOCAL recovery', 'qualifyZeroWorkRecoveries',
        'validationOnly:false', 'recordsRead', 'recordsFinalized', 'recordsDispatched', 'recordsSucceeded',
        'recordsFailed', 'recordsSkipped', 'Missing counters are not zero', 'Custom installers',
        'non-Local deployments', 'Prerequisite-reference releases', 'isZeroWorkRecovery',
        'original installation runId, revision', 'new NO_DATA or explicit zero-success', 'receipt-only'])
        assert.ok(article.body.includes(phrase), phrase);
    assert.ok(!article.body.includes('Do not reset successful writes, force-current, invent receipts'));
    const oldComponents = require('../data/docs-v001/records/documentation/nToolingDocumentationComponentData');
    const newComponents = require('../data/docs-v002/records/documentation/nToolingDocumentationComponentData');
    for (const [key, component] of Object.entries(newComponents)) {
        assert.strictEqual(component.code, oldComponents[key].code);
        assert.deepStrictEqual(component.properties.headings, oldComponents[key].properties.headings);
        if (component.properties.code !== article.id)
            assert.deepStrictEqual(component.properties.blocks, oldComponents[key].properties.blocks);
    }
    const component = Object.values(newComponents).find(row => row.properties.code === article.id).properties;
    const pages = require('../data/docs-v002/records/documentation/nToolingDocumentationPageMetadataData');
    const page = Object.values(pages).find(row => row.documentId === article.id);
    assert.strictEqual(component.source.checksum, service.sha256(article.body));
    assert.strictEqual(page.sourceChecksum, component.source.checksum);
    assert.strictEqual(page.sourceWordCount, service.countWords(article.body));
    assert.ok(component.searchText.includes('Missing counters are not zero'));
    const oldStates = new Map(Object.values(require('../data/docs-v001/records/documentation/nToolingDocumentationPublicationStateData'))
        .map(state => [state.code, state]));
    for (const state of Object.values(require('../data/docs-v002/records/documentation/nToolingDocumentationPublicationStateData'))) {
        assert.strictEqual(state.lifecycleState, 'STAGED');
        assert.strictEqual(state.stagedVersion, manifest.version);
        assert.ok(state.author);
        assert.strictEqual(state.author, oldStates.get(state.code).author);
        for (const key of ['onlineVersion', 'actor', 'reviewer', 'approver', 'publisher'])
            assert.strictEqual(state[key], undefined);
        assert.deepStrictEqual(state.auditTrail, []);
    }
}

fs.rmSync(root, { recursive: true, force: true });
console.log('Application documentation contract validated');

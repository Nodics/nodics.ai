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
        sourceEvidence: ['docs/catalogue.json', 'docs/pages/strict.md']
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

const generatedHashes = { 'staged/wcms/data/docs/samplePageData.js': service.sha256('page') };
const section = service.buildReleaseSection({ catalogue: catalogue, generatedHashes: generatedHashes, contentPath: 'staged/wcms', owningDomain: 'sample.docs', sourceAuthority: 'docs/catalogue.json', sites: ['sampleDocumentationSite'], pages: 1, components: 1, routes: 1 });
assert.strictEqual(section.installationPolicy, 'OPTIONAL_AXIS_INITIATED');
assert.strictEqual(section.destinationRole, 'WCMS_STAGED');
assert.strictEqual(section.publicationPolicy, 'REQUIRED');
assert.strictEqual(section.versioningPolicy, 'IMMUTABLE');

assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'data/docs', cataloguePath: 'data/docs/catalogue.json', catalogue: catalogue }), error => error.code === 'ERR_TOOL_DOC_00002');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: { pack: 'sample', version: '0', documents: [{ id: 'sample.overview', content: '../outside.md' }] } }), error => error.code === 'ERR_TOOL_DOC_00001');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: catalogue, requireNavigationSections: true }), error => error.code === 'ERR_TOOL_DOC_00008');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: Object.assign({}, strictCatalogue, { documents: [{ id: 'sample.missing', content: 'docs/pages/overview.md' }] }), requireNavigationSections: true, requireEnterpriseMetadata: true }), error => error.code === 'ERR_TOOL_DOC_00009');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: Object.assign({}, strictCatalogue, { documents: [Object.assign({}, strictCatalogue.documents[0], { content: 'docs/pages/overview.md' })] }), requireNavigationSections: true, requireEnterpriseMetadata: true, validateContentQuality: true }), error => error.code === 'ERR_TOOL_DOC_00010');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: Object.assign({}, strictCatalogue, { documents: [Object.assign({}, strictCatalogue.documents[0], { relatedPages: ['missing.page'] })] }), requireNavigationSections: true, requireEnterpriseMetadata: true }), error => error.code === 'ERR_TOOL_DOC_00011');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: Object.assign({}, strictCatalogue, { documents: [strictCatalogue.documents[0], Object.assign({}, strictCatalogue.documents[0], { id: 'sample.strict-two', slug: 'sample-strict-two', sourcePath: 'docs/pages/strict.md' })] }), requireNavigationSections: true, requireEnterpriseMetadata: true }), error => error.code === 'ERR_TOOL_DOC_00011');
assert.throws(() => service.validateReleaseSection(Object.assign({}, section, { destinationRole: 'WCMS_ONLINE' })), error => error.code === 'ERR_TOOL_DOC_00007');

fs.rmSync(root, { recursive: true, force: true });
console.log('Application documentation contract validated');

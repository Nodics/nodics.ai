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
const catalogue = { pack: 'sample.application', version: '0.0.0', documents: [{ id: 'sample.overview', content: 'docs/pages/overview.md' }] };
const validated = service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: catalogue });
assert.strictEqual(validated.documents.length, 1);

const generatedHashes = { 'staged/wcms/data/docs/samplePageData.js': service.sha256('page') };
const section = service.buildReleaseSection({ catalogue: catalogue, generatedHashes: generatedHashes, contentPath: 'staged/wcms', owningDomain: 'sample.docs', sourceAuthority: 'docs/catalogue.json', sites: ['sampleDocumentationSite'], pages: 1, components: 1, routes: 1 });
assert.strictEqual(section.installationPolicy, 'OPTIONAL_AXIS_INITIATED');
assert.strictEqual(section.destinationRole, 'WCMS_STAGED');
assert.strictEqual(section.publicationPolicy, 'REQUIRED');
assert.strictEqual(section.versioningPolicy, 'IMMUTABLE');

assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'data/docs', cataloguePath: 'data/docs/catalogue.json', catalogue: catalogue }), error => error.code === 'ERR_TOOL_DOC_00002');
assert.throws(() => service.validateCatalogue({ ownerRoot: root, sourceDirectory: 'docs', cataloguePath: 'docs/catalogue.json', catalogue: { pack: 'sample', version: '0', documents: [{ id: 'sample.overview', content: '../outside.md' }] } }), error => error.code === 'ERR_TOOL_DOC_00001');
assert.throws(() => service.validateReleaseSection(Object.assign({}, section, { destinationRole: 'WCMS_ONLINE' })), error => error.code === 'ERR_TOOL_DOC_00007');

fs.rmSync(root, { recursive: true, force: true });
console.log('Application documentation contract validated');

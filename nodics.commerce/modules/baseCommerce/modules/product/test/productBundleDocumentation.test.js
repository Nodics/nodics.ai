/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module product/test/productBundleDocumentation @description Verifies consolidated CMS bundle publication evidence without installation. @layer test @owner product */
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const contract = require('../../../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const manifest = require('../data/manifest.json').sections.documentation;

test('consolidated Product CMS release documents exact held publication', () => {
  assert.equal(manifest.contentPath, 'docs-v001');
  assert.equal(manifest.version, '0.0.3');
  for (const [file, hash] of Object.entries(manifest.generatedHashes))
    assert.equal(contract.sha256(fs.readFileSync(path.join(root, 'data', file))), hash, file);
  const catalogue = contract.validateDataRelease(root, 'documentation');
  const article = catalogue.documents.find(document => document.ownerRoot === root);
  for (const phrase of ['HELD_BUNDLE_LISTING', 'before its start date', 'Blank end',
    'filtering runs before customer pagination', 'No duplicate Product price', 'null roundCode',
    'original recovery fence', 'intentional overrides', 'availability.acquisitionRequirements',
    'explicit null', 'no Payment', 'not copied Product attributes']) {
    assert.ok(article.body.includes(phrase), phrase);
  }
  assert.equal(article.lifecycleState, 'STAGED');
  const properties = require('../data/docs-v001/records/documentation/productDocumentationComponentData').record0.properties;
  const page = require('../data/docs-v001/records/documentation/productDocumentationPageMetadataData').record0;
  assert.equal(properties.source.checksum, contract.sha256(article.body));
  assert.equal(page.sourceChecksum, properties.source.checksum);
  assert.equal(page.sourceWordCount, contract.countWords(article.body));
  assert.deepEqual(page.headings, properties.headings);
  const states = Object.values(require('../data/docs-v001/records/documentation/productDocumentationPublicationStateData'));
  for (const state of states) {
    assert.equal(state.lifecycleState, 'STAGED');
    assert.equal(state.stagedVersion, manifest.version);
    assert.equal(state.onlineVersion, undefined);
    assert.ok(typeof state.author === 'string' && state.author.length > 0);
    assert.equal(state.reviewer, undefined);
    assert.equal(state.approver, undefined);
    assert.equal(state.publisher, undefined);
    assert.deepEqual(state.auditTrail, []);
  }
});

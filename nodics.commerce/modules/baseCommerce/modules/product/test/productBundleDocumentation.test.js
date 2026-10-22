/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module product/test/productBundleDocumentation @description Verifies forward CMS bundle publication evidence and preserves previous release bytes without installation. @layer test @owner product */
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const contract = require('../../../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const manifest = require('../data/manifest.json').sections.documentation;

test('forward Product CMS release documents exact held publication and preserves prior source', () => {
  assert.equal(manifest.contentPath, 'docs-v002');
  assert.equal(manifest.version, '0.0.2');
  const old = fs.readFileSync(path.join(root, 'data/docs-v001/records/documentation/productDocumentationComponentData.js'));
  assert.equal(contract.sha256(old), '9b284a05b20c66f9f92fbf939a9e87d718b91dc1ef895d5b6c6b3ca866f5eb53');
  const catalogue = contract.validateDataRelease(root, 'documentation');
  const article = catalogue.documents.find(document => document.ownerRoot === root);
  for (const phrase of ['HELD_BUNDLE_LISTING', 'before its start date', 'Blank end',
    'filtering runs before customer pagination', 'No duplicate Product price', 'null roundCode',
    'original recovery fence', 'intentional overrides', 'availability.acquisitionRequirements',
    'explicit null', 'no Payment', 'not copied Product attributes']) {
    assert.ok(article.body.includes(phrase), phrase);
  }
  assert.equal(article.lifecycleState, 'STAGED');
  const properties = require('../data/docs-v002/records/documentation/productDocumentationComponentData').record0.properties;
  const page = require('../data/docs-v002/records/documentation/productDocumentationPageMetadataData').record0;
  assert.equal(properties.source.checksum, contract.sha256(article.body));
  assert.equal(page.sourceChecksum, properties.source.checksum);
  assert.equal(page.sourceWordCount, contract.countWords(article.body));
  assert.deepEqual(page.headings, properties.headings);
  const states = Object.values(require('../data/docs-v002/records/documentation/productDocumentationPublicationStateData'));
  const predecessorStates = new Map(Object.values(require('../data/docs-v001/records/documentation/productDocumentationPublicationStateData'))
    .map(state => [state.code, state]));
  for (const state of states) {
    assert.equal(state.lifecycleState, 'STAGED');
    assert.equal(state.stagedVersion, manifest.version);
    assert.equal(state.onlineVersion, undefined);
    assert.ok(typeof state.author === 'string' && state.author.length > 0);
    assert.equal(state.author, predecessorStates.get(state.code)?.author, 'retain exact predecessor source-author provenance');
    assert.equal(state.reviewer, undefined);
    assert.equal(state.approver, undefined);
    assert.equal(state.publisher, undefined);
    assert.deepEqual(state.auditTrail, []);
  }
});

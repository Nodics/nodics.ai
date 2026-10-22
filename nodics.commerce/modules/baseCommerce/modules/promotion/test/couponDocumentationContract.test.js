/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
/** @module promotion/test/couponDocumentationContract @description Verifies existing Coupon owner CMS identities, projections, evidence and independently selectable source-pack hashes. @owner promotion @layer test */
const root = path.resolve(__dirname, '../../../../../..');
for (const [owner, base, documentId, anchors] of [
  ['promotion', path.resolve(__dirname, '..'), 'promotion.campaigns-coupon-issuance',
    ['promotion-governed-coupon-offers','promotion-coupon-participation-reporting','promotion-coupon-delivery-verification','promotion-local-item-simulation']],
  ['digitalCore', path.resolve(__dirname, '../../../../digitalCommerce/modules/digitalCore'), 'digital.purchase-delivery-reveal',
    ['digital-governed-coupon-acquisition','digital-coupon-expiry-reminders','digital-coupon-source-verification','digital-original-sale-ownership-refund']],
]) {
  test(owner + ' existing canonical CMS article retains identity and complete coupon source projections', () => {
    const manifest = require(path.join(base, 'data/manifest.json')).sections.documentation;
    const directory = path.join(base, 'data', manifest.contentPath, 'records/documentation');
    const read = suffix => require(path.join(directory, owner + 'Documentation' + suffix + 'Data.js'));
    const article = Object.values(read('Component')).find(row => row.properties.code === documentId).properties;
    const metadata = Object.values(read('PageMetadata')).find(row => row.documentId === documentId);
    const node = Object.values(read('Node')).find(row => row.targetDocumentationPage === metadata.code);
    assert.equal(article.code, documentId); assert.equal(metadata.documentId, documentId);
    assert.equal(article.source.sourcePath, manifest.sourceAuthority + '/' + owner + 'DocumentationComponentData.js');
    assert.deepEqual(metadata.headings, article.headings); assert.deepEqual(metadata.sourceEvidence, article.sourceEvidence);
    for (const anchor of anchors) assert.ok(article.headings.some(h => h.anchor === anchor));
    const texts = article.blocks.filter(b => b.kind === 'paragraph').map(b => b.text).join('\n');
    for (const term of ['NONE','CERTIFICATES','BOTH','Profile','Communication','source','installed']) assert.ok(texts.includes(term), term);
    const searches = Object.values(read('SearchMetadata')).filter(row => row.targetCode === metadata.code ||
      row.targetCode === node.code);
    assert.equal(searches.length, 2);
    for (const row of searches) assert.ok(row.searchText.endsWith(article.searchText));
    assert.equal(metadata.sourceChecksum, article.source.checksum);
    assert.equal(article.source.checksum, crypto.createHash('sha256').update(JSON.stringify(article.blocks)).digest('hex'));
    for (const evidence of article.sourceEvidence) assert.ok(fs.existsSync(path.join(base, evidence)), evidence);
    assert.equal(manifest.sourceMode, 'cms-records'); assert.equal(manifest.installationPolicy, 'OPTIONAL_AXIS_INITIATED');
    assert.equal(manifest.initialPublicationPolicy, 'ADMIN_INITIATED');
    for (const [file, checksum] of Object.entries(manifest.generatedHashes))
      assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(base, 'data', file))).digest('hex'), checksum, file);
    const contract = require(path.join(root, 'nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService'));
    assert.equal(contract.releaseChecksum(manifest.generatedHashes), manifest.releaseChecksum);
    assert.equal(Object.values(read('Route')).find(row => row.code === metadata.targetRoute).path, article.route);
  });
}

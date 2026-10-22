/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module bidding/test/biddingAuctionDocumentation @description Verifies owner CMS auction content, derived evidence and unapproved Staged publication without runtime import. @layer test @owner bidding */
const test = require('node:test'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const contract = require('../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const manifest = require('../data/manifest.json').sections.documentation;
const records = name => Object.values(require(path.join(root, 'data', manifest.contentPath, 'records/documentation/biddingDocumentation' + name + 'Data')));

test('owner auction CMS pack validates concrete behavior, defaults and qualification boundaries', () => {
  const catalogue = contract.validateDataRelease(root, 'documentation');
  const article = catalogue.documents.find(document => document.ownerRoot === root);
  assert.equal(article.id, 'commerce.auction-rounds');
  for (const phrase of ['independent private offers', 'earliest retained submission', 'no re-award',
    'onSelectedPurchase', 'RESERVE_ON_BID', '24', '1000 / 10000', 'checkoutCore',
    '/internal/auctions/notification-recipients', 'inactive Cron definition', 'No server, provider, database',
    'AuctionPurchase', 'RESUME_ORIGINAL_PLACEMENT', 'GET /bids', '100 pages, 10000 rounds', 'auction-purchase:',
    'CANCELLATION_PENDING', 'profileTransport', 'end-plus-grace overflow', 'rejects browser funding selectors'])
    assert.ok(article.body.includes(phrase), phrase);
  assert.equal(article.source.owner, 'bidding');
  assert.equal(article.lifecycleState, 'STAGED');
});

test('auction CMS metadata and publication checksums derive from exact canonical records', () => {
  const properties = records('Component')[0].properties, page = records('PageMetadata')[0];
  const body = '# ' + page.title + '\n\n' + contract.documentationText(properties.blocks);
  assert.equal(page.sourceChecksum, contract.sha256(body));
  assert.equal(properties.source.checksum, page.sourceChecksum);
  assert.equal(page.sourceWordCount, contract.countWords(body));
  assert.deepEqual(page.headings, properties.headings);
  assert.equal(records('SearchMetadata').find(record => record.targetType === 'PAGE').searchText, properties.searchText);
  const targets = new Map(['Node', 'PageMetadata', 'SearchMetadata'].flatMap(name => records(name).map(record => [record.code, record])));
  for (const state of records('PublicationState')) {
    assert.equal(state.lifecycleState, 'STAGED');
    assert.equal(state.stagedVersion, manifest.version);
    assert.equal(state.checksum, contract.sha256(JSON.stringify(targets.get(state.targetCode))));
    assert.deepEqual(state.auditTrail, []);
    for (const field of ['onlineVersion', 'actor', 'reviewer', 'approver', 'publisher']) assert.equal(state[field], undefined);
  }
  assert.equal(records('Route')[0].deliveryState, 'STAGED');
});

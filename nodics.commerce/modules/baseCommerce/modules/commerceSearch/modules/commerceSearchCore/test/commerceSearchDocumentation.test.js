/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const framework = path.resolve(root, '../../../../../../../');
const contract = require(path.join(framework, 'nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService'));

test('Search guide preserves existing anchors and documents complete-set commercial targeting', () => {
    const guide = contract.validateDataRelease(root).documents.find(document => document.id === 'commerce.search-guide');
    assert.equal(guide.routePath, '/docs/framework/commerce-search-guide');
    assert.equal(guide.headings.length, 14);
    for (let index = 1; index <= 4; index++) {
        assert(guide.headings.some(heading => heading.anchor === 'commerce-search-guide-source-depth-' + index));
    }
    assert(guide.headings.some(heading => heading.anchor === 'commerceSearchGuide-1-source-map'));
    assert(contract.countWords(guide.body) > 1603);
    assert.equal(guide.source.checksum, contract.sha256(guide.body));
    for (const text of ['page-local', 'before the first ten', 'benefitRef', 'couponIssuerMemberships',
        'ALL_ENTERPRISE_COUPONS', 'Explicit zero weights', 'index acknowledgement',
        'ranking.defaultRulePriority', 'no compatibility fallback']) assert(guide.body.includes(text), text);
});

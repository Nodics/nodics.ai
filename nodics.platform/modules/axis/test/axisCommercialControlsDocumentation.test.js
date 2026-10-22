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
const contract = require('../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');

test('Axis workbench guide retains existing detail and bounded native owner contracts', () => {
    const guide = contract.validateDataRelease(root).documents.find(document => document.id === 'axis.schema-workbench');
    assert.equal(guide.routePath, '/docs/nodics-axis/schema-workbench');
    assert.equal(guide.headings.length, 24);
    assert(guide.headings.some(heading => heading.anchor === 'schema-workbench-22-common-mistakes'));
    assert(contract.countWords(guide.body) > 5142);
    assert.equal(guide.source.checksum, contract.sha256(guide.body));
    for (const text of ['commercialAgreement.history', 'loyalty.transferSettings', 'loyalty.enterpriseTestCredit',
        'perPurchaseLimit', 'promotion.couponOffers / authoring', 'COMMERCE_STAGED/STAGED',
        'COMMERCE/ONLINE', 'sessionGeneration', 'not an access grant']) assert(guide.body.includes(text), text);
});

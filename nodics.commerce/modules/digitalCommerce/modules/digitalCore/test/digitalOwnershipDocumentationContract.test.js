/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/**
 * @module digitalCore/test/digitalOwnershipDocumentationContract
 * @description Prevents retained one-asset documentation from promising retired eWaste refunds.
 * @owner digitalCore
 * @layer test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const contract = fs.readFileSync(path.join(__dirname, '../llm/contracts/persisted-digital-ownership.md'), 'utf8');

test('ownership contract distinguishes common recovery, final sales and immutable historical evidence', () => {
    assert.match(contract, /New Circa\/eWaste sales use[\s\S]*?final sales with no\s+return\/refund path/);
    assert.match(contract, /refund-preview` returns final-sale ineligibility/);
    assert.match(contract, /refund-prepare\/refund-settle\/refund-complete` mutation phases refuse/);
    assert.match(contract, /Supported common Commerce recovery is distinct from a completed-sale reversal/);
    assert.match(contract, /Independently eligible coupon or physical Commerce order/);
    assert.match(contract, /Historical records may retain/);
    assert.match(contract, /Preserve them unchanged for provenance and owner-led\s+reconciliation/);
    assert.match(contract, /Do not restore a\s+compatibility mutation/);
    assert.doesNotMatch(contract, /## Original Sale Refund|The narrow reviewed original-sale path|the scoped original-sale refund/);
    assert.doesNotMatch(contract, /digital-ownership-sale\.md#original-sale-refund/);
});

test('ownership contract local references resolve and finality anchor exists in its implementing owner', () => {
    const base = path.join(__dirname, '../llm/contracts');
    for (const match of contract.matchAll(/\]\(([^)]+\.md)(?:#[^)]+)?\)/g))
        assert.ok(fs.existsSync(path.resolve(base, match[1])), match[1]);
    const domain = fs.readFileSync(path.resolve(base,
        '../../../../../../../nodics.accelerators/modules/waste/modules/eWaste/llm/contracts/digital-ownership-sale.md'), 'utf8');
    assert.match(domain, /## Completed Purchases Are Final/);
    assert.match(domain, /Incomplete purchases use original Checkout recovery/);
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyLedger/test/loyaltyLedgerContract @description Verifies reward ledger movement types and append-only operation guard. @layer test @owner loyaltyLedger */
const assert = require('assert');
const enums = require('../../loyaltyCore/src/utils/enums');
const postingService = require('../src/service/defaultLoyaltyLedgerPostingService');

assert.deepStrictEqual(enums.LoyaltyLedgerEntryType.definition, ['EARN', 'RESERVE', 'CAPTURE', 'RELEASE', 'EXPIRE', 'ADJUST', 'REVERSE']);
assert.throws(() => postingService.assertAppendOnlyMutation({ operation: 'update' }), /append-only/);

const entry = postingService.buildEntry({
    walletCode: 'wallet-001',
    programCode: 'default',
    rewardTypeCode: 'points',
    entryType: 'earn',
    amount: '12.5',
    sourceType: 'ORDER',
    sourceCode: 'order-001',
    idempotencyKey: 'idem-001',
    correlationId: 'corr-001'
});
assert.strictEqual(entry.entryType, 'EARN');
assert.strictEqual(entry.amount, '12.50');
assert(entry.postedAt instanceof Date);

console.log('Loyalty ledger contract validated');

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyRedemption/data/sample-v001/records/loyaltyRedemptionLifecycleData @description Provides redemption evidence for the local sample lifecycle. @layer data @owner loyaltyRedemption */
module.exports = {
    record0: {
        code: 'sample-redemption-001',
        walletCode: 'sample-customer-wallet-001',
        programCode: 'default',
        rewardTypeCode: 'points',
        amount: '25.00',
        status: 'CAPTURED',
        targetType: 'ORDER',
        targetCode: 'sample-order-002',
        reservationCode: 'sample-reservation-001',
        captureLedgerEntryCode: 'sample-ledger-capture-001',
        providerReference: 'loyalty-payment-sample',
        idempotencyKey: 'sample-capture-001',
        correlationId: 'sample-loyalty-lifecycle',
        redeemedAt: '2026-09-01T10:10:00.000Z',
        revision: 1,
        active: true
    }
};

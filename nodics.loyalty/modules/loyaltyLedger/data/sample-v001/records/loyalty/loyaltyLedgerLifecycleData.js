/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyLedger/data/sample-v001/records/loyaltyLedgerLifecycleData @description Provides append-only ledger evidence for the local sample lifecycle. @layer data @owner loyaltyLedger */
module.exports = {
    record0: {
        code: 'sample-ledger-earn-001',
        walletCode: 'sample-customer-wallet-001',
        programCode: 'default',
        rewardTypeCode: 'points',
        entryType: 'EARN',
        amount: '100.00',
        availableAfter: '100.00',
        reservedAfter: '0.00',
        sourceType: 'ORDER',
        sourceCode: 'sample-order-001',
        targetType: 'ORDER',
        targetCode: 'sample-order-001',
        idempotencyKey: 'sample-earn-001',
        correlationId: 'sample-loyalty-lifecycle',
        postedAt: '2026-09-01T10:00:00.000Z',
        active: true
    },
    record1: {
        code: 'sample-ledger-reserve-001',
        walletCode: 'sample-customer-wallet-001',
        programCode: 'default',
        rewardTypeCode: 'points',
        entryType: 'RESERVE',
        amount: '25.00',
        availableAfter: '75.00',
        reservedAfter: '25.00',
        sourceType: 'PAYMENT',
        sourceCode: 'sample-payment-001',
        targetType: 'ORDER',
        targetCode: 'sample-order-002',
        reservationCode: 'sample-reservation-001',
        idempotencyKey: 'sample-reserve-001',
        correlationId: 'sample-loyalty-lifecycle',
        postedAt: '2026-09-01T10:05:00.000Z',
        active: true
    },
    record2: {
        code: 'sample-ledger-capture-001',
        walletCode: 'sample-customer-wallet-001',
        programCode: 'default',
        rewardTypeCode: 'points',
        entryType: 'CAPTURE',
        amount: '25.00',
        availableAfter: '75.00',
        reservedAfter: '0.00',
        sourceType: 'PAYMENT',
        sourceCode: 'sample-payment-001',
        targetType: 'ORDER',
        targetCode: 'sample-order-002',
        reservationCode: 'sample-reservation-001',
        redemptionCode: 'sample-redemption-001',
        idempotencyKey: 'sample-capture-001',
        correlationId: 'sample-loyalty-lifecycle',
        postedAt: '2026-09-01T10:10:00.000Z',
        active: true
    }
};

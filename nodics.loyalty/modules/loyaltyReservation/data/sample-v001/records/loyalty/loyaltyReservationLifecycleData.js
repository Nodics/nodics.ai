/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyReservation/data/sample-v001/records/loyaltyReservationLifecycleData @description Provides captured reservation evidence for the local sample lifecycle. @layer data @owner loyaltyReservation */
module.exports = {
    record0: {
        code: 'sample-reservation-001',
        walletCode: 'sample-customer-wallet-001',
        programCode: 'default',
        rewardTypeCode: 'points',
        amount: '25.00',
        status: 'CAPTURED',
        sourceType: 'PAYMENT',
        sourceCode: 'sample-payment-001',
        targetType: 'ORDER',
        targetCode: 'sample-order-002',
        expiresAt: '2026-09-01T10:20:00.000Z',
        createdAt: '2026-09-01T10:05:00.000Z',
        capturedAt: '2026-09-01T10:10:00.000Z',
        ledgerEntryCodes: ['sample-ledger-reserve-001', 'sample-ledger-capture-001'],
        idempotencyKey: 'sample-reserve-001',
        correlationId: 'sample-loyalty-lifecycle',
        revision: 1,
        active: true
    }
};

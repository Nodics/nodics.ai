/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/src/schemas/schemas @description Defines owner wallets and per-reward balance projections. @layer schema @owner loyaltyWallet @override Later modules may add governed fields while preserving ownerType/ownerCode identity and ledger-backed balances. */
module.exports = { loyaltyWallet: {
    loyaltyWallet: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        ownerType: { type: 'string', required: true, enum: ['CUSTOMER', 'EMPLOYEE', 'ENTERPRISE', 'PARTNER', 'SYSTEM'] },
        ownerCode: { type: 'string', required: true },
        status: { type: 'string', required: true, enum: ['OPEN', 'SUSPENDED', 'CLOSED'] },
        openedAt: { type: 'date', required: true },
        closedAt: { type: 'date', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    loyaltyWalletRewardBalance: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        walletCode: { type: 'string', required: true },
        programCode: { type: 'string', required: true },
        rewardTypeCode: { type: 'string', required: true },
        available: { type: 'string', required: true, default: '0.00' },
        reserved: { type: 'string', required: true, default: '0.00' },
        earned: { type: 'string', required: true, default: '0.00' },
        spent: { type: 'string', required: true, default: '0.00' },
        expired: { type: 'string', required: true, default: '0.00' },
        reversed: { type: 'string', required: true, default: '0.00' },
        updatedAt: { type: 'date', required: true },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };

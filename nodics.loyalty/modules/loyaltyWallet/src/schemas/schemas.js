/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/src/schemas/schemas @description Defines owner wallets and per-reward balance projections. @layer schema @owner loyaltyWallet @override Later modules may add governed fields while preserving ownerType/ownerCode identity and ledger-backed balances. */
module.exports = { loyaltyWallet: {
    loyaltyWallet: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        ownerType: { type: 'string', required: true, enum: ['CUSTOMER', 'EMPLOYEE', 'ENTERPRISE', 'PARTNER', 'SYSTEM'] , description: 'Classifies the type of owner responsible for this record.'},
        ownerCode: { type: 'string', required: true , description: 'Stores the owner code used to classify, link, or resolve this record.'},
        status: { type: 'string', required: true, enum: ['OPEN', 'SUSPENDED', 'CLOSED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        openedAt: { type: 'date', required: true , description: 'Records when the opened event or value applies.'},
        closedAt: { type: 'date', required: false , description: 'Records when the closed event or value applies.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    loyaltyWalletRewardBalance: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        walletCode: { type: 'string', required: true , description: 'Stores the wallet code used to classify, link, or resolve this record.'},
        programCode: { type: 'string', required: true , description: 'Stores the program code used to classify, link, or resolve this record.'},
        rewardTypeCode: { type: 'string', required: true , description: 'Stores the reward type code used to classify, link, or resolve this record.'},
        available: { type: 'string', required: true, default: '0.00' , description: 'Stores the available value, using the configured default when no explicit value is provided.'},
        reserved: { type: 'string', required: true, default: '0.00' , description: 'Stores the reserved value, using the configured default when no explicit value is provided.'},
        earned: { type: 'string', required: true, default: '0.00' , description: 'Stores the earned value, using the configured default when no explicit value is provided.'},
        spent: { type: 'string', required: true, default: '0.00' , description: 'Stores the spent value, using the configured default when no explicit value is provided.'},
        expired: { type: 'string', required: true, default: '0.00' , description: 'Stores the expired value, using the configured default when no explicit value is provided.'},
        reversed: { type: 'string', required: true, default: '0.00' , description: 'Stores the reversed value, using the configured default when no explicit value is provided.'},
        updatedAt: { type: 'date', required: true , description: 'Records when the updated event or value applies.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } })
} };

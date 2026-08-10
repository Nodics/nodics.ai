/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module paymentCore/src/schemas/schemas @description Defines governed Commerce lifecycle evidence. @layer schema @owner paymentCore */
const internal = policy => ({ super: 'base', model: true, schemaPolicies: [policy], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } });
module.exports = { paymentCore: {
    paymentInstrumentReference: Object.assign(internal('operational'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, ownerId: { type: 'string', required: false }, orderCode: { type: 'string', required: false }, cartCode: { type: 'string', required: false }, status: { type: 'string', required: true }, revision: { type: 'int', required: true }, idempotencyKey: { type: 'string', required: false }, correlationId: { type: 'string', required: true }, evidence: { type: 'object', required: false }, occurredAt: { type: 'date', required: false } } }),
    paymentTransaction: Object.assign(internal('operational'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, ownerId: { type: 'string', required: false }, orderCode: { type: 'string', required: false }, cartCode: { type: 'string', required: false }, status: { type: 'string', required: true }, revision: { type: 'int', required: true }, idempotencyKey: { type: 'string', required: false }, correlationId: { type: 'string', required: true }, evidence: { type: 'object', required: false }, occurredAt: { type: 'date', required: false }, currency: { type: 'string', required: false }, totalAmount: { type: 'string', required: false } } }),
    paymentTransactionEntry: Object.assign(internal('operational'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, ownerId: { type: 'string', required: false }, orderCode: { type: 'string', required: false }, cartCode: { type: 'string', required: false }, status: { type: 'string', required: true }, revision: { type: 'int', required: true }, idempotencyKey: { type: 'string', required: false }, correlationId: { type: 'string', required: true }, evidence: { type: 'object', required: false }, occurredAt: { type: 'date', required: false }, productCode: { type: 'string', required: false }, sku: { type: 'string', required: false }, quantity: { type: 'string', required: false }, unitAmount: { type: 'string', required: false } } }),
    paymentReconciliation: Object.assign(internal('operational'), { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, ownerId: { type: 'string', required: false }, orderCode: { type: 'string', required: false }, cartCode: { type: 'string', required: false }, status: { type: 'string', required: true }, revision: { type: 'int', required: true }, idempotencyKey: { type: 'string', required: false }, correlationId: { type: 'string', required: true }, evidence: { type: 'object', required: false }, occurredAt: { type: 'date', required: false } } })
} };
module.exports.paymentCore.paymentTransaction.backoffice = { operations: ['search', 'read'], description: 'Payment transaction evidence; provider operations remain Payment-owned.' };
module.exports.paymentCore.paymentReconciliation.backoffice = { operations: ['search', 'read'], description: 'Provider reconciliation evidence.' };

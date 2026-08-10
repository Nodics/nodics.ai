/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module paymentCore/src/service/defaultPaymentExecutionService @description Enforces provider-neutral idempotent payment operations and evidence. @layer service @owner paymentCore */
const ALLOWED = new Set(['AUTHORIZE', 'CAPTURE', 'VOID', 'REFUND']);
const inFlight = new Map();
module.exports = { execute: async function (request, adapter, repository) {
    if (!request || !request.tenant || !request.idempotencyKey || !ALLOWED.has(request.operation)) throw new Error('Valid tenant payment operation and idempotency key are required');
    const key = request.tenant + ':' + request.idempotencyKey;
    if (inFlight.has(key)) return inFlight.get(key);
    const execution = (async () => {
        const existing = await repository.find(request.tenant, request.idempotencyKey); if (existing) return existing;
        const response = await adapter.execute(Object.freeze({ tenant: request.tenant, operation: request.operation, amount: request.amount, currency: request.currency, providerToken: request.providerToken, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId }));
        return repository.record(Object.freeze({ tenant: request.tenant, operation: request.operation, amount: request.amount, currency: request.currency, providerCode: adapter.code, providerReference: response.reference, status: response.status, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId }));
    })();
    inFlight.set(key, execution);
    try { return await execution; } finally { inFlight.delete(key); }
} };

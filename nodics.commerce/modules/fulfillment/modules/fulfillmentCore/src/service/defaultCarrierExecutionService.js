/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module fulfillmentCore/src/service/defaultCarrierExecutionService @description Enforces a bounded idempotent carrier adapter contract. @layer service @owner fulfillmentCore */
module.exports = { execute: async function (request, adapter, repository) {
    if (!request || !request.tenant || !request.idempotencyKey || !['QUOTE', 'CREATE_SHIPMENT', 'CANCEL_SHIPMENT', 'TRACK', 'CREATE_RETURN'].includes(request.operation)) throw new Error('Valid tenant carrier operation is required');
    if (!adapter || typeof adapter.execute !== 'function' || !adapter.code) throw new Error('Conformant carrier adapter is required');
    const existing = await repository.find(request.tenant, request.idempotencyKey); if (existing) return existing;
    const result = await adapter.execute(Object.freeze({ tenant: request.tenant, operation: request.operation, shipmentCode: request.shipmentCode, parcels: request.parcels, addressReference: request.addressReference, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId }));
    return repository.record(Object.freeze({ tenant: request.tenant, carrierCode: adapter.code, operation: request.operation, shipmentCode: request.shipmentCode, externalReference: result.reference, status: result.status, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId }));
} };

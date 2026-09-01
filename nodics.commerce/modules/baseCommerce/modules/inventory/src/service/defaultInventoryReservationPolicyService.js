/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module inventory/src/service/defaultInventoryReservationPolicyService @description Validates tenant-safe idempotent reservation intent. @layer service @owner inventory */
module.exports = { prepare: function (request, balance, exactAmountService) {
    if (!request || !balance || request.tenant !== balance.tenant) throw new Error('Tenant-scoped balance is required');
    const quantity = exactAmountService.normalize(request.quantity);
    if (quantity.startsWith('-') || quantity === '0') throw new Error('Reservation quantity must be positive');
    return Object.freeze({ tenant: request.tenant, enterpriseCode: request.enterpriseCode || balance.enterpriseCode, warehouseCode: balance.warehouseCode, sku: balance.sku, ownerType: request.ownerType, ownerCode: request.ownerCode, quantity, status: 'ACTIVE', idempotencyKey: request.idempotencyKey, correlationId: request.correlationId, expectedBalanceRevision: balance.revision });
} };

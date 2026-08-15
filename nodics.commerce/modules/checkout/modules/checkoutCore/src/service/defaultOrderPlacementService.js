/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module checkoutCore/src/service/defaultOrderPlacementService @description Coordinates idempotent placement checkpoints and compensations through domain ports. @layer service @owner checkoutCore */
module.exports = { place: async function (request, ports) {
    if (!request || !request.tenant || !request.idempotencyKey || !ports) throw new Error('Tenant, idempotency key, and ports are required');
    const existing = await ports.findPlacement(request); if (existing) return existing;
    const checkpoint = { tenant: request.tenant, ownerId: request.ownerId, authData: request.authData, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId, completed: [], results: {} };
    try {
        const calculation = await ports.calculateCart(request); checkpoint.results.calculation = calculation; checkpoint.completed.push('CALCULATED');
        const reservation = await ports.reserveInventory(request, calculation); checkpoint.results.reservation = reservation; checkpoint.completed.push('RESERVED');
        const authorization = await ports.authorizePayment(request, calculation); checkpoint.results.authorization = authorization; checkpoint.completed.push('AUTHORIZED');
        const order = await ports.createOrder(request, calculation, reservation, authorization); checkpoint.results.order = order; checkpoint.completed.push('ORDERED');
        const release = await ports.releaseFulfillment(request, order); checkpoint.results.release = release; checkpoint.completed.push('RELEASED');
        return await ports.complete(checkpoint, { order, calculation, reservation, authorization, release });
    } catch (error) {
        await ports.compensate(checkpoint, error, request);
        throw error;
    }
} };

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
    const checkpoint = { tenant: request.tenant, enterpriseCode: request.enterpriseCode, ownerId: request.ownerId, authData: request.authData, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId, completed: [], results: {} };
    try {
        const validation = ports.validateCart ? await ports.validateCart(request) : { status: 'SKIPPED' }; checkpoint.results.validation = validation; checkpoint.completed.push('VALIDATED');
        if (validation.status === 'BLOCKED') throw new Error('Cart validation failed');
        const calculation = await ports.calculateCart(request); checkpoint.results.calculation = calculation; checkpoint.completed.push('CALCULATED');
        const reservation = await ports.reserveInventory(request, calculation); checkpoint.results.reservation = reservation; checkpoint.completed.push('RESERVED');
        const digitalReservation = ports.reserveDigitalUnits ? await ports.reserveDigitalUnits(request, calculation) : []; checkpoint.results.digitalReservation = digitalReservation; checkpoint.completed.push('DIGITAL_RESERVED');
        const authorization = await ports.authorizePayment(request, calculation); checkpoint.results.authorization = authorization; checkpoint.completed.push('AUTHORIZED');
        const order = await ports.createOrder(request, calculation, reservation, authorization, digitalReservation); checkpoint.results.order = order; checkpoint.completed.push('ORDERED');
        let capture;
        if (ports.capturePayment) {
            capture = await ports.capturePayment(request, order, authorization);
            checkpoint.results.capture = capture;
            if (capture) checkpoint.completed.push('PAYMENT_CAPTURED');
        }
        const promotionCommit = ports.commitPromotions ? await ports.commitPromotions(request, calculation, order) : undefined; checkpoint.results.promotionCommit = promotionCommit; if (promotionCommit) checkpoint.completed.push('PROMOTION_COMMITTED');
        const digitalSale = ports.confirmDigitalSale ? await ports.confirmDigitalSale(request, order, digitalReservation) : digitalReservation; checkpoint.results.digitalSale = digitalSale; checkpoint.completed.push('DIGITAL_SOLD');
        const release = await ports.releaseFulfillment(request, order); checkpoint.results.release = release; checkpoint.completed.push('RELEASED');
        const digitalDelivery = ports.deliverDigitalUnits ? await ports.deliverDigitalUnits(request, order, digitalSale) : digitalSale; checkpoint.results.digitalDelivery = digitalDelivery; checkpoint.completed.push('DIGITAL_DELIVERED');
        return await ports.complete(checkpoint, { order, calculation, reservation, digitalReservation, authorization, capture, promotionCommit, digitalSale, release, digitalDelivery });
    } catch (error) {
        await ports.compensate(checkpoint, error, request);
        throw error;
    }
} };

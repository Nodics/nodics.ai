/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/service/defaultOrderLifecycleService @description Coordinates cancellation, return, and refund intents while preserving domain ownership and recording recoverable partial-failure evidence. @layer service @owner order @override Customer Order modules may override individual orchestration steps while retaining idempotency, owner ports, and compensation evidence. */
module.exports = { /** Processes one idempotent reverse-lifecycle request through owner-provided ports. @param {Object} request Tenant-scoped lifecycle request. @param {Object} ports Domain-owner ports including an optional compensation recorder. @returns {Promise<Object>} Completed, rejected, awaiting-approval, or replayed lifecycle evidence. */ process: async function (request, ports) {
    if (!request || !request.tenant || !request.orderCode || !request.idempotencyKey) throw new Error('Tenant order lifecycle intent is required');
    const existing = await ports.find(request.tenant, request.idempotencyKey); if (existing) return existing;
    const eligibility = await ports.evaluatePolicy(request); if (!eligibility.eligible) return ports.reject(request, eligibility);
    const approval = eligibility.requiresApproval ? await ports.requestApproval(request, eligibility) : { status: 'APPROVED' };
    if (approval.status !== 'APPROVED') return ports.awaitApproval(request, approval);
    const checkpoint = { eligibility: eligibility, approval: approval, completed: [], results: {} };
    try {
        const fulfillment = await ports.fulfillmentIntent(request, eligibility); checkpoint.results.fulfillment = fulfillment; checkpoint.completed.push('FULFILLMENT');
        const inventory = await ports.inventoryDisposition(request, fulfillment); checkpoint.results.inventory = inventory; checkpoint.completed.push('INVENTORY');
        const payment = await ports.paymentIntent(request, eligibility); checkpoint.results.payment = payment; checkpoint.completed.push('PAYMENT');
        return ports.complete(request, { eligibility: eligibility, approval: approval, fulfillment: fulfillment, inventory: inventory, payment: payment });
    } catch (error) {
        if (typeof ports.compensate === 'function') await ports.compensate(request, checkpoint, error);
        throw error;
    }
} };

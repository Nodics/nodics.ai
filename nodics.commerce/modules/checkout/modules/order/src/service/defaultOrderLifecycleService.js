/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/service/defaultOrderLifecycleService @description Coordinates cancellation, return, and refund intents while preserving domain ownership. @layer service @owner order */
module.exports = { process: async function (request, ports) {
    if (!request || !request.tenant || !request.orderCode || !request.idempotencyKey) throw new Error('Tenant order lifecycle intent is required');
    const existing = await ports.find(request.tenant, request.idempotencyKey); if (existing) return existing;
    const eligibility = await ports.evaluatePolicy(request); if (!eligibility.eligible) return ports.reject(request, eligibility);
    const approval = eligibility.requiresApproval ? await ports.requestApproval(request, eligibility) : { status: 'APPROVED' };
    if (approval.status !== 'APPROVED') return ports.awaitApproval(request, approval);
    const fulfillment = await ports.fulfillmentIntent(request, eligibility);
    const inventory = await ports.inventoryDisposition(request, fulfillment);
    const payment = await ports.paymentIntent(request, eligibility);
    return ports.complete(request, { eligibility, approval, fulfillment, inventory, payment });
} };

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/**
 * @module checkoutCore/src/service/defaultCheckoutOperationService
 * @description Starts idempotent checkout placement through the standard Commerce owner ports.
 * @layer service
 * @owner checkoutCore
 * @remarks Checkout dispatches through existing placement/recovery owners. Retained auction
 * commitments select their own journal; ordinary purchases keep common placement. Caller payload never
 * selects a replacement payment workflow.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: commandStatus, recoverCompensation, resumeBundle, status, place.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
    /**
     * Reads bounded original-command checkpoint metadata without invoking placement or recovery.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Promise<Object>} Qualified original command progress from auction or common checkpoint
     * owner.
     * @remarks Effects: Read-only original command inspection.
     * Failure behavior: Rejects foreign or inconsistent original identity.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    commandStatus: function (request) {
        if (request.auctionFunds) return SERVICE.DefaultCheckoutAuctionService.commandStatus(request);
        return SERVICE.DefaultCheckoutCompensationRecoveryService.commandStatus(request);
    },
    /**
     * Recovers only the retained original compensation command, never placement or Payment execution.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Promise<Object>} Retained original compensation result.
     * @remarks Effects: Delegates existing fenced cleanup; no placement or direct Payment execution.
     * Failure behavior: Propagates owner admission, conflict or uncertain cleanup failure.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    recoverCompensation: function (request) {
        if (request.auctionFunds) throw new Error('Resume the original auction placement; competing compensation is prohibited');
        return SERVICE.DefaultCheckoutCompensationRecoveryService.recover(request);
    },
    /**
     * Resumes only a server-qualified original bundle, coupon or selected-auction obligation.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Promise<Object>} Original auction or bundle/coupon forward-recovery result.
     * @remarks Effects: Resumes existing owner phases with original keys; no second purchase.
     * Failure behavior: Rejects absent qualification or conflicting retained journal/evidence.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    resumeBundle: function (request) {
        if (request.auctionFunds) return SERVICE.DefaultCheckoutAuctionService.resume(request, SERVICE.DefaultCheckoutPlacementPortsService.create());
        return SERVICE.DefaultCheckoutBundleRecoveryService.resume(request);
    },
    /**
     * Reads only a completed checkout owned by the authenticated customer.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Promise<Object>} Owned selected-auction status or completed checkpoint, otherwise
     * NOT_COMPLETED.
     * @remarks Effects: Reads owner-scoped original records only.
     * Failure behavior: Rejects foreign identity or malformed/ambiguous read evidence.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    status: async function(request) {
        if (request.auctionFunds) return SERVICE.DefaultCheckoutAuctionService.purchaseStatus(request);
        const recovery = SERVICE.DefaultCheckoutCompensationRecoveryService;
        const rows = await recovery.rows(SERVICE.DefaultCheckoutCheckpointService, request,
            { orderCode: request.orderCode, ownerId: request.ownerId, status: 'COMPLETED', enterpriseCode: request.enterpriseCode });
        if (rows.length > 1) throw new Error('Checkout evidence is unavailable');
        const record = recovery.assertOwner(request, rows[0]);
        if (record && record.evidence?.orderCode !== request.orderCode) throw new Error('Checkout Order binding is unavailable');
        return record ? { code: record.evidence.orderCode, status: record.status, evidence: record.evidence } : { status: 'NOT_COMPLETED' };
    },
    /**
     * Places the original reviewed Cart/Order through common or selected-auction orchestration.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Promise<Object>} Original common or selected-auction placement result.
     * @remarks Effects: Invokes existing placement ports and their persisted effects under original
     * identity.
     * Failure behavior: Rejects absent Cart/Order/key or any owner phase failure.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    place: function (request) {
        if (!request.payload || !request.payload.cartCode || !request.payload.orderCode || !request.idempotencyKey) return Promise.reject(new Error('Cart, Order, and Idempotency-Key are required'));
        if (request.auctionFunds) return SERVICE.DefaultCheckoutAuctionService.place(request, SERVICE.DefaultCheckoutPlacementPortsService.create());
        return SERVICE.DefaultOrderPlacementService.place(request, SERVICE.DefaultCheckoutPlacementPortsService.create());
    }
};

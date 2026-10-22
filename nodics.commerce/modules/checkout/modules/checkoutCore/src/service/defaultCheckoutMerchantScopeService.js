/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const { isDeepStrictEqual: same } = require('node:util');
/**
 * @module checkoutCore/service/defaultCheckoutMerchantScopeService
 * @description Recovers fixed-price merchant scope from original owner-bound Cart and Checkout records
 * without caller partition selectors.
 * @owner checkoutCore
 * @layer service
 * @remarks Checkout merchant scope reuses canonical Cart bindings and original checkpoints. Selected
 * auctions remain authoritative; ordinary status/recovery cannot accept client merchant headers or
 * relocate an original purchase.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: checkpoint, resolve.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
    /**
     * Reads the original checkpoint across merchant partitions using exact owner and command/order
     * identity.
     * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
     * context.
     * @param {Object} expected Optional original Cart/Order binding to compare with the checkpoint.
     * @returns {Promise<Object>} Original context with verified retained checkpoint merchant scope, or
     * admitted original context where applicable.
     * @remarks Effects: Exact owner+command/Order lookup across merchant partitions; no journal mutation.
     * Failure behavior: Rejects ambiguous, foreign or mismatched retained Cart/Order/owner evidence.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    checkpoint: async function (r, expected) {
        const cart = SERVICE.DefaultCartMerchantScopeService;
        cart.participant(r);
        const command = r.commandCode, order = r.orderCode;
        if (command && order || !cart.identifier(command || order)) throw new Error('One original Checkout selector is required');
        const snapshot = cart.state(r), query = { tenant: r.tenant, ownerId: r.ownerId,
            ...(command ? { idempotencyKey: command } : { orderCode: order, status: 'COMPLETED' }) };
        const rows = cart.records(await SERVICE.DefaultCheckoutCheckpointService.get({ tenant: r.tenant,
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(), query,
            searchOptions: { pageSize: 2, limit: 2, pageNumber: 1 }, options: { recursive: false, skipItemCache: true } }));
        if (!same(cart.state(r), snapshot)) throw new Error('Checkout participant changed during scope read');
        const row = rows[0];
        if (!row) return r;
        const evidence = row.evidence, scope = cart.binding(evidence?.merchantScope);
        if (Object.entries(query).some(([key, value]) => row[key] !== value) || !same(evidence.ownerRef, r.ownerRef) ||
            evidence.participantEnterpriseCode !== r.participantEnterpriseCode || row.enterpriseCode !== scope.enterpriseCode ||
            !cart.identifier(row.cartCode) || !cart.identifier(evidence.orderCode) ||
            row.orderCode !== evidence.orderCode ||
            row.status === 'COMPLETED' && row.code !== evidence.orderCode && !SERVICE.DefaultCheckoutBundleRecoveryService?.completed(row) ||
            row.status !== 'COMPLETED' && row.code !== row.idempotencyKey)
            throw new Error('Original Checkout merchant scope is unavailable');
        if (expected && (row.cartCode !== expected.cartCode || evidence.orderCode !== expected.orderCode ||
            !same(scope, expected.merchantScope))) throw new Error('Original Checkout command binding cannot change');
        return cart.apply(r, scope);
    },
    /**
     * Keeps selected auction commitments authoritative; ordinary placement uses its retained Cart.
     * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
     * context.
     * @returns {Promise<Object>} Participant-preserving context with canonical retained merchant
     * placement.
     * @remarks Effects: Reads selected commitment or original Cart/checkpoint; no replacement scope
     * authority.
     * Failure behavior: Rejects conflicting Store selectors, missing binding or changed participant
     * evidence.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    resolve: async function (r) {
        const selected = SERVICE.DefaultCheckoutAuctionService ? await SERVICE.DefaultCheckoutAuctionService.partition(r) : r;
        if (selected.auctionFunds) return selected;
        if (r.commandCode || r.orderCode) return this.checkpoint(r);
        const scoped = await SERVICE.DefaultCartMerchantScopeService.retained(r);
        if (r.idempotencyKey) await this.checkpoint({ ...r, commandCode: r.idempotencyKey },
            { cartCode: r.payload?.cartCode, orderCode: r.payload?.orderCode, merchantScope: scoped.merchantScope });
        return scoped;
    }
};

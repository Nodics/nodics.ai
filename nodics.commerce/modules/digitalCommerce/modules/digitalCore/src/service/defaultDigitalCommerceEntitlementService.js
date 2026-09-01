/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');

/** @module digitalCore/src/service/defaultDigitalCommerceEntitlementService @description Owns Digital Commerce entitlement, delivery, reveal, and revocation evidence. @layer service @owner digitalCore */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
    /** Builds service auth for generated digital records. @param {Object} request Request. @returns {Object} Service auth. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            enterpriseCode: request.enterpriseCode,
            principalId: 'digitalCommerceEntitlementService',
            code: 'digitalCommerceEntitlementService',
            loginId: 'digitalCommerceEntitlementService',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },
    /** Applies generated-schema persistence fields. @param {Object} model Model. @returns {Object} Persistable model. */
    persistenceModel: function (model) {
        const now = new Date();
        return Object.assign({ active: true, created: now, updated: now }, model);
    },
    /** Saves through a generated service when present. @param {Object} service Generated service. @param {Object} request Request. @param {Object} model Model. @returns {Promise<Object>} Saved model. */
    save: async function (service, request, model) {
        if (!service || !service.save) return model;
        return this.unwrap(await service.save({ tenant: request.tenant, authData: this.serviceAuthData(request), model: this.persistenceModel(model) }));
    },
    /** Updates through a generated service when present. @param {Object} service Generated service. @param {Object} request Request. @param {Object} existing Existing model. @param {Object} patch Patch. @returns {Promise<Object>} Updated model. */
    update: async function (service, request, existing, patch) {
        const model = Object.assign({}, existing, patch, { revision: Number(existing.revision || 0) + 1, updated: new Date() });
        if (!service || !service.update) return model;
        const query = { tenant: request.tenant, code: existing.code };
        if (request.enterpriseCode) query.enterpriseCode = request.enterpriseCode;
        return this.unwrap(await service.update({ tenant: request.tenant, authData: this.serviceAuthData(request), query, model }));
    },
    /** Reads entitlement records. @param {Object} request Request. @param {Object} query Query. @returns {Promise<Array>} Entitlements. */
    listEntitlements: async function (request, query) {
        if (!SERVICE.DefaultDigitalEntitlementService || !SERVICE.DefaultDigitalEntitlementService.get) return [];
        const scoped = Object.assign({ tenant: request.tenant }, query || {});
        if (request.enterpriseCode) scoped.enterpriseCode = request.enterpriseCode;
        const result = this.unwrap(await SERVICE.DefaultDigitalEntitlementService.get({ tenant: request.tenant, authData: this.serviceAuthData(request), query: scoped, pageSize: 100 }));
        return Array.isArray(result) ? result : result ? [result] : [];
    },
    /** Builds a customer-safe entitlement summary. @param {Object} entitlement Entitlement model. @returns {Object} Summary. */
    publicEntitlement: function (entitlement) {
        return {
            code: entitlement.code,
            enterpriseCode: entitlement.enterpriseCode,
            ownerId: entitlement.ownerId,
            orderCode: entitlement.orderCode,
            orderEntryCode: entitlement.orderEntryCode,
            cartCode: entitlement.cartCode,
            productCode: entitlement.productCode,
            sku: entitlement.sku,
            status: entitlement.status,
            digitalDeliveryType: entitlement.digitalDeliveryType,
            providerOwner: entitlement.providerOwner,
            providerCode: entitlement.providerCode,
            claimStatus: entitlement.claimStatus,
            purchasedAt: entitlement.purchasedAt,
            deliveredAt: entitlement.deliveredAt,
            revokedAt: entitlement.revokedAt,
            evidence: entitlement.evidence
        };
    },
    /** Lists customer-owned entitlements without exposing secret provider tokens. @param {Object} request Request. @returns {Promise<Object>} Entitlement response. */
    listOwn: async function (request) {
        const query = Object.assign({}, request.query || {}, { ownerId: request.ownerId });
        if (!query.status) query.status = 'ACTIVE';
        const entitlements = await this.listEntitlements(request, query);
        return { entitlements: entitlements.map(this.publicEntitlement) };
    },
    /** Creates deterministic entitlement code for one provider unit. @param {Object} request Request. @param {Object} unit Unit. @returns {string} Entitlement code. */
    entitlementCode: function (request, unit) {
        return ['digitalEntitlement', crypto.createHash('sha1').update([request.tenant, request.enterpriseCode, request.ownerId, unit.orderCode, unit.providerCode].join('|')).digest('hex')].join(':');
    },
    /** Creates customer-owned entitlements from sold coupon units. @param {Object} request Request. @param {Object} order Order. @param {Array} sales Sold provider units. @returns {Promise<Array>} Entitlements. */
    createFromCouponSales: async function (request, order, sales) {
        const entitlements = [];
        for (const sale of sales || []) {
            const unit = {
                orderCode: order && order.code || sale.orderCode || request.payload && request.payload.orderCode,
                providerCode: sale.code
            };
            const model = {
                code: this.entitlementCode(request, unit),
                tenant: request.tenant,
                enterpriseCode: request.enterpriseCode || sale.enterpriseCode,
                ownerId: request.ownerId || sale.soldTo,
                orderCode: unit.orderCode,
                orderEntryCode: sale.orderEntryCode || sale.entryCode,
                cartCode: sale.cartCode || request.payload && request.payload.cartCode,
                productCode: sale.productCode,
                sku: sale.sku,
                status: 'ACTIVE',
                revision: 0,
                idempotencyKey: [sale.idempotencyKey || request.idempotencyKey, 'entitlement'].join(':'),
                correlationId: request.correlationId,
                digitalDeliveryType: 'COUPON_CODE',
                providerOwner: 'promotion',
                providerCode: sale.code,
                claimStatus: sale.benefitStatus || 'UNCLAIMED',
                revealPolicy: { ownerOnly: true, redactFromPublicEvidence: true },
                purchasedAt: sale.soldAt || new Date(),
                evidence: { promotionCode: sale.promotionCode, couponBatchCode: sale.batchCode }
            };
            entitlements.push(await this.save(SERVICE.DefaultDigitalEntitlementService, request, model));
        }
        return entitlements;
    },
    /** Records delivery evidence and updates entitlements when generated services exist. @param {Object} request Request. @param {Object} order Order. @param {Array} deliveries Provider delivery units. @returns {Promise<Array>} Delivery records. */
    recordDeliveries: async function (request, order, deliveries) {
        const records = [];
        for (const delivery of deliveries || []) {
            const entitlement = (await this.listEntitlements(request, { providerOwner: 'promotion', providerCode: delivery.code, ownerId: request.ownerId }))[0];
            const entitlementCode = entitlement && entitlement.code || ['digitalEntitlement', delivery.code].join(':');
            const model = {
                code: ['digitalDelivery', delivery.code].join(':'),
                tenant: request.tenant,
                enterpriseCode: request.enterpriseCode || delivery.enterpriseCode,
                ownerId: request.ownerId || delivery.soldTo,
                entitlementCode,
                orderCode: order && order.code || delivery.orderCode || request.payload && request.payload.orderCode,
                deliveryType: 'COUPON_CODE',
                providerOwner: 'promotion',
                providerCode: delivery.code,
                status: 'DELIVERED',
                revision: 0,
                idempotencyKey: [delivery.idempotencyKey || request.idempotencyKey, 'delivery'].join(':'),
                correlationId: request.correlationId,
                deliveredAt: delivery.deliveredAt || new Date(),
                revealCount: 0,
                evidence: { rawTokenStored: false, revealRequiresOwner: true }
            };
            records.push(await this.save(SERVICE.DefaultDigitalDeliveryService, request, model));
        }
        return records;
    },
    /** Reveals a delivered entitlement through a secure provider/vault service only after owner checks. @param {Object} request Request. @returns {Promise<Object>} Reveal result. */
    reveal: async function (request) {
        const payload = request.payload || {};
        const entitlements = await this.listEntitlements(request, { code: payload.entitlementCode, ownerId: request.ownerId, status: 'ACTIVE' });
        const entitlement = entitlements[0];
        if (!entitlement) throw new Error('Digital entitlement was not found');
        if (entitlement.ownerId !== request.ownerId) throw new Error('Digital entitlement belongs to another customer');
        if (entitlement.providerOwner !== 'promotion') throw new Error('Unsupported digital entitlement provider');
        if (!SERVICE.DefaultCouponSecureRevealService || typeof SERVICE.DefaultCouponSecureRevealService.reveal !== 'function') {
            return { entitlementCode: entitlement.code, providerCode: entitlement.providerCode, status: 'REVEAL_DEFERRED', tokenAvailable: false, reasonCode: 'COUPON_REVEAL_PROVIDER_REQUIRED' };
        }
        return SERVICE.DefaultCouponSecureRevealService.reveal({
            tenant: request.tenant,
            enterpriseCode: request.enterpriseCode,
            ownerId: request.ownerId,
            couponCode: entitlement.providerCode,
            correlationId: request.correlationId,
            authData: request.authData
        });
    },
    /** Claims a delivered coupon entitlement for a target discount application. @param {Object} request Claim request. @returns {Promise<Object>} Updated entitlement and provider coupon. */
    claim: async function (request) {
        const payload = request.payload || {};
        const entitlement = (await this.listEntitlements(request, { code: payload.entitlementCode, ownerId: request.ownerId, status: 'ACTIVE' }))[0];
        if (!entitlement) throw new Error('Digital entitlement was not found');
        if (entitlement.claimStatus === 'REDEEMED') throw new Error('Digital entitlement is already redeemed');
        if (entitlement.providerOwner !== 'promotion' || !SERVICE.DefaultPromotionOperationService || typeof SERVICE.DefaultPromotionOperationService.claimPurchasedCouponCode !== 'function') throw new Error('Coupon claim provider is required');
        const coupon = await SERVICE.DefaultPromotionOperationService.claimPurchasedCouponCode({
            tenant: request.tenant,
            enterpriseCode: request.enterpriseCode,
            ownerId: request.ownerId,
            authData: request.authData,
            correlationId: request.correlationId,
            idempotencyKey: request.idempotencyKey,
            payload: { couponCode: entitlement.providerCode, targetCode: payload.targetCode, targetType: payload.targetType || 'CART' }
        });
        const updated = await this.update(SERVICE.DefaultDigitalEntitlementService, request, entitlement, { claimStatus: 'CLAIMED', evidence: Object.assign({}, entitlement.evidence, { claimTargetCode: payload.targetCode, claimTargetType: payload.targetType || 'CART' }) });
        return { entitlement: updated, coupon };
    },
    /** Redeems a claimed coupon entitlement after target fulfillment completion. @param {Object} request Redeem request. @returns {Promise<Object>} Updated entitlement and provider coupon. */
    redeem: async function (request) {
        const payload = request.payload || {};
        const entitlement = (await this.listEntitlements(request, { code: payload.entitlementCode, ownerId: request.ownerId, status: 'ACTIVE' }))[0];
        if (!entitlement) throw new Error('Digital entitlement was not found');
        if (entitlement.claimStatus !== 'CLAIMED') throw new Error('Digital entitlement must be claimed before redemption');
        if (payload.fulfillmentStatus && payload.fulfillmentStatus !== 'COMPLETED') throw new Error('Target fulfillment must complete before coupon redemption');
        if (entitlement.providerOwner !== 'promotion' || !SERVICE.DefaultPromotionOperationService || typeof SERVICE.DefaultPromotionOperationService.redeemClaimedCouponCode !== 'function') throw new Error('Coupon redeem provider is required');
        const coupon = await SERVICE.DefaultPromotionOperationService.redeemClaimedCouponCode({
            tenant: request.tenant,
            enterpriseCode: request.enterpriseCode,
            ownerId: request.ownerId,
            authData: request.authData,
            correlationId: request.correlationId,
            idempotencyKey: request.idempotencyKey,
            payload: { couponCode: entitlement.providerCode, targetCode: payload.targetCode, targetType: payload.targetType || 'ORDER' }
        });
        const updated = await this.update(SERVICE.DefaultDigitalEntitlementService, request, entitlement, { claimStatus: 'REDEEMED', status: 'REDEEMED', evidence: Object.assign({}, entitlement.evidence, { redeemedTargetCode: payload.targetCode, redeemedTargetType: payload.targetType || 'ORDER' }) });
        return { entitlement: updated, coupon };
    },
    /** Calculates digital revocation policy for cancellation, return, or refund. @param {Object} entitlement Entitlement. @param {string} requestType Reversal type. @returns {Object} Policy decision. */
    revocationPolicy: function (entitlement, requestType) {
        const claimStatus = entitlement && entitlement.claimStatus || 'UNCLAIMED';
        if (claimStatus === 'REDEEMED') return { policyDecision: 'MANUAL_REVIEW', refundable: false, reasonCode: 'DIGITAL_COUPON_ALREADY_REDEEMED' };
        if (claimStatus === 'CLAIMED') return { policyDecision: 'MANUAL_REVIEW', refundable: false, reasonCode: 'DIGITAL_COUPON_CLAIMED' };
        if (requestType === 'RETURN') return { policyDecision: 'BLOCKED', refundable: false, reasonCode: 'DIGITAL_PRODUCTS_DO_NOT_USE_PHYSICAL_RETURN' };
        return { policyDecision: 'REVOKE_AND_REFUND', refundable: true, reasonCode: 'DIGITAL_COUPON_UNCLAIMED' };
    },
    /** Records revocation/reversal evidence for matching order entitlements. @param {Object} request Lifecycle request. @returns {Promise<Array>} Reversal records. */
    revokeForOrderLifecycle: async function (request) {
        const entitlements = await this.listEntitlements(request, { orderCode: request.orderCode || request.payload && request.payload.orderCode, ownerId: request.ownerId });
        const records = [];
        for (const entitlement of entitlements) {
            const policy = this.revocationPolicy(entitlement, request.payload && request.payload.requestType);
            const model = {
                code: ['digitalReversal', entitlement.code, request.idempotencyKey || request.requestId || Date.now()].join(':'),
                tenant: request.tenant,
                enterpriseCode: request.enterpriseCode || entitlement.enterpriseCode,
                ownerId: entitlement.ownerId,
                entitlementCode: entitlement.code,
                orderCode: entitlement.orderCode,
                requestType: request.payload && request.payload.requestType,
                policyDecision: policy.policyDecision,
                reasonCode: policy.reasonCode,
                status: policy.policyDecision === 'REVOKE_AND_REFUND' ? 'APPROVED' : policy.policyDecision,
                revision: 0,
                idempotencyKey: request.idempotencyKey,
                correlationId: request.correlationId || request.requestId,
                decidedAt: new Date(),
                evidence: { refundable: policy.refundable, claimStatus: entitlement.claimStatus }
            };
            records.push(await this.save(SERVICE.DefaultDigitalReversalService, request, model));
        }
        return records;
    }
};

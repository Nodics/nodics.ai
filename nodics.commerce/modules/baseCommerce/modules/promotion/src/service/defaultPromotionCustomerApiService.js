/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');

/** @module promotion/src/service/defaultPromotionCustomerApiService @description Provides bounded customer promotion eligibility, preview, redemption, and reversal evidence. @layer service @owner promotion */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
    hashToken: function (tenant, couponCode) {
        return crypto.createHash('sha256').update([tenant, String(couponCode || '').trim().toUpperCase()].join('|')).digest('hex');
    },
    exact: function () {
        return SERVICE.DefaultExactAmountService || { normalize: value => Number(value || 0).toFixed(2) };
    },
    promotions: async function (request) {
        const response = await SERVICE.DefaultPromotionService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, status: 'ACTIVE' }, pageSize: 100 });
        const result = this.unwrap(response);
        return Array.isArray(result) ? result : result ? [result] : [];
    },
    context: function (request) {
        const payload = request.payload || {};
        return {
            customerId: request.ownerId,
            customerGroup: payload.customerGroup,
            subtotal: payload.subtotal || payload.cartSubtotal || '0.00',
            productCodes: payload.productCodes || [],
            currency: payload.currency,
            couponCode: payload.couponCode,
            cartCode: payload.cartCode
        };
    },
    getOne: async function (service, request) {
        if (!service || !service.get) return undefined;
        const result = this.unwrap(await service.get(request));
        return Array.isArray(result) ? result[0] : result;
    },
    updateOrSave: async function (service, request) {
        if (!service) return undefined;
        if (service.update && request.query) return this.unwrap(await service.update(request));
        if (service.save) return this.unwrap(await service.save(request));
        return undefined;
    },
    idempotencyKey: function (request, promotion, targetCode) {
        return request.idempotencyKey || request.payload && request.payload.idempotencyKey || [request.tenant, request.ownerId, promotion.code, targetCode].join(':');
    },
    redemptionCode: function (request, promotion, targetCode) {
        return ['promotionRedemption', crypto.createHash('sha1').update(this.idempotencyKey(request, promotion, targetCode)).digest('hex')].join(':');
    },
    loadCoupon: async function (request, promotion) {
        const couponCode = request.payload && request.payload.couponCode;
        if (!couponCode) return undefined;
        const coupon = await this.getOne(SERVICE.DefaultCouponService, {
            tenant: request.tenant,
            authData: request.authData,
            query: { tenant: request.tenant, promotionCode: promotion.code, tokenHash: this.hashToken(request.tenant, couponCode) },
            pageSize: 1
        });
        if (!coupon) throw new Error('Coupon is invalid for selected promotion');
        if (coupon.status !== 'ACTIVE') throw new Error('Coupon is not active');
        if (Number(coupon.usedCount || 0) >= Number(coupon.maxUses || 1)) throw new Error('Coupon usage limit exceeded');
        return coupon;
    },
    consumeCoupon: async function (request, coupon) {
        if (!coupon) return undefined;
        const usedCount = Number(coupon.usedCount || 0) + 1;
        const model = Object.assign({}, coupon, {
            usedCount,
            status: usedCount >= Number(coupon.maxUses || 1) ? 'REDEEMED' : 'ACTIVE',
            revision: Number(coupon.revision || 0) + 1
        });
        return this.updateOrSave(SERVICE.DefaultCouponService, {
            tenant: request.tenant,
            authData: request.authData,
            query: { tenant: request.tenant, code: coupon.code },
            model
        });
    },
    consumeBudget: async function (request, promotion, amount) {
        if (!promotion.budget) return promotion;
        const exact = this.exact();
        const spent = exact.normalize(String(promotion.budget.spent || '0.00'));
        const limit = exact.normalize(String(promotion.budget.limit || '0.00'));
        const nextSpent = exact.add ? exact.add(spent, amount) : String(Number(spent) + Number(amount));
        if (exact.compare ? exact.compare(nextSpent, limit) > 0 : Number(nextSpent) > Number(limit)) throw new Error('Promotion budget exhausted');
        const model = Object.assign({}, promotion, { budget: Object.assign({}, promotion.budget, { spent: nextSpent }), revision: Number(promotion.revision || 0) + 1 });
        return this.updateOrSave(SERVICE.DefaultPromotionService, {
            tenant: request.tenant,
            authData: request.authData,
            query: { tenant: request.tenant, code: promotion.code },
            model
        }) || model;
    },
    persistDecision: async function (request, decision) {
        const model = Object.assign({ code: ['discountDecision', decision.promotionCode, decision.targetCode].join(':'), decidedAt: request.now || new Date().toISOString() }, decision);
        if (SERVICE.DefaultDiscountDecisionService && SERVICE.DefaultDiscountDecisionService.save) {
            await SERVICE.DefaultDiscountDecisionService.save({ tenant: request.tenant, authData: request.authData, model });
        }
        return model;
    },
    persistRedemption: async function (request, promotion, coupon, decision) {
        const targetCode = decision.targetCode;
        const model = {
            code: this.redemptionCode(request, promotion, targetCode),
            tenant: request.tenant,
            promotionCode: promotion.code,
            couponCode: coupon && coupon.code,
            ownerId: request.ownerId,
            targetType: decision.targetType,
            targetCode,
            discountAmount: decision.discountAmount,
            currency: decision.currency,
            status: 'APPLIED',
            decisionCode: decision.code,
            idempotencyKey: this.idempotencyKey(request, promotion, targetCode),
            correlationId: request.correlationId || request.requestId || decision.correlationId,
            revision: 0,
            appliedAt: request.now || new Date().toISOString()
        };
        if (SERVICE.DefaultPromotionRedemptionService && SERVICE.DefaultPromotionRedemptionService.save) {
            return this.unwrap(await SERVICE.DefaultPromotionRedemptionService.save({ tenant: request.tenant, authData: request.authData, model }));
        }
        return model;
    },
    preview: async function (request) {
        const promotions = await this.promotions(request);
        const simulation = SERVICE.DefaultPromotionSimulationService.simulate({ tenant: request.tenant, context: this.context(request), now: request.now }, promotions);
        return Object.assign({}, simulation, {
            ownerId: request.ownerId,
            cartCode: request.payload && request.payload.cartCode,
            redemptionStateMutation: 'NONE'
        });
    },
    apply: async function (request) {
        const preview = await this.preview(request);
        const selected = preview.selected[0];
        if (!selected) {
            return Object.assign({}, preview, { applied: false, reasonCode: 'NO_ELIGIBLE_PROMOTION', decisions: [] });
        }
        const action = selected.actions || {};
        const coupon = await this.loadCoupon(request, selected);
        const decision = SERVICE.DefaultPromotionDecisionService.decide({
            tenant: request.tenant,
            promotionCode: selected.code,
            targetType: request.payload && request.payload.targetType || (request.payload && request.payload.cartCode ? 'CART' : 'CUSTOMER_CONTEXT'),
            targetCode: request.payload && request.payload.cartCode || request.ownerId,
            discountAmount: action.discountAmount || '0.00',
            currency: request.payload && request.payload.currency,
            reasonCode: action.reasonCode || 'APPLIED',
            correlationId: request.correlationId || request.requestId
        }, selected, this.exact());
        const persistedDecision = await this.persistDecision(request, decision);
        await this.consumeBudget(request, selected, persistedDecision.discountAmount);
        await this.consumeCoupon(request, coupon);
        const redemption = await this.persistRedemption(request, selected, coupon, persistedDecision);
        return Object.assign({}, preview, {
            applied: true,
            decisions: [persistedDecision],
            redemption,
            redemptionStateMutation: 'COMMITTED'
        });
    },
    reverse: async function (request) {
        const code = request.redemptionCode || request.payload && request.payload.redemptionCode;
        if (!code) throw new Error('Promotion redemption code is required for reversal');
        const redemption = await this.getOne(SERVICE.DefaultPromotionRedemptionService, { tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, code }, pageSize: 1 });
        if (!redemption) throw new Error('Promotion redemption was not found');
        if (redemption.status === 'REVERSED') return { reversed: true, redemption, idempotent: true };
        const model = Object.assign({}, redemption, {
            status: 'REVERSED',
            reversalReasonCode: request.payload && request.payload.reasonCode || 'REVERSAL_REQUESTED',
            reversedAt: request.now || new Date().toISOString(),
            revision: Number(redemption.revision || 0) + 1
        });
        const updated = await this.updateOrSave(SERVICE.DefaultPromotionRedemptionService, {
            tenant: request.tenant,
            authData: request.authData,
            query: { tenant: request.tenant, code },
            model
        });
        return { reversed: true, redemption: updated || model, idempotent: false };
    }
};

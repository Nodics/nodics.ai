/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module promotion/src/service/defaultPromotionCustomerApiService @description Provides bounded customer promotion eligibility, preview, and non-mutating redemption evidence. @layer service @owner promotion */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
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
        const decision = SERVICE.DefaultPromotionDecisionService.decide({
            tenant: request.tenant,
            promotionCode: selected.code,
            targetType: request.payload && request.payload.cartCode ? 'CART' : 'CUSTOMER_CONTEXT',
            targetCode: request.payload && request.payload.cartCode || request.ownerId,
            discountAmount: action.discountAmount || '0.00',
            currency: request.payload && request.payload.currency,
            reasonCode: action.reasonCode || 'APPLIED',
            correlationId: request.correlationId || request.requestId
        }, selected, this.exact());
        return Object.assign({}, preview, {
            applied: true,
            decisions: [decision],
            redemptionStateMutation: 'DEFERRED_UNTIL_COUPON_BUDGET_COMMAND'
        });
    }
};

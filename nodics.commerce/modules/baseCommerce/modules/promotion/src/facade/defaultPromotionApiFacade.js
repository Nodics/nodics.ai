/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module promotion/src/facade/defaultPromotionApiFacade @description Normalizes authenticated customer promotion API context. @layer facade @owner promotion */
module.exports = {
    applyContext: function (request) {
        const authData = request.authData || {};
        const tenant = authData.tenant || request.tenant;
        const ownerId = authData.principalId || authData.userId || authData.code || request.ownerId;
        if (!tenant || !ownerId) throw new Error('Authenticated tenant and customer are required for promotion APIs');
        return Object.assign({}, request, { tenant, ownerId, authData });
    },
    preview: function (request) { return SERVICE.DefaultPromotionCustomerApiService.preview(this.applyContext(request)); },
    apply: function (request) { return SERVICE.DefaultPromotionCustomerApiService.apply(this.applyContext(request)); },
    reverse: function (request) {
        const authData = request.authData || {};
        const tenant = authData.tenant || request.tenant;
        if (!tenant) throw new Error('Authenticated tenant is required for promotion reversal');
        return SERVICE.DefaultPromotionCustomerApiService.reverse(Object.assign({}, request, { tenant, authData }));
    },
    applyOperatorContext: function (request) {
        const authData = request.authData || {};
        const tenant = authData.tenant || request.tenant;
        const actorId = authData.principalId || authData.userId || authData.loginId || authData.code || request.actorId;
        if (!tenant || !actorId) throw new Error('Authenticated tenant and operator are required for promotion builder APIs');
        return Object.assign({}, request, { tenant, actorId, authData });
    },
    saveDraft: function (request) { return SERVICE.DefaultPromotionCustomerApiService.saveDraft(this.applyOperatorContext(request)); },
    submitPromotion: function (request) { return SERVICE.DefaultPromotionCustomerApiService.transitionPromotion(this.applyOperatorContext(Object.assign({}, request, { actionCode: 'SUBMIT', targetStatus: 'SUBMITTED' }))); },
    approvePromotion: function (request) { return SERVICE.DefaultPromotionCustomerApiService.transitionPromotion(this.applyOperatorContext(Object.assign({}, request, { actionCode: 'APPROVE', targetStatus: 'APPROVED' }))); },
    schedulePromotion: function (request) { return SERVICE.DefaultPromotionCustomerApiService.transitionPromotion(this.applyOperatorContext(Object.assign({}, request, { actionCode: 'SCHEDULE', targetStatus: 'SCHEDULED' }))); },
    suspendPromotion: function (request) { return SERVICE.DefaultPromotionCustomerApiService.transitionPromotion(this.applyOperatorContext(Object.assign({}, request, { actionCode: 'SUSPEND', targetStatus: 'SUSPENDED' }))); },
    archivePromotion: function (request) { return SERVICE.DefaultPromotionCustomerApiService.transitionPromotion(this.applyOperatorContext(Object.assign({}, request, { actionCode: 'ARCHIVE', targetStatus: 'ARCHIVED' }))); },
    createCouponBatch: function (request) {
        const input = this.applyOperatorContext(request);
        return SERVICE.DefaultPromotionCustomerApiService.createCouponBatch(Object.assign({}, input, { payload: Object.assign({}, input.payload, { promotionCode: input.promotionCode || input.payload && input.payload.promotionCode }) }));
    },
    reserveCouponBatch: function (request) {
        const input = this.applyOperatorContext(request);
        return SERVICE.DefaultPromotionCustomerApiService.setCouponBatchReservation(Object.assign({}, input, { payload: Object.assign({}, input.payload, { batchCode: input.batchCode || input.payload && input.payload.batchCode }) }), 'RESERVED');
    },
    releaseCouponBatch: function (request) {
        const input = this.applyOperatorContext(request);
        return SERVICE.DefaultPromotionCustomerApiService.setCouponBatchReservation(Object.assign({}, input, { payload: Object.assign({}, input.payload, { batchCode: input.batchCode || input.payload && input.payload.batchCode }) }), 'ACTIVE');
    },
    budgetLedger: function (request) { return SERVICE.DefaultPromotionCustomerApiService.budgetLedger(this.applyOperatorContext(request)); },
    analytics: function (request) { return SERVICE.DefaultPromotionCustomerApiService.analytics(this.applyOperatorContext(request)); }
};

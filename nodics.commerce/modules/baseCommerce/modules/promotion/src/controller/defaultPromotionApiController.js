/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module promotion/src/controller/defaultPromotionApiController @description HTTP adapter for customer promotion eligibility APIs. @layer controller @owner promotion */
module.exports = {
    applyHttp: function (request) {
        const httpRequest = request.httpRequest || {};
        const params = httpRequest.params || {};
        return Object.assign({}, request, { payload: httpRequest.body || {}, query: httpRequest.query || {}, redemptionCode: params.redemptionCode, promotionCode: params.promotionCode, batchCode: params.batchCode });
    },
    invoke: async function (request, method) {
        const data = await FACADE.DefaultPromotionApiFacade[method](this.applyHttp(request || {}));
        return { status: 200, data: data };
    },
    preview: function (request) { return this.invoke(request, 'preview'); },
    apply: function (request) { return this.invoke(request, 'apply'); },
    reverse: function (request) { return this.invoke(request, 'reverse'); },
    saveDraft: function (request) { return this.invoke(request, 'saveDraft'); },
    submitPromotion: function (request) { return this.invoke(request, 'submitPromotion'); },
    approvePromotion: function (request) { return this.invoke(request, 'approvePromotion'); },
    schedulePromotion: function (request) { return this.invoke(request, 'schedulePromotion'); },
    suspendPromotion: function (request) { return this.invoke(request, 'suspendPromotion'); },
    archivePromotion: function (request) { return this.invoke(request, 'archivePromotion'); },
    createCouponBatch: function (request) { return this.invoke(request, 'createCouponBatch'); },
    reserveCouponBatch: function (request) { return this.invoke(request, 'reserveCouponBatch'); },
    releaseCouponBatch: function (request) { return this.invoke(request, 'releaseCouponBatch'); },
    budgetLedger: function (request) { return this.invoke(request, 'budgetLedger'); },
    analytics: function (request) { return this.invoke(request, 'analytics'); }
};

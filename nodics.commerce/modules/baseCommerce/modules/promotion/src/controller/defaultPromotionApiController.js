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
    /**
     * Executes `applyHttp` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    applyHttp: function (request) {
        const httpRequest = request.httpRequest || {};
        const params = httpRequest.params || {};
        return Object.assign({}, request, { payload: httpRequest.body || {}, query: httpRequest.query || {}, redemptionCode: params.redemptionCode, promotionCode: params.promotionCode, batchCode: params.batchCode });
    },
    /**
     * Executes `invoke` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} method Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    invoke: async function (request, method) {
        const data = await FACADE.DefaultPromotionApiFacade[method](this.applyHttp(request || {}));
        return { status: 200, data: data };
    },
    /**
     * Executes `preview` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    preview: function (request) { return this.invoke(request, 'preview'); },
    /**
     * Executes `apply` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    apply: function (request) { return this.invoke(request, 'apply'); },
    /**
     * Executes `reverse` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    reverse: function (request) { return this.invoke(request, 'reverse'); },
    /**
     * Executes `saveDraft` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    saveDraft: function (request) { return this.invoke(request, 'saveDraft'); },
    /**
     * Executes `submitPromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    submitPromotion: function (request) { return this.invoke(request, 'submitPromotion'); },
    /**
     * Executes `approvePromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    approvePromotion: function (request) { return this.invoke(request, 'approvePromotion'); },
    /**
     * Executes `schedulePromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    schedulePromotion: function (request) { return this.invoke(request, 'schedulePromotion'); },
    /**
     * Executes `suspendPromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    suspendPromotion: function (request) { return this.invoke(request, 'suspendPromotion'); },
    /**
     * Executes `archivePromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    archivePromotion: function (request) { return this.invoke(request, 'archivePromotion'); },
    /**
     * Executes `createCouponBatch` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    createCouponBatch: function (request) { return this.invoke(request, 'createCouponBatch'); },
    /**
     * Executes `reserveCouponBatch` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    reserveCouponBatch: function (request) { return this.invoke(request, 'reserveCouponBatch'); },
    /**
     * Executes `releaseCouponBatch` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    releaseCouponBatch: function (request) { return this.invoke(request, 'releaseCouponBatch'); },
    /**
     * Executes `budgetLedger` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    budgetLedger: function (request) { return this.invoke(request, 'budgetLedger'); },
    /**
     * Executes `analytics` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    analytics: function (request) { return this.invoke(request, 'analytics'); }
};

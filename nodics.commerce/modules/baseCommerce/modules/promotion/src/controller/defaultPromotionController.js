/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module promotion/src/controller/defaultPromotionController @description HTTP adapter for customer promotion eligibility APIs. @layer controller @owner promotion */
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
    invoke: function (request, method, callback) {
        const operation = Promise.resolve().then(async () => {
            const data = await FACADE.DefaultPromotionFacade[method](this.applyHttp(request || {}));
            return { status: 200, data: data };
        });
        if (typeof callback === 'function') {
            operation.then(success => callback(null, success)).catch(error => callback(error));
            return undefined;
        }
        return operation;
    },
    /**
     * Executes `preview` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    preview: function (request, callback) { return this.invoke(request, 'preview', callback); },
    /**
     * Executes `apply` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    apply: function (request, callback) { return this.invoke(request, 'apply', callback); },
    /**
     * Executes `reverse` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    reverse: function (request, callback) { return this.invoke(request, 'reverse', callback); },
    /**
     * Executes `restoreOperational` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    restoreOperational: function (request, callback) { return this.invoke(request, 'restoreOperational', callback); },
    /**
     * Executes `saveDraft` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    saveDraft: function (request, callback) { return this.invoke(request, 'saveDraft', callback); },
    /**
     * Executes `submitPromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    submitPromotion: function (request, callback) { return this.invoke(request, 'submitPromotion', callback); },
    /**
     * Executes `approvePromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    approvePromotion: function (request, callback) { return this.invoke(request, 'approvePromotion', callback); },
    /**
     * Executes `schedulePromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    schedulePromotion: function (request, callback) { return this.invoke(request, 'schedulePromotion', callback); },
    /**
     * Executes `suspendPromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    suspendPromotion: function (request, callback) { return this.invoke(request, 'suspendPromotion', callback); },
    /**
     * Executes `archivePromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    archivePromotion: function (request, callback) { return this.invoke(request, 'archivePromotion', callback); },
    /**
     * Executes `createCouponBatch` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    createCouponBatch: function (request, callback) { return this.invoke(request, 'createCouponBatch', callback); },
    /**
     * Executes `reserveCouponBatch` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    reserveCouponBatch: function (request, callback) { return this.invoke(request, 'reserveCouponBatch', callback); },
    /**
     * Executes `releaseCouponBatch` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    releaseCouponBatch: function (request, callback) { return this.invoke(request, 'releaseCouponBatch', callback); },
    /**
     * Executes `budgetLedger` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    budgetLedger: function (request, callback) { return this.invoke(request, 'budgetLedger', callback); },
    /**
     * Executes `analytics` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    analytics: function (request, callback) { return this.invoke(request, 'analytics', callback); }
};

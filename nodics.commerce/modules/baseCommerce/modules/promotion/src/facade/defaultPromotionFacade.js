/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module promotion/src/facade/defaultPromotionFacade @description Normalizes authenticated customer promotion API context. @layer facade @owner promotion */
module.exports = {
    /**
     * Executes `applyContext` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    applyContext: function (request) {
        const authData = request.authData || {};
        const tenant = authData.tenant || request.tenant;
        const ownerId = authData.principalId || authData.userId || authData.code || authData.loginId || request.ownerId;
        if (!tenant || !ownerId) throw new Error('Authenticated tenant and customer are required for promotion APIs');
        return Object.assign({}, request, { tenant, ownerId, authData });
    },
    /**
     * Executes `preview` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    preview: function (request) { return SERVICE.DefaultPromotionOperationService.preview(this.applyContext(request)); },
    /**
     * Executes `apply` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    apply: function (request) { return SERVICE.DefaultPromotionOperationService.apply(this.applyContext(request)); },
    /**
     * Executes `reverse` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    reverse: function (request) {
        const authData = request.authData || {};
        const tenant = authData.tenant || request.tenant;
        if (!tenant) throw new Error('Authenticated tenant is required for promotion reversal');
        return SERVICE.DefaultPromotionOperationService.reverse(Object.assign({}, request, { tenant, authData }));
    },
    /**
     * Executes `applyOperatorContext` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    applyOperatorContext: function (request) {
        const authData = request.authData || {};
        const tenant = authData.tenant || request.tenant;
        const actorId = authData.principalId || authData.userId || authData.loginId || authData.code || request.actorId;
        if (!tenant || !actorId) throw new Error('Authenticated tenant and operator are required for promotion builder APIs');
        return Object.assign({}, request, { tenant, actorId, authData });
    },
    /**
     * Executes `saveDraft` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    saveDraft: function (request) { return SERVICE.DefaultPromotionOperationService.saveDraft(this.applyOperatorContext(request)); },
    /**
     * Executes `submitPromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    submitPromotion: function (request) { return SERVICE.DefaultPromotionOperationService.transitionPromotion(this.applyOperatorContext(Object.assign({}, request, { actionCode: 'SUBMIT', targetStatus: 'SUBMITTED' }))); },
    /**
     * Executes `approvePromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    approvePromotion: function (request) { return SERVICE.DefaultPromotionOperationService.transitionPromotion(this.applyOperatorContext(Object.assign({}, request, { actionCode: 'APPROVE', targetStatus: 'APPROVED' }))); },
    /**
     * Executes `schedulePromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    schedulePromotion: function (request) { return SERVICE.DefaultPromotionOperationService.transitionPromotion(this.applyOperatorContext(Object.assign({}, request, { actionCode: 'SCHEDULE', targetStatus: 'SCHEDULED' }))); },
    /**
     * Executes `suspendPromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    suspendPromotion: function (request) { return SERVICE.DefaultPromotionOperationService.transitionPromotion(this.applyOperatorContext(Object.assign({}, request, { actionCode: 'SUSPEND', targetStatus: 'SUSPENDED' }))); },
    /**
     * Executes `archivePromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    archivePromotion: function (request) { return SERVICE.DefaultPromotionOperationService.transitionPromotion(this.applyOperatorContext(Object.assign({}, request, { actionCode: 'ARCHIVE', targetStatus: 'ARCHIVED' }))); },
    /**
     * Executes `createCouponBatch` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    createCouponBatch: function (request) {
        const input = this.applyOperatorContext(request);
        return SERVICE.DefaultPromotionOperationService.createCouponBatch(Object.assign({}, input, { payload: Object.assign({}, input.payload, { promotionCode: input.promotionCode || input.payload && input.payload.promotionCode }) }));
    },
    /**
     * Executes `reserveCouponBatch` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    reserveCouponBatch: function (request) {
        const input = this.applyOperatorContext(request);
        return SERVICE.DefaultPromotionOperationService.setCouponBatchReservation(Object.assign({}, input, { payload: Object.assign({}, input.payload, { batchCode: input.batchCode || input.payload && input.payload.batchCode }) }), 'RESERVED');
    },
    /**
     * Executes `releaseCouponBatch` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    releaseCouponBatch: function (request) {
        const input = this.applyOperatorContext(request);
        return SERVICE.DefaultPromotionOperationService.setCouponBatchReservation(Object.assign({}, input, { payload: Object.assign({}, input.payload, { batchCode: input.batchCode || input.payload && input.payload.batchCode }) }), 'ACTIVE');
    },
    /**
     * Executes `budgetLedger` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    budgetLedger: function (request) { return SERVICE.DefaultPromotionOperationService.budgetLedger(this.applyOperatorContext(request)); },
    /**
     * Executes `analytics` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    analytics: function (request) { return SERVICE.DefaultPromotionOperationService.analytics(this.applyOperatorContext(request)); }
};

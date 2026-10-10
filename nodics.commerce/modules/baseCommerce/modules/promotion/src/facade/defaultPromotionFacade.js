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
    /** Captures policy through the fixed owner using authenticated operator scope only. */
    createGoverned: async function (request) {
        const auth = request.authData || {};
        const enterpriseCode = auth.entCode || auth.enterpriseCode;
        const actorId = auth.principalId || auth.loginId || auth.code;
        if (auth.tokenType !== 'access' || !auth.tenant || !enterpriseCode || !actorId ||
            request.tenant && request.tenant !== auth.tenant ||
            auth.entCode && auth.enterpriseCode && auth.entCode !== auth.enterpriseCode) {
            throw new Error('Authenticated publication operator scope is required');
        }
        return SERVICE.DefaultPromotionPublicationService.createGoverned({
            ...request, tenant: auth.tenant, enterpriseCode, entCode: enterpriseCode, actorId
        }, request.httpRequest && request.httpRequest.body || request.payload || {});
    },
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
        const context = Object.assign({}, request, { tenant, ownerId, authData });
        if ([request.storeCode, request.payload && request.payload.storeCode,
            request.query && request.query.storeCode].some(value => value !== undefined)) {
            context.storeCode = SERVICE.DefaultStoreContextService.resolveStoreCode(request);
        }
        return context;
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
     * Executes `restoreOperational` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    restoreOperational: function (request) {
        const input = this.applyOperatorContext(request);
        return SERVICE.DefaultPromotionPublicationService.restoreOperational(input, input.payload || {});
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
    /** Derives ledger scope only from the original authenticated claims and checks every presented namespace alias. Legacy authenticated requests without any enterprise claim/selector stay explicitly unscoped. No header or body grants enterprise authority. @param {Object} request Original secured ledger request. @returns {Object} Detached operator context with exact signed tenant and optional enterprise; original auth remains unchanged. @throws {NodicsError} Unconfirmed ledger scope before persistence. @override Later layers may narrow admission while preserving signed-scope agreement. */
    applyBudgetLedgerContext: function (request) {
        const auth = request.authData || {},
            tenantClaims = [auth.tenant, auth.tenantCode].filter(value => value !== undefined),
            enterpriseClaims = [auth.entCode, auth.enterpriseCode].filter(value => value !== undefined),
            tenant = tenantClaims[0], enterpriseCode = enterpriseClaims[0],
            actorId = auth.principalId || auth.userId || auth.loginId || auth.code,
            payload = request.payload || {}, query = request.query || {},
            tenants = [...tenantClaims, request.tenant, request.tenantCode, request.auth?.tenant, request.auth?.tenantCode, payload.tenant, payload.tenantCode,
                query.tenant, query.tenantCode],
            enterprises = [...enterpriseClaims, request.enterpriseCode, request.entCode,
                request.auth?.entCode, request.auth?.enterpriseCode, payload.enterpriseCode, payload.entCode,
                query.enterpriseCode, query.entCode];
        for (const [key, value] of Object.entries(request.httpRequest?.headers || {})) {
            if (['x-enterprise-code', 'entcode', 'enterprisecode'].includes(key.toLowerCase())) enterprises.push(value);
            if (['x-tenant-code', 'tenant', 'tenantcode'].includes(key.toLowerCase())) tenants.push(value);
        }
        if (
            typeof tenant !== 'string' || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(tenant) ||
            typeof actorId !== 'string' || !actorId ||
            (auth.tokenType !== undefined && auth.tokenType !== 'access') ||
            (enterpriseCode !== undefined && (typeof enterpriseCode !== 'string' ||
                !/^[A-Za-z0-9_.:@-]{1,128}$/.test(enterpriseCode))) ||
            tenants.some(value => value !== undefined && value !== tenant) ||
            enterprises.some(value => value !== undefined && (enterpriseCode === undefined || value !== enterpriseCode))
        ) throw new CLASSES.NodicsError('ERR_PROMOTION_BUDGET_LEDGER_UNCONFIRMED');
        return { ...this.applyOperatorContext(request), tenant, enterpriseCode, actorId };
    },
    /**
     * Executes `budgetLedger` using its independently validated original signed issuer scope.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    budgetLedger: function (request) { return SERVICE.DefaultPromotionOperationService.budgetLedger(this.applyBudgetLedgerContext(request)); },
    /**
     * Executes `analytics` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    analytics: function (request) { return SERVICE.DefaultPromotionOperationService.analytics(this.applyOperatorContext(request)); }
};

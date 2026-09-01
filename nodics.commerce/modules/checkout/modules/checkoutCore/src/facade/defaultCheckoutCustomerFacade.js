/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module checkoutCore/src/facade/defaultCheckoutCustomerFacade @description Enforces customer tenant and ownership context for placement. @layer facade @owner checkoutCore */
module.exports = {
    /**
     * Resolves enterprise-owned business context and derived runtime tenant.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Enterprise and tenant context.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    enterpriseContext: function (request) {
        const auth = request.authData || {}, payload = request.payload || {};
        const enterpriseCode = auth.enterpriseCode || auth.entCode || request.enterpriseCode || request.entCode || payload.enterpriseCode || payload.entCode;
        const tenants = (typeof CONFIG !== 'undefined' && CONFIG.get && (CONFIG.get('commerce') || {}).enterpriseTenants) || {};
        return { enterpriseCode, tenant: auth.tenant || request.tenant || tenants[enterpriseCode] };
    },
    /**
     * Executes `applyContext` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    applyContext: function (request) {
        const auth = request.authData || {};
        if (!auth.userGroups && Array.isArray(auth.groups)) auth.userGroups = auth.groups;
        if (!auth.userGroups && (auth.principalId || auth.code || auth.loginId || request.ownerId)) auth.userGroups = ['customerUserGroup'];
        if (!auth.groups && Array.isArray(auth.userGroups)) auth.groups = auth.userGroups;
        auth.principalType = auth.principalType || 'customer';
        request.authData = auth;
        const context = this.enterpriseContext(request);
        request.enterpriseCode = context.enterpriseCode;
        request.tenant = context.tenant;
        request.ownerId = auth.principalId || auth.code || auth.loginId || request.ownerId;
        request.correlationId = request.correlationId || request.requestId;
        if (!request.tenant || !request.ownerId) throw new Error('Authenticated tenant and customer are required');
        return request;
    },
    /**
     * Executes `place` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    place: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCheckoutOperationService.place(this.applyContext(request))); }
};

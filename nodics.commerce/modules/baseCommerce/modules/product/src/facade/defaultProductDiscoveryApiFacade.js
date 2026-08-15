/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module product/facade/defaultProductDiscoveryApiFacade
 * @description Establishes safe tenant, Store, and locale context before Product customer discovery operations.
 * @layer facade
 * @owner product
 * @override Later modules may resolve storefront context differently while preserving Product-owned response projection.
 */
module.exports = {
    /** Initializes the facade lifecycle. @returns {Promise<boolean>} Initialization result. */
    init: function () { return Promise.resolve(true); },
    /** Completes the facade lifecycle. @returns {Promise<boolean>} Initialization result. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns the effective Product discovery policy. @returns {Object} Policy. */
    policy: function () { return ((CONFIG.get('product') || {}).discovery) || {}; },

    /** Applies trusted request context and rejects ambiguous public tenant access. @param {Object} request Nodics request. @returns {Object} Request. */
    applyContext: function (request) {
        let auth = request.authData || {}, policy = this.policy(), query = request.query || {};
        request.tenant = auth.tenant || request.tenant || (policy.allowTenantQuery === true ? query.tenant : undefined) ||
            (typeof CONFIG !== 'undefined' && CONFIG.get ? CONFIG.get('defaultTenant') : undefined) || 'default';
        request.storeCode = query.storeCode || request.storeCode || policy.defaultStoreCode;
        request.locale = query.locale || request.locale || policy.defaultLocale;
        if (!request.tenant || !request.storeCode || !request.locale) throw new Error('Tenant, Store, and locale are required for Product discovery');
        return request;
    },

    /** Lists customer-safe Product cards. @param {Object} request Nodics request. @returns {Promise<Object>} Product card response. */
    list: function (request) {
        return Promise.resolve().then(() => SERVICE.DefaultProductDiscoveryApiService.list(this.applyContext(request)));
    },

    /** Resolves one customer-safe Product detail. @param {Object} request Nodics request. @returns {Promise<Object>} Product detail response. */
    detail: function (request) {
        return Promise.resolve().then(() => SERVICE.DefaultProductDiscoveryApiService.detail(this.applyContext(request)));
    }
};

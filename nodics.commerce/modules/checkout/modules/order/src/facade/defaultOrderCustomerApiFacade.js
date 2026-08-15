/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/facade/defaultOrderCustomerApiFacade @description Enforces customer ownership context for Order read APIs. @layer facade @owner order */
module.exports = {
    /** Applies authenticated customer tenant and principal context. @param {Object} request Request. @returns {Object} Request. */
    applyContext: function (request) {
        const auth = request.authData || {};
        request.tenant = auth.tenant || request.tenant;
        request.ownerId = auth.principalId || auth.code || auth.loginId || request.ownerId;
        if (!request.tenant || !request.ownerId) throw new Error('Authenticated tenant and customer are required');
        return request;
    },
    /** Reads a customer-owned Order. @param {Object} request Request. @returns {Promise<Object>} Order summary. */
    read: function (request) { return Promise.resolve().then(() => SERVICE.DefaultOrderCustomerApiService.read(this.applyContext(request))); },
    /** Lists customer-owned Orders. @param {Object} request Request. @returns {Promise<Array>} Orders. */
    listOwn: function (request) { return Promise.resolve().then(() => SERVICE.DefaultOrderCustomerApiService.listOwn(this.applyContext(request))); }
};

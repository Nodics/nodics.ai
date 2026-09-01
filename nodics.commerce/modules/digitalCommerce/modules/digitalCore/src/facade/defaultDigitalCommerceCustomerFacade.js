/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/src/facade/defaultDigitalCommerceCustomerFacade @description Enforces customer ownership context for Digital Commerce entitlement APIs. @layer facade @owner digitalCore */
module.exports = {
    /** Applies authenticated customer tenant and principal context. @param {Object} request Request. @returns {Object} Request. */
    applyContext: function (request) {
        const auth = request.authData || {};
        request.tenant = auth.tenant || request.tenant;
        request.enterpriseCode = request.enterpriseCode || request.entCode || auth.enterpriseCode || auth.entCode;
        request.ownerId = auth.principalId || auth.code || auth.loginId || request.ownerId;
        if (!request.tenant || !request.ownerId) throw new Error('Authenticated tenant and customer are required');
        return request;
    },
    /** Lists customer-owned digital entitlements. @param {Object} request Request. @returns {Promise<Object>} Entitlement response. */
    listEntitlements: function (request) { return Promise.resolve().then(() => SERVICE.DefaultDigitalCommerceEntitlementService.listOwn(this.applyContext(request))); },
    /** Reveals a customer-owned digital entitlement. @param {Object} request Request. @returns {Promise<Object>} Reveal response. */
    revealEntitlement: function (request) { return Promise.resolve().then(() => SERVICE.DefaultDigitalCommerceEntitlementService.reveal(this.applyContext(request))); }
};

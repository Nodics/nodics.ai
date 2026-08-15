/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module commerceSearchCore/facade/defaultCommerceSearchPublicationFacade @description Applies operator tenant context for Commerce Search publication. @layer facade @owner commerceSearchCore */
module.exports = {
    /**
     * Initializes the Commerce Search publication facade.
     *
     * @returns {Promise<boolean>} Resolves when initialization completes.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Runs post-initialization for the Commerce Search publication facade.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization completes.
     */
    postInit: function () { return Promise.resolve(true); },
    /**
     * Applies operator tenant context and delegates Commerce Search publication.
     *
     * @param {Object} request Operator request.
     * @returns {Promise<Object>} Publication summary.
     */
    publish: function (request) {
        let auth = request.authData || {};
        request.tenant = auth.tenant || request.tenant;
        if (!request.tenant) throw new Error('Tenant is required for Commerce Search publication');
        return SERVICE.DefaultCommerceSearchPublicationService.publish(request, request.payload || {});
    }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module inventory/src/facade/defaultInventoryOperationFacade @description Enforces trusted operator context before Inventory-owned stock operations. @layer facade @owner inventory */
module.exports = {
    /** Adds authenticated tenant/operator context for BackOffice Inventory operations. @param {Object} request Request. @returns {Object} Contextual request. */
    applyOperatorContext: function (request) {
        const auth = request.authData || {};
        const tenant = auth.tenant || request.tenant;
        const actorId = auth.principalId || auth.userId || auth.loginId || auth.code || request.actorId;
        if (!tenant || !actorId) throw new Error('Authenticated tenant and operator are required for Inventory operations');
        return Object.assign({}, request, { tenant, actorId, authData: auth });
    },
    /** Executes a bounded stock operation against a selected balance. @param {Object} request Request. @returns {Promise<Object>} Operation result. */
    balanceAction: function (request) {
        return Promise.resolve().then(() => SERVICE.DefaultInventoryOperationService.balanceAction(this.applyOperatorContext(request)));
    }
};

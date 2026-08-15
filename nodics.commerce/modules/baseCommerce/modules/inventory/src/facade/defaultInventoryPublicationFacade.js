/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module inventory/src/facade/defaultInventoryPublicationFacade @description Enforces tenant context before Inventory publication ingestion. @layer facade @owner inventory */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    restoreOperational: function (request) {
        let auth = request.authData || {};
        request.tenant = auth.tenant || request.tenant;
        request.actorId = auth.principalId || auth.loginId || auth.serviceId || auth.code || request.actorId;
        if (!request.tenant || !request.actorId) return Promise.reject(new Error('Authenticated tenant and operator are required'));
        return Promise.resolve().then(() => SERVICE.DefaultInventoryPublicationService.restoreOperational(request, request.payload || {}));
    }
};

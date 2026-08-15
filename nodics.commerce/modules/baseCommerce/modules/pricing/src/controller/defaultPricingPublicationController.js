/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module pricing/src/controller/defaultPricingPublicationController @description Maps internal Pricing publication ingestion requests. @layer controller @owner pricing */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    restoreOperational: function (request, callback) {
        let http = request.httpRequest || {};
        request.payload = http.body || request.payload || {};
        let operation = FACADE.DefaultPricingPublicationFacade.restoreOperational(request).then(data => ({ data }));
        if (!callback) return operation;
        operation.then(success => callback(null, success)).catch(error => callback(error));
    }
};

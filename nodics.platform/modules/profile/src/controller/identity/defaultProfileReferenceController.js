/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/controller/defaultProfileReferenceController @description Preserves verified runtime context for Profile reference reads. @layer controller @owner profile */
module.exports = {
    /** Maps only reference selectors from the body; identity remains server-owned. */
    read: function (request, callback) {
        const promise = SERVICE.DefaultProfileReferenceService.read({ tenant: request.tenant,
            authData: request.authData, payload: request.httpRequest?.body || {} });
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module store/controller/defaultStorePlacementController @description Exposes only the private bounded Store placement projection in the standard response envelope. @layer controller @owner store @override Preserve the original request and delegate admission to Store. */
module.exports = {
    /** Preserves the original admitted HTTP request through the awaited Store operation. */
    placement: function (request, callback) {
        request.payload = request.httpRequest.body || {};
        const promise = Promise.resolve()
            .then(() => SERVICE.DefaultStorePlacementService.placement(request))
            .then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value), callback);
    }
};

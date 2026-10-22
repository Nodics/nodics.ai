/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module promotion/controller/defaultCouponAcquisitionRefreshController
 * @description Private no-store reporting refresh endpoint; forwards original authority unchanged.
 * @owner promotion @layer controller
 * @override Extend the owner service, preserving strict input and service-only admission. Never admit human refresh or raw projection reads.
 */
module.exports = {
    /** Runs a bounded owner refresh; supports router callbacks and promise callers, propagating failures without a success watermark. */
    refresh: function (request, callback) {
        const promise = Promise.resolve().then(() => {
            request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
            return SERVICE.DefaultCouponAcquisitionRefreshService.refresh(request, request.httpRequest?.body || request.payload);
        }).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module promotion/controller/defaultPromotionBusinessWorkbenchController @description Maps fixed campaign discovery, capabilities and safe search to the Promotion owner. @layer controller @owner promotion */
module.exports = {
    /** Maps native HTTP input without accepting a caller-selected schema, service or operation. */
    invoke: function (request, callback, operation) {
        const promise = Promise.resolve().then(() => SERVICE.DefaultPromotionBusinessWorkbenchService[operation]({
            ...request, payload: request.httpRequest?.body || {}, query: request.httpRequest?.query || {},
        })).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /** Returns the ordinary business schema list envelope. */
    schemas: function (request, callback) { return this.invoke(request, callback, "schemas"); },
    /** Returns read-only campaign capabilities, not generic schema administration. */
    capabilities: function (request, callback) { return this.invoke(request, callback, "descriptor"); },
    /** Executes scoped campaign search without financial or coupon fields. */
    search: function (request, callback) { return this.invoke(request, callback, "search"); },
    /** Writes only through the fixed draft owner, retaining the original request for fresh authority checks. */
    draft: function (request, callback, operation) {
        const promise = Promise.resolve().then(() => SERVICE.DefaultPromotionDraftService.execute(request, operation, request.httpRequest?.body))
            .then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /** Creates an inert qualified Staged draft, not an operational campaign. */
    create: function (request, callback) { return this.draft(request, callback, "create"); },
    /** Appends a version-qualified draft metadata change. */
    update: function (request, callback) { return this.draft(request, callback, "update"); },
};

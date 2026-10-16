/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module wasteApi/controller/DefaultWasteBusinessWorkbenchController @description Fixed read-only owner transport for the existing Workbench. @layer controller @owner wasteApi */
module.exports = {
    /** Preserves original authentication and wraps the existing Workbench response contract. */
    invoke: function (request, operation, callback) {
        const promise = Promise.resolve().then(() => SERVICE.DefaultWasteBusinessWorkbenchService.execute(request, operation,
            request.httpRequest?.params?.schemaName, request.httpRequest?.body || {})).then(data => ({ data }));
        return callback ? promise.then(result => callback(null, result), callback) : promise;
    },
    /** Returns only qualified, active, scoped owner descriptors. */
    schemas: function (request, callback) { return this.invoke(request, 'schemas', callback); },
    /** Returns current read-only capabilities for an allowlisted schema. */
    capabilities: function (request, callback) { return this.invoke(request, 'capabilities', callback); },
    /** Accepts only the shared bounded safe-query envelope. */
    search: function (request, callback) { return this.invoke(request, 'search', callback); },
};

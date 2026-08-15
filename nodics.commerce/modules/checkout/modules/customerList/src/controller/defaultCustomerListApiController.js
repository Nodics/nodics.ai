/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module customerList/src/controller/defaultCustomerListApiController @description Maps Customer List HTTP inputs to the secured facade. @layer controller @owner customerList */
module.exports = {
    applyHttp: function (request) {
        const http = request.httpRequest || {};
        const params = http.params || {};
        request.listType = (params.listType || request.listType || '').toUpperCase();
        request.entryCode = params.entryCode || request.entryCode;
        request.payload = http.body || request.payload || {};
        request.query = Object.assign({}, request.query || {}, http.query || {});
        return request;
    },
    invoke: function (operation, request, callback) {
        const promise = FACADE.DefaultCustomerListApiFacade[operation](this.applyHttp(request)).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    read: function (request, callback) { return this.invoke('read', request, callback); },
    addEntry: function (request, callback) { return this.invoke('addEntry', request, callback); },
    removeEntry: function (request, callback) { return this.invoke('removeEntry', request, callback); },
    clear: function (request, callback) { return this.invoke('clear', request, callback); }
};

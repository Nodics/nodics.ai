/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module customerList/src/facade/defaultCustomerListApiFacade @description Enforces customer ownership context for wishlist and compare APIs. @layer facade @owner customerList */
module.exports = {
    applyContext: function (request) {
        const auth = request.authData || {};
        request.tenant = auth.tenant || request.tenant;
        request.ownerId = auth.principalId || auth.code || auth.loginId || request.ownerId;
        if (!request.tenant || !request.ownerId) throw new Error('Authenticated tenant and customer are required');
        return request;
    },
    read: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCustomerListApiService.read(this.applyContext(request))); },
    addEntry: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCustomerListApiService.addEntry(this.applyContext(request))); },
    removeEntry: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCustomerListApiService.removeEntry(this.applyContext(request))); },
    clear: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCustomerListApiService.clear(this.applyContext(request))); }
};

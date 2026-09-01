/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyApi/src/controller/defaultLoyaltyInternalController @description Maps Loyalty internal HTTP input to the Loyalty internal facade. @layer controller @owner loyaltyApi @override Later modules may adapt transport mapping while preserving resource contracts. */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    headerValue: function (request, name) {
        let headers = request.headers || request.header || request.httpRequest && (request.httpRequest.headers || request.httpRequest.header) || {};
        return headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()];
    },
    invoke: function (operation, request, callback) {
        let http = request.httpRequest || {};
        request.params = Object.assign({}, request.params || {}, http.params || {});
        request.query = Object.assign({}, request.query || {}, http.query || {});
        request.payload = Object.assign({}, request.payload || {}, http.body || {});
        request.idempotencyKey = request.idempotencyKey || request.payload.idempotencyKey || this.headerValue(request, 'Idempotency-Key');
        request.correlationId = request.correlationId || request.payload.correlationId || this.headerValue(request, 'X-Correlation-Id') || request.idempotencyKey;
        request.tenant = request.tenant || request.authData && request.authData.tenant;
        let promise = FACADE.DefaultLoyaltyInternalFacade[operation](request).then(data => ({ data: data }));
        if (!callback) return promise;
        promise.then(success => callback(null, success)).catch(error => callback(error));
    },
    wallet: function (request, callback) {
        return this.invoke('wallet', request, callback);
    },
    reserveRewards: function (request, callback) {
        return this.invoke('reserveRewards', request, callback);
    },
    captureReservation: function (request, callback) {
        return this.invoke('captureReservation', request, callback);
    },
    releaseReservation: function (request, callback) {
        return this.invoke('releaseReservation', request, callback);
    },
    reverseLedgerEntry: function (request, callback) {
        return this.invoke('reverseLedgerEntry', request, callback);
    }
};

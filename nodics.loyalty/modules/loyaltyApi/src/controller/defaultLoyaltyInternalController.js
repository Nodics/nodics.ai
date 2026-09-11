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
    /** Completes the module initialization hook without creating business records. */
    init: function () { return Promise.resolve(true); },
    /** Completes the post-initialization hook without starting an independent runtime. */
    postInit: function () { return Promise.resolve(true); },
    /** Reads a request or HTTP header using supported header-name casing. */
    headerValue: function (request, name) {
        let headers = request.headers || request.header || request.httpRequest && (request.httpRequest.headers || request.httpRequest.header) || {};
        return headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()];
    },
    /** Invokes the owning facade and maps its promise into the supported callback or response envelope. */
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
    /** Invokes the openWallet wallet operation. */
    openWallet: function (request, callback) { return this.invoke('openWallet',request,callback); },
    /** Invokes the ownerWalletProjection wallet operation. */
    ownerWalletProjection: function (request, callback) { return this.invoke('ownerWalletProjection',request,callback); },
    /** Invokes the earnRewards wallet operation. */
    earnRewards: function (request, callback) { return this.invoke('earnRewards',request,callback); },
    /** Maps a service-authorized reward transfer. */
    transferRewards: function(request,callback) { return this.invoke('transferRewards',request,callback); },
    /** Loads the requested wallet through the generated Loyalty service with the trusted request context. */
    wallet: function (request, callback) {
        return this.invoke('wallet', request, callback);
    },
    /** Forwards reward reservation to Loyalty; the operation requires a stable idempotency key. */
    reserveRewards: function (request, callback) {
        return this.invoke('reserveRewards', request, callback);
    },
    /** Forwards capture of the specified reservation; Loyalty validates its state and records redemption. */
    captureReservation: function (request, callback) {
        return this.invoke('captureReservation', request, callback);
    },
    /** Forwards release of the specified reservation; Loyalty returns held rewards through ledger-backed operations. */
    releaseReservation: function (request, callback) {
        return this.invoke('releaseReservation', request, callback);
    },
    /** Forwards reversal of the referenced ledger entry; historical entries remain append-only. */
    reverseLedgerEntry: function (request, callback) {
        return this.invoke('reverseLedgerEntry', request, callback);
    }
};

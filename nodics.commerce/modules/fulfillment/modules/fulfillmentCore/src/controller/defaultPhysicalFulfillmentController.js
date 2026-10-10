/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module fulfillmentCore/controller/defaultPhysicalFulfillmentController @description Maps signed manual Fulfillment commands without accepting principal, enterprise, Order, capture or stock authority from the body. @layer controller @owner fulfillmentCore */
module.exports = {
    /** Maps route, signed authentication, private Authorization and stable command headers into the owner service. */
    invoke: function (operation, request, callback) {
        const http = request.httpRequest || {}, headers = http.headers || {};
        const promise = Promise.resolve().then(()=>SERVICE.DefaultPhysicalOrderReversalService[operation]({
            tenant:request.tenant,authData:request.authData,code:http.params?.code,payload:http.body || {},
            authorization:headers.authorization,idempotencyKey:headers['idempotency-key'],
            correlationId:headers['x-correlation-id'] || request.requestId
        })).then(data=>({data}));
        return callback ? promise.then(value=>callback(null,value)).catch(callback) : promise;
    },
    /** Records an actual reviewed manual warehouse handover and owner-issued shipment. */
    dispatch: function (request, callback) { return this.invoke('dispatch',request,callback); },
    /** Receives a returned package against the reviewed original shipment. */
    recordReceipt: function (request, callback) { return this.invoke('recordReceipt',request,callback); },
    /** Inspects one original receipt without applying stock or issuing money. */
    recordInspection: function (request, callback) { return this.invoke('recordInspection',request,callback); }
};

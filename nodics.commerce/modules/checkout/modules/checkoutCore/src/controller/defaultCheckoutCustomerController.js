/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module checkoutCore/src/controller/defaultCheckoutCustomerController @description Maps bounded placement input to Checkout facade. @layer controller @owner checkoutCore */
module.exports = { place: function (request, callback) {
    const http = request.httpRequest || {}; request.payload = http.body || request.payload || {};
    request.idempotencyKey = request.idempotencyKey || (http.headers && http.headers['idempotency-key']);
    const promise = FACADE.DefaultCheckoutCustomerFacade.place(request).then(data => ({ data }));
    if (!callback) return promise; promise.then(value => callback(null, value)).catch(callback);
} };

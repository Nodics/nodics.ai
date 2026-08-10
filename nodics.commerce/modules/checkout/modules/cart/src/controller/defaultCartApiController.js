/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cart/src/controller/defaultCartApiController @description Maps Cart HTTP input to the secured facade. @layer controller @owner cart */
module.exports = { calculate: function (request, callback) {
    const http = request.httpRequest || {}; request.cartCode = (http.params || {}).cartCode || request.cartCode;
    request.payload = http.body || request.payload || {};
    const promise = FACADE.DefaultCartApiFacade.calculate(request).then(data => ({ data }));
    if (!callback) return promise; promise.then(value => callback(null, value)).catch(callback);
} };

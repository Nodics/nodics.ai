/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cart/src/facade/defaultCartApiFacade @description Enforces authenticated Cart ownership context. @layer facade @owner cart */
module.exports = { calculate: function (request) {
    const auth = request.authData || {}; request.tenant = auth.tenant || request.tenant;
    request.ownerId = auth.principalId || auth.code || request.ownerId;
    if (!request.tenant || !request.ownerId) return Promise.reject(new Error('Authenticated tenant and customer are required'));
    return SERVICE.DefaultCartApiService.calculate(request);
} };

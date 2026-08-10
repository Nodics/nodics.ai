/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cart/src/router/routers @description Declares secured customer Cart calculation API. @layer router @owner cart */
module.exports = { cart: { customer: {
    calculate: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.cart.own', apiExposure: 'commerceCustomer', key: '/customer/carts/:cartCode/calculations', method: 'POST', controller: 'DefaultCartApiController', operation: 'calculate' }
} } };

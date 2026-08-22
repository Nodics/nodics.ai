/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module checkoutCore/src/router/routers @description Declares secured idempotent customer placement API. @layer router @owner checkoutCore */
module.exports = { checkoutCore: { customer: {
    place: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.checkout.place', apiExposure: 'commerceCustomer', key: '/customer/checkouts/place', method: 'POST', controller: 'DefaultCheckoutCustomerController', operation: 'place' }
} } };

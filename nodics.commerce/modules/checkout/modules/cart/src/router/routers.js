/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cart/src/router/routers @description Declares secured Cart APIs with ownership enforced by token/session permissions. @layer router @owner cart */
module.exports = { cart: { customer: {
    create: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.cart.own', apiExposure: 'commerceCustomer', key: '/carts', method: 'POST', controller: 'DefaultCartCustomerController', operation: 'create' },
    read: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.cart.own', apiExposure: 'commerceCustomer', key: '/carts/:cartCode', method: 'GET', controller: 'DefaultCartCustomerController', operation: 'read' },
    addEntry: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.cart.own', apiExposure: 'commerceCustomer', key: '/carts/:cartCode/entries', method: 'POST', controller: 'DefaultCartCustomerController', operation: 'addEntry' },
    updateEntry: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.cart.own', apiExposure: 'commerceCustomer', key: '/carts/:cartCode/entries/:entryCode', method: 'PATCH', controller: 'DefaultCartCustomerController', operation: 'updateEntry' },
    removeEntry: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.cart.own', apiExposure: 'commerceCustomer', key: '/carts/:cartCode/entries/:entryCode', method: 'DELETE', controller: 'DefaultCartCustomerController', operation: 'removeEntry' },
    calculate: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.cart.own', apiExposure: 'commerceCustomer', key: '/carts/:cartCode/calculations', method: 'POST', controller: 'DefaultCartCustomerController', operation: 'calculate' }
} } };

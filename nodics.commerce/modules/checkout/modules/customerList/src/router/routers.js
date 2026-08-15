/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module customerList/src/router/routers @description Declares secured customer wishlist and compare APIs. @layer router @owner customerList */
module.exports = { customerList: { customer: {
    read: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.customerList.own', apiExposure: 'commerceCustomer', key: '/customer/lists/:listType', method: 'GET', controller: 'DefaultCustomerListApiController', operation: 'read' },
    addEntry: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.customerList.own', apiExposure: 'commerceCustomer', key: '/customer/lists/:listType/entries', method: 'POST', controller: 'DefaultCustomerListApiController', operation: 'addEntry' },
    removeEntry: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.customerList.own', apiExposure: 'commerceCustomer', key: '/customer/lists/:listType/entries/:entryCode', method: 'DELETE', controller: 'DefaultCustomerListApiController', operation: 'removeEntry' },
    clear: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.customerList.own', apiExposure: 'commerceCustomer', key: '/customer/lists/:listType/entries', method: 'DELETE', controller: 'DefaultCustomerListApiController', operation: 'clear' }
} } };

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module shoppingList/src/router/routers @description Declares secured wishlist and compare APIs with ownership enforced by token/session permissions. @layer router @owner shoppingList */
module.exports = { shoppingList: { customer: {
    read: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.shoppingList.own', apiExposure: 'commerceCustomer', key: '/lists/:listType', method: 'GET', controller: 'DefaultShoppingListCustomerController', operation: 'read' },
    addEntry: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.shoppingList.own', apiExposure: 'commerceCustomer', key: '/lists/:listType/entries', method: 'POST', controller: 'DefaultShoppingListCustomerController', operation: 'addEntry' },
    removeEntry: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.shoppingList.own', apiExposure: 'commerceCustomer', key: '/lists/:listType/entries/:entryCode', method: 'DELETE', controller: 'DefaultShoppingListCustomerController', operation: 'removeEntry' },
    clear: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.shoppingList.own', apiExposure: 'commerceCustomer', key: '/lists/:listType/entries', method: 'DELETE', controller: 'DefaultShoppingListCustomerController', operation: 'clear' }
} } };

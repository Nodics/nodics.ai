/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/router/routers @description Declares secured Order lifecycle intent APIs with access enforced by token/session permissions. @layer router @owner order */
module.exports = { order: {
    customer: {
        read: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.order.own.read', apiExposure: 'commerceCustomer', key: '/orders/:orderCode', method: 'GET', controller: 'DefaultOrderCustomerController', operation: 'read' },
        listOwnOrders: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.order.own.read', apiExposure: 'commerceCustomer', key: '/orders', method: 'GET', controller: 'DefaultOrderCustomerController', operation: 'listOwn' },
        preview: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.lifecycle.own.create', apiExposure: 'commerceCustomer', key: '/orders/:orderCode/lifecycle/preview', method: 'POST', controller: 'DefaultOrderLifecycleController', operation: 'preview' },
        create: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.lifecycle.own.create', apiExposure: 'commerceCustomer', key: '/orders/:orderCode/lifecycle', method: 'POST', controller: 'DefaultOrderLifecycleController', operation: 'create' },
        listOwn: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.order.own.read', apiExposure: 'commerceCustomer', key: '/orders/:orderCode/lifecycle', method: 'GET', controller: 'DefaultOrderLifecycleController', operation: 'listOwn' }
    },
    operator: {
        list: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.lifecycle.read', apiExposure: 'commerceManagement', key: '/order-lifecycle', method: 'GET', controller: 'DefaultOrderLifecycleController', operation: 'list' },
        action: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.lifecycle.act', apiExposure: 'commerceManagement', key: '/order-lifecycle/:requestCode/actions/:actionCode', method: 'POST', controller: 'DefaultOrderLifecycleController', operation: 'action' }
    }
} };

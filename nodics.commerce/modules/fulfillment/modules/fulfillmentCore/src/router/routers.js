/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module fulfillmentCore/src/router/routers @description Exposes Fulfillment delivery and return method policy. @layer router @owner fulfillmentCore */
module.exports = { fulfillmentCore: { customer: {
    shippingMethods: { secured: false, publicAccess: true, accessGroups: ['userGroup'], permission: 'commerce.shipping.methods.read', apiExposure: 'commerceCustomer', key: '/shipping/methods', method: 'GET', controller: 'DefaultFulfillmentCustomerController', operation: 'shippingMethods' },
    returnMethods: { secured: false, publicAccess: true, accessGroups: ['userGroup'], permission: 'commerce.return.methods.read', apiExposure: 'commerceCustomer', key: '/returns/methods', method: 'GET', controller: 'DefaultFulfillmentCustomerController', operation: 'returnMethods' }
} } };

module.exports.fulfillmentCore.physical = {
    physicalDispatch: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.fulfillment.return', apiExposure: 'commerceManagement', key: '/physical/orders/:code/dispatch', method: 'POST', controller: 'DefaultPhysicalFulfillmentController', operation: 'dispatch' },
    physicalReturnReceipt: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.fulfillment.return', apiExposure: 'commerceManagement', key: '/physical/reviews/:code/receipt', method: 'POST', controller: 'DefaultPhysicalFulfillmentController', operation: 'recordReceipt' },
    physicalReturnInspection: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.fulfillment.return', apiExposure: 'commerceManagement', key: '/physical/reviews/:code/inspection', method: 'POST', controller: 'DefaultPhysicalFulfillmentController', operation: 'recordInspection' }
};

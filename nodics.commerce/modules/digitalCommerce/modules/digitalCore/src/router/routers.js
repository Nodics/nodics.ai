/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/src/router/routers @description Declares secured customer Digital Commerce entitlement APIs. @layer router @owner digitalCore */
module.exports = { digitalCore: { customer: {
    listEntitlements: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.digital.own.read', apiExposure: 'commerceCustomer', key: '/entitlements', method: 'GET', controller: 'DefaultDigitalCommerceCustomerController', operation: 'listEntitlements' },
    revealEntitlement: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.digital.own.reveal', apiExposure: 'commerceCustomer', key: '/entitlements/:entitlementCode/reveal', method: 'POST', controller: 'DefaultDigitalCommerceCustomerController', operation: 'revealEntitlement' }
} } };

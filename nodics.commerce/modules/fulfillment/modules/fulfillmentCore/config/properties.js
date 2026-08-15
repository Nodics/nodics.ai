/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module fulfillmentCore/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner fulfillmentCore */
module.exports = {
    fulfillmentCore: {
        enabled: true,
        customerShipping: {
            enabled: true,
            methods: [
                { code: 'STANDARD', label: 'Standard', price: '0.00', currency: 'USD', promise: '3-5 business days', requiresAddress: true, returnEligible: true },
                { code: 'EXPRESS', label: 'Express', price: '12.00', currency: 'USD', promise: '1-2 business days', requiresAddress: true, returnEligible: true },
                { code: 'STORE_PICKUP', label: 'Store Pickup', price: '0.00', currency: 'USD', promise: 'Ready when fulfilled', requiresAddress: false, returnEligible: true }
            ],
            returnMethods: [
                { code: 'PICKUP', label: 'Pickup from address', requiresAddress: true },
                { code: 'DROP_OFF', label: 'Drop off', requiresAddress: false },
                { code: 'STORE_RETURN', label: 'Store return', requiresAddress: false }
            ]
        },
        carrierProvider: { enabled: false, maturity: 'SANDBOX_CAPABLE', sandboxOnly: true, liveQualified: false, endpoint: '', credentialReference: '', accountReference: '', timeoutMilliseconds: 5000 }
    },
    schemaPolicies: { fulfillmentCore: {
        operational: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        tenantOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        customerOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'ownerId', bypassGroups: { adminGroup: true, commerceOperatorUserGroup: true, serviceAccountUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } }
    } }
};

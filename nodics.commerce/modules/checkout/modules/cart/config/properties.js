/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cart/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner cart */
module.exports = {
    // Inert inventory; an allowed local server must explicitly select this capability.
    localResetProvider: {
        "contributions": {
            "cart": {
                "serviceNames": {
                    "DefaultCartCalculationService": true,
                    "DefaultCartDiagnosticService": true,
                    "DefaultCartEntryService": true,
                    "DefaultCartService": true
                }
            }
        }
    },

    cart: {
        enabled: true,
        customerApi: {
            defaultChannelCode: 'web',
            defaultLocale: 'en',
            defaultJurisdiction: 'US',
            defaultCurrency: 'USD'
        }
    },
    schemaPolicies: { cart: {
        operational: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        tenantOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        customerOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'ownerId', bypassGroups: { adminGroup: true, commerceOperatorUserGroup: true, serviceAccountUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } }
    } }
};

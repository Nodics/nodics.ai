/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module paymentCore/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner paymentCore */
module.exports = {
    // Inert inventory; an allowed local server must explicitly select this capability.
    localResetProvider: {
        "contributions": {
            "paymentCore": {
                "serviceNames": {
                    "DefaultPaymentInstrumentReferenceService": true,
                    "DefaultPaymentReconciliationService": true,
                    "DefaultPaymentTransactionEntryService": true,
                    "DefaultPaymentTransactionService": true
                }
            }
        }
    },

    paymentCore: {
        enabled: true,
        // The shipped card adapter is an offline mock; selecting it never qualifies real payments.
        providerSelection: { CARD: 'stripe-sandbox', WALLET: 'stripe-sandbox', LOYALTY_REWARD: 'loyalty-reward-points' },
        providerBindings: {
            'stripe-sandbox': { serviceName: 'DefaultStripeSandboxAdapterService', methods: ['CARD', 'WALLET'] },
            'loyalty-reward-points': { serviceName: 'DefaultLoyaltyRewardPaymentProviderService', methods: ['LOYALTY_REWARD'] }
        }
    },
    apiExposure: {
        categories: {
            moduleInternal: { enabled: true }
        }
    },
    schemaPolicies: { paymentCore: {
        operational: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        tenantOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        customerOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'ownerId', bypassGroups: { adminGroup: true, commerceOperatorUserGroup: true, serviceAccountUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } }
    } }
};

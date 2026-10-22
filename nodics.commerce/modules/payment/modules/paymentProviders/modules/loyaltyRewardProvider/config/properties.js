/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyRewardProvider/config/properties @description Defines Commerce payment-provider defaults for Loyalty reward payment integration. @layer config @owner loyaltyRewardProvider */
module.exports = {
    tooling: {
        commands: {
            'acceptance:loyalty-reward-checkout': {
                acceptanceContract: true,
                projectHome: true,
                handler: '@nTooling/node-script',
                script: 'src/service/acceptance/defaultLoyaltyRewardCheckoutAcceptanceService.mjs'
            }
        }
    },
    loyaltyRewardProvider: {
        auctionPaths: { inspect: '/auction-funds/inspect', capture: '/auction-funds/capture', release: '/auction-funds/release' },
        enabled: true,
        providerCode: 'loyalty-reward-points',
        maturity: 'INTERNAL_CONFORMANCE',
        programCode: 'default',
        rewardTypeCode: 'points',
        profileTarget: { moduleName: 'profile', connectionName: 'profile', apiVersion: 'v0', targetAuthority: { runtimeRole: 'PLATFORM' }, timeoutMs: 3000, maxAttempts: 1 },
        loyaltyTarget: {
            moduleName: 'loyaltyApi',
            connectionName: 'loyaltyServer',
            connectionType: 'abstract',
            apiVersion: 'v0',
            targetAuthority: { runtimeRole: 'LOYALTY' },
            timeoutMs: 3000,
            maxAttempts: 2
        }
    }
};

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
    loyaltyRewardProvider: {
        enabled: true,
        providerCode: 'loyalty-reward-points',
        maturity: 'INTERNAL_CONFORMANCE',
        programCode: 'default',
        rewardTypeCode: 'points',
        loyaltyTarget: {
            moduleName: 'loyaltyApi',
            connectionName: 'loyaltyServer',
            apiVersion: 'v0',
            targetAuthority: { runtimeRole: 'LOYALTY' },
            timeoutMs: 3000,
            maxAttempts: 2
        }
    }
};

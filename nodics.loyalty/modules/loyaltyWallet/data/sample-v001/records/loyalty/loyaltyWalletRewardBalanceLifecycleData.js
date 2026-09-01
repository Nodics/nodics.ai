/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyWallet/data/sample-v001/records/loyaltyWalletRewardBalanceLifecycleData @description Provides a local sample balance after earn, reserve, and capture. @layer data @owner loyaltyWallet */
module.exports = {
    record0: {
        code: 'sample-customer-wallet-001:default:points',
        walletCode: 'sample-customer-wallet-001',
        programCode: 'default',
        rewardTypeCode: 'points',
        available: '75.00',
        reserved: '0.00',
        earned: '100.00',
        spent: '25.00',
        expired: '0.00',
        reversed: '0.00',
        updatedAt: '2026-09-01T10:10:00.000Z',
        revision: 3,
        active: true
    }
};

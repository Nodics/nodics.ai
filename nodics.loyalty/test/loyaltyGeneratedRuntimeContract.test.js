/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const test = require('node:test');
const verify = require('../../nodics.foundation/modules/nTooling/test/helpers/generatedRuntime.cjs');

test('Loyalty schemas materialize governed generated get/save services independently', () => {
    verify({ moduleRoots: ['nodics.loyalty'], activeModules: ['nodics.loyalty'], role: 'LOYALTY',
        schemas: {
            loyaltyCore: { loyaltyOperationPolicy: true }, loyaltyProgram: { loyaltyProgram: true },
            loyaltyRewardType: { loyaltyRewardType: true }, loyaltyWallet: { loyaltyWallet: true, loyaltyWalletRewardBalance: true },
            loyaltyLedger: { rewardLedgerEntry: true }, loyaltyReservation: { rewardReservation: true },
            loyaltyRedemption: { rewardRedemption: true },
        },
        entities: { SERVICE: ['DefaultLoyaltyAmountService', 'DefaultLoyaltyWalletOwnerService',
            'DefaultLoyaltyLedgerPostingService', 'DefaultLoyaltyRewardOperationService'],
        FACADE: ['DefaultLoyaltyInternalFacade'], CONTROLLER: ['DefaultLoyaltyInternalController'] },
    });
});

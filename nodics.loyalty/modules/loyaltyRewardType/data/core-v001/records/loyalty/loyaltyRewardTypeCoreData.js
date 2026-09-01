/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyRewardType/data/core-v001/records/loyaltyRewardTypeCoreData @description Provides default reward unit types for Loyalty wallets. @layer data @owner loyaltyRewardType */
module.exports = {
    record0: {
        code: 'points',
        name: 'Reward Points',
        unitType: 'POINT',
        precision: 2,
        allowNegativeBalance: false,
        expires: false,
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record1: {
        code: 'storeCredit',
        name: 'Store Credit',
        unitType: 'CREDIT',
        precision: 2,
        allowNegativeBalance: false,
        expires: false,
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record2: {
        code: 'visitStamp',
        name: 'Visit Stamp',
        unitType: 'STAMP',
        precision: 0,
        allowNegativeBalance: false,
        expires: true,
        expiryDays: 365,
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyWallet/data/sample-v001/records/loyaltyWalletLifecycleData @description Provides a local sample customer wallet without tenant or enterprise ownership fields. @layer data @owner loyaltyWallet */
module.exports = {
    record0: {
        code: 'sample-customer-wallet-001',
        ownerType: 'CUSTOMER',
        ownerCode: 'sample-customer-001',
        status: 'OPEN',
        openedAt: '2026-09-01T10:00:00.000Z',
        revision: 1,
        active: true
    }
};

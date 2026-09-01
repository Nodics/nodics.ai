/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyCore/src/utils/statusDefinitions @description Defines stable Loyalty response and error codes for wallet, ledger, reservation, redemption, and API operations. @layer utility @owner loyaltyCore @override Later modules may add codes but must preserve existing meanings and fail-closed behavior. */
module.exports = {
    SUC_LOYALTY_00000: { code: '200', message: 'Loyalty operation successfully processed' },
    SUC_LOYALTY_00001: { code: '201', message: 'Loyalty reward reservation created' },
    SUC_LOYALTY_00002: { code: '200', message: 'Loyalty reward reservation captured' },
    SUC_LOYALTY_00003: { code: '200', message: 'Loyalty reward reservation released' },
    ERR_LOYALTY_00000: { code: '400', message: 'Invalid Loyalty request' },
    ERR_LOYALTY_00001: { code: '422', message: 'Invalid Loyalty amount' },
    ERR_LOYALTY_00002: { code: '422', message: 'Invalid Loyalty wallet owner' },
    ERR_LOYALTY_00003: { code: '404', message: 'Loyalty wallet reward balance was not found' },
    ERR_LOYALTY_00004: { code: '409', message: 'Loyalty ledger is append-only' },
    ERR_LOYALTY_00005: { code: '404', message: 'Reward reservation was not found' },
    ERR_LOYALTY_00006: { code: '409', message: 'Invalid reward reservation status' },
    ERR_LOYALTY_00007: { code: '404', message: 'Reward ledger entry was not found' },
    ERR_LOYALTY_00008: { code: '409', message: 'Reward balance cannot be negative' },
    ERR_LOYALTY_00009: { code: '503', message: 'Required Loyalty service is not available' }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const ENUMS = require('../../../loyaltyCore/src/utils/enums');
const UTILS = require('../../../loyaltyCore/src/utils/utils');

/** @module loyaltyWallet/src/service/defaultLoyaltyWalletOwnerService @description Validates runtime-neutral wallet ownership identity. @layer service @owner loyaltyWallet @override Later modules may extend owner types while preserving ownerType/ownerCode contract. */
module.exports = {
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },
    normalize: function (owner) {
        owner = owner || {};
        let ownerType = UTILS.normalizeCode(owner.ownerType);
        let ownerCode = UTILS.normalizeString(owner.ownerCode);
        if (ENUMS.LoyaltyOwnerType.definition.indexOf(ownerType) < 0) this.fail('ERR_LOYALTY_OWNER_TYPE', 'wallet ownerType is invalid');
        if (!ownerCode) this.fail('ERR_LOYALTY_OWNER_CODE', 'wallet ownerCode is required');
        return { ownerType: ownerType, ownerCode: ownerCode };
    }
};

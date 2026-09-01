/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const ENUMS = require('../../../loyaltyCore/src/utils/enums');
const AMOUNTS = require('../../../loyaltyCore/src/service/defaultLoyaltyAmountService');
const UTILS = require('../../../loyaltyCore/src/utils/utils');

/** @module loyaltyLedger/src/service/defaultLoyaltyLedgerPostingService @description Builds append-only reward ledger entries without persistence side effects. @layer service @owner loyaltyLedger @override Later modules may add persistence while preserving append-only and idempotency contracts. */
module.exports = {
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },
    assertAppendOnlyMutation: function (request) {
        let operation = UTILS.normalizeCode(request && request.operation);
        if (['UPDATE', 'PATCH', 'DELETE', 'REMOVE'].indexOf(operation) >= 0) {
            this.fail('ERR_LOYALTY_LEDGER_APPEND_ONLY', 'ledger history is append-only; post reversal entries instead');
        }
        return true;
    },
    buildEntry: function (request) {
        request = request || {};
        this.assertAppendOnlyMutation(request);
        let entryType = UTILS.normalizeCode(request.entryType);
        if (ENUMS.LoyaltyLedgerEntryType.definition.indexOf(entryType) < 0) this.fail('ERR_LOYALTY_LEDGER_TYPE', 'ledger entryType is invalid');
        ['walletCode', 'programCode', 'rewardTypeCode', 'sourceType', 'sourceCode', 'idempotencyKey', 'correlationId'].forEach(field => {
            if (!UTILS.normalizeString(request[field])) this.fail('ERR_LOYALTY_LEDGER_REQUIRED', field + ' is required');
        });
        let amount = AMOUNTS.assertPositive(request.amount, request.scale);
        return Object.assign({}, request, {
            entryType: entryType,
            amount: amount,
            postedAt: request.postedAt || new Date()
        });
    }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyCore/src/utils/utils @description Provides small shared Loyalty normalization helpers. @layer utility @owner loyaltyCore @override Later modules may extend helpers while preserving existing behavior. */
module.exports = {
    normalizeString: function (value) {
        return value === undefined || value === null ? '' : String(value).trim();
    },
    normalizeCode: function (value) {
        return this.normalizeString(value).toUpperCase();
    }
};

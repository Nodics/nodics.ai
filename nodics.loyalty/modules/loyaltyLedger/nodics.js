/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyLedger @description Declares the lifecycle boundary for loyaltyLedger. @layer module @owner loyaltyLedger @override Later active modules may override lifecycle behavior without modifying this boundary. */
module.exports = {
    init: function (options) {
        return Promise.resolve(true);
    },
    postInit: function (options) {
        return Promise.resolve(true);
    }
};

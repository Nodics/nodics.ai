/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyRewardType @description Declares the lifecycle boundary for loyaltyRewardType. @layer module @owner loyaltyRewardType @override Later active modules may override lifecycle behavior without modifying this boundary. */
module.exports = {
    /** Completes the module initialization hook without creating business records. */
    init: function (options) {
        return Promise.resolve(true);
    },
    /** Completes the post-initialization hook without starting an independent runtime. */
    postInit: function (options) {
        return Promise.resolve(true);
    }
};

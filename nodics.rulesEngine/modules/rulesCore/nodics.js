/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module rulesCore/nodics @description Declares the rulesCore Rules Engine capability boundary. @layer module @owner rulesCore @override Later active modules may extend behavior through standard Nodics layering. */
module.exports = {
    /** Implements init as an overrideable service operation. */
    init: function (options) { return Promise.resolve(true); },
    /** Implements postInit as an overrideable service operation. */
    postInit: function (options) { return Promise.resolve(true); }
};

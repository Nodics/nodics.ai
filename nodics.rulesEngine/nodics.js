/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.rulesEngine/nodics
 * @description Declares the Rules Engine functional module composition boundary without owning child capability behavior.
 * @layer module
 * @owner nodics.rulesEngine
 * @override Later framework/customer layers may extend child capabilities while this group remains composition-only.
 */
module.exports = {
    /** Implements init as an overrideable service operation. */
    init: function (options) {
        return Promise.resolve(true);
    },
    /** Implements postInit as an overrideable service operation. */
    postInit: function (options) {
        return Promise.resolve(true);
    }
};

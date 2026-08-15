/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoveryConfig/nodics @description Declares Discovery configuration lifecycle. @layer module @owner discoveryConfig */
module.exports = {
    /** Initializes the module. @param {Object} options Startup options. @returns {Promise<boolean>} Initialization result. */
    init: function (options) { return Promise.resolve(true); },
    /** Completes module initialization. @param {Object} options Startup options. @returns {Promise<boolean>} Post-init result. */
    postInit: function (options) { return Promise.resolve(true); }
};

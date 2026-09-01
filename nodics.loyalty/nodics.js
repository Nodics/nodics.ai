/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.loyalty/nodics
 * @description Declares the Loyalty functional module lifecycle boundary without owning domain behavior.
 * @layer module
 * @owner nodics.loyalty
 * @override Customer loyalty overlays extend child capabilities; this group remains a composition boundary.
 */
module.exports = {
    /**
     * Initializes this module boundary.
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization completes.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes this module boundary.
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization completes.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module installer/nodics
 * @description Declares the platform Installer capability boundary for installed Nodics runtimes.
 * @layer module
 * @owner installer
 * @override Project modules may extend installer operation policies without changing the standalone first-machine bootstrap package.
 */
module.exports = {
    /**
     * Initializes the Installer platform capability.
     *
     * @returns {Promise<boolean>} Resolves when module initialization completes.
     */
    init: function () {
        return Promise.resolve(true);
    },

    /**
     * Finalizes Installer platform capability startup.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization completes.
     */
    postInit: function () {
        return Promise.resolve(true);
    }
};

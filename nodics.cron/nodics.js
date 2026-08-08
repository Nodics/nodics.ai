/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.cron/nodics
 * @description Declares the cron functional module lifecycle hooks that participate in a server runtime after nodics.core has initialized.
 * @layer module
 * @owner nodics.cron
 * @override Customer cron extensions should override lifecycle behavior through their own module layer, not by editing this framework module.
 */
module.exports = {
    /**
     * Initializes cron module state during module loading.
     *
     * @returns {Promise<boolean>} Resolves when cron initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },
    /**
     * Finalizes cron module state after all modules have loaded.
     *
     * @returns {Promise<boolean>} Resolves when cron post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    }
};

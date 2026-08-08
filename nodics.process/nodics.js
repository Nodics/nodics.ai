/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/nodics
 * @description Declares the Process functional module lifecycle boundary for governed business process and workflow capabilities.
 * @layer module
 * @owner nodics.process
 * @override Customer process overlays should extend this module and override behavior through their own service/config/data layer.
 */
module.exports = {
    /**
     * Initializes Process module state during module loading.
     *
     * @returns {Promise<boolean>} Resolves when Process initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },

    /**
     * Finalizes Process module state after all modules have loaded.
     *
     * @returns {Promise<boolean>} Resolves when Process post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    }
};

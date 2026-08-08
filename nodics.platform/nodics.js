/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.platform/nodics
 * @description Declares the platform functional module lifecycle hooks for profile, BackOffice, and Axis backend capabilities.
 * @layer module
 * @owner nodics.platform
 * @override Customer platform overlays should extend this module and override behavior through their own service/config layer.
 */
module.exports = {
    /**
     * Initializes platform module state during module loading.
     *
     * @returns {Promise<boolean>} Resolves when platform initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },
    /**
     * Finalizes platform module state after all modules have loaded.
     *
     * @returns {Promise<boolean>} Resolves when platform post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    }
};

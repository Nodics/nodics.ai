/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.wcms/nodics
 * @description Declares the WCMS functional module lifecycle hooks for governed content, site, page, component, and media capabilities.
 * @layer module
 * @owner nodics.wcms
 * @override Customer WCMS overlays should extend this module and override behavior through their own service/config layer.
 */
module.exports = {
    /**
     * Initializes WCMS module state during module loading.
     *
     * @returns {Promise<boolean>} Resolves when WCMS initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },
    /**
     * Finalizes WCMS module state after all modules have loaded.
     *
     * @returns {Promise<boolean>} Resolves when WCMS post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    }
};

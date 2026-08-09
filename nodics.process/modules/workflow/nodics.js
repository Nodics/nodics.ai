/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/nodics
 * @description Registers workflow capability lifecycle hooks and composes flowSchema, flowCore, and flowApi.
 * @layer module
 * @owner workflow
 * @override Customer process overlays may extend workflow behavior through later active modules instead of modifying this module directly.
 */
module.exports = {
    /**
     * Initializes workflow capability composition.
     *
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },

    /**
     * Runs post-initialization behavior after workflow technical modules are loaded.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    }
};

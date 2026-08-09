/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowApi/nodics
 * @description Registers workflow API technical module lifecycle hooks.
 * @layer module
 * @owner flowApi
 * @override Customer process overlays may add or narrow process APIs through later active modules and configuration.
 */
module.exports = {
    /** @returns {Promise<boolean>} Resolves when module initialization is complete. */
    init: function () { return Promise.resolve(true); },
    /** @returns {Promise<boolean>} Resolves when module post-initialization is complete. */
    postInit: function () { return Promise.resolve(true); }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.docs/nodics
 * @description Declares the documentation-content module-group boundary without participating in runtime server activation.
 * @layer module
 * @owner nodics.docs
 * @override Customer projects must contribute their own documentation packs instead of changing framework documentation ownership.
 */
module.exports = {
    /**
     * Initializes documentation module-group state for tooling-only use.
     *
     * @returns {Promise<boolean>} Resolves when documentation initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },

    /**
     * Finalizes documentation module-group state for tooling-only use.
     *
     * @returns {Promise<boolean>} Resolves when documentation post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    }
};

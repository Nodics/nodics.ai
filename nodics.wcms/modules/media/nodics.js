/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.wcms/media/nodics
 * @description Registers the media framework module lifecycle hooks.
 * @layer module
 * @owner media
 * @override Later active modules may decorate lifecycle behavior without moving media storage authority out of media.
 */
module.exports = {
    /**
     * Initializes the media framework module.
     *
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },
    /**
     * Finalizes the media framework module after service loading.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    }
};

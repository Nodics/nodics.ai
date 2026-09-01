/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/module/nodics
 * @description WCMS Experience module lifecycle entrypoint for published CMS experience targeting.
 * @layer module
 * @owner wcmsExperience
 * @override Project modules may override services or configuration to customize experience targeting without changing framework source.
 */
module.exports = {
    /**
     * Initializes WCMS Experience without eagerly resolving Discovery services.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Completes module lifecycle after all module artifacts are loaded.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    }
};

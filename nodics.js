/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.ai/NodicsFrameworkRoot
 * @description Declares the nodics.ai framework repository boundary as a standard module-group-shaped package without making it a runtime module.
 * @layer framework-root
 * @owner nodics.ai
 * @override Do not add runtime behavior here. Functional modules such as nodics.core, nodics.platform, nodics.wcms, nodics.cron, and nodics.docs own runtime behavior.
 */
module.exports = {
    /**
     * Keeps the framework root compatible with standard Nodics package shape.
     *
     * The root package is intentionally not loadable by the Nodics module
     * loader. Runtime initialization starts from concrete functional modules
     * and customer server extension chains.
     *
     * @param {Object} options Optional caller context.
     * @returns {Promise<boolean>} Resolves true because the repository root has no runtime startup behavior.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Keeps the framework root compatible with standard Nodics package shape.
     *
     * @param {Object} options Optional caller context.
     * @returns {Promise<boolean>} Resolves true because the repository root has no runtime post-startup behavior.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcms/module/nodics
 * @description WCMS module lifecycle entrypoint for workflow-enabled content management features.
 * @layer module
 * @owner wcms
 * @override Project content modules may contribute later lifecycle hooks for customer CMS behavior.
 */
module.exports = {
    /**
     * Initializes the WCMS module during module loading.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the WCMS module after module artifacts have loaded.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        if (typeof SERVICE !== 'undefined' && SERVICE.DefaultRuntimeLifecycleService) {
            SERVICE.DefaultRuntimeLifecycleService.registerContributor('wcmsStartupImport', {
                order: 760,
                timeoutMs: Number((CONFIG.get('wcmsStartupImport') || {}).timeoutMs || 60000),
                ready: () => this.importStartupData()
            });
        }
        return Promise.resolve(true);
    },

    /**
     * Imports WCMS-owned init data only after the runtime is marked started.
     *
     * @returns {Promise<boolean>} Resolves when startup import completes or is disabled.
     */
    importStartupData: function () {
        const policy = CONFIG.get('wcmsStartupImport') || {};
        if (policy.enabled === false || policy.importInitDataOnReady === false) return Promise.resolve(true);
        if (!SERVICE.DefaultImportService || typeof SERVICE.DefaultImportService.importInitData !== 'function') {
            return Promise.resolve(true);
        }
        return SERVICE.DefaultImportService.importInitData({
            tenant: CONFIG.get('defaultTenant') || 'default',
            modules: NODICS.getActiveModules(),
            source: policy.source || 'nodics.wcms.runtimeReady'
        }).then(() => true);
    }
};

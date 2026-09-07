/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotKnowledge
 * @description Registers governed non-public repository knowledge providers with Nodics Discovery.
 * @layer module
 * @owner generated
 * @override Later active modules may override lifecycle behavior without modifying this generated boundary.
 */
module.exports = {
    /**
     * Initializes this module boundary.
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization completes.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes this module boundary.
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization completes.
     */
    postInit: function (options) {
        ['README', 'AGENTS_CONTRACT', 'LLM_CONTRACT', 'SOURCE_CODE', 'CUSTOMER_PROJECT', 'CURATED_MEMORY'].forEach(sourceType => {
            SERVICE.DefaultDiscoverySourceRegistryService.register('COPILOT_KNOWLEDGE', sourceType, SERVICE.DefaultCopilotRepositoryKnowledgeSourceProviderService);
        });
        return Promise.resolve(true);
    }
};

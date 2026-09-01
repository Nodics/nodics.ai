/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/service/defaultWcmsExperienceIndexStatusService
 * @description Reports WCMS Experience projection health for Axis diagnostics.
 * @layer service
 * @owner wcmsExperience
 * @override Later modules may connect this status seam to real Discovery/Elasticsearch index metadata.
 */
module.exports = {
    /** Returns current index status. @param {Object} request Nodics request. @returns {Promise<Object>} Status payload. */
    getStatus: function (request) {
        let config = typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('wcmsExperience') || {}) : {};
        return Promise.resolve({
            status: 'UNKNOWN',
            indexingMode: config.indexing && config.indexing.mode || 'OUTBOX_EVENTUAL',
            stagedAliasTemplate: config.indexing && config.indexing.stagedAliasTemplate,
            onlineAliasTemplate: config.indexing && config.indexing.onlineAliasTemplate,
            message: 'WCMS Experience index status provider is not connected yet.'
        });
    }
};

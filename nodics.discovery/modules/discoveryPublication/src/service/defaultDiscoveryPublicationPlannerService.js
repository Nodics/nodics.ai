/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module discoveryPublication/service/defaultDiscoveryPublicationPlannerService @description Creates generic Discovery publication plans from index configuration and publication policy. @layer service @owner discoveryPublication */
module.exports = {
    /** Builds a generic publication plan. @param {Object} request Publication request. @returns {Object} Plan. */
    plan: function (request) {
        let defaults = ((CONFIG.get('discovery') || {}).publication) || {};
        let policy = request.publicationPolicy || {};
        return {
            tenant: request.tenant,
            ownerType: request.ownerType,
            indexConfigurationCode: request.indexConfiguration && request.indexConfiguration.code,
            indexName: request.indexConfiguration && request.indexConfiguration.indexName,
            batchSize: Number(policy.batchSize || defaults.defaultBatchSize || 100),
            aliasSwitch: policy.aliasSwitch !== undefined ? policy.aliasSwitch : defaults.aliasSwitchEnabled !== false,
            rollbackEnabled: policy.rollbackEnabled !== undefined ? policy.rollbackEnabled : defaults.rollbackEnabled !== false
        };
    }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoveryConfig/config/properties @description Defines generic Discovery configuration defaults and schema access policies. @layer config @owner discoveryConfig */
module.exports = {
    discovery: {
        config: {
            defaultEngine: 'elastic',
            supportedOwnerTypes: ['PRODUCT', 'CONTENT', 'PAGE', 'MEDIA', 'DOCUMENTATION'],
            supportedIndexTypes: ['SEARCH', 'SUGGEST', 'DETAIL', 'FACET'],
            supportedStatuses: ['DRAFT', 'READY', 'APPROVED', 'CURRENT', 'RETIRED']
        }
    },
    schemaPolicies: {
        discoveryConfig: {
            operational: { accessGroups: { adminGroup: 10, runtimeConfigAdminUserGroup: 10, serviceAccountUserGroup: 10 } },
            tenantOwned: { accessGroups: { adminGroup: 10, runtimeConfigAdminUserGroup: 10, serviceAccountUserGroup: 10 } }
        }
    }
};

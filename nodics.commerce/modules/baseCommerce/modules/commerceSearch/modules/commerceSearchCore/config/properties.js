/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module commerceSearchCore/config/properties @description Defines Commerce Search runtime policy and schema access. @layer config @owner commerceSearchCore */
module.exports = {
    commerceSearch: {
        enabled: true,
        ranking: {
            enabled: true,
            searchIndexName: 'commerceSearchRuleProjection',
            maximumRulesPerRequest: 50,
            maximumActionsPerRule: 200,
            actionWeights: { BOOST: 1000, BURY: -1000 },
            supportedActionTypes: ['PIN', 'BOOST', 'BURY'],
            supportedScopeTypes: ['GLOBAL', 'CATEGORY', 'SEARCH_TERM']
        }
    },
    schemaPolicies: { commerceSearchCore: {
        operational: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        tenantOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } }
    } }
};

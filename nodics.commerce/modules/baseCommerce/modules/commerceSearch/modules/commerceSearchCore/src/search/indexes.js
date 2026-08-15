/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module commerceSearchCore/search/indexes
 * @description Contributes Commerce Search rule projection index to nSearch.
 * @layer search
 * @owner commerceSearchCore
 */
module.exports = {
    commerceSearchCore: {
        commerceSearchRuleProjection: {
            enabled: true,
            schemaName: 'commerceSearchRuleProjection',
            idPropertyName: 'code',
            tenantPropertyName: 'tenant',
            partitionProperties: ['tenant', 'storeCode', 'locale'],
            cache: { enabled: true, ttl: 300 },
            properties: {
                storeCode: { enabled: true, type: 'keyword' },
                locale: { enabled: true, type: 'keyword' },
                scopeType: { enabled: true, type: 'keyword' },
                categoryCode: { enabled: true, type: 'keyword' },
                searchTerm: { enabled: true, type: 'keyword' },
                status: { enabled: true, type: 'keyword' },
                actions: { enabled: true, type: 'object' },
                priority: { enabled: true, type: 'integer' },
                sourceHash: { enabled: true, type: 'keyword' }
            }
        }
    }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module discoveryProjection/search/indexes
 * @description Contributes the provider-neutral generic Discovery document projection index to nSearch.
 * @layer search
 * @owner discoveryProjection
 */
module.exports = {
    discoveryProjection: {
        discoveryDocumentProjection: {
            enabled: true,
            schemaName: 'discoveryDocumentProjection',
            idPropertyName: 'code',
            tenantPropertyName: 'tenant',
            partitionProperties: ['tenant', 'ownerType', 'indexConfigurationCode', 'storeCode', 'locale'],
            cache: { enabled: true, ttl: 300 },
            properties: {
                ownerType: { enabled: true, type: 'keyword' },
                ownerCode: { enabled: true, type: 'keyword' },
                indexConfigurationCode: { enabled: true, type: 'keyword' },
                storeCode: { enabled: true, type: 'keyword' },
                locale: { enabled: true, type: 'keyword' },
                status: { enabled: true, type: 'keyword' },
                sourceHash: { enabled: true, type: 'keyword' },
                projectedAt: { enabled: true, type: 'date' },
                site: { enabled: true, type: 'keyword' },
                pageType: { enabled: true, type: 'keyword' },
                slot: { enabled: true, type: 'keyword' },
                targetType: { enabled: true, type: 'keyword' },
                targetCode: { enabled: true, type: 'keyword' },
                channel: { enabled: true, type: 'keyword' },
                device: { enabled: true, type: 'keyword' },
                region: { enabled: true, type: 'keyword' },
                publicationStatus: { enabled: true, type: 'keyword' },
                deliveryStatus: { enabled: true, type: 'keyword' },
                specificity: { enabled: true, type: 'integer' },
                priority: { enabled: true, type: 'integer' },
                release: { enabled: true, type: 'keyword' },
                indexVersion: { enabled: true, type: 'keyword' },
                payload: { enabled: true, type: 'object' }
            }
        }
    }
};

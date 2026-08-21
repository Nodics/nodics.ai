/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module product/search/indexes
 * @description Contributes the provider-neutral localized Product projection index to nSearch.
 * @layer search
 * @owner product
 * @override Later modules may extend fields or analyzer aliases through layered Product and nSearch configuration.
 */
module.exports = {
    product: {
        productLocalized: {
            enabled: true,
            schemaName: 'productSearchProjection',
            idPropertyName: 'code',
            tenantPropertyName: 'tenant',
            partitionProperties: ['tenant', 'storeCode', 'locale'],
            cache: { enabled: false, ttl: 300 },
            properties: {
                productCode: { enabled: true, type: 'keyword' },
                storeCode: { enabled: true, type: 'keyword' },
                locale: { enabled: true, type: 'keyword' },
                status: { enabled: true, type: 'keyword' },
                sourceHash: { enabled: true, type: 'keyword' },
                payload: { enabled: true, type: 'object' }
            }
        }
    }
};

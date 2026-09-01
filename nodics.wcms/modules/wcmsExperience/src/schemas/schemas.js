/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/schemas/schemas
 * @description Reserved schema contribution for WCMS Experience placements and delivery projection metadata.
 * @layer schema
 * @owner wcmsExperience
 * @override Project modules may extend placement metadata through later schema layers.
 */
module.exports = {
    wcmsExperience: {
        cmsExperiencePlacement: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: false
            },
            cache: {
                enabled: true,
                ttl: 10000
            },
            search: {
                enabled: false,
                idPropertyName: 'code'
            },
            definition: {
                code: { type: 'string', required: true },
                site: { type: 'string', required: true },
                pageType: { type: 'string', required: true },
                slot: { type: 'string', required: true },
                targetType: { type: 'string', required: true },
                targetCode: { type: 'string', required: true },
                component: { type: 'string', required: true },
                rendererKey: { type: 'string' },
                contractVersion: { type: 'number', default: 1 },
                properties: { type: 'object' },
                media: { type: 'array' },
                release: { type: 'string' },
                indexVersion: { type: 'string' },
                specificity: { type: 'number', default: 0 },
                priority: { type: 'number', default: 0 },
                locale: { type: 'string' },
                channel: { type: 'string' },
                region: { type: 'string' },
                device: { type: 'string' },
                customerSegments: { type: 'array' },
                validFrom: { type: 'date' },
                validTo: { type: 'date' },
                fallbackComponent: { type: 'string' },
                publicationStatus: { type: 'string', default: 'STAGED' },
                deliveryStatus: { type: 'string', default: 'ACTIVE' },
                revision: { type: 'number', default: 0 }
            }
        }
    }
};

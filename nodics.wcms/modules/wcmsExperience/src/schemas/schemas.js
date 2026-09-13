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
            router: { groups: { schemaOperations: true },
                enabled: true
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
                code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
                site: { type: 'string', required: true , description: 'Stores the site value used by this record.'},
                pageType: { type: 'string', required: true , description: 'Classifies this record by page type for validation and business handling.'},
                slot: { type: 'string', required: true , description: 'Stores the slot value used by this record.'},
                targetType: { type: 'string', required: true , description: 'Classifies this record by target type for validation and business handling.'},
                targetCode: { type: 'string', required: true , description: 'Stores the target code used to classify, link, or resolve this record.'},
                component: { type: 'string', required: true , description: 'Stores the component value used by this record.'},
                rendererKey: { type: 'string' , description: 'Stores the renderer key value used by this record.'},
                contractVersion: { type: 'number', default: 1 , description: 'Stores the numeric contract version used by this record.'},
                properties: { type: 'object' , description: 'Stores structured properties details used by this record.'},
                media: { type: 'array' , description: 'Lists the media associated with this record.'},
                release: { type: 'string' , description: 'Stores the release value used by this record.'},
                indexVersion: { type: 'string' , description: 'Stores the index version value used by this record.'},
                specificity: { type: 'number', default: 0 , description: 'Stores the numeric specificity used by this record.'},
                priority: { type: 'number', default: 0 , description: 'Stores the numeric priority used by this record.'},
                locale: { type: 'string' , description: 'Stores the locale code used for language, formatting, and regional behavior.'},
                channel: { type: 'string' , description: 'Stores the channel value used by this record.'},
                region: { type: 'string' , description: 'Stores the region value used by this record.'},
                device: { type: 'string' , description: 'Stores the device value used by this record.'},
                customerSegments: { type: 'array' , description: 'Lists the customer segments associated with this record.'},
                validFrom: { type: 'date' , description: 'Records when the valid from event or value applies.'},
                validTo: { type: 'date' , description: 'Records when the valid to event or value applies.'},
                fallbackComponent: { type: 'string' , description: 'Stores the fallback component value used by this record.'},
                publicationStatus: { type: 'string', default: 'STAGED' , description: 'Stores the publication status value, using the configured default when no explicit value is provided.'},
                deliveryStatus: { type: 'string', default: 'ACTIVE' , description: 'Stores the delivery status value, using the configured default when no explicit value is provided.'},
                revision: { type: 'number', default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
            }
        }
    }
};

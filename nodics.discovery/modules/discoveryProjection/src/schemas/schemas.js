/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoveryProjection/src/schemas/schemas @description Defines generic Discovery document projection schema. @layer schema @owner discoveryProjection */
module.exports = { discoveryProjection: {
    discoveryDocumentProjection: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { search: { enabled: true, idPropertyName: 'code' }, definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        ownerType: { type: 'string', required: true , description: 'Classifies the type of owner responsible for this record.'},
        ownerCode: { type: 'string', required: true , description: 'Stores the owner code used to classify, link, or resolve this record.'},
        indexConfigurationCode: { type: 'string', required: true , description: 'Stores the index configuration code used to classify, link, or resolve this record.'},
        storeCode: { type: 'string', required: false , description: 'Stores the store code used to classify, link, or resolve this record.'},
        locale: { type: 'string', required: false , description: 'Stores the locale code used for language, formatting, and regional behavior.'},
        status: { type: 'string', required: true, enum: ['CURRENT', 'WITHDRAWN'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        site: { type: 'string', required: false , description: 'Stores the site value used by this record.'},
        pageType: { type: 'string', required: false , description: 'Classifies this record by page type for validation and business handling.'},
        slot: { type: 'string', required: false , description: 'Stores the slot value used by this record.'},
        targetType: { type: 'string', required: false , description: 'Classifies this record by target type for validation and business handling.'},
        targetCode: { type: 'string', required: false , description: 'Stores the target code used to classify, link, or resolve this record.'},
        channel: { type: 'string', required: false , description: 'Stores the channel value used by this record.'},
        device: { type: 'string', required: false , description: 'Stores the device value used by this record.'},
        region: { type: 'string', required: false , description: 'Stores the region value used by this record.'},
        publicationStatus: { type: 'string', required: false , description: 'Stores the publication status value used by this record.'},
        deliveryStatus: { type: 'string', required: false , description: 'Stores the delivery status value used by this record.'},
        specificity: { type: 'number', required: false , description: 'Stores the numeric specificity used by this record.'},
        priority: { type: 'number', required: false , description: 'Stores the numeric priority used by this record.'},
        release: { type: 'string', required: false , description: 'Stores the release value used by this record.'},
        indexVersion: { type: 'string', required: false , description: 'Stores the index version value used by this record.'},
        payload: { type: 'object', required: true , description: 'Stores structured payload details used by this record.'},
        sourceHash: { type: 'string', required: true , description: 'Stores a fingerprint of the source data used to detect changes or duplicates.'},
        projectedAt: { type: 'date', required: true , description: 'Records when the projected event or value applies.'}
    } })
} };

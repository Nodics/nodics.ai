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
        code: { type: 'string', required: true },
        tenant: { type: 'string', required: true },
        ownerType: { type: 'string', required: true },
        ownerCode: { type: 'string', required: true },
        indexConfigurationCode: { type: 'string', required: true },
        storeCode: { type: 'string', required: false },
        locale: { type: 'string', required: false },
        status: { type: 'string', required: true, enum: ['CURRENT', 'WITHDRAWN'] },
        site: { type: 'string', required: false },
        pageType: { type: 'string', required: false },
        slot: { type: 'string', required: false },
        targetType: { type: 'string', required: false },
        targetCode: { type: 'string', required: false },
        channel: { type: 'string', required: false },
        device: { type: 'string', required: false },
        region: { type: 'string', required: false },
        publicationStatus: { type: 'string', required: false },
        deliveryStatus: { type: 'string', required: false },
        specificity: { type: 'number', required: false },
        priority: { type: 'number', required: false },
        release: { type: 'string', required: false },
        indexVersion: { type: 'string', required: false },
        payload: { type: 'object', required: true },
        sourceHash: { type: 'string', required: true },
        projectedAt: { type: 'date', required: true }
    } })
} };

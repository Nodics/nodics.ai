/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationProjection/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { locationProjection: {
    locationMarkerProjection: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: true, idPropertyName: 'code' } }, { definition: {
        code: { type: 'string', required: true },
        locationCode: { type: 'string', required: true },
        layerCode: { type: 'string', required: true },
        latitude: { type: 'number', required: true },
        longitude: { type: 'number', required: true },
        label: { type: 'object', required: true },
        marker: { type: 'object', required: true },
        visibility: { type: 'object', required: true },
        sourceRef: { type: 'object', required: true },
        sourceHash: { type: 'string', required: true },
        projectedAt: { type: 'date', required: true },
        status: { type: 'string', required: true, enum: ['CURRENT', 'STALE', 'WITHDRAWN'] }
    } })
} };

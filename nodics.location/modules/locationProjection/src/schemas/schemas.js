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
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        locationCode: { type: 'string', required: true , description: 'Stores the location code used to classify, link, or resolve this record.'},
        layerCode: { type: 'string', required: true , description: 'Stores the layer code used to classify, link, or resolve this record.'},
        latitude: { type: 'number', required: true , description: 'Stores the numeric latitude used by this record.'},
        longitude: { type: 'number', required: true , description: 'Stores the numeric longitude used by this record.'},
        label: { type: 'object', required: true , description: 'Stores structured label details used by this record.'},
        marker: { type: 'object', required: true , description: 'Stores structured marker details used by this record.'},
        visibility: { type: 'object', required: true , description: 'Stores structured visibility details used by this record.'},
        sourceRef: { type: 'object', required: true , description: 'References the related source record used by this record.'},
        sourceHash: { type: 'string', required: true , description: 'Stores a fingerprint of the source data used to detect changes or duplicates.'},
        projectedAt: { type: 'date', required: true , description: 'Records when the projected event or value applies.'},
        status: { type: 'string', required: true, enum: ['CURRENT', 'STALE', 'WITHDRAWN'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}
    } })
} };

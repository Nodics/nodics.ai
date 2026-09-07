/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationMap/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { locationMap: {
    locationMapProvider: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        providerType: { type: 'string', required: true, enum: ['MAPBOX', 'OSM', 'GOOGLE_MAPS', 'HERE', 'ESRI', 'CUSTOM'] },
        rendererCode: { type: 'string', required: true },
        rendererType: { type: 'string', required: true, enum: ['MAPBOX_GL', 'XYZ_TILE', 'EXTERNAL_ADAPTER', 'CUSTOM'] },
        requiresPublicAccessToken: { type: 'bool', required: true, default: false },
        frontendSafeTokenPrefix: { type: 'string', required: false },
        endpointPolicy: { type: 'object', required: false },
        status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    locationMapUsage: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        surfaceCodes: { type: 'array', required: false },
        description: { type: 'object', required: false },
        status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    locationMapStylePreset: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        providerCode: { type: 'string', required: true },
        name: { type: 'object', required: true },
        styleUrl: { type: 'string', required: true },
        attribution: { type: 'string', required: false },
        status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    locationMapControlPreset: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        enabledControls: { type: 'array', required: false },
        status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    locationMapProviderConfiguration: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        providerCode: { type: 'string', required: true },
        surfaceCode: { type: 'string', required: true },
        usageCode: { type: 'string', required: true },
        stylePresetCode: { type: 'string', required: false },
        styleUrl: { type: 'string', required: false },
        publicAccessToken: { type: 'string', required: false },
        tokenReference: { type: 'string', required: false },
        fallbackProviderCode: { type: 'string', required: false },
        fallbackPolicy: { type: 'string', required: true, enum: ['NONE', 'SETUP_REQUIRED', 'ALLOW_BASIC_MAP', 'NON_PRODUCTION_ONLY'] },
        defaultCenterLatitude: { type: 'number', required: true },
        defaultCenterLongitude: { type: 'number', required: true },
        defaultZoom: { type: 'number', required: true },
        minimumZoom: { type: 'number', required: false },
        maximumZoom: { type: 'number', required: false },
        controlPresetCode: { type: 'string', required: false },
        enabledControls: { type: 'array', required: false },
        frontendSafe: { type: 'bool', required: true, default: true },
        setupStatus: { type: 'string', required: true, enum: ['SETUP_REQUIRED', 'ACTIVE', 'INACTIVE', 'INVALID', 'ARCHIVED'] },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    locationMapLayer: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        categoryCodes: { type: 'array', required: false },
        typeCodes: { type: 'array', required: false },
        capabilityCodes: { type: 'array', required: false },
        defaultVisible: { type: 'bool', required: true, default: true },
        clusteringEnabled: { type: 'bool', required: true, default: true },
        presentation: { type: 'object', required: false },
        visibility: { type: 'object', required: true },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 }
    } })
} };

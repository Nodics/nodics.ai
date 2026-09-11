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
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        providerType: { type: 'string', required: true, enum: ['MAPBOX', 'OSM', 'GOOGLE_MAPS', 'HERE', 'ESRI', 'CUSTOM'] , description: 'Classifies this record by provider type for validation and business handling.'},
        rendererCode: { type: 'string', required: true , description: 'Stores the renderer code used to classify, link, or resolve this record.'},
        rendererType: { type: 'string', required: true, enum: ['MAPBOX_GL', 'XYZ_TILE', 'EXTERNAL_ADAPTER', 'CUSTOM'] , description: 'Classifies this record by renderer type for validation and business handling.'},
        requiresPublicAccessToken: { type: 'bool', required: true, default: false , description: 'Indicates whether public access token applies for this record.'},
        frontendSafeTokenPrefix: { type: 'string', required: false , description: 'Stores the frontend safe token prefix value used by this record.'},
        endpointPolicy: { type: 'object', required: false , description: 'Defines the endpoint policy that controls how this record is handled.'},
        status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    locationMapUsage: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        surfaceCodes: { type: 'array', required: false , description: 'Lists surface codes used to classify, link, or resolve this record.'},
        description: { type: 'object', required: false , description: 'Explains the business purpose, usage, or administrative meaning of this record.'},
        status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    locationMapStylePreset: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        providerCode: { type: 'string', required: true , description: 'Stores the provider code used to classify, link, or resolve this record.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        styleUrl: { type: 'string', required: true , description: 'Stores the style url value used by this record.'},
        attribution: { type: 'string', required: false , description: 'Stores the attribution value used by this record.'},
        status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    locationMapControlPreset: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        enabledControls: { type: 'array', required: false , description: 'Indicates whether controls applies for this record.'},
        status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    locationMapProviderConfiguration: Object.assign({ super: 'base', model: true, backoffice: { concurrency: { managed: true, field: 'revision' } }, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        providerCode: { type: 'string', required: true , description: 'Stores the provider code used to classify, link, or resolve this record.'},
        surfaceCode: { type: 'string', required: true , description: 'Stores the surface code used to classify, link, or resolve this record.'},
        usageCode: { type: 'string', required: true , description: 'Stores the usage code used to classify, link, or resolve this record.'},
        stylePresetCode: { type: 'string', required: false , description: 'Stores the style preset code used to classify, link, or resolve this record.'},
        styleUrl: { type: 'string', required: false , description: 'Stores the style url value used by this record.'},
        publicAccessToken: { type: 'string', required: false , description: 'Stores the public access token value used by this record.'},
        tokenReference: { type: 'string', required: false , description: 'Stores the token reference value used by this record.'},
        fallbackProviderCode: { type: 'string', required: false , description: 'Stores the fallback provider code used to classify, link, or resolve this record.'},
        fallbackPolicy: { type: 'string', required: true, enum: ['NONE', 'SETUP_REQUIRED', 'ALLOW_BASIC_MAP', 'NON_PRODUCTION_ONLY'] , description: 'Defines the fallback policy that controls how this record is handled.'},
        defaultCenterLatitude: { type: 'number', required: true , description: 'Stores the numeric default center latitude used by this record.'},
        defaultCenterLongitude: { type: 'number', required: true , description: 'Stores the numeric default center longitude used by this record.'},
        defaultZoom: { type: 'number', required: true , description: 'Stores the numeric default zoom used by this record.'},
        minimumZoom: { type: 'number', required: false , description: 'Stores the numeric minimum zoom used by this record.'},
        maximumZoom: { type: 'number', required: false , description: 'Stores the numeric maximum zoom used by this record.'},
        controlPresetCode: { type: 'string', required: false , description: 'Stores the control preset code used to classify, link, or resolve this record.'},
        enabledControls: { type: 'array', required: false , description: 'Indicates whether controls applies for this record.'},
        frontendSafe: { type: 'bool', required: true, default: true , description: 'Indicates whether frontend safe applies for this record.'},
        setupStatus: { type: 'string', required: true, enum: ['SETUP_REQUIRED', 'ACTIVE', 'INACTIVE', 'INVALID', 'ARCHIVED'] , description: 'Selects the setup status value used to drive validation, filtering, and business behavior.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        presentation: { type: 'object', required: false, description: 'Shared declarative marker categories, colors, labels and default category for every consumer of this usage.' },
        interaction: { type: 'object', required: false, description: 'Shared wheel zoom mode, step, pacing and animation duration for every map renderer.' },
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    locationMapLayer: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        categoryCodes: { type: 'array', required: false , description: 'Lists category codes used to classify, link, or resolve this record.'},
        typeCodes: { type: 'array', required: false , description: 'Lists type codes used to classify, link, or resolve this record.'},
        capabilityCodes: { type: 'array', required: false , description: 'Lists capability codes used to classify, link, or resolve this record.'},
        defaultVisible: { type: 'bool', required: true, default: true , description: 'Indicates whether default visible applies for this record.'},
        clusteringEnabled: { type: 'bool', required: true, default: true , description: 'Indicates whether clustering enabled applies for this record.'},
        presentation: { type: 'object', required: false , description: 'Stores structured presentation details used by this record.'},
        visibility: { type: 'object', required: true , description: 'Stores structured visibility details used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } })
} };

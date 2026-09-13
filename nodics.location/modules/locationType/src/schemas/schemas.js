/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationType/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { locationType: {
    locationCategory: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        description: { type: 'object', required: false , description: 'Explains the business purpose, usage, or administrative meaning of this record.'},
        defaultCapabilityCodes: { type: 'array', required: false , description: 'Lists default capability codes used to classify, link, or resolve this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    locationType: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        categoryCode: { type: 'string', required: true , description: 'Stores the category code used to classify, link, or resolve this record.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        description: { type: 'object', required: false , description: 'Explains the business purpose, usage, or administrative meaning of this record.'},
        defaultCapabilityCodes: { type: 'array', required: false , description: 'Lists default capability codes used to classify, link, or resolve this record.'},
        defaultPresentation: { type: 'object', required: false , description: 'Stores structured default presentation details used by this record.'},
        registrationSource: { type: 'object', required: false , description: 'Stores structured registration source details used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    locationCapability: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        description: { type: 'object', required: false , description: 'Explains the business purpose, usage, or administrative meaning of this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } })
} };

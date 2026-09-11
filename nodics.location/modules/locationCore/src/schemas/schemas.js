/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationCore/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */


module.exports = { locationCore: {
    location: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        categoryCode: { type: 'string', required: true , description: 'Stores the category code used to classify, link, or resolve this record.'},
        typeCode: { type: 'string', required: true , description: 'Stores the type code used to classify, link, or resolve this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        latitude: { type: 'number', required: true , description: 'Stores the numeric latitude used by this record.'},
        longitude: { type: 'number', required: true , description: 'Stores the numeric longitude used by this record.'},
        addressRef: { type: 'object', required: true , description: 'References the related address record used by this record.'},
        contactRefs: { type: 'array', required: false , description: 'Lists related contact records used by this record.'},
        openingHours: { type: 'object', required: false , description: 'Stores structured opening hours details used by this record.'},
        capabilityCodes: { type: 'array', required: false , description: 'Lists capability codes used to classify, link, or resolve this record.'},
        visibility: { type: 'object', required: true , description: 'Stores structured visibility details used by this record.'},
        sourceRef: { type: 'object', required: true , description: 'References the related source record used by this record.'},
        parentLocationCode: { type: 'string', required: false , description: 'Stores the parent location code used to classify, link, or resolve this record.'},
        enterpriseRef: { type: 'object', required: false , description: 'References the related enterprise record used by this record.'},
        operatorEnterpriseRef: { type: 'object', required: false , description: 'References the related operator enterprise record used by this record.'},
        mediaRefs: { type: 'array', required: false , description: 'Lists related media records used by this record.'},
        presentation: { type: 'object', required: false , description: 'Stores structured presentation details used by this record.'},
        quality: { type: 'object', required: false , description: 'Stores structured quality details used by this record.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    }, refSchema: {
        addressRef: {"enabled":true,"moduleName":"profile","schemaName":"address","type":"one","propertyName":"code"},
        contactRefs: {"enabled":true,"moduleName":"profile","schemaName":"contact","type":"many","propertyName":"code"},
        enterpriseRef: {"enabled":true,"moduleName":"profile","schemaName":"enterprise","type":"one","propertyName":"code"},
        operatorEnterpriseRef: {"enabled":true,"moduleName":"profile","schemaName":"enterprise","type":"one","propertyName":"code"},
        mediaRefs: {"enabled":true,"moduleName":"media","schemaName":"media","type":"many","propertyName":"code"}
    } })
} };

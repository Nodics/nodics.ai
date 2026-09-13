/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module electronicsProduct/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { electronicsProduct: {
    electronicsSpecificationProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, productCode: { type: 'string', required: true , description: 'Stores the product code used to classify, link, or resolve this record.'}, brandCode: { type: 'string', required: false , description: 'Stores the brand code used to classify, link, or resolve this record.'}, modelNumber: { type: 'string', required: false , description: 'Stores the model number value used by this record.'},
        specificationFamilyCode: { type: 'string', required: true , description: 'Stores the specification family code used to classify, link, or resolve this record.'}, specifications: { type: 'object', required: true , description: 'Stores structured specifications details used by this record.'}, compatibilityProfileCodes: { type: 'array', required: false , description: 'Lists compatibility profile codes used to classify, link, or resolve this record.'}, warrantyProfileCode: { type: 'string', required: false , description: 'Stores the warranty profile code used to classify, link, or resolve this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    }, indexes: { composite: { tenant: { enabled: true, name: 'tenant', options: { unique: true } }, productCode: { enabled: true, name: 'productCode', options: { unique: true } } } } }),
    electronicsCompatibilityProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, compatibilityType: { type: 'string', required: true , description: 'Classifies this record by compatibility type for validation and business handling.'}, requiredValues: { type: 'object', required: false , description: 'Indicates whether values applies for this record.'}, supportedValues: { type: 'object', required: true , description: 'Stores structured supported values details used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } }),
    electronicsWarrantyProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, duration: { type: 'int', required: true , description: 'Stores the numeric duration used by this record.'}, durationUnit: { type: 'string', required: true, enum: ['DAY', 'MONTH', 'YEAR'] , description: 'Selects the duration unit value used to drive validation, filtering, and business behavior.'},
        coverage: { type: 'array', required: true , description: 'Lists the coverage associated with this record.'}, exclusions: { type: 'array', required: false , description: 'Lists the exclusions associated with this record.'}, providerCode: { type: 'string', required: false , description: 'Stores the provider code used to classify, link, or resolve this record.'}, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } }),
    electronicsDeviceIdentityPolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, productCode: { type: 'string', required: true , description: 'Stores the product code used to classify, link, or resolve this record.'}, identifierTypes: { type: 'array', required: true , description: 'Lists the identifier types that apply to this record.'}, capturePoint: { type: 'string', required: true, enum: ['RECEIPT', 'RESERVATION', 'FULFILLMENT', 'ACTIVATION'] , description: 'Selects the capture point value used to drive validation, filtering, and business behavior.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } })
} };

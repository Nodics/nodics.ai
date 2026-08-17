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
    electronicsSpecificationProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, productCode: { type: 'string', required: true }, brandCode: { type: 'string', required: false }, modelNumber: { type: 'string', required: false },
        specificationFamilyCode: { type: 'string', required: true }, specifications: { type: 'object', required: true }, compatibilityProfileCodes: { type: 'array', required: false }, warrantyProfileCode: { type: 'string', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true }
    }, indexes: { composite: { tenant: { enabled: true, name: 'tenant', options: { unique: true } }, productCode: { enabled: true, name: 'productCode', options: { unique: true } } } } }),
    electronicsCompatibilityProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, compatibilityType: { type: 'string', required: true }, requiredValues: { type: 'object', required: false }, supportedValues: { type: 'object', required: true },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true }
    } }),
    electronicsWarrantyProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, duration: { type: 'int', required: true }, durationUnit: { type: 'string', required: true, enum: ['DAY', 'MONTH', 'YEAR'] },
        coverage: { type: 'array', required: true }, exclusions: { type: 'array', required: false }, providerCode: { type: 'string', required: false }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true }
    } }),
    electronicsDeviceIdentityPolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, productCode: { type: 'string', required: true }, identifierTypes: { type: 'array', required: true }, capturePoint: { type: 'string', required: true, enum: ['RECEIPT', 'RESERVATION', 'FULFILLMENT', 'ACTIVATION'] },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true }
    } })
} };

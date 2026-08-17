/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module apparelProduct/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { apparelProduct: {
    apparelStyle: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, productCode: { type: 'string', required: true }, brandCode: { type: 'string', required: false },
        collectionCodes: { type: 'array', required: false }, seasonCode: { type: 'string', required: false }, genderAudience: { type: 'array', required: false }, ageGroup: { type: 'string', required: false },
        fitProfileCode: { type: 'string', required: false }, sizeSystemCode: { type: 'string', required: true }, materialComposition: { type: 'array', required: false }, careInstructions: { type: 'array', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true }
    }, indexes: { composite: { tenant: { enabled: true, name: 'tenant', options: { unique: true } }, productCode: { enabled: true, name: 'productCode', options: { unique: true } } } } }),
    apparelVariantProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, productCode: { type: 'string', required: true }, variantCode: { type: 'string', required: true },
        colourCode: { type: 'string', required: true }, colourFamily: { type: 'string', required: false }, swatchMediaCode: { type: 'string', required: false }, sizeCode: { type: 'string', required: true },
        sizeSystemCode: { type: 'string', required: true }, fitCode: { type: 'string', required: false }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true }
    }, indexes: { composite: { tenant: { enabled: true, name: 'tenant', options: { unique: true } }, variantCode: { enabled: true, name: 'variantCode', options: { unique: true } } } } }),
    apparelSizeSystem: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, systemType: { type: 'string', required: true, enum: ['ALPHA', 'EU', 'UK', 'US', 'AGE', 'ONE_SIZE'] },
        sizeCodes: { type: 'array', required: true }, measurements: { type: 'object', required: false }, localeLabels: { type: 'object', required: false }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true }
    } }),
    apparelFitProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, fitType: { type: 'string', required: true }, guidance: { type: 'object', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true }
    } })
} };

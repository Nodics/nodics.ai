/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module telcoCatalog/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { telcoCatalog: {
    telcoPlanOffering: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, productCode: { type: 'string', required: true , description: 'Stores the product code used to classify, link, or resolve this record.'}, planType: { type: 'string', required: true, enum: ['PREPAID', 'POSTPAID'] , description: 'Classifies this record by plan type for validation and business handling.'},
        allowanceCodes: { type: 'array', required: true , description: 'Lists allowance codes used to classify, link, or resolve this record.'}, billingCycle: { type: 'string', required: false , description: 'Stores the billing cycle value used by this record.'}, minimumTermMonths: { type: 'int', required: false , description: 'Stores the numeric minimum term months used by this record.'}, activationFee: { type: 'object', required: false , description: 'Stores structured activation fee details used by this record.'},
        compatibleDeviceProfileCodes: { type: 'array', required: false , description: 'Lists compatible device profile codes used to classify, link, or resolve this record.'}, simTypes: { type: 'array', required: true , description: 'Lists the sim types that apply to this record.'}, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } }),
    telcoAllowance: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, allowanceType: { type: 'string', required: true, enum: ['DATA', 'VOICE', 'SMS', 'ROAMING'] , description: 'Classifies this record by allowance type for validation and business handling.'}, amount: { type: 'string', required: true , description: 'Stores the amount value used by this record.'}, unit: { type: 'string', required: true , description: 'Stores the unit value used by this record.'}, rolloverPolicy: { type: 'object', required: false , description: 'Defines the rollover policy that controls how this record is handled.'}, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } })
} };

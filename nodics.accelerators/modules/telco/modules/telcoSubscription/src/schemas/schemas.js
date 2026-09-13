/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module telcoSubscription/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { telcoSubscription: {
    telcoSubscription: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, customerCode: { type: 'string', required: true , description: 'Stores the customer code used to classify, link, or resolve this record.'}, planOfferingCode: { type: 'string', required: true , description: 'Stores the plan offering code used to classify, link, or resolve this record.'}, deviceProductCode: { type: 'string', required: false , description: 'Stores the device product code used to classify, link, or resolve this record.'},
        simType: { type: 'string', required: true, enum: ['SIM', 'ESIM'] , description: 'Classifies this record by sim type for validation and business handling.'}, numberIntentCode: { type: 'string', required: true , description: 'Stores the number intent code used to classify, link, or resolve this record.'}, status: { type: 'string', required: true, enum: ['DRAFT', 'PENDING_ACTIVATION', 'ACTIVE', 'SUSPENDED', 'CANCELLED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } }),
    telcoNumberIntent: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, intentType: { type: 'string', required: true, enum: ['NEW_NUMBER', 'PORT_IN', 'RETAIN_NUMBER'] , description: 'Classifies this record by intent type for validation and business handling.'}, requestedNumber: { type: 'string', required: false , description: 'Stores the requested number value used by this record.'}, portabilityEvidence: { type: 'object', required: false , description: 'Stores structured portability evidence details used by this record.'}, status: { type: 'string', required: true, enum: ['DRAFT', 'VALIDATED', 'RESERVED', 'COMPLETED', 'REJECTED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } })
} };

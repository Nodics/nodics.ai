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
    telcoPlanOffering: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, productCode: { type: 'string', required: true }, planType: { type: 'string', required: true, enum: ['PREPAID', 'POSTPAID'] },
        allowanceCodes: { type: 'array', required: true }, billingCycle: { type: 'string', required: false }, minimumTermMonths: { type: 'int', required: false }, activationFee: { type: 'object', required: false },
        compatibleDeviceProfileCodes: { type: 'array', required: false }, simTypes: { type: 'array', required: true }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true }
    } }),
    telcoAllowance: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, allowanceType: { type: 'string', required: true, enum: ['DATA', 'VOICE', 'SMS', 'ROAMING'] }, amount: { type: 'string', required: true }, unit: { type: 'string', required: true }, rolloverPolicy: { type: 'object', required: false }, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true }
    } })
} };

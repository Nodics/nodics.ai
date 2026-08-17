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
    telcoSubscription: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, customerCode: { type: 'string', required: true }, planOfferingCode: { type: 'string', required: true }, deviceProductCode: { type: 'string', required: false },
        simType: { type: 'string', required: true, enum: ['SIM', 'ESIM'] }, numberIntentCode: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['DRAFT', 'PENDING_ACTIVATION', 'ACTIVE', 'SUSPENDED', 'CANCELLED'] }, revision: { type: 'int', required: true }
    } }),
    telcoNumberIntent: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, intentType: { type: 'string', required: true, enum: ['NEW_NUMBER', 'PORT_IN', 'RETAIN_NUMBER'] }, requestedNumber: { type: 'string', required: false }, portabilityEvidence: { type: 'object', required: false }, status: { type: 'string', required: true, enum: ['DRAFT', 'VALIDATED', 'RESERVED', 'COMPLETED', 'REJECTED'] }, revision: { type: 'int', required: true }
    } })
} };

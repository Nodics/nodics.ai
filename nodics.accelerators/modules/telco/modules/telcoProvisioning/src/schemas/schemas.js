/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module telcoProvisioning/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { telcoProvisioning: {
    telcoServiceOrder: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, subscriptionCode: { type: 'string', required: true , description: 'Stores the subscription code used to classify, link, or resolve this record.'}, orderCode: { type: 'string', required: true , description: 'Stores the order code used to classify, link, or resolve this record.'}, idempotencyKey: { type: 'string', required: true , description: 'Stores the idempotency key value used by this record.'}, action: { type: 'string', required: true, enum: ['ACTIVATE', 'CHANGE_PLAN', 'SUSPEND', 'RESUME', 'CANCEL'] , description: 'Selects the action value used to drive validation, filtering, and business behavior.'}, status: { type: 'string', required: true, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'ACTION_REQUIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, providerEvidence: { type: 'object', required: false , description: 'Stores structured provider evidence details used by this record.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } })
} };

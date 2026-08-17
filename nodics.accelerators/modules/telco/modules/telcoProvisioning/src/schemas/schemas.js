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
        code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, subscriptionCode: { type: 'string', required: true }, orderCode: { type: 'string', required: true }, idempotencyKey: { type: 'string', required: true }, action: { type: 'string', required: true, enum: ['ACTIVATE', 'CHANGE_PLAN', 'SUSPEND', 'RESUME', 'CANCEL'] }, status: { type: 'string', required: true, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'ACTION_REQUIRED'] }, providerEvidence: { type: 'object', required: false }, revision: { type: 'int', required: true }
    } })
} };

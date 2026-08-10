/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module engagementComms/test/engagementCommsBoundaryContract @description Proves the active bridge is one-way, bounded, idempotent, content-free, and failure-isolating. @layer test @owner engagementComms */
const assert = require('assert'); const service = require('../src/service/defaultEngagementCommunicationService');
(async () => { let captured; let policy = { enabled: true, acknowledgementTemplates: { CONTACT: 'CONTACT_ACKNOWLEDGEMENT' }, allowedPurposes: ['TRANSACTIONAL'], defaultChannel: 'EMAIL' }; let context = { tenant: 't1', domainType: 'CONTACT', domainCode: 'C1', recipientId: 'u1', recipientAddressReference: 'profile:u1:email', channel: 'EMAIL', locale: 'en', variables: { reference: 'C1' }, correlationId: 'corr1' }; let result = await service.request(context, { request: async command => { captured = command; return { intentCode: 'I1', status: 'DELIVERED', providerReference: 'local-1', correlationId: command.correlationId }; } }, policy); assert.strictEqual(captured.sourceModule, 'contactSubmission'); assert.strictEqual(captured.idempotencyKey, 'engagement:CONTACT:C1:CONTACT_ACKNOWLEDGEMENT'); assert.deepStrictEqual(Object.keys(result).sort(), ['correlationId', 'intentCode', 'providerReference', 'status']); let failed = await service.request(Object.assign({}, context, { domainCode: 'C2' }), { request: async () => { throw new Error('provider offline'); } }, policy); assert.strictEqual(failed.status, 'DEFERRED'); assert.strictEqual(failed.domainStateChanged, false); console.log('Engagement communication bridge Phase 1C contract validated'); })().catch(error => { console.error(error); process.exitCode = 1; });

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('assert'); const service = require('../src/service/defaultCommunicationCoreService');
const policy = { allowedChannels: ['EMAIL', 'IN_APP'], maximumAttempts: 3, baseRetryMilliseconds: 1000, maximumRetryMilliseconds: 5000, rendering: { maximumVariables: 5, maximumRenderedBytes: 1000, rejectUnknownVariables: true } };
let template = { code: 'CONTACT_ACK', templateCode: 'CONTACT_ACK', version: 1, declaredVariables: ['reference'], subjectTemplate: 'Received {{reference}}', bodyTemplate: 'We received {{reference}}.' };
assert.strictEqual(service.render(template, { reference: 'C1' }, policy).body, 'We received C1.'); assert.throws(() => service.render(template, { secret: 'x' }, policy), /not declared/);
let command = { tenant: 't1', sourceModule: 'contactSubmission', sourceType: 'CONTACT', sourceCode: 'C1', recipientId: 'u1', recipientAddressReference: 'profile:u1:email', purpose: 'TRANSACTIONAL', channel: 'EMAIL', locale: 'en', variables: { reference: 'C1' }, idempotencyKey: 'i1', correlationId: 'c1' };
let created = service.intent(command, template, [], null, policy); assert.strictEqual(created.intent.status, 'ACCEPTED'); assert.strictEqual(service.intent(command, template, [], created.intent, policy).duplicate, true);
let suppressed = service.intent(command, template, [{ recipientId: 'u1', purpose: 'TRANSACTIONAL', channel: 'EMAIL' }], null, policy); assert.strictEqual(suppressed.intent.status, 'SUPPRESSED');
assert.strictEqual(service.retry(2, 0, policy).status, 'DEAD_LETTER'); let event = service.event(Object.assign({ code: 'I1' }, created.intent), { status: 'DELIVERED', attempt: 1 }); assert(!Object.prototype.hasOwnProperty.call(event, 'body'));
console.log('Communication core Phase 1C contract validated');

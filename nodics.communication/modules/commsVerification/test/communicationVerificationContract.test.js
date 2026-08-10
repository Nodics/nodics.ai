/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('assert'); const service = require('../src/service/defaultCommunicationVerificationService'); const now = new Date('2026-08-10T00:00:00Z');
let value = service.create({ tenant: 't1', purpose: 'CONTACT_EMAIL', subjectReference: 'C1', channel: 'EMAIL', destination: 'u@example.test', secret: '123456', now: now, correlationId: 'c1' }, { ttlSeconds: 60, maximumAttempts: 2, secretBytes: 6 }); assert(!value.challenge.secretHash.includes('123456')); assert.strictEqual(service.verify(value.challenge, '123456', new Date(now.getTime() + 1000)).status, 'VERIFIED'); let failed = service.verify(value.challenge, 'wrong', new Date(now.getTime() + 1000)); assert.strictEqual(service.verify(failed, 'wrong', new Date(now.getTime() + 2000)).status, 'LOCKED'); assert.strictEqual(service.verify(value.challenge, '123456', new Date(now.getTime() + 61000)).status, 'EXPIRED');
console.log('Communication verification Phase 1C contract validated');

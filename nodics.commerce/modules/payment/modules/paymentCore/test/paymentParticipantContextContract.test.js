/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module paymentCore/test/paymentParticipantContextContract @description Verifies owner/actor propagation without credential persistence. @layer test @owner paymentCore */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultPaymentExecutionService');
const request = () => ({ tenant: 'tenant', enterpriseCode: 'merchant', ownerId: 'buyer-company',
    ownerRef: { module: 'profile', schema: 'enterprise', code: 'buyer-company' },
    actorRef: { principalType: 'human', code: 'employee', loginId: 'employee', enterpriseCode: 'buyer-company' },
    participantEnterpriseCode: 'buyer-company', operation: 'AUTHORIZE', methodCode: 'LOYALTY_REWARD',
    authorization: 'Bearer private-token', amount: '10.00', currency: 'POINTS', idempotencyKey: 'purchase' });

test('provider receives typed participant; stored receipt never retains bearer or arbitrary owner fields', async () => {
    let received, stored;
    const input = request();
    input.ownerRef.authorization = 'private-token';
    const adapter = { code: 'loyalty', execute: async value => { received = value; return { status: 'AUTHORIZED', reference: 'hold' }; } };
    const repository = { find: async () => undefined, record: async value => (stored = value) };
    await service.execute(input, adapter, repository);
    assert.deepEqual(received.ownerRef, request().ownerRef);
    assert.equal(received.participantEnterpriseCode, 'buyer-company');
    assert.equal(received.authorization, input.authorization);
    assert.deepEqual(stored.evidence.participant.actorRef, input.actorRef);
    assert.equal(JSON.stringify(stored).includes('private-token'), false);
    assert.equal(stored.enterpriseCode, 'merchant');
});

test('persisted payment key cannot be replayed under a different participant', async () => {
    let stored, effects = 0;
    const adapter = { code: 'loyalty', execute: async () => { effects++; return { status: 'AUTHORIZED' }; } };
    const repository = { find: async () => stored, record: async value => (stored = value) };
    await service.execute(request(), adapter, repository);
    assert.equal(await service.execute(request(), adapter, repository), stored);
    const changed = request(); changed.actorRef.code = changed.actorRef.loginId = 'other-employee';
    await assert.rejects(service.execute(changed, adapter, repository), /participant changed/);
    assert.equal(effects, 1);
});

test('partial identity and employee acting as customer fail before provider execution', async () => {
    const adapter = { execute: async () => assert.fail('provider must not execute') };
    for (const change of [value => delete value.actorRef, value => { value.ownerRef.schema = 'customer'; },
        value => { value.participantEnterpriseCode = 'different'; }]) {
        const input = request(); change(input);
        await assert.rejects(service.execute(input, adapter, {}), /participant identity/);
    }
});

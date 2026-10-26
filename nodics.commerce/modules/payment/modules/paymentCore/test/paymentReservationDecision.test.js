/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const execution = require('../src/service/defaultPaymentExecutionService');
const provider = require('../../paymentProviders/modules/loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService');
function fixture() {
  const config = structuredClone(require('../../paymentProviders/modules/loyaltyRewardProvider/config/properties').loyaltyRewardProvider);
  const request = { tenant: 't', operation: 'AUTHORIZE', orderCode: 'order', cartCode: 'cart', ownerId: 'enterprise',
    enterpriseCode: 'enterprise', participantEnterpriseCode: 'enterprise', amount: '50.00', currency: 'POINTS',
    ownerRef: { module: 'profile', schema: 'enterprise', code: 'enterprise' },
    actorRef: { principalType: 'human', code: 'employee', loginId: 'employee', enterpriseCode: 'enterprise' },
    methodCode: 'LOYALTY_REWARD', walletCode: 'wallet', programCode: 'program', rewardTypeCode: 'points',
    idempotencyKey: 'original:payment', correlationId: 'original', authData: { tenant: 't', enterpriseCode: 'enterprise' } };
  const decision = { contract: 'LOYALTY_RESERVATION_DECISION_V1', tenant: 't', code: 'reservation',
    idempotencyKey: request.idempotencyKey, sourceType: 'PAYMENT', sourceCode: 'order', targetType: 'ORDER', targetCode: 'order',
    status: 'DENIED', noEffects: true };
  let row, calls = 0;
  global.CONFIG = { get: key => key === 'loyaltyRewardProvider' ? config : undefined };
  const adapter = { ...provider, assertWalletOwner: async () => {}, invokeLoyalty: async () => { calls++; return { decision }; } };
  global.SERVICE = { DefaultLoyaltyRewardPaymentProviderService: adapter };
  return { request, decision, adapter, config, get row() { return row; }, get calls() { return calls; },
    repository: { find: async () => row, record: async model => { row = structuredClone(model); return row; } } };
}
test('actual provider and Payment retain original durable denial; replay never redispatches authorization', async () => {
  const f = fixture();
  const first = await execution.execute(f.request, f.adapter, f.repository);
  assert.equal(first.status, 'DECLINED'); assert.deepEqual(first.evidence.reservationDecision, f.decision);
  assert.deepEqual(first.evidence.participant.ownerRef, f.request.ownerRef);
  assert.equal((await execution.execute(f.request, f.adapter, f.repository)).status, 'DECLINED'); assert.equal(f.calls, 1);
});
test('missing, mismatched and error-shaped no-effects evidence never produces a Payment denial', async () => {
  for (const change of [d => { d.idempotencyKey = 'other'; }, d => { d.noEffects = false; },
    d => { d.sourceCode = 'foreign'; }, d => { d.status = 'AUTHORIZED'; }, d => { d.success = false; }]) {
    const f = fixture(); change(f.decision);
    await assert.rejects(execution.execute(f.request, f.adapter, f.repository)); assert.equal(f.row, undefined);
  }
});
test('effective decision route overrides preserve the original key and forbid transport retry/participant substitution', async () => {
  const f = fixture(); f.config.reservationDecisionPaths.inspect = '/owner/inspect';
  SERVICE.DefaultModuleService = { invokeModule: async r => {
    assert.equal(r.apiName, '/owner/inspect'); assert.equal(r.maxAttempts, 1);
    assert.equal(r.requestBody.idempotencyKey, 'original:payment');
    assert.equal(r.request.authData, undefined); assert.equal(r.requestBody.authData, undefined);
    return { result: f.decision };
  } };
  assert.deepEqual(await execution.authorizationDecision({ tenant: 't', orderCode: 'order', commandCode: 'original' }, 'inspect'), f.decision);
});
test('failed, unknown-commit and ambiguous nested envelopes cannot launder terminal receipts', async () => {
  const f = fixture();
  for (const response of [{ acknowledged: false, result: f.decision },
    { code: 'UNKNOWN_COMMIT', result: f.decision }, { code: 'SUC_READ', result: { acknowledged: false, data: f.decision } },
    { result: { ...f.decision, acknowledged: false } }, { result: f.decision, data: f.decision }])
    assert.throws(() => provider.validateDecision(f.request, response));
  f.adapter.invokeLoyalty = async () => ({ acknowledged: false, result: { decision: f.decision } });
  await assert.rejects(execution.execute(f.request, f.adapter, f.repository)); assert.equal(f.row, undefined);
});

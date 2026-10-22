/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import properties from '../config/properties.js';
import { commercialAgreementData, runCommercialAgreementAcceptance,
  selectCommercialAgreementAcceptance } from '../src/service/acceptance/defaultCommercialAgreementAcceptanceService.mjs';

const selection = { contractVersion: 1, approvalReference: 'review-1', tenant: 'default', enterpriseCode: 'partner', agreements: [
  { code: 'fixed', revision: 1, model: 'FIXED_PRICE', paymentTerms: 'PREPAID', benefitCodes: ['boost'] },
  { code: 'subscription', revision: 2, model: 'SUBSCRIPTION', paymentTerms: 'INVOICE', benefitCodes: [] },
] };
const session = { authorization: 'Bearer employee', enterpriseCode: 'partner' };

function harness(fault = {}) {
  const calls = [];
  const rows = Object.fromEntries(selection.agreements.map(expected => [expected.code, { code: expected.code,
    enterpriseRef: { module: 'profile', schema: 'enterprise', code: fault.foreign ? 'foreign' : 'partner' }, revision: expected.revision,
    versions: Array.from({ length: expected.revision }, (_, index) => ({ version: index + 1, terms: {
      model: expected.model, paymentTerms: expected.paymentTerms, benefits: expected.benefitCodes.map(code => ({ code })) } })),
  }]));
  const fetch = async (url, input) => {
    const path = new URL(url).pathname, body = JSON.parse(input.body); calls.push({ path, input, body });
    const response = value => new Response(JSON.stringify({ data: value }), { status: 200 });
    if (path.endsWith('/workspace')) return response({ contractVersion: 1, enterpriseCode: 'partner',
      availableCommands: ['search', 'read'], limits: { maximumPageSize: 100 },
      mutation: { expectedRevisionRequired: true, commandIdRequired: true, automaticRetry: false } });
    if (path.endsWith('/search')) return response({ pageNumber: 1, pageSize: 50, hasMore: false,
      agreements: (fault.missing ? selection.agreements.slice(0, 1) : selection.agreements).map(value => ({ code: value.code })) });
    if (path.endsWith('/read')) return response(rows[body.code]);
    assert.fail('unexpected route');
  };
  return { calls, options: { execute: true, baseUrl: 'http://localhost:4350', selection, session, fetch } };
}

test('read-only owner runner proves both commercial models and complete retained histories', async () => {
  const h = harness(), result = await runCommercialAgreementAcceptance(h.options);
  assert.equal(result.state, 'PASSED');
  assert.deepEqual(result.agreements.map(value => value.code), ['fixed', 'subscription']);
  assert.equal(h.calls.length, 4);
  assert(h.calls.every(value => value.input.method === 'POST' && value.input.headers.Authorization === 'Bearer employee'));
  assert(!h.calls.some(value => value.path.endsWith('/record')));
});

test('missing or foreign agreement evidence refuses without a write fallback', async () => {
  await assert.rejects(runCommercialAgreementAcceptance(harness({ missing: true }).options), /SELECTED_AGREEMENTS_MISSING/);
  const foreign = harness({ foreign: true });
  await assert.rejects(runCommercialAgreementAcceptance(foreign.options), /AGREEMENT_HISTORY_UNCONFIRMED/);
  assert(!foreign.calls.some(value => value.path.endsWith('/record')));
});

test('execution, local target, exact selection and original session are mandatory', async () => {
  await assert.rejects(runCommercialAgreementAcceptance({}), /EXPLICIT_EXECUTION_REQUIRED/);
  await assert.rejects(runCommercialAgreementAcceptance({ ...harness().options, baseUrl: 'https://example.com' }), /LOCAL_HTTP_TARGET_REQUIRED/);
  await assert.rejects(runCommercialAgreementAcceptance({ ...harness().options, session: { ...session, enterpriseCode: 'foreign' } }), /ORIGINAL_AGREEMENT_SESSION_REQUIRED/);
  assert.throws(() => selectCommercialAgreementAcceptance(Object.create({ commercialAgreement: selection })), /UNAVAILABLE/);
  assert.throws(() => commercialAgreementData({ data: {}, result: {} }), /AMBIGUOUS/);
});

test('framework owner registers the command and complete reusable defaults', () => {
  assert.deepEqual(properties.tooling.commands['acceptance:commercial-agreement'], { acceptanceContract: true,
    projectHome: true, handler: '@nTooling/node-script',
    script: 'src/service/acceptance/defaultCommercialAgreementAcceptanceService.mjs' });
  assert.deepEqual(properties.commercialAgreement.acceptance, { requestTimeoutMs: 30000, maximumAgreements: 50 });
  const script = new URL('../src/service/acceptance/defaultCommercialAgreementAcceptanceService.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /read-only installed agreement/);
});

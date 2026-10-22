/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
import test from 'node:test'; import assert from 'node:assert/strict'; import { spawnSync } from 'node:child_process';
import properties from '../config/properties.js';
import { runDigitalCouponReminderSourceAcceptance, selectDigitalCouponReminderSourceAcceptance } from
  '../src/service/acceptance/defaultDigitalCouponReminderSourceAcceptanceService.mjs';
const occurrenceKey = 'COUPON_EXPIRY_' + 'a'.repeat(64);
const selection = { contractVersion: 1, approvalReference: 'reminder-review', tenant: 'default', runtimeEnterpriseCode: 'commerce-runtime',
  sources: [{ enterpriseCode: 'partner', entitlementCode: 'coupon-1', occurrenceKey, eligible: true }] };
const session = { authorization: 'Bearer service', enterpriseCode: 'commerce-runtime' };
function harness(fault = {}) { const calls = []; return { calls, options: { execute: true, baseUrl: 'http://localhost:4350', selection, session,
  fetch: async (url, input) => { const body = JSON.parse(input.body); calls.push({ url: String(url), input, body });
    return new Response(JSON.stringify({ data: { contractVersion: 1, tenant: 'default', sourceModule: 'digitalCore',
      sourceType: 'DIGITAL_COUPON_EXPIRING', source: body, eligible: fault.ineligible ? false : true,
      ...(fault.ineligible ? {} : { ownerRef: { type: 'CUSTOMER', code: 'owner' }, expiresAt: new Date(Date.now() + 86400000).toISOString() }) } }), { status: 200 }); } } }; }
test('runner proves exact Digital reminder source without claiming Communication delivery', async () => { const h = harness();
  const result = await runDigitalCouponReminderSourceAcceptance(h.options); assert.equal(result.state, 'PASSED');
  assert.equal(result.deliveryQualified, false); assert.equal(result.deliveryOwner, 'communication'); assert.equal(h.calls.length, 1);
  assert.equal(new URL(h.calls[0].url).pathname, '/nodics/digitalCore/v0/internal/coupons/reminder-source'); });
test('changed owner eligibility refuses rather than claiming an empty successful delivery', async () => {
  await assert.rejects(runDigitalCouponReminderSourceAcceptance(harness({ ineligible: true }).options), /REMINDER_SOURCE_UNCONFIRMED/); });
test('selection and framework command stay owner-local and explicit', async () => {
  await assert.rejects(runDigitalCouponReminderSourceAcceptance({}), /EXPLICIT_EXECUTION/);
  assert.throws(() => selectDigitalCouponReminderSourceAcceptance(Object.create({ digitalCouponReminderSource: selection })), /UNAVAILABLE/);
  assert.deepEqual(properties.digitalCore.couponReminders.acceptance, { requestTimeoutMs: 30000, maximumSources: 100 });
  assert.equal(properties.tooling.commands['acceptance:digital-coupon-reminder-source'].script,
    'src/service/acceptance/defaultDigitalCouponReminderSourceAcceptanceService.mjs');
  const script = new URL('../src/service/acceptance/defaultDigitalCouponReminderSourceAcceptanceService.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' }); assert.equal(result.status, 0, result.stderr);
});

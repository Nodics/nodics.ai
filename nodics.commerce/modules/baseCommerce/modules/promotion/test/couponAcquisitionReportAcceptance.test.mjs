/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
import test from 'node:test'; import assert from 'node:assert/strict'; import { spawnSync } from 'node:child_process';
import properties from '../config/properties.js';
import { runCouponAcquisitionReportAcceptance, selectCouponAcquisitionReportAcceptance } from
  '../src/service/acceptance/defaultCouponAcquisitionReportAcceptanceService.mjs';
const selection = { contractVersion: 1, approvalReference: 'report-review', tenant: 'default', channelCode: 'circa',
  promotionCode: 'offer', enterpriseCode: 'partner', view: 'REDEEMER' };
const sessions = { scheduler: { authorization: 'Bearer scheduler' }, reporter: { authorization: 'Bearer employee', enterpriseCode: 'partner' } };
function harness(fault = {}) { const calls = [], stamp = '2026-10-20T00:00:00.000Z'; return { calls, options: { execute: true,
  baseUrl: 'http://localhost:4350', selection, sessions, fetch: async (url, input) => { const path = new URL(url).pathname; calls.push({ path, input });
    const value = path.endsWith('/refresh') ? { contractVersion: 1, status: 'COMPLETE', channelCode: 'circa', timezone: 'UTC', dataUpdatedThrough: stamp } :
      { contractVersion: 2, status: 'AVAILABLE', promotionCode: 'offer', channelCode: 'circa', view: 'REDEEMER', timezone: 'UTC',
        dataUpdatedThrough: fault.drift ? '2026-10-19T00:00:00.000Z' : stamp, protected: fault.protected !== false, counts: fault.protected === false ? {} : null,
        rates: fault.protected === false ? {} : null, rows: [] };
    return new Response(JSON.stringify({ data: value }), { status: 200 }); } } }; }
test('runner refreshes owner projection then verifies the same protected reporting watermark', async () => { const h = harness();
  const result = await runCouponAcquisitionReportAcceptance(h.options); assert.equal(result.state, 'PASSED'); assert.equal(result.protected, true);
  assert.deepEqual(h.calls.map(value => value.path), ['/nodics/promotion/v0/internal/acquisition-report/refresh',
    '/nodics/promotion/v0/promotions/offer/acquisition-report']); });
test('watermark drift refuses and no alternate report source is used', async () => { const h = harness({ drift: true });
  await assert.rejects(runCouponAcquisitionReportAcceptance(h.options), /REPORT_COVERAGE/); assert.equal(h.calls.length, 2); });
test('selection and framework command stay owner-local and explicit', async () => {
  await assert.rejects(runCouponAcquisitionReportAcceptance({}), /EXPLICIT_EXECUTION/);
  assert.throws(() => selectCouponAcquisitionReportAcceptance(Object.create({ couponAcquisitionReport: selection })), /UNAVAILABLE/);
  assert.deepEqual(properties.promotion.acquisitionReporting.acceptance, { requestTimeoutMs: 30000 });
  assert.equal(properties.tooling.commands['acceptance:coupon-acquisition-report'].script,
    'src/service/acceptance/defaultCouponAcquisitionReportAcceptanceService.mjs');
  const script = new URL('../src/service/acceptance/defaultCouponAcquisitionReportAcceptanceService.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' }); assert.equal(result.status, 0, result.stderr);
});

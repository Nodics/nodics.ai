/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */


import test from 'node:test';
import assert from 'node:assert/strict';
import { runWasteManagementAcceptance, resolveWasteFixture, main } from '../src/service/acceptance/defaultWasteManagementAcceptanceService.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import facade from '../src/facade/defaultWasteInternalFacade.js';
/** @module wasteApi/test/wasteManagementAcceptance @description Exercises canonical journey with real domain services and injected transport. @layer test @owner wasteApi */
function fixture() {
  return { runId: 'partner-run', submissionCode: 'partner-sub', resultCode: 'partner-impact', requiresReceipt: true,
    collectionPoint: { code: 'partner-centre', collectionPointType: 'RECYCLING_DROP_OFF' },
    rules: [{ code: 'partner-rule', collectionPointCode: 'partner-centre', categoryCode: 'LAPTOP', decision: 'ACCEPT', requiresReceipt: true, status: 'ACTIVE' }],
    facts: { familyCode: 'ELECTRONICS', categoryCode: 'LAPTOP', quantity: 1, weight: '2.5' },
    impactProfile: { code: 'partner-profile', formulaType: 'WEIGHT_FACTOR', metricRules: [{ metricCode: 'WEIGHT_KG', factor: 1, unitOfMeasure: 'KG' }] },
    expectedMetrics: [{ metricCode: 'WEIGHT_KG', value: '2.5' }], now: '2026-09-01T12:00:00.000Z' };
}
function operations(overrides = {}) {
  const calls = [];
  return { calls, authenticate: async () => ({ Authorization: 'Bearer employee-test' }), serviceHeaders: { Authorization: 'Bearer service-test' },
    request: async (role, route, options) => {
      calls.push({ role, route, options });
      assert.equal(role, 'WASTE');
      assert(route.startsWith('/nodics/wasteApi/v0/waste/'));
      const payload = JSON.parse(options.body);
      const request = { payload, params: { collectionPointCode: 'partner-centre' }, idempotencyKey: options.headers['Idempotency-Key'] };
      if (route.endsWith('acceptance-check')) return facade.collectionAcceptanceCheck(request);
      if (route.endsWith('/transitions')) return facade.transitionSubmission(request);
      if (route.endsWith('/impact-results')) {
        assert.equal(options.headers.Authorization, 'Bearer service-test');
        return facade.calculateImpact(request);
      }
      return facade.submitWaste(request);
    }, ...overrides };
}
test('help and plan are inert', async () => {
  assert.match((await main(['--help'])).usage, /--execute/);
  const result = await runWasteManagementAcceptance({ fixture: fixture() });
  assert.equal(result.state, 'PLANNED');
});
test('missing fixture or service authority rejects before operations', async () => {
  await assert.rejects(runWasteManagementAcceptance({ execute: true }), /fixture/);
  await assert.rejects(runWasteManagementAcceptance({ execute: true, fixture: fixture() }), /service bearer/);
});
test('real owner services satisfy alternate partner fixture without persistence claim', async () => {
  const ops = operations();
  const result = await runWasteManagementAcceptance({ execute: true, fixture: fixture(), ...ops });
  assert.equal(result.state, 'PASSED');
  assert.equal(result.persistenceVerified, false);
  assert.equal(result.importVerified, false);
  assert.equal(ops.calls.length, 5);
  assert.equal(new Set(ops.calls.map(call => call.options.headers['Idempotency-Key'])).size, 5);
});
test('authorization failure propagates without authority repair', async () => {
  const ops = operations({ request: async () => { throw new Error('403 forbidden'); } });
  await assert.rejects(runWasteManagementAcceptance({ execute: true, fixture: fixture(), ...ops }), /403 forbidden/);
});
test('metric identity and amount mismatch fail', async () => {
  const input = fixture();
  input.expectedMetrics[0].value = '999';
  await assert.rejects(runWasteManagementAcceptance({ execute: true, fixture: input, ...operations() }), /999/);
});
test('wrong submission lifecycle is rejected', async () => {
  const ops = operations();
  const request = ops.request;
  ops.request = async (...args) => args[1].endsWith('/submissions') ? { code: 'partner-sub', submissionStatus: 'APPROVED' } : request(...args);
  await assert.rejects(runWasteManagementAcceptance({ execute: true, fixture: fixture(), ...ops }), /SUBMITTED/);
});

test('declarative references resolve one registered owner and reject unsafe paths', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'waste-fixture-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const owner = path.join(root, 'owner');
  fs.mkdirSync(owner);
  fs.writeFileSync(path.join(owner, 'rules.json'), JSON.stringify(fixture().rules));
  fs.writeFileSync(path.join(owner, 'profiles.json'), JSON.stringify([fixture().impactProfile]));
  fs.writeFileSync(path.join(root, 'outside.json'), JSON.stringify(fixture().rules));
  fs.symlinkSync(path.join(root, 'outside.json'), path.join(owner, 'escape.json'));
  const input = { ...fixture(), dataModule: 'partner', ruleRecordsPath: 'rules.json',
    impactProfileRecordsPath: 'profiles.json', impactProfileCode: 'partner-profile' };
  delete input.rules;
  delete input.impactProfile;
  const modules = [{ name: 'partner', path: owner }];
  const resolve = changes => resolveWasteFixture({ fixture: { ...input, ...changes }, modules });
  assert.deepEqual(resolve().rules, fixture().rules);
  assert.equal(resolve().impactProfile.code, 'partner-profile');
  assert.throws(() => resolveWasteFixture({ fixture: input, modules: [] }), /data owner/);
  assert.throws(() => resolveWasteFixture({ fixture: input, modules: [...modules, ...modules] }), /data owner/);
  for (const ruleRecordsPath of ['../outside.json', '/tmp/outside.json', '..\\outside.json', 'C:\\outside.json'])
    assert.throws(() => resolve({ ruleRecordsPath }), /owner-relative/);
  assert.throws(() => resolve({ ruleRecordsPath: 'escape.json' }), /escapes its owner/);
  assert.throws(() => resolve({ impactProfileRecordsPath: '../outside.json' }), /owner-relative/);
  assert.throws(() => resolve({ impactProfileCode: 'missing' }), /profile code/);
  assert.throws(() => resolve({ ruleRecordsPath: 'missing.json' }), /ENOENT/);
  fs.writeFileSync(path.join(owner, 'empty.json'), '{}');
  assert.throws(() => resolve({ ruleRecordsPath: 'empty.json' }), /nonempty/);
});

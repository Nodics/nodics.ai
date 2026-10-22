/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/test/digitalWholeBundleGiftAcceptance @description Verifies the reusable live whole-gift runner with isolated HTTP owner doubles. @owner digitalCore @layer test */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import {
  digitalWholeBundleGiftAcceptanceArgument,
  digitalWholeBundleGiftSelection,
  runDigitalWholeBundleGiftAcceptance,
  selectDigitalWholeBundleGiftAcceptance,
} from '../src/service/acceptance/defaultDigitalWholeBundleGiftAcceptanceService.mjs';
import digitalCoreProperties from '../config/properties.js';

const owner = code => ({ module: 'profile', schema: 'customer', code });
const component = code => ({ kind: 'CERTIFICATE', reference: { module: 'wasteCore', schema: 'wasteAsset', code }, quantity: '1', expectedRevision: 1 });
const decisions = ['ACCEPT', 'DECLINE', 'CANCEL', 'EXPIRE'];
const selection = {
  contractVersion: 1,
  approvalReference: 'approved-local-gift-run',
  localDemo: true,
  isolatedPartition: true,
  tenant: 'acceptance-tenant',
  runCode: 'digital-gift-run',
  sender: { ownerRef: owner('sender'), enterpriseCode: 'gift-sender-enterprise' },
  recipient: { ownerRef: owner('recipient'), enterpriseCode: 'gift-recipient-enterprise' },
  scheduler: { enterpriseCode: 'gift-sender-enterprise' },
  expiryMaximumWaitMilliseconds: 1000,
  cases: decisions.map((outcome, index) => ({ caseCode: outcome.toLowerCase(), outcome,
    components: [component('asset-' + index + '-a'), component('asset-' + index + '-b')] })),
};
const sessions = {
  sender: { authorization: 'Bearer sender-token', enterpriseCode: selection.sender.enterpriseCode },
  recipient: { authorization: 'Bearer recipient-token', enterpriseCode: selection.recipient.enterpriseCode },
  scheduler: { authorization: 'Bearer scheduler-token', enterpriseCode: selection.scheduler.enterpriseCode },
};

const reply = (body, status = 200) => new Response(JSON.stringify({ data: body }), { status, headers: { 'Content-Type': 'application/json' } });
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const normalized = values => structuredClone(values).sort((a, b) => JSON.stringify(a.reference).localeCompare(JSON.stringify(b.reference)));

function harness({ omitFinalize = false, extraExpired = false, deniedAt } = {}) {
  const calls = [], manifests = new Map(), operations = new Map();
  function receipt(operation, componentValue, index, phase) {
    const statuses = { reserve: 'RESERVED', transfer: 'TRANSFERRED', finalize: 'COMPLETED', release: 'RELEASED' };
    return { status: statuses[phase], operationKey: operation.code + ':' + index, reference: componentValue.reference,
      quantity: componentValue.quantity, receiptCode: operation.code + ':' + index + ':' + phase };
  }
  function withPhases(operation, phases) {
    operation.checkpoints = Object.fromEntries(operation.components.map((selected, index) => [index,
      Object.fromEntries(phases.filter(phase => !(omitFinalize && operation.caseCode === 'accept' && phase === 'finalize'))
        .map(phase => [phase, receipt(operation, selected, index, phase)]))]));
    return operation;
  }
  const fetch = async (url, options) => {
    const path = new URL(url).pathname, body = JSON.parse(options.body || '{}');
    calls.push({ path, body, headers: Object.fromEntries(Object.entries(options.headers).map(([key, value]) => [key.toLowerCase(), value])) });
    if (deniedAt === path) return reply({ code: 'ERR_DENIED' }, 403);
    if (path.endsWith('/bundles')) {
      const caseCode = body.idempotencyKey.split(':').at(-2), components = normalized(body.components);
      const row = { code: 'bundle:' + digest(body.idempotencyKey), status: 'ACTIVE', revision: 0, ownerRef: body.ownerRef,
        components, digest: digest({ ownerRef: body.ownerRef, components }) };
      manifests.set(row.code, { ...row, caseCode });
      return reply(row);
    }
    if (path.endsWith('/gifts')) {
      const manifest = manifests.get(body.manifestCode), code = 'bundle-operation:' + digest(body.idempotencyKey);
      let row = operations.get(code);
      if (!row) {
        row = withPhases({ code, caseCode: manifest.caseCode, manifestCode: manifest.code, manifestRevision: manifest.revision,
          purpose: 'GIFT', status: 'PENDING', revision: 3, ownerRef: selection.sender.ownerRef,
          recipientRef: body.recipientRef, components: manifest.components, checkpoints: {},
          deadline: new Date(Date.now() + (manifest.caseCode === 'expire' ? 5 : 60000)).toISOString(),
          evidence: { manifestDigest: manifest.digest } }, ['reserve']);
        operations.set(code, row);
      }
      return reply(row);
    }
    if (path.endsWith('/gifts/decision')) {
      const row = operations.get(body.operationCode);
      if (!row.evidence.decision) {
        row.status = body.decision === 'ACCEPT' ? 'COMPLETED' : 'RELEASED';
        row.evidence.decision = body.decision;
        row.revision += 1;
        withPhases(row, body.decision === 'ACCEPT' ? ['reserve', 'transfer', 'finalize'] : ['reserve', 'release']);
      }
      return reply(row);
    }
    if (path.endsWith('/gifts/inspect')) {
      const row = operations.get(body.operationCode);
      return reply({ contractVersion: 1, ownerRef: body.ownerRef, operationCode: row.code, status: row.status,
        revision: row.revision, decision: row.evidence.decision || null, canResume: false });
    }
    if (path.endsWith('/internal/bundles/gifts/expire')) {
      const row = [...operations.values()].find(value => value.caseCode === 'expire');
      row.status = 'RELEASED'; row.evidence.decision = 'EXPIRE'; row.revision += 1; withPhases(row, ['reserve', 'release']);
      const results = [{ operationCode: row.code, status: 'RELEASED' }];
      if (extraExpired) results.push({ operationCode: 'bundle-operation:' + 'f'.repeat(64), status: 'RELEASED' });
      return reply({ contractVersion: 1, scanned: results.length, results, nextCursor: null, schedulerActivated: false });
    }
    throw new Error('Unexpected route ' + path);
  };
  return { calls, fetch };
}

test('live runner proves reservation, exact whole transfer, releases, expiry and stable decision replay through owner APIs', async () => {
  const h = harness();
  const result = await runDigitalWholeBundleGiftAcceptance({ execute: true, baseUrl: 'http://localhost:4350', selection, sessions,
    fetch: h.fetch, sleep: async () => {} });
  assert.equal(result.state, 'PASSED');
  assert.equal(result.scenarioCount, 4);
  assert.deepEqual(result.summaries.map(value => [value.outcome, value.status]), [
    ['ACCEPT', 'COMPLETED'], ['DECLINE', 'RELEASED'], ['CANCEL', 'RELEASED'], ['EXPIRE', 'RELEASED'],
  ]);
  assert.equal(result.summaries[0].exactTransferReceipts, 2);
  assert.equal(result.summaries[0].exactFinalizeReceipts, 2);
  assert.equal(h.calls.filter(call => call.path.endsWith('/gifts/decision')).length, 6);
  assert.equal(h.calls.filter(call => call.path.endsWith('/internal/bundles/gifts/expire')).length, 1);
  const firstCallCount = h.calls.length;
  const replay = await runDigitalWholeBundleGiftAcceptance({ execute: true, baseUrl: 'http://localhost:4350', selection, sessions,
    fetch: h.fetch, sleep: async () => {} });
  assert.equal(replay.state, 'PASSED');
  assert(replay.summaries.every(value => value.resumedTerminal === true));
  assert.equal(h.calls.filter(call => call.path.endsWith('/gifts/decision')).length, 6);
  assert.equal(h.calls.filter(call => call.path.endsWith('/internal/bundles/gifts/expire')).length, 1);
  assert.equal(h.calls.length - firstCallCount, 16);
  assert(h.calls.every(call => call.headers.authorization && call.headers.tenant === selection.tenant));
  assert(!h.calls.some(call => /signup|authenticate|import|seed|configure|settings/.test(call.path)));
});

test('selection is explicit, local, isolated, complete, fresh and session-bound before network execution', () => {
  const options = { execute: true, baseUrl: 'http://localhost:4350', selection, sessions };
  assert.equal(digitalWholeBundleGiftSelection(options).selection.runCode, selection.runCode);
  assert.throws(() => digitalWholeBundleGiftSelection({ ...options, execute: false }), /EXPLICIT_GIFT_ACCEPTANCE/);
  assert.throws(() => digitalWholeBundleGiftSelection({ ...options, baseUrl: 'https://example.com' }), /LOCAL_GIFT_ACCEPTANCE/);
  assert.throws(() => digitalWholeBundleGiftSelection({ ...options, selection: { ...selection, isolatedPartition: false } }), /REVIEWED_LOCAL_GIFT_SELECTION/);
  assert.throws(() => digitalWholeBundleGiftSelection({ ...options, selection: { ...selection,
    cases: selection.cases.map((value, index) => index ? value : { ...value, components: [value.components[0]] }) } }), /REVIEWED_WHOLE_GIFT_CASE/);
  assert.throws(() => digitalWholeBundleGiftSelection({ ...options, sessions: { ...sessions,
    recipient: { ...sessions.recipient, enterpriseCode: 'foreign' } } }), /ORIGINAL_GIFT_SESSION/);
  const repeated = structuredClone(selection);
  repeated.cases[1].components[0] = structuredClone(repeated.cases[0].components[0]);
  assert.throws(() => digitalWholeBundleGiftSelection({ ...options, selection: repeated }), /FRESH_GIFT_COMPONENT/);
});

test('incomplete transfer evidence and contaminated expiry partition remain recovery, never acceptance', async () => {
  let h = harness({ omitFinalize: true });
  let result = await runDigitalWholeBundleGiftAcceptance({ execute: true, baseUrl: 'http://localhost:4350', selection, sessions,
    fetch: h.fetch, sleep: async () => {} });
  assert.equal(result.state, 'RECOVERY_REQUIRED');
  assert.equal(result.reasonCode, 'EXACT_GIFT_COMPONENT_PHASES_REQUIRED');
  assert.equal(result.summaries.length, 0);
  h = harness({ extraExpired: true });
  result = await runDigitalWholeBundleGiftAcceptance({ execute: true, baseUrl: 'http://localhost:4350', selection, sessions,
    fetch: h.fetch, sleep: async () => {} });
  assert.equal(result.state, 'RECOVERY_REQUIRED');
  assert.equal(result.reasonCode, 'EXACT_GIFT_EXPIRY_REQUIRED');
  assert.equal(result.summaries.length, 3);
});

test('HTTP denial is bounded recovery and does not trigger provisioning or fallback', async () => {
  const h = harness({ deniedAt: '/nodics/digitalCore/v0/bundles' });
  const result = await runDigitalWholeBundleGiftAcceptance({ execute: true, baseUrl: 'http://localhost:4350', selection, sessions,
    fetch: h.fetch, sleep: async () => {} });
  assert.equal(result.state, 'RECOVERY_REQUIRED');
  assert.equal(result.reasonCode, 'GIFT_HTTP_403');
  assert.equal(h.calls.length, 1);
});

test('named profile selection rejects ambiguity and inherited fixtures', () => {
  const profiles = { digitalWholeBundleGift: selection, partnerWholeGift: { ...selection, runCode: 'partner-run' } };
  assert.equal(digitalWholeBundleGiftAcceptanceArgument([]), 'digitalWholeBundleGift');
  assert.equal(digitalWholeBundleGiftAcceptanceArgument(['--acceptance=partnerWholeGift']), 'partnerWholeGift');
  assert.equal(selectDigitalWholeBundleGiftAcceptance(profiles), selection);
  assert.equal(selectDigitalWholeBundleGiftAcceptance(profiles, 'partnerWholeGift'), profiles.partnerWholeGift);
  assert.throws(() => digitalWholeBundleGiftAcceptanceArgument(['--acceptance']), /SELECTION_INVALID/);
  assert.throws(() => digitalWholeBundleGiftAcceptanceArgument(['--acceptance=a', '--acceptance=b']), /ONE_GIFT/);
  assert.throws(() => selectDigitalWholeBundleGiftAcceptance(Object.create({ inheritedGift: selection }), 'inheritedGift'), /UNAVAILABLE/);
});

test('Digital owns the command and help path without a shared registry or project fixture', () => {
  assert.deepEqual(digitalCoreProperties.tooling.commands['acceptance:digital-whole-bundle-gift'], {
    acceptanceContract: true,
    projectHome: true,
    handler: '@nTooling/node-script',
    script: 'src/service/acceptance/defaultDigitalWholeBundleGiftAcceptanceService.mjs',
  });
  const script = new URL('../src/service/acceptance/defaultDigitalWholeBundleGiftAcceptanceService.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [script, '--help'], { cwd: '/', encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /acceptance:digital-whole-bundle-gift --execute/);
  assert.equal(result.stderr, '');
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/writeRecoveryResilienceAcceptance @description Proves bounded owner composition, restart ordering, stable keys and fail-closed recovery evidence. @owner nTooling @layer test */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import properties from '../config/properties.js';
import {
  redactWriteRecoveryEvidence,
  runWriteRecoveryResilienceAcceptance,
  writeRecoveryPlan,
} from '../src/service/project/defaultWriteRecoveryResilienceAcceptanceService.mjs';

const service = fileURLToPath(new URL('../src/service/project/defaultWriteRecoveryResilienceAcceptanceService.mjs', import.meta.url));
const limits = properties.tooling.acceptance.writeRecoveryResilience;

function fixture(t) {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-write-recovery-'));
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  const directory = path.join(projectRoot, 'scripts/acceptance/adapters');
  fs.mkdirSync(directory, { recursive: true });
  for (const name of ['wallet.mjs', 'digital.mjs']) fs.writeFileSync(path.join(directory, name), 'export {};\n');
  const selection = { contractVersion: 1, code: 'circa-e17', operations: [
    { code: 'wallet-transfer', ownerCommand: 'acceptance:loyalty-transfer', checkpointAdapter: 'scripts/acceptance/adapters/wallet.mjs',
      runtimeCodes: ['platform', 'loyalty'], faultPhase: 'AFTER_WRITE_BEFORE_ACK', arguments: ['--fixture=wallet', '--run-code={operationKey}'] },
    { code: 'bundle-settlement', ownerCommand: 'acceptance:digital-sale', checkpointAdapter: 'scripts/acceptance/adapters/digital.mjs',
      runtimeCodes: ['platform', 'commerce'], faultPhase: 'BEFORE_RECEIPT', arguments: ['--profile=bundle', '--run-code={operationKey}'] },
  ] };
  const owners = { 'acceptance:loyalty-transfer': { acceptanceContract: true, sourceModule: 'loyaltyWallet' },
    'acceptance:digital-sale': { acceptanceContract: true, sourceModule: 'digitalCore' } };
  return { projectRoot, selection, resolveOwner: command => owners[command] };
}

function adapterEvidence(operation, phase, overrides = {}) {
  const states = { PREPARE: ['READY', 'NOT_STARTED'], ARM_FAULT: ['ARMED', 'NOT_STARTED'],
    OBSERVE: ['FAULT_OBSERVED', 'APPLIED_UNACKNOWLEDGED'], RECONCILE: ['RECONCILED', 'APPLIED_ONCE'],
    CLEANUP: ['CLEANED', 'APPLIED_ONCE'] };
  return { contractVersion: 1, operationCode: operation.code, operationKey: operation.operationKey,
    phase, status: states[phase][0], writeDisposition: states[phase][1], retryAttempted: false,
    ...(phase === 'RECONCILE' ? { receiptConfirmed: true } : {}), ...overrides };
}

test('canonical command and reusable bounds are owned by nTooling', () => {
  const command = properties.tooling.commands['acceptance:write-recovery-resilience'];
  assert.equal(command.acceptanceContract, true);
  assert.equal(command.projectHome, true);
  assert.equal(command.script, 'src/service/project/defaultWriteRecoveryResilienceAcceptanceService.mjs');
  assert.deepEqual(limits.faultPhases, ['BEFORE_WRITE', 'AFTER_WRITE_BEFORE_ACK', 'BEFORE_RECEIPT']);
  assert.equal(limits.maxOperations, 8);
  assert(properties.tooling.testSuites.tooling.some(entry => entry.node?.endsWith('/writeRecoveryResilienceAcceptance.test.mjs')));
});

test('import and help are inert without a project or network', () => {
  const guard = "globalThis.fetch = () => { throw new Error('Unexpected network'); };";
  assert.equal(execFileSync(process.execPath, ['--input-type=module', '-e', guard + 'await import(' + JSON.stringify(new URL('../src/service/project/defaultWriteRecoveryResilienceAcceptanceService.mjs', import.meta.url).href) + ');'],
    { cwd: '/', encoding: 'utf8', timeout: 10000 }), '');
  assert.match(execFileSync(process.execPath, [service, '--help'], { cwd: '/', encoding: 'utf8', timeout: 10000 }), /--approve-fault-injection/);
});

test('selection remains project-owned and rejects unsafe or single-owner plans', t => {
  const f = fixture(t);
  const plan = writeRecoveryPlan(f.selection, { projectRoot: f.projectRoot, runId: 'run-001', limits, resolveOwner: f.resolveOwner });
  assert.deepEqual(plan.map(item => item.operationKey), ['run-001:wallet-transfer', 'run-001:bundle-settlement']);
  assert.equal(plan[0].arguments.at(-1), '--run-code=run-001:wallet-transfer');
  assert.throws(() => writeRecoveryPlan({ ...f.selection, operations: [f.selection.operations[0]] },
    { projectRoot: f.projectRoot, runId: 'run-001', limits, resolveOwner: f.resolveOwner }), /between 2/);
  const sameOwner = structuredClone(f.selection);
  sameOwner.operations[1].ownerCommand = 'acceptance:loyalty-transfer';
  assert.throws(() => writeRecoveryPlan(sameOwner, { projectRoot: f.projectRoot, runId: 'run-001', limits, resolveOwner: f.resolveOwner }), /at least two/);
  const sensitive = structuredClone(f.selection);
  sensitive.operations[0].arguments = ['--token=not-admitted'];
  assert.throws(() => writeRecoveryPlan(sensitive, { projectRoot: f.projectRoot, runId: 'run-001', limits, resolveOwner: f.resolveOwner }), /non-sensitive/);
  const control = structuredClone(f.selection);
  control.operations[0].arguments = ['--execute'];
  assert.throws(() => writeRecoveryPlan(control, { projectRoot: f.projectRoot, runId: 'run-001', limits, resolveOwner: f.resolveOwner }), /orchestration controls/);
  const destructive = structuredClone(f.selection);
  destructive.operations[0].arguments = ['--force-reset'];
  assert.throws(() => writeRecoveryPlan(destructive, { projectRoot: f.projectRoot, runId: 'run-001', limits, resolveOwner: f.resolveOwner }), /orchestration controls/);
  const outside = path.join(os.tmpdir(), `nodics-outside-adapter-${process.pid}.mjs`);
  fs.writeFileSync(outside, 'export {};\n');
  t.after(() => fs.rmSync(outside, { force: true }));
  fs.symlinkSync(outside, path.join(f.projectRoot, 'scripts/acceptance/adapters/escape.mjs'));
  const escaped = structuredClone(f.selection);
  escaped.operations[0].checkpointAdapter = 'scripts/acceptance/adapters/escape.mjs';
  assert.throws(() => writeRecoveryPlan(escaped, { projectRoot: f.projectRoot, runId: 'run-001', limits, resolveOwner: f.resolveOwner }), /symlink/);
});

test('explicit approvals precede owner calls and every write runs exactly once', async t => {
  const f = fixture(t);
  let calls = 0;
  const inert = { ...f, runId: 'run-001', limits, runAdapter: async () => { calls++; }, runOwnerCommand: async () => { calls++; },
    assertReady: async () => { calls++; }, restartTopology: async () => { calls++; } };
  for (const flags of [{}, { execute: true }, { execute: true, approveFaultInjection: true },
    { execute: true, approveFaultInjection: true, approveRestarts: true, approvedOperations: ['wallet-transfer'] }]) {
    await assert.rejects(runWriteRecoveryResilienceAcceptance({ ...inert, ...flags }), /Explicit|Every selected/);
    assert.equal(calls, 0);
  }

  const sequence = [], keys = [], ownerCalls = new Map();
  const result = await runWriteRecoveryResilienceAcceptance({ ...f, runId: 'run-001', limits, execute: true,
    approveFaultInjection: true, approveRestarts: true, approvedOperations: ['wallet-transfer', 'bundle-settlement'],
    assertReady: async runtimes => sequence.push('ready:' + runtimes.join(',')),
    runAdapter: async (operation, phase) => {
      sequence.push(`${operation.code}:${phase}`);
      keys.push(operation.operationKey);
      return adapterEvidence(operation, phase, { evidence: { authorization: 'Bearer private', note: 'Bearer private' } });
    },
    runOwnerCommand: async operation => {
      sequence.push(`${operation.code}:OWNER`);
      ownerCalls.set(operation.code, (ownerCalls.get(operation.code) || 0) + 1);
    },
    restartTopology: async runtimes => sequence.push('restart:' + runtimes.join(',')),
  });
  assert.equal(result.status, 'PASSED');
  assert.equal(result.retryPolicy, 'NO_AUTOMATIC_RETRY_OF_UNCERTAIN_WRITES');
  assert.deepEqual(Object.fromEntries(ownerCalls), { 'wallet-transfer': 1, 'bundle-settlement': 1 });
  assert(keys.every(key => ['run-001:wallet-transfer', 'run-001:bundle-settlement'].includes(key)));
  assert(sequence.indexOf('wallet-transfer:OBSERVE') < sequence.indexOf('restart:platform,loyalty'));
  assert(sequence.indexOf('restart:platform,loyalty') < sequence.indexOf('wallet-transfer:RECONCILE'));
  assert.equal(result.operations[0].checkpoints.at(-1).phase, 'CLEANUP');
  assert.equal(result.operations[0].checkpoints[0].evidence.authorization, '[REDACTED]');
  assert.equal(result.operations[0].checkpoints[0].evidence.note, 'Bearer [REDACTED]');
});

test('uncertain writes are never retried and invalid reconciliation stops later owners', async t => {
  const f = fixture(t);
  let writes = 0;
  const phases = [];
  await assert.rejects(runWriteRecoveryResilienceAcceptance({ ...f, runId: 'run-002', limits, execute: true,
    approveFaultInjection: true, approveRestarts: true, approvedOperations: ['wallet-transfer', 'bundle-settlement'],
    assertReady: async () => undefined, restartTopology: async () => undefined,
    runOwnerCommand: async () => { writes++; },
    runAdapter: async (operation, phase) => {
      phases.push(`${operation.code}:${phase}`);
      return adapterEvidence(operation, phase, phase === 'RECONCILE' ? { retryAttempted: true } : {});
    },
  }), /may not retry/);
  assert.equal(writes, 1);
  assert(phases.includes('wallet-transfer:CLEANUP'));
  assert(!phases.some(phase => phase.startsWith('bundle-settlement:')));
});

test('redaction removes credential-shaped keys, bearer values and query secrets', () => {
  assert.deepEqual(redactWriteRecoveryEvidence({ password: 'x', nested: { text: 'Bearer abc', url: 'https://x.invalid?a=1&token=abc' } }),
    { password: '[REDACTED]', nested: { text: 'Bearer [REDACTED]', url: 'https://x.invalid?a=1&token=[REDACTED]' } });
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/project/defaultWriteRecoveryResilienceAcceptanceService
 * @description Coordinates bounded cross-owner write-recovery evidence without owning domain assertions or persistence.
 * @owner nTooling
 * @layer tooling
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { waitForAcceptanceReady } from './defaultProjectAcceptanceService.mjs';

const require = createRequire(import.meta.url);
const defaults = require('../../../config/properties.js').tooling.acceptance.writeRecoveryResilience;
const tooling = require('../defaultToolingCommandService.js');
const executeFile = promisify(execFile);
const serviceFile = fileURLToPath(import.meta.url);
const moduleRoot = path.resolve(path.dirname(serviceFile), '../../..');
const frameworkRoot = process.env.NODICS_FRAMEWORK_ROOT || path.resolve(moduleRoot, '../../..');
const tool = path.join(moduleRoot, 'bin', 'nodics-tool.js');
const topologyScript = new URL('./defaultProjectTopologyService.mjs', import.meta.url);
const CODE = /^[a-zA-Z][a-zA-Z0-9._-]{1,127}$/u;
const CONTROL_ARGUMENT = /^--(?:execute|operation-key|fault-phase|resilience-run-id|approve(?:-|=|$)|skip|drop|reset|force|emergency|override)/u;
const SENSITIVE_ARGUMENT = /(?:authorization|cookie|credential|password|secret|token)/iu;
const SENSITIVE_KEY = /(?:authorization|cookie|credential|password|secret|token)/iu;

function ensureContained(root, candidate, label) {
  if (typeof candidate !== 'string' || !candidate.trim()) throw new Error(`${label} must remain inside the selected project`);
  const resolved = path.resolve(root, candidate);
  const relative = path.relative(root, resolved);
  if (!candidate || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`${label} must remain inside the selected project`);
  const realRoot = fs.realpathSync(root);
  const realFile = fs.realpathSync(resolved);
  const realRelative = path.relative(realRoot, realFile);
  if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) throw new Error(`${label} must not escape the selected project through a symlink`);
  return realFile;
}

/** Loads only the caller-selected project contract; framework source contains no project operations. */
export function readWriteRecoverySelection(projectRoot, selectionPath, maxBytes = defaults.maxEvidenceBytes) {
  const file = ensureContained(projectRoot, selectionPath, 'Selection');
  const stat = fs.statSync(file);
  if (!stat.isFile() || stat.size < 2 || stat.size > maxBytes) throw new Error('Selection must be a bounded JSON file');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function resolveAdapter(projectRoot, adapter) {
  if (typeof adapter !== 'string' || !adapter.startsWith('scripts/acceptance/adapters/') || !adapter.endsWith('.mjs')) {
    throw new Error('Each operation requires a project acceptance adapter under scripts/acceptance/adapters');
  }
  const file = ensureContained(projectRoot, adapter, 'Checkpoint adapter');
  if (!fs.statSync(file).isFile()) throw new Error('Checkpoint adapter is unavailable: ' + adapter);
  return file;
}

function operationKey(runId, operationCode) {
  return `${runId}:${operationCode}`;
}

function expandArguments(values, context) {
  return values.map(value => value.replaceAll('{runId}', context.runId)
    .replaceAll('{operationCode}', context.operationCode)
    .replaceAll('{operationKey}', context.operationKey)
    .replaceAll('{faultPhase}', context.faultPhase));
}

/** Validates generic orchestration shape and trusted owner-command references, never owner business data. */
export function writeRecoveryPlan(selection, {
  projectRoot, runId, limits = defaults, resolveOwner = defaultResolveOwnerCommand,
} = {}) {
  if (!projectRoot || !CODE.test(runId || '')) throw new Error('A stable --run-id is required');
  if (!selection || selection.contractVersion !== limits.contractVersion || !CODE.test(selection.code || '')) {
    throw new Error('Select a versioned write-recovery contract');
  }
  if (!Array.isArray(selection.operations) || selection.operations.length < 2 || selection.operations.length > limits.maxOperations) {
    throw new Error(`Select between 2 and ${String(limits.maxOperations)} cross-owner operations`);
  }
  const codes = new Set();
  const keys = new Set();
  const owners = new Set();
  const plan = selection.operations.map(operation => {
    if (!operation || !CODE.test(operation.code || '') || codes.has(operation.code)) throw new Error('Operation codes must be distinct stable identifiers');
    codes.add(operation.code);
    if (!limits.faultPhases.includes(operation.faultPhase)) throw new Error('Unsupported bounded fault phase: ' + String(operation.faultPhase));
    if (!Array.isArray(operation.runtimeCodes) || !operation.runtimeCodes.length || operation.runtimeCodes.some(code => !CODE.test(code)) ||
        new Set(operation.runtimeCodes).size !== operation.runtimeCodes.length) throw new Error('Each operation requires distinct explicit runtime codes');
    if (!Array.isArray(operation.arguments || []) || (operation.arguments || []).some(value => typeof value !== 'string' || value.length > 500 ||
        value.includes('\n') || CONTROL_ARGUMENT.test(value) || SENSITIVE_ARGUMENT.test(value))) {
      throw new Error('Owner arguments must be bounded, non-sensitive selections without orchestration controls');
    }
    const owner = resolveOwner(operation.ownerCommand);
    if (!owner || owner.acceptanceContract !== true || owner.sourceModule === 'nTooling') {
      throw new Error('Operations must reference canonical non-nTooling owner acceptance commands');
    }
    owners.add(owner.sourceModule);
    const key = operationKey(runId, operation.code);
    if (keys.has(key)) throw new Error('Operation keys must be distinct');
    keys.add(key);
    const context = { runId, operationCode: operation.code, operationKey: key, faultPhase: operation.faultPhase };
    const args = expandArguments(operation.arguments || [], context);
    if (args.some(value => value.includes('{'))) throw new Error('Owner arguments contain an unsupported placeholder');
    return {
      code: operation.code,
      ownerCommand: operation.ownerCommand,
      ownerModule: owner.sourceModule,
      adapter: resolveAdapter(projectRoot, operation.checkpointAdapter),
      runtimeCodes: [...operation.runtimeCodes],
      faultPhase: operation.faultPhase,
      operationKey: key,
      arguments: args,
    };
  });
  if (owners.size < 2) throw new Error('Write-recovery acceptance requires at least two capability owners');
  return plan;
}

function defaultResolveOwnerCommand(command) {
  const definition = tooling.loadCommands(frameworkRoot)[command];
  if (!definition) throw new Error('Unknown owner acceptance command: ' + String(command));
  return definition;
}

function redactString(value) {
  return value.replace(/Bearer\s+[^\s"']+/giu, 'Bearer [REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/gu, '[REDACTED]')
    .replace(/([?&](?:token|password|secret|credential)=)[^&#\s]+/giu, '$1[REDACTED]')
    .slice(0, 2000);
}

/** Removes credential-shaped evidence before it enters the aggregate receipt. */
export function redactWriteRecoveryEvidence(value, depth = 0) {
  if (depth > 8) return '[TRUNCATED]';
  if (typeof value === 'string') return redactString(value);
  if (Array.isArray(value)) return value.slice(0, 100).map(item => redactWriteRecoveryEvidence(item, depth + 1));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).slice(0, 100).map(([key, item]) => [
    key,
    SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactWriteRecoveryEvidence(item, depth + 1),
  ]));
}

function assertAdapterEvidence(result, expected, operation, limits) {
  if (!result || result.contractVersion !== limits.contractVersion || result.operationCode !== operation.code ||
      result.operationKey !== operation.operationKey || result.phase !== expected.phase || result.status !== expected.status) {
    throw new Error(`Checkpoint adapter returned invalid ${expected.phase} evidence for ${operation.code}`);
  }
  if (result.retryAttempted !== false) throw new Error(`Checkpoint adapter may not retry an uncertain write: ${operation.code}`);
  if (expected.dispositions && !expected.dispositions.includes(result.writeDisposition)) {
    throw new Error(`Checkpoint adapter returned invalid write disposition for ${operation.code}`);
  }
  if (expected.receiptConfirmed === true && result.receiptConfirmed !== true) {
    throw new Error(`Checkpoint adapter did not confirm the owner receipt for ${operation.code}`);
  }
  const redacted = redactWriteRecoveryEvidence(result);
  if (Buffer.byteLength(JSON.stringify(redacted)) > limits.maxEvidenceBytes) throw new Error('Redacted checkpoint evidence exceeds the configured bound');
  return redacted;
}

async function defaultRunAdapter(operation, phase, context) {
  const args = [operation.adapter, '--execute', `--phase=${phase}`, `--run-id=${context.runId}`,
    `--operation-code=${operation.code}`, `--operation-key=${operation.operationKey}`,
    `--fault-phase=${operation.faultPhase}`, `--owner-command=${operation.ownerCommand}`];
  let result;
  try {
    result = await executeFile(process.execPath, args, {
      cwd: context.projectRoot,
      env: { ...context.environment, NODICS_PROJECT_ROOT: context.projectRoot,
        NODICS_RESILIENCE_RUN_ID: context.runId, NODICS_RESILIENCE_OPERATION_KEY: operation.operationKey,
        NODICS_RESILIENCE_FAULT_PHASE: operation.faultPhase },
      timeout: context.limits.checkpointTimeoutMs,
      maxBuffer: context.limits.maxEvidenceBytes * 2,
    });
  } catch {
    throw new Error(`Checkpoint adapter failed during ${phase} for ${operation.code}`);
  }
  try { return JSON.parse(result.stdout.trim()); }
  catch { throw new Error(`Checkpoint adapter returned malformed evidence for ${operation.code}`); }
}

async function defaultRunOwnerCommand(operation, context) {
  try {
    await executeFile(process.execPath, [tool, operation.ownerCommand, ...operation.arguments, '--execute', '--home=' + context.projectRoot], {
      cwd: context.projectRoot,
      env: { ...context.environment, NODICS_PROJECT_ROOT: context.projectRoot,
        NODICS_RESILIENCE_RUN_ID: context.runId, NODICS_RESILIENCE_OPERATION_KEY: operation.operationKey,
        NODICS_RESILIENCE_FAULT_PHASE: operation.faultPhase },
      timeout: context.limits.ownerCommandTimeoutMs,
      maxBuffer: context.limits.maxEvidenceBytes * 2,
    });
  } catch {
    throw new Error(`Owner acceptance command failed for ${operation.code}; inspect owner-local redacted evidence`);
  }
}

async function defaultAssertReady(runtimeCodes) {
  const topology = await import(topologyScript.href);
  return topology.assertTopologyReadiness(runtimeCodes);
}

async function defaultRestartTopology(runtimeCodes, context) {
  const environment = { ...context.environment, NODICS_PROJECT_ROOT: context.projectRoot };
  try {
    await executeFile(process.execPath, [fileURLToPath(topologyScript), 'stop'], {
      cwd: context.projectRoot, env: environment, timeout: context.limits.restartTimeoutMs,
      maxBuffer: context.limits.maxEvidenceBytes,
    });
  } catch {
    throw new Error('Topology stop failed before write-recovery restart');
  }
  const child = spawn(process.execPath, [fileURLToPath(topologyScript), 'start'], {
    cwd: context.projectRoot, env: environment, detached: true, stdio: 'ignore',
  });
  child.unref();
  const startupFailure = new Promise((_resolve, reject) => {
    child.once('error', () => reject(new Error('Topology start failed during write-recovery restart')));
    child.once('exit', () => reject(new Error('Topology supervisor exited during write-recovery restart')));
  });
  const readiness = waitForAcceptanceReady({
    probe: () => defaultAssertReady(runtimeCodes),
    isReady: result => Array.isArray(result) && result.length === runtimeCodes.length,
    timeoutMs: context.limits.restartTimeoutMs,
    intervalMs: context.limits.readinessIntervalMs,
    onReady: () => undefined,
    failureMessage: error => `Topology restart did not become ready: ${error?.message || 'unavailable'}`,
  });
  await Promise.race([readiness, startupFailure]);
}

const checkpointExpectations = {
  PREPARE: { phase: 'PREPARE', status: 'READY', dispositions: ['NOT_STARTED'] },
  ARM_FAULT: { phase: 'ARM_FAULT', status: 'ARMED', dispositions: ['NOT_STARTED'] },
  OBSERVE: { phase: 'OBSERVE', status: 'FAULT_OBSERVED', dispositions: ['NOT_APPLIED', 'APPLIED_UNACKNOWLEDGED', 'UNCERTAIN'] },
  RECONCILE: { phase: 'RECONCILE', status: 'RECONCILED', dispositions: ['NOT_APPLIED', 'APPLIED_ONCE'], receiptConfirmed: true },
  CLEANUP: { phase: 'CLEANUP', status: 'CLEANED' },
};

/** Executes each selected owner write once, restarts once, then reconciles by the same stable key. */
export async function runWriteRecoveryResilienceAcceptance({
  projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd(), environment = process.env,
  selection, selectionPath, runId, execute = false, approveFaultInjection = false, approveRestarts = false,
  approvedOperations = [], limits = defaults, resolveOwner = defaultResolveOwnerCommand,
  runAdapter = defaultRunAdapter, runOwnerCommand = defaultRunOwnerCommand,
  assertReady = defaultAssertReady, restartTopology = defaultRestartTopology,
} = {}) {
  if (execute !== true || approveFaultInjection !== true || approveRestarts !== true) {
    throw new Error('Explicit --execute --approve-fault-injection --approve-restarts is required');
  }
  const chosen = selection || readWriteRecoverySelection(projectRoot, selectionPath, limits.maxEvidenceBytes);
  const plan = writeRecoveryPlan(chosen, { projectRoot, runId, limits, resolveOwner });
  const approvals = new Set(approvedOperations);
  if (approvals.size !== plan.length || plan.some(operation => !approvals.has(operation.code))) {
    throw new Error('Every selected operation requires one --approve-operation=<code>');
  }
  const context = { projectRoot, environment, runId, limits };
  const evidence = [];
  for (const operation of plan) {
    const checkpoints = [];
    let armed = false;
    let completed;
    try {
      await assertReady(operation.runtimeCodes, context);
      checkpoints.push(assertAdapterEvidence(await runAdapter(operation, 'PREPARE', context), checkpointExpectations.PREPARE, operation, limits));
      checkpoints.push(assertAdapterEvidence(await runAdapter(operation, 'ARM_FAULT', context), checkpointExpectations.ARM_FAULT, operation, limits));
      armed = true;
      await runOwnerCommand(operation, context);
      checkpoints.push(assertAdapterEvidence(await runAdapter(operation, 'OBSERVE', context), checkpointExpectations.OBSERVE, operation, limits));
      await restartTopology(operation.runtimeCodes, context);
      await assertReady(operation.runtimeCodes, context);
      checkpoints.push(assertAdapterEvidence(await runAdapter(operation, 'RECONCILE', context), checkpointExpectations.RECONCILE, operation, limits));
      completed = { code: operation.code, ownerCommand: operation.ownerCommand, ownerModule: operation.ownerModule,
        faultPhase: operation.faultPhase, operationKey: operation.operationKey, checkpoints };
    } finally {
      if (armed) checkpoints.push(assertAdapterEvidence(await runAdapter(operation, 'CLEANUP', context), checkpointExpectations.CLEANUP, operation, limits));
    }
    evidence.push(completed);
  }
  const result = { contractVersion: limits.contractVersion, status: 'PASSED', runId, operationCount: evidence.length,
    retryPolicy: 'NO_AUTOMATIC_RETRY_OF_UNCERTAIN_WRITES', operations: evidence };
  if (Buffer.byteLength(JSON.stringify(result)) > limits.maxEvidenceBytes) throw new Error('Aggregate write-recovery evidence exceeds the configured bound');
  return result;
}

function parseCli(argv) {
  const value = name => argv.find(argument => argument.startsWith(name + '='))?.slice(name.length + 1);
  const known = new Set(['--execute', '--approve-fault-injection', '--approve-restarts', '--help']);
  for (const argument of argv) {
    if (known.has(argument) || ['--selection=', '--run-id=', '--approve-operation='].some(prefix => argument.startsWith(prefix))) continue;
    throw new Error('Unknown write-recovery option: ' + argument);
  }
  return { selectionPath: value('--selection'), runId: value('--run-id'), execute: argv.includes('--execute'),
    approveFaultInjection: argv.includes('--approve-fault-injection'), approveRestarts: argv.includes('--approve-restarts'),
    approvedOperations: argv.filter(argument => argument.startsWith('--approve-operation=')).map(argument => argument.slice(20)) };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) {
    console.log('Cross-owner write recovery: --selection=<project-json> --run-id=<stable-id> --execute --approve-fault-injection --approve-restarts --approve-operation=<code> (repeat).');
  } else {
    console.log(JSON.stringify(await runWriteRecoveryResilienceAcceptance(parseCli(process.argv.slice(2))), null, 2));
  }
}

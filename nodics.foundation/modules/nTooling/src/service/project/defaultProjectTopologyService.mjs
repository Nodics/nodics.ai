#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectTopologyService
 * @description Supervises manifest-declared project local topology from framework tooling.
 * @layer tooling
 * @owner nTooling
 */

import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = process.cwd();
export const workspaceRoot = path.resolve(projectRoot, '..');

function readProjectManifest() {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, 'nodics.project.json'), 'utf8'));
}

function resolveTemplate(value) {
  return String(value || '')
    .replaceAll('{projectRoot}', projectRoot)
    .replaceAll('{workspaceRoot}', workspaceRoot);
}

function readTopology() {
  const manifest = readProjectManifest();
  const topology = manifest.topology || {};
  const environment = topology.environment || 'local';
  const stateDirectory = path.resolve(projectRoot, resolveTemplate(topology.stateDirectory || `envs/${environment}/generated/local-topology`));
  const backendRuntimes = Object.freeze([].concat((topology.groups || {}).backends || []).map(normalizeRuntime));
  const frontendRuntimes = Object.freeze([].concat((topology.groups || {}).frontends || []).map(normalizeRuntime));
  return { manifest, topology, environment, stateDirectory, statePath: path.join(stateDirectory, 'processes.json'), backendRuntimes, frontendRuntimes };
}

function normalizeRuntime(runtime) {
  return {
    ...runtime,
    cwd: runtime.cwd ? path.resolve(resolveTemplate(runtime.cwd)) : projectRoot,
    readyPath: runtime.readyPath || '/nodics/system/v0/health/ready'
  };
}

export const backendRuntimes = Object.freeze(readTopology().backendRuntimes);
export const frontendRuntimes = Object.freeze(readTopology().frontendRuntimes);

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const healthUrl = runtime => `http://127.0.0.1:${String(runtime.port)}${runtime.readyPath || '/nodics/system/v0/health/ready'}`;

/** Returns whether a local TCP port currently accepts connections. */
export function portListening(port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const finish = value => { socket.destroy(); resolve(value); };
    socket.setTimeout(500);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

/** Loads supervisor state. Missing or invalid generated state is treated as absent. */
export function readState() {
  const topology = readTopology();
  try { return JSON.parse(fs.readFileSync(topology.statePath, 'utf8')); } catch { return null; }
}

/** Proves that a PID still belongs to this checkout's topology supervisor. */
export function isOwnedSupervisor(state, readCommand = pid => execFileSync('ps', ['-p', String(pid), '-o', 'command='], { encoding: 'utf8' })) {
  if (!state || !Number.isInteger(state.supervisorPid) || state.projectRoot !== projectRoot) return false;
  try {
    const command = readCommand(state.supervisorPid);
    return command.includes('defaultProjectTopologyService.mjs') && command.includes('start');
  } catch { return false; }
}

/** Returns the selected topology without allowing arbitrary command injection. */
export function selectRuntimes(includeFrontends = false) {
  const topology = readTopology();
  return includeFrontends ? [...topology.backendRuntimes, ...topology.frontendRuntimes] : [...topology.backendRuntimes];
}

/** Performs non-mutating Local topology checks without opening database connections directly. */
export async function preflight(includeFrontends = false) {
  const topology = readTopology();
  const runtimes = selectRuntimes(includeFrontends);
  const checks = [];
  for (const runtime of runtimes) {
    const cwd = runtime.cwd || projectRoot;
    checks.push({ id: `project:${runtime.code}`, state: fs.existsSync(path.join(cwd, 'package.json')) ? 'PASSED' : 'FAILED', path: cwd });
    checks.push({ id: `port:${runtime.code}`, state: await portListening(runtime.port) ? 'BUSY' : 'AVAILABLE', port: runtime.port });
  }
  const frameworkRoot = process.env.NODICS_FRAMEWORK_ROOT || path.join(workspaceRoot, 'nodics.ai');
  checks.push({ id: 'framework-root', state: fs.existsSync(path.join(frameworkRoot, 'AGENTS.md')) ? 'PASSED' : 'FAILED', path: frameworkRoot });
  checks.push({ id: 'database-authority', state: 'DEFERRED_TO_RUNTIME_READINESS', detail: 'Database connectivity and credentials are validated by Nodics runtime services; preflight never performs direct database access.' });
  return { environment: topology.environment, checkedAt: new Date().toISOString(), checks,
    ready: checks.every(check => !['FAILED', 'BUSY'].includes(check.state)) };
}

async function waitUntilReady(runtime, timeoutMs = 90000) {
  const startedAt = Date.now();
  let lastError = 'not reachable';
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(healthUrl(runtime), { redirect: 'error' });
      if (response.ok) return;
      lastError = `HTTP ${String(response.status)}`;
    } catch (error) { lastError = error.message; }
    await sleep(1000);
  }
  throw new Error(`${runtime.label} readiness timed out: ${lastError}`);
}

async function inspect(runtimes) {
  const topology = readTopology();
  const state = readState();
  const owned = isOwnedSupervisor(state);
  const entries = [];
  for (const runtime of runtimes) {
    const listening = await portListening(runtime.port);
    let ready = false;
    if (listening) {
      try { ready = (await fetch(healthUrl(runtime), { redirect: 'error' })).ok; } catch { ready = false; }
    }
    const recorded = state?.children?.find(child => child.code === runtime.code);
    entries.push({ code: runtime.code, label: runtime.label, port: runtime.port, listening, ready,
      ownership: owned && recorded ? 'THIS_SUPERVISOR' : listening ? 'EXTERNAL_OR_UNKNOWN' : 'NONE' });
  }
  return { environment: topology.environment, supervisor: owned ? 'RUNNING' : 'NOT_RUNNING', supervisorPid: owned ? state.supervisorPid : null, runtimes: entries };
}

async function start(includeFrontends) {
  const topology = readTopology();
  const runtimes = selectRuntimes(includeFrontends);
  const existing = readState();
  if (isOwnedSupervisor(existing)) throw new Error(`${topology.environment} topology is already supervised by PID ${String(existing.supervisorPid)}`);
  const busy = [];
  for (const runtime of runtimes) if (await portListening(runtime.port)) busy.push(`${runtime.label}:${String(runtime.port)}`);
  if (busy.length) throw new Error(`Refusing to start because required ports are busy: ${busy.join(', ')}. Run topology:status and stop the owning process explicitly.`);

  fs.mkdirSync(topology.stateDirectory, { recursive: true });
  const children = [];
  let stopping = false;
  const persist = () => fs.writeFileSync(topology.statePath, JSON.stringify({ contractVersion: 1, environment: topology.environment, projectRoot,
    supervisorPid: process.pid, startedAt: new Date().toISOString(), includeFrontends, children: children.map(entry => ({ code: entry.runtime.code, pid: entry.child.pid, port: entry.runtime.port })) }, null, 2) + '\n');

  const stop = async signal => {
    if (stopping) return;
    stopping = true;
    process.stdout.write(`[topology] stopping ${topology.environment} after ${signal}\n`);
    for (const entry of [...children].reverse()) if (entry.child.exitCode === null) entry.child.kill('SIGTERM');
    const deadline = Date.now() + 15000;
    while (children.some(entry => entry.child.exitCode === null) && Date.now() < deadline) await sleep(250);
    for (const entry of children) if (entry.child.exitCode === null) entry.child.kill('SIGKILL');
    try { fs.unlinkSync(topology.statePath); } catch {}
  };
  process.on('SIGINT', () => stop('SIGINT').then(() => process.exit(0)));
  process.on('SIGTERM', () => stop('SIGTERM').then(() => process.exit(0)));

  try {
    for (const runtime of runtimes) {
      const cwd = runtime.cwd || projectRoot;
      if (!fs.existsSync(path.join(cwd, 'package.json'))) throw new Error(`${runtime.label} project is unavailable at ${cwd}`);
      const command = runtime.command || 'npm';
      const args = runtime.args || ['run', runtime.script];
      const logPath = path.join(topology.stateDirectory, `${runtime.code}.log`);
      const log = fs.openSync(logPath, 'a');
      const child = spawn(command, args, { cwd, env: process.env, stdio: ['ignore', log, log] });
      children.push({ runtime, child });
      persist();
      child.once('exit', code => {
        if (!stopping) {
          process.stderr.write(`[topology] ${runtime.label} exited unexpectedly with code ${String(code)}; stopping the remaining topology; log: ${logPath}\n`);
          stop(`${runtime.label} exit`).then(() => process.exit(code === 0 ? 1 : code || 1));
        }
      });
      await waitUntilReady(runtime);
      process.stdout.write(`[topology] READY ${runtime.label} http://127.0.0.1:${String(runtime.port)}\n`);
    }
    persist();
    process.stdout.write(`[topology] ${topology.environment} is running under supervisor PID ${String(process.pid)}. Use npm run topology:stop or Ctrl+C.\n`);
    await new Promise(resolve => process.once('beforeExit', resolve));
  } catch (error) {
    await stop('startup failure');
    throw error;
  }
}

async function stop() {
  const topology = readTopology();
  const state = readState();
  if (!state) { process.stdout.write('[topology] no generated supervisor state exists\n'); return; }
  if (!isOwnedSupervisor(state)) throw new Error('Generated state is stale or does not identify this checkout supervisor; refusing to signal any PID.');
  process.kill(state.supervisorPid, 'SIGTERM');
  const deadline = Date.now() + 20000;
  while (isOwnedSupervisor(state) && Date.now() < deadline) await sleep(250);
  if (isOwnedSupervisor(state)) throw new Error(`Supervisor PID ${String(state.supervisorPid)} did not stop within 20 seconds`);
  process.stdout.write(`[topology] ${topology.environment} supervisor stopped\n`);
}

async function main() {
  const command = process.argv[2] || 'status';
  const includeFrontends = process.argv.includes('--include-frontends');
  if (command === 'start') return start(includeFrontends);
  if (command === 'stop') return stop();
  if (command === 'preflight') { const result = await preflight(includeFrontends); console.log(JSON.stringify(result, null, 2)); if (!result.ready) process.exitCode = 1; return; }
  if (command === 'status') { console.log(JSON.stringify(await inspect(selectRuntimes(includeFrontends)), null, 2)); return; }
  throw new Error(`Unknown topology command: ${command}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`[topology] FAIL ${error.message}`); process.exitCode = 1; });
}

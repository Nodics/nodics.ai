/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/project/defaultProjectQualificationEvidenceService @description Reusable execution and evidence mechanics. Plans, credentials and deployment identities remain caller-owned. @owner nTooling @layer tooling */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

/** Projects evidence fields without copying step environment secrets. */
export function sanitizeStep(step) {
  return {
    id: step.id,
    owner: step.owner,
    command: [step.command].concat(step.args || []).join(' '),
    destructive: step.destructive === true,
    proves: step.proves,
  };
}

/** Executes a caller-selected plan; importing this helper never launches commands. */
export function executeLocalPlan(plan, options = {}) {
  const spawn = options.spawn || spawnSync;
  const now = options.now || (() => new Date());
  return plan.local.map((step) => {
    const startedAt = now();
    const result = spawn(step.command, step.args || [], {
      cwd: step.cwd,
      env: Object.assign({}, process.env, step.environment || {}),
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    const completedAt = now();
    const exitCode = typeof result.status === 'number' ? result.status : 1;
    return Object.assign(sanitizeStep(step), {
      state: exitCode === 0 ? 'PASSED' : 'FAILED',
      exitCode,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: Math.max(0, completedAt.getTime() - startedAt.getTime()),
      failureCode: result.error ? 'PROCESS_START_FAILED' : exitCode === 0 ? null : 'COMMAND_FAILED',
    });
  });
}

/** Summarizes local evidence without granting production approval. */
export function createReport(plan, localResults, options = {}) {
  const createdAt = (options.now ? options.now() : new Date()).toISOString();
  const results = localResults || plan.local.map((step) => Object.assign(sanitizeStep(step), { state: 'PLANNED' }));
  const report = {
    contractVersion: 0,
    qualificationEnvironment: options.environmentName || null,
    createdAt,
    productionApproved: false,
    summary: {
      passed: results.filter((entry) => entry.state === 'PASSED').length,
      failed: results.filter((entry) => entry.state === 'FAILED').length,
      planned: results.filter((entry) => entry.state === 'PLANNED').length,
      externalPending: plan.external.length,
    },
    localEvidence: results,
    externalEvidence: plan.external,
    decision: 'Local evidence cannot approve production. Named owners must attach external evidence and explicitly accept residual risk.',
  };
  report.sourceCommits = options.sourceCommits || {};
  report.integrity = {
    algorithm: 'sha256',
    digest: createHash('sha256').update(JSON.stringify(report)).digest('hex'),
    meaning: 'Integrity digest for this sanitized report; it is not a human or production approval signature.',
  };
  return report;
}

/** Resolves source commit identities without including remotes, branches, or credentials. */
export function resolveSourceCommits(workspace, spawn = spawnSync) {
  return Object.fromEntries(Object.entries(workspace).map(([name, cwd]) => {
    const result = spawn('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' });
    return [name, result.status === 0 ? String(result.stdout).trim() : 'UNAVAILABLE'];
  }));
}

/** Writes sanitized caller-owned qualification evidence to its selected path. */
export function writeReport(report, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
}

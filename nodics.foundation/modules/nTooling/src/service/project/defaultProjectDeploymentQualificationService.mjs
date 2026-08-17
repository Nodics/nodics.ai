/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();

/**
 * @module nTooling/service/project/defaultProjectDeploymentQualificationService
 * @description Orchestrates sanitized, project-owned deployment qualification evidence without treating local checks as production proof.
 * @layer project tooling
 * @owner nodics.kickoff
 * @override Customer projects may copy this reference pattern and replace repository coordinates, commands, gates, and evidence policy in their own project.
 */

export function resolveWorkspace(environment = process.env) {
  const workspaceRoot = path.resolve(projectRoot, '..');
  const expRoot = path.join(workspaceRoot, 'nodics.exp');
  return {
    kickoff: projectRoot,
    framework: path.resolve(environment.NODICS_QUALIFICATION_FRAMEWORK_ROOT || path.join(workspaceRoot, 'nodics.ai')),
    axis: path.resolve(environment.NODICS_QUALIFICATION_AXIS_ROOT || path.join(expRoot, 'nodics.axis')),
    nexus: path.resolve(environment.NODICS_QUALIFICATION_NEXUS_ROOT || path.join(expRoot, 'nodics.nexus')),
    agora: path.resolve(environment.NODICS_QUALIFICATION_AGORA_ROOT || path.join(expRoot, 'nodics.agora')),
  };
}

export function createQualificationPlan(options = {}) {
  const workspace = options.workspace || resolveWorkspace(options.environment);
  const includeFresh = options.includeFresh === true;
  const local = [
    {
      id: 'publishing-capacity-baseline', owner: 'nodics publishing', cwd: workspace.kickoff,
      command: 'npm', args: ['run', 'qualification:publishing-capacity'],
      proves: 'Bounded Local freeze, media promotion, deploy, activation, delivery, retry, transaction, and rollback regression timings.',
    },
    {
      id: 'publishing-sustained-reliability', owner: 'nodics publishing', cwd: workspace.kickoff,
      command: 'npm', args: ['run', 'qualification:publishing-soak'],
      proves: 'Twenty-five repeated Local contract cycles covering lifecycle, manifest, workflow, outbox, audit reconciliation, and media retention within bounded time and memory growth.',
    },
    {
      id: 'automated-security-boundary', owner: 'nodics security', cwd: workspace.kickoff,
      command: 'npm', args: ['run', 'qualification:security-boundary'],
      proves: 'Automated Local authentication, authorization, cache mutation, import/export, remote transport, BackOffice, Engagement, publication authority, and atomic-audit boundaries.',
    },
    {
      id: 'framework-release', owner: 'nodics.ai', cwd: workspace.framework,
      command: 'npm', args: ['run', 'release:check', '--', '--execute', '--full'],
      proves: 'Clean framework build, governance, generated contracts, dependency audit, and full automated suite.',
    },
    {
      id: 'project-retained-acceptance', owner: 'nodics.kickoff', cwd: workspace.kickoff,
      command: 'npm', args: ['run', 'acceptance:local'],
      proves: 'Integrated retained-data runtime, documentation, module lifecycle, Axis smoke, governed export/import, rejection, rollback, retirement, recovery, and reconciliation journey.',
    },
    {
      id: 'axis-verification', owner: 'nodics.axis', cwd: workspace.axis,
      command: 'npm', args: ['run', 'verify'],
      proves: 'Formatting, lint, type safety, automated accessibility-oriented component contracts, tests, and production bundle.',
    },
    {
      id: 'nexus-verification', owner: 'nodics.nexus', cwd: workspace.nexus,
      command: 'npm', args: ['run', 'verify'],
      proves: 'Public delivery client tests, type safety, lint, and production bundle remain compatible with Online-only delivery.',
    },
    {
      id: 'agora-verification', owner: 'nodics.agora', cwd: workspace.agora,
      command: 'npm', args: ['run', 'verify:multi-domain'],
      proves: 'Storefront component composition, domain renderer mapping, Commerce client contracts, and multi-domain customer journey bundle remain compatible with Kickoff data.',
    },
    {
      id: 'redis-cache-live', owner: 'nodics.foundation/nCache', cwd: workspace.framework,
      command: process.execPath,
      args: ['nodics.foundation/modules/nCache/redisCache/test/cacheRedisLive.test.js', '--require-live'],
      environment: { NODICS_CACHE_REDIS_URL: process.env.NODICS_CACHE_REDIS_URL || 'redis://127.0.0.1:6379' },
      proves: 'Cache adapter behavior against a real Redis endpoint.',
    },
    {
      id: 'redis-backoffice-registry-live', owner: 'nodics.platform/backoffice', cwd: workspace.framework,
      command: process.execPath,
      args: ['nodics.platform/modules/backoffice/test/backofficeDistributedRegistryStoreLive.test.js', '--require-live'],
      environment: { NODICS_CACHE_REDIS_URL: process.env.NODICS_CACHE_REDIS_URL || 'redis://127.0.0.1:6379' },
      proves: 'Distributed registry visibility, leases, and concurrency against a real Redis endpoint.',
    },
  ];
  if (includeFresh) {
    local.splice(2, 0, {
      id: 'project-fresh-acceptance', owner: 'nodics.kickoff', cwd: workspace.kickoff,
      command: 'npm', args: ['run', 'acceptance:local:fresh'], destructive: true,
      proves: 'Bounded rebuild of only the documented Kickoff local databases and complete bootstrap journey.',
    });
  }
  const external = [
    ['peak-load', 'Performance owner', 'Production-like p95/p99, error-rate, throughput, queue-age, projection-lag, and integrity evidence.'],
    ['soak', 'Operations owner', 'Sustained workload evidence covering leaks, retry growth, drift, and storage/index growth.'],
    ['penetration', 'Security owner', 'Authenticated, tenant-isolation, input, replay, export, webhook, and privilege-escalation assessment.'],
    ['managed-cache-failover', 'Platform owner', 'Managed Redis TLS/authentication, topology, tenant isolation, failover, and recovery evidence.'],
    ['backup-restore', 'Data owner', 'Authoritative restore plus projection rebuild with reconciled counts and hashes.'],
    ['regional-residency', 'Infrastructure and privacy owners', 'Allowed-region routing, evacuation, deletion propagation, and leakage assessment.'],
    ['rpo-rto', 'Operations owner', 'Measured recovery point and recovery time against approved targets.'],
    ['external-providers', 'Provider owners', 'Real credentials, callbacks, consent, residency, observability, failure handling, and rollback.'],
    ['human-accessibility', 'Accessibility owner', 'Keyboard, screen reader, zoom/reflow, contrast, browser, and supported-device journeys.'],
  ].map(([id, owner, completionCriterion]) => ({ id, owner, completionCriterion, state: 'NOT_EXECUTED' }));
  return { local, external };
}

export function sanitizeStep(step) {
  return {
    id: step.id,
    owner: step.owner,
    command: [step.command].concat(step.args || []).join(' '),
    destructive: step.destructive === true,
    proves: step.proves,
  };
}

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

export function createReport(plan, localResults, options = {}) {
  const createdAt = (options.now ? options.now() : new Date()).toISOString();
  const results = localResults || plan.local.map((step) => Object.assign(sanitizeStep(step), { state: 'PLANNED' }));
  const report = {
    contractVersion: 1,
    qualificationEnvironment: options.environmentName || 'kickoffLocal',
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

export function writeReport(report, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
}

async function main() {
  const executeLocal = process.argv.includes('--execute-local');
  const includeFresh = process.argv.includes('--include-fresh');
  const requireExternal = process.argv.includes('--require-external');
  const plan = createQualificationPlan({ includeFresh });
  const localResults = executeLocal ? executeLocalPlan(plan) : null;
  const workspace = resolveWorkspace();
  const report = createReport(plan, localResults, { sourceCommits: resolveSourceCommits(workspace) });
  if (executeLocal) {
    const outputPath = path.join(projectRoot, 'envs', 'kickoffLocal', 'generated', 'deployment-qualification', 'latest.json');
    writeReport(report, outputPath);
    console.log('Deployment qualification evidence: ' + outputPath);
  } else {
    console.log(JSON.stringify(report, null, 2));
    console.log('Run with --execute-local to execute safe local gates; add --include-fresh only for the bounded local database reset.');
  }
  if (report.summary.failed > 0 || (requireExternal && report.summary.externalPending > 0)) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) await main();

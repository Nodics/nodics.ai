/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const frameworkRoot = fileURLToPath(new URL('../../../../../../', import.meta.url));

/**
 * @module nTooling/project/defaultDeploymentQualificationService
 * @description Orchestrates sanitized, framework-owned deployment qualification evidence without treating local checks as production proof.
 * @layer tooling
 * @owner nTooling
 * Customer projects supply deployment coordinates; canonical gates remain framework-owned.
 */

export function resolveWorkspace(environment = process.env) {
  return { project: path.resolve(environment.NODICS_PROJECT_ROOT || process.cwd()), framework: frameworkRoot };
}

export function createQualificationPlan(options = {}) {
  const workspace = options.workspace || resolveWorkspace(options.environment);
  if (!workspace.project || !workspace.framework) throw new Error('Explicit project and framework workspace paths are required');
  const tool = path.join(workspace.framework, 'nodics.foundation/modules/nTooling/bin/nodics-tool.js');
  const includeFresh = options.includeFresh === true;
  const local = [
    {
      id: 'publishing-capacity-baseline', owner: 'nodics publishing', cwd: workspace.project,
      command: process.execPath, args: [tool, 'qualification:publishing-capacity', '--home=' + workspace.framework],
      proves: 'Bounded Local freeze, media promotion, deploy, activation, delivery, retry, transaction, and rollback regression timings.',
    },
    {
      id: 'publishing-sustained-reliability', owner: 'nodics publishing', cwd: workspace.project,
      command: process.execPath, args: [tool, 'qualification:publishing-soak', '--home=' + workspace.framework],
      proves: 'Twenty-five repeated Local contract cycles covering lifecycle, manifest, workflow, outbox, audit reconciliation, and media retention within bounded time and memory growth.',
    },
    {
      id: 'automated-security-boundary', owner: 'nodics security', cwd: workspace.project,
      command: process.execPath, args: [tool, 'qualification:security-boundary', '--home=' + workspace.framework],
      proves: 'Automated Local authentication, authorization, cache mutation, import/export, remote transport, BackOffice, Engagement, publication authority, and atomic-audit boundaries.',
    },
    {
      id: 'framework-release', owner: 'nodics.ai', cwd: workspace.framework,
      command: 'npm', args: ['run', 'release:check', '--', '--execute', '--full'],
      proves: 'Clean framework build, governance, generated contracts, dependency audit, and full automated suite.',
    },
    {
      id: 'project-retained-acceptance', owner: 'customer project', cwd: workspace.project,
      command: 'npm', args: ['run', 'acceptance:local', '--', '--execute', '--approve-publications'],
      proves: 'Customer-supplied retained-data journey evidence. This does not substitute for canonical framework contract gates.',
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
      id: 'project-fresh-acceptance', owner: 'customer project', cwd: workspace.project,
      command: 'npm', args: ['run', 'acceptance:local:fresh', '--', '--execute', '--approve-publications'], destructive: true,
      proves: 'Bounded rebuild of only the documented selected Local databases and complete bootstrap journey.',
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

import * as evidence from './defaultProjectQualificationEvidenceService.mjs';
import { readProjectEnvironmentConfiguration } from './defaultProjectEnvironmentConfigurationService.mjs';
export const { sanitizeStep, executeLocalPlan, resolveSourceCommits, writeReport, createReport } = evidence;

async function main() {
  const projectRoot = resolveWorkspace().project;
  const selected = readProjectEnvironmentConfiguration(projectRoot, process.env.ENV || '');
  if (!/Local$/u.test(selected.environment || '')) throw new Error('This qualification plan requires an explicitly selected Local environment');
  const executeLocal = process.argv.includes('--execute-local');
  const includeFresh = process.argv.includes('--include-fresh');
  const requireExternal = process.argv.includes('--require-external');
  const plan = createQualificationPlan({ includeFresh });
  const localResults = executeLocal ? executeLocalPlan(plan) : null;
  const workspace = resolveWorkspace();
  const report = createReport(plan, localResults, { environmentName: selected.environment, sourceCommits: resolveSourceCommits(workspace) });
  if (executeLocal) {
    const outputPath = path.join(projectRoot, 'envs', selected.environment, 'generated', 'deployment-qualification', 'latest.json');
    writeReport(report, outputPath);
    console.log('Deployment qualification evidence: ' + outputPath);
  } else {
    console.log(JSON.stringify(report, null, 2));
    console.log('Run with --execute-local to execute qualification gates; these include builds, dependency checks and live acceptance. Add --include-fresh only for the bounded Local reset.');
  }
  if (report.summary.failed > 0 || (requireExternal && report.summary.externalPending > 0)) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('Local qualification plan: --execute-local runs the gates; --include-fresh additionally requests a bounded reset. No production approval is inferred.');
  else await main();
}

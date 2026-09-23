#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectPostResetReadinessService
 * @description Builds a post-reset readiness evidence report from existing project environment and acceptance configuration.
 * @layer tooling
 * @owner nTooling
 */

import { readProjectEnvironmentConfiguration, projectEndpointUrl } from './defaultProjectEnvironmentConfigurationService.mjs';

const sectionDefinitions = Object.freeze([
  ['bootstrap', 'Bootstrap and admin access'],
  ['runtimes', 'Runtime topology and heartbeat'],
  ['runtimeCommunication', 'Runtime internal communication'],
  ['moduleRegistry', 'Module registry activation'],
  ['imports', 'Data import releases'],
  ['manifestRepair', 'Manifest and descriptor repair'],
  ['publishing', 'Publication readiness'],
  ['approval', 'Process approval tasks'],
  ['documentation', 'Documentation publishing and indexing'],
  ['media', 'Media objects and references'],
  ['search', 'Search index and read-source policy'],
  ['assistant', 'Assistant knowledge sources'],
  ['applications', 'Circa, Nexus, Agora parity'],
  ['browserValidation', 'Browser validation evidence'],
  ['diagnostics', 'Support-safe diagnostics export'],
]);

function optionValue(args, name, fallback = '') {
  const prefix = `--${name}=`;
  const inline = args.find(argument => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function safeState(condition, liveRequested = false) {
  if (condition === true) return 'READY';
  if (condition === false) return liveRequested ? 'FAILED' : 'NEEDS_ATTENTION';
  return 'SKIPPED';
}

async function probeUrl(url, timeoutMs = 2000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return { ok: response.ok, status: response.status, url };
  } catch (error) {
    return { ok: false, error: error && error.name === 'AbortError' ? 'TIMEOUT' : String(error && error.message || error), url };
  } finally {
    clearTimeout(timeout);
  }
}

function runtimeEvidence(configuration) {
  return (configuration.topology?.groups?.backends || []).map(runtime => ({
    server: runtime.server || runtime.code,
    role: runtime.role,
    label: runtime.label,
    endpoint: runtime.port ? `http://${runtime.host || 'localhost'}:${String(runtime.port)}` : undefined,
    state: runtime.enabled === false ? 'SKIPPED' : 'EXPECTED',
  }));
}

function commandEvidence(configuration, command, args = []) {
  return {
    command,
    args,
    environment: configuration.environment,
    evidenceOnly: true,
  };
}

function section(id, title, state, message, evidence = {}, nextAction = '') {
  return { id, title, state, message, evidence, nextAction };
}

function derivePublicationProfiles(configuration) {
  const guided = configuration.acceptance?.guidedInitialization || {};
  return []
    .concat(guided.publicationProfiles || [])
    .concat(guided.profileCode || [])
    .filter(Boolean);
}

function deriveRuntimeUrl(configuration, selector) {
  try {
    return projectEndpointUrl(configuration, selector);
  } catch (error) {
    return undefined;
  }
}

export async function buildPostResetReadinessReport(projectRoot, environmentCode = '', options = {}) {
  const configuration = readProjectEnvironmentConfiguration(projectRoot, environmentCode);
  const live = options.live === true;
  const platformUrl = deriveRuntimeUrl(configuration, configuration.acceptance?.functionalJourney?.runtimes?.platform || { role: 'PLATFORM' });
  const browserValidationEnabled = configuration.acceptance?.browserValidation?.enabled === true;
  const runtimes = runtimeEvidence(configuration);
  const liveProbe = live && platformUrl
    ? await probeUrl(new URL('/nodics/backoffice', platformUrl).toString(), options.timeoutMs)
    : undefined;
  const sections = [
    section('bootstrap', 'Bootstrap and admin access', 'NEEDS_ATTENTION',
      'Verify startupValidation bootstrapChecks and default-risk acknowledgements in Axis.',
      { route: '/dashboard', reportSource: 'backoffice.startupValidation' },
      'Open Axis dashboard and resolve missing bootstrap identity, admin password, or runtime API key findings.'),
    section('runtimes', 'Runtime topology and heartbeat', runtimes.length ? safeState(!live || !liveProbe || liveProbe.ok, live) : 'FAILED',
      runtimes.length ? 'Runtime expectations were derived from environment server metadata.' : 'No runnable backend runtimes were discovered.',
      { runtimes, liveProbe },
      runtimes.length ? 'Use Module Registry for stale/offline heartbeat drill-down.' : 'Add/repair environment server package metadata.'),
    section('runtimeCommunication', 'Runtime internal communication', 'NEEDS_ATTENTION',
      'Verify server-level API keys, grants, module registration, and remote runtime proof after reset.',
      { route: '/system/integrations', reportSource: 'nService.runtimeIdentity' },
      'Open System Integrations or Module Registry and inspect offline/stale runtime causes.'),
    section('moduleRegistry', 'Module registry activation', 'NEEDS_ATTENTION',
      'Confirm required modules are registered, active, and have their expected runtime role.',
      { route: '/system/modules', runtimeCount: runtimes.length },
      'Open Module Registry and resolve missing runtime, inactive module, or activation data blockers.'),
    section('imports', 'Data import releases', 'NEEDS_ATTENTION',
      'Validate Foundation, Media, Publishing, Application Content, and Project Accelerator release groups.',
      { route: '/operations/imports-exports', dryRunRecommended: true },
      'Run import dry-run/validation before install and follow grouped readiness order.'),
    section('manifestRepair', 'Manifest and descriptor repair', 'NEEDS_ATTENTION',
      'Invalid release manifests and descriptors require source/tooling repair before browser import.',
      { command: 'project:data-manifests', descriptor: 'release.descriptor.json optional' },
      'Refresh generated manifests or repair the owning module source descriptor.'),
    section('publishing', 'Publication readiness', 'NEEDS_ATTENTION',
      'Confirm Staged, approval, Online pointer, media, search, and runtime dependencies.',
      { route: '/publishing/setup', publicationProfiles: derivePublicationProfiles(configuration) },
      'Open Publishing and Setup & Accelerators; approve only after dependencies are green.'),
    section('approval', 'Process approval tasks', 'NEEDS_ATTENTION',
      'Confirm governed Process workflow/task availability for pending publication requests.',
      { route: '/process/approval-queue', reportSource: 'approvalDiagnostic' },
      'Repair missing workflow references, assignees, or Process runtime before retrying approval.'),
    section('documentation', 'Documentation publishing and indexing', 'NEEDS_ATTENTION',
      'Confirm docs packs are installed, approved, Online, indexed, and searchable.',
      { route: '/docs/dashboard' },
      'Install/publish docs packs and rebuild knowledge/search indexes where configured.'),
    section('media', 'Media objects and references', 'NEEDS_ATTENTION',
      'Confirm media object creation, physical transfer evidence, and consuming model references.',
      { route: '/media' },
      'Review media transfer manifests, target receipts, and reference readiness.'),
    section('search', 'Search index and read-source policy', 'NEEDS_ATTENTION',
      'Confirm DB/search read-source policy and index freshness for rendered pages.',
      { route: '/discovery', reportSource: 'nSearch' },
      'Use runtime configuration and Discovery readiness before switching rendering to search.'),
    section('assistant', 'Assistant knowledge sources', 'NEEDS_ATTENTION',
      'Confirm assistant knowledge source installation, publication, indexing, and authorization.',
      { route: '/assistant', reportSource: 'assistant.knowledge' },
      'Index approved docs/knowledge sources before treating assistant answers as verified.'),
    section('applications', 'Circa, Nexus, Agora parity', 'NEEDS_ATTENTION',
      'Validate customer-facing app profiles through the same import/publication/runtime evidence.',
      { publicationProfiles: derivePublicationProfiles(configuration) },
      'Check each profile for Online state, media/search dependencies, and browser smoke where enabled.'),
    section('browserValidation', 'Browser validation evidence', browserValidationEnabled ? 'NEEDS_ATTENTION' : 'SKIPPED',
      browserValidationEnabled ? 'Browser validation is enabled for this environment.' : 'Browser validation skipped by configuration.',
      { enabled: browserValidationEnabled, localOnly: true },
      browserValidationEnabled ? 'Capture configured local browser evidence.' : 'Enable only in local environments where browser/frontend URLs are available.'),
    section('diagnostics', 'Support-safe diagnostics export', 'READY',
      'This report is path-light and secret-free; attach it to support/debug threads when investigating reset recovery.',
      { generatedAt: new Date().toISOString() },
      'Use --json for machine-readable evidence.'),
  ];
  const summary = sections.reduce((result, item) => {
    result.total++;
    result[item.state] = (result[item.state] || 0) + 1;
    return result;
  }, { total: 0 });
  return {
    contractVersion: 1,
    projectCode: configuration.projectCode,
    environment: configuration.environment,
    generatedAt: new Date().toISOString(),
    live,
    summary,
    sections,
    commands: [
      commandEvidence(configuration, 'project:topology', ['status']),
      commandEvidence(configuration, 'project:data-manifests', []),
      commandEvidence(configuration, 'project:container-qualification', ['acceptance']),
    ],
  };
}

export function formatPostResetReadinessReport(report) {
  const lines = [
    `Post-reset readiness: ${report.projectCode} / ${report.environment}`,
    `Summary: ${Object.entries(report.summary).map(([key, value]) => `${key}=${String(value)}`).join(', ')}`,
    '',
  ];
  report.sections.forEach(item => {
    lines.push(`[${item.state}] ${item.title}`);
    lines.push(`  ${item.message}`);
    if (item.nextAction) lines.push(`  Next: ${item.nextAction}`);
  });
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const projectRoot = process.env.NODICS_PROJECT_ROOT || process.env.NODICS_HOME || process.cwd();
  const environmentCode = optionValue(args, 'environment', optionValue(args, 'env', ''));
  const report = await buildPostResetReadinessReport(projectRoot, environmentCode, {
    live: args.includes('--live'),
    timeoutMs: Number(optionValue(args, 'timeout-ms', '2000')),
  });
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else console.log(formatPostResetReadinessReport(report));
  if ((report.summary.FAILED || 0) > 0) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error && error.stack || error);
    process.exitCode = 1;
  });
}

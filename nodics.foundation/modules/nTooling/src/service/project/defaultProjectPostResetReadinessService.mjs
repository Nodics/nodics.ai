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

import fs from 'node:fs/promises';
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
  if (condition === false) return liveRequested ? 'NOT_READY' : 'NEEDS_ATTENTION';
  return 'SKIPPED';
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function redactString(value) {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/g, 'Bearer [REDACTED]')
    .replace(/([?&](?:access_token|token|apiKey|api_key|password)=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/(token|apiKey|api_key|password)(["':=\s]+)[A-Za-z0-9._~+/=-]{8,}/gi, '$1$2[REDACTED]');
}

function redact(value) {
  if (typeof value === 'string') return redactString(value);
  if (Array.isArray(value)) return value.map(item => redact(item));
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if (/token|password|secret|apikey|api_key|authorization/i.test(key)) return [key, '[REDACTED]'];
    return [key, redact(item)];
  }));
}

function classifyHttpStatus(status) {
  if (status === 401 || status === 403) return 'UNAUTHORIZED';
  if (status === 404) return 'NOT_CONFIGURED';
  if (status >= 400) return 'NOT_READY';
  return 'READY';
}

function liveSkipped(reason) {
  return { ok: false, state: 'SKIPPED', reason };
}

async function readAccessToken(options = {}) {
  if (options.accessToken && String(options.accessToken).trim()) return String(options.accessToken).trim();
  if (options.accessTokenFile && String(options.accessTokenFile).trim()) {
    return String(await fs.readFile(String(options.accessTokenFile), 'utf8')).trim();
  }
  if (process.env.NODICS_BACKOFFICE_ACCESS_TOKEN) return process.env.NODICS_BACKOFFICE_ACCESS_TOKEN.trim();
  return '';
}

async function fetchJson(url, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') {
    return { ok: false, state: 'UNREACHABLE', url, error: 'fetch unavailable' };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 2000);
  try {
    const headers = {
      Accept: 'application/json',
      'x-nodics-client-contract-version': String(options.clientContractVersion || 1),
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    };
    const response = await fetchImpl(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
    });
    const base = { ok: response.ok, status: response.status, state: classifyHttpStatus(response.status), url };
    if (!response.ok) return base;
    try {
      const body = await response.json();
      return { ...base, data: isRecord(body) && isRecord(body.data) ? body.data : body };
    } catch (error) {
      return { ...base, ok: false, state: 'NOT_READY', error: `Invalid JSON: ${String(error && error.message || error)}` };
    }
  } catch (error) {
    return { ok: false, state: 'UNREACHABLE', error: error && error.name === 'AbortError' ? 'TIMEOUT' : String(error && error.message || error), url };
  } finally {
    clearTimeout(timeout);
  }
}

async function authenticatedBackofficeBootstrap(platformUrl, options = {}) {
  if (!options.live) return liveSkipped('Live mode was not requested.');
  if (!platformUrl) return { ok: false, state: 'NOT_CONFIGURED', reason: 'Platform URL is not available from environment topology.' };
  let accessToken = '';
  try {
    accessToken = await readAccessToken(options);
  } catch (error) {
    return { ok: false, state: 'NOT_CONFIGURED', reason: `Access token file is unreadable: ${String(error && error.message || error)}` };
  }
  if (!accessToken) {
    return {
      ok: false,
      state: 'NOT_CONFIGURED',
      reason: 'No BackOffice access token supplied. Use --access-token, --access-token-file, or NODICS_BACKOFFICE_ACCESS_TOKEN.',
      url: new URL('/nodics/backoffice/v0/bootstrap', platformUrl).toString(),
    };
  }
  return fetchJson(new URL('/nodics/backoffice/v0/bootstrap', platformUrl).toString(), {
    ...options,
    accessToken,
    clientContractVersion: options.clientContractVersion || 1,
  });
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
  return redact({ id, title, state, message, evidence, nextAction });
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

function summarizeStartupValidation(startupValidation) {
  if (!isRecord(startupValidation)) return undefined;
  const summary = isRecord(startupValidation.summary) ? startupValidation.summary : {};
  const bootstrapChecks = isRecord(startupValidation.bootstrapChecks) ? startupValidation.bootstrapChecks : {};
  return {
    state: String(startupValidation.state || 'NOT_READY'),
    checkedAt: startupValidation.checkedAt,
    source: startupValidation.source,
    total: Number(summary.total || 0),
    errors: Number(summary.errors || 0),
    warnings: Number(summary.warnings || 0),
    acknowledged: Number(summary.acknowledged || 0),
    bootstrap: {
      total: Number(bootstrapChecks.total || 0),
      ready: Number(bootstrapChecks.ready || 0),
      missing: Number(bootstrapChecks.missing || 0),
      needsAttention: Number(bootstrapChecks.needsAttention || 0),
    },
    firstFinding: safeArray(startupValidation.findings)[0] ? redact({
      code: safeArray(startupValidation.findings)[0].code,
      severity: safeArray(startupValidation.findings)[0].severity,
      owner: safeArray(startupValidation.findings)[0].owner,
      message: safeArray(startupValidation.findings)[0].message,
      action: safeArray(startupValidation.findings)[0].action,
    }) : undefined,
  };
}

function summarizeModuleConnections(modules) {
  if (!isRecord(modules)) return { moduleCount: 0, runtimeCount: 0, offlineCount: 0, modules: [] };
  const summaries = Object.entries(modules).map(([moduleName, entries]) => {
    const connections = safeArray(entries);
    const offline = connections.filter(entry => isRecord(entry) && !['ACTIVE', 'READY', 'ONLINE'].includes(String(entry.state || '').toUpperCase()));
    return {
      moduleName,
      runtimeCount: connections.length,
      offlineCount: offline.length,
      servers: connections.map(entry => isRecord(entry) ? entry.server || entry.instanceId : undefined).filter(Boolean),
    };
  });
  return {
    moduleCount: summaries.length,
    runtimeCount: summaries.reduce((sum, item) => sum + item.runtimeCount, 0),
    offlineCount: summaries.reduce((sum, item) => sum + item.offlineCount, 0),
    modules: summaries,
  };
}

function summarizeApplicationProfiles(profiles) {
  const items = safeArray(profiles);
  const statuses = items.map(item => isRecord(item) ? String(item.readiness || item.status || 'CONFIGURED') : 'CONFIGURED');
  return {
    total: items.length,
    ready: statuses.filter(status => ['READY', 'ONLINE_READY', 'CONFIGURED'].includes(status)).length,
    pending: statuses.filter(status => !['READY', 'ONLINE_READY', 'CONFIGURED'].includes(status)).length,
    profiles: items.map(item => isRecord(item) ? {
      code: item.code,
      title: item.title,
      readiness: item.readiness || item.status || 'CONFIGURED',
      requiredServers: safeArray(item.requiredServers),
    } : undefined).filter(Boolean),
  };
}

function summarizeDocumentationSources(sources) {
  const items = safeArray(sources);
  return {
    total: items.length,
    onlineReady: items.filter(item => isRecord(item) && ['READY', 'ONLINE', 'PUBLISHED'].includes(String(item.readiness || item.status || '').toUpperCase())).length,
    actionRequired: items.filter(item => isRecord(item) && ['NOT_READY', 'FAILED', 'PUBLICATION_PENDING', 'IMPORTED'].includes(String(item.readiness || item.status || '').toUpperCase())).length,
    sources: items.map(item => isRecord(item) ? {
      id: item.id,
      label: item.label,
      type: item.type,
      route: item.route,
      readiness: item.readiness || item.status,
    } : undefined).filter(Boolean),
  };
}

function optionalReadinessRecord(data, names) {
  if (!isRecord(data)) return undefined;
  for (const name of names) {
    if (isRecord(data[name])) return data[name];
  }
  return undefined;
}

function operationalReadinessSection(report, key) {
  if (!isRecord(report)) return undefined;
  return safeArray(report.sections).find(item => isRecord(item) && item.key === key);
}

function operationalSectionState(section, liveBootstrap, fallback = 'NEEDS_ATTENTION') {
  if (!section) return fallback;
  const status = String(section.businessStatus || '').toUpperCase();
  if (status === 'READY') return 'READY';
  if (status === 'NOT_READY' || status === 'BLOCKED') return 'NOT_READY';
  if (status === 'NOT_EXPOSED' || status === 'NEEDS_ATTENTION') return stateFromLive('NOT_READY', liveBootstrap, false);
  return fallback;
}

function stateFromLive(baseState, liveResult, ready = false) {
  if (!liveResult || liveResult.state === 'SKIPPED') return baseState;
  if (!liveResult.ok) return liveResult.state;
  return ready ? 'READY' : baseState;
}

function exitCodeForSummary(summary) {
  if ((summary.UNAUTHORIZED || 0) > 0) return 2;
  if ((summary.UNREACHABLE || 0) > 0) return 3;
  if ((summary.NOT_CONFIGURED || 0) > 0) return 4;
  if ((summary.NOT_READY || 0) > 0 || (summary.FAILED || 0) > 0 || (summary.NEEDS_ATTENTION || 0) > 0) return 1;
  return 0;
}

export async function buildPostResetReadinessReport(projectRoot, environmentCode = '', options = {}) {
  const configuration = readProjectEnvironmentConfiguration(projectRoot, environmentCode);
  const live = options.live === true;
  const platformUrl = deriveRuntimeUrl(configuration, configuration.acceptance?.functionalJourney?.runtimes?.platform || { role: 'PLATFORM' });
  const browserValidationEnabled = configuration.acceptance?.browserValidation?.enabled === true;
  const runtimes = runtimeEvidence(configuration);
  const liveBootstrap = await authenticatedBackofficeBootstrap(platformUrl, {
    ...options,
    live,
    fetchImpl: options.fetchImpl,
  });
  const bootstrapData = isRecord(liveBootstrap.data) ? liveBootstrap.data : {};
  const startupValidation = summarizeStartupValidation(bootstrapData.startupValidation);
  const moduleConnections = summarizeModuleConnections(bootstrapData.modules);
  const applications = summarizeApplicationProfiles(bootstrapData.applicationInitializationProfiles);
  const documentation = summarizeDocumentationSources(bootstrapData.documentationSources);
  const operationalReadiness = isRecord(bootstrapData.operationalReadiness) ? bootstrapData.operationalReadiness : undefined;
  const importSection = operationalReadinessSection(operationalReadiness, 'imports');
  const publishingSection = operationalReadinessSection(operationalReadiness, 'publishing');
  const approvalSection = operationalReadinessSection(operationalReadiness, 'approval');
  const mediaSection = operationalReadinessSection(operationalReadiness, 'media');
  const searchSection = operationalReadinessSection(operationalReadiness, 'search');
  const assistantSection = operationalReadinessSection(operationalReadiness, 'assistant');
  const applicationSection = operationalReadinessSection(operationalReadiness, 'applications');
  const documentationSection = operationalReadinessSection(operationalReadiness, 'documentation');
  const importReadiness = optionalReadinessRecord(bootstrapData, ['importReadiness', 'dataImportReadiness', 'releases']);
  const publishingReadiness = optionalReadinessRecord(bootstrapData, ['publishingReadiness', 'publicationReadiness', 'publication']);
  const approvalReadiness = optionalReadinessRecord(bootstrapData, ['approvalDiagnostic', 'approvalReadiness']);
  const mediaReadiness = optionalReadinessRecord(bootstrapData, ['mediaReadiness', 'media']);
  const searchReadiness = optionalReadinessRecord(bootstrapData, ['searchReadiness', 'discoveryReadiness', 'search']);
  const assistantReadiness = optionalReadinessRecord(bootstrapData, ['assistantReadiness', 'knowledgeReadiness', 'assistant']);
  const bootstrapState = live
    ? (liveBootstrap.ok ? (startupValidation?.state === 'READY' ? 'READY' : 'NOT_READY') : liveBootstrap.state)
    : 'NEEDS_ATTENTION';
  const runtimeState = runtimes.length
    ? stateFromLive(safeState(!live || liveBootstrap.state === 'SKIPPED' || liveBootstrap.ok, live), liveBootstrap, moduleConnections.runtimeCount > 0 && moduleConnections.offlineCount === 0)
    : 'FAILED';
  const registryState = liveBootstrap.ok && moduleConnections.runtimeCount > 0 && moduleConnections.offlineCount === 0 ? 'READY' : stateFromLive('NEEDS_ATTENTION', liveBootstrap, false);
  const applicationState = liveBootstrap.ok && applications.total > 0 && applications.pending === 0 ? 'READY' : stateFromLive('NEEDS_ATTENTION', liveBootstrap, false);
  const documentationState = liveBootstrap.ok && documentation.total > 0 && documentation.actionRequired === 0 ? 'READY' : stateFromLive('NEEDS_ATTENTION', liveBootstrap, false);
  const sections = [
    section('bootstrap', 'Bootstrap and admin access', bootstrapState,
      live ? 'Authenticated BackOffice bootstrap and startup validation were evaluated.' : 'Verify startupValidation bootstrapChecks and default-risk acknowledgements in Axis.',
      { route: '/dashboard', reportSource: 'backoffice.startupValidation', platformUrl, liveBootstrap: redact({ ...liveBootstrap, data: undefined }), startupValidation },
      'Open Axis dashboard and resolve missing bootstrap identity, admin password, or runtime API key findings.'),
    section('runtimes', 'Runtime topology and heartbeat', runtimeState,
      runtimes.length ? 'Runtime expectations were derived from environment server metadata.' : 'No runnable backend runtimes were discovered.',
      { runtimes, liveBootstrap: redact({ ...liveBootstrap, data: undefined }), moduleConnections },
      runtimes.length ? 'Use Module Registry for stale/offline heartbeat drill-down.' : 'Add/repair environment server package metadata.'),
    section('runtimeCommunication', 'Runtime internal communication', 'NEEDS_ATTENTION',
      'Verify server-level API keys, grants, module registration, and remote runtime proof after reset.',
      { route: '/system/integrations', reportSource: 'nService.runtimeIdentity', moduleConnections },
      'Open System Integrations or Module Registry and inspect offline/stale runtime causes.'),
    section('moduleRegistry', 'Module registry activation', registryState,
      'Confirm required modules are registered, active, and have their expected runtime role.',
      { route: '/system/modules', runtimeCount: runtimes.length, moduleConnections },
      'Open Module Registry and resolve missing runtime, inactive module, or activation data blockers.'),
    section('imports', 'Data import releases', importSection ? operationalSectionState(importSection, liveBootstrap) : importReadiness ? stateFromLive('NOT_READY', liveBootstrap, String(importReadiness.state || importReadiness.readiness || '').toUpperCase() === 'READY') : 'NEEDS_ATTENTION',
      importSection ? 'BackOffice returned canonical data import readiness guidance.' : importReadiness ? 'BackOffice returned data import readiness evidence.' : 'Validate Foundation, Media, Publishing, Application Content, and Project Accelerator release groups.',
      { route: '/operations/imports-exports', dryRunRecommended: true, readiness: importSection || importReadiness },
      'Run import dry-run/validation before install and follow grouped readiness order.'),
    section('manifestRepair', 'Manifest and descriptor repair', 'NEEDS_ATTENTION',
      'Invalid release manifests and descriptors require source/tooling repair before browser import.',
      { command: 'project:data-manifests', descriptor: 'release.descriptor.json optional' },
      'Refresh generated manifests or repair the owning module source descriptor.'),
    section('publishing', 'Publication readiness', publishingSection ? operationalSectionState(publishingSection, liveBootstrap) : publishingReadiness ? stateFromLive('NOT_READY', liveBootstrap, String(publishingReadiness.state || publishingReadiness.readiness || '').toUpperCase() === 'READY') : 'NEEDS_ATTENTION',
      publishingSection ? 'BackOffice returned canonical publication readiness guidance.' : publishingReadiness ? 'BackOffice returned publication dependency readiness evidence.' : 'Confirm Staged, approval, Online pointer, media, search, and runtime dependencies.',
      { route: '/publishing/setup', publicationProfiles: derivePublicationProfiles(configuration), readiness: publishingSection || publishingReadiness },
      'Open Publishing and Setup & Accelerators; approve only after dependencies are green.'),
    section('approval', 'Process approval tasks', approvalSection ? operationalSectionState(approvalSection, liveBootstrap) : approvalReadiness ? stateFromLive('NOT_READY', liveBootstrap, String(approvalReadiness.state || approvalReadiness.status || '').toUpperCase() === 'READY') : 'NEEDS_ATTENTION',
      approvalSection ? 'BackOffice returned canonical approval/process readiness guidance.' : approvalReadiness ? 'BackOffice returned approval/process diagnostics.' : 'Confirm governed Process workflow/task availability for pending publication requests.',
      { route: '/process/approval-queue', reportSource: 'approvalDiagnostic', readiness: approvalSection || approvalReadiness },
      'Repair missing workflow references, assignees, or Process runtime before retrying approval.'),
    section('documentation', 'Documentation publishing and indexing', documentationSection ? operationalSectionState(documentationSection, liveBootstrap, documentationState) : documentationState,
      'Confirm docs packs are installed, approved, Online, indexed, and searchable.',
      { route: '/docs/dashboard', documentation, readiness: documentationSection },
      'Install/publish docs packs and rebuild knowledge/search indexes where configured.'),
    section('media', 'Media objects and references', mediaSection ? operationalSectionState(mediaSection, liveBootstrap) : mediaReadiness ? stateFromLive('NOT_READY', liveBootstrap, String(mediaReadiness.state || mediaReadiness.readiness || '').toUpperCase() === 'READY') : 'NEEDS_ATTENTION',
      mediaSection ? 'BackOffice returned canonical media readiness guidance.' : mediaReadiness ? 'BackOffice returned media readiness evidence.' : 'Confirm media object creation, physical transfer evidence, and consuming model references.',
      { route: '/media', readiness: mediaSection || mediaReadiness },
      'Review media transfer manifests, target receipts, and reference readiness.'),
    section('search', 'Search index and read-source policy', searchSection ? operationalSectionState(searchSection, liveBootstrap) : searchReadiness ? stateFromLive('NOT_READY', liveBootstrap, String(searchReadiness.state || searchReadiness.readiness || '').toUpperCase() === 'READY') : 'NEEDS_ATTENTION',
      searchSection ? 'BackOffice returned canonical search/discovery readiness guidance.' : searchReadiness ? 'BackOffice returned search/discovery readiness evidence.' : 'Confirm DB/search read-source policy and index freshness for rendered pages.',
      { route: '/discovery', reportSource: 'nSearch', readiness: searchSection || searchReadiness },
      'Use runtime configuration and Discovery readiness before switching rendering to search.'),
    section('assistant', 'Assistant knowledge sources', assistantSection ? operationalSectionState(assistantSection, liveBootstrap) : assistantReadiness ? stateFromLive('NOT_READY', liveBootstrap, String(assistantReadiness.state || assistantReadiness.readiness || '').toUpperCase() === 'READY') : 'NEEDS_ATTENTION',
      assistantSection ? 'BackOffice returned canonical assistant knowledge readiness guidance.' : assistantReadiness ? 'BackOffice returned assistant knowledge readiness evidence.' : 'Confirm assistant knowledge source installation, publication, indexing, and authorization.',
      { route: '/assistant', reportSource: 'assistant.knowledge', readiness: assistantSection || assistantReadiness },
      'Index approved docs/knowledge sources before treating assistant answers as verified.'),
    section('applications', 'Circa, Nexus, Agora parity', applicationSection ? operationalSectionState(applicationSection, liveBootstrap, applicationState) : applicationState,
      liveBootstrap.ok ? 'BackOffice application initialization profiles were inspected.' : 'Validate customer-facing app profiles through the same import/publication/runtime evidence.',
      { publicationProfiles: derivePublicationProfiles(configuration), applications, readiness: applicationSection },
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
  const exitCode = exitCodeForSummary(summary);
  return {
    contractVersion: 2,
    projectCode: configuration.projectCode,
    environment: configuration.environment,
    generatedAt: new Date().toISOString(),
    live,
    summary,
    exitCode,
    sections,
    commands: [
      commandEvidence(configuration, 'project:topology', ['status']),
      commandEvidence(configuration, 'project:data-manifests', []),
      commandEvidence(configuration, 'project:container-qualification', ['acceptance']),
      commandEvidence(configuration, 'project:post-reset-readiness', ['--live', '--access-token-file=/path/to/private/token', '--json']),
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
    accessToken: optionValue(args, 'access-token', ''),
    accessTokenFile: optionValue(args, 'access-token-file', ''),
    clientContractVersion: Number(optionValue(args, 'client-contract-version', '1')),
  });
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else console.log(formatPostResetReadinessReport(report));
  process.exitCode = report.exitCode;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error && error.stack || error);
    process.exitCode = 1;
  });
}

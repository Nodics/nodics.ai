/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/acceptance/defaultStagedSampleAcceptanceService @description Canonical sample release API acceptance with application-owned selections. @owner import @layer tooling */
import { pathToFileURL } from 'node:url';
import probe from '../../../../../../nTooling/src/service/project/defaultProjectConfigurationProbeService.js';
import { readProjectEnvironmentConfiguration, projectRuntime, projectEndpointUrl, projectCorsOrigin } from '../../../../../../nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';
import { parseAcceptanceResponse, authenticateAcceptanceEmployee } from '../../../../../../nTooling/src/service/project/defaultProjectAcceptanceService.mjs';

/** Select only declared sample releases for the chosen Staged role; no customer names or filesystem assumptions. */
export function stagedSampleReleaseCodes(profiles, selectedModules, targetRole) {
  if (typeof targetRole !== 'string' || !/^[A-Z][A-Z0-9_]*_STAGED$/.test(targetRole)) throw new Error('Select a Staged runtime role');
  if (!Array.isArray(selectedModules) || !selectedModules.length || selectedModules.some(name => typeof name !== 'string' || !name))
    throw new Error('Select release modules explicitly');
  const codes = new Set();
  for (const profile of Object.values(profiles || {})) {
    if (profile.enabled === false) continue;
    for (const step of profile.dataPackages || []) {
      if (step.dataType !== 'sample' || step.targetRuntimeRole !== targetRole || step.type === 'MEDIA_ASSET_MANIFEST') continue;
      if (typeof step.code !== 'string' || !selectedModules.includes(step.code.split(':')[0])) continue;
      codes.add(step.code);
    }
  }
  if (!codes.size) throw new Error('No sample releases match the active application selection');
  return [...codes];
}

function unwrap(body) { return body?.data ?? body?.result ?? body; }
function releases(body) {
  const data = unwrap(body);
  return Array.isArray(data) ? data : Array.isArray(data?.releases) ? data.releases : [];
}

function selectedReleases(body, codes, targetRole, expected) {
  const available = releases(body);
  return codes.map(code => {
    const matches = available.filter(item => item.releaseCode === code);
    if (matches.length !== 1) throw new Error('Missing or ambiguous sample release: ' + code);
    const release = matches[0];
    if (release.dataType !== 'sample' || release.destinationRole !== targetRole ||
        typeof release.version !== 'string' || !release.version.trim() ||
        (expected && release.version !== expected[code])) throw new Error('Sample release identity/version mismatch: ' + code);
    return release;
  });
}

/** Validate via owner APIs; installation requires explicit intent. Runtime lifecycle remains in project topology tooling. */
export async function runStagedSampleAcceptance({
  projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd(), environment = process.env,
  configuration, profiles, selectedModules, targetRole, executeInstall = false,
  fetch: fetchRequest = globalThis.fetch, log = console.log,
} = {}) {
  const config = configuration || readProjectEnvironmentConfiguration(projectRoot, environment.NODICS_ENVIRONMENT || environment.ENV || '');
  const platform = projectRuntime(config, { role: 'PLATFORM' });
  const effective = profiles || probe.read({ projectRoot, environment: config.environment,
    server: platform.server, inheritEnvironment: true }).properties.backofficeApplicationInitialization?.profiles;
  const codes = stagedSampleReleaseCodes(effective, selectedModules, targetRole);
  const platformUrl = projectEndpointUrl(config, { role: 'PLATFORM' });
  const targetUrl = projectEndpointUrl(config, { role: targetRole });
  const common = { Origin: environment.AXIS_ORIGIN || projectCorsOrigin(config, 'axis'),
    'x-enterprise-code': environment.NODICS_ENTERPRISE_CODE || 'default' };
  const request = async (base, route, options = {}) => parseAcceptanceResponse(await fetchRequest(new URL(route, base), {
    ...options, signal: AbortSignal.timeout(30000),
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...common, ...options.headers },
  }), { route, errorLimit: 500 });
  const auth = await authenticateAcceptanceEmployee({ request, baseUrl: platformUrl,
    suppliedToken: environment.AXIS_AUTH_TOKEN || environment.NODICS_AUTH_TOKEN,
    credentials: { loginId: environment.AXIS_LOGIN_ID || 'admin', password: environment.AXIS_PASSWORD || environment.NODICS_BOOTSTRAP_ADMIN_PASSWORD },
    headers: common, routes: ['/nodics/profile/v0/employee/browser/authenticate', '/nodics/profile/v0/employee/authenticate'],
    missingToken: route => route + ' returned no employee auth token', failureMessage: 'Employee authentication failed',
  });
  const headers = { ...common, ...auth };
  const contract = unwrap(await request(targetUrl, '/nodics/system/v0/contract/openapi', { headers }));
  const paths = contract?.paths || contract?.openapi?.paths || {};
  const catalogue = '/nodics/import/v0/sample';
  for (const [route, method] of [[catalogue, 'get'], [catalogue + '/validate', 'post'], [catalogue + '/install', 'post']]) {
    if (!paths[route]?.[method]) throw new Error('Staged sample import contract is missing: ' + route);
  }
  const available = selectedReleases(await request(targetUrl, catalogue, { headers }), codes, targetRole);
  const versions = Object.fromEntries(available.map(release => [release.releaseCode, release.version]));
  const plan = { dataType: 'sample', releaseCodes: codes, expectedReleases: versions };
  const validated = await request(targetUrl, catalogue + '/validate', { headers, method: 'POST', body: JSON.stringify(plan) });
  const validation = unwrap(validated)?.validation;
  if (validation?.validationOnly !== true || validation?.importExecuted !== false) throw new Error('Sample validation must remain preflight-only');
  selectedReleases(validated, codes, targetRole, versions);
  if (executeInstall) {
    for (const release of available) {
      if (release.status === 'CURRENT') continue;
      await request(targetUrl, catalogue + '/install', { headers, method: 'POST', body: JSON.stringify({
        dataType: 'sample', releaseCodes: [release.releaseCode], expectedReleases: { [release.releaseCode]: release.version },
      }) });
    }
    const installed = selectedReleases(await request(targetUrl, catalogue, { headers }), codes, targetRole, versions);
    if (installed.some(release => release.status !== 'CURRENT')) throw new Error('Sample installation did not become CURRENT');
  }
  const evidence = { releaseCodes: codes, expectedReleases: versions, destination: targetRole,
    mode: executeInstall ? 'INSTALL_VERIFIED' : 'VALIDATION_ONLY' };
  log(JSON.stringify(evidence));
  return evidence;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const argument = name => process.argv.find(value => value.startsWith('--' + name + '='))?.split('=').slice(1).join('=');
  if (process.argv.includes('--help')) console.log('acceptance:staged-sample-data --target-role=<ROLE_STAGED> --release-modules=<module,...> [--execute-install]. Preflight by default. Start selected runtimes through topology tooling first; this suite never starts or stops servers.');
  else await runStagedSampleAcceptance({ targetRole: argument('target-role'), selectedModules: argument('release-modules')?.split(','),
    executeInstall: process.argv.includes('--execute-install') });
}

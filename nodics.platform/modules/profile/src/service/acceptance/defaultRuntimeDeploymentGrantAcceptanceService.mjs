/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/acceptance/defaultRuntimeDeploymentGrantAcceptanceService @description Verifies governed runtime assignments without minting credentials or granting authority. @owner profile @layer tooling */
import { pathToFileURL } from 'node:url';
import bootstrap from '../identity/defaultMandatoryIdentityBootstrapService.js';
import probe from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectConfigurationProbeService.js';
import { createAcceptanceContext } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';

/** Topology supplies expected deployment coordinates, never permission to create or expand an assignment. */
export async function runRuntimeDeploymentGrantAcceptance(options = {}) {
  const context = await createAcceptanceContext(options);
  const { configuration, projectRoot, environment, request, authenticate } = context;
  const projections = options.projections || configuration.topology.groups.backends.filter(runtime => runtime.enabled !== false).map(runtime => ({
    server: runtime.server,
    ...probe.read({ projectRoot, environment: configuration.environment, server: runtime.server, inheritEnvironment: true }),
  }));
  const runtimes = projections.filter(item => item.properties?.runtimeIdentity?.instanceCode);
  if (!runtimes.length) throw new Error('No effective runtime identities are configured');
  const headers = { ...await authenticate(), tenant: environment.AXIS_TENANT || 'default' };
  const evidence = [];
  for (const runtime of runtimes) {
    const code = bootstrap.runtimeDeploymentGrantCode(configuration.environment, runtime.server);
    const result = await request('PLATFORM', '/nodics/profile/v0/principalscopeassignment/code/' + encodeURIComponent(code), { headers });
    const matches = Array.isArray(result) ? result : result ? [result] : [];
    if (matches.length !== 1) throw new Error('Missing or ambiguous governed runtime grant: ' + code);
    const grant = matches[0];
    const scope = grant.runtimeScope;
    const validCodes = values => Array.isArray(values) && values.length > 0 && values.length <= 512 &&
      new Set(values).size === values.length && Array.from(values).every(value =>
        typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_.:-]{0,191}$/.test(value));
    if (grant.code !== code || grant.scopeType !== 'RUNTIME_DEPLOYMENT' || grant.principalType !== 'service' ||
        !validCodes([grant.principalCode]) || grant.active !== true || grant.effect !== 'ALLOW' || grant.status !== 'ACTIVE' ||
        grant.inheritanceMode !== 'DIRECT' || grant.groupCode || grant.scopeCode !== code ||
        grant.tenantCode !== headers.tenant || grant.enterpriseCode !== (environment.NODICS_ENTERPRISE_CODE || environment.AXIS_ENTERPRISE || 'default') ||
        scope?.projectCode !== configuration.projectCode || scope?.environmentCode !== configuration.environment ||
        scope?.serverCode !== runtime.server || scope?.instanceCode !== runtime.properties.runtimeIdentity.instanceCode ||
        !validCodes(scope.modules)) throw new Error('Governed runtime grant does not match its effective deployment: ' + code);
    if (!validCodes(scope.permissions))
      throw new Error('Governed runtime grant permissions are malformed: ' + code);
    const now = Date.now();
    for (const key of ['effectiveFrom', 'effectiveTo']) {
      if (grant[key] === undefined || grant[key] === null) continue;
      const instant = new Date(grant[key]).getTime();
      if (!Number.isFinite(instant) || (key === 'effectiveFrom' ? instant > now : instant <= now))
        throw new Error('Governed runtime grant is outside its effective period: ' + code);
    }
    evidence.push({ code, server: runtime.server, state: 'VERIFIED' });
  }
  return evidence;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('Read-only Profile runtime-grant acceptance. Provision through governed Profile startup/admin APIs first; this command never rotates keys or writes assignments.');
  else console.log(JSON.stringify(await runRuntimeDeploymentGrantAcceptance()));
}

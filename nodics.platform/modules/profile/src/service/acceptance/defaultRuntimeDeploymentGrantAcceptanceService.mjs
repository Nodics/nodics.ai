/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/acceptance/defaultRuntimeDeploymentGrantAcceptanceService @description Observes the shared service Employee and selected deployment topology. @owner profile @layer tooling */
import { pathToFileURL } from 'node:url';
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
  const result = await request('PLATFORM', '/nodics/profile/v0/employee/code/apiAdmin', { headers });
  const rows = Array.isArray(result) ? result : [result];
  const account = rows[0];
  if (rows.length !== 1 || account?.code !== 'apiAdmin' || account.loginId !== 'apiAdmin' ||
      account.principalType !== 'service' || account.active !== true || account.disabled === true ||
      account.apiKeyStatus !== 'active' || !account.apiKeyScopes?.includes('auth.internal.token.read'))
    throw new Error('Shared service Employee is unavailable or disabled');
  return runtimes.map(runtime => ({ server: runtime.server, instanceCode: runtime.properties.runtimeIdentity.instanceCode,
    state: 'ACCOUNT_AND_SOURCE_OBSERVED' }));

}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('Read-only Profile shared service account and topology inspection. Token issuance is verified by startup.');
  else console.log(JSON.stringify(await runRuntimeDeploymentGrantAcceptance()));
}

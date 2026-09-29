/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { runRuntimeDeploymentGrantAcceptance as run } from '../src/service/acceptance/defaultRuntimeDeploymentGrantAcceptanceService.mjs';

function fixture(mutate = () => {}, status = 200) {
  const calls = [];
  const grant = { code: 'partner-local-identity-runtime-deployment', scopeType: 'RUNTIME_DEPLOYMENT',
    principalType: 'service', principalCode: 'apiAdmin', active: true, effect: 'ALLOW', status: 'ACTIVE',
    tenantCode: 'partner-tenant', enterpriseCode: 'partner-enterprise',
    runtimeScope: { projectCode: 'partner.app', environmentCode: 'partnerLocal', serverCode: 'identity',
      instanceCode: 'identity-one', modules: ['profile', 'workflow'], permissions: ['profile.read', 'process.execute'] } };
  mutate(grant);
  return {
    grant, calls,
    options: {
      environment: { NODICS_AUTH_TOKEN: 'fixture-token', NODICS_ACCEPTANCE_ORIGIN: 'https://partner.invalid',
        AXIS_TENANT: 'partner-tenant', NODICS_ENTERPRISE_CODE: 'partner-enterprise' },
      configuration: { environment: 'partnerLocal', projectCode: 'partner.app',
        topology: { groups: { backends: [{ role: 'PLATFORM', server: 'identity', host: 'identity.invalid', port: 1234 }] } } },
      projections: [{ server: 'identity', properties: { runtimeIdentity: { instanceCode: 'identity-one', remoteModules: ['workflow'] },
        activeModules: { modules: ['profile'] }, identityGovernance: { migration: {
          servicePrincipalScopes: { apiAdmin: ['profile.read'] }, localRuntimeDeploymentGrantPermissions: ['process.execute'],
        } } } }],
      fetch: async (url, request) => {
        calls.push({ url, request });
        assert.equal(request.method || 'GET', 'GET');
        assert.equal(request.headers.tenant, 'partner-tenant');
        assert.equal(request.headers['x-enterprise-code'], 'partner-enterprise');
        assert.equal(request.headers.Authorization, 'Bearer fixture-token');
        assert.equal(new URL(url).pathname, '/nodics/profile/v0/principalscopeassignment/code/partner-local-identity-runtime-deployment');
        return Response.json({ result: grant }, { status });
      },
    },
  };
}
test('independent deployment verifies local and remote modules plus both permission sources read-only', async () => {
  const f = fixture();
  assert.deepEqual(await run(f.options), [{ code: f.grant.code, server: 'identity', state: 'VERIFIED' }]);
  assert.equal(f.calls.length, 1);
});
test('every identity, scope, lifecycle and permission mismatch rejects', async () => {
  for (const key of ['code', 'scopeType', 'principalType', 'principalCode', 'active', 'effect', 'status', 'tenantCode', 'enterpriseCode']) {
    const f = fixture(grant => { grant[key] = key === 'active' ? false : 'wrong'; });
    await assert.rejects(run(f.options), /does not match/);
  }
  for (const key of ['projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'modules']) {
    const f = fixture(grant => { grant.runtimeScope[key] = key === 'modules' ? ['profile'] : 'wrong'; });
    await assert.rejects(run(f.options), /does not match/);
  }
  for (const permissions of [[], ['profile.read'], ['process.execute'], 'profile.read process.execute']) {
    const f = fixture(grant => { grant.runtimeScope.permissions = permissions; });
    await assert.rejects(run(f.options), /owner permissions/);
  }
  const f = fixture(grant => { grant.runtimeScope.modules = 'profile workflow'; });
  await assert.rejects(run(f.options), /does not match/);
});
test('missing and ambiguous grants, identities, module declarations and owner policy fail', async () => {
  for (const result of [[], null, [{}, {}]]) {
    const f = fixture();
    f.options.fetch = async () => Response.json(result);
    await assert.rejects(run(f.options), /Missing or ambiguous/);
  }
  const missing = fixture();
  missing.options.projections = [];
  await assert.rejects(run(missing.options), /No effective runtime identities/);
  assert.equal(missing.calls.length, 0);
  const modules = fixture();
  modules.options.projections[0].properties.activeModules.modules = [];
  modules.options.projections[0].properties.runtimeIdentity.remoteModules = [];
  await assert.rejects(run(modules.options), /module declarations/);
  const policy = fixture();
  policy.options.projections[0].properties.identityGovernance.migration = {};
  await assert.rejects(run(policy.options), /owner permissions/);
});
test('authorization denial cannot create or repair grants', async () => {
  const f = fixture(undefined, 403);
  await assert.rejects(run(f.options), /HTTP 403/);
  assert.equal(f.calls.length, 1);
});

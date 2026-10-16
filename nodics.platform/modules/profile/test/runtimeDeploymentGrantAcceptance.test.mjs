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
    inheritanceMode: 'DIRECT', scopeCode: 'partner-local-identity-runtime-deployment',
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
      // Retired configuration is deliberately injected as non-authoritative evidence.
      projections: [{ server: 'identity', properties: { runtimeIdentity: { instanceCode: 'identity-one', remoteModules: ['workflow'] },
        activeModules: { modules: ['profile'] }, identityGovernance: { migration: {
          servicePrincipalScopes: { apiAdmin: ['profile.read'] }, runtimeDeploymentGrantPermissions: ['process.execute'],
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
test('independent deployment verifies persisted runtime authority read-only', async () => {
  const f = fixture();
  assert.deepEqual(await run(f.options), [{ code: f.grant.code, server: 'identity', state: 'VERIFIED' }]);
  assert.equal(f.calls.length, 1);
});
test('each runtime is verified against its persisted grant, never a configured permission union', async () => {
  const f = fixture();
  f.options.configuration.topology.groups.backends.push({ role: 'WCMS_ONLINE', server: 'delivery', host: 'delivery.invalid', port: 1235 });
  f.options.projections.push({ server: 'delivery', properties: {
    runtimeIdentity: { instanceCode: 'delivery-one', remoteModules: ['profile'] }, activeModules: { modules: ['cms'] },
    identityGovernance: { migration: { servicePrincipalScopes: { apiAdmin: ['profile.read'] },
      runtimeDeploymentGrantPermissions: ['cms.delivery.read'] } },
  } });
  const delivery = structuredClone(f.grant);
  delivery.code = 'partner-local-delivery-runtime-deployment';
  delivery.scopeCode = delivery.code;
  Object.assign(delivery.runtimeScope, { serverCode: 'delivery', instanceCode: 'delivery-one',
    modules: ['cms', 'profile'], permissions: ['profile.read', 'cms.delivery.read'] });
  f.options.fetch = async (url, request) => {
    assert.equal(request.method || 'GET', 'GET');
    f.calls.push({ url });
    return Response.json({ result: new URL(url).pathname.endsWith(delivery.code) ? delivery : f.grant });
  };
  assert.deepEqual(await run(f.options), [
    { code: f.grant.code, server: 'identity', state: 'VERIFIED' },
    { code: delivery.code, server: 'delivery', state: 'VERIFIED' },
  ]);
  assert.equal(f.calls.length, 2);
  delivery.runtimeScope.permissions = ['profile.read', 'process.execute'];
  assert.equal((await run(f.options)).length, 2, 'Axis changes do not require matching configuration');
});
test('every identity, scope, lifecycle and permission mismatch rejects', async () => {
  for (const key of ['code', 'scopeType', 'principalType', 'inheritanceMode', 'scopeCode', 'active', 'effect', 'status', 'tenantCode', 'enterpriseCode']) {
    const f = fixture(grant => { grant[key] = key === 'active' ? false : 'wrong'; });
    await assert.rejects(run(f.options), /does not match/);
  }
  for (const key of ['projectCode', 'environmentCode', 'serverCode', 'instanceCode']) {
    const f = fixture(grant => { grant.runtimeScope[key] = key === 'modules' ? ['profile'] : 'wrong'; });
    await assert.rejects(run(f.options), /does not match/);
  }
  for (const permissions of [[], ['profile.read', 'profile.read'], [null], 'profile.read process.execute']) {
    const f = fixture(grant => { grant.runtimeScope.permissions = permissions; });
    await assert.rejects(run(f.options), /permissions are malformed/);
  }
  const f = fixture(grant => { grant.runtimeScope.modules = 'profile workflow'; });
  await assert.rejects(run(f.options), /does not match/);
});
test('missing and ambiguous grants and identities fail; configuration is not grant authority', async () => {
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
  assert.equal((await run(modules.options)).length, 1);
  const policy = fixture();
  policy.options.projections[0].properties.identityGovernance.migration = {};
  assert.equal((await run(policy.options)).length, 1);
});
test('authorization denial cannot create or repair grants', async () => {
  const f = fixture(undefined, 403);
  await assert.rejects(run(f.options), /HTTP 403/);
  assert.equal(f.calls.length, 1);
});

test('intentional narrowed grant and alternate persisted service principal need no config-derived authority', async () => {
  const f = fixture(grant => {
    grant.principalCode = 'approvedWorker';
    grant.runtimeScope.modules = ['profile'];
    grant.runtimeScope.permissions = ['narrow.read'];
  });
  assert.equal((await run(f.options)).length, 1);
});
test('expired, future and malformed effective dates reject without writes', async () => {
  for (const [key, value] of [
    ['effectiveFrom', '2999-01-01'], ['effectiveTo', '2000-01-01'],
    ['effectiveFrom', 'invalid'], ['effectiveTo', 'invalid'],
  ]) {
    const f = fixture(grant => { grant[key] = value; });
    await assert.rejects(run(f.options), /effective period/);
  }
});

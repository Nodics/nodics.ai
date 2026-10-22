/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module bidding/test/biddingIdentityTransport @description Verifies full framework Profile transport validation and original authority forwarding for both participant kinds. @layer test @owner bidding */
const test = require('node:test'), assert = require('node:assert/strict');
const identity = require('../src/service/defaultBiddingIdentityService');
const defaults = require('../config/properties').bidding;
function fixture(t, kind) {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE }, config = structuredClone(defaults), calls = [];
  const request = { tenant: 'tenant', authorization: 'Bearer original', authData: {
    tokenType: 'access', principalType: kind, loginId: 'actor', enterpriseCode: 'owner', tenant: 'tenant' } };
  global.CONFIG = { get: key => key === 'bidding' ? config : undefined };
  global.SERVICE = { DefaultBiddingService: { fail: message => { throw Error(message); } },
    DefaultSecuredRequestPipelineService: { isPermissionGranted: () => true, getGrantedPermissions: () => ['*'] },
    DefaultModuleService: { invokeModule: async call => { calls.push(call); return kind === 'customer'
      ? { contractVersion: 1, tenant: 'tenant', enterpriseCode: 'owner', customer: { code: 'customer', loginId: 'actor' } }
      : { principalCode: 'actor', scopes: [{ scopeType: 'ENTERPRISE', scopeCode: 'owner' }], deniedScopes: [] }; } } };
  t.after(() => { global.CONFIG = previous.CONFIG; global.SERVICE = previous.SERVICE; });
  return { config, request, calls };
}
for (const kind of ['customer', 'human']) test(kind + ' identity wires every default and intentional transport override without replacing original credentials', async t => {
  const f = fixture(t, kind);
  for (const customized of [false, true]) {
    if (customized) Object.assign(f.config.profileTransport, { connectionName: 'partnerProfile', apiVersion: 'v2', timeoutMs: 1234, maxAttempts: 2 });
    const result = await identity.resolve(f.request), call = f.calls.at(-1);
    assert.deepEqual(call, { ...f.config.profileTransport, local: false, tenant: 'tenant', request: { tenant: 'tenant' }, methodName: 'GET',
      apiName: kind === 'customer' ? '/customer/identity' : '/identity/scopes/me',
      header: { Authorization: 'Bearer original', 'X-Enterprise-Code': 'owner' } });
    assert.equal(result.buyerRef.schema, kind === 'customer' ? 'customer' : 'enterprise');
    assert.equal(result.actorRef.loginId, 'actor');
  }
});
for (const kind of ['customer', 'human']) test(kind + ' refuses incomplete or unsafe transport before dispatch', async t => {
  const f = fixture(t, kind), valid = structuredClone(f.config.profileTransport);
  const invalid = [undefined, {}, ...Object.keys(valid).map(key => { const p = structuredClone(valid); delete p[key]; return p; }),
    ...[0, -1, NaN, Infinity, 0.5, 2147483648].map(timeoutMs => ({ ...valid, timeoutMs })),
    ...[0, -1, NaN, Infinity, 1.1].map(maxAttempts => ({ ...valid, maxAttempts })),
    { ...valid, moduleName: 'checkout' }, { ...valid, connectionName: '' }, { ...valid, apiVersion: 'v0/other' },
    { ...valid, targetAuthority: { runtimeRole: 'COMMERCE' } }, { ...valid, targetAuthority: { runtimeRole: 'PLATFORM', address: 'foreign' } },
    { ...valid, followRedirects: true }, { ...valid, rejectUnauthorized: false }, { ...valid, header: { Authorization: 'Bearer forged' } }];
  for (const p of invalid) { f.config.profileTransport = p; await assert.rejects(identity.resolve(f.request), /transport configuration/); }
  assert.equal(f.calls.length, 0);
});
test('in-flight signed authority or Profile transport changes cannot qualify a participant', async t => {
  const f = fixture(t, 'customer'), invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async call => { const value = await invoke(call); f.request.authData.loginId = 'changed'; return value; };
  await assert.rejects(identity.resolve(f.request), /context changed/);
  f.request.authData.loginId = 'actor';
  SERVICE.DefaultModuleService.invokeModule = async call => { const value = await invoke(call); f.config.profileTransport.timeoutMs++; return value; };
  await assert.rejects(identity.resolve(f.request), /context changed/);
});
test('bidder and seller scope matchers honor wildcard denies and Enterprise qualifiers through the effective owner', async t => {
  const f = fixture(t, 'human');
  SERVICE.DefaultSecuredRequestPipelineService = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
  f.request.authData.permissions = ['commerce.bid.participate', 'commerce.bid.manage'];
  const evidence = { principalCode: 'actor', scopes: [{ scopeType: 'ENTERPRISE', scopeCode: 'owner', capabilityCode: '*' }], deniedScopes: [] };
  SERVICE.DefaultModuleService.invokeModule = async () => evidence;
  assert.equal((await identity.resolve(f.request)).buyerRef.code, 'owner');
  for (const permission of f.request.authData.permissions) {
    for (const [scopeType, scopeCode] of [['GLOBAL', '*'], ['TENANT', 'tenant'], ['ENTERPRISE', 'owner']]) {
      evidence.deniedScopes = [{ scopeType, scopeCode, capabilityCode: '*', permissionCode: permission }];
      const resolved = await identity.resolve(f.request);
      assert.equal(permission === 'commerce.bid.participate' ? resolved.buyerRef : resolved.sellerRefs[0], undefined);
    }
  }
  evidence.deniedScopes = [];
  evidence.scopes = [{ scopeType: 'GLOBAL', scopeCode: '*', enterpriseCode: 'foreign' }];
  assert.equal((await identity.resolve(f.request)).buyerRef, undefined);
  evidence.scopes = [{ scopeType: 'ENTERPRISE', scopeCode: 'owner' }];
  assert.equal((await ({ ...identity, matchesEnterpriseScope: () => false }).resolve(f.request)).buyerRef, undefined);
});

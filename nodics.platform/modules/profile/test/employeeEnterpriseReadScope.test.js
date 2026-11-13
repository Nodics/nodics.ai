/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module profile/test/employeeEnterpriseReadScope @description Checks generated Employee scope intersection and provider admission without database writes. @owner profile @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../src/service/interceptors/defaultEmployeeGetInterceptorService');
function fixture() {
  const service = { ...source }, reads = [];
  global.CONFIG = { get: key => key === 'defaultEnterprise' ? 'default' : undefined };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.SERVICE = {
    DefaultSecuredRequestPipelineService: { hasPlatformFullAccess: request => request.authData?.platformFixture === true },
    DefaultEnterpriseMembershipService: { authority: () => 'default' },
    DefaultEnterpriseBusinessAccessService: { rows: async (...args) => { reads.push(args); return [{ code: 'own-assignment' }]; } },
  };
  const request = { httpRequest: {}, tenant: 'default', authData: { principalType: 'human', tenant: 'default', entCode: 'own' }, query: { code: 'foreign-person' }, options: { recursive: false } };
  return { service, reads, request };
}
test('native and registered rows are constrained to signed Enterprise while original caller selectors are intersected', async () => {
  const f = fixture(), original = structuredClone(f.request.query);
  await f.service.getEmployeeRecursive(f.request);
  assert.deepEqual(f.request.query.$and[0], original);
  assert.deepEqual(f.reads[0][3], { enterpriseCode: 'own', tenantCode: 'default', status: 'REGISTERED', active: true });
  const filter = f.request.query.$and[1];
  assert.deepEqual(filter.$and[0].$or, [{ enterpriseCode: 'own' }, { 'metadata.enterpriseCode': 'own' }, { registrationAssignmentCode: { $in: ['own-assignment'] } }]);
  assert.equal(f.service.protectProviderRead(f.request), true);
  assert.equal(f.request.options.recursive, false);
});
test('body/header selectors and caller-supplied system flags do not change the signed scope', async () => {
  const f = fixture();
  f.request.body = { enterpriseCode: 'foreign' };
  f.request.headers = { 'x-enterprise-code': 'foreign' };
  f.request.authData.isSystem = true;
  await f.service.getEmployeeRecursive(f.request);
  assert.equal(f.reads[0][3].enterpriseCode, 'own');
});
test('provider reads reject missing preparation, copied requests, removed constraints and changed authority', async () => {
  for (const change of [r => ({ ...r }), r => { r.query = {}; return r; }, r => { r.authData.entCode = 'foreign'; return r; }, r => { r.tenant = 'foreign'; return r; }]) {
    const f = fixture();
    assert.throws(() => f.service.protectProviderRead(f.request), /ERR_AUTH_00003/);
    await f.service.getEmployeeRecursive(f.request);
    assert.throws(() => f.service.protectProviderRead(change(f.request)), /ERR_AUTH_00003/);
  }
});
test('missing placement or failed assignment inventory fails closed, never an unscoped fallback', async () => {
  const f = fixture(); delete f.request.authData.entCode;
  await assert.rejects(f.service.getEmployeeRecursive(f.request), /ERR_AUTH_00003/);
  f.request.authData.entCode = 'own';
  SERVICE.DefaultEnterpriseBusinessAccessService.rows = async () => { throw Error('OWNER_UNAVAILABLE'); };
  await assert.rejects(f.service.getEmployeeRecursive(f.request), /OWNER_UNAVAILABLE/);
  assert.deepEqual(f.request.query, { code: 'foreign-person' });
});
test('unbound native compatibility is limited to configured default Enterprise; native Platform and service reads retain existing authority', async () => {
  const f = fixture(); f.request.authData.entCode = 'default';
  await f.service.getEmployeeRecursive(f.request);
  assert.equal(f.request.query.$and[1].$and[0].$or.length, 4);
  const full = { tenant: 'default', authData: { principalType: 'human', platformFixture: true }, query: { code: 'foreign' } };
  await f.service.getEmployeeRecursive(full);
  assert.deepEqual(full.query, { code: 'foreign' });
  assert.equal(f.service.protectProviderRead(full), true);
  const internal = { tenant: 'default', authData: { principalType: 'service' }, query: { code: 'foreign' } };
  await f.service.getEmployeeRecursive(internal);
  assert.deepEqual(internal.query, { code: 'foreign' });
});

test('private business-owner reads retain their own admission even when carrying human and system context', async () => {
  const f = fixture(); delete f.request.httpRequest; f.request.authData.isSystem = true;
  await f.service.getEmployeeRecursive(f.request);
  assert.deepEqual(f.request.query, { code: 'foreign-person' });
  assert.equal(f.reads.length, 0);
  assert.equal(f.service.protectProviderRead(f.request), true);
});
test('a changed actor during assignment resolution fails before any provider query', async () => {
  const f = fixture();
  SERVICE.DefaultEnterpriseBusinessAccessService.rows = async () => { f.request.authData.entCode = 'foreign'; return []; };
  await assert.rejects(f.service.restrictEnterpriseRead(f.request), /ERR_AUTH_00003/);
  assert.deepEqual(f.request.query, { code: 'foreign-person' });
});

 test('public SafeQuery provenance scopes before provider reads and repeated preGet preparation is idempotent', async () => {
  const f=fixture();
  const policy=require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService');
  SERVICE.DefaultSchemaReadAccessPolicyService=policy;
  const original={...f.request};delete f.request.httpRequest;
  await policy.withGeneratedHttpRead(original,f.request,async actual=>{
    await f.service.restrictEnterpriseRead(actual);
    assert.equal(f.service.protectProviderRead(actual),true);
    const first=structuredClone(actual.query);
    await f.service.getEmployeeRecursive(actual);
    assert.deepEqual(actual.query,first);
    assert.equal(f.reads.length,1);
  });
});

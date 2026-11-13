/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module database/test/generatedHttpReadProvenance @description Verifies exact public read lifetime, actor binding and translated-query separation. @owner nDatabase @layer test */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('../src/service/schema/defaultSchemaReadAccessPolicyService');
const safe = require('../src/service/schema/defaultSchemaSafeQueryService');
function fixture() {
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  const original = { tenant: 'tenant', authData: { principalType: 'human', tenant: 'tenant', entCode: 'own' }, httpRequest: { body: { query: { code: 'foreign' } } } };
  const read = { tenant: original.tenant, authData: original.authData, query: { code: 'translated' } };
  global.CONFIG = { get: () => 'default' };
  global.SERVICE = { DefaultSchemaReadAccessPolicyService: policy,
    DefaultSecuredRequestPipelineService: { hasPlatformFullAccess: () => false },
    DefaultEnterpriseMembershipService: { authority: () => 'default' },
    DefaultEnterpriseBusinessAccessService: { rows: async () => [] } };
  return { original, read };
}
test('exact translated input retains public origin only during the owner call; copies and flags confer none', async () => {
  const {original,read} = fixture();
  assert.equal(policy.isGeneratedHttpRead(read),false);
  await policy.withGeneratedHttpRead(original,read, async actual => {
    assert.equal(actual,read);
    assert.equal(policy.isGeneratedHttpRead(actual),true);
    assert.equal(policy.isGeneratedHttpRead({...actual, generatedHttpRead:true}),false);
    assert.equal(actual.httpRequest,undefined);
  });
  assert.equal(policy.isGeneratedHttpRead(read),false);
});
test('changed signed authority fails closed while active; failure always retires private provenance', async () => {
  const {original,read}=fixture();
  await assert.rejects(policy.withGeneratedHttpRead(original,read, async () => {
    read.authData.entCode='foreign';
    policy.isGeneratedHttpRead(read);
  }),/ERR_AUTH_00003/);
  assert.equal(policy.isGeneratedHttpRead(read),false);
  await assert.rejects(policy.withGeneratedHttpRead({...original,httpRequest:undefined},read,()=>true),/ERR_AUTH_00003/);
  await assert.rejects(policy.withGeneratedHttpRead(original,{...read,tenant:'foreign'},()=>true),/ERR_AUTH_00003/);
});
test('real safe-query translation preserves actor and query without forwarding Express/body or authority flags', async () => {
  const {original}=fixture(); let observed;
  SERVICE.DefaultItemService={get:async read=>{
    observed=read;
    assert.equal(policy.isGeneratedHttpRead(read),true);
    assert.equal(read.httpRequest,undefined);
    assert.equal(read.authData,original.authData);
    assert.deepEqual(read.query,{code:'translated'});
    return {result:[{code:'translated'}],count:1};
  }};
  const service={...safe,resolveDescriptor:()=>({operations:['search']}),buildSearchInput:()=>({query:{code:'translated'},searchOptions:{pageNumber:1,pageSize:1},pageNumber:1,pageSize:1})};
  const result=await service.searchGenerated({...original,generatedServiceName:'DefaultItemService',moduleName:'test',schemaName:'item',browserQuery:{}});
  assert.equal(result.data.records.length,1);
  assert.equal(policy.isGeneratedHttpRead(observed),false);
  delete SERVICE.DefaultSchemaReadAccessPolicyService;
  await assert.rejects(service.searchGenerated({...original,generatedServiceName:'DefaultItemService'}),/ERR_AUTH_00003/);
});

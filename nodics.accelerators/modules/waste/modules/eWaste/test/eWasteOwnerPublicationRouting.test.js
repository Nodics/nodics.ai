/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module eWaste/test/eWasteOwnerPublicationRouting @description Offline source-owner routing, publication refusals and original credential preservation. @owner eWaste @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const experience = require('../src/service/defaultEWasteExperienceService');
const handoff = require('../src/service/defaultEWasteListingHandoffService');
const defaults = require('../config/properties').eWaste;
function fixture(t) {
  const before = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, before));
  const config = structuredClone(defaults), calls = [];
  global.CONFIG = { get: () => config };
  global.SERVICE = { DefaultModuleService: { invokeModule: async call => { calls.push(call); return { contractVersion: 1, tenant: 'tenant' }; } },
    DefaultWasteSubmissionOperationService: { read: async () => ({ metadata: { photo: { code: 'private-photo' } } }) },
    DefaultWasteMetadataAnalysisService: { suggest: async request => request.photo } };
  const service = { ...experience, store: () => ({ fail: code => { throw Error(code); } }) };
  const source = { ...handoff, fail: code => { throw Error(code); } };
  const request = { tenant: 'tenant', authorization: 'Bearer original', idempotencyKey: 'original-key',
    authData: { tenant: 'tenant', principalType: 'customer', entCode: 'enterprise', loginId: 'actor' } };
  return { config, calls, service, source, request };
}
for (const [connection, moduleName, publication] of [['engagement','commsApi','OPERATIONAL'], ['commerceStaged','product','STAGED'], ['wcms','media','STAGED']]) {
  test(connection + ' preserves explicit publication, exact deployment and original caller', async t => {
    const f=fixture(t), signed=structuredClone(f.request.authData);
    assert.equal(f.config.targetAuthorities[connection].publication, publication);
    const target={publication,server:'regrouped-owner',environment:'unit'};
    f.config.targetAuthorities[connection]=target;
    await f.service.remote(f.request,moduleName,connection,'/fixed-owner-api','POST',{code:'original'},f.request.authorization);
    const call=f.calls[0]; assert.deepEqual(call.targetAuthority,target); assert.notEqual(call.targetAuthority,target);
    assert.equal(call.moduleName,moduleName); assert.equal(call.header.Authorization,'Bearer original');
    assert.equal(call.header['X-Enterprise-Code'],'enterprise'); assert.deepEqual(call.requestBody,{code:'original'});
    assert.deepEqual(f.request.authData,signed); assert.equal(call.tenant,'tenant');
  });
  test(connection + ' refuses absent, physical-role and wrong-publication selectors before transport', async t => {
    const f=fixture(t);
    for(const target of [undefined,{},'ROLE',{runtimeRole:'ROLE'}, {publication,runtimeRole:'ROLE'},
      {publication,server:''}, {publication,environment:' unit'}, ...['STAGED','ONLINE','OPERATIONAL'].filter(v=>v!==publication).map(publication=>({publication}))]) {
      f.config.targetAuthorities[connection]=target;
      await assert.rejects(f.service.remote(f.request,moduleName,connection,'/fixed-owner-api','POST',{}));
    }
    assert.equal(f.calls.length,0);
  });
}
test('photo analysis binds Media STAGED and retains customer bearer; wrong context cannot call Media or analysis', async t=>{
  const f=fixture(t); await f.service.analyzePhoto(f.request);
  assert.deepEqual(f.calls[0].targetAuthority,{publication:'STAGED'});
  assert.equal(f.calls[0].apiName,'/customer/photos/private-photo'); assert.equal(f.calls[0].header.Authorization,'Bearer original');
  let analyzed=false; SERVICE.DefaultWasteMetadataAnalysisService.suggest=async()=>{analyzed=true;};
  f.config.targetAuthorities.wcms={publication:'ONLINE'};
  await assert.rejects(f.service.analyzePhoto(f.request)); assert.equal(f.calls.length,1); assert.equal(analyzed,false);
});
test('Product source proof requires STAGED, internal credentials and unchanged exact target', async t=>{
  const f=fixture(t), path='/internal/products/listings/source-evidence';
  for(const target of [undefined,{}, {runtimeRole:'COMMERCE_STAGED'}, {publication:'ONLINE'}, {publication:'OPERATIONAL'}]) {
    f.config.targetAuthorities.commerceStaged=target;
    await assert.rejects(f.source.ownerRead(f.request,'commerceStaged','product',path,{contractVersion:1}));
  }
  assert.equal(f.calls.length,0);
  f.config.targetAuthorities.commerceStaged={publication:'STAGED',server:'source-owner',environment:'unit'};
  await f.source.ownerRead(f.request,'commerceStaged','product',path,{contractVersion:1});
  assert.deepEqual(f.calls[0].targetAuthority,f.config.targetAuthorities.commerceStaged);
  assert.equal(f.calls[0].header,undefined); assert.equal(f.calls[0].apiName,path);
  SERVICE.DefaultModuleService.invokeModule=async()=>{f.config.targetAuthorities.commerceStaged.server='foreign';return {contractVersion:1,tenant:'tenant'};};
  await assert.rejects(f.source.ownerRead(f.request,'commerceStaged','product',path,{contractVersion:1}));
});

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryConfig/test/discoveryConfigurationRouting @description Verifies fixed configuration reads through real DMS locality/publication selection without network. @layer test @owner discoveryConfig */
const test=require('node:test');
const assert=require('node:assert/strict');
const resolver=require('../src/service/defaultDiscoveryConfigurationResolverService');
const transport=require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');

for(const scenario of ['local','remoteOnly','inactive','otherPublication']) {
 test('configuration reads preserve qualified DMS selection: '+scenario,async t=>{
  const prior={NODICS:global.NODICS,CONFIG:global.CONFIG,SERVICE:global.SERVICE};
  t.after(()=>Object.assign(global,prior));
  const actor={permissions:['existing']};let local=0,remote=0;
  global.NODICS={isModuleActive:()=>scenario!=='inactive',getServerName:()=> 'owner',getSelectedEnvironmentName:()=> 'test'};
  global.CONFIG={get:key=>key==='runtimeRole'?{publication:scenario==='otherPublication'?'STAGED':'OPERATIONAL'}:
    key==='discovery'?{config:{targetAuthority:{publication:'OPERATIONAL',server:'owner',environment:'test'}}}:undefined};
  global.SERVICE={DefaultRouterService:{getModuleServerConfig:()=>({getOptions:()=>({remoteOnly:scenario==='remoteOnly'})})},
    DefaultDiscoveryIndexConfigurationService:{get:async request=>{local++;assert.equal(request.authData,actor);return [{code:'index'}];}}};
  SERVICE.DefaultDiscoveryConfigurationReadService=require('../src/service/defaultDiscoveryConfigurationReadService');
  SERVICE.DefaultModuleService={...transport,invokeRemoteModule:async call=>{
    remote++;assert.equal(call.moduleName,'discoveryConfig');assert.equal(call.apiName,'/internal/configuration/index');
    assert.equal(call.methodName,'POST');assert.equal(call.requestBody.authData,undefined);
    assert.equal(call.requestBody.query.tenant,'tenant');assert.equal(call.targetAuthority.publication,'OPERATIONAL');
    return {data:{result:[{code:'index'}]}};
  }};
  assert.equal((await resolver.resolveIndexConfiguration({tenant:'tenant',ownerType:'PRODUCT',authData:actor})).code,'index');
  assert.equal(local,scenario==='local'?1:0);assert.equal(remote,scenario==='local'?0:1);
 });
}
test('owner denial never becomes a configured fallback; invalid publication and arbitrary schema fail closed',async t=>{
 const prior={CONFIG:global.CONFIG,SERVICE:global.SERVICE};t.after(()=>Object.assign(global,prior));
 let publication='ONLINE',calls=0;
 global.CONFIG={get:()=>({config:{targetAuthority:{publication}},runtime:{profiles:{PRODUCT:{indexConfiguration:{code:'fallback'}}}}})};
 global.SERVICE={DefaultModuleService:{invokeModule:async()=>{calls++;throw new Error('owner denied');}}};
 await assert.rejects(resolver.resolveIndexConfiguration({tenant:'tenant',ownerType:'PRODUCT'}),/owner denied/);
 publication='UNKNOWN';await assert.rejects(resolver.resolveIndexConfiguration({tenant:'tenant'}),/explicit publication/);
 await assert.rejects(resolver.readConfiguration({},'arbitraryService',{}),/Unsupported/);
 assert.equal(calls,1);
});

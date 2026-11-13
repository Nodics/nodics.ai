/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module digitalCore/test/digitalCouponReminderRemoteAction @description Exercises actual Process action discovery and Digital remote claim admission without native calls. @owner digitalCore @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultDigitalCouponReminderProcessService');
const properties = require('../config/properties');
const registry = require('../../../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessActionAdapterRegistryService');
function fixture() {
  const policy = structuredClone(properties.digitalCore.couponReminders);
  policy.enabled = true;
  const scope = {projectCode:'project',environmentCode:'Local',serverCode:'process',instanceCode:'process-1',assignmentCode:'process-assignment'};
  const auth = {principalType:'service',tenant:'t',enterpriseCode:'default',entCode:'default',serviceId:'apiAdmin',runtimeInstanceId:'process-1',runtimeScope:scope,modules:['workflow','digitalCore'],permissions:['commerce.digital.notification.read']};
  policy.sweepCallers = [{tenant:'t',principalEnterpriseCode:'default',enterpriseCode:'shop',serviceId:'apiAdmin',...scope}];
  const r = {tenant:'t',authData:auth,body:{instanceCode:'sweep-1',executionCode:'11111111-1111-1111-1111-111111111111'}};
  const context = {enterpriseCode:'shop',source:'cronjob',cronJobTenant:'t',cronJobCode:'job',firedAt:new Date().toISOString()};
  const reply = {instance:{code:'sweep-1',context},executionCode:r.body.executionCode};
  const calls = [];
  global.CONFIG = {get:k=>k==='digitalCore'?{couponReminders:policy}:k==='runtimeRole'?{ code: "COMMERCE", publication: "OPERATIONAL" }:k==='process'?{actionAdapters:{enabled:true,allowedActions:['digitalCore.couponExpirySweep'],definitions:properties.process.actionAdapters.definitions}}:undefined};
  global.NODICS = {getSelectedEnvironmentName:()=> 'Local'};
  global.CLASSES = {NodicsError:class extends Error{constructor(code){super(code)}}};
  global.SERVICE = {DefaultServiceTokenService:{requireRuntimePrincipal:r=>r.authData},DefaultLoggerService:{assertSensitiveRequest:()=>{}},
    DefaultModuleService:{isLocalModuleActive: moduleName => ["digitalCore"].includes(moduleName), invokeModule:async call=>{calls.push(call);return {data:reply}}},
    DefaultDigitalCommerceCouponReminderService:{sweep:async (request,execution)=>{calls.push({request,execution});return {status:'COMPLETED'}}},
    DefaultProcessRemoteActionAdapterService:{execute:async (_r,_e,declaration)=>declaration}};
  return {policy,r,reply,calls};
}
test('registered action is remote and claims Process context without changing signed enterprise',async()=>{
 const f=fixture();
 const declaration=await registry.execute(f.r,{node:{action:{moduleName:'digitalCore',operation:'couponExpirySweep'}}});
 assert.deepEqual(declaration.targetAuthority,{publication:'OPERATIONAL'}); assert.equal(declaration.apiName,'/workflow/actions/couponExpirySweep');
 assert.deepEqual(await service.sweep(f.r),{status:'COMPLETED'});
 assert.equal(f.calls[0].requestBody.actionKey,'digitalCore.couponExpirySweep');
 assert.equal(f.calls[0].header,undefined); assert.equal(f.calls[0].maxAttempts,1);
 assert.equal(f.calls[1].request.authData.enterpriseCode,'default'); assert.equal(f.calls[1].execution.context.enterpriseCode,'shop');
});
test('unselected business and changed handle cannot reach sweep',async()=>{
 for(const change of [f=>{f.reply.instance.context.enterpriseCode='foreign'},f=>{f.reply.executionCode='other'},f=>{f.r.body.context={enterpriseCode:'shop'}}]){
  const f=fixture();change(f);await assert.rejects(service.sweep(f.r)); assert.equal(f.calls.some(c=>c.execution),false);
 }
});
test('Communication eligibility requires its own exact runtime binding',async()=>{
 const f=fixture(); f.r.body={sourceModule:'digitalCore',sourceType:'DIGITAL_COUPON_EXPIRING',sourceCode:Buffer.from(JSON.stringify(['shop','entitlement'])).toString('base64url'),intentCode:'intent',recipientId:'staff',recipientAddressReference:'opaque',purpose:'DIGITAL_COUPON_EXPIRING',channel:'IN_APP',idempotencyKey:'key',expiresAt:'2026-11-08T00:00:00.000Z'};
 let calls=0; SERVICE.DefaultDigitalCouponReminderDeliveryService={isDispatchEligible:async input=>{calls++;return {eligible:true,...input}}};
 await assert.rejects(service.dispatchEligibility(f.r));assert.equal(calls,0);
 f.r.authData.modules.push('commsApi');f.policy.dispatchCallers=structuredClone(f.policy.sweepCallers);
 assert.equal((await service.dispatchEligibility(f.r)).eligible,true);assert.equal(calls,1);
});


test('an unselected Process deployment cannot consume a remote claim', async () => {
 const f=fixture(); f.r.authData.runtimeScope.instanceCode='foreign';
 await assert.rejects(service.sweep(f.r)); assert.equal(f.calls.length,0);
});

test('claimed sweep keeps runtime namespace and narrows both reads to the reviewed business entitlement',async()=>{
 const f=fixture(),seen=[];
 const reminder=Object.create(require('../src/service/defaultDigitalCommerceCouponReminderService'));
 f.reply.instance.context.entitlementCode='entitlement';
 SERVICE.DefaultDigitalCouponReminderProcessService=service;
 SERVICE.DefaultDigitalCommerceCouponAcquisitionService={identifier:value=>{assert.equal(typeof value,'string');return value}};
 reminder.candidates=async(r,_now,_p,code)=>{seen.push({enterprise:r.enterpriseCode,principal:r.authData.enterpriseCode,code});return []};
 SERVICE.DefaultDigitalCommerceCouponReminderService=reminder;
 assert.equal((await service.sweep(f.r)).output.sourceStatus,'COMPLETE');
 assert.deepEqual(seen,[{enterprise:'shop',principal:'default',code:'entitlement'},{enterprise:'shop',principal:'default',code:'entitlement'}]);
});

/** Compose actual route-private entry and runtime admission; only Process transport is substituted before claim. */
function privateEntryFixture(qualified = true) {
 const f=fixture();
 const logger=require('../../../../../../nodics.foundation/modules/nConfig/src/service/DefaultLoggerService');
 const runtime=require('../../../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');
 const controller=require('../src/controller/defaultDigitalCouponReminderController');
 const get=CONFIG.get;
 CONFIG.get=k=>k==='log'?{requestPrivacy:{qualified,captureMode:'disabled'}}:get(k);
 f.r.authData.tokenType='service';
 const http={body:f.r.body,headers:{'x-enterprise-code':'default'},query:{}};
 f.r.httpRequest=http;
 SERVICE.DefaultLoggerService=logger;
 SERVICE.DefaultServiceTokenService=runtime;
 SERVICE.DefaultDigitalCouponReminderProcessService=service;
 let invoked=0;
 SERVICE.DefaultModuleService={isLocalModuleActive: moduleName => ["digitalCore"].includes(moduleName), invokeModule:async call=>{
   invoked++;assert.equal(call.moduleName,'workflow');assert.equal(call.connectionName,'workflow');
   assert.equal(call.requireInternalAuth,true);assert.equal(call.header,undefined);
   const moduleOwner=require('../../../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');
   NODICS.getInternalAuthToken=tenant=>{assert.equal(tenant,'t');return 'isolated-test-token'};
   assert.deepEqual(moduleOwner.buildInternalAuthorizationHeader(call),{Authorization:'Bearer isolated-test-token'});
   assert.equal(call.requestBody.sourceRuntimeInstanceId,'process-1');
   throw Object.assign(new Error('SECRET_REMOTE_PAYLOAD'),{code:'ERR_UNTRUSTED',stage:'SOURCE'});
 }};
 const execute=()=>logger.runRequestPrivacy(http,()=>{
   logger.resolveRequestPrivacy(http,true);logger.admitPrivateRoute(http);
   logger.inheritRequestPrivacy(f.r,http);
   return controller.sweep(f.r);
 });
 return {...f,execute,count:()=>invoked};
}

test('real controller privacy guard rejects unqualified capture before any claim with a static registered diagnostic',async()=>{
 const f=privateEntryFixture(false);
 await assert.rejects(f.execute(),{message:'ERR_DIGITAL_REMINDER_PRIVACY'});
 assert.equal(f.count(),0);
 assert.equal(require('../src/utils/statusDefinitions').ERR_DIGITAL_REMINDER_PRIVACY.code,'503');
});

test('real controller and runtime admission reach only internal Process transport; remote text and stage cannot escape',async()=>{
 const f=privateEntryFixture();
 await assert.rejects(f.execute(),error=>{
   assert.equal(error.message,'ERR_DIGITAL_REMINDER_CLAIM_TRANSPORT');
   assert.equal(error.cause,undefined);assert.equal(error.stage,undefined);
   assert(!error.stack.includes('SECRET_REMOTE_PAYLOAD'));
   return true;
 });
 assert.equal(f.count(),1);
});

test('real runtime guard and configured bounds retain distinct preclaim failures without relaxing admission',async()=>{
 for(const [change,stage] of [
   [f=>{f.r.authData.runtimeScope.instanceCode='foreign'},'AUTHORITY'],
   [f=>{f.r.body.context={enterpriseCode:'foreign'}},'INPUT'],
   [f=>{f.policy.actionAuthority.timeoutMs=0},'POLICY'],
 ]){
   const f=privateEntryFixture();change(f);
   await assert.rejects(f.execute(),{message:'ERR_DIGITAL_REMINDER_'+stage});
   assert.equal(f.count(),0);
 }
});

test('postclaim proof and source failures have fixed stages, never supplied error classification',async()=>{
 let f=fixture();f.reply.executionCode='wrong';
 await assert.rejects(service.sweep(f.r),{message:'ERR_DIGITAL_REMINDER_CLAIM_PROOF'});
 f=fixture();SERVICE.DefaultDigitalCommerceCouponReminderService.sweep=async()=>{throw new Error('PRIVATE_SOURCE')};
 await assert.rejects(service.sweep(f.r),error=>error.message==='ERR_DIGITAL_REMINDER_SOURCE'&&!error.stack.includes('PRIVATE_SOURCE'));
});
test('configuration regression C2: Process claim response-byte defaults, overrides and invalid bounds',async()=>{
 for(const maximum of [properties.digitalCore.couponReminders.actionAuthority.maxResponseBytes,65536]){
  const f=fixture();f.policy.actionAuthority.maxResponseBytes=maximum;
  await service.sweep(f.r);assert.equal(f.calls[0].maxResponseBytes,maximum);
  assert.equal(f.calls[0].requireInternalAuth,true);assert.equal(f.calls[0].maxAttempts,1);assert.equal(f.calls[0].followRedirects,false);
 }
 for(const change of [p=>{delete p.actionAuthority.maxResponseBytes},p=>{p.actionAuthority.maxResponseBytes=0},p=>{p.actionAuthority.maxResponseBytes='32768'},
  p=>{delete p.validation.claimResponseBytes},p=>{p.validation.claimResponseBytes={minimum:0,maximum:100}},p=>{p.validation.claimResponseBytes={minimum:2,maximum:1}},
  p=>{p.validation.claimResponseBytes.maximum=p.actionAuthority.maxResponseBytes-1}]){
  const f=fixture();change(f.policy);
  await assert.rejects(service.sweep(f.r),{message:'ERR_DIGITAL_REMINDER_POLICY'});assert.equal(f.calls.length,0);
 }
});

test('claim transport distinguishes only fixed refusal classes without remote messages or recovery authority',async()=>{
 for(const [error,stage] of [
  [{metadata:{runtimeInvocationDiagnostic:{failureCode:'INTERNAL_TOKEN_UNAVAILABLE'}}},'CREDENTIAL'],
  [{metadata:{runtimeInvocationDiagnostic:{failureCode:'REMOTE_ENDPOINT_UNAVAILABLE'}}},'ENDPOINT'],
  [{status:404},'HTTP_NOT_FOUND'],[{status:403},'HTTP_AUTHORITY'],[{status:409},'HTTP_CONFLICT'],
  [{status:500},'HTTP_SERVER'],[{code:'ECONNREFUSED'},'NETWORK'],[new TypeError('private'),'LOCAL'],
 ]){
  const f=fixture();Object.assign(error,{message:'private',stage:'SOURCE',sourceCode:'private'});
  SERVICE.DefaultModuleService.invokeModule=async()=>{throw error};
  await assert.rejects(service.sweep(f.r),e=>e.message==='ERR_DIGITAL_REMINDER_CLAIM_'+stage&&!e.stack.includes('private')&&e.cause===undefined&&e.metadata===undefined);
  assert(require('../src/utils/statusDefinitions')['ERR_DIGITAL_REMINDER_CLAIM_'+stage]);
 }
});

test('Process claim module identity resolves the canonical process prefix through actual router and registry builders',()=>{
 fixture();
 const modules=require('../../../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');
 const router={...require('../../../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterService'),LOG:{debug(){},error(){}}};
 const metadata=require('../../../../../../nodics.process/modules/workflow/package.json');
 NODICS.getRawModule=name=>name==='workflow'?{metaData:metadata}:undefined;
 router.getModuleServerConfig=()=>({getOptions:()=>({contextRoot:'nodics'}),getAbstractEndpoint:()=>({getHttpHost:()=> 'process.test',getHttpPort:()=>4330})});
 SERVICE.DefaultRouterService=router;
 const owner={...modules,LOG:{debug(){}}};
 const call={moduleName:'workflow',connectionName:'process',apiName:'/instances/instance/actions/claim',methodName:'POST'};
 assert.equal(owner.buildRequest(call).uri,'http://process.test:4330/nodics/process/v0/instances/instance/actions/claim');
 assert.equal(owner.buildRuntimeRegistryRequest(call,{endpoint:'http://process.test:4330/nodics/process'},{}).uri,'http://process.test:4330/nodics/process/v0/instances/instance/actions/claim');
});


test('configured claim selects the registered Process owner without inactive workflow metadata',()=>{
 fixture();
 const resolver=require('../../../../../../nodics.foundation/modules/nService/src/service/module/defaultRuntimeRegistryResolverService');
 const transport=require('../../../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');
 NODICS.getRawModule=()=>undefined;
 const owner={moduleName:'workflow',connectionName:'processServer',server:'processServer',instanceId:'process-one',runtimeRole:{code:'PROCESS',publication:'OPERATIONAL'},endpoint:'http://process.test:4330/nodics/process',state:'UP',clientCallable:true};
 const call={moduleName:'workflow',connectionName:properties.digitalCore.couponReminders.actionAuthority.connectionName,targetAuthority:{publication:'OPERATIONAL'},apiName:'/instances/one/actions/claim'};
 assert.equal(resolver.resolveFromOwners({...call,connectionName:'process'},[owner]),undefined);
 const selected=resolver.resolveFromOwners(call,[owner]);assert(selected);
 assert.equal(transport.buildRuntimeRegistryRequest(call,selected,{}).uri,'http://process.test:4330/nodics/process/v0/instances/one/actions/claim');
 assert.ok(resolver.resolveFromOwners(call,[{...owner,runtimeRole:{ code: "REGROUPED", publication: "OPERATIONAL" }}]));
 assert.equal(resolver.resolveFromOwners(call,[{...owner,runtimeRole:{code:'PROCESS',publication:'STAGED'}}]),undefined);
});

test('actual nService fetch normalization retains bounded HTTP/network proof for Digital diagnostics',async()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const prefix='../../../../../../nodics.foundation/modules/';
 for(const [status,network,stage] of [[403,null,'HTTP_AUTHORITY'],[404,null,'HTTP_NOT_FOUND'],[409,null,'HTTP_CONFLICT'],[500,null,'HTTP_SERVER'],[null,'ECONNREFUSED','NETWORK']]){
  const f=fixture(),get=CONFIG.get;
  CONFIG.get=k=>k==='defaultErrorCodes'?{NodicsError:'ERR_SYS_00000'}:get(k);
  global.UTILS={...require(prefix+'nConfig/src/utils/utils'),...require(prefix+'nDatabase/database/src/utils/utils'),...require(prefix+'nCommon/src/utils/utils')};
  CLASSES.NodicsError=require(prefix+'nCommon/src/lib/nodicsError');
  SERVICE.DefaultStatusService={...require(prefix+'nService/src/service/status/defaultStatusService'),statusMap:{...require('../src/utils/statusDefinitions'),ERR_SYS_00000:{code:'500',message:'Internal error'}}};
  let calls=0;
  const sandbox={module:{exports:{}},require:name=>name==='node-fetch'?async()=>{
    calls++;
    if(network) throw Object.assign(new Error('PRIVATE_REMOTE'),{code:network});
    return {ok:false,status,json:async()=>({code:'ERR_SYS_00000',message:'PRIVATE_REMOTE'})};
  }:require(name),CLASSES,CONFIG,SERVICE,URL,AbortController,setTimeout,clearTimeout,process,Buffer};
  vm.runInNewContext(fs.readFileSync(require.resolve(prefix+'nService/src/service/module/defaultModuleService'),'utf8'),sandbox);
  const transport=Object.assign(Object.create(sandbox.module.exports),{
    LOG:{debug(){}},getTransportConfiguration:()=>structuredClone(require(prefix+'nService/config/properties').serviceCommunication),
    buildFetchErrorContext:()=>({layer:'isolated-reminder-contract'})
  });
  SERVICE.DefaultModuleService.invokeModule=async()=>{
    try {return await transport.fetch({uri:'http://127.0.0.1:1/not-used',method:'POST',headers:{},json:true,maxAttempts:1,nodicsContext:{moduleName:'workflow'}})}
    catch(error){
      assert(error instanceof CLASSES.NodicsError);assert.equal(error.status,undefined);
      if(status) assert.equal(error.metadata.remoteHttpFailure.httpStatus,status);
      else assert.equal(error.metadata.transportFailure.code,network);
      throw error;
    }
  };
  try {
    await assert.rejects(service.sweep(f.r),error=>{
      assert.equal(error.code,'ERR_DIGITAL_REMINDER_CLAIM_'+stage);
      assert.equal(error.causes.length,0);assert.equal(error.metadata,undefined);
      assert(!error.message.includes('PRIVATE_REMOTE'));assert(!error.stack.includes('PRIVATE_REMOTE'));
      return true;
    });
    assert.equal(calls,1);
  } finally {await transport.closeTransport()}
 }
});


test('Process claim requires OPERATIONAL owner publication and preserves exact optional deployment and grants', async () => {
 for (const targetAuthority of [undefined, {}, {publication:'STAGED'}, {publication:'ONLINE'},
  {runtimeRole:'PROCESS'}, {publication:'OPERATIONAL',runtimeRole:'PROCESS'}, {publication:'OPERATIONAL',server:''}]) {
  const f=fixture(); f.policy.actionAuthority.targetAuthority=targetAuthority;
  await assert.rejects(service.sweep(f.r)); assert.equal(f.calls.length,0);
 }
 const f=fixture(), signed=structuredClone(f.r.authData);
 f.policy.actionAuthority.targetAuthority={publication:'OPERATIONAL',server:'regrouped-workflow',environment:'Local'};
 await service.sweep(f.r);
 assert.deepEqual(f.calls[0].targetAuthority,f.policy.actionAuthority.targetAuthority);
 assert.equal(f.calls[0].moduleName,'workflow'); assert.equal(f.calls[0].requireInternalAuth,true);
 assert.deepEqual(f.r.authData,signed);
});

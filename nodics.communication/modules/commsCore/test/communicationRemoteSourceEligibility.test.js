/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module commsCore/test/communicationRemoteSourceEligibility @description Verifies remote source checks remain exact, private, fail-closed and single-attempt. @owner commsCore @layer test */
const test=require('node:test'), assert=require('node:assert/strict');
const runtime=require('../src/service/defaultCommunicationRuntimeService');
const defaults=require('../config/properties');
function fixture(){
 const policy=structuredClone(defaults.communication);policy.dispatchEligibilityOwners={digitalCore:{DIGITAL_COUPON_EXPIRING:structuredClone(require('../../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/config/properties').communication.dispatchEligibilityOwners.digitalCore.DIGITAL_COUPON_EXPIRING)}};
 const intent={tenant:'t',code:'intent',sourceModule:'digitalCore',sourceType:'DIGITAL_COUPON_EXPIRING',sourceCode:'source',recipientId:'staff',recipientAddressReference:'opaque',purpose:'DIGITAL_COUPON_EXPIRING',channel:'IN_APP',idempotencyKey:'key',expiresAt:'2026-11-08T00:00:00.000Z',requiresSourceEligibility:true,renderedContent:'private-content'};
 const reply={eligible:true,tenant:'t',sourceCode:'source',recipientId:'staff',recipientAddressReference:'opaque'};
 const calls=[];global.CONFIG={get:k=>k==='communication'?policy:undefined};
 global.SERVICE={DefaultLoggerService:{runSensitiveOperation:(_r,fn)=>fn()},DefaultModuleService:{invokeModule:async call=>{calls.push(call);return {data:reply}}}};
 return {policy,intent,reply,calls,r:{tenant:'t',authData:{token:'private-auth'}}};
}
test('remote eligibility sends only frozen coordinates through internal auth',async()=>{
 const f=fixture();assert.equal(await runtime.sourceEligible(f.r,f.intent,f.policy),true);
 assert.equal(f.calls.length,1); const c=f.calls[0]; assert.equal(c.maxAttempts,1);assert.equal(c.requireInternalAuth,true);
 assert.equal(c.header,undefined); assert.equal(c.requestBody.tenant,undefined);assert.equal(c.requestBody.authData,undefined);
 assert.deepEqual(c.request.authData,f.r.authData); assert.notEqual(c.request.authData,f.r.authData);
 assert.equal(JSON.stringify(c.requestBody).includes('private-'),false); assert.deepEqual(c.targetAuthority,{publication:'OPERATIONAL'});
 assert.equal(c.connectionName,undefined); assert.equal(c.local,undefined); assert.equal(c.serviceName,'DefaultDigitalCouponReminderDeliveryService');
});
test('negative proof suppresses while mismatched and failed proof refuse without fallback',async()=>{
 const f=fixture();f.reply.eligible=false;assert.equal(await runtime.sourceEligible(f.r,f.intent,f.policy),false);
 f.reply.recipientId='foreign';await assert.rejects(runtime.sourceEligible(f.r,f.intent,f.policy));
 SERVICE.DefaultModuleService.invokeModule=async()=>({code:'ERR_OWNER'});await assert.rejects(runtime.sourceEligible(f.r,f.intent,f.policy));
});
test('untrusted descriptors and foreign tenant refuse before transport',async()=>{
 for(const mutate of [f=>f.policy.dispatchEligibilityOwners.digitalCore.DIGITAL_COUPON_EXPIRING.apiName='https://foreign',f=>f.policy.dispatchEligibilityOwners.digitalCore.DIGITAL_COUPON_EXPIRING.moduleName='profile',f=>f.intent.tenant='other']){
  const f=fixture();mutate(f);await assert.rejects(runtime.sourceEligible(f.r,f.intent,f.policy));assert.equal(f.calls.length,0);
 }
});
test('configuration regression C1: source response-byte defaults, overrides and invalid bounds',async()=>{
 for(const maximum of [defaults.communication.sourceEligibilityTransport.maxResponseBytes,16384]){
  const f=fixture();f.policy.sourceEligibilityTransport.maxResponseBytes=maximum;
  assert.equal(await runtime.sourceEligible(f.r,f.intent,f.policy),true);
  assert.equal(f.calls[0].maxResponseBytes,maximum);assert.equal(f.calls[0].maxAttempts,1);assert.equal(f.calls[0].followRedirects,false);
 }
 for(const change of [p=>{delete p.maxResponseBytes},p=>{p.maxResponseBytes=0},p=>{p.maxResponseBytes=1.5},p=>{p.maxResponseBytes='8192'},
  p=>{delete p.validation.responseBytes},p=>{p.validation.responseBytes={minimum:0,maximum:100}},p=>{p.validation.responseBytes={minimum:2,maximum:1}},
  p=>{p.validation.responseBytes.maximum=p.maxResponseBytes-1}]){
  const f=fixture();change(f.policy.sourceEligibilityTransport);
  await assert.rejects(runtime.sourceEligible(f.r,f.intent,f.policy));assert.equal(f.calls.length,0);
 }
});


test('actual DMS selects local owner or registry owner without role/host configuration and never falls back after local refusal', async t => {
 const previous = Object.fromEntries(['CONFIG','SERVICE','NODICS','_','CLASSES'].map(key => [key, global[key]]));
 t.after(() => Object.assign(global, previous));
 const f = fixture(), dms = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');
 const resolver = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultRuntimeRegistryResolverService');
 const owner = { moduleName:'digitalCore', server:'functional-owner', projectCode:'project', environment:'unit',
  endpoint:'https://owner.invalid/nodics/digitalCore', clientCallable:true, state:'UP', runtimeRole:{code:'UNRELATED',publication:'OPERATIONAL'} };
 const state = { active:true, remoteOnly:false, publication:'OPERATIONAL', eligible:true, localFailure:false, remoteFailure:false, local:[], wire:[], leases:[owner] };
 global._ = require('lodash');
 global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code=code; } } };
 global.NODICS = { isModuleActive:name=>name==='digitalCore' && state.active, getSelectedEnvironmentName:()=> 'unit',
  getServerName:()=> 'functional-owner', getInternalAuthToken:tenant=> {assert.equal(tenant,'t');return 'internal-runtime-token';} };
 CONFIG.get = key => key==='communication'?f.policy:key==='runtimeRole'?{code:'ARBITRARY',publication:state.publication}:undefined;
 SERVICE.DefaultRouterService = {getModuleServerConfig:name=>{assert.equal(name,'digitalCore');return {getOptions:()=>({remoteOnly:state.remoteOnly})};}};
 SERVICE.DefaultDigitalCouponReminderDeliveryService = {isDispatchEligible:async input=>{
  state.local.push(input); if(state.localFailure)throw Error('fresh local source unavailable');
  return {...f.reply,eligible:state.eligible};
 }};
 SERVICE.DefaultRuntimeRegistryResolverService = {resolveOwner:options=>resolver.resolveFromOwners(options,state.leases)};
 SERVICE.DefaultModuleService = {...dms, fetch:async wire=>{
  state.wire.push(wire);if(state.remoteFailure)throw Error('remote owner unavailable');return {data:{...f.reply,eligible:state.eligible}};
 }};
 const run=()=>runtime.sourceEligible(f.r,f.intent,f.policy);
 const original=structuredClone(f.r);
 assert.equal(await run(),true); assert.equal(state.wire.length,0);
 assert.deepEqual(state.local[0].authData,original.authData);assert.notEqual(state.local[0].authData,f.r.authData);
 assert.equal(state.local[0].renderedContent,undefined);
 state.eligible=false;assert.equal(await run(),false,'fresh local denial must suppress');
 state.localFailure=true;await assert.rejects(run());assert.equal(state.wire.length,0,'local failure is never remote fallback');
 state.localFailure=false;state.remoteOnly=true;state.eligible=true;
 assert.equal(await run(),true);assert.equal(state.local.length,3);assert.equal(state.wire.length,1);
 const wire=state.wire[0];assert.equal(wire.uri,'https://owner.invalid/nodics/digitalCore/v0/internal/coupons/reminder-dispatch-eligibility');
 assert.equal(wire.headers.Authorization,'Bearer internal-runtime-token');
 assert.equal(wire.body.authData,undefined);assert.equal(wire.body.tenant,undefined);
 assert.equal(JSON.stringify(wire).includes('private-'),false);assert.equal(wire.maxAttempts,1);
 assert.equal(wire.nodicsContext.connectionName,'digitalCore');assert.deepEqual(wire.nodicsContext.targetAuthority,{publication:'OPERATIONAL'});
 state.eligible=false;assert.equal(await run(),false,'fresh remote denial must suppress');
 state.remoteOnly=false;state.active=false;state.eligible=true;assert.equal(await run(),true);
 state.active=true;state.publication='STAGED';assert.equal(await run(),true,'source-only Staged module must use operational remote owner');
 state.publication='ONLINE';assert.equal(await run(),true);
 state.remoteFailure=true;await assert.rejects(run());assert.equal(state.local.length,3);
 state.remoteFailure=false;state.leases=[{...owner,runtimeRole:{publication:'STAGED'}}];
 await assert.rejects(run());assert.equal(state.local.length,3);
 assert.deepEqual(f.r,original);
});

test('ordinary source descriptor refuses obsolete role/connection and incomplete publication without dispatch', async () => {
 for(const mutate of [o=>{o.runtimeRole='COMMERCE'},o=>{o.connectionName='commerce'},o=>{delete o.serviceName},
  o=>{delete o.targetAuthority},o=>{o.targetAuthority={publication:'STAGED'}},o=>{o.targetAuthority={publication:'ONLINE'}},
  o=>{o.targetAuthority={runtimeRole:'COMMERCE'}},o=>{o.targetAuthority={publication:'OPERATIONAL',server:123}}]){
  const f=fixture();mutate(f.policy.dispatchEligibilityOwners.digitalCore.DIGITAL_COUPON_EXPIRING);
  await assert.rejects(runtime.sourceEligible(f.r,f.intent,f.policy));assert.equal(f.calls.length,0);
 }
 const source=require('../../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/config/properties');
 assert.equal(source.communication.runtimeRoleProfiles,undefined);
 assert.equal(source.digitalCore.couponReminders.enabled,false);
});

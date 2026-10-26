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
 const policy=structuredClone(defaults.communication);policy.dispatchEligibilityOwners={digitalCore:{DIGITAL_COUPON_EXPIRING:{moduleName:'digitalCore',connectionName:'commerce',runtimeRole:'COMMERCE',apiName:'/internal/coupons/reminder-dispatch-eligibility'}}};
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
 assert.equal(JSON.stringify(c).includes('private-'),false); assert.equal(c.targetAuthority.runtimeRole,'COMMERCE');
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

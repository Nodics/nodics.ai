/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module commsApi/test/communicationInboxSource @description Verifies private inbox source selectors without leaking another recipient's intent. @owner commsApi @layer test */
const {test,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const facade=require('../src/facade/defaultCommunicationApiFacade');
const defaults=require('../config/properties').communicationApi;
const request={tenant:'runtime-a',authData:{principalType:'customer',loginId:'owner@example.test'}};
function setup(){
 global.CONFIG={get:()=>defaults};
 const calls=[];
 global.SERVICE={DefaultModuleService:{invokeModule:async()=>({result:[{code:'owner',loginId:request.authData.loginId}]})},DefaultCommunicationRuntimeService:{list:async(schema,input,query)=>{
  assert.equal(input.tenant,'runtime-a');calls.push({schema,query});
  const rows=schema==='CommsInboxMessage' ? [
   {code:'mine',intentCode:'intent-own',recipientId:'owner',body:'Recorded message'},
   {code:'bad-pointer',intentCode:'intent-other',recipientId:'owner'},
   {code:'other',intentCode:'intent-other',recipientId:'other'},
  ] : [
   {code:'intent-own',recipientId:'owner',channel:'IN_APP',sourceModule:'eWaste',sourceType:'wasteSubmission',sourceCode:'WST_1',variables:{secret:'PRIVATE'},recipientAddressReference:'PRIVATE'},
   {code:'intent-other',recipientId:'other',channel:'IN_APP',sourceModule:'eWaste',sourceType:'wasteSubmission',sourceCode:'PRIVATE'},
  ];
  return rows.filter(row=>Object.entries(query).every(([key,value])=>typeof value==='object'?value.$in.includes(row[key]):row[key]===value));
 }}};
 return calls;
}
afterEach(()=>{delete global.CONFIG;delete global.SERVICE;});
test('only an owner-matched IN_APP intent supplies a safe domain source selector',async()=>{
 const calls=setup(),result=await facade.listInbox(request);
 assert.equal(result.length,2);
 assert.deepEqual(result[0].source,{module:'eWaste',type:'wasteSubmission',code:'WST_1'});
 assert.equal(result[1].source,undefined);
 assert(!JSON.stringify(result).includes('PRIVATE'));
 assert(!JSON.stringify(result).includes('recipientId'));
 assert.equal(calls[1].query.recipientId,'owner');assert.equal(calls[1].query.channel,'IN_APP');
});
test('employee callers cannot obtain a customer inbox',async()=>{
 const calls=setup();await assert.rejects(facade.listInbox({...request,authData:{...request.authData,principalType:'employee'}}),/Customer context required/);assert.equal(calls.length,0);
});
test('failed canonical Profile identity resolution never falls back to the caller code',async()=>{
 const calls=setup();SERVICE.DefaultModuleService.invokeModule=async()=>({result:[{code:'other',loginId:'other@example.test'}]});
 await assert.rejects(facade.listInbox(request),/Customer identity unavailable/);assert.equal(calls.length,0);
});

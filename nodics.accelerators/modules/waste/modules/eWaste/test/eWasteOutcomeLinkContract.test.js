/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
/** @module eWaste/test/eWasteOutcomeLinkContract @description Protects record-specific outcome links and immutable Communication intent recovery. @owner eWaste @layer test */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const service=require('../src/service/defaultEWasteOutcomeCommunicationService');
const config={enabled:true,connectionName:'engagement',templateCode:'TEST',detailLinks:{TELEGRAM:{url:'https://t.me/test_bot',parameter:'startapp'},IN_APP:{url:'https://example.test/mobile',parameter:'submission'}}};
test('outcome links preserve the exact record and use deployment-owned destinations',()=>{
 assert.equal(service.detailLink(config,'TELEGRAM','WST_A'),'https://t.me/test_bot?startapp=WST_A');
 assert.equal(service.detailLink(config,'IN_APP','WST_A'),'https://example.test/mobile?submission=WST_A');
 assert.equal(service.detailLink({},'TELEGRAM','WST_A'),null);
 assert.throws(()=>service.detailLink(config,'TELEGRAM','../../other'));
 assert.throws(()=>service.detailLink({detailLinks:{TELEGRAM:{url:'javascript:alert(1)',parameter:'code'}}},'TELEGRAM','WST_A'));
});
test('new recorded outcomes pass the exact public feedback and detail link to Communication',async()=>{
 let payload;
 const submission={code:'WST_A',submissionStatus:'APPROVED',submitterRef:{code:'OWNER'},metadata:{origin:{channel:'TELEGRAM',identityLinkCode:'LINK'},publicReason:'Accepted after inspection.',reviewKey:'REVIEW'}};
 global.SERVICE={DefaultEWasteExperienceService:{settings:()=>({outcomeCommunication:config}),remote:async(_r,_m,_c,_p,_v,body)=>{payload=body;return{intentCode:'INTENT',status:'DELIVERED',revision:2};},store:()=>({one:async()=>submission,update:async(_s,_r,current,patch)=>({...current,...patch})})}};
 const result=await service.notify({},submission);
 assert.deepEqual(payload.variables,{submissionCode:'WST_A',status:'APPROVED',comment:'Accepted after inspection.',detailUrl:'https://t.me/test_bot?startapp=WST_A'});
 assert.equal(result.metadata.outcomeDelivery.intentCode,'INTENT');
});
test('existing delivered content is not recreated and explicit retry uses the original intent after template changes',async()=>{
 let calls=[];
 const submission={code:'WST_A',submissionStatus:'APPROVED',metadata:{reviewKey:'R',outcomeDelivery:{intentCode:'ORIGINAL',status:'RETRY_PENDING'}}};
 global.SERVICE={DefaultEWasteExperienceService:{settings:()=>({outcomeCommunication:{...config,detailLinks:{IN_APP:{url:'invalid',parameter:'x'}}}}),remote:async(...args)=>{calls.push(args);return{intentCode:'ORIGINAL',status:'DELIVERED',revision:2};},store:()=>({one:async()=>submission,update:async(_s,_r,current,patch)=>({...current,...patch})})}};
 await service.notify({},submission);assert.equal(calls.length,0);
 await service.notify({retryDelivery:true},submission);assert.equal(calls.length,1);assert.equal(calls[0][3],'/internal/communications/ORIGINAL/retry');
});

function recoveryFixture(pointer, remote, readback) {
 const submission={code:'WST_A',submissionStatus:'REJECTED',submitterRef:{code:'OWNER'},metadata:{reviewKey:'REVIEW',outcomeDelivery:pointer}};
 const writes=[],calls=[];
 global.SERVICE={DefaultEWasteExperienceService:{settings:()=>({outcomeCommunication:config}),remote:async(...args)=>{calls.push(args);return remote(...args);},store:()=>({one:async()=>readback||submission,update:async(_s,_r,current,patch)=>{writes.push(patch);return {...current,...patch};}})}};
 return {submission,writes,calls};
}
test('failed retries retain the original uncertain or retry-pending intent without metadata writes',async()=>{
 for(const status of ['UNCERTAIN','RETRY_PENDING']) {
  const pointer={intentCode:'ORIGINAL',status,revision:3};
  const f=recoveryFixture(pointer,async()=>{throw Error('Transport unavailable');});
  const result=await service.notify({retryDelivery:true},f.submission);
  assert.deepEqual(result.metadata.outcomeDelivery,pointer);
  assert.equal(f.writes.length,0);
  assert.equal(f.calls.length,1);
  assert.equal(f.calls[0][3],'/internal/communications/ORIGINAL/retry');
 }
});
test('malformed, mismatched and regressive retry acknowledgements cannot erase or replace the pointer',async()=>{
 for(const delivery of [null,{}, {intentCode:'OTHER',status:'DELIVERED',revision:4}, {intentCode:'ORIGINAL',status:'',revision:4}, {intentCode:'ORIGINAL',status:'DELIVERED'}, {intentCode:'ORIGINAL',status:'DELIVERED',revision:2}]) {
  const pointer={intentCode:'ORIGINAL',status:'UNCERTAIN',revision:3};
  const f=recoveryFixture(pointer,async()=>delivery);
  const result=await service.notify({retryDelivery:true},f.submission);
  assert.deepEqual(result.metadata.outcomeDelivery,pointer);
  assert.equal(f.writes.length,0);
 }
});
test('failed or stale retries preserve a concurrently advanced source pointer',async()=>{
 for(const fail of [true,false]) {
  const pointer={intentCode:'ORIGINAL',status:'RETRY_PENDING',revision:3};
  const readback={code:'WST_A',metadata:{reviewKey:'REVIEW',outcomeDelivery:{intentCode:'ORIGINAL',status:'DELIVERED',revision:5}}};
  const f=recoveryFixture(pointer,async()=>{if(fail)throw Error('Transport unavailable');return{intentCode:'ORIGINAL',status:'RETRY_PENDING',revision:4};},readback);
  assert.equal(await service.notify({retryDelivery:true},f.submission),readback);
  assert.equal(f.writes.length,0);
 }
});
test('a confirmed original retry may replace the source projection',async()=>{
 const delivery={intentCode:'ORIGINAL',status:'DELIVERED',revision:4};
 const f=recoveryFixture({intentCode:'ORIGINAL',status:'RETRY_PENDING',revision:3},async()=>delivery);
 const result=await service.notify({retryDelivery:true},f.submission);
 assert.deepEqual(result.metadata.outcomeDelivery,delivery);
 assert.equal(f.writes.length,1);
});
test('an equal-revision or different-intent readback never overwrites the fresh source pointer',async()=>{
 for(const intentCode of ['ORIGINAL','CONCURRENT']) {
  const readback={code:'WST_A',metadata:{reviewKey:'REVIEW',outcomeDelivery:{intentCode,status:'UNCERTAIN',revision:4}}};
  const f=recoveryFixture({intentCode:'ORIGINAL',status:'RETRY_PENDING',revision:3},async()=>({intentCode:'ORIGINAL',status:'DELIVERED',revision:4}),readback);
  assert.equal(await service.notify({retryDelivery:true},f.submission),readback);
  assert.equal(f.writes.length,0);
 }
});
test('a first acknowledgement survives failure of its immediate explicit retry',async()=>{
 let attempts=0;
 const delivery={intentCode:'ORIGINAL',status:'RETRY_PENDING',revision:1};
 const f=recoveryFixture(undefined,async()=>{if(++attempts===2)throw Error('Transport unavailable');return delivery;});
 const result=await service.notify({retryDelivery:true},f.submission);
 assert.deepEqual(result.metadata.outcomeDelivery,delivery);
 assert.equal(f.calls.length,2);
 assert.equal(f.calls[1][3],'/internal/communications/ORIGINAL/retry');
});
test('an unavailable initial notification remains pending without inventing an intent',async()=>{
 const f=recoveryFixture(undefined,async()=>{throw Error('Transport unavailable');});
 const result=await service.notify({},f.submission);
 assert.equal(result.metadata.outcomeDelivery.status,'PENDING');
 assert.equal(result.metadata.outcomeDelivery.intentCode,undefined);
});

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
 global.SERVICE={DefaultEWasteExperienceService:{settings:()=>({outcomeCommunication:config}),remote:async(_r,_m,_c,_p,_v,body)=>{payload=body;return{intentCode:'INTENT',status:'DELIVERED'};},store:()=>({one:async()=>submission,update:async(_s,_r,current,patch)=>({...current,...patch})})}};
 const result=await service.notify({},submission);
 assert.deepEqual(payload.variables,{submissionCode:'WST_A',status:'APPROVED',comment:'Accepted after inspection.',detailUrl:'https://t.me/test_bot?startapp=WST_A'});
 assert.equal(result.metadata.outcomeDelivery.intentCode,'INTENT');
});
test('existing delivered content is not recreated and explicit retry uses the original intent after template changes',async()=>{
 let calls=[];
 const submission={code:'WST_A',submissionStatus:'APPROVED',metadata:{reviewKey:'R',outcomeDelivery:{intentCode:'ORIGINAL',status:'RETRY_PENDING'}}};
 global.SERVICE={DefaultEWasteExperienceService:{settings:()=>({outcomeCommunication:{...config,detailLinks:{IN_APP:{url:'invalid',parameter:'x'}}}}),remote:async(...args)=>{calls.push(args);return{intentCode:'ORIGINAL',status:'DELIVERED'};},store:()=>({one:async()=>submission,update:async(_s,_r,current,patch)=>({...current,...patch})})}};
 await service.notify({},submission);assert.equal(calls.length,0);
 await service.notify({retryDelivery:true},submission);assert.equal(calls.length,1);assert.equal(calls[0][3],'/internal/communications/ORIGINAL/retry');
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
 */

const test=require('node:test');const assert=require('node:assert/strict');const definition=require('../src/service/defaultPublicationLifecycleService');
class NodicsError extends Error{constructor(code){super(code);this.code=code;}};global.CLASSES={NodicsError};
test('failed legacy rollback requires fresh owner rejection proof and never activates',async()=>{
 let calls=0,writes=0;const record={code:'x',domain:'domain',state:'FAILED',revision:8,previousOnlineVersion:'old'};let admitted=false;
 const provider={canRetryRejectedRollback:async()=>admitted,rollback:async()=>{calls++;return {version:'old'}}};
 const service={...definition,getRepository:()=>({get:async()=>record}),getVersionProvider:()=>provider,failedOperation:()=> 'ROLLING_BACK',getDomainAdapter:()=>({}),transition:async(p,state,request,patch,evidence)=>{writes++;return {...p,state,revision:p.revision+1,evidence}}};
 const request={publicationCode:'x',expectedRevision:8};service.requireExpectedRevision=()=>true;
 await assert.rejects(service.retry(request),{code:'ERR_PUB_00006'});assert.equal(calls,0);assert.equal(writes,0);
 admitted=true;const result=await service.retry(request);assert.equal(result.state,'ROLLED_BACK');assert.equal(calls,1);assert.equal(writes,2);
 admitted='true';await assert.rejects(service.rollback(request),{code:'ERR_PUB_00006'});assert.equal(calls,1);
});

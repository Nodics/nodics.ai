/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const test=require('node:test');const assert=require('node:assert/strict');const provider=require('../src/service/publication/defaultCmsPublicationVersionProviderService');
test('only an unchanged current release with a complete pre-effect rejection journal can retry',async()=>{
 const publication={code:'release',state:'FAILED',revision:8,targetVersion:'current',previousOnlineVersion:'previous',auditTrail:[
 {publicationCode:'release',revision:6,toState:'ONLINE',details:{version:'current',previousOnlineVersion:'previous'}},
 {publicationCode:'release',revision:7,fromState:'ONLINE',toState:'ROLLING_BACK'},
 {publicationCode:'release',revision:8,fromState:'ROLLING_BACK',toState:'FAILED',details:{failureCode:'ERR_CMS_00116'}}]};
 const service={...provider,getOnlineVersion:async()=>({version:'current'})};assert.equal(await service.canRetryRejectedRollback(publication,{}),true);
 for(const mutate of [p=>p.auditTrail.at(-1).details.failureCode='TRANSPORT_TIMEOUT',p=>p.auditTrail.at(-1).revision=9,p=>p.previousOnlineVersion='foreign',p=>p.auditTrail.at(-2).fromState='FAILED',p=>p.auditTrail.shift()]) {const p=structuredClone(publication);mutate(p);assert.equal(await service.canRetryRejectedRollback(p,{}),false);}
 service.getOnlineVersion=async()=>({version:'newer'});assert.equal(await service.canRetryRejectedRollback(publication,{}),false);
});

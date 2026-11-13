/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const service=require('../src/service/config/defaultCacheConfigurationService');
global.UTILS={generateHash:value=>crypto.createHash('sha256').update(value).digest('hex')};
const request=()=>({tenant:'tenant-a',searchModel:{moduleName:'discoveryProjection',indexName:'documents'},options:{},searchOptions:{limit:10},normalizedSearchRequest:{mode:'LEXICAL',text:'privacy',fields:['payload.content'],filters:{sourceCode:['approved-a'],policyDigest:['revision-a']},size:10},authData:{loginId:'reviewer-a',enterpriseCode:'enterprise-a',permissions:['knowledge.read'],userGroups:['reviewers']}});
test('a warmed query cache cannot answer another text or source policy',()=>{
 const first=request();const warmed=new Map([[service.createSearchKey(first),['approved-a']]]);
 for(const change of [r=>r.normalizedSearchRequest.text='terms',r=>r.normalizedSearchRequest.filters.sourceCode=['approved-b'],r=>r.normalizedSearchRequest.filters.policyDigest=['revision-b'],r=>r.normalizedSearchRequest.mode='VECTOR',r=>r.normalizedSearchRequest.vector=[1,0],r=>r.normalizedSearchRequest.size=1]){const next=request();change(next);assert.equal(warmed.has(service.createSearchKey(next)),false);}
});
test('search cache separates tenant, index, enterprise, principal and current grants',()=>{
 const key=service.createSearchKey(request());
 for(const change of [r=>r.tenant='tenant-b',r=>r.searchModel.moduleName='anotherOwner',r=>r.searchModel.indexName='otherIndex',r=>r.authData.enterpriseCode='enterprise-b',r=>r.authData.loginId='reviewer-b',r=>r.authData.permissions=[],r=>r.authData.userGroups=[]]){const next=request();change(next);assert.notEqual(service.createSearchKey(next),key);}
});
test('canonical object order and credential rotation preserve equivalent query keys',()=>{const a=request(),b=request();b.normalizedSearchRequest.filters={policyDigest:['revision-a'],sourceCode:['approved-a']};b.authData.authToken='must-never-enter-the-key';const before=JSON.stringify(b);assert.equal(service.createSearchKey(a),service.createSearchKey(b));assert.equal(JSON.stringify(b),before);});
test('raw DSL, query string and unnormalized structured requests remain distinct',()=>{const a=request();delete a.normalizedSearchRequest;const base=service.createSearchKey(a);for(const extra of [{query:{term:{code:'a'}}},{q:'privacy'},{searchRequest:{mode:'LEXICAL',text:'privacy',filters:{sourceCode:['a']}}}])assert.notEqual(service.createSearchKey({...a,...extra}),base);});

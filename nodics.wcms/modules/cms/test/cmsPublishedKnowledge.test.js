/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module cms/test/cmsPublishedKnowledge @description Proves bounded public Online knowledge proof and concurrent withdrawal rejection. @layer test @owner cms */
const test=require('node:test'),assert=require('node:assert/strict');
const delivery=require('../src/service/delivery/defaultCmsDeliveryService');
function fixture(t){const old={CONFIG:global.CONFIG,SERVICE:global.SERVICE};t.after(()=>Object.assign(global,old));
const context={site:'guides',path:'/customer',locale:'en',channel:'web'};
const content={contractVersion:1,...context,accessMode:'PUBLIC',page:{components:[{properties:{body:'Approved customer guide'}}]}};
const pointer={...context,accessMode:'PUBLIC',active:true,manifestCode:'manifest-v1'};
const manifest={code:'manifest-v1',active:true,snapshot:content};
const settings={publication:{enabled:true,runtimeRole:'ONLINE'}};global.CONFIG={get:()=>settings};
global.SERVICE={DefaultCmsOnlinePublicationPointerService:{kind:'pointer'},DefaultCmsPublicationManifestService:{kind:'manifest'}};
let reads=0;const service={...delivery,normalizeContext:()=>context,settings:()=>({maximumKnowledgePageBytes:1048576}),error:(code,message)=>Object.assign(Error(message),{code}),getSingle:async(owner,request,query)=>{assert.equal(request.delivery.accessMode,'PUBLIC');assert.equal(request.router.publicAccess,true);reads++;return owner.kind==='pointer'?pointer:manifest}};
return {service,context,content,pointer,manifest,settings,reads:()=>reads};}
test('public knowledge proves stable exact Online content, ignoring authenticated override',async t=>{const f=fixture(t);const r=await f.service.publishedKnowledge({delivery:{accessMode:'AUTHENTICATED'},authData:{tokenType:'employee'}});assert.equal(r.result.publication.state,'ONLINE');assert.equal(r.result.publication.accessMode,'PUBLIC');assert.match(r.result.publication.contentDigest,/^[a-f0-9]{64}$/);assert.equal(f.reads(),4)});
test('Staged and disabled runtime never read publication records',async t=>{const f=fixture(t);f.settings.publication.runtimeRole='STAGED';await assert.rejects(f.service.publishedKnowledge({}));assert.equal(f.reads(),0);f.settings.publication={enabled:false,runtimeRole:'ONLINE'};await assert.rejects(f.service.publishedKnowledge({}));assert.equal(f.reads(),0)});
test('wrong, inactive, private and oversized publication fails closed',async t=>{for(const change of [f=>f.pointer.active=false,f=>f.manifest.code='other',f=>f.pointer.site='other',f=>f.content.accessMode='AUTHENTICATED',f=>f.content.path='/other',f=>f.service.settings=()=>({maximumKnowledgePageBytes:1})]){const f=fixture(t);change(f);await assert.rejects(f.service.publishedKnowledge({}));}});
test('changed or withdrawn publication between reads returns no knowledge',async t=>{const f=fixture(t),read=f.service.getSingle;let count=0;f.service.getSingle=async(...args)=>{if(++count===3)f.content.page.components[0].properties.body='Changed after first read';return read(...args)};await assert.rejects(f.service.publishedKnowledge({}),/changed/);count=0;f.service.getSingle=async(...args)=>{if(++count===3)throw Error('withdrawn');return read(...args)};await assert.rejects(f.service.publishedKnowledge({}),/withdrawn/)});

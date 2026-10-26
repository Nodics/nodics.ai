/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module loyaltyWallet/test/auctionFundingSelection @description Exact native administration, CAS and isolated Mongo readback. @owner loyaltyWallet @layer test */
const test=require('node:test'),assert=require('node:assert/strict');
const service=require('../src/service/defaultLoyaltyAuctionFundingSelectionService');
const {BSON,ObjectId}=require('mongodb'),copy=v=>BSON.deserialize(BSON.serialize(v));
function fixture(t){
 const keys=['SERVICE','CONFIG','CLASSES','UTILS'];const old=keys.map(k=>[k,global[k]]);t.after(()=>old.forEach(([k,v])=>v===undefined?delete global[k]:global[k]=v));
 const s={wallet:{_id:new ObjectId(),code:'wallet',ownerType:'ENTERPRISE',ownerCode:'RETAIL',revision:0,active:true,status:'OPEN',created:new Date('2026-01-01'),metadata:{testProvision:{original:true},other:'retained'}},
 program:{code:'circa',active:true,status:'ACTIVE',spendEnabled:true,revision:0},type:{code:'points',active:true,status:'ACTIVE',precision:2,revision:0},
 balance:{code:'balance',walletCode:'wallet',programCode:'circa',rewardTypeCode:'points',active:true,revision:0,available:'48',reserved:'0'},writes:0,proofs:0};
 const req=()=>({tenant:'default',authorization:'Bearer original',authData:{tenant:'default',entCode:'default',loginId:'admin',authVersion:1,principalType:'human',tokenType:'access',authenticationMethod:'PASSWORD'},payload:{walletCode:'wallet',ownerType:'ENTERPRISE',ownerCode:'RETAIL',expectedRevision:0,currency:'POINTS',programCode:'circa',rewardTypeCode:'points',enabled:true}});
 global.CONFIG={get:key=>key==='loyalty'?require('../config/properties').loyalty:undefined};
 global.CLASSES={NodicsError:class extends Error{constructor(code){super(code);this.code=code;}}};global.UTILS={isBlank:v=>!v||!Object.keys(v).length};
 let tail=Promise.resolve();const token={};
 global.SERVICE={
 DefaultSecuredRequestPipelineService:{getGrantedPermissions:()=>['system.schema.manage'],getRouteActionAuthorizationConfig:()=>({}),isPermissionGranted:()=>!s.denied},
 DefaultLoggerService:{assertSensitiveRequest:()=>{}},
 DefaultLoyaltyParticipantService:{profile:async(r,path,ent,body)=>{s.proofs++;s.onProof?.(r);return{...body,contractVersion:1,tenant:r.tenant,enterpriseCode:ent,actorCode:'admin',authVersion:1,principalType:'human',platformAdministrator:!s.revoked,...s.proofOverride};},recipient:async(_r,owner)=>s.foreign?{...owner,ownerCode:'FOREIGN'}:owner},
 DefaultLoyaltyAmountService:{precision:p=>{assert.equal(p,2);return p;}},
 DefaultLoyaltyAuctionFundsService:require('../src/service/defaultLoyaltyAuctionFundsService'),
 DefaultDatabaseTransactionService:{capabilities:()=>({multiRecordAtomic:!s.noTransaction,contextPropagation:true}),execute:async(scope,work)=>{assert.deepEqual(scope,{moduleName:'loyaltyWallet',tenant:'default'});const prev=tail;let release;tail=new Promise(r=>release=r);await prev;const before=copy(s.wallet);try{return await work(token);}catch(e){s.wallet=before;throw e;}finally{release();}}},
 };
 for(const [name,key] of [['LoyaltyWallet','wallet'],['LoyaltyProgram','program'],['LoyaltyRewardType','type'],['LoyaltyWalletRewardBalance','balance']])SERVICE['Default'+name+'Service']={get:async r=>{assert.equal(r.transactionContext,token);assert.equal(r.authorization,'Bearer original');assert.equal(r.options.skipItemCache,true);s.onRead?.(key);return{code:'SUC_GET',count:s[key]?1:0,result:s[key]?[copy(s[key])]:[]};}};
 const root='../../../../nodics.foundation/modules/nDatabase/';
 const mongo=require(root+'mongodb/src/schemas/model').default;
 const adapter={...mongo,dataBase:{getOptions:()=>({})},versioned:false,rawSchema:require('../src/schemas/schemas').loyaltyWallet.loyaltyWallet,transactionOptions:()=>({}),
 updateMany:async(query,patch,options)=>{assert.equal(patch.$set._id,undefined);assert.equal(options.upsert,false);assert.deepEqual(Object.keys(patch.$set).sort(),['metadata','revision','updated','updatedBy']);
 const matches=!s.conflict&&Object.entries(query).every(([k,v])=>s.wallet[k]===v);if(matches){s.writes++;Object.assign(s.wallet,copy(patch.$set));s.onWrite?.();}return {acknowledged:true,modifiedCount:matches?1:0};}};
 SERVICE.DefaultLoyaltyWalletService.update=async r=>{assert.equal(r.transactionContext,token);r.schemaModel=adapter;await require(root+'database/src/service/interceptors/defaultInterceptorService').setUpdatedTimestamp(r);return{code:'SUC_UPDATE',result:await require(root+'database/src/service/procs/update/defaultModelsUpdateInitializerService').persistUpdates(r)};};
 return{s,req};
}
test('setter uses real timestamp/initializer/Mongo adapter and preserves original BSON identity, metadata and balances',async t=>{const f=fixture(t),before=copy(f.s.wallet),balance=copy(f.s.balance);const out=await service.update(f.req());assert.equal(out.revision,1);assert.deepEqual(out.auctionFunding,[{currency:'POINTS',programCode:'circa',rewardTypeCode:'points',enabled:true}]);assert.deepEqual(f.s.wallet._id,before._id);assert.deepEqual(f.s.wallet.created,before.created);assert.deepEqual(f.s.wallet.metadata.testProvision,before.metadata.testProvision);assert.deepEqual(f.s.balance,balance);assert.equal(f.s.proofs,3);
 await assert.rejects(service.update(f.req()),{code:'ERR_LOYALTY_AUCTION_IDEMPOTENCY'});const replay=f.req();replay.payload.expectedRevision=1;assert.equal((await service.update(replay)).changed,false);assert.equal(f.s.writes,1);});
test('copied concurrent commands have exactly one CAS winner',async t=>{const f=fixture(t);const results=await Promise.allSettled([service.update(f.req()),service.update(f.req())]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(f.s.writes,1);});
for(const kind of ['owner','wallet','currency','program','type','balance','inactive','paused','expired','permission','native','nonce','foreign','cas','transaction','metadata','drift','readback'])test('refuses '+kind+' without retained mutation',async t=>{const f=fixture(t),r=f.req();
 const setup={owner:()=>r.payload.ownerCode='OTHER',wallet:()=>r.payload.walletCode='OTHER',currency:()=>r.payload.currency='bad currency',program:()=>r.payload.programCode='OTHER',type:()=>r.payload.rewardTypeCode='OTHER',balance:()=>f.s.balance=null,inactive:()=>f.s.wallet.active=false,paused:()=>f.s.program.spendEnabled=false,expired:()=>f.s.program.endsAt='2020-01-01',permission:()=>f.s.denied=true,native:()=>r.authData.principalType='service',nonce:()=>f.s.proofOverride={nonce:'wrong'},foreign:()=>f.s.foreign=true,cas:()=>f.s.conflict=true,transaction:()=>f.s.noTransaction=true,metadata:()=>f.s.wallet.metadata.auctionFunding=[{currency:'POINTS'},{currency:'POINTS'}],drift:()=>f.s.onWrite=()=>f.s.revoked=true,readback:()=>f.s.onWrite=()=>f.s.wallet.ownerCode='changed'};
 setup[kind]();const before=copy(f.s.wallet);await assert.rejects(service.update(r));assert.deepEqual(f.s.wallet,before);
});
test('one selected currency preserves unrelated funding and metadata; caller transaction/extra fields refuse',async t=>{const f=fixture(t);f.s.wallet.metadata.auctionFunding=[{currency:'AED',programCode:'other',rewardTypeCode:'other',enabled:false,retained:true}];const original=copy(f.s.wallet.metadata.auctionFunding[0]);await service.update(f.req());assert.deepEqual(f.s.wallet.metadata.auctionFunding[0],original);for(const key of ['amount','tenant','metadata']){const r=f.req();r.payload[key]='injected';await assert.rejects(service.update(r));}const r=f.req();r.transactionContext={};await assert.rejects(service.update(r));assert.throws(()=>service.storage({},null,{}));});
test('route consumes existing schema manage authority and native evidence allowlist without new permission',()=>{const route=require('../../loyaltyApi/src/router/routers').loyaltyApi.walletAdministration.auctionFundingSelection;assert.equal(route.permission,'system.schema.manage');assert.equal(route.method,'PUT');assert.equal(route.cache.enabled,false);assert.equal(route.requestPrivacy.sensitive,true);assert.deepEqual(route.accessGroups,['platformAdministratorUserGroup']);assert.ok(require('../../../../nodics.platform/modules/profile/config/properties').profilePlatformAdministratorEvidence.allowedPermissions.includes(route.permission));});
test('HTTP controller and facade retain original native identity and return only canonical selection receipt',async t=>{
 const f=fixture(t),r=f.req(),old=global.FACADE;t.after(()=>old===undefined?delete global.FACADE:global.FACADE=old);
 SERVICE.DefaultLoyaltyAuctionFundingSelectionService=service;
 global.FACADE={DefaultLoyaltyInternalFacade:{...require('../../loyaltyApi/src/facade/defaultLoyaltyInternalFacade'),service:name=>SERVICE[name]}};
 r.httpRequest={body:structuredClone(r.payload),headers:{authorization:r.authorization,'x-enterprise-code':'default'}};
 r.httpResponse={setHeader:(key,value)=>{assert.equal(key,'Cache-Control');assert.equal(value,'no-store');}};
 const out=await require('../../loyaltyApi/src/controller/defaultLoyaltyInternalController').auctionFundingSelection(r);
 assert.equal(out.data.walletCode,'wallet');assert.equal(out.data.revision,1);assert.equal(out.data.ownerCode,'RETAIL');assert.equal(out.data.metadata,undefined);
});

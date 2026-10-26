/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module digitalCore/test/digitalBundlePublicationReplay @description Real managed-concurrency publication replay before the original Bidding handoff. @layer test @owner digitalCore */
const test=require('node:test'),assert=require('node:assert/strict'),{isDeepStrictEqual:same}=require('node:util');
const fixture=require('./bundlePublicationFixture.cjs');
const listing=require('../src/service/defaultDigitalCommerceAuctionService');
const bundles=require('../src/service/defaultDigitalBundleService');

/** Installs actual timestamp, generated update, concurrency and Mongo CAS over isolated BSON storage. */
function managed(f,t){
  const root='../../../../../../nodics.foundation/modules/';
  const concurrency=require(root+'nDatabase/database/src/service/schema/defaultModelConcurrencyService');
  const update=require(root+'nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
  const interceptor=require(root+'nDatabase/database/src/service/interceptors/defaultInterceptorService');
  const mongo=require(root+'nDatabase/mongodb/src/schemas/model').default;
  const {BSON,ObjectId}=require('mongodb'),copy=v=>BSON.deserialize(BSON.serialize(v));
  const old=global.CLASSES;t.after(()=>{global.CLASSES=old;});
  global.CLASSES={NodicsError:class extends Error{constructor(code,message){super(message||code);this.code=code;}}};
  const schema={backoffice:{concurrency:{managed:true,field:'revision'}},definition:{revision:{type:'int'},created:{type:'date'},updated:{type:'date'}}};
  const models=NODICS.getModels();for(const m of Object.values(models))m.rawSchema=schema;
  NODICS.getModels=()=>models;SERVICE.DefaultModelConcurrencyService=concurrency;
  const state={updates:0,writes:0,conflict:false};
  for(const row of f.rows.DefaultDigitalBundleOperationService){row._id=new ObjectId();row.updated=new Date('2026-01-01');}
  const match=(row,q)=>Object.entries(q).every(([k,v])=>same(row[k],v));
  const adapter={...mongo,rawSchema:schema,primaryKey:'code',schemaName:'digitalBundleOperation',transactionOptions:()=>({}),
    getItems:async r=>f.rows.DefaultDigitalBundleOperationService.filter(row=>match(row,r.query)).map(copy),
    findOneAndUpdate:async(query,patch,options)=>{
      assert.equal(options.upsert,false);assert.equal(options.returnDocument,'after');assert.equal(patch.$set._id,undefined);
      const row=state.conflict?undefined:f.rows.DefaultDigitalBundleOperationService.find(row=>match(row,query));
      if(!row)return{ok:1,value:null};state.writes++;Object.assign(row,copy(patch.$set));return{ok:1,value:copy(row)};
    }};
  SERVICE.DefaultDigitalBundleOperationService.update=async input=>{
    state.updates++;const r={...input,schemaModel:adapter};await interceptor.setUpdatedTimestamp(r,{});
    return{code:'SUC_UPDATE',result:await update.persistUpdates(r)};
  };
  SERVICE.DefaultDigitalBundleOperationService.get=async r=>{
    const result=f.rows.DefaultDigitalBundleOperationService.filter(row=>match(row,r.query)).map(copy);
    return{code:'SUC_READ',count:result.length,result};
  };
  return state;
}
async function interrupted(t){
  const f=fixture(t),command=f.command(await f.create()),open=SERVICE.DefaultBiddingAuctionService.open;
  SERVICE.DefaultBiddingAuctionService.open=async()=>{throw Error('interrupted before round');};
  await assert.rejects(listing.publish(f.request,command),/interrupted before round/);
  assert.equal(f.row().evidence.listing.phase,'PUBLISHED');assert.equal(f.row().evidence.listing.auction,undefined);
  SERVICE.DefaultBiddingAuctionService.open=open;
  return{...f,command,state:managed(f,t)};
}

test('interrupted-before-round replay inspects exact retained receipts and CAS-writes only the original auction handoff',async t=>{
  const f=await interrupted(t),revision=f.row().revision,receipts=structuredClone(f.row().evidence.listing),holds=[...f.holds];
  const events=f.effects.length,result=await listing.publish(f.request,f.command);
  assert.equal(result.auction.roundCode,'auction');assert.equal(f.row().revision,revision+1);
  assert.equal(f.state.updates,1);assert.equal(f.state.writes,1);
  assert.deepEqual(f.effects.slice(events),['price','inspect','open-round']);
  assert.deepEqual(f.row().evidence.listing.publication,receipts.publication);assert.deepEqual(f.row().evidence.listing.price,receipts.price);
  assert.deepEqual([...f.holds],holds);assert.equal(f.rows.DefaultDigitalProductBindingService.length,1);
  const next=f.row().revision,start=f.effects.length;
  await listing.publish(f.request,f.command);
  assert.equal(f.row().revision,next);assert.equal(f.state.updates,1);assert.equal(f.state.writes,1);
  assert.deepEqual(f.effects.slice(start),['price','inspect']);
});

for(const target of ['Product','Pricing'])test(`changed fresh ${target} receipt refuses before Bidding with original revision and holds`,async t=>{
  const f=await interrupted(t),before=JSON.stringify(f.row()),holds=[...f.holds];
  if(target==='Product'){
    const invoke=SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule=async c=>{const out=await invoke(c);return c.apiName.endsWith('/inspect')?{...out,receiptCode:'foreign'}:out;};
  }else{
    const inspect=SERVICE.DefaultPricingBundleListingService.inspect;
    SERVICE.DefaultPricingBundleListingService.inspect=async(...a)=>({...await inspect(...a),receiptCode:'foreign'});
  }
  await assert.rejects(listing.publish(f.request,f.command),/Original publication receipt changed/);
  assert.equal(JSON.stringify(f.row()),before);assert.equal(f.state.updates,0);assert.deepEqual([...f.holds],holds);
  assert.equal(f.effects.includes('open-round'),false);
});

test('failed fresh inspection cannot use retained success to open Bidding',async t=>{
  const f=await interrupted(t);f.failPublish(true);const revision=f.row().revision;
  await assert.rejects(listing.publish(f.request,f.command),/Activation unknown/);
  assert.equal(f.row().revision,revision);assert.equal(f.state.updates,0);assert.equal(f.effects.includes('open-round'),false);
});

test('actual auction checkpoint changes still fail on managed CAS conflict',async t=>{
  const f=await interrupted(t);f.state.conflict=true;const revision=f.row().revision;
  await assert.rejects(listing.publish(f.request,f.command));assert.equal(f.state.updates,1);assert.equal(f.state.writes,0);
  assert.equal(f.row().revision,revision);assert.equal(f.row().evidence.listing.auction,undefined);assert.equal(f.holds.size,1);
});

test('generic managed no-op still requires an actual successor; publication fix does not weaken bundle CAS',async t=>{
  const f=await interrupted(t),revision=f.row().revision;
  await assert.rejects(bundles.update({...f.request,enterpriseCode:'market'},f.row(),{evidence:structuredClone(f.row().evidence)}),/readback changed/);
  assert.equal(f.row().revision,revision);assert.equal(f.state.writes,0);
});

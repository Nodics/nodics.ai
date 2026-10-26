/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module bidding/test/biddingAuctionReadBoundary @description Composes auction reads with actual generated query initialization and Mongo adapter using isolated driver I/O. @layer test @owner bidding */
const test = require('node:test'), assert = require('node:assert/strict');
const auction = require('../src/service/defaultBiddingAuctionService');
const offers = require('../src/service/defaultBiddingOfferService');
const bidding = require('../src/service/defaultBiddingService');
const quote = require('../../baseCommerce/modules/pricing/src/service/defaultNegotiatedPriceService');
const ports = require('../src/service/defaultBiddingAuctionPortsService');
const init = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
const mongo = require('../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model').default;
const definitions = require('../src/utils/statusDefinitions');

function fixture(t) {
  const old = Object.fromEntries(['SERVICE','CONFIG','UTILS','CLASSES'].map(k => [k,global[k]]));
  t.after(() => Object.entries(old).forEach(([k,v]) => v === undefined ? delete global[k] : global[k] = v));
  class NodicsError extends Error { constructor(code) { super(definitions[code]?.message || String(code)); this.code = code; } }
  global.CLASSES = { NodicsError };
  global.UTILS = { isObject: x => x && typeof x === 'object', isBlank: x => !x || !Object.keys(x).length };
  global.CONFIG = { get: key => key === 'bidding' ? { stores: { store: { enterpriseCode:'merchant', locale:'en' } } } : undefined };
  global.SERVICE = { DefaultBiddingService:bidding, DefaultNegotiatedPriceService:quote, DefaultBiddingAuctionPortsService:ports };
  const state = { rows:[], calls:[], fail:false };
  const schema = { ...mongo, versioned:false, rawSchema:require('../src/schemas/schemas').bidding.biddingAuctionRound,
    transactionOptions: () => ({}),
    countDocuments: async q => state.rows.filter(row => Object.entries(q).every(([k,v]) => row[k] === v)).length,
    find: (query, options) => {
      state.calls.push({query:structuredClone(query),options:structuredClone(options)});
      if (state.fail) throw Error('private database diagnostic');
      const rows=state.rows.filter(row => Object.entries(query).every(([k,v]) => row[k] === v));
      return { toArray:async () => rows.slice(options.skip, options.skip + options.limit) };
    } };
  const initializer={...init,LOG:{debug(){}}};
  SERVICE.DefaultBiddingAuctionRoundService={get:async r => {
    const request={...r,schemaModel:schema};
    const step=method => new Promise((resolve,reject) => initializer[method](request,{}, {
      nextSuccess:resolve,error:(_r,_s,e)=>reject(e)
    }));
    await step('validateRequest'); await step('buildQuery'); await step('buildOptions');
    const result=await initializer.readItems(request);
    return {code:'SUC_FIND_00000',...result};
  }};
  return state;
}

test('round get accepts omitted sort/filter defaults through actual initializer and Mongo read',async t=>{
  const f=fixture(t), request={tenant:'tenant',enterpriseCode:'merchant'};
  assert.deepEqual(await auction.records(request,{code:'round'}),[]);
  f.rows.push({code:'round',enterpriseCode:'merchant',status:'OPEN'}, {code:'round',enterpriseCode:'foreign',status:'OPEN'});
  assert.equal((await auction.records(request,{code:'round'})).length,1);
  assert.deepEqual(f.calls[0].query,{code:'round',enterpriseCode:'merchant'});
  assert.equal(f.calls[0].options.limit,1); assert.equal(f.calls[0].options.skip,0);
  assert.equal(f.calls[0].options.sort,undefined);
});

test('round persistence failure exposes only registered safe boundary code',async t=>{
  const f=fixture(t);f.fail=true;
  await assert.rejects(auction.records({tenant:'tenant',enterpriseCode:'merchant'},{code:'round'}),e=>
    e.code==='ERR_BIDDING_ROUND_READ_UNAVAILABLE' && !e.message.includes('private'));
  assert.equal(definitions.ERR_BIDDING_ROUND_READ_UNAVAILABLE.code,'503');
});

test('Product discovery failure is distinguished from round storage without changing signed actor',async t=>{
  const f=fixture(t),request={tenant:'tenant',enterpriseCode:'merchant',authData:{entCode:'participant',loginId:'original'}};
  const original=structuredClone(request);
  SERVICE.DefaultProductDiscoveryService={detail:async r=>{
    assert.deepEqual(r,{tenant:'tenant',productCode:'product',storeCode:'store',locale:'en',query:{}});
    throw Error('private search diagnostic');
  }};
  await assert.rejects(offers.resolve(request,'product','store'),e=>e.code==='ERR_BIDDING_OFFER_READ_UNAVAILABLE' && !e.message.includes('private'));
  assert.deepEqual(request,original);assert.equal(f.calls.length,0);
  assert.equal(definitions.ERR_BIDDING_OFFER_READ_UNAVAILABLE.code,'503');
});

test('public catalogue handoff composes real Product discovery and retained enterprise guard without actor rewrite',async t=>{
  fixture(t);
  const discovery=require('../../baseCommerce/modules/product/src/service/defaultProductDiscoveryService');
  const enrichment=require('../../baseCommerce/modules/product/src/service/defaultProductSearchEnrichmentService');
  const version='a'.repeat(64), sellerRef={module:'customer',schema:'customer',code:'seller'};
  const row={code:'projection',tenant:'tenant',enterpriseCode:'merchant',storeCode:'store',locale:'en',
    productCode:'product',publicationVersion:version,sourceHash:'hash',status:'STALE',payload:{
      variantSkuMap:{variant:'SKU'},localizedAttributes:{commerceBidding:{enabled:true,sellerRef}}}};
  const config={bidding:{stores:{store:{enterpriseCode:'merchant',locale:'en',currency:'POINTS'}}},
    product:{discovery:{activationService:'ActiveReader'},publication:{searchEnrichment:{}}}};
  CONFIG.get=key=>config[key];
  const requests=[], prices=[];
  const reader={...discovery,publicationSelections:new WeakMap(),searchSelected:async(r,q)=>{
    requests.push(structuredClone(r));
    assert.equal(q.status,'STALE');assert.deepEqual(q.publicationVersion,[version]);
    return [structuredClone(row)];
  }};
  Object.assign(SERVICE,{
    DefaultProductDiscoveryService:reader,ActiveReader:{activeVersions:async()=>[version]},
    DefaultProductSearchEnrichmentService:enrichment,
    DefaultProductSearchProjectionService:{get:async r=>{
      assert.deepEqual(r.query,{tenant:'tenant',storeCode:'store',code:{$in:['projection']}});
      return {result:[structuredClone(row)]};
    }},
    DefaultStoreService:{get:async()=>({result:[{tenant:'tenant',code:'store',enterpriseRef:{code:'merchant'},status:'ACTIVE',defaultCurrency:'POINTS'}]})},
    DefaultCustomerPriceSummaryService:{summarize:async r=>{
      prices.push(r);return {product:{unitAmount:'1',currency:'POINTS'}};
    }},
    DefaultCustomerAvailabilitySummaryService:{summarize:async()=>({product:{available:true,status:'IN_STOCK'}})}
  });
  const request={tenant:'tenant',enterpriseCode:'merchant',participantEnterpriseCode:'participant',
    authData:{tenant:'tenant',entCode:'participant',enterpriseCode:'participant',loginId:'seller'},
    headers:{authorization:'original-token'},payload:{owner:'private'},query:{view:'PRIVATE'},
    productReferences:[{targetVersion:'forged'}],indexConfiguration:{code:'forged'},sellerRefs:[sellerRef]};
  const before=structuredClone(request);
  // The original mixed signed scope must still fail Product's unchanged guard.
  await assert.rejects(reader.detail({...request,productCode:'product',storeCode:'store',locale:'en',query:{}}),/Activated Product enterprise scope is invalid/);
  assert.equal(prices.length,0);requests.length=0;
  const offer=await offers.resolve(request,'product','store');
  assert.deepEqual(offer.sellerRef,sellerRef);assert.equal(offer.product.price.currency,'POINTS');
  assert.deepEqual(request,before);
  assert.deepEqual(Object.keys(requests[0]).sort(),['indexConfiguration','locale','productCode','query','storeCode','tenant']);
  assert.equal(requests[0].indexConfiguration,undefined);
  assert.equal(prices[0].enterpriseCode,'merchant');
  assert.deepEqual(prices[0].productReferences,[{productCode:'product',storeCode:'store',targetVersion:version}]);
  const count=requests.length;
  await assert.rejects(offers.resolve({...request,enterpriseCode:'foreign'},'product','store'));
  assert.equal(requests.length,count,'Store admission still fails before public discovery');
  row.tenant='foreign';
  await assert.rejects(offers.resolve(request,'product','store'),{code:'ERR_BIDDING_OFFER_READ_UNAVAILABLE'});
});

test('round creation and transitions obey generated nullable schema, real managed save/update and BSON adapter',async t=>{
  fixture(t);
  const {BSON,ObjectId}=require('mongodb'), clone=v=>BSON.deserialize(BSON.serialize(v));
  const concurrency=require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService');
  const saveInit=require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService');
  const updateInit=require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
  const timestamp=require('../../../../nodics.foundation/modules/nDatabase/database/src/service/interceptors/defaultInterceptorService');
  const handler=require('../../../../nodics.foundation/modules/nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService');
  const rawSchema=require('../src/schemas/schemas').bidding.biddingAuctionRound;
  assert.equal(concurrency.getField(rawSchema),'revision');
  let rows=[],writes=0,loseAck=false,race=false;
  const match=(row,q)=>Object.entries(q).every(([k,v])=>row[k]===v);
  function validate(model){
    for(const key of ['startsAt','endsAt','graceEndsAt','pending','selection']) {
      const types=handler.resolveBsonType(rawSchema.definition[key].type);
      const type=model[key]===null?'null':model[key] instanceof Date?'date':typeof model[key];
      assert.ok(types.includes(type),`${key} must satisfy generated BSON type`);
    }
  }
  const schema={...mongo,rawSchema,primaryKey:'code',versioned:false,transactionOptions:()=>({}),
    getItems:async r=>rows.filter(row=>match(row,r.query)).map(clone),
    insertOne:async model=>{
      validate(model); const persisted=clone({...model,_id:new ObjectId()});
      if(race){race=false;rows.push(persisted);throw Error('duplicate identity');}
      assert.ok(!rows.some(row=>row.code===model.code||row.listingKey===model.listingKey));
      writes++;rows.push(persisted);
      if(loseAck){loseAck=false;throw Error('lost insert acknowledgement');}
      return {acknowledged:true,insertedId:persisted._id};
    },
    findOneAndUpdate:async(q,update,options)=>{
      assert.equal(options.upsert,false);
      const row=rows.find(row=>match(row,q));if(!row)return {ok:1,value:null};
      const next=clone({...row,...update.$set});validate(next);writes++;Object.assign(row,next);return {ok:1,value:clone(row)};
    }};
  Object.assign(SERVICE,{DefaultModelConcurrencyService:concurrency,
    DefaultModelValidatorService:{validateMandate:async()=>true,validateDataType:async()=>true},
    DefaultBiddingAuctionNotificationService:{capture:(_r,p)=>p},
    DefaultBiddingAuctionRoundService:{
      get:async r=>({result:await schema.getItems(r)}),
      save:async r=>{r={...r,schemaModel:schema};concurrency.initializeSave(r);await timestamp.setUpdatedTimestamp(r,{});return saveInit.persistModel(r);},
      update:async r=>{r={...r,schemaModel:schema};await timestamp.setUpdatedTimestamp(r,{});return updateInit.persistUpdates(r);}
    }});
  const sellerRef={module:'profile',schema:'customer',code:'seller'},request={tenant:'tenant',enterpriseCode:'merchant',storeCode:'store',
    sellerRefs:[sellerRef],buyerRef:sellerRef,idempotencyKey:'original-round',payload:{confirmed:true,storeCode:'store',productCode:'product',variantCode:'variant'}};
  let endsAt='2099-01-01T00:00:00.000Z';
  CONFIG.get=key=>key==='bidding'?{offerService:'TestOffer'}:undefined;
  SERVICE.TestOffer={auction:async()=>({product:{variantCodes:['variant']},sellerRef,publicationCode:'publication',floor:'1',store:{currency:'POINTS'},startsAt:null,endsAt})};
  const owner={...auction,participant:async r=>r,policy:()=>({graceHours:1,holdTiming:'RESERVE_ON_BID',maximumBids:100,maximumCommands:200}),
    ports:()=>({publication:async()=>({confirmed:true,publicationCode:'publication'})})};
  for(const fault of ['none','lost-ack','duplicate']){
    rows=[];writes=0;loseAck=fault==='lost-ack';race=fault==='duplicate';
    const result=await owner.open(request),stored=rows[0];
    assert.equal(result.revision,1);assert.equal(stored.startsAt,null);assert.ok(stored.endsAt instanceof Date);
    assert.equal((await owner.load(request,result.code)).endsAt,endsAt);
    const count=writes;await owner.open(request);assert.equal(writes,count);assert.equal(rows.length,1);
    const previous=await owner.load(request,result.code);
    const next=await owner.save(request,previous,{status:'GRACE',pending:null});assert.equal(next.revision,2);
    await assert.rejects(owner.save(request,previous,{status:'CANCELLED'}));assert.equal(rows[0].status,'GRACE');
  }
  rows=[];endsAt=null;
  await owner.open(request);assert.equal(rows[0].endsAt,null);assert.equal(rows[0].graceEndsAt,null);
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module checkoutCore/test/checkoutPaymentDispatchJournal @description Durable original Payment dispatch ownership and crash fences using actual Checkout services and isolated atomic storage. @owner checkoutCore @layer test */
const test = require('node:test'), assert = require('node:assert/strict'), { isDeepStrictEqual: same } = require('node:util');
const ports = require('../src/service/defaultCheckoutPlacementPortsService');
const placement = require('../src/service/defaultOrderPlacementService');
const recovery = require('../src/service/defaultCheckoutCompensationRecoveryService');
const forward = require('../src/service/defaultCheckoutBundleRecoveryService');
const clone = structuredClone;
function fixture(t) {
  const previous = Object.fromEntries(['SERVICE','NODICS','UTILS','CLASSES'].map(k => [k, global[k]]));
  t.after(() => Object.assign(global, previous));
  const request = { tenant: 't', enterpriseCode: 'merchant', ownerId: 'buyer', participantEnterpriseCode: 'buyer',
    ownerRef: { module: 'profile', schema: 'enterprise', code: 'buyer' },
    actorRef: { principalType: 'human', code: 'employee', loginId: 'employee', enterpriseCode: 'buyer' },
    idempotencyKey: 'original', authData: { tenant: 't', enterpriseCode: 'buyer' },
    payload: { orderCode: 'order', cartCode: 'cart', paymentMethod: 'LOYALTY_REWARD' } };
  const unit = { code: 'purchase', idempotencyKey: 'original:digital:entry:0', digitalDeliveryType: 'DIGITAL_OWNERSHIP', providerOwner: 'digitalCore', manifestCode: 'manifest' };
  const checkpoint = { ...clone(request), completed: ['VALIDATED','CALCULATED','SPENDING_ADMITTED','RESERVED','DIGITAL_RESERVED'],
    results: { reservation: [], digitalReservation: [unit], paymentAttempted: true } };
  const method = { ...clone(request), orderCode: 'order', cartCode: 'cart', methodCode: 'LOYALTY_REWARD',
    enterpriseCode: 'buyer', idempotencyKey: 'original:payment', walletCode: 'wallet', programCode: 'program', rewardTypeCode: 'points', amount: '1.00', currency: 'POINTS' };
  const state = { rows: [], calls: [], dispatches: 0, failSave: false, loseSave: false, failRead: false, alterRead: false, loseCAS: false, conflict: false, missingIndex: false, saveCount: 0 };
  const owner = { ...ports, certificateOnly: async () => false, preparePaymentMethod: () => clone(method), paymentAdapter: () => ({}), paymentRepository: () => ({}), closeCart: async () => ({ confirmed: true }) };
  global.UTILS = { createModelName: v => v };
  global.NODICS = { getModels: () => ({ checkoutCheckpoint: { primaryKey: 'code', rawSchema: { definition: { revision: { type: 'int' } } }, compareAndSetItem() {}, updateItems() {} } }) };
  global.SERVICE = {
    DefaultCheckoutPlacementPortsService: owner, DefaultCheckoutCompensationRecoveryService: recovery,
    DefaultCheckoutBundleRecoveryService: forward,
    DefaultPaymentTransactionEntryService: { get: async () => ({ code: 'SUC_READ', count: 0, result: [] }) },
    DefaultModelConcurrencyService: { getField: () => undefined },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: state.missingIndex ? [] : [{ unique: true, key: { code: 1 } }] }) },
    DefaultCheckoutCheckpointService: {
      save: async r => {
        state.calls.push('insert'); assert.equal(r.options.insertOnly, true); state.saveCount++;
        if (state.failSave) throw Error('insert unavailable');
        if (state.rows.some(row => row.code === r.model.code)) throw Error('duplicate key');
        state.rows.push(clone(r.model)); if (state.loseSave) throw Error('lost insert acknowledgement');
        return { code: 'SUC_SAVE', result: { acknowledged: !state.negativeAck, ...(state.writeConcern ? { writeConcernError: { code: 64 } } : {}) } };
      },
      get: async r => {
        state.calls.push('read'); if (state.failRead) throw Error('read unavailable');
        const result = clone(state.rows.filter(row => Object.entries(r.query).every(([k,v]) => same(row[k],v))));
        if (state.alterRead && result[0]) result[0].evidence.originalAuthorization.amount = '9.00';
        return { code: 'SUC_READ', count: result.length, result };
      },
      update: async r => {
        state.calls.push('cas'); assert.equal(r.options.upsert, false);
        const row = state.conflict ? undefined : state.rows.find(row => Object.entries(r.query).every(([k,v]) => same(row[k],v)));
        if (row) Object.assign(row, clone(r.model));
        if (state.loseCAS) throw Error('lost CAS acknowledgement');
        return { code: 'SUC_UPDATE', result: { matchedCount: row ? 1 : 0 } };
      }
    },
    DefaultPaymentExecutionService: { execute: async () => {
      state.calls.push('dispatch'); state.dispatches++;
      assert.equal(state.rows.length, 1); assert.equal(state.rows[0].evidence.originalAuthorization.amount, '1.00');
      assert.equal(state.rows[0].evidence.originalPaymentDispatch.paymentKey, 'original:payment');
      if (state.providerFailure) throw Error('lost provider acknowledgement');
      return { status: 'AUTHORIZED' };
    } },
    DefaultDigitalBundleSettlementService: { fenceCompensation: async () => ({ confirmed: true, compensationAllowed: true, code: unit.code }) },
    DefaultDigitalCommerceCheckoutService: {},
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({}) }
  };
  const scope = { ...request, commandCode: request.idempotencyKey, payload: {} };
  const dispatch = () => owner.create().authorizePayment(request, { totalAmount: 'current-cart-is-not-used' }, [unit], checkpoint);
  return { request, checkpoint, method, state, owner, scope, unit, dispatch };
}

test('durable original tuple, identities, phases and reservations precede the sole external dispatch', async t => {
  const f = fixture(t); await f.dispatch();
  assert.deepEqual(f.state.calls, ['insert','read','dispatch']);
  const e = f.state.rows[0].evidence;
  assert.deepEqual(e.originalAuthorization, { walletCode:'wallet',programCode:'program',rewardTypeCode:'points',amount:'1.00' });
  assert.deepEqual(e.ownerRef, f.request.ownerRef); assert.deepEqual(e.actorRef, f.request.actorRef);
  assert.deepEqual(e.originalPaymentDispatch.completed, f.checkpoint.completed);
  assert.equal(e.originalPaymentDispatch.digitalReservations[0].code, f.unit.code);
  assert.equal(JSON.stringify(e).includes('authData'), false);
  await assert.rejects(placement.place(f.request, f.owner.create())); assert.equal(f.state.dispatches, 1);
});

for (const flag of ['failSave','loseSave','failRead','alterRead','missingIndex','negativeAck','writeConcern']) test(`${flag} refuses dispatch and compensation takeover`, async t => {
  const f=fixture(t);f.state[flag]=true;
  await assert.rejects(f.dispatch()); assert.equal(f.state.dispatches,0);
  const before=clone(f.state.rows);
  await assert.rejects(f.owner.create().compensate(f.checkpoint, Error('claim failure'), f.request));
  assert.deepEqual(f.state.rows,before); assert.equal(f.state.calls.includes('cas'),false);
});

test('process loss after verified insertion but before dispatch leaves a recoverable original checkpoint and blocks placement replay', async t => {
  const f=fixture(t); await f.owner.claimPaymentDispatch(f.request,f.checkpoint,f.method,[f.unit]);
  const persisted=clone(f.state.rows); // Drop the claimant's local state, as after restart.
  f.checkpoint.results={};
  await assert.rejects(placement.place(f.request,f.owner.create()));
  assert.deepEqual(f.state.rows,persisted); assert.equal(f.state.dispatches,0);
  const recovered=await recovery.checkpoint(f.scope);
  assert.equal(recovered.evidence.couponAcquisitionRecovery.paymentAttemptUnconfirmed,true);
  assert.equal(recovered.evidence.originalAuthorization.walletCode,'wallet');
});

test('process loss after external dispatch preserves exact intent without Payment acknowledgement and never reauthorizes on replay', async t => {
  const f=fixture(t);f.state.providerFailure=true; await assert.rejects(f.dispatch(),/lost provider/);
  f.checkpoint.results={};
  await assert.rejects(placement.place(f.request,f.owner.create())); assert.equal(f.state.dispatches,1);
  assert.equal(f.state.rows[0].revision,0);assert.equal(f.state.rows[0].evidence.originalAuthorization.amount,'1.00');
});

test('concurrent same-key claimants permit exactly one dispatch', async t => {
  const f=fixture(t), second=clone(f.checkpoint);
  const results=await Promise.allSettled([f.dispatch(),f.owner.create().authorizePayment(f.request,{},[f.unit],second)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1); assert.equal(f.state.dispatches,1);assert.equal(f.state.rows.length,1);
});

for(const field of ['tenant','ownerId','ownerRef','actorRef','participantEnterpriseCode','enterpriseCode','orderCode','cartCode','idempotencyKey']) test(`wrong prepared ${field} refuses before insert or dispatch`,async t=>{
  const f=fixture(t);f.method[field]=typeof f.method[field]==='object'?{...f.method[field],code:'foreign'}:'foreign';
  await assert.rejects(f.dispatch());assert.equal(f.state.saveCount,0);assert.equal(f.state.dispatches,0);
});

test('successful completion CAS advances the same command row and preserves original journal',async t=>{
  const f=fixture(t);await f.dispatch();const journal=clone(f.state.rows[0].evidence.originalPaymentDispatch);
  f.checkpoint.completed.push('AUTHORIZED','ORDERED','PAYMENT_CAPTURED','PROMOTION_COMMITTED','DIGITAL_SOLD','RELEASED','DIGITAL_DELIVERED');
  const result=await f.owner.create().complete(f.checkpoint,{order:{code:'order',cartCode:'cart'},digitalReservation:[f.unit]});
  assert.equal(result.code,'original');assert.equal(result.status,'COMPLETED');assert.equal(result.revision,1);
  assert.equal(f.state.rows.length,1);assert.equal(f.state.saveCount,1);assert.deepEqual(result.evidence.originalPaymentDispatch,journal);
  assert.equal((await placement.place(f.request,f.owner.create())).code,'original');assert.equal(f.state.dispatches,1);
  assert.equal((await recovery.commandStatus(f.scope)).status,'COMPLETED');
});

test('uncertain provider failure compensation CAS retains original journal on the same row',async t=>{
  const f=fixture(t);f.state.providerFailure=true;await assert.rejects(f.dispatch());
  const claim=f.state.rows[0].evidence.originalPaymentDispatch.claimId;
  const result=await f.owner.create().compensate(f.checkpoint, Object.assign(Error('unknown'),{code:'ERR_LOYALTY_RESERVATION_DECISION'}),f.request);
  assert.equal(result.code,'original');assert.equal(result.revision,1);assert.equal(result.status,'COMPENSATION_REQUIRED');
  assert.equal(result.evidence.originalPaymentDispatch.claimId,claim);assert.equal(result.evidence.couponAcquisitionRecovery.paymentAttemptUnconfirmed,true);
  assert.equal(f.state.saveCount,1);
});

for(const flag of ['conflict','loseCAS']) test(`${flag} cannot overwrite or reset terminal journal on compensation`,async t=>{
  const f=fixture(t);await f.dispatch();f.state[flag]=true;
  await assert.rejects(f.owner.create().complete(f.checkpoint,{order:{code:'order',cartCode:'cart'}}));
  const rows=clone(f.state.rows);
  await assert.rejects(f.owner.create().compensate(f.checkpoint, Error('terminal failure'),f.request));
  assert.deepEqual(f.state.rows,rows);assert.equal(f.state.saveCount,1);assert.equal(f.state.dispatches,1);
});

test('competing recovery fences the original worker before terminal effects',async t=>{
  const f=fixture(t);await f.dispatch();f.state.rows[0].revision++;
  f.owner.closeCart=async()=>assert.fail('must not close Cart after lost claim');
  await assert.rejects(f.owner.create().complete(f.checkpoint,{order:{code:'order',cartCode:'cart'}}));
  await assert.rejects(f.owner.create().compensate(f.checkpoint,Error('lost claim'),f.request));assert.equal(f.state.saveCount,1);
});

test('forward obligation is CAS-retained on the same journal without a second authority',async t=>{
  const f=fixture(t);await f.dispatch();f.checkpoint.completed.push('AUTHORIZED','ORDERED','PAYMENT_CAPTURED');
  const result=await forward.retain(f.request,f.checkpoint,[f.unit],'BUNDLE');
  assert.equal(result.code,'original');assert.equal(result.revision,1);assert.equal(result.evidence.bundleForwardRecovery.kind,'BUNDLE');
  assert.equal(result.evidence.couponAcquisitionRecovery,undefined);assert.equal(result.evidence.originalAuthorization.amount,'1.00');assert.equal(f.state.saveCount,1);
});


test('crash journal retains Inventory references as unresolved instead of claiming cleanup', async t => {
  const f = fixture(t); f.checkpoint.results.reservation = [{ code: 'original-stock-hold', privateField: 'not-retained' }];
  await f.dispatch();
  assert.deepEqual(f.state.rows[0].evidence.originalPaymentDispatch.inventoryReservations, [{ code: 'original-stock-hold' }]);
  assert.equal(f.state.rows[0].evidence.compensation.find(v => v.type === 'INVENTORY_RELEASE').status, 'FAILED');
});

test('terminal evidence cannot change the retained actor', async t => {
  const f = fixture(t); await f.dispatch(); const before = clone(f.state.rows);
  f.checkpoint.actorRef = { ...f.checkpoint.actorRef, code: 'foreign' };
  await assert.rejects(f.owner.create().complete(f.checkpoint, { order: { code: 'order', cartCode: 'cart' } }));
  assert.deepEqual(f.state.rows, before); assert.equal(f.state.saveCount, 1);
});

/** Composes real generated persistence initializers, timestamp interceptor and Mongo adapter with an isolated BSON driver. */
function realPersistence(f) {
  const root='../../../../../../nodics.foundation/modules/';
  const save=require(root+'nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService');
  const update=require(root+'nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
  const concurrency=require(root+'nDatabase/database/src/service/schema/defaultModelConcurrencyService');
  const interceptor=require(root+'nDatabase/database/src/service/interceptors/defaultInterceptorService');
  const mongo=require(root+'nDatabase/mongodb/src/schemas/model').default;
  const {BSON,ObjectId}=require('mongodb'), bson=v=>BSON.deserialize(BSON.serialize(v));
  global.CLASSES={NodicsError:class extends Error{constructor(code,message){super(message||code);this.code=code;}}};
  UTILS.isBlank=v=>!v||!Object.keys(v).length;
  SERVICE.DefaultModelConcurrencyService=concurrency;
  SERVICE.DefaultModelValidatorService={validateMandate:async model=>{assert.ok(model.correlationId);},validateDataType:async()=>{}};
  const schema={definition:{revision:{type:'int'},created:{type:'date'},updated:{type:'date'},occurredAt:{type:'date'}}};
  const adapter={...mongo,primaryKey:'code',rawSchema:schema,transactionOptions:()=>({}),
    dataBase:{getOptions:()=>({modelUpdateOptions:{upsert:false}})},
    insertOne:async model=>{
      f.state.calls.push('driver-insert');
      if(f.state.rows.some(r=>r.code===model.code))throw Object.assign(Error('duplicate'),{code:11000});
      const row=bson({...model,_id:new ObjectId()});f.state.rows.push(row);f.state.saveCount++;
      if(f.state.loseSave)throw Error('lost driver insert acknowledgement');
      return{acknowledged:true,insertedId:row._id};
    },
    updateMany:async(query,patch,options)=>{
      assert.equal(options.upsert,false);assert.equal(patch.$set._id,undefined);
      const row=f.state.conflict?undefined:f.state.rows.find(r=>Object.entries(query).every(([k,v])=>same(r[k],v)));
      if(row)Object.assign(row,bson(patch.$set));
      if(f.state.loseCAS)throw Error('lost driver update acknowledgement');
      return{acknowledged:true,matchedCount:row?1:0,modifiedCount:row?1:0};
    }};
  NODICS.getModels=()=>({checkoutCheckpoint:adapter});
  const generated=SERVICE.DefaultCheckoutCheckpointService, get=generated.get;
  generated.save=async r=>{
    const request={...r,schemaModel:adapter};await interceptor.setUpdatedTimestamp(request,{});
    return{code:'SUC_INSERT',result:await save.persistModel(request)};
  };
  generated.update=async r=>{
    const request={...r,schemaModel:adapter};await interceptor.setUpdatedTimestamp(request,{});
    return{code:'SUC_UPDATE',result:await update.persistUpdates(request)};
  };
  generated.get=async r=>{ const result=f.state.rows.filter(row=>Object.entries(r.query).every(([k,v])=>same(k.split('.').reduce((x,p)=>x?.[p],row),v))); return bson({code:'SUC_READ',count:result.length,result}); };
}

test('real generated insert-only and owner revision update survive BSON metadata without resetting the original row',async t=>{
  const f=fixture(t);realPersistence(f);await f.dispatch();
  const id=f.state.rows[0]._id.toHexString();const second=clone(f.checkpoint);delete second.results.paymentJournal;
  await assert.rejects(f.owner.create().authorizePayment(f.request,{},[f.unit],second));assert.equal(f.state.dispatches,1);
  const result=await f.owner.create().complete(f.checkpoint,{order:{code:'order',cartCode:'cart'}});
  assert.equal(result.status,'COMPLETED');assert.equal(result.revision,1);assert.equal(result._id.toHexString(),id);assert.equal(f.state.rows.length,1);
});

for(const flag of ['loseSave','loseCAS'])test(`real adapter ${flag} preserves the durable record without redispatch or resetting`,async t=>{
  const f=fixture(t);realPersistence(f);
  if(flag==='loseSave'){f.state.loseSave=true;await assert.rejects(f.dispatch());assert.equal(f.state.dispatches,0);}
  else{await f.dispatch();f.state.loseCAS=true;await assert.rejects(f.owner.create().complete(f.checkpoint,{order:{code:'order',cartCode:'cart'}}));}
  const before=JSON.stringify(f.state.rows);await assert.rejects(f.owner.create().compensate(f.checkpoint,Error('lost acknowledgement'),f.request));
  assert.equal(JSON.stringify(f.state.rows),before);assert.equal(f.state.rows.length,1);
});


async function completedJournalReadFixture(t) {
 const f=fixture(t);realPersistence(f);
 const merchantScope={contractVersion:1,storeCode:'store',enterpriseCode:'merchant',revision:1};
 f.request.merchantScope=merchantScope;f.checkpoint.merchantScope=clone(merchantScope);
 await f.dispatch();await f.owner.create().complete(f.checkpoint,{order:{code:'order',cartCode:'cart'}});
 SERVICE.DefaultCartMerchantScopeService=require('../../cart/src/service/defaultCartMerchantScopeService');
 SERVICE.DefaultStoreContextService={resolveStoreCode:(_r,code)=>code};
 const scope=require('../src/service/defaultCheckoutMerchantScopeService');
 const operation=require('../src/service/defaultCheckoutOperationService');
 const input={...f.request,enterpriseCode:'buyer',payload:undefined,
   authData:{tenant:'t',enterpriseCode:'buyer',tokenType:'access',principalType:'human',principalId:'employee',loginId:'employee'}};
 return {...f,scope,operation,input};
}
test('completed durable journal supports order and command reads through original merchant scope with real BSON persistence',async t=>{
 const f=await completedJournalReadFixture(t),before=require('mongodb').BSON.serialize({rows:f.state.rows}),effects=f.state.dispatches;
 const order=await f.scope.checkpoint({...f.input,orderCode:'order'});
 assert.equal((await f.operation.status(order)).status,'COMPLETED');
 const command=await f.scope.checkpoint({...f.input,commandCode:'original'});
 assert.equal((await f.operation.commandStatus(command)).status,'COMPLETED');
 assert.equal(f.state.dispatches,effects);assert.deepEqual(require('mongodb').BSON.serialize({rows:f.state.rows}),before);
});
for(const defect of ['paymentKey','orderCode','cartCode','version','identity','actor','merchant'])test('completed durable journal read refuses '+defect+' without writes',async t=>{
 const f=await completedJournalReadFixture(t),row=f.state.rows[0],j=row.evidence.originalPaymentDispatch;
 if(['paymentKey','orderCode','cartCode'].includes(defect))j[defect]='foreign';
 if(defect==='version')j.contractVersion=2;
 if(defect==='identity')row.code='foreign';
 if(defect==='actor')row.evidence.actorRef.loginId='foreign';
 if(defect==='merchant')row.evidence.merchantScope.enterpriseCode='foreign';
 const before=require('mongodb').BSON.serialize({rows:f.state.rows});
 await assert.rejects(f.scope.checkpoint({...f.input,commandCode:'original'}));
 assert.deepEqual(require('mongodb').BSON.serialize({rows:f.state.rows}),before);
});

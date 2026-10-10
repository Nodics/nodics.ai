/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module inventory/test/inventoryCheckoutReservationContract @description Exercises actual Checkout and Inventory reservation owners with rollback-capable persistence doubles; native database qualification is separate. @layer test @owner inventory */
const test=require('node:test'), assert=require('node:assert/strict');
const owner=require('../src/service/defaultInventoryReservationOperationService');
const operations=require('../src/service/defaultInventoryOperationService');
const policy=require('../src/service/defaultInventoryReservationPolicyService');
const ports=require('../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutPlacementPortsService');
const exact=require('../../pricing/src/service/defaultExactAmountService');

/** Installs a rollback-capable owner store, never a live database or authority claim. */
function fixture(){
    let rows={inventoryBalance:[{code:'balance',tenant:'t',enterpriseCode:'e',warehouseCode:'w',sku:'sku',onHand:'3',available:'3',reserved:'0',allocated:'0',revision:1}],inventoryReservation:[],inventoryMovement:[]};
    const state={failInsert:false,loseCas:false,unknownCommit:false,atomic:true};
    const request={tenant:'t',enterpriseCode:'e',ownerId:'buyer',idempotencyKey:'checkout',correlationId:'trace',payload:{orderCode:'order'},
        authData:{tenant:'t',enterpriseCode:'e',principalId:'buyer',principalType:'customer',tokenType:'access'}};
    global.CONFIG={get:key=>key==='runtimeRole'?'COMMERCE':key==='databaseTransactions'?{enabled:true,failClosed:true,maximumCommitTimeMs:5000}:{}};
    global.CLASSES={NodicsError:class extends Error{constructor(code){super(code);this.code=code;}}};
    global.UTILS={createModelName:x=>x};
    const schema={transaction:{enabled:true,sideEffects:'none'},cache:{enabled:false},event:{enabled:false}};
    global.NODICS={getModels:()=>Object.fromEntries(Object.keys(rows).map(name=>[name,{name,versioned:false,compareAndSetItem(){},rawSchema:schema}]))};
    const matches=(row,query)=>Object.entries(query).every(([k,v])=>row[k]===v);
    global.SERVICE={DefaultInventoryReservationOperationService:owner,DefaultInventoryOperationService:operations,
        DefaultInventoryReservationPolicyService:policy,DefaultExactAmountService:exact,
        DefaultSecuredRequestPipelineService:{getGrantedPermissions:()=>['commerce.checkout.place'],isPermissionGranted:()=>true},
        DefaultDatabaseModelHandlerService:{inspectIndexes:async model=>({versioned:false,indexes:[{key:{code:1},unique:true},
            ...(model.name==='inventoryBalance'?[{key:{tenant:1,enterpriseCode:1,warehouseCode:1,sku:1},unique:true}]:[])]})},
        DefaultDatabaseTransactionService:{capabilities:()=>({multiRecordAtomic:state.atomic}),assertSchemaEligible:()=>true,
            execute:async (_scope,work)=>{const before=structuredClone(rows);let result;
                try{result=await work({opaque:true});}catch(error){rows=before;throw error;}
                if(state.unknownCommit)throw new Error('Unknown commit acknowledgement');return result;}}
    };
    for(const [name,key] of [['DefaultInventoryBalanceService','inventoryBalance'],['DefaultInventoryReservationService','inventoryReservation'],['DefaultInventoryMovementService','inventoryMovement']]){
        SERVICE[name]={get:async r=>({code:'SUC_GET',result:structuredClone(rows[key].filter(row=>matches(row,r.query)))}),
            save:async r=>{assert(r.transactionContext);assert.equal(r.options.insertOnly,true);
                if(state.failInsert&&key==='inventoryReservation')throw new Error('Insert failed');
                assert(!rows[key].some(row=>row.code===r.model.code));rows[key].push(structuredClone(r.model));return{code:'SUC_SAVE',result:r.model};},
            update:async r=>{assert(r.transactionContext);const row=rows[key].find(row=>matches(row,r.query));
                if(!row||state.loseCas)return{code:'SUC_UPDATE',result:{acknowledged:true,matchedCount:0}};
                Object.assign(row,structuredClone(r.model.$set),{updated:new Date(Date.now()+1000)});return{code:'SUC_UPDATE',result:{acknowledged:true,matchedCount:1}};}};
    }
    const calculation={entries:[{code:'cart|product|sku',sku:'sku',quantity:'2',availability:{inventoryStrategy:'PHYSICAL_STOCK',candidates:[{warehouseCode:'w',revision:1}]}}]};
    return{request,state,calculation,rows:()=>rows,ports:ports.create()};
}

test('Checkout atomically reduces available stock and records a hold/movement; replay and release apply once',async()=>{
    const f=fixture(), first=await f.ports.reserveInventory(f.request,f.calculation);
    assert.equal(f.rows().inventoryBalance[0].available,'1');assert.equal(f.rows().inventoryBalance[0].reserved,'2');
    assert.equal(f.rows().inventoryMovement.length,1);
    assert.deepEqual(await f.ports.reserveInventory({...f.request,correlationId:'retry-trace'},f.calculation),first);
    assert.equal(f.rows().inventoryBalance[0].available,'1');
    SERVICE.DefaultCheckoutCheckpointService={save:async r=>({result:r.model})};
    const checkpoint={...f.request,results:{reservation:first},completed:['RESERVED']};
    const compensated=await f.ports.compensate(checkpoint,new Error('Payment declined'),f.request);
    assert.equal(compensated.status,'COMPENSATED');
    await owner.release(f.request,first[0].code);
    assert.equal(f.rows().inventoryBalance[0].available,'3');assert.equal(f.rows().inventoryBalance[0].reserved,'0');
    assert.equal(f.rows().inventoryMovement.length,2);assert.equal(f.rows().inventoryReservation[0].status,'RELEASED');
});

test('failed insert, lost revision or insufficient stock rolls back every stock effect',async()=>{
    for(const kind of ['failInsert','loseCas','insufficient']){
        const f=fixture();if(kind==='insufficient')f.calculation.entries[0].quantity='4';else f.state[kind]=true;
        await assert.rejects(f.ports.reserveInventory(f.request,f.calculation));
        assert.equal(f.rows().inventoryBalance[0].available,'3');assert.equal(f.rows().inventoryReservation.length,0);assert.equal(f.rows().inventoryMovement.length,0);
    }
});

test('unqualified atomic persistence and foreign buyer scope cannot acquire or release stock',async()=>{
    const f=fixture();f.state.atomic=false;await assert.rejects(f.ports.reserveInventory(f.request,f.calculation));
    f.state.atomic=true;await assert.rejects(f.ports.reserveInventory({...f.request,ownerId:'foreign'},f.calculation));
    const [row]=await f.ports.reserveInventory(f.request,f.calculation);
    await assert.rejects(owner.release({...f.request,ownerId:'foreign',authData:{...f.request.authData,principalId:'foreign'}},row.code));
    assert.equal(f.rows().inventoryBalance[0].available,'1');
});

test('unknown commit acknowledgements require original complete evidence rather than another decrement',async()=>{
    const f=fixture();f.state.unknownCommit=true;
    assert.equal((await f.ports.reserveInventory(f.request,f.calculation)).length,1);
    assert.equal(f.rows().inventoryBalance[0].available,'1');assert.equal(f.rows().inventoryMovement.length,1);
});

test('multi-entry failure leaves no partial physical acquisition and digital units never use warehouse holds',async()=>{
    const f=fixture();f.calculation.entries.push({...f.calculation.entries[0],code:'other',sku:'missing'});
    await assert.rejects(f.ports.reserveInventory(f.request,f.calculation));
    assert.equal(f.rows().inventoryBalance[0].available,'3');assert.equal(f.rows().inventoryReservation.length,0);
    assert.deepEqual(await f.ports.reserveInventory(f.request,{entries:[{availability:{inventoryStrategy:'COUPON_CODE_POOL'}}]}),[]);
});

test('malformed scope, foreign command, changed replay and failed owner reads never decrement stock',async()=>{
    for(const kind of ['tenant','enterprise','permission','replay','failedRead']){
        const f=fixture();
        if(kind==='tenant'){delete f.request.tenant;delete f.request.authData.tenant;}
        if(kind==='enterprise')f.request.enterpriseCode='foreign';
        if(kind==='permission')SERVICE.DefaultSecuredRequestPipelineService.isPermissionGranted=()=>false;
        if(kind==='failedRead')SERVICE.DefaultInventoryBalanceService.get=async()=>({code:'ERR_READ',result:f.rows().inventoryBalance});
        if(kind==='replay'){await f.ports.reserveInventory(f.request,f.calculation);f.calculation.entries[0].quantity='1';}
        await assert.rejects(f.ports.reserveInventory(f.request,f.calculation));
        assert.equal(f.rows().inventoryBalance[0].available,kind==='replay'?'1':'3');
    }
});

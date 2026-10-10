/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module fulfillmentCore/test/physicalOrderReversalContract @description Connects actual Order, Fulfillment and Inventory owners through rollback-capable isolated generated stores; does not claim native database, warehouse or financial-provider qualification. @layer test @owner fulfillmentCore */
const test = require('node:test'), assert = require('node:assert/strict');
const physical = require('../src/service/defaultPhysicalOrderReversalService');
const inventory = require('../../../../baseCommerce/modules/inventory/src/service/defaultInventoryPhysicalReversalService');
const reservation = require('../../../../baseCommerce/modules/inventory/src/service/defaultInventoryReservationOperationService');
const inventoryOperations = require('../../../../baseCommerce/modules/inventory/src/service/defaultInventoryOperationService');
const exact = require('../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService');
const recovery = require('../../../../checkout/modules/order/src/service/defaultOrderRefundRecoveryService');
const dispute = require('../../../../checkout/modules/order/src/service/defaultOrderDisputeService');
const lifecycle = require('../../../../checkout/modules/order/src/service/defaultOrderLifecycleService');
const legacyReturns = require('../src/service/defaultFulfillmentReturnExecutionService');

/** Installs separately scoped transactional doubles and real owner orchestration. */
async function fixture(resolution = 'CANCELLATION') {
    const state = { permission:true, scope:true, atomic:true, loseAck:undefined, failSave:undefined, lostCas:false, payments:0, paymentFails:false, versioned:false, unique:true };
    const data = {
        inventory:{inventoryBalance:[{code:'balance',tenant:'t',enterpriseCode:'e',warehouseCode:'w',sku:'sku',onHand:'3',available:'3',reserved:'0',allocated:'0',revision:0}],inventoryReservation:[],inventoryMovement:[]},
        fulfillmentCore:{consignment:[{code:'order:1',tenant:'t',enterpriseCode:'e',orderCode:'order',ownerId:'buyer',status:'READY',revision:0,correlationId:'trace',totalAmount:'10',currency:'USD'}],shipment:[],fulfillmentReturn:[],returnReceipt:[],returnInspection:[]},
        order:{commerceOrderEntry:[{code:'order:entry',tenant:'t',enterpriseCode:'e',ownerId:'buyer',orderCode:'order',sku:'sku',quantity:'2'}],
            commerceOrder:[{code:'order',tenant:'t',enterpriseCode:'e',ownerId:'buyer',cartCode:'cart',status:'PLACED',revision:0,totalAmount:'10',currency:'USD',evidence:{reservationCodes:['order:entry'],digitalReservationCodes:[],storeCode:'apparel-store'}}],
            orderLifecycleRequest:[{code:'case',tenant:'t',enterpriseCode:'e',ownerId:'buyer',orderCode:'order',requestType:'DISPUTE',status:'SUBMITTED',revision:0,evidence:{requestedResolution:resolution}}]},
        cart:{cart:[{code:'cart',tenant:'t',enterpriseCode:'e',ownerId:'buyer',storeCode:'apparel-store'}]}
    };
    const profile = { enabled:true,orderCodePrefixes:[],storeCodes:{'apparel-store':true},ownerByStore:{'apparel-store':'fulfillmentCore'} };
    const policies = {order:{disputes:{...profile},refunds:{...profile}},fulfillmentCore:{physicalOperations:{enabled:true,evidenceMode:'MANUAL_ATTESTATION',maximumLines:100,maximumReceipts:100}}};
    const request = {tenant:'t',code:'case',authorization:'Bearer isolated-test',authData:{tenant:'t',enterpriseCode:'e',principalType:'human',loginId:'reviewer',tokenType:'access'},
        idempotencyKey:'refund-command',payload:{confirmed:true,reason:'Reviewed original physical purchase',expectedRevision:0}};
    const clone = value=>structuredClone(value), matches = (row,query)=>Object.entries(query || {}).every(([key,value])=>row[key]===value);
    global.CONFIG = {get:key=>key==='runtimeRole'?'COMMERCE':key==='databaseTransactions'?{enabled:true,failClosed:true,maximumCommitTimeMs:1000}:policies[key] || {}};
    global.CLASSES = {NodicsError:class extends Error {constructor(code,message){super(message || code);this.code=code;}}};
    global.UTILS = {createModelName:value=>value};
    global.ENUMS = {PhysicalFulfillmentStatus:Object.fromEntries(require('../src/utils/enums').PhysicalFulfillmentStatus.definition.map(key=>[key,{key}]))};
    const rawSchema = {transaction:{enabled:true,sideEffects:'none'},cache:{enabled:false},event:{enabled:false}};
    global.NODICS = {getModels:group=>Object.fromEntries(Object.keys(data[group]).map(name=>[name,{name,versioned:state.versioned,compareAndSetItem(){},rawSchema}]))};
    const queues = {};
    global.SERVICE = {
        DefaultPhysicalOrderReversalService:physical,DefaultInventoryPhysicalReversalService:inventory,
        DefaultInventoryReservationOperationService:reservation,DefaultInventoryOperationService:inventoryOperations,
        DefaultExactAmountService:exact,DefaultOrderRefundRecoveryService:recovery,DefaultOrderDisputeService:dispute,
        DefaultOrderLifecycleService:lifecycle,DefaultFulfillmentReturnExecutionService:legacyReturns,
        DefaultOrderLifecycleOperationService:{serviceAuthData:r=>({...r.authData,principalType:'service'})},
        DefaultOrderOperationService:require('../../../../checkout/modules/order/src/service/defaultOrderOperationService'),
        DefaultSecuredRequestPipelineService:{getGrantedPermissions:()=>state.permission?['commerce.checkout.place','commerce.dispute.review','commerce.fulfillment.return','commerce.refund.execute']:[],
            isPermissionGranted:(permission,granted)=>granted.includes(permission)},
        DefaultModuleService:{invokeModule:async()=>({data:{principalCode:'reviewer',scopes:state.scope?[{scopeType:'ENTERPRISE',scopeCode:'e',tenantCode:'t',capabilityCode:'commerce'}]:[],deniedScopes:[]}})},
        DefaultDatabaseModelHandlerService:{inspectIndexes:async model=>({versioned:state.versioned,indexes:[{key:{code:1},unique:state.unique},
            ...(model.name==='inventoryBalance'?[{key:{tenant:1,enterpriseCode:1,warehouseCode:1,sku:1},unique:state.unique}]:[])]})},
        DefaultDatabaseTransactionService:{capabilities:()=>({multiRecordAtomic:state.atomic}),assertSchemaEligible:model=>assert.equal(model.rawSchema.transaction.enabled,true),
            execute:async({moduleName},work)=>{
                const prior = queues[moduleName] || Promise.resolve();let release;
                queues[moduleName]=new Promise(resolve=>{release=resolve;});await prior;
                const before=clone(data[moduleName]);let result;
                try { result=await work({moduleName}); } catch(error) {data[moduleName]=before;throw error;} finally {release();}
                if(state.loseAck===moduleName){state.loseAck=undefined;throw Error('Lost commit acknowledgement');} return result;
            }},
        DefaultDigitalCommerceRefundService:{preview:async()=>({eligible:false,reason:'NO_DIGITAL_ENTITLEMENT'})},
        DefaultPaymentRefundExecutionService:{orderCapture:async()=>({captureCode:'capture',amount:'10',currency:'USD'}),
            preflightOrder:async()=>({eligible:true,captureCode:'capture',amount:'10',currency:'USD'}),
            refundOrder:async input=>{
                await recovery.paymentAuthority(input,true);
                if(state.paymentFails)throw Error('Financial provider remains pending');
                state.payments++;return{status:'REFUND_SUCCEEDED',transaction:{code:'refund-transaction'}};
            }}
    };
    for(const [group,models] of Object.entries(data)) for(const name of Object.keys(models)) {
        const serviceName = 'Default'+name[0].toUpperCase()+name.slice(1)+'Service';
        SERVICE[serviceName]={
            get:async r=>{
                if(r.transactionContext)assert.equal(r.transactionContext.moduleName,group,'transaction tokens never cross owner databases');
                return{code:'SUC_GET',result:clone(data[group][name].filter(row=>matches(row,r.query)))};
            },
            save:async r=>{
                if(['inventory','fulfillmentCore'].includes(group)){assert.equal(r.transactionContext?.moduleName,group);assert.equal(r.options.insertOnly,true);}
                if(state.failSave===name)throw Error('Injected insert failure');
                if(data[group][name].some(row=>row.code===r.model.code))throw Error('Duplicate identity');
                data[group][name].push(clone(r.model));return{code:'SUC_SAVE',result:r.model};
            },
            update:async r=>{
                if(['inventory','fulfillmentCore'].includes(group))assert.equal(r.transactionContext?.moduleName,group);
                const row=data[group][name].find(row=>matches(row,r.query));
                if(!row||state.lostCas)return{code:'SUC_UPDATE',result:{acknowledged:true,matchedCount:0}};
                Object.assign(row,clone(r.model.$set || r.model));return{code:'SUC_UPDATE',result:{acknowledged:true,matchedCount:1}};
            }
        };
    }
    await reservation.reserveAll({tenant:'t',enterpriseCode:'e',ownerId:'buyer',authData:{tenant:'t',enterpriseCode:'e',principalId:'buyer',principalType:'customer',tokenType:'access'},payload:{orderCode:'order'}},
        [{code:'order:entry',tenant:'t',enterpriseCode:'e',warehouseCode:'w',sku:'sku',ownerType:'ORDER',ownerCode:'order',quantity:'2',expectedBalanceRevision:0,idempotencyKey:'reserve-original',correlationId:'trace'}]);
    return{request,state,data,policies,balance:()=>data.inventory.inventoryBalance[0],
        approve:async()=>{const plan=await recovery.preview(request);assert.equal(plan.eligible,true,plan.reason);return{...request,payload:{...request.payload,previewToken:plan.previewToken}};},
        dispatch:()=>physical.dispatch({...request,code:'order',idempotencyKey:'dispatch-command',payload:{confirmed:true,reason:'Actual warehouse handover reviewed',handoverReference:'handover-1'}}),
        receipt:(key,quantity,reference=key)=>physical.recordReceipt({...request,idempotencyKey:key,payload:{confirmed:true,reason:'Returned package physically received',receiptReference:reference,lines:[{reservationCode:'order:entry',quantity}]}}),
        inspect:(receiptCode,disposition='RESTOCK')=>physical.recordInspection({...request,idempotencyKey:'inspect-command',payload:{confirmed:true,reason:'Original returned package inspected',receiptCode,disposition}})};
}

test('full pre-dispatch cancellation uses retained holds, real approval and one atomic release; replay never replenishes twice',async()=>{
    const f=await fixture(), input=await f.approve();
    assert.equal((await recovery.execute(input)).status,'COMPLETED');
    assert.equal(f.balance().available,'3');assert.equal(f.balance().reserved,'0');assert.equal(f.balance().onHand,'3');
    assert.equal(f.data.inventory.inventoryReservation[0].status,'RELEASED');assert.equal(f.data.fulfillmentCore.consignment[0].status,'CANCELLED');
    assert.equal(f.state.payments,1);assert.equal((await recovery.execute(input)).status,'COMPLETED');assert.equal(f.state.payments,1);
    assert.equal(f.data.inventory.inventoryMovement.length,2);assert.equal(f.data.fulfillmentCore.shipment.length,0);
    await reservation.reserveAll({tenant:'t',enterpriseCode:'e',ownerId:'other-buyer',authData:{tenant:'t',enterpriseCode:'e',principalId:'other-buyer',principalType:'customer',tokenType:'access'},payload:{orderCode:'other-order'}},
        [{code:'other-order:entry',tenant:'t',enterpriseCode:'e',warehouseCode:'w',sku:'sku',ownerType:'ORDER',ownerCode:'other-order',quantity:'1',expectedBalanceRevision:f.balance().revision,idempotencyKey:'later-reservation',correlationId:'trace'}]);
    await physical.settle(input);await recovery.execute(input);
    assert.equal(f.balance().available,'2');assert.equal(f.balance().reserved,'1');assert.equal(f.state.payments,1);
});

test('owner dispatch consumes the original hold; returns require all actual packages inspected before Inventory or Payment',async()=>{
    const f=await fixture('RETURN');assert.equal((await f.dispatch()).status,'SHIPPED');
    assert.equal((await f.dispatch()).status,'SHIPPED');assert.equal(f.data.fulfillmentCore.shipment.length,1);
    assert.equal(f.balance().onHand,'1');assert.equal(f.balance().available,'1');assert.equal(f.balance().reserved,'0');
    const input=await f.approve();assert.equal((await recovery.execute(input)).status,'RECONCILIATION_REQUIRED');assert.equal(f.state.payments,0);
    const first=await f.receipt('receipt-first','1');await f.inspect(first.receiptCode);
    assert.equal((await recovery.execute(input)).status,'RECONCILIATION_REQUIRED');assert.equal(f.balance().onHand,'1');
    const second=await f.receipt('receipt-second','1');
    assert.equal((await recovery.execute(input)).status,'RECONCILIATION_REQUIRED');assert.equal(f.state.payments,0);
    await f.inspect(second.receiptCode);assert.equal((await recovery.execute(input)).status,'COMPLETED');
    assert.equal(f.balance().onHand,'3');assert.equal(f.balance().available,'3');assert.equal(f.state.payments,1);
    assert.equal(f.data.fulfillmentCore.consignment[0].status,'RETURNED');
    assert.equal((await recovery.execute(input)).status,'COMPLETED');assert.equal(f.data.inventory.inventoryMovement.length,4);
    assert.equal((await f.receipt('receipt-first','1')).receiptCode,first.receiptCode);
});

test('SCRAP retains a genuine RETURN disposition without manufacturing saleable stock; rejected inspection blocks money',async()=>{
    for(const disposition of ['SCRAP','REJECT_RETURN']){
        const f=await fixture('RETURN');await f.dispatch();const input=await f.approve();await recovery.execute(input);
        const receipt=await f.receipt('receipt-package','2');await f.inspect(receipt.receiptCode,disposition);
        assert.equal((await recovery.execute(input)).status,disposition==='SCRAP'?'COMPLETED':'RECONCILIATION_REQUIRED');
        assert.equal(f.balance().available,'1');assert.equal(f.balance().onHand,'1');
        assert.equal(f.state.payments,disposition==='SCRAP'?1:0);
        if(disposition==='SCRAP')assert.equal(f.data.inventory.inventoryMovement.at(-1).evidence.disposition,'SCRAP');
    }
});

test('foreign staff, absent policy, denied current Profile scope, missing approval and forged receipt details produce no effects',async()=>{
    const f=await fixture(), before=structuredClone(f.data);
    await assert.rejects(physical.settle(f.request));
    f.state.scope=false;await assert.rejects(f.dispatch());f.state.scope=true;
    f.state.permission=false;await assert.rejects(f.dispatch());f.state.permission=true;
    f.policies.fulfillmentCore.physicalOperations.enabled=false;await assert.rejects(f.dispatch());f.policies.fulfillmentCore.physicalOperations.enabled=true;
    await assert.rejects(physical.dispatch({...f.request,code:'order',tenant:'foreign'}));
    assert.deepEqual(f.data,before);assert.equal(f.state.payments,0);
});

test('Store policies read original retained Cart Store, reject cross-Store drift and preserve legacy external domain fallback',async()=>{
    const f=await fixture();f.request.payload.storeCode='electronics-store';
    assert.equal((await recovery.preview(f.request)).eligible,true);
    f.data.cart.cart[0].storeCode='electronics-store';await assert.rejects(recovery.preview(f.request),/Store/);
    f.data.cart.cart[0].storeCode='apparel-store';f.policies.order.refunds.storeCodes={'electronics-store':true};
    await assert.rejects(recovery.preview(f.request),/policy/);
    f.policies.order.refunds={enabled:true,orderCodePrefixes:['order'],storeCodes:{},ownerPorts:{eWaste:{moduleName:'waste',apiPrefix:'/reverse'}},defaultOwnerPort:'eWaste'};
    SERVICE.DefaultModuleService.invokeModule=async r=>r.moduleName==='profile'?{data:{principalCode:'reviewer',scopes:[{scopeType:'ENTERPRISE',scopeCode:'e'}],deniedScopes:[]}}:{result:{eligible:true,kind:'EXTERNAL'}};
    f.data.order.orderLifecycleRequest[0].evidence.requestedResolution='REFUND';
    assert.equal((await recovery.plan(await recovery.load(f.request))).provider,'eWaste');
});

test('dispatch and cancellation locks are mutually exclusive and stale preview cannot reverse a shipment',async()=>{
    const f=await fixture(), input=await f.approve();await f.dispatch();
    await assert.rejects(recovery.execute(input),/eligibility|preview|before dispatch/);assert.equal(f.state.payments,0);
    const g=await fixture(), cancel=await g.approve();g.state.paymentFails=true;
    await recovery.execute(cancel);await assert.rejects(g.dispatch(),/locked/);
    assert.equal(g.data.fulfillmentCore.shipment.length,0);assert.equal(g.balance().available,'3');
});

test('duplicate/foreign/over-quantity receipts and changed inspection replay never enlarge remaining shipped authority',async()=>{
    const f=await fixture('RETURN');await f.dispatch();const input=await f.approve();await recovery.execute(input);
    const first=await f.receipt('receipt-first','1','package-1');
    await assert.rejects(f.receipt('receipt-first','2','package-1'),/different/);
    await assert.rejects(f.receipt('receipt-second','1','package-1'),/already/);
    await assert.rejects(f.receipt('receipt-second','2','package-2'),/remaining/);
    await f.inspect(first.receiptCode);await assert.rejects(f.inspect(first.receiptCode,'SCRAP'),/different/);
    assert.equal(f.data.fulfillmentCore.returnReceipt.length,1);assert.equal(f.balance().available,'1');assert.equal(f.state.payments,0);
});

test('concurrent receipt commands cannot exceed remaining shipment quantity',async()=>{
    const f=await fixture('RETURN');await f.dispatch();const input=await f.approve();await recovery.execute(input);
    const result=await Promise.allSettled([f.receipt('receipt-race-one','2'),f.receipt('receipt-race-two','2')]);
    assert.equal(result.filter(row=>row.status==='fulfilled').length,1);assert.equal(f.data.fulfillmentCore.returnReceipt.length,1);
    assert.equal(f.state.payments,0);
});

test('rollback and unqualified installed model/index state cannot change stock or manufacture a shipment',async()=>{
    for(const kind of ['atomic','versioned','unique','failSave','lostCas']){
        const f=await fixture();if(kind==='atomic'||kind==='unique')f.state[kind]=false;else if(kind==='failSave')f.state.failSave='inventoryMovement';else f.state[kind]=true;
        await assert.rejects(f.dispatch());assert.equal(f.balance().onHand,'3');assert.equal(f.balance().reserved,'2');assert.equal(f.data.fulfillmentCore.shipment.length,0);
    }
});

test('lost commit acknowledgements recover original lock, shipment and stock movements without a duplicate delta',async()=>{
    for(const group of ['fulfillmentCore','inventory']){
        const f=await fixture('RETURN');f.state.loseAck=group;
        assert.equal((await f.dispatch()).status,'SHIPPED');assert.equal(f.balance().onHand,'1');
        const input=await f.approve();await recovery.execute(input);
        f.state.loseAck='fulfillmentCore';const receipt=await f.receipt('receipt-lost-ack','2');await f.inspect(receipt.receiptCode);
        f.state.loseAck='inventory';assert.equal((await recovery.execute(input)).status,'COMPLETED');
        assert.equal(f.balance().onHand,'3');assert.equal(f.data.inventory.inventoryMovement.length,3);assert.equal(f.state.payments,1);
    }
});

test('revoked employee scope after approval cannot settle or complete owner effects',async()=>{
    const f=await fixture('RETURN');await f.dispatch();const input=await f.approve();await recovery.execute(input);
    const receipt=await f.receipt('receipt-scope','2');await f.inspect(receipt.receiptCode);
    f.state.scope=false;await assert.rejects(physical.settle(input));await assert.rejects(physical.complete(input));
    assert.equal(f.state.payments,0);assert.equal(f.balance().onHand,'1');
});

test('missing or mismatched original hold, acquisition movement, consignment and foreign entry cannot become a physical plan',async()=>{
    for(const kind of ['hold','reserve','consignment','foreign-entry','balance','digital','duplicate']){
        const f=await fixture();
        if(kind==='hold')f.data.inventory.inventoryReservation.length=0;
        if(kind==='reserve')f.data.inventory.inventoryMovement[0].quantity='999';
        if(kind==='consignment')f.data.fulfillmentCore.consignment[0].currency='OTHER';
        if(kind==='foreign-entry')f.data.order.commerceOrderEntry[0].enterpriseCode='foreign';
        if(kind==='balance')f.balance().available='999';
        if(kind==='digital')f.data.order.commerceOrder[0].evidence.digitalReservationCodes=['digital-hold'];
        if(kind==='duplicate')f.data.fulfillmentCore.consignment.push({...f.data.fulfillmentCore.consignment[0],code:'duplicate'});
        assert.equal((await recovery.preview(f.request)).eligible,false);assert.equal(f.state.payments,0);
    }
});

test('approved physical owner changes and forged body approval cannot authorize later stock or completion',async()=>{
    const f=await fixture(), input=await f.approve();f.state.paymentFails=true;
    await recovery.execute(input);
    const before=structuredClone(f.data.inventory);
    await assert.rejects(physical.complete({...input,payload:{...input.payload,steps:{PAYMENT:{status:'REFUND_SUCCEEDED',transactionCode:'forged'}}}}),/Payment/);
    f.policies.order.refunds.ownerByStore['apparel-store']='unknown-owner';
    await assert.rejects(physical.settle(input),/selection/);assert.deepEqual(f.data.inventory,before);
    f.policies.order.refunds.ownerByStore['apparel-store']='fulfillmentCore';
    const row=f.data.order.orderLifecycleRequest.find(item=>item.requestType==='REFUND');row.evidence.approval.reason='';
    await assert.rejects(physical.settle(input),/approval/);assert.equal(f.state.payments,0);
});

test('multiple physical entries rollback together and supported later-layer movement customization preserves proof',async()=>{
    const f=await fixture();
    f.data.inventory.inventoryBalance.push({code:'balance2',tenant:'t',enterpriseCode:'e',warehouseCode:'w',sku:'sku2',onHand:'5',available:'5',reserved:'0',allocated:'0',revision:0});
    f.data.order.commerceOrderEntry.push({code:'order:entry2',tenant:'t',enterpriseCode:'e',ownerId:'buyer',orderCode:'order',sku:'sku2',quantity:'3'});
    f.data.order.commerceOrder[0].evidence.reservationCodes.push('order:entry2');
    await reservation.reserveAll({tenant:'t',enterpriseCode:'e',ownerId:'buyer',authData:{tenant:'t',enterpriseCode:'e',principalId:'buyer',principalType:'customer',tokenType:'access'},payload:{orderCode:'order'}},
        [{code:'order:entry2',tenant:'t',enterpriseCode:'e',warehouseCode:'w',sku:'sku2',ownerType:'ORDER',ownerCode:'order',quantity:'3',expectedBalanceRevision:0,idempotencyKey:'reserve-second',correlationId:'trace'}]);
    const input=await f.approve();
    SERVICE.DefaultPaymentRefundExecutionService.preflightOrder=async()=>({eligible:false});await recovery.execute(input);
    await physical.prepare(input);const before=structuredClone(f.data.inventory), save=SERVICE.DefaultInventoryMovementService.save;
    SERVICE.DefaultInventoryMovementService.save=async r=>{if(r.model.sku==='sku2')throw Error('Second line insert failed');return save(r);};
    await assert.rejects(physical.settle(input));assert.deepEqual(f.data.inventory,before);
    SERVICE.DefaultInventoryMovementService.save=save;let calls=0;
    SERVICE.DefaultInventoryPhysicalReversalService={...inventory,movement:async function(...args){calls++;return inventory.movement.apply(this,args);}};
    assert.equal((await physical.settle(input)).status,'SETTLED');assert.equal(calls,2);
    assert.deepEqual(f.data.inventory.inventoryBalance.map(row=>[row.available,row.reserved]),[['3','0'],['5','0']]);
    assert.equal((await physical.settle(input)).status,'SETTLED');assert.equal(calls,2);
});

test('concurrent operator cancellation settlement releases each original hold once',async()=>{
    const f=await fixture(), input=await f.approve();
    SERVICE.DefaultPaymentRefundExecutionService.preflightOrder=async()=>({eligible:false});await recovery.execute(input);await physical.prepare(input);
    const outcomes=await Promise.all([physical.settle(input),physical.settle(input)]);
    assert(outcomes.every(row=>row.status==='SETTLED'));assert.equal(f.balance().available,'3');assert.equal(f.balance().reserved,'0');
    assert.equal(f.data.inventory.inventoryMovement.length,2);assert.equal(f.state.payments,0);
});

test('physical HTTP mapping ignores caller owner and enterprise fields and preserves independent route protection',async()=>{
    const f=await fixture(), controller=require('../src/controller/defaultPhysicalFulfillmentController');
    let received;
    SERVICE.DefaultPhysicalOrderReversalService={dispatch:async r=>{received=r;return{status:'SHIPPED'};}};
    await controller.dispatch({tenant:'t',authData:f.request.authData,httpRequest:{params:{code:'order'},headers:{authorization:'Bearer isolated-test','idempotency-key':'dispatch-command'},
        body:{ownerId:'forged',tenant:'foreign',enterpriseCode:'foreign',confirmed:true}}});
    assert.equal(received.tenant,'t');assert.equal(received.code,'order');assert.equal(received.ownerId,undefined);assert.equal(received.enterpriseCode,undefined);
    const routes=require('../src/router/routers').fulfillmentCore.physical;
    assert.equal(Object.keys(routes).length,3);
    for(const route of Object.values(routes)){assert.equal(route.secured,true);assert.equal(route.permission,'commerce.fulfillment.return');assert.equal(route.apiExposure,'commerceManagement');}
    const schemas=require('../src/schemas/schemas').fulfillmentCore;
    for(const name of ['consignment','shipment','fulfillmentReturn','returnReceipt','returnInspection']){
        assert.equal(schemas[name].router.enabled,false);assert.equal(schemas[name].isVersionedEnabled,false);assert.equal(schemas[name].transaction.sideEffects,'none');
    }
});

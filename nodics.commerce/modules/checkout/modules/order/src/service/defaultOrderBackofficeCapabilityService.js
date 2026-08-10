/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module order/service/DefaultOrderBackofficeCapabilityService @description Publishes Order-owned BackOffice order and reverse-lifecycle workspaces. @layer service @owner order */
module.exports = {
    /** Registers the Order BackOffice capability provider. */
    init:function(){SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('order',this);return Promise.resolve(true);},
    /** Completes provider lifecycle initialization. */
    postInit:function(){return Promise.resolve(true);},
    /** Returns the Order-owned BackOffice capability contract. */
    getCapability:function(){let d=SERVICE.DefaultBackofficeCapabilityDefinitionService;let common={defaultColumns:['code','orderCode','requestType','reasonCode','status','revision','occurredAt'],hiddenFields:['idempotencyKey','correlationId','evidence']};let preview=[{id:'preview',label:'Preview decision',intent:'VALIDATE',permission:'commerce.lifecycle.read',ownerModule:'order',operationRoute:'/customer/orders/:orderCode/lifecycle/preview',order:10}];let item=(options)=>d.workbench(Object.assign({moduleName:'order',permission:'commerce.order.read'},options));return d.capability({capabilityId:'commerce-order',displayName:'Checkout & Orders',category:'commerce',icon:'commerce',navigation:[
            item({id:'checkout-and-orders',label:'Checkout & Orders',route:'/commerce/checkout',schemaName:'commerceOrder',order:300,summary:'Review calculated carts, placement checkpoints, immutable orders, and history.',group:{id:'commerce',label:'Commerce',order:300},presentation:{defaultColumns:['code','orderCode','cartCode','status','currency','totalAmount','revision','occurredAt'],hiddenFields:['idempotencyKey','correlationId','evidence']}}),
            item({id:'orders',parentId:'checkout-and-orders',label:'Orders',route:'/commerce/checkout/orders',schemaName:'commerceOrder',order:320,summary:'Inspect immutable Order projections and append-only history.',presentation:{defaultColumns:['code','orderCode','cartCode','status','currency','totalAmount','revision','occurredAt'],hiddenFields:['idempotencyKey','correlationId','evidence']}}),
            d.workbench({id:'order-cancellations',parentId:'checkout-and-orders',label:'Cancellations',route:'/commerce/checkout/cancellations',moduleName:'order',schemaName:'orderLifecycleRequest',order:330,permission:'commerce.lifecycle.read',summary:'Operate cancellation intent through policy, approval, and owner actions.',presentation:Object.assign({},common,{fixedFilters:[{id:'request-type-cancellation',label:'Cancellation requests',field:'requestType',value:'CANCELLATION',order:10}]}),lifecycleActions:preview}),
            d.workbench({id:'order-returns',parentId:'checkout-and-orders',label:'Returns',route:'/commerce/checkout/returns',moduleName:'order',schemaName:'orderLifecycleRequest',order:340,permission:'commerce.lifecycle.read',summary:'Operate return intent, logistics, receipt, inspection, and disposition.',presentation:Object.assign({},common,{fixedFilters:[{id:'request-type-return',label:'Return requests',field:'requestType',value:'RETURN',order:10}]}),lifecycleActions:preview}),
            d.workbench({id:'order-refunds',parentId:'checkout-and-orders',label:'Refunds',route:'/commerce/checkout/refunds',moduleName:'order',schemaName:'orderLifecycleRequest',order:350,permission:'commerce.lifecycle.read',summary:'Operate maker-checker refund intent through Payment and reconciliation evidence.',presentation:Object.assign({},common,{fixedFilters:[{id:'request-type-refund',label:'Refund requests',field:'requestType',value:'REFUND',order:10}]}),lifecycleActions:preview})
        ]});}
};

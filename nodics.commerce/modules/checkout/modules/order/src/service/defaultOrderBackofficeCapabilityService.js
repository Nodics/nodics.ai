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
    /** Builds hidden request-code input used by Axis lifecycle action routing. */
    requestCodeInput:function(){return {name:'requestCode',label:'Request code',type:'HIDDEN',required:true,valueFromRecord:'code',maximumLength:128};},
    /** Builds a common operator reason input. */
    reasonInput:function(){return {name:'reason',label:'Reason',type:'MULTILINE',required:false,maximumLength:512};},
    /** Builds the backend operation route for one lifecycle action code. */
    actionRoute:function(actionCode){return '/operator/order-lifecycle/:requestCode/actions/'+actionCode;},
    /** Builds one Order-owned operator action definition. */
    action:function(options){return Object.assign({permission:'commerce.lifecycle.act',ownerModule:'order',operationRoute:this.actionRoute(options.actionCode),inputFields:[this.requestCodeInput(),this.reasonInput()],targetStatuses:['SUBMITTED','APPROVED','RETRY_PENDING','RECONCILING'],featureState:'ACTIVE'},options,{actionCode:undefined});},
    /** Returns standard operator lifecycle action definitions. */
    lifecycleActions:function(scope){
        let actions=[
            this.action({id:'approve',label:'Approve',intent:'APPROVE',actionCode:'APPROVE',summary:'Approve the lifecycle request and call downstream owner services when required.',order:10}),
            this.action({id:'reject',label:'Reject',intent:'REJECT',actionCode:'REJECT',summary:'Reject the lifecycle request with an operator-visible reason.',order:20}),
            this.action({id:'retry',label:'Retry',intent:'RETRY',actionCode:'RETRY',summary:'Move the request into retry-pending state for recoverable downstream failures.',order:30}),
            this.action({id:'reconcile',label:'Reconcile',intent:'RECONCILE',actionCode:'RECONCILE',summary:'Mark the request for reconciliation or execute a reconciliation-aware owner action.',order:40})
        ];
        if(scope==='RETURN') actions=actions.concat([
            this.action({id:'mark-received',label:'Mark received',intent:'OTHER',actionCode:'MARK_RECEIVED',summary:'Record returned-goods receipt through Fulfillment-owned services.',order:50,inputFields:[this.requestCodeInput(),{name:'rmaCode',label:'RMA code',type:'TEXT',required:false,valueFromRecord:'evidence.rmaCode',maximumLength:128},{name:'receivedQuantity',label:'Received quantity',type:'TEXT',required:false,defaultValue:'1',maximumLength:16},this.reasonInput()]}),
            this.action({id:'mark-inspected',label:'Mark inspected',intent:'OTHER',actionCode:'MARK_INSPECTED',summary:'Record return inspection through Fulfillment-owned services.',order:60,inputFields:[this.requestCodeInput(),{name:'rmaCode',label:'RMA code',type:'TEXT',required:false,valueFromRecord:'evidence.rmaCode',maximumLength:128},{name:'disposition',label:'Disposition',type:'SELECT',required:true,options:['RESTOCK','REFURBISH','SCRAP','REJECT_RETURN'],defaultValue:'RESTOCK',maximumLength:32},this.reasonInput()]}),
            this.action({id:'record-disposition',label:'Record disposition',intent:'OTHER',actionCode:'DISPOSITION',summary:'Record inventory disposition and refund eligibility after inspection.',order:70,inputFields:[this.requestCodeInput(),{name:'rmaCode',label:'RMA code',type:'TEXT',required:false,valueFromRecord:'evidence.rmaCode',maximumLength:128},{name:'disposition',label:'Disposition',type:'SELECT',required:true,options:['RESTOCK','REFURBISH','SCRAP','REJECT_RETURN'],defaultValue:'RESTOCK',maximumLength:32},this.reasonInput()]})
        ]);
        if(scope==='REFUND') actions=actions.map(action=>action.id==='approve'?Object.assign({},action,{inputFields:[this.requestCodeInput(),{name:'refundAmount',label:'Refund amount',type:'TEXT',required:false,valueFromRecord:'evidence.refundPreview.amount',maximumLength:32},{name:'currency',label:'Currency',type:'TEXT',required:false,valueFromRecord:'evidence.refundPreview.currency',maximumLength:8},this.reasonInput()]}):action);
        return actions;
    },
    /** Returns the Order-owned BackOffice capability contract. */
    getCapability:function(){let d=SERVICE.DefaultBackofficeCapabilityDefinitionService;let common={defaultColumns:['code','orderCode','requestType','reasonCode','status','revision','occurredAt'],hiddenFields:['idempotencyKey','correlationId','evidence']};let item=(options)=>d.workbench(Object.assign({moduleName:'order',permission:'commerce.order.read'},options));return d.capability({capabilityId:'commerce-order',displayName:'Checkout & Orders',category:'commerce',icon:'commerce',navigation:[
            item({id:'checkout-and-orders',label:'Checkout & Orders',route:'/commerce/checkout',schemaName:'commerceOrder',order:300,summary:'Review calculated carts, placement checkpoints, immutable orders, and history.',group:{id:'commerce',label:'Commerce',order:300},presentation:{defaultColumns:['code','orderCode','cartCode','status','currency','totalAmount','revision','occurredAt'],hiddenFields:['idempotencyKey','correlationId','evidence']}}),
            item({id:'orders',parentId:'checkout-and-orders',label:'Orders',route:'/commerce/checkout/orders',schemaName:'commerceOrder',order:320,summary:'Inspect immutable Order projections and append-only history.',presentation:{defaultColumns:['code','orderCode','cartCode','status','currency','totalAmount','revision','occurredAt'],hiddenFields:['idempotencyKey','correlationId','evidence']}}),
            d.workbench({id:'order-cancellations',parentId:'checkout-and-orders',label:'Cancellations',route:'/commerce/checkout/cancellations',moduleName:'order',schemaName:'orderLifecycleRequest',order:330,permission:'commerce.lifecycle.read',summary:'Operate cancellation intent through policy, approval, and owner actions.',presentation:Object.assign({},common,{fixedFilters:[{id:'request-type-cancellation',label:'Cancellation requests',field:'requestType',value:'CANCELLATION',order:10}]}),lifecycleActions:this.lifecycleActions('CANCELLATION')}),
            d.workbench({id:'order-returns',parentId:'checkout-and-orders',label:'Returns',route:'/commerce/checkout/returns',moduleName:'order',schemaName:'orderLifecycleRequest',order:340,permission:'commerce.lifecycle.read',summary:'Operate return intent, logistics, receipt, inspection, and disposition.',presentation:Object.assign({},common,{fixedFilters:[{id:'request-type-return',label:'Return requests',field:'requestType',value:'RETURN',order:10}]}),lifecycleActions:this.lifecycleActions('RETURN')}),
            d.workbench({id:'order-refunds',parentId:'checkout-and-orders',label:'Refunds',route:'/commerce/checkout/refunds',moduleName:'order',schemaName:'orderLifecycleRequest',order:350,permission:'commerce.lifecycle.read',summary:'Operate maker-checker refund intent through Payment and reconciliation evidence.',presentation:Object.assign({},common,{fixedFilters:[{id:'request-type-refund',label:'Refund requests',field:'requestType',value:'REFUND',order:10}]}),lifecycleActions:this.lifecycleActions('REFUND')}),
            d.workbench({id:'order-exchanges',parentId:'checkout-and-orders',label:'Exchanges & Replacements',route:'/commerce/checkout/exchanges',moduleName:'order',schemaName:'orderLifecycleRequest',order:360,permission:'commerce.lifecycle.read',summary:'Operate exchange and replacement intent through return logistics, inventory and fulfillment evidence.',presentation:Object.assign({},common,{fixedFilters:[{id:'request-type-exchange',label:'Exchange requests',field:'requestType',value:'EXCHANGE',order:10},{id:'request-type-replacement',label:'Replacement requests',field:'requestType',value:'REPLACEMENT',order:20}]}),lifecycleActions:this.lifecycleActions('RETURN')}),
            d.workbench({id:'order-appeals',parentId:'checkout-and-orders',label:'Lifecycle Appeals',route:'/commerce/checkout/appeals',moduleName:'order',schemaName:'orderLifecycleRequest',order:370,permission:'commerce.lifecycle.read',summary:'Operate customer appeal intent for rejected cancellations, returns, refunds or delayed-refund handling.',presentation:Object.assign({},common,{fixedFilters:[{id:'request-type-appeal',label:'Appeal requests',field:'requestType',value:'APPEAL',order:10}]}),lifecycleActions:this.lifecycleActions('CANCELLATION')})
        ]});}
};

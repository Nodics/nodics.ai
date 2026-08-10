/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module paymentCore/service/DefaultPaymentCoreBackofficeCapabilityService @description Publishes Payment-owned BackOffice operations and reconciliation workspaces. @layer service @owner paymentCore */
module.exports={init:function(){SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('paymentCore',this);return Promise.resolve(true);},postInit:function(){return Promise.resolve(true);},getCapability:function(){let d=SERVICE.DefaultBackofficeCapabilityDefinitionService;return d.capability({capabilityId:'commerce-payment',displayName:'Payment Operations',category:'commerce',icon:'commerce',navigation:[d.workbench({id:'payment-operations',label:'Payment Operations',route:'/commerce/payments',moduleName:'paymentCore',schemaName:'paymentTransaction',order:400,permission:'commerce.payment.read',summary:'Operate method, provider, transaction, callback, refund, and reconciliation evidence.',group:{id:'commerce',label:'Commerce',order:300},presentation:{defaultColumns:['code','orderCode','cartCode','status','currency','totalAmount','revision','occurredAt'],hiddenFields:['ownerId','idempotencyKey','correlationId','evidence']}}),d.workbench({id:'payment-reconciliation',parentId:'payment-operations',label:'Refunds & Reconciliation',route:'/commerce/payments/reconciliation',moduleName:'paymentCore',schemaName:'paymentReconciliation',order:410,permission:'commerce.payment.reconcile',summary:'Reconcile provider outcomes without exposing tokens or secrets.',presentation:{defaultColumns:['code','orderCode','status','revision','occurredAt'],hiddenFields:['ownerId','idempotencyKey','correlationId','evidence']}})]});}};

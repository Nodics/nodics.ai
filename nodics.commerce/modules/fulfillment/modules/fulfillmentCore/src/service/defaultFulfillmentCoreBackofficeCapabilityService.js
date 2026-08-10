/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module fulfillmentCore/service/DefaultFulfillmentCoreBackofficeCapabilityService @description Publishes Fulfillment-owned BackOffice operations, shipment, and return-receipt workspaces. @layer service @owner fulfillmentCore */
module.exports={init:function(){SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('fulfillmentCore',this);return Promise.resolve(true);},postInit:function(){return Promise.resolve(true);},getCapability:function(){let d=SERVICE.DefaultBackofficeCapabilityDefinitionService;return d.capability({capabilityId:'commerce-fulfillment',displayName:'Fulfillment Operations',category:'commerce',icon:'commerce',navigation:[d.workbench({id:'fulfillment-operations',label:'Fulfillment Operations',route:'/commerce/fulfillment',moduleName:'fulfillmentCore',schemaName:'consignment',order:500,permission:'commerce.fulfillment.read',summary:'Operate consignments, shipments, tracking, warehouse tasks, and returns.',group:{id:'commerce',label:'Commerce',order:300},presentation:{defaultColumns:['code','orderCode','status','currency','totalAmount','revision','occurredAt'],hiddenFields:['ownerId','idempotencyKey','correlationId','evidence']}}),d.workbench({id:'shipments',parentId:'fulfillment-operations',label:'Shipments & Tracking',route:'/commerce/fulfillment/shipments',moduleName:'fulfillmentCore',schemaName:'shipment',order:510,permission:'commerce.fulfillment.read',summary:'Inspect partial shipment and carrier-safe tracking evidence.',presentation:{defaultColumns:['code','orderCode','status','revision','occurredAt'],hiddenFields:['ownerId','idempotencyKey','correlationId','evidence']}}),d.workbench({id:'return-receipts',parentId:'fulfillment-operations',label:'Return Receipt & Inspection',route:'/commerce/fulfillment/returns',moduleName:'fulfillmentCore',schemaName:'returnInspection',order:520,permission:'commerce.fulfillment.return',summary:'Record returned-goods receipt and inspection before Inventory disposition.',presentation:{defaultColumns:['code','orderCode','requestType','reasonCode','status','revision','occurredAt'],hiddenFields:['ownerId','idempotencyKey','correlationId','evidence']}})]});}};

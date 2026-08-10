/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module cart/service/DefaultCartBackofficeCapabilityService @description Publishes the Cart-owned BackOffice workspace. @layer service @owner cart */
module.exports={init:function(){SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('cart',this);return Promise.resolve(true);},postInit:function(){return Promise.resolve(true);},getCapability:function(){let d=SERVICE.DefaultBackofficeCapabilityDefinitionService;return d.capability({capabilityId:'commerce-cart',displayName:'Carts & Calculation',category:'commerce',icon:'commerce',navigation:[d.workbench({id:'carts',parentId:'checkout-and-orders',parentModuleName:'order',label:'Carts & Calculation',route:'/commerce/checkout/carts',moduleName:'cart',schemaName:'cart',order:310,permission:'commerce.cart.read',summary:'Inspect Cart entries, owner decisions, totals, and calculation diagnostics.',presentation:{defaultColumns:['code','storeCode','channelCode','status','currency','totalAmount','revision'],hiddenFields:['ownerId','correlationId']}})]});}};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module promotion/service/DefaultPromotionBackofficeCapabilityService @description Publishes the Promotion-owned BackOffice workspace. @layer service @owner promotion */
module.exports={init:function(){SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('promotion',this);return Promise.resolve(true);},postInit:function(){return Promise.resolve(true);},getCapability:function(){let d=SERVICE.DefaultBackofficeCapabilityDefinitionService;return d.capability({capabilityId:'commerce-promotion',displayName:'Promotions',category:'commerce',icon:'commerce',navigation:[d.workbench({id:'promotions',parentId:'catalog-and-products',parentModuleName:'product',label:'Promotions',route:'/commerce/catalog/promotions',moduleName:'promotion',schemaName:'promotion',order:150,permission:'commerce.promotion.read',summary:'Manage promotion rules, coupons, and applied-discount evidence.',presentation:{defaultColumns:['code','name','status','priority','validFrom','validTo','revision'],hiddenFields:['conditions','actions']}})]});}};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module tax/service/DefaultTaxBackofficeCapabilityService @description Publishes the Tax-owned BackOffice workspace. @layer service @owner tax */
module.exports = {
    /** Registers the Tax BackOffice capability provider. */
    init:function(){SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('tax',this);return Promise.resolve(true);},
    /** Completes provider lifecycle initialization. */
    postInit:function(){return Promise.resolve(true);},
    /** Returns the Tax-owned BackOffice capability contract. */
    getCapability:function(){let d=SERVICE.DefaultBackofficeCapabilityDefinitionService;return d.capability({capabilityId:'commerce-tax',displayName:'Tax Policies',category:'commerce',icon:'commerce',navigation:[d.workbench({id:'tax-policies',parentId:'catalog-and-products',parentModuleName:'product',label:'Tax Policies',route:'/commerce/catalog/tax',moduleName:'tax',schemaName:'taxPolicy',order:140,permission:'commerce.tax.read',summary:'Operate jurisdiction policy and exact Tax decision evidence.',presentation:{defaultColumns:['code','jurisdiction','taxCode','rate','status','revision']}})]});}
};

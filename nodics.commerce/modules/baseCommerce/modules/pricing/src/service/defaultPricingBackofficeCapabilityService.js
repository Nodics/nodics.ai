/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module pricing/service/DefaultPricingBackofficeCapabilityService @description Publishes the Pricing-owned BackOffice workspace. @layer service @owner pricing */
module.exports = {
    /** Registers the Pricing BackOffice capability provider. */
    init: function () { SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('pricing', this); return Promise.resolve(true); },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the Pricing-owned BackOffice capability contract. */
    getCapability: function () { let d=SERVICE.DefaultBackofficeCapabilityDefinitionService; return d.capability({ capabilityId:'commerce-pricing',displayName:'Prices',category:'commerce',icon:'commerce',navigation:[d.workbench({id:'prices',parentId:'product-pricing',parentModuleName:'product',label:'Product Prices',route:'/commerce/catalog/prices',moduleName:'pricing',schemaName:'priceRow',order:541,permission:'commerce.pricing.read',summary:'Inspect exact price rows and replayable Pricing decisions.',presentation:{defaultColumns:['code','priceBookCode','productCode','unitAmount','currency','minQuantity','validFrom','validTo','revision']}})]}); }
};

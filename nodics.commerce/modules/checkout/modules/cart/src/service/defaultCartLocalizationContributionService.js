/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module cart/service/DefaultCartLocalizationContributionService @description Publishes Cart-owned checkout availability localization keys. @layer service @owner cart */
module.exports={init:function(){return Promise.resolve(true);},postInit:function(){return Promise.resolve(true);},getLocalizationContribution:function(){return{formatVersion:1,ownerModule:'cart',entries:[{namespace:'commerce',key:'checkout.unavailable',defaultMessage:'Checkout is currently unavailable',parameters:[],exposure:'PUBLIC'}]};}};

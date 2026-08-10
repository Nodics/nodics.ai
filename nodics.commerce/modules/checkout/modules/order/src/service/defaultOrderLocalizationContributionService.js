/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module order/service/DefaultOrderLocalizationContributionService @description Publishes Order-owned status localization keys. @layer service @owner order */
module.exports={init:function(){return Promise.resolve(true);},postInit:function(){return Promise.resolve(true);},getLocalizationContribution:function(){return{formatVersion:1,ownerModule:'order',entries:[{namespace:'commerce',key:'order.status',defaultMessage:'Order status: {status}',parameters:['status'],exposure:'AUTHENTICATED'}]};}};

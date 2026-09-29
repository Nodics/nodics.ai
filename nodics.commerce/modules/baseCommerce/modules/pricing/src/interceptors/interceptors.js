/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/src/interceptors/interceptors @description Checks effective Staged policy storage before generated authoring writes. @layer interceptors @owner pricing */
module.exports = {
    priceBookPublicationpreSave: { type: 'schema', item: 'priceBook', trigger: 'preSave', active: 'true', index: -30,
        handler: 'DefaultPricingPublicationService.validateSourceAuthoring' },
    priceBookPublicationpreUpdate: { type: 'schema', item: 'priceBook', trigger: 'preUpdate', active: 'true', index: -30,
        handler: 'DefaultPricingPublicationService.validateSourceAuthoring' },
    priceRowPublicationpreSave: { type: 'schema', item: 'priceRow', trigger: 'preSave', active: 'true', index: -30,
        handler: 'DefaultPricingPublicationService.validateSourceAuthoring' },
    priceRowPublicationpreUpdate: { type: 'schema', item: 'priceRow', trigger: 'preUpdate', active: 'true', index: -30,
        handler: 'DefaultPricingPublicationService.validateSourceAuthoring' },
};

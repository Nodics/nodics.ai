/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module tax/src/interceptors/interceptors @description Checks effective Staged policy storage before generated authoring writes. @layer interceptors @owner tax */
module.exports = {
    taxPolicyPublicationpreSave: { type: 'schema', item: 'taxPolicy', trigger: 'preSave', active: 'true', index: -30,
        handler: 'DefaultTaxPublicationService.validateSourceAuthoring' },
    taxPolicyPublicationpreUpdate: { type: 'schema', item: 'taxPolicy', trigger: 'preUpdate', active: 'true', index: -30,
        handler: 'DefaultTaxPublicationService.validateSourceAuthoring' },
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module product/src/utils/statusDefinitions
 * @description Defines stable Product-domain localization and publication errors.
 * @layer utility
 * @owner product
 * @override Later Commerce modules may add Product-owned codes without changing these meanings.
 */
module.exports = {
    ERR_PRODUCT_L10N_0001: { code: '400', message: 'Product locale is invalid' },
    ERR_PRODUCT_L10N_0002: { code: '400', message: 'Tenant-scoped Product localization identity is required' },
    ERR_PRODUCT_L10N_0003: { code: '422', message: 'Product locale is not supported' },
    ERR_PRODUCT_L10N_0004: { code: '422', message: 'Product localization exceeds configured field bounds' },
    ERR_PRODUCT_L10N_0005: { code: '422', message: 'Product localization status is invalid' },
    ERR_PRODUCT_L10N_0006: { code: '409', message: 'Required Product locale is not ready' },
    ERR_PRODUCT_L10N_0007: { code: '409', message: 'Required Product localized field is missing' }
};

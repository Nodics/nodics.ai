/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module cart/utils/statusDefinitions @description Customer-safe Cart inventory rejection. @layer utils @owner cart */
module.exports = {
    ERR_CART_PRODUCT_UNAVAILABLE: { code: '409', message: 'Product SKU is unavailable in the selected catalogue' },
    ERR_CART_INVENTORY_UNAVAILABLE: { code: '409', message: 'Inventory unavailable' }
};

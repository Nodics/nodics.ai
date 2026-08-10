/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module inventory/src/service/defaultInventorySourcingService @description Selects tenant-safe warehouse candidates without mutating stock. @layer service @owner inventory */
module.exports = { source: function (request, balances) {
    if (!request || !Array.isArray(balances)) throw new Error('Request and balances are required');
    return Object.freeze(balances.filter(item => item.tenant === request.tenant && item.sku === request.sku && item.available !== '0').sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0)).map(item => Object.freeze({ warehouseCode: item.warehouseCode, sku: item.sku, available: item.available, revision: item.revision })));
} };

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module pricing/src/service/defaultPricingDecisionService @description Creates replayable price decision evidence. @layer service @owner pricing */
const crypto = require('node:crypto');
module.exports = {
    /** Resolves an exact price row into immutable decision evidence. */
    decide: function (request, row, exactAmountService) {
        if (!request || !row || request.tenant !== row.tenant) throw new Error('Tenant-scoped request and price row are required');
        if (request.currency !== row.currency) throw new Error('Currency mismatch');
        const totalAmount = exactAmountService.multiply(row.unitAmount, request.quantity);
        const evidence = { tenant: request.tenant, productCode: request.productCode, storeCode: request.storeCode, quantity: exactAmountService.normalize(request.quantity), unitAmount: exactAmountService.normalize(row.unitAmount), totalAmount, currency: row.currency, priceRowCode: row.code, calculationVersion: request.calculationVersion, correlationId: request.correlationId };
        return Object.freeze(Object.assign(evidence, { sourceHash: crypto.createHash('sha256').update(JSON.stringify(evidence)).digest('hex') }));
    }
};

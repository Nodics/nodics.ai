/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
/** @module promotion/src/service/defaultPromotionDecisionService @description Produces bounded exact discount evidence after caller-owned eligibility evaluation. @layer service @owner promotion */
module.exports = { decide: function (request, promotion, exact) {
    if (!request || !promotion || request.tenant !== promotion.tenant || promotion.status !== 'ACTIVE') throw new Error('Active tenant promotion is required');
    const amount = exact.normalize(request.discountAmount); if (amount.startsWith('-')) throw new Error('Discount cannot be negative');
    const evidence = { tenant: request.tenant, promotionCode: promotion.code, targetType: request.targetType, targetCode: request.targetCode, discountAmount: amount, currency: request.currency, reasonCode: request.reasonCode, ruleVersion: String(promotion.revision), correlationId: request.correlationId };
    return Object.freeze(Object.assign(evidence, { sourceHash: crypto.createHash('sha256').update(JSON.stringify(evidence)).digest('hex') }));
} };

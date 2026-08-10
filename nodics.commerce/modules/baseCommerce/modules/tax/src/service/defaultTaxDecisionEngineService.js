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
/** @module tax/src/service/defaultTaxDecisionEngineService @description Produces exact tax decision evidence from an active policy. @layer service @owner tax */
module.exports = { decide: function (request, policy, exact) {
    if (!request || !policy || request.tenant !== policy.tenant || policy.status !== 'ACTIVE') throw new Error('Active tenant tax policy is required');
    const evidence = { tenant: request.tenant, taxCode: policy.taxCode, jurisdiction: policy.jurisdiction, taxableAmount: exact.normalize(request.taxableAmount), taxAmount: exact.multiply(request.taxableAmount, policy.rate), currency: request.currency, rate: exact.normalize(policy.rate), inclusive: Boolean(request.inclusive), policyVersion: String(policy.revision), correlationId: request.correlationId };
    return Object.freeze(Object.assign(evidence, { sourceHash: crypto.createHash('sha256').update(JSON.stringify(evidence)).digest('hex') }));
} };

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
module.exports = {
/** Calculates from supplied policy only when delivery is disabled; enabled delivery ignores mutable policy.
 * @returns {Object|Promise<Object>} Legacy synchronous evidence, or asynchronous activated evidence.
 */
decide: function (request, policy, exact) {
    const delivery = typeof CONFIG === 'undefined' ? {} : ((CONFIG.get('tax') || {}).publication || {}).delivery || {};
    if (delivery.enabled === true && SERVICE.DefaultTaxPublicationService.deliveryEnabled(request)) {
        return SERVICE.DefaultTaxPublicationService.readConfigured(request).then(records => {
            const policies = records.filter(item => item.schema === 'taxPolicy' && item.policy.status === 'ACTIVE' &&
                (!request.jurisdiction || item.policy.jurisdiction === request.jurisdiction) &&
                (!request.taxCode || item.policy.taxCode === request.taxCode));
            if (policies.length !== 1) throw new Error('Activated tax policy is missing or ambiguous');
            return this.calculate(request, policies[0].policy, exact);
        });
    }
    return this.calculate(request, policy, exact);
},
/** Pure calculation primitive reused after authorized activated policy resolution. */
calculate: function (request, policy, exact) {
    if (!request || !policy || request.tenant !== policy.tenant || policy.status !== 'ACTIVE') throw new Error('Active tenant tax policy is required');
    const evidence = { tenant: request.tenant, taxCode: policy.taxCode, jurisdiction: policy.jurisdiction, taxableAmount: exact.normalize(request.taxableAmount), taxAmount: exact.multiply(request.taxableAmount, policy.rate), currency: request.currency, rate: exact.normalize(policy.rate), inclusive: Boolean(request.inclusive), policyVersion: String(policy.versionId === undefined ? policy.revision : policy.versionId), correlationId: request.correlationId };
    return Object.freeze(Object.assign(evidence, { sourceHash: crypto.createHash('sha256').update(JSON.stringify(evidence)).digest('hex') }));
} };

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const DEFAULTS = require('../../config/properties').wasteMaterialValue;

/**
 * @module wasteReward/service/defaultWasteMaterialValueMockProviderService
 * @description Reads explicitly governed simulation evidence through existing Waste persistence.
 * Never calls a registry or executes payment. Owner commands retain authorization and settlement.
 * @owner wasteReward @layer service
 * @override Preserve synthetic provenance, tenant/qualification isolation and owner admission.
 */
module.exports = {
    /** Returns the effective evidence owner without changing state. */
    owner: function () { return SERVICE.DefaultWasteMaterialValueAssessmentService; },
    /** Builds an unambiguous simulation reference; code is a governed record identity. */
    reference: function (code) { return { module: 'wasteReward', schema: 'wasteMaterialValueMockEvidence', code }; },
    /**
     * Reads one governed simulation record; rejects disabled, aborted or foreign evidence.
     * @param {object} reference Exact owner-local mock evidence reference.
     * @param {object} context Trusted provider context from the owner, including tenant and qualification.
     * @returns {Promise<object>} Detached synthetic evidence; never writes or falls back.
     * @override Retain all gates when customizing record retrieval.
     */
    read: async function (reference, context) {
        const owner = this.owner(), request = { tenant: context?.tenant };
        const supplied = typeof CONFIG !== 'undefined' ? CONFIG.get('wasteMaterialValue', request.tenant) || {} : {};
        const mock = supplied.mock === undefined ? DEFAULTS.mock : supplied.mock;
        if (!mock || Object.getPrototypeOf(mock) !== Object.prototype ||
            (mock.enabled !== undefined && typeof mock.enabled !== 'boolean'))
            owner.fail('CONFIGURATION', 'Invalid mock provider settings');
        const settings = owner.settings(request);
        if ((mock.enabled ?? DEFAULTS.mock.enabled) !== true || !settings.evidence.allowSynthetic ||
            !context?.tenant || context.signal?.aborted ||
            !owner.same(context.qualificationRef, settings.evidence.qualificationRef))
            owner.fail('UNAVAILABLE', 'Simulation provider is not explicitly enabled');
        owner.reference(reference);
        if (reference.module !== 'wasteReward' || reference.schema !== 'wasteMaterialValueMockEvidence')
            owner.fail('EVIDENCE', 'Only owner-local mock evidence is admitted');
        const record = await owner.store().one('wasteMaterialValueMockEvidence', request, reference.code);
        if (context.signal?.aborted || !record || record.synthetic !== true ||
            !owner.same(record.qualificationRef, context.qualificationRef) ||
            !record.evidence || Object.getPrototypeOf(record.evidence) !== Object.prototype ||
            record.evidence.synthetic !== true)
            owner.fail('EVIDENCE', 'Qualified synthetic evidence is required');
        return owner.copy(record.evidence);
    },
    /**
     * Returns recorded simulated valuation; policy, accepted receipts and beneficiaries remain owner-validated.
     * @returns {Promise<object>} Existing readValuation contract, explicitly synthetic.
     */
    readValuation: async function (input, context) {
        const evidence = await this.read(input.evidenceRef, context);
        if (evidence.kind !== 'valuation') this.owner().fail('EVIDENCE', 'Mock valuation evidence is required');
        const reference = this.reference(input.evidenceRef.code);
        return { ...evidence, synthetic: true, valuationRef: reference, confirmationRef: reference };
    },
    /**
     * Returns only recorded payment coverage; never infers payment from a valuation or release request.
     * @returns {Promise<object>} Existing readPayment contract; settlement still checks all exact bindings.
     */
    readPayment: async function (input, context) {
        const evidence = await this.read(input.evidenceRef, context);
        if (evidence.kind !== 'payment') this.owner().fail('EVIDENCE', 'Mock payment evidence is required');
        const reference = this.reference(input.evidenceRef.code);
        if (!this.owner().same(evidence.batchRef, input.batchRef) ||
            !this.owner().same(evidence.valuationRef, input.valuationRef) ||
            evidence.valuationRef?.module !== 'wasteReward' ||
            evidence.valuationRef?.schema !== 'wasteMaterialValueMockEvidence')
            this.owner().fail('EVIDENCE', 'Mock payment does not match simulated valuation');
        return { ...evidence, synthetic: true, paymentRef: reference, confirmationRef: reference };
    }
};

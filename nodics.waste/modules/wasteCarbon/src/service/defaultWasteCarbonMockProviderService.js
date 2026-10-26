/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const DEFAULTS = require('../../config/properties').wasteCarbon;

/**
 * @module wasteCarbon/service/defaultWasteCarbonMockProviderService
 * @description Reads explicitly governed simulation evidence through existing Waste persistence.
 * Never calls a registry or executes payment. Owner commands retain authorization and settlement.
 * @owner wasteCarbon @layer service
 * @override Preserve synthetic provenance, tenant/qualification isolation and owner admission.
 */
module.exports = {
    /** Returns the effective evidence owner without changing state. */
    owner: function () { return SERVICE.DefaultWasteCarbonHoldingService; },
    /** Builds an unambiguous simulation reference; code is a governed record identity. */
    reference: function (code) { return { module: 'wasteCarbon', schema: 'wasteCarbonMockEvidence', code }; },
    /**
     * Reads one governed simulation record; rejects disabled, aborted or foreign evidence.
     * @param {object} reference Exact owner-local mock evidence reference.
     * @param {object} context Trusted provider context from the owner, including tenant and qualification.
     * @returns {Promise<object>} Detached synthetic evidence; never writes or falls back.
     * @override Retain all gates when customizing record retrieval.
     */
    read: async function (reference, context) {
        const owner = this.owner(), request = { tenant: context?.tenant };
        const supplied = typeof CONFIG !== 'undefined' ? CONFIG.get('wasteCarbon', request.tenant) || {} : {};
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
        if (reference.module !== 'wasteCarbon' || reference.schema !== 'wasteCarbonMockEvidence')
            owner.fail('EVIDENCE', 'Only owner-local mock evidence is admitted');
        const record = await owner.store().one('wasteCarbonMockEvidence', request, reference.code);
        if (context.signal?.aborted || !record || record.synthetic !== true ||
            !owner.same(record.qualificationRef, context.qualificationRef) ||
            !record.evidence || Object.getPrototypeOf(record.evidence) !== Object.prototype ||
            record.evidence.synthetic !== true)
            owner.fail('EVIDENCE', 'Qualified synthetic evidence is required');
        return owner.copy(record.evidence);
    },
    /**
     * Returns simulated cumulative issuance from a governed record, never from Impact estimates.
     * @returns {Promise<object>} Existing readLot contract with mandatory synthetic references.
     */
    readLot: async function (input, context) {
        const evidence = await this.read(input.evidenceRef, context);
        const reference = this.reference(input.evidenceRef.code);
        return { ...evidence, synthetic: true, evidenceRef: reference, issuanceRef: reference,
            providerRef: this.reference('DefaultWasteCarbonMockProviderService'),
            allocations: evidence.allocations?.map(item => ({ ...item,
                allocationRef: this.reference(this.owner().hash([reference.code, item.code])) })) };
    },
    /**
     * Re-reads simulation eligibility; cannot qualify a real registry lot or fabricate external transfer.
     * @returns {Promise<object>} Existing eligibility response, bound to the exact mock issuance.
     */
    eligibility: async function (input, context) {
        const evidence = await this.read(input.issuanceRef, context);
        const reference = this.reference(input.issuanceRef.code);
        const code = 'CARBON_' + this.owner().hash([reference.module, reference.schema, reference.code]);
        if (input.lotCode !== code) this.owner().fail('EVIDENCE', 'Mock issuance does not match lot');
        return { lotCode: code, issuanceRef: reference, evidenceRef: reference, synthetic: true,
            status: evidence.eligibility };
    }
};

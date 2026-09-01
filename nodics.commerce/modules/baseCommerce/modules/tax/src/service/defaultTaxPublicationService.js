/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module tax/src/service/defaultTaxPublicationService @description Restores Tax operational policy records into Online runtime boundaries. @layer service @owner tax */
module.exports = {
    records: value => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [],
    /**
     * Executes `persistenceModel` as a loader-visible operation owned by this module.
     * @param {*} record Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    persistenceModel: function (record, request) {
        let now = new Date();
        const auth = request && request.authData || {};
        const enterpriseCode = record.enterpriseCode || request && (request.enterpriseCode || request.entCode) || auth.enterpriseCode || auth.entCode;
        return Object.assign({}, record, {
            enterpriseCode: enterpriseCode,
            active: record.active !== undefined ? record.active : true,
            created: record.created instanceof Date ? record.created : now,
            updated: now
        });
    },
    /**
     * Executes `restoreOperational` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} input Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    restoreOperational: async function (request, input) {
        let taxPolicies = this.records(input.taxPolicies);
        if (taxPolicies.length === 0) throw new Error('Tax policies are required for Tax restoration');
        let restored = [];
        for (let record of taxPolicies) {
            if (!record || record.tenant !== request.tenant || !record.code) throw new Error('Tax restoration record escaped its tenant boundary');
            const requestEnterpriseCode = request.enterpriseCode || request.entCode || request.authData && (request.authData.enterpriseCode || request.authData.entCode);
            if (record.enterpriseCode && requestEnterpriseCode && record.enterpriseCode !== requestEnterpriseCode) throw new Error('Tax restoration record escaped its enterprise boundary');
            let model = this.persistenceModel(record, request);
            await SERVICE.DefaultTaxPolicyService.save({ tenant: request.tenant, authData: request.authData, model }).then(response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response);
            restored.push(model.code);
        }
        return { tenant: request.tenant, enterpriseCode: request.enterpriseCode || request.entCode || request.authData && (request.authData.enterpriseCode || request.authData.entCode), restored: restored.length, taxPolicies: restored };
    }
};

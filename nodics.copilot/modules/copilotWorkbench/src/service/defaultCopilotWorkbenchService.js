/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotWorkbench/src/service/defaultCopilotWorkbenchService @description Prepares, validates, previews, and submits schema records through injected governed APIs. @layer service @owner copilotWorkbench @override Domain adapters may override record preparation and validation. */
module.exports = {
    /** Prepares repeated product records from clarified values. @param {Object} request Clarified request. @returns {Object} Mutation plan. */
    prepareProducts: function (request) {
        const count = Number(request.count);
        if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('COPILOT_WORKBENCH_COUNT_INVALID');
        const required = ['name', 'codePrefix', 'catalogVersion', 'priceBookCode', 'currency', 'price'];
        const missing = required.filter(key => request[key] === undefined || request[key] === null || request[key] === '');
        if (missing.length) return { state: 'CLARIFICATION_REQUIRED', missing: missing };
        const products = Array.from({ length: count }, (_, index) => ({
            code: request.codePrefix + '-' + String(index + 1).padStart(3, '0'), name: request.name,
            status: request.active === false ? 'DRAFT' : 'ACTIVE', catalogVersion: request.catalogVersion, revision: 1
        }));
        const prices = products.map(record => ({ code: record.code + '-PRICE', priceBookCode: request.priceBookCode,
            productCode: record.code, unitAmount: String(request.price), currency: request.currency, minQuantity: '1', revision: 1 }));
        return { id: request.planId || 'product-plan-' + Date.now(), state: 'PREPARED', schema: 'product', records: products,
            relatedRecords: { pricing: { schema: 'priceRow', records: prices } },
            preview: { count: count, product: { first: products[0], last: products[products.length - 1] }, price: { first: prices[0], last: prices[prices.length - 1] } } };
    },
    /** Validates a prepared plan using a supplied schema validator. @param {Object} plan Plan. @param {Function} validate Validator. @returns {Object} Validated plan. */
    validate: function (plan, validate) {
        if (!plan || plan.state !== 'PREPARED') throw new Error('COPILOT_WORKBENCH_PLAN_NOT_PREPARED');
        const errors = plan.records.flatMap((record, index) => (validate(record) || []).map(error => ({ index: index, error: error })));
        return Object.assign({}, plan, { state: errors.length ? 'INVALID' : 'VALIDATED', errors: errors });
    },
    /** Creates an actor-bound confirmation challenge for a validated plan. @param {Object} plan Validated plan. @param {Object} context Security context. @param {Object} policyService Policy service. @returns {Object} Confirmation challenge. */
    createConfirmation: function (plan, context, policyService) {
        if (!plan || plan.state !== 'VALIDATED') throw new Error('COPILOT_WORKBENCH_VALIDATION_REQUIRED');
        if (!policyService || typeof policyService.createConfirmation !== 'function') throw new Error('COPILOT_WORKBENCH_POLICY_REQUIRED');
        return policyService.createConfirmation(plan, context || {});
    },
    /** Executes a confirmed plan through the owning API after fresh policy authorization. @param {Object} plan Validated plan. @param {Object} confirmation Approved confirmation. @param {Object} context Current security context. @param {Function} submit API submitter. @param {Object} policyService Policy service. @returns {Promise<Object>} API result. */
    execute: function (plan, confirmation, context, submit, policyService) {
        if (!plan || plan.state !== 'VALIDATED') return Promise.reject(new Error('COPILOT_WORKBENCH_VALIDATION_REQUIRED'));
        if (!confirmation || confirmation.confirmed !== true || confirmation.planId !== plan.id) return Promise.reject(new Error('COPILOT_MUTATION_CONFIRMATION_REQUIRED'));
        if (!policyService || typeof policyService.authorizeExecution !== 'function') return Promise.reject(new Error('COPILOT_WORKBENCH_POLICY_REQUIRED'));
        try {
            policyService.authorizeExecution(confirmation, context || {}, plan);
        } catch (error) {
            return Promise.reject(error);
        }
        if (typeof submit !== 'function') return Promise.reject(new Error('COPILOT_WORKBENCH_API_REQUIRED'));
        return Promise.resolve(submit({ schema: plan.schema, records: plan.records, idempotencyKey: plan.id })).then(result => ({ state: 'EXECUTED', planId: plan.id, result: result }));
    }
};

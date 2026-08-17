/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module multiDomainCommerce/service/defaultMultiDomainCommercePolicyService @description Governs reusable mixed physical-product and Telco order composition. @layer service @owner multiDomainCommerce */
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Executes `validateMoney` as a loader-visible operation owned by this module.
     * @param {*} money Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    validateMoney: function (money) { return !!money && typeof money.currency === 'string' && /^[A-Z]{3}$/.test(money.currency) && Number.isSafeInteger(money.minorUnits) && money.minorUnits >= 0; },
    /**
     * Executes `validateRecurringCharge` as a loader-visible operation owned by this module.
     * @param {*} charge Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    validateRecurringCharge: function (charge) { return this.validateMoney(charge) && Number.isSafeInteger(charge.intervalCount) && charge.intervalCount > 0 && ['DAY', 'WEEK', 'MONTH', 'YEAR'].includes(charge.cycle); },
    /**
     * Executes `compose` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    compose: function (request) {
        if (!request || !request.tenant || !request.correlationId || !request.idempotencyKey) throw new Error('MULTI_DOMAIN_CONTEXT_REQUIRED');
        const entries = request.entries || []; const telco = entries.filter(item => item.domain === 'telco'); const physical = entries.filter(item => item.domain !== 'telco');
        const incompatible = telco.filter(plan => plan.deviceProductCode && !physical.some(item => item.productCode === plan.deviceProductCode));
        if (incompatible.length) return { accepted: false, reasonCode: 'TELCO_COMPATIBLE_DEVICE_REQUIRED', correlationId: request.correlationId };
        if (telco.some(plan => !this.validateRecurringCharge(plan.recurringCharge))) return { accepted: false, reasonCode: 'TELCO_RECURRING_CHARGE_INVALID', correlationId: request.correlationId };
        const partitions = [];
        if (physical.length) partitions.push({ type: 'PHYSICAL_ORDER', entries: physical.map(item => item.productCode) });
        if (telco.length) partitions.push({ type: 'TELCO_SERVICE_ORDER', entries: telco.map(item => item.productCode), activationRequired: true });
        return { accepted: true, policy: telco.length && physical.length ? 'SPLIT_COMPATIBLE_BUNDLE' : 'SINGLE_DOMAIN', partitions, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId };
    }
};

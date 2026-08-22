/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module order/service/DefaultOrderLifecycleWorkflowDefinitionService
 * @description Supplies immutable, provider-neutral workflow definitions for governed cancellation, return, and refund orchestration.
 * @owner order
 * @layer service
 * @override Later Commerce modules may replace individual lookup methods through the standard service merge order.
 */
const definitions = {
    cancellation: { code: 'commerceOrderCancellation', version: '0', steps: ['ELIGIBILITY', 'APPROVAL_IF_REQUIRED', 'FULFILLMENT_INTENT', 'INVENTORY_DISPOSITION', 'PAYMENT_VOID_OR_REFUND', 'ORDER_PROJECTION'], makerChecker: true },
    return: { code: 'commerceOrderReturn', version: '0', steps: ['ELIGIBILITY', 'APPROVAL_IF_REQUIRED', 'RETURN_LOGISTICS', 'RECEIPT_AND_INSPECTION', 'INVENTORY_DISPOSITION', 'PAYMENT_REFUND', 'ORDER_PROJECTION'], makerChecker: true },
    refund: { code: 'commerceOrderRefund', version: '0', steps: ['ELIGIBILITY', 'APPROVAL_IF_REQUIRED', 'PAYMENT_REFUND', 'RECONCILIATION', 'ORDER_PROJECTION'], makerChecker: true }
};
module.exports = {
    /** @returns {object} Defensive copy of all Order lifecycle workflow definitions. */
    getDefinitions: function () { return JSON.parse(JSON.stringify(definitions)); },
    /** @param {string} type Lifecycle type. @returns {object|null} Defensive definition copy or null. */
    getDefinition: function (type) { let value = definitions[String(type || '').toLowerCase()]; return value ? JSON.parse(JSON.stringify(value)) : null; }
};

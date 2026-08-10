/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module fulfillmentCore/src/service/defaultFulfillmentLifecycleService @description Validates Fulfillment-owned shipment and return transitions. @layer service @owner fulfillmentCore */
const transitions = Object.freeze({ READY: ['PARTIALLY_SHIPPED', 'SHIPPED', 'CANCEL_REQUESTED'], PARTIALLY_SHIPPED: ['SHIPPED', 'CANCEL_REQUESTED'], SHIPPED: ['DELIVERED', 'RETURN_REQUESTED'], DELIVERED: ['RETURN_REQUESTED'], RETURN_REQUESTED: ['RETURN_RECEIVED'], RETURN_RECEIVED: ['INSPECTED'] });
module.exports = { transition: function (record, next, actor) {
    if (!record || !record.tenant || !(transitions[record.status] || []).includes(next)) throw new Error('Invalid fulfillment transition');
    return Object.freeze({ tenant: record.tenant, orderCode: record.orderCode, fromStatus: record.status, toStatus: next, actorId: actor, revision: record.revision + 1, correlationId: record.correlationId });
} };

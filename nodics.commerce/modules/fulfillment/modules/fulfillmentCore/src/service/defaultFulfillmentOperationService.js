/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module fulfillmentCore/src/service/defaultFulfillmentOperationService @description Publishes Fulfillment delivery and return method policy from layered configuration across caller contexts. @layer service @owner fulfillmentCore */
module.exports = {
    /** Returns Fulfillment customer shipping policy. @returns {Object} Shipping policy. */
    policy: function () { return ((CONFIG.get('fulfillmentCore') || {}).customerShipping) || {}; },
    /** Lists customer-visible shipping methods. @returns {Object} Shipping methods response. */
    shippingMethods: function () { return Object.freeze({ methods: Object.freeze([].concat(this.policy().methods || [])) }); },
    /** Lists customer-visible return methods. @returns {Object} Return methods response. */
    returnMethods: function () { return Object.freeze({ methods: Object.freeze([].concat(this.policy().returnMethods || [])) }); }
};

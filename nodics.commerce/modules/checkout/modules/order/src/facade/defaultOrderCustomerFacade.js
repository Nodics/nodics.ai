/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/facade/defaultOrderCustomerFacade @description Enforces customer ownership context for Order read APIs. @layer facade @owner order */
module.exports = {
    /** Applies authenticated customer tenant and principal context. @param {Object} request Request. @returns {Object} Request. */
    applyContext: async function (request) {
        const participant = await FACADE.DefaultCartCustomerFacade.resolveContext(request, 'commerce.order.own.read');
        return SERVICE.DefaultCheckoutAuctionService ? SERVICE.DefaultCheckoutAuctionService.partition(participant) : participant;
    },
    /** Reads a customer-owned Order. @param {Object} request Request. @returns {Promise<Object>} Order summary. */
    read: async function (request) { return SERVICE.DefaultOrderOperationService.read(await this.applyContext(request)); },
    /** Lists customer-owned Orders. @param {Object} request Request. @returns {Promise<Array>} Orders. */
    listOwn: async function (request) { return SERVICE.DefaultOrderOperationService.listOwn(await this.applyContext(request)); }
};

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
/** @module cart/src/service/defaultCartApiService @description Runs the Cart calculation pipeline and persists authoritative evidence. @layer service @owner cart */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
    /** Starts the governed Cart calculation pipeline. @param {Object} request Tenant-scoped calculation request. @returns {Promise<Object>} Calculation response. */
    calculate: function (request) { return SERVICE.DefaultPipelineService.start('commerceCartCalculationPipeline', request, {}); },
    /** Loads an owned Cart and persists an exact calculation snapshot. @param {Object} request Tenant and customer request. @returns {Promise<Object>} Stored calculation. */
    calculateDirect: async function (request) {
        const carts = await SERVICE.DefaultCartService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, code: request.cartCode, ownerId: request.ownerId }, pageSize: 1 }).then(this.unwrap);
        const cart = Array.isArray(carts) ? carts[0] : carts;
        if (!cart) throw new Error('Customer Cart not found');
        if (request.payload.expectedRevision !== undefined && Number(request.payload.expectedRevision) !== Number(cart.revision)) throw new Error('Cart revision conflict');
        const entriesResponse = await SERVICE.DefaultCartEntryService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, cartCode: cart.code, ownerId: request.ownerId, status: 'ACTIVE' }, pageSize: 500 }).then(this.unwrap);
        const entries = Array.isArray(entriesResponse) ? entriesResponse : [];
        if (entries.length > Number(((CONFIG.get('commerce') || {}).operations || {}).limits.maximumCartEntries || 500)) throw new Error('Cart entry limit exceeded');
        const result = await SERVICE.DefaultCartCalculationEngineService.calculate(Object.assign({}, cart, { entries, correlationId: request.correlationId || request.requestId }), SERVICE.DefaultCommerceCalculationPortsService.create(cart));
        const sourceHash = crypto.createHash('sha256').update(JSON.stringify(result)).digest('hex');
        const model = Object.assign({}, result, { code: request.payload.calculationCode, ownerId: request.ownerId, cartRevision: cart.revision, status: 'CURRENT', revision: 0, sourceHash, calculatedAt: new Date() });
        return SERVICE.DefaultCartCalculationService.save({ tenant: request.tenant, authData: request.authData, model }).then(this.unwrap);
    }
};

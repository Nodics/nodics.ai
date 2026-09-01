/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');

/** @module inventory/src/service/defaultInventoryOperationService @description Owns explicit BackOffice stock operations while keeping balance and movement schemas read-only through generic CRUD. @layer service @owner inventory */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
    /** Builds service credentials for Inventory-owned persistence. @param {Object} request Request. @returns {Object} Service auth data. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            tenant: request.tenant,
            enterpriseCode: request.enterpriseCode,
            principalId: 'inventoryOperationService',
            code: 'inventoryOperationService',
            loginId: 'inventoryOperationService',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },
    /** Resolves a schema-compatible date value. @param {*} value Candidate timestamp. @returns {Date} Date. */
    schemaDate: function (value) { return value instanceof Date ? value : value ? new Date(value) : new Date(); },
    /** Converts decimal-like stock quantities into numbers for operation math. @param {*} value Quantity. @returns {number} Number. */
    quantity: function (value) {
        const amount = Number(value);
        if (!Number.isFinite(amount)) throw new Error('Valid quantity is required for Inventory operation');
        return amount;
    },
    /** Serializes stock quantity back to schema string fields. @param {number} value Quantity. @returns {string} Schema value. */
    stockValue: function (value) {
        if (!Number.isFinite(value)) throw new Error('Inventory quantity calculation produced an invalid value');
        return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(6)));
    },
    /** Gets one balance by tenant and code. @param {Object} request Request. @returns {Promise<Object>} Balance. */
    getBalance: async function (request) {
        if (!SERVICE.DefaultInventoryBalanceService || !SERVICE.DefaultInventoryBalanceService.get) throw new Error('Inventory balance service is not available');
        const result = this.unwrap(await SERVICE.DefaultInventoryBalanceService.get({
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: Object.assign({ tenant: request.tenant, code: request.balanceCode }, request.enterpriseCode ? { enterpriseCode: request.enterpriseCode } : {}),
            pageSize: 1
        }));
        const balance = Array.isArray(result) ? result[0] : result;
        if (!balance) throw new Error('Inventory balance was not found');
        return balance;
    },
    /** Persists a balance through the generated schema service. @param {Object} request Request. @param {Object} balance Balance. @returns {Promise<Object>} Saved balance. */
    saveBalance: async function (request, balance) {
        const service = SERVICE.DefaultInventoryBalanceService;
        const payload = { tenant: request.tenant, authData: this.serviceAuthData(request), query: Object.assign({ tenant: request.tenant, code: balance.code }, request.enterpriseCode ? { enterpriseCode: request.enterpriseCode } : {}), model: Object.assign({}, balance, request.enterpriseCode ? { enterpriseCode: request.enterpriseCode } : {}) };
        if (service.update) return this.unwrap(await service.update(payload));
        if (service.save) return this.unwrap(await service.save(payload));
        throw new Error('Inventory balance persistence is not available');
    },
    /** Persists append-only stock movement evidence. @param {Object} request Request. @param {Object} movement Movement. @returns {Promise<Object>} Saved movement. */
    saveMovement: async function (request, movement) {
        if (!SERVICE.DefaultInventoryMovementService || !SERVICE.DefaultInventoryMovementService.save) return movement;
        return this.unwrap(await SERVICE.DefaultInventoryMovementService.save({ tenant: request.tenant, authData: this.serviceAuthData(request), model: movement }));
    },
    /** Resolves an idempotency key from route headers or operation payload. @param {Object} request Request. @returns {string} Key. */
    idempotencyKey: function (request) {
        const payload = request.payload || {};
        return request.idempotencyKey || payload.idempotencyKey || [request.tenant, request.balanceCode, request.actionCode, payload.referenceCode || payload.reasonCode || payload.quantity].join(':');
    },
    /** Computes stock deltas for one supported Inventory operation. @param {Object} request Request. @returns {Object} Operation delta. */
    operationDelta: function (request) {
        const payload = request.payload || {}, action = String(request.actionCode || payload.actionCode || '').toUpperCase();
        const amount = this.quantity(payload.quantity);
        if (amount <= 0 && action !== 'ADJUST') throw new Error('Positive quantity is required for this Inventory operation');
        if (action === 'RECEIVE') return { movementType: 'RECEIPT', onHandDelta: amount, availableDelta: amount };
        if (action === 'ADJUST') return { movementType: 'ADJUST', onHandDelta: amount, availableDelta: amount };
        if (action === 'RETURN') return { movementType: 'RETURN', onHandDelta: amount, availableDelta: amount };
        throw new Error('Unsupported Inventory operation action');
    },
    /** Executes a bounded BackOffice stock operation. @param {Object} request Request. @returns {Promise<Object>} Operation evidence. */
    balanceAction: async function (request) {
        if (!request.balanceCode) throw new Error('Inventory balance code is required');
        if (!request.idempotencyKey && !(request.payload && request.payload.idempotencyKey)) throw new Error('Idempotency-Key is required');
        const balance = await this.getBalance(request), delta = this.operationDelta(request), payload = request.payload || {};
        const before = Object.assign({}, balance), now = this.schemaDate(request.now);
        const after = Object.assign({}, balance, {
            onHand: this.stockValue(this.quantity(balance.onHand) + delta.onHandDelta),
            available: this.stockValue(this.quantity(balance.available) + delta.availableDelta),
            revision: Number(balance.revision || 0) + 1,
            updated: now
        });
        const idempotencyKey = this.idempotencyKey(request);
        const movement = {
            code: ['inventoryMovement', crypto.createHash('sha1').update([request.tenant, balance.code, request.actionCode, idempotencyKey].join('|')).digest('hex')].join(':'),
            tenant: request.tenant,
            enterpriseCode: request.enterpriseCode || balance.enterpriseCode,
            warehouseCode: balance.warehouseCode,
            sku: balance.sku,
            quantity: this.stockValue(delta.onHandDelta),
            movementType: delta.movementType,
            referenceCode: payload.referenceCode || idempotencyKey,
            balanceRevision: after.revision,
            occurredAt: now,
            correlationId: request.correlationId || request.requestId || idempotencyKey,
            active: true,
            created: now,
            updated: now
        };
        const savedBalance = await this.saveBalance(request, after);
        const savedMovement = await this.saveMovement(request, movement);
        return { tenant: request.tenant, actionCode: request.actionCode, balance: savedBalance || after, movement: savedMovement || movement, before, operator: request.actorId };
    }
};

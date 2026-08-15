/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/service/defaultOrderCustomerApiService @description Builds customer-safe Order detail and history projections from Order-owned generated services. @layer service @owner order */
module.exports = {
    /** Unwraps generated service responses. @param {*} response Generated response. @returns {*} Unwrapped result. */
    unwrap: function (response) { return response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response; },
    /** Normalizes generated read result to an array. @param {*} result Generated result. @returns {Array} Array result. */
    array: function (result) { return Array.isArray(result) ? result : result ? [result] : []; },
    /** Returns a bounded page size. @param {*} value Input value. @returns {number} Safe page size. */
    pageSize: function (value) { return Math.min(Math.max(Number(value || 20), 1), 100); },
    /** Builds a customer-safe access denial without revealing whether another customer's order exists. @returns {Error} Access denial. */
    accessDeniedError: function () {
        return typeof CLASSES !== 'undefined' && CLASSES.NodicsError ?
            new CLASSES.NodicsError('ERR_AUTH_00003', 'current user do not have access to this resource') :
            new Error('Customer Order not found');
    },
    /** Builds service credentials for owner-bounded operational order reads. @param {Object} request Customer request. @returns {Object} Service auth data. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            principalId: 'commerceOrderCustomerApiService',
            code: 'commerceOrderCustomerApiService',
            loginId: 'commerceOrderCustomerApiService',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },
    /** Reads customer-owned orders with bounded filters. @param {Object} request Customer request. @returns {Promise<Array>} Orders. */
    orders: async function (request) {
        const query = { tenant: request.tenant, ownerId: request.ownerId };
        if (request.orderCode) query.code = request.orderCode;
        const response = await SERVICE.DefaultCommerceOrderService.get({ tenant: request.tenant, authData: this.serviceAuthData(request), query, pageSize: this.pageSize(request.query && request.query.limit) });
        return this.array(this.unwrap(response));
    },
    /** Reads customer-safe order entries. @param {Object} request Customer request. @param {string} orderCode Order code. @returns {Promise<Array>} Entries. */
    entries: async function (request, orderCode) {
        const response = await SERVICE.DefaultCommerceOrderEntryService.get({ tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, ownerId: request.ownerId, orderCode }, pageSize: 500 });
        return this.array(this.unwrap(response));
    },
    /** Reads customer-visible lifecycle requests for an order. @param {Object} request Customer request. @param {string} orderCode Order code. @returns {Promise<Array>} Lifecycle records. */
    lifecycle: async function (request, orderCode) {
        if (!SERVICE.DefaultOrderLifecycleRequestService || typeof SERVICE.DefaultOrderLifecycleRequestService.get !== 'function') return [];
        const response = await SERVICE.DefaultOrderLifecycleRequestService.get({ tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, ownerId: request.ownerId, orderCode }, pageSize: 100 });
        return this.array(this.unwrap(response));
    },
    /** Builds one customer-safe Order detail response. @param {Object} request Customer request. @returns {Promise<Object>} Order detail. */
    read: async function (request) {
        if (!request.orderCode) throw new Error('Order code is required');
        const order = (await this.orders(request))[0];
        if (!order) throw this.accessDeniedError();
        return Object.freeze({ order, entries: await this.entries(request, order.code), lifecycle: await this.lifecycle(request, order.code) });
    },
    /** Lists customer-safe Order summaries. @param {Object} request Customer request. @returns {Promise<Array>} Orders. */
    listOwn: function (request) { return this.orders(request); }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cart/src/facade/defaultCartCustomerFacade @description Enforces authenticated Cart ownership context. @layer facade @owner cart */
module.exports = {
    /** Applies authenticated customer context. @param {Object} request Nodics request. @returns {Object} Request. */
    applyContext: function (request) {
        const auth = request.authData || {};
        request.tenant = auth.tenant || request.tenant;
        request.ownerId = auth.principalId || auth.code || auth.loginId || request.ownerId;
        if (!request.tenant || !request.ownerId) throw new Error('Authenticated tenant and customer are required');
        return request;
    },
    /** Creates a cart. @param {Object} request Nodics request. @returns {Promise<Object>} Cart response. */
    create: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCartOperationService.create(this.applyContext(request))); },
    /** Reads a cart. @param {Object} request Nodics request. @returns {Promise<Object>} Cart response. */
    read: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCartOperationService.read(this.applyContext(request))); },
    /** Adds a cart entry. @param {Object} request Nodics request. @returns {Promise<Object>} Cart response. */
    addEntry: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCartOperationService.addEntry(this.applyContext(request))); },
    /** Updates a cart entry. @param {Object} request Nodics request. @returns {Promise<Object>} Cart response. */
    updateEntry: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCartOperationService.updateEntry(this.applyContext(request))); },
    /** Removes a cart entry. @param {Object} request Nodics request. @returns {Promise<Object>} Cart response. */
    removeEntry: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCartOperationService.removeEntry(this.applyContext(request))); },
    /** Calculates a cart. @param {Object} request Nodics request. @returns {Promise<Object>} Cart response. */
    calculate: function (request) { return Promise.resolve().then(() => SERVICE.DefaultCartOperationService.calculateDirect(this.applyContext(request))); }
};

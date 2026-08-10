/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/controller/defaultOrderLifecycleController @description Maps bounded HTTP lifecycle inputs to Order facade operations. @layer controller @owner order */
module.exports = {
    /** Maps HTTP input and invokes a lifecycle facade operation. @param {string} operation Operation. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Operation result. */
    invoke: function (operation, request, callback) {
        const http = request.httpRequest || {}; const params = http.params || {};
        request.orderCode = params.orderCode || request.orderCode; request.requestCode = params.requestCode || request.requestCode; request.actionCode = params.actionCode || request.actionCode;
        request.payload = http.body || request.payload || {}; request.query = http.query || request.query || {};
        request.idempotencyKey = request.idempotencyKey || (http.headers && http.headers['idempotency-key']);
        const promise = FACADE.DefaultOrderLifecycleFacade[operation](request).then(data => ({ data }));
        if (!callback) return promise; promise.then(value => callback(null, value)).catch(callback);
    },
    /** Previews lifecycle eligibility. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Preview. */
    preview: function (request, callback) { return this.invoke('preview', request, callback); },
    /** Creates a lifecycle request. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Created request. */
    create: function (request, callback) { return this.invoke('create', request, callback); },
    /** Lists owned lifecycle requests. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Results. */
    listOwn: function (request, callback) { return this.invoke('listOwn', request, callback); },
    /** Lists operator lifecycle requests. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Results. */
    list: function (request, callback) { return this.invoke('list', request, callback); },
    /** Applies an operator action. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Updated request. */
    action: function (request, callback) { return this.invoke('action', request, callback); }
};

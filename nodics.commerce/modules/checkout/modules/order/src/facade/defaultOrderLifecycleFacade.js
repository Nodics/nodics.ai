/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/facade/defaultOrderLifecycleFacade @description Enforces tenant and principal context before Order lifecycle services. @layer facade @owner order */
module.exports = {
    /** Enriches an operation with trusted principal context. @param {string} operation Operation. @param {Object} request Request. @returns {Promise<Object>} Result. */
    invoke: function (operation, request) {
        const auth = request.authData || {}; request.tenant = auth.tenant || request.tenant;
        request.actorId = auth.principalId || auth.code || request.actorId; request.ownerId = auth.principalId || auth.code || request.ownerId;
        if (!request.tenant || !request.actorId) return Promise.reject(new Error('Authenticated tenant and principal are required'));
        return SERVICE.DefaultOrderLifecycleApiService[operation](request);
    },
    /** Previews an owned lifecycle request. @param {Object} request Request. @returns {Promise<Object>} Preview. */
    preview: function (request) { return this.invoke('preview', request); },
    /** Creates an owned lifecycle request. @param {Object} request Request. @returns {Promise<Object>} Created request. */
    create: function (request) { return this.invoke('create', request); },
    /** Lists requests owned by the principal. @param {Object} request Request. @returns {Promise<Array>} Results. */
    listOwn: function (request) { return this.invoke('listOwn', request); },
    /** Lists operator lifecycle requests. @param {Object} request Request. @returns {Promise<Array>} Results. */
    list: function (request) { return this.invoke('list', request); },
    /** Applies a maker-checker action. @param {Object} request Request. @returns {Promise<Object>} Updated request. */
    action: function (request) { return this.invoke('action', request); }
};

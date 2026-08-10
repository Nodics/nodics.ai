/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module order/src/service/defaultOrderLifecycleRepositoryService @description Adapts generated Order lifecycle persistence to bounded tenant operations. @layer service @owner order */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
    /** Lists bounded lifecycle records. @param {string} tenant Tenant. @param {Object} query Query. @param {Object} authData Auth context. @param {number} limit Limit. @returns {Promise<Array>} Records. */
    list: function (tenant, query, authData, limit) { return SERVICE.DefaultOrderLifecycleRequestService.get({ tenant, authData, query: Object.assign({ tenant }, query), pageSize: Math.min(Number(limit || 50), 100) }).then(this.unwrap); },
    /** Gets one lifecycle record. @param {string} tenant Tenant. @param {string} code Code. @param {Object} authData Auth context. @returns {Promise<Object>} Record. */
    get: function (tenant, code, authData) { return this.list(tenant, { code }, authData, 1).then(items => Array.isArray(items) ? items[0] : items); },
    /** Saves a lifecycle record. @param {string} tenant Tenant. @param {Object} model Model. @param {Object} authData Auth context. @returns {Promise<Object>} Stored record. */
    save: function (tenant, model, authData) { return SERVICE.DefaultOrderLifecycleRequestService.save({ tenant, authData, model }).then(this.unwrap); },
    /** Updates a lifecycle record optimistically. @param {string} tenant Tenant. @param {Object} record Current record. @param {Object} patch Patch. @param {Object} authData Auth context. @returns {Promise<Object>} Updated record. */
    update: function (tenant, record, patch, authData) { return SERVICE.DefaultOrderLifecycleRequestService.update({ tenant, authData, query: { tenant, code: record.code, revision: record.revision }, model: { $set: patch } }).then(this.unwrap); }
};

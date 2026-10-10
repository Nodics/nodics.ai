/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const { isDeepStrictEqual } = require('node:util');
/** @module order/src/service/defaultOrderLifecycleRepositoryService @description Adapts generated Order lifecycle persistence to bounded tenant operations. @layer service @owner order */
module.exports = {
    /** Unwraps a standard result envelope while preserving raw provider values. */
    unwrap: function (response) { return response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response; },
    /** Requires an affirmative generated-owner envelope before interpreting write or read evidence. */
    confirmedResult: function (response) {
        if (!response || !/^SUC_/.test(response.code || '') || response.error || response.success === false ||
            response.acknowledged === false || response.errors && (!Array.isArray(response.errors) || response.errors.length > 0))
            throw new Error('Lifecycle persistence is unconfirmed; reread and reconcile the original request');
        return this.unwrap(response);
    },
    /** Lists bounded lifecycle records. @param {string} tenant Tenant. @param {Object} query Query. @param {Object} authData Auth context. @param {number} limit Limit. @returns {Promise<Array>} Records. */
    list: function (tenant, query, authData, limit) { return SERVICE.DefaultOrderLifecycleRequestService.get({ tenant, authData, query: Object.assign({ tenant }, query), pageSize: Math.min(Number(limit || 50), 100) }).then(this.unwrap); },
    /** Gets one lifecycle record. @param {string} tenant Tenant. @param {string} code Code. @param {Object} authData Auth context. @returns {Promise<Object>} Record. */
    get: function (tenant, code, authData) { return this.list(tenant, { code }, authData, 1).then(items => Array.isArray(items) ? items[0] : items); },
    /** Saves a lifecycle record. @param {string} tenant Tenant. @param {Object} model Model. @param {Object} authData Auth context. @returns {Promise<Object>} Stored record. */
    save: function (tenant, model, authData) { return SERVICE.DefaultOrderLifecycleRequestService.save({ tenant, authData, model }).then(this.unwrap); },
    /** Updates a lifecycle record optimistically. @param {string} tenant Tenant. @param {Object} record Current record. @param {Object} patch Patch. @param {Object} authData Auth context. @returns {Promise<Object>} Updated record. */
    update: async function (tenant, record, patch, authData) {
        const fail = () => { throw new Error('Lifecycle persistence is unconfirmed; reread and reconcile the original request'); };
        if (typeof tenant !== 'string' || !tenant || record.tenant !== tenant || typeof record.code !== 'string' || !record.code ||
            !Number.isSafeInteger(record.revision) || record.revision < 0 || record.revision >= Number.MAX_SAFE_INTEGER ||
            patch.revision !== record.revision + 1 ||
            ['tenant', 'code', 'enterpriseCode', 'ownerId', 'orderCode'].some(key => patch[key] !== undefined && patch[key] !== record[key])) fail();
        const owner = SERVICE.DefaultOrderLifecycleRequestService;
        const result = this.confirmedResult(await owner.update({ tenant, authData,
            options: { recursive: false, skipItemCache: true },
            query: { tenant, code: record.code, revision: record.revision }, model: { $set: patch } }));
        if (result?.acknowledged !== true || result.matchedCount !== 1 || result.modifiedCount !== 1 ||
            result.upsertedCount > 0 || result.upsertedId != null) fail();
        const rows = this.confirmedResult(await owner.get({ tenant, authData,
            options: { recursive: false, skipItemCache: true },
            query: { tenant, code: record.code, revision: patch.revision },
            searchOptions: { pageSize: 2, limit: 2, pageNumber: 1 } }));
        if (!Array.isArray(rows) || rows.length !== 1) fail();
        const stored = rows[0];
        if (['tenant', 'code', 'enterpriseCode', 'ownerId', 'orderCode'].some(key => stored[key] !== record[key]) ||
            Object.entries(patch).some(([key, value]) => !isDeepStrictEqual(stored[key], value))) fail();
        return stored;
    }
};

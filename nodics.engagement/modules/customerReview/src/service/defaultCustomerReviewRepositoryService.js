/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
/** @module customerReview/src/service/defaultCustomerReviewRepositoryService @description Adapts generated review persistence with mandatory tenant filters and internal service identity. @layer service @owner customerReview @override Storage adapters may replace this service without weakening tenant or immutable evidence contracts. */
module.exports = {
    /** Returns internal generated-service access. */
    internalAccess: function () { return { userGroups: ['serviceAccountUserGroup'] }; },
    /** Resolves a generated review schema service. */
    service: function (type) { let name = 'Default' + type.charAt(0).toUpperCase() + type.slice(1) + 'Service'; if (!SERVICE[name]) throw SERVICE.DefaultCustomerReviewGovernanceService.error('ERR_REVIEW_00001', 'review persistence unavailable'); return SERVICE[name]; },
    /** Adds standard persistence fields. */
    model: function (value) { let now = new Date(); return Object.assign({ active: true, code: crypto.randomUUID(), created: now, updated: now }, value); },
    /** Saves one tenant-scoped record. */
    save: function (type, tenant, value, authData) { if (!tenant || tenant !== value.tenant) return Promise.reject(SERVICE.DefaultCustomerReviewGovernanceService.error('ERR_REVIEW_00011', 'tenant mismatch')); return this.service(type).save({ tenant: tenant, authData: authData || this.internalAccess(), model: this.model(value) }).then(response => response.result || response); },
    /** Gets one tenant-scoped record. */
    get: function (type, tenant, code, authData) { return this.service(type).get({ tenant: tenant, authData: authData || this.internalAccess(), query: { tenant: tenant, code: code }, searchOptions: { limit: 1 } }).then(response => (response.result || [])[0]); },
    /** Lists one bounded tenant-scoped record set. */
    list: function (type, tenant, query, authData, limit) { return this.service(type).get({ tenant: tenant, authData: authData || this.internalAccess(), query: Object.assign({ tenant: tenant }, query || {}), searchOptions: { limit: Math.min(Number(limit || 25), 100) } }).then(response => response.result || []); }
};

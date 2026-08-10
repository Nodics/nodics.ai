/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
/** @module contactSubmission/src/service/defaultContactEngagementRepositoryService @description Adapts generated Core submission persistence to tenant-scoped intake operations. @layer service @owner contactSubmission @override Storage implementations may replace this adapter while preserving idempotency scope. */
module.exports = {
    /** Handles internal access within the module-owned contract. */
    internalAccess: function () { return { userGroups: ['serviceAccountUserGroup'] }; },
    /** Handles persistence model within the module-owned contract. */
    persistenceModel: function (model) { let now = new Date(); let value = Object.assign({ active: true, code: crypto.randomUUID(), created: now, updated: now, legalHold: false }, model); ['receivedAt', 'closedAt'].forEach(key => { if (value[key] && !(value[key] instanceof Date)) value[key] = new Date(value[key]); }); return value; },
    /** Handles find by idempotency key within the module-owned contract. */
    findByIdempotencyKey: function (tenant, idempotencyKey) { return SERVICE.DefaultEngagementSubmissionService.get({ tenant: tenant, authData: this.internalAccess(), query: { tenant: tenant, idempotencyKey: idempotencyKey } }).then(response => (response.result || [])[0]); },
    /** Handles create within the module-owned contract. */
    create: function (model) { return SERVICE.DefaultEngagementSubmissionService.save({ tenant: model.tenant, authData: this.internalAccess(), model: this.persistenceModel(model) }).then(response => response.result || response); }
};

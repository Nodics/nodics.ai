/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
/** @module contactSubmission/src/service/defaultContactRequestRepositoryService @description Adapts generated contact persistence while forcing tenant criteria. @layer service @owner contactSubmission @override Storage adapters may replace this service without weakening tenant filters. */
module.exports = {
    /** Handles internal access within the module-owned contract. */
    internalAccess: function () { return { userGroups: ['serviceAccountUserGroup'] }; },
    /** Handles persistence model within the module-owned contract. */
    persistenceModel: function (model) { let now = new Date(); let value = Object.assign({ active: true, code: crypto.randomUUID(), created: now, updated: now }, model); ['dueAt', 'submittedAt', 'resolvedAt', 'closedAt'].forEach(key => { if (value[key] && !(value[key] instanceof Date)) value[key] = new Date(value[key]); }); return value; },
    /** Handles create within the module-owned contract. */
    create: function (model) { return SERVICE.DefaultContactRequestService.save({ tenant: model.tenant, authData: this.internalAccess(), model: this.persistenceModel(model) }).then(response => response.result || response); },
    /** Handles list within the module-owned contract. */
    list: function (request) {
        let input = request.query || {}; let query = { tenant: request.tenant };
        ['code', 'status', 'type', 'reasonCode', 'queueCode', 'teamCode', 'priorityCode', 'ownerId'].forEach(key => { if (input[key] !== undefined) query[key] = input[key]; });
        return SERVICE.DefaultContactRequestService.get({ tenant: request.tenant, authData: request.authData, query: query, searchOptions: { pageSize: Number(input.limit || 25), pageNumber: Number(input.page || 1), sort: { submittedAt: -1 } } }).then(response => response.result || []);
    },
    /** Handles get within the module-owned contract. */
    get: function (request) { return SERVICE.DefaultContactRequestService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, code: request.submissionCode } }).then(response => (response.result || [])[0]); },
    /** Handles find by engagement submission code within the module-owned contract. */
    findByEngagementSubmissionCode: function (tenant, code) { return SERVICE.DefaultContactRequestService.get({ tenant: tenant, authData: this.internalAccess(), query: { tenant: tenant, engagementSubmissionCode: code } }).then(response => (response.result || [])[0]); },
    /** Handles save within the module-owned contract. */
    save: function (request, model) { return SERVICE.DefaultContactRequestService.save({ tenant: request.tenant, authData: request.authData, model: this.persistenceModel(model) }).then(response => response.result || response); }
};

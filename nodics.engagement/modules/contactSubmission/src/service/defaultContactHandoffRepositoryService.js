/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
/** @module contactSubmission/src/service/defaultContactHandoffRepositoryService @description Persists content-free provider handoff state for retry and reconciliation recovery. @layer service @owner contactSubmission @override Provider integrations may replace storage while preserving tenant and correlation boundaries. */
module.exports = {
    /** Handles internal access within the module-owned contract. */
    internalAccess: function () { return { userGroups: ['serviceAccountUserGroup'] }; },
    /** Handles affected within the module-owned contract. */
    affected: function (response) { let value = response && (response.result || response); return Number(value && (value.modifiedCount === undefined ? value.nModified === undefined ? value.n : value.nModified : value.modifiedCount) || 0); },
    /** Handles date value within the module-owned contract. */
    dateValue: function (value) { return value && !(value instanceof Date) ? new Date(value) : value; },
    /** Handles create within the module-owned contract. */
    create: function (model) {
        let now = new Date();
        let value = Object.assign({ active: true, code: crypto.randomUUID(), created: now, updated: now }, model);
        ['updatedAt', 'nextRetryAt', 'lastAttemptAt', 'completedAt', 'leaseExpiresAt'].forEach(key => { value[key] = this.dateValue(value[key]); });
        return SERVICE.DefaultContactHandoffService.save({ tenant: value.tenant, authData: this.internalAccess(), model: value }).then(response => response.result || response);
    },
    /** Handles list recoverable within the module-owned contract. */
    listRecoverable: function (tenant) { return SERVICE.DefaultContactHandoffService.get({ tenant: tenant, authData: this.internalAccess(), query: { tenant: tenant, status: { $in: ['PENDING', 'RETRY_PENDING', 'IN_PROGRESS'] } } }).then(response => response.result || []); },
    /** Handles get within the module-owned contract. */
    get: function (tenant, code) { return SERVICE.DefaultContactHandoffService.get({ tenant: tenant, authData: this.internalAccess(), query: { tenant: tenant, code: code } }).then(response => (response.result || [])[0]); },
    /** Handles claim within the module-owned contract. */
    claim: function (record, workerId, now, leaseMs) {
        let allowedStatus = record.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : record.status;
        return SERVICE.DefaultContactHandoffService.update({ tenant: record.tenant, authData: this.internalAccess(), query: { tenant: record.tenant, code: record.code, status: allowedStatus, revision: record.revision }, model: { $set: { status: 'IN_PROGRESS', leaseOwner: workerId, leaseExpiresAt: new Date(now.getTime() + leaseMs), lastAttemptAt: now, updatedAt: now, revision: Number(record.revision || 0) + 1 } } }).then(response => this.affected(response) === 1);
    },
    /** Handles complete within the module-owned contract. */
    complete: function (record, workerId, result, now) { return SERVICE.DefaultContactHandoffService.update({ tenant: record.tenant, authData: this.internalAccess(), query: { tenant: record.tenant, code: record.code, status: 'IN_PROGRESS', leaseOwner: workerId, revision: Number(record.revision || 0) + 1 }, model: { $set: { status: 'SUCCEEDED', provider: result.provider, externalReference: result.reference, attempts: Number(record.attempts || 0) + 1, revision: Number(record.revision || 0) + 2, completedAt: now, updatedAt: now }, $unset: { leaseOwner: '', leaseExpiresAt: '', nextRetryAt: '', lastErrorCode: '' } } }).then(response => this.affected(response) === 1); },
    /** Handles fail within the module-owned contract. */
    fail: function (record, workerId, failure, now) { return SERVICE.DefaultContactHandoffService.update({ tenant: record.tenant, authData: this.internalAccess(), query: { tenant: record.tenant, code: record.code, status: 'IN_PROGRESS', leaseOwner: workerId, revision: Number(record.revision || 0) + 1 }, model: { $set: { status: failure.status, attempts: failure.attempts, revision: Number(record.revision || 0) + 2, nextRetryAt: failure.nextRetryAt, lastErrorCode: failure.errorCode, updatedAt: now }, $unset: { leaseOwner: '', leaseExpiresAt: '' } } }).then(response => this.affected(response) === 1); },
    /** Handles reset within the module-owned contract. */
    reset: function (record, now) { return SERVICE.DefaultContactHandoffService.update({ tenant: record.tenant, authData: this.internalAccess(), query: { tenant: record.tenant, code: record.code, revision: record.revision }, model: { $set: { status: 'RETRY_PENDING', nextRetryAt: now, revision: Number(record.revision || 0) + 1, updatedAt: now }, $unset: { leaseOwner: '', leaseExpiresAt: '', lastErrorCode: '' } } }).then(response => this.affected(response) === 1); },
    /** Handles reconciled within the module-owned contract. */
    reconciled: function (record, result, now) { return SERVICE.DefaultContactHandoffService.update({ tenant: record.tenant, authData: this.internalAccess(), query: { tenant: record.tenant, code: record.code, revision: record.revision }, model: { $set: { status: 'RECONCILED', provider: result.provider || record.provider, externalReference: result.reference || record.externalReference, completedAt: now, revision: Number(record.revision || 0) + 1, updatedAt: now }, $unset: { leaseOwner: '', leaseExpiresAt: '', nextRetryAt: '', lastErrorCode: '' } } }).then(response => this.affected(response) === 1); }
};

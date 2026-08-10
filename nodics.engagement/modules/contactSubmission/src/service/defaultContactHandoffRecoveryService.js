/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
/** @module contactSubmission/src/service/defaultContactHandoffRecoveryService @description Claims, retries, dead-letters, repairs, and reconciles persisted provider handoffs with bounded concurrency. @layer service @owner contactSubmission @override Customer layers may replace scheduling or adapters while retaining leases, revisions, and provider authority. */
module.exports = {
    /** Handles now within the module-owned contract. */
    now: function (request) { return request && request.clock && request.clock.now ? request.clock.now() : new Date(); },
    /** Handles configuration within the module-owned contract. */
    configuration: function () { return (CONFIG.get('contactSubmission') || {}).handoffRecovery || {}; },
    /** Handles adapter within the module-owned contract. */
    adapter: function (record, context) { if (context && context.adapter) return context.adapter; if (record.targetType === 'PROCESS') return SERVICE.DefaultProcessHandoffAdapterService; let error = new Error('handoff adapter unavailable'); error.code = 'HANDOFF_ADAPTER_UNAVAILABLE'; throw error; },
    /** Handles ready within the module-owned contract. */
    ready: function (record, now) { if (record.status === 'PENDING') return true; if (record.status === 'RETRY_PENDING') return !record.nextRetryAt || new Date(record.nextRetryAt) <= now; return record.status === 'IN_PROGRESS' && record.leaseExpiresAt && new Date(record.leaseExpiresAt) <= now; },
    /** Handles failure within the module-owned contract. */
    failure: function (record, error, now, configuration) { let attempts = Number(record.attempts || 0) + 1; let maximum = Number(configuration.maximumAttempts || 5); if (attempts >= maximum) return { status: 'DEAD_LETTER', attempts: attempts, nextRetryAt: now, errorCode: error.code || 'HANDOFF_FAILED' }; let delay = Math.min(Number(configuration.maximumBackoffMs || 300000), Number(configuration.baseBackoffMs || 1000) * Math.pow(2, Math.max(0, attempts - 1))); return { status: 'RETRY_PENDING', attempts: attempts, nextRetryAt: new Date(now.getTime() + delay), errorCode: error.code || 'HANDOFF_FAILED' }; },
    /** Handles process within the module-owned contract. */
    process: async function (record, request, context) { let repository = context.repository; let configuration = context.configuration; let now = this.now(request); let workerId = context.workerId; let claimed = await repository.claim(record, workerId, now, Number(configuration.leaseMs || 30000)); if (!claimed) return { code: record.code, outcome: 'SKIPPED' }; try { let adapter = this.adapter(record, context); let result = await adapter.send({ tenant: record.tenant, contactRequestCode: record.contactRequestCode, definitionCode: (CONFIG.get('contactSubmission') || {}).processDefinitionCode, correlationId: record.correlationId }, request); let completed = await repository.complete(record, workerId, result, this.now(request)); return { code: record.code, outcome: completed ? 'SUCCEEDED' : 'LOST_LEASE', externalReference: result.reference }; } catch (error) { let failure = this.failure(record, error, this.now(request), configuration); let persisted = await repository.fail(record, workerId, failure, this.now(request)); return { code: record.code, outcome: persisted ? failure.status : 'LOST_LEASE', errorCode: failure.errorCode }; } },
    /** Handles run within the module-owned contract. */
    run: async function (request, context) { let configuration = context && context.configuration || this.configuration(); let repository = context && context.repository || SERVICE.DefaultContactHandoffRepositoryService; let now = this.now(request); let records = (await repository.listRecoverable(request.tenant)).filter(record => this.ready(record, now)).slice(0, Number(configuration.batchSize || 25)); let workerId = request.workerId || 'engagement:' + crypto.randomUUID(); let runtime = { repository: repository, configuration: configuration, workerId: workerId, adapter: context && context.adapter }; let results = []; for (let record of records) results.push(await this.process(record, request, runtime)); return { workerId: workerId, examined: records.length, succeeded: results.filter(item => item.outcome === 'SUCCEEDED').length, retryPending: results.filter(item => item.outcome === 'RETRY_PENDING').length, deadLetter: results.filter(item => item.outcome === 'DEAD_LETTER').length, skipped: results.filter(item => ['SKIPPED', 'LOST_LEASE'].includes(item.outcome)).length, results: results }; },
    /** Handles retry within the module-owned contract. */
    retry: async function (request, context) { let repository = context && context.repository || SERVICE.DefaultContactHandoffRepositoryService; let record = await repository.get(request.tenant, request.handoffCode); if (!record || !['FAILED', 'DEAD_LETTER', 'RETRY_PENDING'].includes(record.status)) { let error = new Error('handoff cannot be retried'); error.code = 'ERR_CONTACT_00007'; throw error; } let changed = await repository.reset(record, this.now(request)); return { code: record.code, status: changed ? 'RETRY_PENDING' : 'CONFLICT' }; },
    /** Handles reconcile within the module-owned contract. */
    reconcile: async function (request, context) { let repository = context && context.repository || SERVICE.DefaultContactHandoffRepositoryService; let record = await repository.get(request.tenant, request.handoffCode); if (!record || !record.externalReference) { let error = new Error('handoff cannot be reconciled'); error.code = 'ERR_CONTACT_00008'; throw error; } let adapter = this.adapter(record, context); let result = await adapter.lookup(record, request); if (!result.terminal) return { code: record.code, status: result.status || record.status, reconciled: false }; let changed = await repository.reconciled(record, result, this.now(request)); return { code: record.code, status: changed ? 'RECONCILED' : 'CONFLICT', reconciled: changed };
    }
};

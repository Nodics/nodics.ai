/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');
const _ = require('lodash');
const BSON = require('bson');

/**
 * @module import/service/history/DefaultInstalledMigrationJournalService
 * @description Strict installed migration evidence in the existing importRun authority.
 * This internal port journals intent; it neither authorizes nor executes data effects.
 * @layer service
 * @owner import
 * @override Later layers may extend validation while retaining atomic, durable evidence.
 */
module.exports = {
    /** Creates a module-owned import error without suppressing provider failures. */
    fail: function (message) {
        const ErrorType = typeof CLASSES !== 'undefined' && CLASSES.DataImportError;
        const error = ErrorType ? new ErrorType('ERR_IMP_00002', message) : new Error(message);
        error.code = 'ERR_IMP_00002';
        return error;
    },

    /** Canonicalizes JSON evidence, rejecting lossy, executable or ambiguous values. */
    canonical: function (value, ancestors = new Set()) {
        if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
        if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
        if ((!Array.isArray(value) && !_.isPlainObject(value)) || ancestors.has(value)) {
            throw this.fail('Migration evidence must be acyclic plain JSON');
        }
        if (Object.getOwnPropertySymbols(value).length) throw this.fail('Migration evidence contains symbol keys');
        ancestors.add(value);
        let result;
        if (Array.isArray(value)) {
            if (Object.keys(value).length !== value.length) throw this.fail('Migration evidence contains sparse or decorated arrays');
            result = '[' + Array.from(value, item => this.canonical(item, ancestors)).join(',') + ']';
        } else {
            result = '{' + Object.keys(value).sort().map(key => {
                const descriptor = Object.getOwnPropertyDescriptor(value, key);
                if (!Object.prototype.hasOwnProperty.call(descriptor, 'value') || ['__proto__', 'constructor', 'prototype'].includes(key)) {
                    throw this.fail('Migration evidence contains unsafe properties');
                }
                return JSON.stringify(key) + ':' + this.canonical(descriptor.value, ancestors);
            }).join(',') + '}';
        }
        ancestors.delete(value);
        return result;
    },

    /** Returns a deterministic checksum for a plain immutable plan or operation. */
    checksum: function (value) {
        return crypto.createHash('sha256').update(this.canonical(value)).digest('hex');
    },

    /** Rejects oversized durable evidence before writes, retaining room for provider metadata. */
    assertEvidenceSize: function (record) {
        const bytes = BSON.calculateObjectSize(record);
        if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes + 1024 > 8 * 1024 * 1024) {
            throw this.fail('Migration evidence exceeds the 8 MiB journal budget; use compact batched evidence');
        }
    },

    /** Validates trusted orchestrator worker identity without inspecting or signalling processes. */
    workerIdentity: function (worker) {
        if (!_.isPlainObject(worker) || Object.keys(worker).length !== 2
            || !Number.isSafeInteger(worker.pid) || worker.pid < 1
            || typeof worker.hostname !== 'string' || !worker.hostname.trim()
            || worker.hostname !== worker.hostname.trim()) {
            throw this.fail('Migration worker requires a positive integer pid and explicit hostname');
        }
        return { pid: worker.pid, hostname: worker.hostname };
    },

    /** Requires explicit identity/provenance; never guesses a default tenant or actor. */
    identity: function (request) {
        if (!_.isPlainObject(request)) throw this.fail('Migration request is required');
        for (const key of ['tenant', 'migrationId', 'executionId', 'requestedBy', 'correlationId']) {
            if (typeof request[key] !== 'string' || !request[key].trim() || request[key] !== request[key].trim()) {
                throw this.fail('Migration requires explicit ' + key);
            }
        }
        if (!_.isPlainObject(request.plan) || !_.isPlainObject(request.plan.scope)
            || request.plan.scope.tenant !== request.tenant || Object.keys(request.plan.scope).length < 2) {
            throw this.fail('Migration plan requires an explicit tenant-matched target scope');
        }
        const plan = JSON.parse(this.canonical(request.plan));
        this.assertEvidenceSize({ plan: plan });
        const checksum = this.checksum(plan);
        if (request.checksum !== undefined && request.checksum !== checksum) throw this.fail('Migration plan checksum differs');
        if (request.replay !== undefined && typeof request.replay !== 'boolean') throw this.fail('Migration replay must be explicit boolean');
        const worker = request.worker === undefined ? null : this.workerIdentity(request.worker);
        return {
            code: 'installedMigration_' + this.checksum({ tenant: request.tenant, migrationId: request.migrationId }),
            tenant: request.tenant, migrationId: request.migrationId, executionId: request.executionId,
            plan: plan, checksum: checksum, worker: worker
        };
    },

    /** Resolves only the tenant-scoped generated importRun model, never caller persistence. */
    getMigrationModel: function (request) {
        if (typeof NODICS === 'undefined' || typeof NODICS.getModels !== 'function'
            || typeof UTILS === 'undefined' || typeof UTILS.createModelName !== 'function') {
            throw this.fail('Migration importRun model resolver is unavailable');
        }
        const models = NODICS.getModels('import', request.tenant);
        return models && models[UTILS.createModelName('importRun')];
    },

    /** Validates the selected persistence port even when its resolver is overridden. */
    requireMigrationModel: function (request) {
        const model = this.getMigrationModel(request);
        if (!model || typeof model.getItems !== 'function' || typeof model.compareAndSetItem !== 'function'
            || typeof model.persistenceCapabilities !== 'function'
            || model.versioned === true || (model.primaryKey && model.primaryKey !== 'code')) {
            throw this.fail('Migration importRun requires non-versioned atomic persistence');
        }
        const capabilities = model.persistenceCapabilities();
        if (!capabilities || capabilities.contractVersion !== 1 || capabilities.durableJournal !== true
            || capabilities.primaryMajorityReadback !== true) {
            throw this.fail('Migration importRun requires qualified durable journal and primary majority readback');
        }
        return model;
    },

    /** Validates the entire stored evidence, including checkpoint chain and immutable identity. */
    validateRecord: function (record, identity) {
        if (_.isPlainObject(record)) this.assertEvidenceSize(record);
        const migration = record && record.migration;
        if (!_.isPlainObject(record) || !record._id || record.code !== identity.code || record.runId !== identity.code
            || record.tenant !== identity.tenant || record.dataType !== 'INSTALLED_MIGRATION'
            || !['RUNNING', 'COMPLETED', 'ROLLED_BACK'].includes(record.status)
            || !Number.isSafeInteger(record.migrationRevision) || record.migrationRevision < 0
            || !Number.isSafeInteger(record.migrationAttempt) || record.migrationAttempt < 1
            || !_.isPlainObject(migration) || migration.contractVersion !== 1
            || migration.migrationId !== identity.migrationId || migration.executionId !== identity.executionId
            || migration.checksum !== identity.checksum || record.checksum !== identity.checksum
            || this.canonical(migration.plan) !== this.canonical(identity.plan)
            || this.checksum(migration.plan) !== migration.checksum
            || typeof record.requestedBy !== 'string' || !record.requestedBy.trim()
            || typeof record.correlationId !== 'string' || !record.correlationId.trim()
            || !Array.isArray(migration.entries) || migration.entries.length !== record.migrationRevision + 1) {
            throw this.fail('Missing, malformed or conflicting migration evidence');
        }
        let attempt = 1;
        if (migration.compensation != null) {
            this.validateCompensation(migration.compensation, identity);
            if (record.status === 'COMPLETED') throw this.fail('Compensation can terminate only as ROLLED_BACK');
        }
        if (!_.isEqual(migration.compensation || null, migration.entries[0].operation.compensation || null)) {
            throw this.fail('Migration compensation link differs from immutable begin evidence');
        }
        const initialWorker = migration.initialWorker == null ? null : this.workerIdentity(migration.initialWorker);
        const currentWorker = migration.worker == null ? null : this.workerIdentity(migration.worker);
        let worker = initialWorker;
        migration.entries.forEach((entry, index) => {
            if (!_.isPlainObject(entry) || entry.revision !== index || !_.isPlainObject(entry.operation)
                || entry.digest !== this.checksum(entry.operation) || typeof entry.recordedAt !== 'string'
                || !Number.isFinite(Date.parse(entry.recordedAt))) throw this.fail('Malformed migration checkpoint chain');
            const operation = entry.operation;
            const operationWorker = operation.worker == null ? null : this.workerIdentity(operation.worker);
            if (!['BEGIN', 'CHECKPOINT', 'RESUME'].includes(operation.kind)
                || (index === 0) !== (operation.kind === 'BEGIN')
                || typeof operation.requestedBy !== 'string' || !operation.requestedBy.trim()
                || typeof operation.correlationId !== 'string' || !operation.correlationId.trim()) {
                throw this.fail('Malformed migration operation provenance');
            }
            if (operation.kind === 'RESUME') {
                this.validateRecovery(operation.recovery, worker);
                if ((worker === null) !== (operationWorker === null)) throw this.fail('Migration worker tracking cannot change during resume');
                worker = operationWorker;
                attempt++;
            }
            if (!_.isEqual(operationWorker, worker)) throw this.fail('Migration worker differs from persisted checkpoint chain');
            if (operation.kind === 'CHECKPOINT') this.validateCheckpoint(operation.checkpoint);
            if (entry.attempt !== attempt || (index > 0 &&
                (operation.expectedRevision !== index - 1 || operation.expectedAttempt !== (operation.kind === 'RESUME' ? attempt - 1 : attempt)))) {
                throw this.fail('Malformed migration revision or attempt chain');
            }
            if (!['RUNNING', 'COMPLETED', 'ROLLED_BACK'].includes(operation.status)
                || (operation.status !== 'RUNNING' && (operation.kind !== 'CHECKPOINT' || operation.checkpoint.state !== 'VERIFIED'))
                || (index < migration.entries.length - 1 && operation.status !== 'RUNNING')) {
                throw this.fail('Malformed migration terminal evidence');
            }
        });
        if (!_.isEqual(worker, currentWorker) || attempt !== record.migrationAttempt || migration.entries.at(-1).operation.status !== record.status
            || migration.entries[0].operation.requestedBy !== record.requestedBy
            || migration.entries[0].operation.correlationId !== record.correlationId) {
            throw this.fail('Migration current state differs from persisted evidence');
        }
        return record;
    },

    /** Reads uncached persisted evidence; an empty result is allowed only before insert. */
    load: async function (model, identity, allowMissing = false) {
        const result = await model.getItems({ tenant: identity.tenant, query: { code: identity.code },
            internalPersistence: 'DURABLE_JOURNAL', searchOptions: { limit: 2 } });
        if (!_.isPlainObject(result) || !Array.isArray(result.result) || !Number.isSafeInteger(result.count)
            || result.count !== result.result.length || result.result.length > 1) {
            throw this.fail('Malformed migration read response');
        }
        if (!result.result.length) {
            if (allowMissing) return null;
            throw this.fail('Migration evidence is missing');
        }
        return this.validateRecord(result.result[0], identity);
    },

    /** Reads the exact stored migration without claiming, repairing or starting it. */
    readMigration: async function (request) {
        const identity = this.identity(request);
        return this.load(this.requireMigrationModel(request), identity);
    },

    /** Inserts a new plan exactly once; explicit same-execution replay is read-only. */
    beginMigration: async function (request) {
        if (request && (request.original !== undefined || request.compensationEvidence !== undefined)) {
            throw this.fail('Linked compensation requires beginCompensation');
        }
        return this.beginRecord(request, null);
    },

    /** Creates a separate rollback journal linked to terminal evidence; never reopens the original. */
    beginCompensation: async function (request) {
        const identity = this.identity(request);
        if (!_.isPlainObject(request.original) || !identity.worker
            || !/^[a-f0-9]{64}$/.test(request.original.checksum || '')
            || request.migrationId !== request.original.migrationId + '.compensation'
            || request.executionId === request.original.executionId) {
            throw this.fail('Compensation requires the reserved linked identity, a new execution and worker');
        }
        const originalIdentity = this.identity({ ...request, migrationId: request.original.migrationId,
            executionId: request.original.executionId, checksum: request.original.checksum });
        const original = await this.load(this.requireMigrationModel(request), originalIdentity);
        if (original.status !== 'COMPLETED' || original.migration.compensation != null) {
            throw this.fail('Compensation requires an original COMPLETED forward migration');
        }
        const link = {
            direction: 'rollback', originalCode: original.code,
            migrationId: originalIdentity.migrationId, executionId: originalIdentity.executionId,
            checksum: originalIdentity.checksum, status: original.status, revision: original.migrationRevision,
            scope: originalIdentity.plan.scope, evidence: request.compensationEvidence
        };
        this.validateCompensation(link, identity);
        return this.beginRecord(request, JSON.parse(this.canonical(link)));
    },

    /** Validates the immutable original link and trusted owner-supplied safety evidence. */
    validateCompensation: function (link, identity) {
        if (!_.isPlainObject(link) || link.direction !== 'rollback' || link.status !== 'COMPLETED'
            || typeof link.migrationId !== 'string' || !link.migrationId.trim()
            || typeof link.executionId !== 'string' || !link.executionId.trim()
            || identity.migrationId !== link.migrationId + '.compensation' || identity.executionId === link.executionId
            || link.checksum !== identity.checksum || !Number.isSafeInteger(link.revision) || link.revision < 1
            || link.originalCode !== 'installedMigration_' + this.checksum({ tenant: identity.tenant, migrationId: link.migrationId })
            || this.canonical(link.scope) !== this.canonical(identity.plan.scope)
            || !_.isPlainObject(link.evidence) || !_.isPlainObject(link.evidence.outage)
            || !Object.keys(link.evidence.outage).length || !_.isPlainObject(link.evidence.unchangedTargetState)
            || !Object.keys(link.evidence.unchangedTargetState).length) {
            throw this.fail('Compensation requires immutable original scope/checksum and verified outage/unchanged target evidence');
        }
        this.canonical(link);
    },

    /** Inserts immutable begin evidence after normal or linked-compensation validation. */
    beginRecord: async function (request, compensation) {
        const identity = this.identity(request);
        const model = this.requireMigrationModel(request);
        const current = await this.load(model, identity, true);
        if (current) {
            if (request.replay === true) {
                if (!_.isEqual(current.migration.compensation || null, compensation)) throw this.fail('Compensation replay link or evidence differs');
                if (!_.isEqual(identity.worker, current.migration.worker || null)) throw this.fail('Migration begin replay cannot change worker identity');
                return current;
            }
            throw this.fail('Migration already exists; explicit replay or resume is required');
        }
        if (request.replay === true) throw this.fail('Cannot replay missing migration evidence');
        const operation = { kind: 'BEGIN', requestedBy: request.requestedBy, correlationId: request.correlationId,
            status: 'RUNNING', worker: identity.worker, compensation: compensation };
        const record = {
            code: identity.code, runId: identity.code, tenant: identity.tenant, active: true,
            created: new Date(), updated: new Date(), createdBy: request.requestedBy, updatedBy: request.requestedBy,
            status: 'RUNNING', dataType: 'INSTALLED_MIGRATION', requestedBy: request.requestedBy,
            correlationId: request.correlationId, checksum: identity.checksum, migrationRevision: 0, migrationAttempt: 1,
            migration: {
                contractVersion: 1, migrationId: identity.migrationId, executionId: identity.executionId,
                plan: identity.plan, checksum: identity.checksum,
                initialWorker: identity.worker, worker: identity.worker,
                compensation: compensation,
                entries: [this.entry(operation, 0, 1)]
            }
        };
        return this.persist(model, identity, { operation: 'create', tenant: identity.tenant, model: record }, record);
    },

    /** Validates a non-empty domain-owned checkpoint payload; no domain effects run here. */
    validateCheckpoint: function (checkpoint) {
        if (!_.isPlainObject(checkpoint) || typeof checkpoint.code !== 'string' || !checkpoint.code.trim()
            || !['PREPARED', 'APPLIED', 'VERIFIED', 'FAILED'].includes(checkpoint.state)
            || !_.isPlainObject(checkpoint.evidence) || !Object.keys(checkpoint.evidence).length) {
            throw this.fail('Migration checkpoint requires code, state and non-empty evidence');
        }
        this.canonical(checkpoint);
    },

    /** Requires explicit stopped-worker evidence from the trusted maintenance orchestrator. */
    validateRecovery: function (recovery, previousWorker) {
        if (!_.isPlainObject(recovery) || recovery.previousWorkerStopped !== true
            || !_.isPlainObject(recovery.evidence) || !Object.keys(recovery.evidence).length) {
            throw this.fail('Migration resume requires verified stopped-worker evidence');
        }
        this.canonical(recovery);
        if (previousWorker && (recovery.evidence.pid !== previousWorker.pid
            || recovery.evidence.hostname !== previousWorker.hostname)) {
            throw this.fail('Migration recovery evidence must identify the previous worker pid and hostname');
        }
    },

    /** Persists intent before external effects, or records subsequent verification evidence. */
    checkpointMigration: async function (request) {
        this.identity(request);
        this.validateCheckpoint(request.checkpoint);
        const status = request.status === undefined ? 'RUNNING' : request.status;
        if (!['RUNNING', 'COMPLETED', 'ROLLED_BACK'].includes(status)
            || (status !== 'RUNNING' && request.checkpoint.state !== 'VERIFIED')) {
            throw this.fail('Terminal migration checkpoints require verified evidence');
        }
        return this.advance(request, { kind: 'CHECKPOINT', checkpoint: request.checkpoint, status: status });
    },

    /** Advances the attempt only after explicit recovery; execution and immutable plan never change. */
    resumeMigration: async function (request) {
        this.identity(request);
        this.validateRecovery(request.recovery);
        return this.advance(request, { kind: 'RESUME', recovery: request.recovery, status: 'RUNNING' });
    },

    /** Constructs one immutable, checksummed provenance entry. */
    entry: function (operation, revision, attempt) {
        return { revision: revision, attempt: attempt, recordedAt: new Date().toISOString(),
            digest: this.checksum(operation), operation: JSON.parse(this.canonical(operation)) };
    },

    /** Applies a single revision/attempt-fenced append, never silently retries stale writes. */
    advance: async function (request, details) {
        const identity = this.identity(request);
        if (!Number.isSafeInteger(request.expectedRevision) || request.expectedRevision < 0
            || request.expectedRevision >= Number.MAX_SAFE_INTEGER
            || !Number.isSafeInteger(request.expectedAttempt) || request.expectedAttempt < 1
            || request.expectedAttempt >= Number.MAX_SAFE_INTEGER) throw this.fail('Migration requires valid original revision and attempt');
        const operation = JSON.parse(this.canonical(Object.assign({}, details, {
            expectedRevision: request.expectedRevision, expectedAttempt: request.expectedAttempt,
            requestedBy: request.requestedBy, correlationId: request.correlationId, worker: identity.worker
        })));
        const model = this.requireMigrationModel(request);
        const current = await this.load(model, identity);
        if (request.replay === true) {
            if (current.migrationRevision === request.expectedRevision + 1
                && current.migration.entries.at(-1).digest === this.checksum(operation)) return current;
            throw this.fail('Migration replay does not match the exact persisted operation');
        }
        if (current.status !== 'RUNNING' || current.migrationRevision !== request.expectedRevision
            || current.migrationAttempt !== request.expectedAttempt) throw this.fail('Stale or terminal migration checkpoint');
        const previousWorker = current.migration.worker || null;
        if (current.migration.compensation && operation.status === 'COMPLETED') throw this.fail('Compensation can terminate only as ROLLED_BACK');
        if (details.kind === 'RESUME') {
            if ((previousWorker === null) !== (identity.worker === null)) throw this.fail('Migration worker tracking cannot change during resume');
            this.validateRecovery(operation.recovery, previousWorker);
        } else if (!_.isEqual(previousWorker, identity.worker)) {
            throw this.fail('Migration checkpoint requires the current worker identity');
        }
        const next = _.cloneDeep(current);
        next.migrationRevision++;
        if (details.kind === 'RESUME') next.migrationAttempt++;
        next.migration.worker = identity.worker;
        next.status = operation.status;
        next.updated = new Date();
        next.updatedBy = request.requestedBy;
        next.migration.entries.push(this.entry(operation, next.migrationRevision, next.migrationAttempt));
        const patch = _.pick(next, ['status', 'migration', 'migrationRevision', 'migrationAttempt', 'updated', 'updatedBy']);
        const query = {
            _id: current._id, code: identity.code, tenant: identity.tenant, status: 'RUNNING',
            migrationRevision: request.expectedRevision, migrationAttempt: request.expectedAttempt,
            'migration.executionId': identity.executionId, 'migration.checksum': identity.checksum
        };
        if (previousWorker) {
            query['migration.worker.pid'] = previousWorker.pid;
            query['migration.worker.hostname'] = previousWorker.hostname;
        }
        return this.persist(model, identity, { operation: 'update', tenant: identity.tenant, query: query, model: patch }, next);
    },

    /** Requires both an exact atomic postimage and matching independent persisted readback. */
    persist: async function (model, identity, input, expected) {
        this.assertEvidenceSize(expected);
        const result = await model.compareAndSetItem({ ...input, internalPersistence: 'DURABLE_JOURNAL' });
        if (result && (result.acknowledged === false || result.ok === 0)) throw this.fail('Unacknowledged migration write');
        const saved = this.validateRecord(result, identity);
        const keys = ['code', 'runId', 'tenant', 'status', 'dataType', 'requestedBy', 'correlationId',
            'checksum', 'migration', 'migrationRevision', 'migrationAttempt'];
        const expectedEvidence = this.canonical(_.pick(expected, keys));
        if ((expected._id && !_.isEqual(expected._id, saved._id))
            || this.canonical(_.pick(saved, keys)) !== expectedEvidence) throw this.fail('Migration write did not acknowledge exact evidence');
        const persisted = await this.load(model, identity);
        if (!_.isEqual(saved._id, persisted._id) || this.canonical(_.pick(persisted, keys)) !== expectedEvidence) {
            throw this.fail('Migration evidence changed or was not durably readable after write');
        }
        return persisted;
    }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * Nodics - Enterprise Micro-Services Management Framework
 * Copyright (c) 2026 Nodics. Governed by the root LICENSE.
 */

/**
 * @module mongodb/service/DefaultMongodbInstalledVersionMigrationService
 * @description Offline, checkpoint-gated installed version migration primitives.
 * @layer service
 * @owner mongodb
 * @override Later providers may extend these methods without weakening scope,
 * bounded evidence, exact-state verification or parent journal acknowledgement.
 */
const { createHash } = require('node:crypto');
const BSON = require('bson');
const _ = require('lodash');
const modelMethods = require('../../schemas/model').default;

module.exports = {
    /** Bind existing connection-handler output without initialization, discovery or persistence effects. */
    bindMaintenanceModel: function ({ connection, schema, scope, databaseOptions }) {
        this.assert(connection && connection.connection && typeof connection.connection.collection === 'function',
            'Existing connection-handler result required');
        this.assert(_.isPlainObject(schema) && _.isPlainObject(databaseOptions) && scope &&
            ['tenant', 'channel', 'schemaName', 'database', 'collection'].every(key =>
                typeof scope[key] === 'string' && scope[key].length > 0), 'Explicit maintenance binding metadata required');
        const db = connection.connection;
        this.assert(db.databaseName === scope.database, 'Maintenance database scope mismatch');
        const options = _.cloneDeep(databaseOptions);
        const dataBase = {
            getConnection: () => db,
            getOptions: () => options,
            getClient: () => connection.client,
            getCapabilities: () => connection.capabilities || {},
            getCollectionList: () => (connection.collections || []).map(item => typeof item === 'string' ? item : item.name)
        };
        const model = db.collection(scope.collection);
        Object.assign(model, modelMethods, {
            dataBase, rawSchema: schema, tenant: scope.tenant, channel: scope.channel,
            schemaName: scope.schemaName, modelName: scope.collection,
            versioned: schema.versioned === true, cache: false
        });
        const keys = schema.schemaOptions && schema.schemaOptions[scope.tenant] && schema.schemaOptions[scope.tenant].primaryKeys;
        const primaryKeys = keys || Object.keys(schema.definition || {}).filter(key => schema.definition[key].primary === true);
        if (primaryKeys.length) model.primaryKey = primaryKeys[0];
        this.validateScope({ model, scope, expectedSchemaHash: this.hash(schema) });
        return model;
    },

    /** Derive explicit mappings using the effective index owner's builder, with no schema or index mutation. */
    desiredTransitions: async function ({ model, targetSchema, tenant, databaseOptions }) {
        this.assert(model && model.tenant === tenant && _.isPlainObject(targetSchema) && targetSchema.versioned === true &&
            _.isPlainObject(databaseOptions), 'Versioned target composition and matching tenant required');
        const schema = _.cloneDeep(targetSchema);
        const targetSchemaHash = this.hash(targetSchema);
        await this.indexService().prepareDatabaseOptions({
            moduleObject: { rawSchema: { [model.schemaName]: schema } }, schemaName: model.schemaName,
            tntCode: tenant, dataBase: { master: { getOptions: () => databaseOptions } }
        });
        const targetIndexedFields = schema.schemaOptions[tenant].indexedFields;
        this.assert(Array.isArray(targetIndexedFields), 'Target index composition missing');
        const desired = targetIndexedFields.filter(index => index.options && index.options.unique === true);
        const expectedIndexes = await this.readIndexes(model);
        const originals = expectedIndexes.filter(index => index.name !== '_id_' && index.unique === true);
        this.assert(desired.length === originals.length, 'Target uniqueness is not an exact installed transition');
        const transitions = originals.map(original => {
            const candidates = desired.filter(index => this.isVersionQualifiedKey(original.key, index.fields));
            this.assert(candidates.length === 1, 'Missing or ambiguous version-qualified target index');
            const index = candidates[0];
            const name = index.options.name || Object.entries(index.fields).map(([field, direction]) => field + '_' + direction).join('_');
            return { from: original.name, to: { key: index.fields, ...index.options, name } };
        });
        this.validateTransitions(expectedIndexes, transitions);
        return { expectedIndexes, transitions, targetIndexedFields, targetSchemaHash };
    },

    /** Hash BSON, preserving BSON types and document/key order rather than lossy JSON. */
    hash: function (value) {
        return createHash('sha256').update(BSON.serialize({ value }, { ignoreUndefined: false })).digest('hex');
    },

    /** Refuse deprecated undefined fields that BSON reserialization would otherwise normalize to null. */
    recordHash: function (record) {
        const validate = value => {
            this.assert(value !== undefined && typeof value !== 'function' && typeof value !== 'symbol',
                'Unsupported lossy BSON record value');
            if (value && typeof value === 'object' && !value._bsontype && !(value instanceof Date) && !Buffer.isBuffer(value)) {
                Object.values(value).forEach(validate);
            }
        };
        validate(record);
        return this.hash(record);
    },

    /** Inspect the primary's acknowledged BSON state without collation or numeric coercion. */
    readOptions: function () {
        return { promoteValues: false, promoteLongs: false, bsonRegExp: true,
            readPreference: 'primary', readConcern: { level: 'majority' }, collation: { locale: 'simple' } };
    },

    /** Reject unsafe or inconsistent maintenance evidence using the existing database error family. */
    assert: function (condition, message) {
        if (!condition) throw new CLASSES.NodicsError('ERR_DBS_00000', message);
    },

    /** Validate caller-selected resource limits; there is no unbounded/default scan. */
    validateLimits: function (limits) {
        this.assert(limits && ['maxRecords', 'pageSize', 'maxBytes'].every(key =>
            Number.isSafeInteger(limits[key]) && limits[key] > 0), 'Positive bounded migration limits required');
        this.assert(limits.pageSize <= limits.maxRecords, 'Migration page exceeds record bound');
    },

    /** Bind an already resolved provider model to exact caller-reviewed scope and schema proof. */
    validateScope: function (input) {
        const { model, scope, expectedSchemaHash } = input;
        this.assert(model && scope && model.dataBase && typeof model.dataBase.getConnection === 'function',
            'Resolved MongoDB model required');
        const db = model.dataBase.getConnection();
        this.assert(['tenant', 'channel', 'schemaName', 'collection', 'database'].every(key =>
            typeof scope[key] === 'string' && scope[key].length > 0), 'Explicit migration scope required');
        this.assert(scope.tenant === model.tenant && scope.channel === model.channel &&
            scope.schemaName === model.schemaName && scope.collection === model.modelName &&
            scope.collection === model.collectionName && scope.database === db.databaseName &&
            model.namespace === scope.database + '.' + scope.collection, 'Migration scope mismatch');
        this.assert(model.rawSchema && expectedSchemaHash === this.hash(model.rawSchema), 'Schema proof mismatch');
    },

    /** Read native installed index specs through the existing collection cursor adapter. */
    readIndexes: async function (model) {
        const indexes = await modelMethods.cursorToArray(model.listIndexes({
            promoteValues: false, promoteLongs: false, bsonRegExp: true, readPreference: 'primary'
        }));
        this.assert(Array.isArray(indexes) && indexes.length > 0 &&
            indexes.every(index => index && typeof index.name === 'string' && index.name.length > 0 &&
                index.key && typeof index.key === 'object' && !Array.isArray(index.key)) &&
            indexes.some(index => index.name === '_id_' && this.hash(index.key) === this.hash({ _id: 1 })) &&
            new Set(indexes.map(index => index.name)).size === indexes.length, 'Malformed installed indexes');
        return indexes.sort((a, b) => a.name.localeCompare(b.name));
    },

    /** Compare full index evidence while preserving compound key order. */
    sameIndexes: function (left, right) {
        return this.hash([...left].sort((a, b) => a.name.localeCompare(b.name))) ===
            this.hash([...right].sort((a, b) => a.name.localeCompare(b.name)));
    },

    /** Require fresh parent-owned proof of the verified outage, not a provider-created lock. */
    requireOffline: async function (input, checksum) {
        this.assert(typeof input.assertOffline === 'function', 'Verified outage callback required');
        this.assert(await input.assertOffline({ scope: { ...input.scope }, checksum }) === true, 'Offline proof rejected');
    },

    /** Read bounded pages without BSON numeric promotion; reject count drift and excess bytes. */
    scan: async function (input, visit) {
        this.validateLimits(input.limits);
        const { model, limits } = input;
        const countOptions = { ...this.readOptions(), promoteValues: true, promoteLongs: true };
        const count = await model.countDocuments({}, countOptions);
        this.assert(Number.isSafeInteger(count) && count >= 0 && count <= limits.maxRecords, 'Record bound exceeded');
        let bytes = 0;
        let seen = 0;
        for (let offset = 0; offset < count; offset += limits.pageSize) {
            const cursor = model.find({}, this.readOptions()).sort({ _id: 1 }).skip(offset).limit(limits.pageSize);
            const rows = await modelMethods.cursorToArray(cursor);
            this.assert(Array.isArray(rows) && rows.length === Math.min(limits.pageSize, count - offset),
                'Record page drift');
            for (const row of rows) {
                bytes += BSON.calculateObjectSize(row);
                this.assert(bytes <= limits.maxBytes, 'Snapshot byte bound exceeded');
                await visit(row, seen++);
            }
        }
        this.assert(await model.countDocuments({}, countOptions) === count, 'Record count drift');
        return { count, bytes };
    },

    /** Validate explicit unique-index mappings, including localization compound constraints. */
    validateTransitions: function (indexes, transitions) {
        this.assert(Array.isArray(transitions) && transitions.length > 0, 'Explicit index transitions required');
        const oldNames = new Set();
        const newNames = new Set();
        for (const transition of transitions) {
            const old = indexes.find(index => index.name === transition.from);
            const target = transition.to;
            this.assert(old && old.name !== '_id_' && old.unique === true && !('versionId' in old.key),
                'Transition must reference installed unversioned uniqueness');
            this.assert(target && typeof target.name === 'string' && target.name.length > 0 &&
                !indexes.some(index => index.name === target.name) && !newNames.has(target.name) &&
                !oldNames.has(old.name), 'Index name collision or duplicate transition');
            this.assert(this.isVersionQualifiedKey(old.key, target.key) && target.unique === true,
                'Replacement must preserve ordered fields and add versionId');
            const supported = ['v', 'ns', 'name', 'key', 'unique', 'sparse', 'partialFilterExpression', 'collation'];
            this.assert(Object.keys(old).every(key => supported.includes(key)) &&
                Object.keys(target).every(key => supported.includes(key) && !['v', 'ns'].includes(key)),
                'Unsupported index options require separate qualification');
            for (const key of ['sparse', 'partialFilterExpression', 'collation']) {
                this.assert(Object.hasOwn(old, key) === Object.hasOwn(target, key) &&
                    this.hash(old[key]) === this.hash(target[key]), 'Index option mismatch: ' + key);
            }
            oldNames.add(old.name);
            newNames.add(target.name);
        }
        this.assert(indexes.filter(index => index.name !== '_id_' && index.unique === true)
            .every(index => oldNames.has(index.name)), 'All installed uniqueness must be explicitly mapped');
    },

    /** Preserve actual composed version-key placement and the relative order of every original key. */
    isVersionQualifiedKey: function (original, target) {
        if (!_.isPlainObject(target) || this.hash(target.versionId) !== this.hash(1)) return false;
        const unversioned = Object.fromEntries(Object.entries(target).filter(([field]) => field !== 'versionId'));
        return this.hash(original) === this.hash(unversioned);
    },

    /** Capture an immutable, JSON-persistable plan before any writes; existing versions are refused. */
    plan: async function (input) {
        this.validateScope(input);
        await this.requireOffline(input);
        const indexes = await this.readIndexes(input.model);
        this.assert(Array.isArray(input.expectedIndexes) && this.sameIndexes(indexes, input.expectedIndexes),
            'Installed index proof mismatch');
        this.validateTransitions(indexes, input.transitions);
        this.assert(Array.isArray(input.identityFields) && input.identityFields.length > 0 &&
            new Set(input.identityFields).size === input.identityFields.length && input.identityFields.every(field =>
                typeof field === 'string' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(field) && field !== 'versionId'),
        'Explicit scalar logical identity required');
        const records = [];
        const identities = new Set();
        const ids = new Set();
        const totals = await this.scan(input, async row => {
            this.assert(row && row._id !== undefined && !Object.hasOwn(row, 'versionId'),
                'Installed migration requires exclusively unversioned records');
            const identity = input.identityFields.map(field => {
                this.assert(typeof row[field] === 'string' && row[field].length > 0,
                    'Logical identity must contain nonempty scalar strings');
                return row[field];
            });
            const identityHash = this.hash(identity);
            const id = BSON.serialize({ _id: row._id }).toString('base64');
            this.assert(!identities.has(identityHash) && !ids.has(id), 'Duplicate installed identity');
            identities.add(identityHash);
            ids.add(id);
            records.push({ id, beforeHash: this.recordHash(row), afterHash: this.recordHash({ ...row, versionId: 0 }) });
        });
        this.assert(this.sameIndexes(indexes, await this.readIndexes(input.model)), 'Index drift during snapshot');
        const body = { format: 1, scope: input.scope, expectedSchemaHash: input.expectedSchemaHash,
            limits: input.limits, identityFields: input.identityFields, records, totals,
            indexesBson: BSON.serialize({ indexes }).toString('base64'),
            transitionsBson: BSON.serialize({ transitions: input.transitions }).toString('base64') };
        const plan = JSON.parse(JSON.stringify(body));
        plan.checksum = this.hash(plan);
        this.assert(Buffer.byteLength(JSON.stringify(plan)) <= input.limits.maxBytes, 'Plan evidence byte bound exceeded');
        return plan;
    },

    /** Validate persisted plan checksum and rebind to the same installed model/schema. */
    validatePlan: function (input) {
        const plan = input.plan;
        this.assert(plan && plan.format === 1, 'Invalid migration plan');
        const { checksum, ...body } = plan;
        this.assert(checksum === this.hash(body), 'Migration plan checksum mismatch');
        this.assert(this.hash(input.scope) === this.hash(plan.scope), 'Plan scope mismatch');
        this.validateScope({ ...input, expectedSchemaHash: plan.expectedSchemaHash });
        this.validateLimits(plan.limits);
        this.assert(Array.isArray(plan.records) && plan.records.length === plan.totals.count &&
            plan.records.length <= plan.limits.maxRecords && new Set(plan.records.map(row => row.id)).size === plan.records.length,
        'Invalid plan record evidence');
        const indexes = BSON.deserialize(Buffer.from(plan.indexesBson, 'base64'), { promoteValues: false }).indexes;
        this.validateTransitions(indexes, this.transitions(plan));
        return indexes;
    },

    /** Decode exact BSON index options from the JSON-safe parent journal envelope. */
    transitions: function (plan) {
        return BSON.deserialize(Buffer.from(plan.transitionsBson, 'base64'), { promoteValues: false }).transitions;
    },

    /** Verify exactly the planned records and allowable intermediate index states, never silently adopting drift. */
    inspect: async function (input) {
        const indexes = this.validatePlan(input);
        await this.requireOffline(input, input.plan.checksum);
        const expected = new Map(input.plan.records.map(row => [row.id, row]));
        const states = new Map();
        await this.scan({ ...input, limits: input.plan.limits }, async row => {
            const id = BSON.serialize({ _id: row._id }).toString('base64');
            const record = expected.get(id);
            this.assert(record && !states.has(id), 'Unaccounted record or duplicate ID');
            const hash = this.recordHash(row);
            this.assert(hash === record.beforeHash || hash === record.afterHash, 'Record drift or successor history');
            states.set(id, hash === record.beforeHash ? 'before' : 'after');
        });
        this.assert(states.size === expected.size, 'Planned records missing');
        const live = await this.readIndexes(input.model);
        for (const index of live) {
            const original = indexes.find(item => item.name === index.name);
            const replacement = this.transitions(input.plan).find(item => item.to.name === index.name);
            this.assert(original ? this.hash(original) === this.hash(index) : replacement && this.matchesTarget(index, replacement.to),
                'Unaccounted or changed index');
        }
        for (const index of indexes) {
            const transition = this.transitions(input.plan).find(item => item.from === index.name);
            this.assert(live.some(item => item.name === index.name) || transition &&
                live.some(item => this.matchesTarget(item, transition.to)), 'Original index missing without replacement');
        }
        return { states, live, indexes };
    },

    /** Compare declared replacement against installed index, ignoring only server index-format metadata. */
    matchesTarget: function (installed, target) {
        const { v, ns, ...spec } = installed;
        const normalize = value => Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]]));
        return this.hash(normalize(spec)) === this.hash(normalize(target));
    },

    /** Await an exact durable write-ahead acknowledgement before issuing one side effect. */
    checkpoint: async function (input, operation) {
        this.assert(typeof input.checkpoint === 'function', 'Parent journal checkpoint required');
        const request = { checksum: input.plan.checksum, scope: input.plan.scope, operation };
        request.operationId = this.hash({ checksum: request.checksum, operation });
        const acknowledgement = await input.checkpoint(JSON.parse(JSON.stringify(request)));
        this.assert(acknowledgement && acknowledgement.durable === true &&
            acknowledgement.checksum === request.checksum && acknowledgement.operationId === request.operationId,
        'Durable parent checkpoint not acknowledged');
        await this.requireOffline(input, input.plan.checksum);
        this.assert(input.plan.checksum === request.checksum, 'Plan changed during checkpoint');
        this.validatePlan(input);
    },

    /** Conditionally change only versionId against the exact BSON preimage, without normal authoring hooks. */
    changeRecord: async function (input, record, rollback) {
        const operation = { kind: rollback ? 'restore-record' : 'backfill-record', id: record.id,
            beforeHash: rollback ? record.afterHash : record.beforeHash,
            afterHash: rollback ? record.beforeHash : record.afterHash };
        await this.checkpoint(input, operation);
        const query = BSON.deserialize(Buffer.from(record.id, 'base64'), { promoteValues: false });
        const row = await input.model.findOne(query, this.readOptions());
        this.assert(row && this.recordHash(row) === operation.beforeHash, 'Conditional record preimage mismatch');
        const result = await input.model.updateOne({ ...query,
            versionId: rollback ? 0 : { $exists: false }, $expr: { $eq: ['$$ROOT', { $literal: row }] } },
        rollback ? { $unset: { versionId: '' } } : { $set: { versionId: 0 } },
        { upsert: false, writeConcern: { w: 'majority' }, collation: { locale: 'simple' } });
        this.assert(result && result.acknowledged === true && result.matchedCount === 1 && result.modifiedCount === 1,
            'Conditional migration write was not acknowledged exactly once');
        const after = await input.model.findOne(query, this.readOptions());
        this.assert(after && this.recordHash(after) === operation.afterHash, 'Migration postimage mismatch');
    },

    /** Resume bounded initial-version backfill; only exact planned pre/post images are accepted. */
    backfill: async function (input) {
        const state = await this.inspect(input);
        for (const record of input.plan.records) {
            if (state.states.get(record.id) === 'before') await this.changeRecord(input, record, false);
        }
        const after = await this.inspect(input);
        this.assert([...after.states.values()].every(value => value === 'after'), 'Incomplete backfill');
        return { checksum: input.plan.checksum, records: after.states.size, backfilled: true };
    },

    /** Resolve the existing framework index owner, permitting normal later-layer override. */
    indexService: function () {
        return SERVICE.DefaultMongodbDatabaseModelHandlerService;
    },

    /** Checkpoint and create one explicitly recorded index through the existing owner primitive. */
    createIndex: async function (input, spec) {
        await this.checkpoint(input, { kind: 'create-index', specBson: BSON.serialize({ spec }).toString('base64') });
        this.assert(!(await this.readIndexes(input.model)).some(index => index.name === spec.name),
            'Index name appeared after planning');
        const { key, v, ns, ...options } = spec;
        await this.indexService().createIndex(input.model, { fields: key, options });
        const installed = (await this.readIndexes(input.model)).find(index => index.name === spec.name);
        this.assert(installed && this.matchesTarget(installed, { key, ...options }), 'Created index verification failed');
    },

    /** Checkpoint and drop only an exact, named plan index; never reconcile/clean unrelated indexes. */
    dropIndex: async function (input, spec) {
        await this.checkpoint(input, { kind: 'drop-index', specBson: BSON.serialize({ spec }).toString('base64') });
        const installed = (await this.readIndexes(input.model)).find(index => index.name === spec.name);
        this.assert(installed && this.hash(installed) === this.hash(spec), 'Drop index preimage mismatch');
        await this.indexService().dropIndex(input.model, spec.name);
        this.assert(!(await this.readIndexes(input.model)).some(index => index.name === spec.name), 'Index drop not verified');
    },

    /** Create all version-qualified uniqueness first, then drop only mapped old constraints in order. */
    transitionIndexes: async function (input) {
        let state = await this.inspect(input);
        this.assert([...state.states.values()].every(value => value === 'after'), 'Backfill required before index transition');
        for (const transition of this.transitions(input.plan)) {
            if (!state.live.some(index => index.name === transition.to.name)) await this.createIndex(input, transition.to);
            state = await this.inspect(input);
        }
        for (const transition of this.transitions(input.plan)) {
            const original = state.live.find(index => index.name === transition.from);
            if (original) await this.dropIndex(input, original);
            state = await this.inspect(input);
        }
        return this.verify(input);
    },

    /** Confirm all exact postimages and the final planned index set; this does not reopen writers. */
    verify: async function (input) {
        const state = await this.inspect(input);
        this.assert([...state.states.values()].every(value => value === 'after'), 'Migration records incomplete');
        for (const transition of this.transitions(input.plan)) {
            this.assert(!state.live.some(index => index.name === transition.from) &&
                state.live.some(index => this.matchesTarget(index, transition.to)), 'Migration indexes incomplete');
        }
        return { checksum: input.plan.checksum, records: state.states.size, verified: true };
    },

    /** Restore original uniqueness before removing only migration-added versions; refuse successor histories. */
    rollback: async function (input) {
        let state = await this.inspect(input);
        for (const transition of this.transitions(input.plan)) {
            if (!state.live.some(index => index.name === transition.from)) {
                await this.createIndex(input, state.indexes.find(index => index.name === transition.from));
            }
            state = await this.inspect(input);
        }
        for (const transition of this.transitions(input.plan)) {
            const replacement = state.live.find(index => index.name === transition.to.name);
            if (replacement) await this.dropIndex(input, replacement);
            state = await this.inspect(input);
        }
        for (const record of input.plan.records) {
            if (state.states.get(record.id) === 'after') await this.changeRecord(input, record, true);
        }
        state = await this.inspect(input);
        this.assert([...state.states.values()].every(value => value === 'before') && this.sameIndexes(state.live, state.indexes),
            'Rollback verification failed');
        return { checksum: input.plan.checksum, restored: true };
    },

    /** Recover the same journal-bound plan only; the parent proves previous worker death and keeps writers offline. */
    recover: async function (input) {
        this.assert(input.direction === 'forward' || input.direction === 'rollback', 'Explicit recovery direction required');
        if (input.direction === 'rollback') return this.rollback(input);
        await this.backfill(input);
        return this.transitionIndexes(input);
    }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');
const saveTokens = new WeakMap();
const unchangedSaves = new WeakSet();
const credentialRetirements = new WeakMap();
const credentialRetirementCas = new WeakMap();

/**
 * @module database/service/schema/DefaultModelConcurrencyService
 * @description Owns technical counters explicitly managed by generated CRUD.
 * @layer service
 * @owner database
 * @override Extend the existing effective schema backoffice.concurrency contract;
 * domain-owned revisions and immutable versionId values are not inferred or changed.
 * Writes remain inside generated pipelines and provider-atomic model methods.
 */
module.exports = {
    /** Resolves credential writer guards only for an explicitly managed effective schema; retirement enablement remains independent. @param {Object} schema Effective schema. @returns {Object|undefined} Fixed field contract or unchanged legacy mode. */
    getCredentialWritePolicy: function (schema) {
        const policy = schema?.credentialRetirement;
        if (!policy) return undefined;
        const field = this.getField(schema);
        if (!field) {
            if (policy.enabled === true) throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
            return undefined;
        }
        if (
            field !== 'revision' ||
            policy.revisionField !== field ||
            policy.credentialField !== 'password' ||
            policy.activeField !== 'active' ||
            policy.evidenceField !== 'identityLinkRetirement'
        ) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        return policy;
    },

    /** Fences every generated credential writer against retired state and reserved evidence, including import/nested save and delete. @param {Object} request Prepared generated command. @param {Object|null} current Original scoped record. @returns {Object} Atomic state predicates; legacy and private retirement unchanged. */
    credentialWriteConditions: function (request, current) {
        const policy = this.getCredentialWritePolicy(request.schemaModel.rawSchema);
        if (!policy || this.ownsCredentialRetirement(request)) return {};
        if (
            Object.hasOwn(request.query || {}, policy.credentialField) ||
            Object.hasOwn(request.model || {}, policy.evidenceField)
        )
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        if (
            current &&
            (Object.hasOwn(current, policy.evidenceField) ||
                typeof current[policy.activeField] !== 'boolean' ||
                !Number.isSafeInteger(current.revision) ||
                current.revision < 1)
        ) {
            throw this.conflict();
        }
        return current
            ? { [policy.activeField]: current[policy.activeField], [policy.evidenceField]: { $exists: false } }
            : {};
    },
    /** Recognizes only a transient internal retirement command, never a body/options flag. @param {Object} request Exact generated update request. @returns {boolean} Private primitive admission. */
    ownsCredentialRetirement: function (request) {
        return credentialRetirements.has(request);
    },

    /** Resolves metadata-only return fields for one privately issued provider CAS input. @param {Object} input Exact internal CAS input. @returns {Object|undefined} Fixed projection; callers cannot choose it. */
    credentialRetirementProjection: function (input) {
        return credentialRetirementCas.get(input);
    },

    /** Qualifies the installed generated model before identity owners disable a principal. @param {Object} model Prepared tenant-resolved model. @returns {Object} Effective fixed revision policy. */
    assertCredentialRetirementModel: function (model) {
        const policy = model?.rawSchema?.credentialRetirement;
        const field = this.getField(model?.rawSchema);
        const capabilities = model?.credentialRetirementCapabilities?.();
        if (
            policy?.enabled !== true ||
            policy.writerCoverageQualified !== true ||
            !field ||
            field !== policy.revisionField ||
            model.primaryKey !== 'code' ||
            typeof model.compareAndSetItem !== 'function' ||
            capabilities?.contractVersion !== 1 ||
            capabilities.revisionCas !== true ||
            capabilities.metadataOnlyReadback !== true ||
            policy.credentialField !== 'password' ||
            policy.activeField !== 'active' ||
            policy.evidenceField !== 'identityLinkRetirement' ||
            typeof policy.ownerService !== 'string' ||
            !SERVICE[policy.ownerService]?.ownsWrite
        ) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        return policy;
    },

    /** Runs the normal generated update while requiring an actual qualified revision CAS; uncertainty is reported only after that primitive was attempted. @param {Object} request Owner-built hash-free command. @param {Function} dispatch Existing generated update callback preserving authorization/hooks. @returns {Promise<Object>} Non-secret attempted/acknowledged receipt, not inferred persistence. */
    retireCredential: async function (request, dispatch) {
        if (
            !request ||
            typeof dispatch !== 'function' ||
            credentialRetirements.has(request) ||
            !request.query ||
            !request.model ||
            request.options?.recursive !== false ||
            request.options?.returnModified ||
            request.options?.upsert ||
            request.options?.overwrite
        )
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        if (
            Object.keys(request.query).sort().join(',') !== '_id,active,code,identityLinkRetirement,loginId,revision' ||
            typeof request.query._id !== 'string' ||
            !request.query._id ||
            request.query._id.length > 128 ||
            typeof request.query.code !== 'string' ||
            !request.query.code ||
            request.query.code.length > 128 ||
            typeof request.query.loginId !== 'string' ||
            !request.query.loginId ||
            request.query.loginId.length > 320 ||
            request.query.active !== true ||
            !Number.isSafeInteger(request.query.revision) ||
            request.query.revision < 1 ||
            !Number.isSafeInteger(request.query.revision + 1) ||
            !_.isEqual(request.query.identityLinkRetirement, { $exists: false }) ||
            Object.keys(request.model).sort().join(',') !== 'active,identityLinkRetirement' ||
            request.model.active !== false ||
            Object.keys(request.model.identityLinkRetirement || {})
                .sort()
                .join(',') !== 'auditCode,fingerprint' ||
            !/^canonical-link-[a-f0-9]{40}$/.test(request.model.identityLinkRetirement.auditCode || '') ||
            !/^[a-f0-9]{64}$/.test(request.model.identityLinkRetirement.fingerprint || '')
        )
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        const state = {
            attempted: false,
            acknowledged: false,
            original: _.cloneDeep({ tenant: request.tenant, query: request.query, model: request.model }),
        };
        credentialRetirements.set(request, state);
        try {
            let response;
            try {
                response = await dispatch();
            } catch {
                if (!state.attempted) throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
                return { attempted: true, acknowledged: false };
            }
            if (
                !state.attempted ||
                !state.acknowledged ||
                !/^SUC_/.test(response?.code || '') ||
                response.success === false ||
                response.error ||
                (response.errors && (!Array.isArray(response.errors) || response.errors.length)) ||
                response.result?.matchedCount !== 1
            ) {
                if (!state.attempted) throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
                return { attempted: true, acknowledged: false };
            }
            return { attempted: true, acknowledged: true, revision: state.revision };
        } finally {
            credentialRetirements.delete(request);
        }
    },

    /** Requires explicit managed revision, complete writer coverage and exact owning private mutation before retirement dispatch. @param {Object} request Prepared generated request. @returns {Object} Fixed schema fields and original token. */
    validateCredentialRetirement: function (request) {
        const schema = request.schemaModel?.rawSchema,
            policy = this.assertCredentialRetirementModel(request.schemaModel);
        const field = this.getField(schema);
        if (
            !credentialRetirements.has(request) ||
            policy?.enabled !== true ||
            policy.writerCoverageQualified !== true ||
            !field ||
            field !== policy.revisionField ||
            request.schemaModel.primaryKey !== 'code' ||
            typeof request.schemaModel.compareAndSetItem !== 'function' ||
            !SERVICE[policy.ownerService]?.ownsWrite?.(request) ||
            policy.credentialField !== 'password' ||
            policy.activeField !== 'active' ||
            policy.evidenceField !== 'identityLinkRetirement'
        ) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        const query = request.query,
            patch = request.model,
            marker = patch?.identityLinkRetirement;
        const original = credentialRetirements.get(request)?.original;
        const allowedQuery = ['_id', 'code', 'loginId', 'active', field, 'identityLinkRetirement'];
        if (
            !query ||
            Object.keys(query).sort().join(',') !== allowedQuery.sort().join(',') ||
            !['string', 'object'].includes(typeof query._id) ||
            !query._id ||
            typeof query.code !== 'string' ||
            !query.code ||
            typeof query.loginId !== 'string' ||
            !query.loginId ||
            query.active !== true ||
            field !== 'revision' ||
            !Number.isSafeInteger(query[field]) ||
            query[field] < 1 ||
            !Number.isSafeInteger(query[field] + 1) ||
            !_.isEqual(query.identityLinkRetirement, { $exists: false }) ||
            Object.keys(patch || {})
                .sort()
                .join(',') !== 'active,identityLinkRetirement' ||
            patch.active !== false ||
            Object.keys(marker || {})
                .sort()
                .join(',') !== 'auditCode,fingerprint' ||
            !/^canonical-link-[a-f0-9]{40}$/.test(marker.auditCode || '') ||
            !/^[a-f0-9]{64}$/.test(marker.fingerprint || '')
        ) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        if (
            !original ||
            request.tenant !== original.tenant ||
            String(query._id) !== original.query._id ||
            !_.isEqual(_.omit(query, '_id'), _.omit(original.query, '_id')) ||
            !_.isEqual(patch, original.model)
        ) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        return { field, projection: { _id: 1, code: 1, loginId: 1, active: 1, [field]: 1, identityLinkRetirement: 1 } };
    },

    /** Executes a privately admitted retirement through the existing managed pipeline, failing before ordinary unversioned writes. @param {Object} request Prepared generated update. @returns {Promise<Object>} Existing count envelope payload. */
    executeCredentialRetirement: async function (request) {
        this.validateCredentialRetirement(request);
        return await this.execute(request, 'update');
    },
    /** Resolves an explicitly framework-managed counter, or leaves legacy/domain behavior intact. */
    getField: function (schema) {
        const config = schema && schema.backoffice && schema.backoffice.concurrency;
        if (
            schema?.credentialRetirement?.enabled === true &&
            (!config || config.enabled === false || config.managed !== true)
        ) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        if (!config || config.enabled === false || config.managed !== true) return undefined;
        const field = config.field || 'revision';
        const definition = schema.definition && schema.definition[field];
        if (
            !/^[A-Za-z][A-Za-z0-9_]*$/.test(field) ||
            field === 'versionId' ||
            !definition ||
            !['int', 'long'].includes(definition.type) ||
            schema.isVersionedEnabled === true
        ) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        return field;
    },

    /** Builds a bounded error without exposing another user's record or internal query. */
    conflict: function () {
        return new CLASSES.NodicsError('ERR_CONCURRENCY_00001');
    },

    /** Allows generated post-save effects to skip a proven unchanged managed save. */
    wasUnchanged: function (request) {
        return unchangedSaves.has(request);
    },

    /** Captures the original caller token before defaults/interceptors initialize create values. */
    initializeSave: function (request) {
        const field = this.getField(request.schemaModel.rawSchema);
        if (!field) return;
        if (!saveTokens.has(request)) saveTokens.set(request, this.getToken(request, field));
        if (request.model[field] === undefined) request.model[field] = 1;
    },

    /** Reads a scalar token from the original selector or record; callers never supply the next value. */
    getToken: function (request, field) {
        const queryToken = request.query && request.query[field];
        const modelToken = request.model && request.model[field];
        const token = queryToken !== undefined ? queryToken : modelToken;
        if (token !== undefined && (!Number.isSafeInteger(token) || token < 0)) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        return token;
    },

    /** Retains enforced ownership filters and requires one concrete record identity for managed writes. */
    getIdentity: function (request, field) {
        const query = _.cloneDeep(request.query || {});
        delete query[field];
        const key = request.schemaModel.primaryKey || 'code';
        const identity = query[key] === undefined ? request.model && request.model[key] : query[key];
        if (!['string', 'number'].includes(typeof identity) || identity === '') {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        if (request.model && request.model[key] !== undefined && request.model[key] !== identity) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        query[key] = identity;
        return query;
    },

    /** Produces a plain field patch. Raw update operators cannot change a managed counter indirectly. */
    getPatch: function (request, field) {
        const model = request.model || {};
        if (Object.keys(model).some((key) => key.startsWith('$') || key.includes('.'))) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        const normalized = request.schemaModel.normalizeModelForWrite
            ? request.schemaModel.normalizeModelForWrite(model)
            : model;
        return _.omit(normalized, [field, '_id']);
    },

    /** Reads at most two scoped records; ambiguous selectors never become a mass mutation. */
    readCurrent: async function (request, query) {
        const result = await request.schemaModel.getItems({
            query: query,
            searchOptions: { limit: 2 },
            tenant: request.tenant,
            authData: request.authData,
            transactionContext: request.transactionContext,
        });
        const records = Array.isArray(result) ? result : result && result.result;
        if (!Array.isArray(records) || records.length > 1) throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        return records[0];
    },

    /** Executes one authorized save/update/delete using the original token and provider-atomic writes. */
    execute: async function (request, operation) {
        unchangedSaves.delete(request);
        const retirement = credentialRetirements.has(request) ? this.validateCredentialRetirement(request) : null;
        if (retirement && operation !== 'update') throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        const schemaModel = request.schemaModel;
        const field = this.getField(schemaModel.rawSchema);
        if (!field || typeof schemaModel.compareAndSetItem !== 'function') {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        const token =
            operation === 'save' && saveTokens.has(request) ? saveTokens.get(request) : this.getToken(request, field);
        const identity = this.getIdentity(request, field);
        this.credentialWriteConditions(request, null);
        const current = await this.readCurrent(request, identity);
        const credentialConditions = this.credentialWriteConditions(request, current);
        let saved;
        let changed = true;
        if (!current) {
            if (operation !== 'save' || (token !== undefined && token !== 0 && token !== 1)) throw this.conflict();
            saved = await schemaModel.compareAndSetItem({
                operation: 'create',
                model: Object.assign(this.getPatch(request, field), { [field]: 1 }),
                transactionContext: request.transactionContext,
            });
        } else {
            if (token === undefined) throw new CLASSES.NodicsError('ERR_CONCURRENCY_00002');
            const revision = current[field] === undefined ? 0 : current[field];
            if (!Number.isSafeInteger(revision) || revision < 0 || token !== revision) throw this.conflict();
            if (operation === 'save' && SERVICE.DefaultRecordOwnershipPolicyService) {
                await SERVICE.DefaultRecordOwnershipPolicyService.enforce(request, 'update');
                if (SERVICE.DefaultSchemaWriteAccessPolicyService) {
                    await SERVICE.DefaultSchemaWriteAccessPolicyService.enforceUpdatePolicies(request, {});
                }
                if (!(await this.readCurrent(request, this.getIdentity(request, field)))) throw this.conflict();
            }
            const query = Object.assign(
                {},
                this.getIdentity(request, field),
                {
                    [field]: current[field] === undefined ? { $exists: false } : revision,
                },
                credentialConditions,
            );
            if (operation === 'remove') {
                saved = await schemaModel.compareAndSetItem({
                    operation: 'remove',
                    query: query,
                    transactionContext: request.transactionContext,
                });
            } else {
                const patch = this.getPatch(request, field);
                // Audit timestamps alone do not constitute a business edit.
                changed = Object.keys(_.omit(patch, ['created', 'updated'])).some(
                    (key) => !_.isEqual(current[key], patch[key]),
                );
                if (!changed) {
                    saved = current;
                } else {
                    if (!Number.isSafeInteger(revision + 1)) throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
                    const input = {
                        operation: 'update',
                        query: query,
                        model: Object.assign(_.omit(patch, ['created']), { [field]: revision + 1 }),
                        transactionContext: request.transactionContext,
                    };
                    if (retirement) {
                        credentialRetirementCas.set(input, retirement.projection);
                        credentialRetirements.get(request).attempted = true;
                    }
                    try {
                        saved = await schemaModel.compareAndSetItem(input);
                    } finally {
                        credentialRetirementCas.delete(input);
                    }
                }
            }
        }
        if (!saved) throw this.conflict();
        if (retirement) {
            if (
                !changed ||
                saved[field] !== token + 1 ||
                saved.active !== false ||
                saved.code !== request.query.code ||
                saved.loginId !== request.query.loginId ||
                !_.isEqual(saved.identityLinkRetirement, request.model.identityLinkRetirement) ||
                Object.hasOwn(saved, 'password')
            )
                throw this.conflict();
            const state = credentialRetirements.get(request);
            state.acknowledged = true;
            state.revision = saved[field];
        }
        if (operation === 'save') {
            if (!changed) unchangedSaves.add(request);
            return saved;
        }
        const result =
            operation === 'remove' ? { deletedCount: 1 } : { matchedCount: 1, modifiedCount: changed ? 1 : 0 };
        if (request.options && (request.options.returnModified || request.options.recursive)) result.models = [saved];
        return result;
    },
};

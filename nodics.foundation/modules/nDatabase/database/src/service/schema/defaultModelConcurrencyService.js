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
    /** Resolves an explicitly framework-managed counter, or leaves legacy/domain behavior intact. */
    getField: function (schema) {
        const config = schema && schema.backoffice && schema.backoffice.concurrency;
        if (!config || config.enabled === false || config.managed !== true) return undefined;
        const field = config.field || 'revision';
        const definition = schema.definition && schema.definition[field];
        if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(field) || field === 'versionId' ||
            !definition || !['int', 'long'].includes(definition.type) || schema.isVersionedEnabled === true) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        return field;
    },

    /** Builds a bounded error without exposing another user's record or internal query. */
    conflict: function () { return new CLASSES.NodicsError('ERR_CONCURRENCY_00001'); },

    /** Allows generated post-save effects to skip a proven unchanged managed save. */
    wasUnchanged: function (request) { return unchangedSaves.has(request); },

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
        if (Object.keys(model).some(key => key.startsWith('$') || key.includes('.'))) {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        const normalized = request.schemaModel.normalizeModelForWrite
            ? request.schemaModel.normalizeModelForWrite(model) : model;
        return _.omit(normalized, [field, '_id']);
    },

    /** Reads at most two scoped records; ambiguous selectors never become a mass mutation. */
    readCurrent: async function (request, query) {
        const result = await request.schemaModel.getItems({ query: query, searchOptions: { limit: 2 },
            tenant: request.tenant, authData: request.authData, transactionContext: request.transactionContext });
        const records = Array.isArray(result) ? result : result && result.result;
        if (!Array.isArray(records) || records.length > 1) throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        return records[0];
    },

    /** Executes one authorized save/update/delete using the original token and provider-atomic writes. */
    execute: async function (request, operation) {
        unchangedSaves.delete(request);
        const schemaModel = request.schemaModel;
        const field = this.getField(schemaModel.rawSchema);
        if (!field || typeof schemaModel.compareAndSetItem !== 'function') {
            throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
        }
        const token = operation === 'save' && saveTokens.has(request)
            ? saveTokens.get(request) : this.getToken(request, field);
        const identity = this.getIdentity(request, field);
        const current = await this.readCurrent(request, identity);
        let saved;
        let changed = true;
        if (!current) {
            if (operation !== 'save' || (token !== undefined && token !== 0 && token !== 1)) throw this.conflict();
            saved = await schemaModel.compareAndSetItem({ operation: 'create',
                model: Object.assign(this.getPatch(request, field), { [field]: 1 }),
                transactionContext: request.transactionContext });
        } else {
            if (token === undefined) throw new CLASSES.NodicsError('ERR_CONCURRENCY_00002');
            const revision = current[field] === undefined ? 0 : current[field];
            if (!Number.isSafeInteger(revision) || revision < 0 || token !== revision) throw this.conflict();
            if (operation === 'save' && SERVICE.DefaultRecordOwnershipPolicyService) {
                await SERVICE.DefaultRecordOwnershipPolicyService.enforce(request, 'update');
                if (SERVICE.DefaultSchemaWriteAccessPolicyService) {
                    await SERVICE.DefaultSchemaWriteAccessPolicyService.enforceUpdatePolicies(request, {});
                }
                if (!await this.readCurrent(request, this.getIdentity(request, field))) throw this.conflict();
            }
            const query = Object.assign({}, this.getIdentity(request, field), { [field]: current[field] === undefined ? { $exists: false } : revision });
            if (operation === 'remove') {
                saved = await schemaModel.compareAndSetItem({ operation: 'remove', query: query,
                    transactionContext: request.transactionContext });
            } else {
                const patch = this.getPatch(request, field);
                // Audit timestamps alone do not constitute a business edit.
                changed = Object.keys(_.omit(patch, ['created', 'updated'])).some(key => !_.isEqual(current[key], patch[key]));
                if (!changed) {
                    saved = current;
                } else {
                    if (!Number.isSafeInteger(revision + 1)) throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
                    saved = await schemaModel.compareAndSetItem({ operation: 'update', query: query,
                        model: Object.assign(_.omit(patch, ['created']), { [field]: revision + 1 }),
                        transactionContext: request.transactionContext });
                }
            }
        }
        if (!saved) throw this.conflict();
        if (operation === 'save') {
            if (!changed) unchangedSaves.add(request);
            return saved;
        }
        const result = operation === 'remove' ? { deletedCount: 1 } : { matchedCount: 1, modifiedCount: changed ? 1 : 0 };
        if (request.options && (request.options.returnModified || request.options.recursive)) result.models = [saved];
        return result;
    }
};

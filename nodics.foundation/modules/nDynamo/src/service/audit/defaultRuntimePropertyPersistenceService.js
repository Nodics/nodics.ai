/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const _ = require('lodash');
const crypto = require('crypto');

/** @module dynamo/service/audit/DefaultRuntimePropertyPersistenceService
 * @description Persists approved tenant-property snapshots and audit atomically in the existing runtime value owner; restores committed values on startup and cluster refresh.
 * @layer service @owner dynamo
 * @override Preserve generated persistence, trusted tenant identity, exact revision, approved intent, bounded evidence and failure-closed recovery.
 */
module.exports = {
    /** Local application watermarks only; generated runtime values remain authoritative. */
    appliedRevisions: new Map(),
    /** Resolves deployment opt-in and validated capacity, never from submitted configuration. @returns {Object} Owner policy. */
    policy: function () {
        const value =
            (CONFIG.get('runtimePropertyGovernance') || {}).persistence || {};
        if (value.enabled !== undefined && typeof value.enabled !== 'boolean')
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Invalid runtime property persistence opt-in',
            );
        if (value.enabled !== true) return { enabled: false };
        if (
            (value.requireDurableJournal !== undefined &&
                typeof value.requireDurableJournal !== 'boolean') ||
            !Number.isSafeInteger(value.maximumChanges) ||
            value.maximumChanges < 1 ||
            value.maximumChanges > 10000 ||
            !Number.isSafeInteger(value.maximumBytes) ||
            value.maximumBytes < 1024 ||
            value.maximumBytes > 4194304
        )
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Invalid runtime property persistence bounds',
            );
        return value;
    },
    /** Selects the existing internal generated persistence protocol only through deployment configuration. @returns {Object} Private protocol selection; never browser driver options. */
    persistenceOptions: function () {
        return this.policy().requireDurableJournal === true
            ? { internalPersistence: 'DURABLE_JOURNAL' }
            : {};
    },
    /** Returns an inert owner identity shared by all runtime nodes in the trusted tenant. @param {Object} request Trusted request. @returns {Object} Scope. */
    scope: function (request) {
        const tenant = request.tenant;
        if (
            typeof tenant !== 'string' ||
            !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(tenant)
        )
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'A trusted tenant is required',
            );
        return { tenant, code: 'governed-properties:' + tenant };
    },
    /** Requires the existing generated runtime-value service, without a database shortcut. @returns {Object} Generated owner. */
    store: function () {
        const service = SERVICE.DefaultRuntimeConfigurationValueService;
        if (
            !service ||
            !['get', 'save', 'update'].every(
                (key) => typeof service[key] === 'function',
            )
        )
            throw new CLASSES.NodicsError(
                'ERR_SYS_00001',
                'Runtime value persistence is required',
            );
        return service;
    },
    /** Validates snapshots before applying any persisted value; paths cannot mutate prototypes or include secrets. @param {Object} record Persisted record. @param {Object} scope Scope. @returns {Object} Validated record. */
    validate: function (record, scope) {
        const policy = this.policy();
        const state = record && record.governedProperties;
        if (record?.propertyReadFence != null) {
            const fence = record.propertyReadFence;
            if (
                !fence ||
                typeof fence !== 'object' ||
                Array.isArray(fence) ||
                Object.keys(fence).sort().join() !==
                    'actor,at,operationCode,ownerModule,revision,token,version' ||
                [
                    'actor',
                    'at',
                    'operationCode',
                    'ownerModule',
                    'revision',
                    'token',
                ].some((key) => typeof fence[key] !== 'string') ||
                fence.version !== 1 ||
                fence.revision !== record.revision ||
                !/^[a-f0-9-]{36}$/.test(fence.token || '') ||
                !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(
                    fence.ownerModule || '',
                ) ||
                !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/.test(
                    fence.operationCode || '',
                ) ||
                typeof fence.actor !== 'string' ||
                !fence.actor.trim() ||
                fence.actor.length > 192 ||
                typeof fence.at !== 'string' ||
                !Number.isFinite(Date.parse(fence.at)) ||
                new Date(fence.at).toISOString() !== fence.at
            )
                throw new CLASSES.NodicsError(
                    'ERR_SYS_00002',
                    'Invalid governed property read fence',
                );
        }
        if (
            !record ||
            record.code !== scope.code ||
            record.tenant !== scope.tenant ||
            record.schemaCode !== 'tenantProperties' ||
            record.ownerModule !== 'dynamo' ||
            !/^[a-f0-9]{64}$/.test(record.revision || '') ||
            !state ||
            !Number.isSafeInteger(state.sequence) ||
            state.sequence < 1 ||
            !Array.isArray(state.values) ||
            !Array.isArray(state.audit) ||
            state.audit.length < 1 ||
            state.audit.length > policy.maximumChanges ||
            state.sequence !== state.audit.length ||
            !state.audit[state.audit.length - 1] ||
            state.audit[state.audit.length - 1].revision !== record.revision ||
            Buffer.byteLength(JSON.stringify(record)) > policy.maximumBytes
        )
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Invalid persisted property state',
            );
        const revisions = new Set();
        for (const change of state.audit) {
            if (
                !change ||
                !/^[a-f0-9]{64}$/.test(change.revision || '') ||
                revisions.has(change.revision) ||
                !['activationRequestCode', 'actor', 'approvedBy'].every(
                    (key) =>
                        typeof change[key] === 'string' &&
                        change[key].trim() &&
                        change[key].length <= 256,
                ) ||
                typeof change.at !== 'string' ||
                !Number.isFinite(Date.parse(change.at)) ||
                new Date(change.at).toISOString() !== change.at ||
                !change.previousSnapshot ||
                !Array.isArray(change.previousSnapshot.values) ||
                !Array.isArray(change.previousSnapshot.missingPaths) ||
                !change.nextSnapshot ||
                !Array.isArray(change.nextSnapshot.values) ||
                !Array.isArray(change.nextSnapshot.missingPaths)
            )
                throw new CLASSES.NodicsError(
                    'ERR_SYS_00002',
                    'Invalid persisted property audit',
                );
            revisions.add(change.revision);
        }
        const paths = new Set();
        for (const entry of state.values) {
            if (
                !entry ||
                typeof entry.path !== 'string' ||
                !/^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/.test(entry.path) ||
                entry.path.length > 512 ||
                paths.has(entry.path) ||
                (entry.absent === true
                    ? Object.keys(entry).length !== 2 ||
                      Object.prototype.hasOwnProperty.call(entry, 'value')
                    : Object.keys(entry).length !== 2 ||
                      !Object.prototype.hasOwnProperty.call(entry, 'value')) ||
                [...paths].some(
                    (path) =>
                        path.startsWith(entry.path + '.') ||
                        entry.path.startsWith(path + '.'),
                ) ||
                entry.path
                    .split('.')
                    .some((part) =>
                        ['__proto__', 'prototype', 'constructor'].includes(
                            part,
                        ),
                    )
            )
                throw new CLASSES.NodicsError(
                    'ERR_SYS_00002',
                    'Invalid persisted property path',
                );
            paths.add(entry.path);
            if (
                entry.path === 'runtimePropertyGovernance' ||
                entry.path.startsWith('runtimePropertyGovernance.')
            )
                throw new CLASSES.NodicsError(
                    'ERR_SYS_00002',
                    'Property governance controls require deployment configuration',
                );
            const patch = {};
            _.set(
                patch,
                entry.path,
                entry.absent === true ? null : entry.value,
            );
            SERVICE.DefaultRuntimeConfigurationPreviewService.validatePropertyConfiguration(
                patch,
            );
        }
        return record;
    },
    /** Preserves subtree replacement intent while merging later changed descendants into an existing override. @param {Array} previous Committed overrides. @param {Array} entries Changed snapshot values. @returns {Array} Nonoverlapping overrides. */
    mergeOverrides: function (previous, entries) {
        const values = new Map(
            _.cloneDeep(previous).map((entry) => [entry.path, entry]),
        );
        for (const entry of _.cloneDeep(entries)) {
            const parent = [...values.keys()].find((path) =>
                entry.path.startsWith(path + '.'),
            );
            if (parent) {
                const ancestor = values.get(parent);
                if (entry.absent === true) {
                    if (ancestor.absent !== true)
                        _.unset(
                            ancestor.value,
                            entry.path.slice(parent.length + 1),
                        );
                } else {
                    if (!_.isPlainObject(ancestor.value)) ancestor.value = {};
                    delete ancestor.absent;
                    _.set(
                        ancestor.value,
                        entry.path.slice(parent.length + 1),
                        entry.value,
                    );
                }
            } else {
                for (const path of values.keys())
                    if (path.startsWith(entry.path + '.')) values.delete(path);
                values.set(entry.path, entry);
            }
        }
        return [...values.values()];
    },
    /** Reads one uncached tenant record and rejects duplicate, foreign or malformed persistence results. @param {Object} request Trusted request. @returns {Promise<Object|null>} Current record. */
    read: async function (request) {
        const scope = this.scope(request);
        const response = await this.store().get({
            ...this.persistenceOptions(),
            tenant: scope.tenant,
            authData: request.authData,
            query: { code: scope.code },
            searchOptions: { pageSize: 2, pageNumber: 1 },
            options: { recursive: false, skipItemCache: true },
        });
        if (
            !response ||
            !/^SUC_/.test(response.code || '') ||
            response.error ||
            response.success === false ||
            (response.errors !== undefined &&
                (!Array.isArray(response.errors) || response.errors.length)) ||
            !Array.isArray(response.result) ||
            response.result.length > 1
        )
            throw new CLASSES.NodicsError(
                'ERR_SYS_00001',
                'Runtime property read was not acknowledged',
            );
        return response.result.length
            ? this.validate(response.result[0], scope)
            : null;
    },
    /** Applies only committed override paths, preserving unrelated effective properties. @param {Object} request Trusted request. @param {Object} record Committed record. @returns {Object} Safe receipt. */
    apply: function (request, record) {
        const scope = this.scope(request);
        this.validate(record, scope);
        const applied = this.appliedRevisions.get(scope.tenant);
        if (applied && applied.sequence > record.governedProperties.sequence)
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'An obsolete property read cannot replace newer runtime state',
            );
        if (
            applied &&
            applied.sequence === record.governedProperties.sequence &&
            applied.revision !== record.revision
        )
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Property revision history is inconsistent',
            );
        const effective = _.cloneDeep(CONFIG.getProperties(scope.tenant) || {});
        for (const entry of record.governedProperties.values) {
            if (entry.absent === true) _.unset(effective, entry.path);
            else _.set(effective, entry.path, _.cloneDeep(entry.value));
        }
        CONFIG.setProperties(effective, scope.tenant);
        this.appliedRevisions.set(scope.tenant, {
            sequence: record.governedProperties.sequence,
            revision: record.revision,
        });
        return {
            tenant: scope.tenant,
            revision: record.revision,
            applied: true,
        };
    },
    /** Refreshes from authoritative storage; events never carry executable configuration. @param {Object} request Trusted request. @returns {Promise<Object|null>} Committed record. */
    refresh: async function (request) {
        if (!this.policy().enabled) return null;
        const record = await this.read(request);
        if (record) this.apply(request, record);
        else if (this.appliedRevisions.has(this.scope(request).tenant))
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Previously committed property state is missing',
            );
        return record;
    },
    /** Restores all locally active tenants before startup completes; opted-in storage failures block readiness. @returns {Promise<boolean>} Restored. */
    restore: async function () {
        if (!this.policy().enabled) return true;
        const tenants = NODICS.getActiveTenants();
        if (!Array.isArray(tenants))
            throw new CLASSES.NodicsError(
                'ERR_SYS_00001',
                'Active tenant inventory is required',
            );
        for (const tenant of tenants) await this.refresh({ tenant });
        return true;
    },
    /** Refreshes and binds the approved preview to the persisted revision, without a write. @param {Object} request Trusted request. @param {Object} descriptor Property proposal. @returns {Promise<Object>} Bound preview. */
    preview: async function (request, descriptor) {
        const current = await this.refresh(request);
        this.assertRollbackTarget(descriptor.configuration, current, request);
        return {
            ...SERVICE.DefaultRuntimeConfigurationPreviewService.createPropertyPreview(
                descriptor,
            ),
            persistenceRevision: current ? current.revision : null,
        };
    },
    /** Builds a compensating proposal from authoritative audit evidence; this only prepares a new approval request, never applies it.
     * @param {Object} request Trusted tenant context.
     * @param {string} revision Committed revision to reverse.
     * @returns {Promise<Object>} Versioned property proposal.
     */
    prepareRollback: async function (request, revision) {
        if (
            !this.policy().enabled ||
            typeof revision !== 'string' ||
            !/^[a-f0-9]{64}$/.test(revision)
        ) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'A durable property revision is required',
            );
        }
        const current = await this.refresh(request);
        const change =
            current &&
            current.governedProperties.audit.find(
                (entry) => entry.revision === revision,
            );
        if (!change)
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Property rollback evidence is unavailable',
            );
        const configuration = {
            $propertyPatch: {
                version: 1,
                ..._.cloneDeep(change.previousSnapshot),
                rollbackRevision: revision,
            },
        };
        SERVICE.DefaultRuntimeConfigurationPreviewService.validatePropertyCommand(
            configuration,
        );
        this.assertRollbackTarget(configuration, current, request);
        return configuration;
    },
    /** Rejects stale or forged rollback commands before preview and again at commit.
     * @param {Object} configuration Submitted literal patch.
     * @param {Object|null} current Authoritative record.
     * @param {Object} request Trusted tenant context.
     * @returns {void} Throws on missing evidence or intervening path changes.
     */
    assertRollbackTarget: function (configuration, current, request) {
        const command = configuration && configuration.$propertyPatch;
        if (!command || command.rollbackRevision === undefined) return;
        const change =
            current &&
            current.governedProperties.audit.find(
                (entry) => entry.revision === command.rollbackRevision,
            );
        const preview = SERVICE.DefaultRuntimeConfigurationPreviewService;
        if (
            !change ||
            !_.isEqual(
                { values: command.values, missingPaths: command.missingPaths },
                change.previousSnapshot,
            )
        ) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Property rollback does not match recorded evidence',
            );
        }
        const paths = change.nextSnapshot.values
            .map((entry) => entry.path)
            .concat(change.nextSnapshot.missingPaths);
        const actual = preview.createPropertySnapshot(
            CONFIG.getProperties(this.scope(request).tenant) || {},
            paths,
        );
        if (!_.isEqual(actual, change.nextSnapshot)) {
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Property rollback is stale; affected paths changed',
            );
        }
    },
    /** Commits approved values and their actor/reason/digest evidence in one acknowledged insert or CAS; uncertain writes are not retried. @param {Object} request Claimed activation. @param {Object} configuration Approved patch. @param {Object} preview Approved preview. @returns {Promise<Object>} Durable result and propagation status. */
    commit: async function (request, configuration, preview) {
        const policy = this.policy(),
            scope = this.scope(request);
        if (!policy.enabled)
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Durable property persistence is disabled',
            );
        const approval =
            await SERVICE.DefaultRuntimeConfigurationActivationPolicyService.resolveApproval(
                request,
                {
                    configurationType: 'propertyConfiguration',
                    configurationCode: 'tenantProperties',
                },
            );
        if (!approval.approved)
            throw new CLASSES.NodicsError(
                'ERR_AUTH_00003',
                'A claimed property approval is required',
            );
        const current = await this.refresh(request);
        if (current?.propertyReadFence != null)
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Governed properties are held by an owner operation; inspect its outcome before changing policy',
            );
        this.assertRollbackTarget(configuration, current, request);
        const fresh =
            SERVICE.DefaultRuntimeConfigurationPreviewService.createPropertyPreview(
                {
                    configurationType: 'propertyConfiguration',
                    tenant: scope.tenant,
                    configuration,
                },
            );
        if (
            !preview ||
            preview.persistenceRevision !==
                (current ? current.revision : null) ||
            !_.isEqual(preview.previousSnapshot, fresh.previousSnapshot) ||
            !_.isEqual(preview.nextSnapshot, fresh.nextSnapshot)
        )
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Property preview is stale; create a new request',
            );
        if (fresh.changedPaths.length === 0)
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Property activation contains no changes',
            );
        const audit = current ? current.governedProperties.audit.slice() : [];
        if (audit.length >= policy.maximumChanges)
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Property audit capacity requires governed archival',
            );
        const values = this.mergeOverrides(
            current ? current.governedProperties.values : [],
            fresh.nextSnapshot.values.concat(
                fresh.nextSnapshot.missingPaths.map((path) => ({
                    path,
                    absent: true,
                })),
            ),
        );
        const actor =
            SERVICE.DefaultRuntimeConfigurationActivationPolicyService.resolveRequestedBy(
                request,
            );
        const revision = crypto.randomBytes(32).toString('hex');
        audit.push({
            activationRequestCode: request.activationRequestCode,
            actor,
            approvedBy: approval.approvedBy,
            reason: approval.approvalReason,
            at: new Date().toISOString(),
            revision,
            previousSnapshot: fresh.previousSnapshot,
            nextSnapshot: fresh.nextSnapshot,
        });
        const record = {
            code: scope.code,
            active: true,
            ownerModule: 'dynamo',
            schemaCode: 'tenantProperties',
            tenant: scope.tenant,
            scope: { level: 'tenant', code: scope.tenant },
            fields: {},
            status: 'CONFIGURED',
            revision,
            governedProperties: {
                values,
                audit,
                sequence: current ? current.governedProperties.sequence + 1 : 1,
            },
            updatedAt: new Date().toISOString(),
        };
        this.validate(record, scope);
        const response = current
            ? await this.store().update({
                  ...this.persistenceOptions(),
                  tenant: scope.tenant,
                  authData: request.authData,
                  query: {
                      code: scope.code,
                      revision: current.revision,
                      propertyReadFence: null,
                  },
                  model: {
                      governedProperties: record.governedProperties,
                      revision,
                      updatedAt: record.updatedAt,
                  },
              })
            : await this.store().save({
                  ...this.persistenceOptions(),
                  tenant: scope.tenant,
                  authData: request.authData,
                  model: record,
                  options: { insertOnly: true },
              });
        const acknowledged =
            response &&
            /^SUC_/.test(response.code || '') &&
            !response.error &&
            response.success !== false &&
            (response.errors === undefined ||
                (Array.isArray(response.errors) &&
                    response.errors.length === 0)) &&
            response.result &&
            !response.result.error &&
            response.result.success !== false &&
            (response.result.errors === undefined ||
                (Array.isArray(response.result.errors) &&
                    response.result.errors.length === 0)) &&
            (current
                ? response.result.matchedCount === 1 &&
                  response.result.acknowledged !== false
                : response.result.code === scope.code &&
                  response.result.revision === revision);
        if (!acknowledged)
            throw new CLASSES.NodicsError(
                'ERR_SYS_00002',
                'Property commit is stale or uncertain; refresh before recovery',
            );
        this.apply(request, record);
        let propagation = 'PENDING';
        try {
            if (
                SERVICE.DefaultEventService &&
                typeof SERVICE.DefaultEventService.publish === 'function'
            ) {
                const published = await SERVICE.DefaultEventService.publish({
                    tenant: scope.tenant,
                    event: 'runtimeConfigurationChanged',
                    data: {
                        code: scope.code,
                        schemaCode: 'tenantProperties',
                        revision,
                    },
                });
                if (published && /^SUC_/.test(published.code || ''))
                    propagation = 'PUBLISHED';
            }
        } catch {
            /* The durable record remains authoritative; refresh and startup can recover. */
        }
        return {
            code: 'SUC_SYS_00000',
            data: {
                tenant: scope.tenant,
                revision,
                durable: true,
                propagation,
                changedPaths: fresh.changedPaths,
            },
        };
    },
};

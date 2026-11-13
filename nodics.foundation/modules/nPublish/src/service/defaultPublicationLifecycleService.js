/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const administrativeOperations = new WeakMap();
const retryValidations = new WeakMap();
const crypto = require('node:crypto');

/**
 * @module nPublish/service/DefaultPublicationLifecycleService
 * @description Orchestrates the provider-neutral publication lifecycle with governed transitions, CAS revisions, audit, activation, and rollback.
 * @layer service
 * @owner nPublish
 * @override Later modules may replace providers or orchestration while preserving lifecycle, audit, idempotency, tenant, and rollback contracts.
 */
module.exports = {
    /** Runs one native domain command through the ordinary lifecycle, with fresh domain proof at each journal write. */
    executeAdministrativeOperation: async function (publication, request, operation) {
        if (!['validate', 'requestApproval', 'activate'].includes(operation) || administrativeOperations.has(request))
            throw new Error('Unsupported native publication operation');
        const adapter = this.getDomainAdapter(publication.domain);
        if (!adapter.authorizeAdministrativeOperation) throw new Error('Native publication owner unavailable');
        const configuration = structuredClone(this.getConfiguration());
        const contexts = [request];
        const guard = async (candidate, current = publication) => {
            if (!require('node:util').isDeepStrictEqual(configuration, this.getConfiguration()) ||
                this.getDomainAdapter(publication.domain) !== adapter ||
                !require('node:util').isDeepStrictEqual(candidate.authData, request.authData) ||
                candidate.tenant !== request.tenant || candidate.enterpriseCode !== request.enterpriseCode ||
                candidate.publicationCode !== publication.code)
                throw new Error('Native publication continuation changed');
            await adapter.authorizeAdministrativeOperation(current, request, operation);
        };
        administrativeOperations.set(request, { guard, contexts });
        try { await guard(request); const result = await this[operation](request); await guard(request); return result; }
        finally { contexts.forEach(context => administrativeOperations.delete(context)); }
    },
    /** Only lifecycle-owned revision copies inherit an in-flight guard; caller spreads never acquire one. */
    copyRequest: function (request, fields) {
        const copy = Object.assign({}, request, fields), context = administrativeOperations.get(request);
        if (context) { administrativeOperations.set(copy, context); context.contexts.push(copy); }
        return copy;
    },
    /** Initializes publication lifecycle orchestration. */
    init: function () { return Promise.resolve(true); },
    /** Completes publication lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the effective layered publish configuration. */
    getConfiguration: function () { return CONFIG.get('publish') || {}; },
    /** Resolves a provider object or named Nodics service. */
    resolveProvider: function (reference) {
        if (reference && typeof reference === 'object') return reference;
        return reference && SERVICE[reference];
    },
    /** Resolves the configured publication repository. */
    getRepository: function () {
        let provider = this.resolveProvider((this.getConfiguration().providers || {}).repositoryProvider);
        if (!provider) throw new CLASSES.NodicsError('ERR_PUB_00001', 'Publication repository provider is unavailable');
        return provider;
    },
    /** Resolves the configured immutable version provider. */
    getVersionProvider: function (domain) {
        let providers = this.getConfiguration().providers || {};
        let provider = this.resolveProvider((providers.versionProviders || {})[domain] || providers.versionProvider);
        if (!provider) throw new CLASSES.NodicsError('ERR_PUB_00001', 'Publication version provider is unavailable');
        return provider;
    },
    /** Resolves the configured adapter for one business domain. */
    getDomainAdapter: function (domain) {
        let reference = ((this.getConfiguration().providers || {}).domainAdapters || {})[domain];
        let provider = this.resolveProvider(reference);
        if (!provider) throw new CLASSES.NodicsError('ERR_PUB_00002', 'Publication domain adapter is unavailable: ' + domain);
        return provider;
    },
    /** Resolves a domain workflow override without silently falling back from an invalid explicit selection. */
    getWorkflowProvider: function (domain) {
        let providers = this.getConfiguration().providers || {};
        let overrides = providers.workflowProviders || {};
        let explicit = Object.prototype.hasOwnProperty.call(overrides, domain);
        let reference = explicit ? overrides[domain] : providers.workflowProvider;
        let provider = this.resolveProvider(reference);
        if ((explicit || reference) && (!provider || typeof provider.requestApproval !== 'function')) {
            throw new CLASSES.NodicsError('ERR_PUB_00001', 'Publication workflow provider is unavailable');
        }
        return provider;
    },
    /** Resolves a safe actor identifier from authenticated context. */
    getActor: function (request) {
        let auth = request && request.authData || {};
        return String(auth.principalId || auth.code || auth.loginId || 'system');
    },
    /** Returns one tenant-scoped publication lifecycle record through the configured repository. */
    get: async function (request) {
        if (!request || !request.publicationCode) throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication code is required');
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (!publication) throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication request was not found');
        return publication;
    },
    /** Projects business eligibility for existing operator commands without granting route permission or changing the stored request. */
    inspect: async function (request) {
        const publication = await this.get(request);
        let operatorOperations = [], operatorGuidance = 'Continue review and publishing from the source workspace. Recorded history remains available here.';
        try {
            const provider = this.getVersionProvider(publication.domain);
            if (publication.state === 'FAILED') {
                const failed = this.failedOperation(publication);
                if (['ROLLING_BACK', 'WITHDRAWING'].includes(failed)) {
                    if (provider.targetCommandReceiptContract === 'v1') this.originalTargetCommand(publication, failed === 'ROLLING_BACK' ? 'ROLLBACK' : 'WITHDRAWAL');
                    else if (failed !== 'ROLLING_BACK' || !provider.canRetryRejectedRollback ||
                        await provider.canRetryRejectedRollback(publication, request) !== true) throw new Error('Original command recovery is not qualified');
                    operatorGuidance = provider.targetCommandReceiptContract === 'v1'
                        ? 'Resume the original failed operation. Its target receipt is retained; this does not activate another version.'
                        : 'The owner confirmed this restore was rejected before changing Online content. Retry restores the same predecessor after checking the current release again.';
                } else operatorGuidance = 'Retry revalidates the original request. Normal review and approval remain required before activation.';
                operatorOperations = ['retry'];
            } else if (publication.state === 'ONLINE') {
                const hasPredecessor = typeof publication.previousOnlineVersion === 'string' && publication.previousOnlineVersion && typeof provider.rollback === 'function';
                operatorOperations = hasPredecessor ? ['rollback'] : [];
                operatorGuidance = hasPredecessor ? 'Restore the previous published version for this request. Restoration is blocked if another publication has replaced it.' : 'No previous published version is retained for this request. Check current delivery from its working record.';
                if (provider.targetCommandReceiptContract === 'v1') {
                    if (typeof provider.getOnlineVersion !== 'function') throw new Error('Current target inspection is unavailable');
                    const current = await provider.getOnlineVersion(publication, request);
                    if (!current || typeof current !== 'object' || Array.isArray(current) || current.success === false || current.acknowledged === false || current.error ||
                        current.errors !== undefined && (!Array.isArray(current.errors) || current.errors.length) ||
                        [current.code, current.responseCode].some(code => typeof code === 'string' && code.startsWith('ERR_')) ||
                        !(current.version === null || typeof current.version === 'string' && current.version)) throw new Error('Current target evidence is unverified');
                    if (current.version !== publication.targetVersion) {
                        operatorOperations = [];
                        operatorGuidance = 'A different version or no copy is currently deployed. Inspect current delivery in the source workspace; this historical request cannot replace it.';
                    }
                }
                if (operatorOperations.includes('rollback') && provider.assertRollbackTarget) {
                    try {
                        await provider.assertRollbackTarget(publication, request);
                    } catch (_) {
                        operatorOperations = [];
                        operatorGuidance = 'Refresh Publishing and inspect the current Online release before restoring a version.';
                    }
                }
            } else if (['ROLLING_BACK', 'WITHDRAWING'].includes(publication.state)) {
                const kind = publication.state === 'ROLLING_BACK' ? 'ROLLBACK' : 'WITHDRAWAL';
                if (provider.targetCommandReceiptContract !== 'v1' || typeof provider[kind === 'ROLLBACK' ? 'rollback' : 'withdraw'] !== 'function') throw new Error('Original command recovery is not qualified');
                this.originalTargetCommand(publication, kind);
                operatorOperations = [kind === 'ROLLBACK' ? 'rollback' : 'withdraw'];
                operatorGuidance = 'Resume only this retained in-flight operation. Its original target identity remains unchanged.';
            }
        } catch (_) {
            operatorOperations = [];
            operatorGuidance = 'Original operation evidence or its domain provider is unverified. Review the recorded history with the owning administrator; no recovery command is offered.';
        }
        return Object.assign({}, publication, { operatorOperations, operatorGuidance });
    },
    /** Validates and returns the expected optimistic revision. */
    requireExpectedRevision: function (request, publication) {
        let expected = request && request.expectedRevision;
        if ((this.getConfiguration().lifecycle || {}).requireExpectedRevision !== false && expected === undefined) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Expected publication revision is required');
        }
        if (expected !== undefined && Number(expected) !== Number(publication.revision || 0)) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication revision conflict');
        }
        return Number(publication.revision || 0);
    },
    /** Classifies a failed operation from the current authoritative journal entry, never from error wording or caller flags. */
    failedOperation: function (publication) {
        const entry = Array.isArray(publication.auditTrail) && publication.auditTrail.at(-1);
        if (publication.state !== 'FAILED' || !entry || entry.publicationCode !== publication.code || entry.toState !== 'FAILED' ||
            entry.revision !== publication.revision || !['VALIDATING', 'ACTIVATING', 'ROLLING_BACK', 'WITHDRAWING'].includes(entry.fromState)) {
            throw new CLASSES.NodicsError('ERR_PUB_00005', 'The original failed publication operation is unverified; inspect its owner journal');
        }
        return entry.fromState;
    },
    /** Builds optional qualified command intent for the transition journal before any rollback/withdrawal target effect. */
    captureTargetCommand: function (publication, operation) {
        const targetVersion = operation === 'ROLLBACK' ? publication.previousOnlineVersion : publication.targetVersion;
        const text = (value, maximum = 1024) => typeof value === 'string' && value.trim() === value && value.length > 0 && value.length <= maximum && !/[\u0000-\u001f\u007f]/.test(value);
        if (!['ROLLBACK', 'WITHDRAWAL'].includes(operation) || !Number.isSafeInteger(publication.revision) || publication.revision < 0 || !Number.isSafeInteger(publication.revision + 1) ||
            ![publication.code, publication.domain, publication.rootType, publication.rootCode, publication.sourceVersion].every(value => text(value, 256)) ||
            !text(publication.activationOperation?.key, 1000) ||
            !text(targetVersion, 131072)) throw new CLASSES.NodicsError('ERR_PUB_00006', 'Exact publication source, activation and target identity are required for this command');
        const originRevision = publication.revision + 1;
        return { contractVersion: 1, operation, operationKey: publication.code + (operation === 'ROLLBACK' ? ':rollback:' : ':withdraw:') + String(originRevision),
            publicationCode: publication.code, domain: publication.domain, rootType: publication.rootType, rootCode: publication.rootCode,
            sourceVersion: publication.sourceVersion, activationKey: publication.activationOperation.key,
            targetVersionHash: crypto.createHash('sha256').update(JSON.stringify(targetVersion)).digest('hex'), originRevision };
    },
    /** Resolves the original qualified intent through one contiguous operation/failure chain in the existing journal; no new lifecycle store exists. */
    originalTargetCommand: function (publication, operation) {
        const transient = operation === 'ROLLBACK' ? 'ROLLING_BACK' : 'WITHDRAWING';
        const trail = publication.auditTrail;
        if (!Array.isArray(trail) || !trail.length || ![transient, 'FAILED'].includes(publication.state)) throw new CLASSES.NodicsError('ERR_PUB_00006', 'Original publication command evidence is unavailable');
        let revision = publication.revision, state = publication.state, candidate;
        const same = require('node:util').isDeepStrictEqual;
        for (let index = trail.length - 1; index >= 0; index--) {
            const entry = trail[index], proof = entry?.details?.targetCommandOperation;
            if (!entry || entry.publicationCode !== publication.code || entry.revision !== revision || entry.toState !== state ||
                ![transient, 'FAILED'].includes(state) || !proof || candidate && !same(candidate, proof)) break;
            candidate = candidate || proof;
            if (state === transient && entry.fromState === 'ONLINE') {
                const expected = this.captureTargetCommand(Object.assign({}, publication, { revision: entry.revision - 1 }), operation);
                if (!same(candidate, expected)) break;
                return Object.assign({}, candidate);
            }
            if (state === 'FAILED' && entry.fromState !== transient || state === transient && entry.fromState !== 'FAILED') break;
            state = entry.fromState; revision--;
        }
        throw new CLASSES.NodicsError('ERR_PUB_00006', 'The original publication command journal is incomplete or changed; inspect before retrying');
    },
    /** Validates an opted-in provider command receipt against retained journal intent before lifecycle completion or derived hooks. */
    targetCommandReceipt: function (provider, publication, proof, result) {
        if (provider.targetCommandReceiptContract === undefined) return;
        const receipt = result && result.receipt;
        const targetVersion = proof?.operation === 'ROLLBACK' ? publication.previousOnlineVersion : publication.targetVersion;
        if (provider.targetCommandReceiptContract !== 'v1' || !proof || !result || typeof result !== 'object' || Array.isArray(result) || !receipt || typeof receipt !== 'object' || Array.isArray(receipt) ||
            result.success === false || result.acknowledged === false || result.error || receipt.success === false || receipt.acknowledged === false || receipt.error ||
            receipt.errors !== undefined && (!Array.isArray(receipt.errors) || receipt.errors.length) ||
            [result.code, result.responseCode, receipt.code, receipt.responseCode].some(code => typeof code === 'string' && code.startsWith('ERR_')) ||
            result.errors !== undefined && (!Array.isArray(result.errors) || result.errors.length) ||
            receipt.operationKey !== proof.operationKey || receipt.operation !== proof.operation || receipt.publicationCode !== publication.code ||
            receipt.rootCode !== publication.rootCode || receipt.sourceVersion !== publication.sourceVersion || receipt.targetVersion !== targetVersion ||
            typeof targetVersion !== 'string' || !targetVersion ||
            crypto.createHash('sha256').update(JSON.stringify(targetVersion)).digest('hex') !== proof.targetVersionHash ||
            !Number.isSafeInteger(receipt.affected) || receipt.affected < 0) throw new CLASSES.NodicsError('ERR_PUB_00006', 'Qualified publication command receipt is invalid');
    },
    /** Verifies that a configured lifecycle transition is permitted. */
    assertTransition: function (fromState, toState) {
        let transitions = (this.getConfiguration().lifecycle || {}).transitions || {};
        if (!Array.isArray(transitions[fromState]) || !transitions[fromState].includes(toState)) {
            throw new CLASSES.NodicsError('ERR_PUB_00005', 'Invalid publication transition: ' + fromState + ' -> ' + toState);
        }
    },
    /** Produces bounded audit evidence without credential-like fields. */
    sanitizeEvidence: function (value) {
        if (value === undefined || value === null) return value;
        if (Array.isArray(value)) return value.slice(0, 100).map(item => this.sanitizeEvidence(item));
        if (typeof value !== 'object') return typeof value === 'string' ? value.slice(0, 1000) : value;
        let output = {};
        Object.keys(value).slice(0, 100).forEach(key => {
            if (!/authorization|token|secret|password|credential/i.test(key)) output[key] = this.sanitizeEvidence(value[key]);
        });
        return output;
    },
    /** Persists one governed transition and its immutable audit evidence. */
    transition: async function (publication, toState, request, patch, evidence) {
        const native = administrativeOperations.get(request);
        if (native) await native.guard(request, publication);
        this.assertTransition(publication.state, toState);
        let expected = this.requireExpectedRevision(request, publication);
        let audit = { publicationCode: publication.code, fromState: publication.state,
            toState: toState, actor: this.getActor(request), reason: request && request.reason,
            details: this.sanitizeEvidence(evidence), correlationId: request && (request.correlationId || request.requestId) };
        const result = await this.getRepository().transitionWithAudit(publication, expected,
            Object.assign({}, patch || {}, { state: toState, updatedBy: this.getActor(request) }), audit, request);
        if (native) await native.guard(request, result);
        return result;
    },
    /** Creates an idempotent staged publication request. */
    create: async function (request) {
        let input = request && request.publication || {};
        ['code', 'domain', 'rootType', 'rootCode', 'sourceVersion'].forEach(field => {
            if (!input[field]) throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication ' + field + ' is required');
        });
        this.getDomainAdapter(input.domain);
        let actor = this.getActor(request);
        let initialState = (this.getConfiguration().lifecycle || {}).initialState || 'STAGED';
        let model = Object.assign({}, input, { active: true,
            state: initialState, revision: 0, requestedBy: actor, correlationId: request.correlationId || request.requestId,
            auditTrail: [{ publicationCode: input.code, toState: initialState, revision: 0,
                actor: actor, reason: request.reason, correlationId: request.correlationId || request.requestId }] });
        let created = await this.getRepository().create(model, request);
        if (Number(created.revision || 0) === 0) await this.getRepository().appendAudit(created.auditTrail[0], request).catch(() => false);
        return created;
    },
    /** Resolves dependencies and validates the immutable staged version. */
    validate: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (!publication) throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication request was not found');
        if (publication.state === 'VALIDATED') return publication;
        if (publication.state !== 'VALIDATING') publication = await this.transition(publication, 'VALIDATING', request,
            publication.state === 'ONLINE' ? { activationOperation: null } : {});
        try {
            let adapter = this.getDomainAdapter(publication.domain);
            let provider = this.getVersionProvider(publication.domain);
            let version = await provider.getVersion(publication, request);
            let dependencies = adapter.resolveDependencies ? await adapter.resolveDependencies(publication, version, request) : [];
            let configuredMax = (this.getConfiguration().lifecycle || {}).maxDependencies;
            let max = configuredMax === undefined ? 10000 : Number(configuredMax);
            if (!Array.isArray(dependencies) || dependencies.length > max) throw new CLASSES.NodicsError('ERR_PUB_00006', 'Publication dependency boundary exceeded');
            let validation = adapter.validate ? await adapter.validate(publication, version, request, dependencies) : { valid: true };
            if (!validation || validation.valid !== true) throw new CLASSES.NodicsError('ERR_PUB_00006', 'Publication validation failed');
            return await this.transition(publication, 'VALIDATED', this.copyRequest(request, { expectedRevision: publication.revision }),
                { dependencies: dependencies, validation: this.sanitizeEvidence(validation) }, validation);
        } catch (error) {
            await this.transition(publication, 'FAILED', this.copyRequest(request, { expectedRevision: publication.revision }), {},
                { failureCode: error.code || error.name || 'VALIDATION_FAILED' }).catch(() => false);
            throw error;
        }
    },
    /** Moves a validated publication into governed approval. */
    requestApproval: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        let workflow = this.getWorkflowProvider(publication && publication.domain);
        if (publication && publication.state === 'PENDING_APPROVAL') {
            if (workflow && workflow.requestApproval) await workflow.requestApproval(publication, request);
            return publication;
        }
        let pending = Object.assign({}, publication, { revision: Number(publication.revision || 0) + 1 });
        let workflowRef = workflow && workflow.reference ? workflow.reference(pending) : undefined;
        let requesterEvidence = workflow && workflow.approvalEvidence ? await workflow.approvalEvidence(pending, request) : {};
        let updated = await this.transition(publication, 'PENDING_APPROVAL', request,
            workflowRef ? { workflowRef: workflowRef } : {},
            workflowRef ? { workflow: Object.assign({}, requesterEvidence, { instanceCode: workflowRef }) } : undefined);
        if (workflow && workflow.requestApproval) await workflow.requestApproval(updated, request);
        return updated;
    },
    /** Records approval for a pending publication. */
    approve: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (publication && publication.state === 'APPROVED') return publication;
        let workflow = request && request.workflowEvidence;
        return this.transition(publication, 'APPROVED', request,
            workflow && workflow.instanceCode ? { workflowRef: workflow.instanceCode } : {},
            workflow ? { workflow: workflow } : undefined);
    },
    /** Records rejection for a pending publication. */
    reject: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (publication && publication.state === 'REJECTED') return publication;
        let workflow = request && request.workflowEvidence;
        return this.transition(publication, 'REJECTED', request,
            workflow && workflow.instanceCode ? { workflowRef: workflow.instanceCode } : {},
            workflow ? { workflow: workflow } : undefined);
    },
    /** Exposes the exact persisted issuer only during a runtime administrator's authorized retry validation. */
    retryValidationScope: function (request, publication) {
        const retained = retryValidations.get(request);
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        if (!retained || auth.tokenType !== 'access' || auth.principalType !== 'human' || auth.isSystem ||
            request.tenant !== auth.tenant || publication.tenantCode !== auth.tenant ||
            !['code', 'domain', 'rootCode', 'rootType', 'sourceVersion', 'enterpriseCode', 'tenantCode']
                .every(field => publication[field] === retained[field]) ||
            typeof retained.enterpriseCode !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(retained.enterpriseCode) ||
            !security) return undefined;
        const admitted = ['publish_publicationlifecycle_retry', 'publish_publicationoperations_recover'].some(name => {
            const router = NODICS.getRouter?.(name, 'publish');
            if (router?.secured !== true || router.active === false || !router.authTokenTypes?.includes('access') ||
                !Array.isArray(router.accessGroups) || !router.accessGroups.length ||
                !security.getRoutePermissions(router).length) return false;
            const scoped = { ...request, router };
            return security.hasAccessGroup(scoped) && security.hasRoutePermission(scoped);
        });
        if (!admitted) return undefined;
        return { tenant: retained.tenantCode, enterpriseCode: retained.enterpriseCode };
    },
    /** Revalidates a failed immutable publication before any later approval or activation attempt. */
    retry: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (!publication) throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication request was not found');
        if (publication.state !== 'FAILED') throw new CLASSES.NodicsError('ERR_PUB_00005', 'Only a failed publication can be retried');
        this.requireExpectedRevision(request, publication);
        const failed = this.failedOperation(publication);
        if (failed === 'ROLLING_BACK' || failed === 'WITHDRAWING') {
            const provider = this.getVersionProvider(publication.domain);
            if (provider.targetCommandReceiptContract !== 'v1' && (failed !== 'ROLLING_BACK' || !provider.canRetryRejectedRollback ||
                await provider.canRetryRejectedRollback(publication, request) !== true)) throw new CLASSES.NodicsError('ERR_PUB_00006', 'This domain requires qualified original-command recovery or proven pre-effect rejection before retry');
            return failed === 'ROLLING_BACK' ? this.rollback(request) : this.withdraw(request);
        }
        publication = await this.transition(publication, 'VALIDATING', request, {}, { retry: true });
        const validation = this.copyRequest(request, { expectedRevision: publication.revision });
        retryValidations.set(validation, publication);
        try { return await this.validate(validation); }
        finally { retryValidations.delete(validation); }
    },
    /** Re-enters validation after a terminal rollback, withdrawal, or rejection; approval must be requested again. */
    resubmit: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (!publication) throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication request was not found');
        if (!['ROLLED_BACK', 'WITHDRAWN', 'REJECTED'].includes(publication.state)) {
            throw new CLASSES.NodicsError('ERR_PUB_00005', 'Only a rolled back, withdrawn, or rejected publication can be resubmitted');
        }
        publication = await this.transition(publication, 'VALIDATING', request,
            Object.assign({ recoveryFromState: publication.state },
                ['ROLLED_BACK', 'WITHDRAWN'].includes(publication.state) ? { activationOperation: null } : {}),
            { resubmission: true, recoveryFromState: publication.state });
        return this.validate(Object.assign({}, request, { expectedRevision: publication.revision }));
    },
    /** Resumes an already-approved domain workflow release idempotently through validation and Online activation. */
    publishApproved: async function (request) {
        let publication = await this.create(request);
        let context = Object.assign({}, request, { publicationCode: publication.code });
        if (publication.state === 'ONLINE') return publication;
        if (publication.state === 'STAGED' || publication.state === 'VALIDATING') {
            publication = await this.validate(Object.assign({}, context, { expectedRevision: publication.revision }));
        }
        if (publication.state === 'VALIDATED' || publication.state === 'PENDING_APPROVAL') {
            publication = await this.approve(Object.assign({}, context, { expectedRevision: publication.revision }));
        }
        if (publication.state === 'APPROVED' || publication.state === 'ACTIVATING') {
            publication = await this.activate(Object.assign({}, context, { expectedRevision: publication.revision }));
        }
        if (publication.state !== 'ONLINE') {
            throw new CLASSES.NodicsError('ERR_PUB_00005', 'Approved publication cannot resume from state: ' + publication.state);
        }
        return publication;
    },
    /** Validates optional qualified target evidence; target atomicity remains provider-owned. */
    activationReceipt: function (provider, publication, activation) {
        if (provider.targetReceiptContract === undefined) return null;
        const receipt = activation && activation.receipt;
        if (provider.targetReceiptContract !== 'v1' || !receipt ||
            receipt.operationKey !== publication.activationOperation.key ||
            receipt.publicationCode !== publication.code || receipt.sourceVersion !== publication.sourceVersion ||
            typeof receipt.targetVersion !== 'string' || !receipt.targetVersion ||
            receipt.targetVersion !== activation.version ||
            !(receipt.previousOnlineVersion === null ||
                (typeof receipt.previousOnlineVersion === 'string' && receipt.previousOnlineVersion.length > 0))) {
            throw new CLASSES.NodicsError('ERR_PUB_00006', 'Qualified target activation receipt is invalid');
        }
        return receipt;
    },
    /** Activates an approved source version and records the previous Online version. */
    activate: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (publication && publication.state === 'ONLINE') return publication;
        if (!publication) throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication request was not found');
        this.requireExpectedRevision(request, publication);
        const provider = this.getVersionProvider(publication.domain);
        if (publication.state !== 'ACTIVATING') {
            this.assertTransition(publication.state, 'ACTIVATING');
            this.requireExpectedRevision(request, publication);
            // A failed response or completion hook does not prove the target failed to commit.
            let operation = publication.activationOperation;
            if (!operation) {
                const previous = provider.getOnlineVersion ? await provider.getOnlineVersion(publication, request) : null;
                operation = { key: publication.code + ':activate:' + String(Number(publication.revision) + 1),
                previousOnlineVersion: (typeof previous === 'string' ? previous : previous && previous.version) || null };
                if (previous && typeof previous === 'object' && previous.revision !== undefined) {
                    if (!Number.isSafeInteger(previous.revision) || previous.revision < 0) {
                        throw new CLASSES.NodicsError('ERR_PUB_00004', 'Target predecessor revision is invalid');
                    }
                    operation.previousOnlineRevision = previous.revision;
                }
            }
            publication = await this.transition(publication, 'ACTIVATING', request, {
                activationOperation: operation
            });
        }
        try {
            // Historical in-flight requests retain their original revision-derived operation identity.
            if (!publication.activationOperation) publication = Object.assign({}, publication, {
                activationOperation: { key: publication.code + ':activate:' + String(publication.revision) }
            });
            let activation = await provider.activate(publication, request);
            const receipt = this.activationReceipt(provider, publication, activation);
            let adapter = this.getDomainAdapter(publication.domain);
            if (adapter.afterActivate) await adapter.afterActivate(publication, activation, request);
            let patch = { targetVersion: activation && activation.version || publication.sourceVersion };
            const previousOnlineVersion = receipt ? receipt.previousOnlineVersion :
                activation && Object.prototype.hasOwnProperty.call(activation, 'previousOnlineVersion') &&
                    activation.previousOnlineVersion !== undefined ? activation.previousOnlineVersion :
                    publication.activationOperation.previousOnlineVersion;
            if (previousOnlineVersion || publication.previousOnlineVersion || receipt) {
                patch.previousOnlineVersion = previousOnlineVersion || null;
            }
            patch.activationOperation = publication.activationOperation;
            return await this.transition(publication, 'ONLINE', this.copyRequest(request, { expectedRevision: publication.revision }),
                patch, activation);
        } catch (error) {
            await this.transition(publication, 'FAILED', this.copyRequest(request, { expectedRevision: publication.revision }), {},
                { failureCode: error.code || error.name || 'ACTIVATION_FAILED' }).catch(() => false);
            throw error;
        }
    },
    /** Restores the captured previous Online version idempotently. */
    rollback: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (publication && publication.state === 'ROLLED_BACK') return publication;
        if (!publication) throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication request was not found');
        this.requireExpectedRevision(request, publication);
        const provider = this.getVersionProvider(publication.domain), qualified = provider.targetCommandReceiptContract !== undefined;
        if (qualified && provider.targetCommandReceiptContract !== 'v1') throw new CLASSES.NodicsError('ERR_PUB_00006', 'Publication command receipt contract is unsupported');
        let proof;
        if (publication.state === 'FAILED') {
            if (this.failedOperation(publication) !== 'ROLLING_BACK') throw new CLASSES.NodicsError('ERR_PUB_00005', 'Only the original rollback can recover this failure');
            if (qualified) proof = this.originalTargetCommand(publication, 'ROLLBACK');
            else if (!provider.canRetryRejectedRollback || await provider.canRetryRejectedRollback(publication, request) !== true)
                throw new CLASSES.NodicsError('ERR_PUB_00006', 'A rejected rollback requires fresh owner proof that no target effect occurred');
        }
        if (publication.state !== 'ROLLING_BACK') {
            if (publication.state === 'ONLINE' && provider.assertRollbackTarget)
                await provider.assertRollbackTarget(publication, request);
            if (qualified && !proof) proof = this.captureTargetCommand(publication, 'ROLLBACK');
            publication = await this.transition(publication, 'ROLLING_BACK', request, {}, proof ? { targetCommandOperation: proof } : publication.state === 'FAILED' ? { retryAfterOwnerRejection: true, failedRevision: publication.revision } : undefined);
        }
        if (qualified) proof = this.originalTargetCommand(publication, 'ROLLBACK');
        try {
            let result = await provider.rollback(proof ? Object.assign({}, publication, { targetCommandOperation: proof }) : publication, publication.previousOnlineVersion, request);
            this.targetCommandReceipt(provider, publication, proof, result);
            let adapter = this.getDomainAdapter(publication.domain);
            if (adapter.afterRollback) await adapter.afterRollback(publication, result, request);
            return await this.transition(publication, 'ROLLED_BACK', this.copyRequest(request, { expectedRevision: publication.revision }), {}, result);
        } catch (error) {
            await this.transition(publication, 'FAILED', this.copyRequest(request, { expectedRevision: publication.revision }), {},
                Object.assign({ failureCode: error.code || error.name || 'ROLLBACK_FAILED' }, proof ? { targetCommandOperation: proof } : {})).catch(() => false);
            throw error;
        }
    },
    /** Withdraws the current Online version through the configured domain provider. */
    withdraw: async function (request) {
        let publication = await this.getRepository().get(request.publicationCode, request);
        if (publication && publication.state === 'WITHDRAWN') return publication;
        if (!publication) throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication request was not found');
        this.requireExpectedRevision(request, publication);
        const provider = this.getVersionProvider(publication.domain), qualified = provider.targetCommandReceiptContract !== undefined;
        if (qualified && provider.targetCommandReceiptContract !== 'v1') throw new CLASSES.NodicsError('ERR_PUB_00006', 'Publication command receipt contract is unsupported');
        let proof;
        if (publication.state === 'FAILED') {
            if (!qualified || this.failedOperation(publication) !== 'WITHDRAWING') throw new CLASSES.NodicsError('ERR_PUB_00005', 'Only the original qualified withdrawal can recover this failure');
            proof = this.originalTargetCommand(publication, 'WITHDRAWAL');
        } else if (publication.state !== 'ONLINE' && !(qualified && publication.state === 'WITHDRAWING')) throw new CLASSES.NodicsError('ERR_PUB_00005', 'Only an Online publication or its original qualified withdrawal can be withdrawn');
        if (publication.state !== 'WITHDRAWING') {
            if (qualified && !proof) proof = this.captureTargetCommand(publication, 'WITHDRAWAL');
            publication = await this.transition(publication, 'WITHDRAWING', request, {}, proof ? { targetCommandOperation: proof } : undefined);
        }
        if (qualified) proof = this.originalTargetCommand(publication, 'WITHDRAWAL');
        try {
            if (!provider.withdraw) throw new CLASSES.NodicsError('ERR_PUB_00002', 'Publication domain does not support withdrawal');
            let result = await provider.withdraw(proof ? Object.assign({}, publication, { targetCommandOperation: proof }) : publication, request);
            this.targetCommandReceipt(provider, publication, proof, result);
            let adapter = this.getDomainAdapter(publication.domain);
            if (adapter.afterWithdraw) await adapter.afterWithdraw(publication, result, request);
            return await this.transition(publication, 'WITHDRAWN', this.copyRequest(request, { expectedRevision: publication.revision }), {}, result);
        } catch (error) {
            await this.transition(publication, 'FAILED', this.copyRequest(request, { expectedRevision: publication.revision }), {}, Object.assign({ failureCode: error.code || error.name || 'WITHDRAWAL_FAILED' }, proof ? { targetCommandOperation: proof } : {})).catch(() => false);
            throw error;
        }
    }
};

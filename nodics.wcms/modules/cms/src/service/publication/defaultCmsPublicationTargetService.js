/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationTargetService
 * @description Imports, activates, reports, and rolls back immutable releases inside the independently deployed Online CMS target.
 * @layer service
 * @owner cms
 * @override Online project modules may replace target persistence while preserving integrity, idempotency, tenant, receipt, and pointer CAS contracts.
 */
const crypto = require('crypto');

module.exports = {
    /** Initializes target publication operations. */
    init: function () { return Promise.resolve(true); },
    /** Completes target publication initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Resolves target-local manifest orchestration. */
    manifests: function () { return SERVICE.DefaultCmsPublicationManifestOrchestrationService; },
    /** Proves the configured target database can provide the atomic context required by publication. */
    assertTransactionalReadiness: function (request) {
        let publication = (CONFIG.get('cms') || {}).publication || {};
        if (!SERVICE.DefaultDatabaseTransactionService ||
            typeof SERVICE.DefaultDatabaseTransactionService.capabilities !== 'function' ||
            typeof SERVICE.DefaultDatabaseTransactionService.execute !== 'function') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_TRANSACTION_UNAVAILABLE', 'CMS Online publication transaction authority is unavailable');
        }
        let capabilities = SERVICE.DefaultDatabaseTransactionService.capabilities({ tenant: request.tenant,
            moduleName: publication.transactionModuleName || 'cms' });
        if (!capabilities || capabilities.multiRecordAtomic !== true || capabilities.contextPropagation !== true) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_TRANSACTION_UNSUPPORTED',
                'CMS Online publication requires atomic multi-record transactions with context propagation');
        }
        return capabilities;
    },
    /** Executes one bounded target mutation through the provider-neutral transaction authority. */
    transaction: function (request, work) {
        let publication = (CONFIG.get('cms') || {}).publication || {};
        this.assertTransactionalReadiness(request);
        return SERVICE.DefaultDatabaseTransactionService.execute({
            tenant: request.tenant,
            moduleName: publication.transactionModuleName || 'cms'
        }, transactionContext => work(Object.assign({}, request, { transactionContext: transactionContext })));
    },
    /** Preserves the Staged correlation identity across target request composition. */
    applyCorrelation: function (request, input, manifest) {
        request.correlationId = input && input.correlationId || manifest && manifest.correlationId ||
            request.correlationId || request.requestId;
        request.publicationOperationKey = input && input.operationKey || request.publicationOperationKey;
        return request;
    },
    /** Rejects target mutations unless this process is explicitly the non-versioned Online runtime. */
    assertOnlineRuntime: function () {
        if (((CONFIG.get('cms') || {}).publication || {}).runtimeRole !== 'ONLINE') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_TARGET_ROLE_INVALID', 'CMS publication target operations require a non-versioned Online runtime');
        }
        if (CONFIG.get('publishEnabled') === true) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_TARGET_VERSIONING_INVALID', 'Online CMS must not activate publish/version provider modules');
        }
    },
    /** Persists an idempotent target-local deployment receipt. */
    recordReceipt: async function (operation, manifest, result, request) {
        let identity = request.publicationOperationKey || request.correlationId || manifest.code;
        let code = operation + '_' + manifest.code + '_' + crypto.createHash('sha256').update(String(identity)).digest('hex').slice(0, 16);
        let existing = await SERVICE.DefaultCmsPublicationDeploymentReceiptService.get({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext,
            query: { code: code }, searchOptions: { limit: 1 } });
        if (existing && Array.isArray(existing.result) && existing.result[0]) return existing.result[0];
        let model = { code: code, active: true, publicationCode: manifest.publicationCode,
            manifestCode: manifest.code, sourceVersion: manifest.sourceVersion, operation: operation, status: 'ONLINE',
            targetVersion: result.version, previousOnlineVersion: result.previousOnlineVersion,
            operationKey: request.publicationOperationKey,
            correlationId: request.correlationId || request.requestId };
        try {
            let response = await SERVICE.DefaultCmsPublicationDeploymentReceiptService.save({ tenant: request.tenant, authData: request.authData,
                transactionContext: request.transactionContext, model: model });
            return response && Array.isArray(response.result) ? response.result[0] : model;
        } catch (error) {
            let winner = await SERVICE.DefaultCmsPublicationDeploymentReceiptService.get({ tenant: request.tenant, authData: request.authData,
                transactionContext: request.transactionContext,
                query: { code: code }, searchOptions: { limit: 1 } });
            if (winner && Array.isArray(winner.result) && winner.result[0]) return winner.result[0];
            throw error;
        }
    },
    /** Imports a complete release before atomically switching its target-local Online pointer. */
    deploy: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        if (!input.manifest) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'CMS publication manifest is required');
        this.applyCorrelation(request, input, input.manifest);
        let policy = ((((CONFIG.get('cms') || {}).publication || {}).target) || {});
        let bytes = Buffer.byteLength(JSON.stringify(input.manifest), 'utf8');
        if (bytes > Number(policy.maxManifestBytes || 5242880)) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_BOUNDARY', 'CMS publication manifest exceeds target size policy');
        if (![].concat(policy.supportedContractVersions || [1]).includes(input.manifest.snapshot && input.manifest.snapshot.contractVersion)) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_CONTRACT_UNSUPPORTED', 'CMS publication manifest contract is unsupported by target');
        }
        let committed = await this.transaction(request, async transactionRequest => {
            if ((input.manifest.mediaAssets || []).length) {
                if (!SERVICE.DefaultMediaPublicationTransferService) {
                    throw new CLASSES.NodicsError('CMS_PUBLICATION_MEDIA_UNAVAILABLE', 'CMS Online media publication service is unavailable');
                }
                await SERVICE.DefaultMediaPublicationTransferService.importReferenced(input.manifest.mediaAssets, transactionRequest);
            }
            let manifest = await this.manifests().importManifest(input.manifest, transactionRequest);
            let activation = await this.manifests().activate(manifest, transactionRequest);
            await this.recordReceipt('DEPLOY', manifest, activation, transactionRequest);
            let event = await SERVICE.DefaultCmsPublicationOutboxService.enqueue('DEPLOY', manifest, transactionRequest);
            return { activation: activation, event: event };
        });
        await SERVICE.DefaultCmsPublicationOutboxService.deliver(committed.event, request);
        return committed.activation;
    },
    /** Returns target-local Online release status for one delivery scope. */
    getStatus: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        this.applyCorrelation(request, input);
        if (input.manifestCode) {
            let manifest = await this.manifests().getManifest(input.manifestCode, request);
            if (!manifest) return undefined;
            let receipts = await SERVICE.DefaultCmsPublicationDeploymentReceiptService.get({ tenant: request.tenant,
                authData: request.authData, query: { manifestCode: input.manifestCode }, searchOptions: { limit: 100 } });
            let events = await SERVICE.DefaultCmsPublicationEventOutboxService.get({ tenant: request.tenant,
                authData: request.authData, query: { manifestCode: input.manifestCode }, searchOptions: { limit: 100 } });
            let safeReceipt = item => ({ code: item.code, operation: item.operation, status: item.status,
                targetVersion: item.targetVersion, previousOnlineVersion: item.previousOnlineVersion,
                operationKey: item.operationKey, correlationId: item.correlationId });
            let safeEvent = item => ({ code: item.code, operation: item.operation, status: item.status,
                operationKey: item.operationKey, sequence: item.sequence, attempts: item.attempts,
                correlationId: item.correlationId, deliveredAt: item.deliveredAt,
                failureCode: item.failureCode });
            return { manifest: { code: manifest.code, publicationCode: manifest.publicationCode,
                sourceVersion: manifest.sourceVersion, contentHash: manifest.contentHash,
                createdBy: manifest.createdBy, correlationId: manifest.correlationId },
            receipts: [].concat(receipts && receipts.result || []).map(safeReceipt),
            outbox: [].concat(events && events.result || []).map(safeEvent) };
        }
        if (input.scope && input.scope.bundle === true) {
            let pointers = await this.manifests().getSitePointers(input.scope.site, request);
            if (!pointers.length) return undefined;
            let versions = Array.from(new Set(pointers.map(pointer => pointer.manifestCode)));
            if (versions.length !== 1) return { partial: true, routeCount: pointers.length };
            return { version: versions[0], routeCount: pointers.length };
        }
        let pointer = await this.manifests().getPointer(input.scope || {}, request);
        return pointer && { version: pointer.manifestCode, previousOnlineVersion: pointer.previousManifestCode };
    },
    /** Repairs missing receipt/outbox evidence only when every immutable manifest scope already owns the active Online pointer. */
    reconcile: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        if (!input.manifestCode) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'CMS reconciliation manifest is required');
        let manifest = await this.manifests().getManifest(input.manifestCode, request);
        if (!manifest) return { status: 'MANIFEST_MISSING', manifestCode: input.manifestCode, repaired: false };
        this.applyCorrelation(request, input, manifest);
        let scopes = manifest.snapshot && manifest.snapshot.contractVersion === 2 ? manifest.snapshot.routes : [manifest.snapshot];
        if (!Array.isArray(scopes) || !scopes.length) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROUTE_MISSING', 'CMS publication contains no delivery scope');
        let drift = [];
        for (let scope of scopes) {
            let pointer = await this.manifests().getStoredPointer(scope, request);
            if (!pointer || pointer.active === false || pointer.manifestCode !== manifest.code) drift.push({ site: scope.site, path: scope.path,
                locale: scope.locale, channel: scope.channel, accessMode: scope.accessMode,
                state: !pointer ? 'MISSING' : pointer.active === false ? 'INACTIVE' : 'DIFFERENT_MANIFEST' });
        }
        let evidence = await this.getStatus(Object.assign({}, request, { cmsPublicationTarget: { manifestCode: manifest.code } }));
        let missingReceipt = !evidence.receipts.some(item => item.operation === 'DEPLOY' && item.status === 'ONLINE');
        let missingOutbox = !evidence.outbox.some(item => item.operation === 'DEPLOY');
        if (drift.length) return { status: 'POINTER_DRIFT', manifestCode: manifest.code, repaired: false,
            repairRefused: true, drift: drift, missingReceipt: missingReceipt, missingOutbox: missingOutbox };
        if (input.repairEvidence !== true || (!missingReceipt && !missingOutbox)) return { status: missingReceipt || missingOutbox ? 'EVIDENCE_GAP' : 'CONSISTENT',
            manifestCode: manifest.code, repaired: false, missingReceipt: missingReceipt, missingOutbox: missingOutbox };
        let committed = await this.transaction(request, async transactionRequest => {
            let result = { version: manifest.code };
            if (missingReceipt) await this.recordReceipt('DEPLOY', manifest, result, transactionRequest);
            let event = missingOutbox ? await SERVICE.DefaultCmsPublicationOutboxService.enqueue('DEPLOY', manifest, transactionRequest) : undefined;
            return { event: event };
        });
        if (committed.event) await SERVICE.DefaultCmsPublicationOutboxService.deliver(committed.event, request);
        return { status: 'REPAIRED', manifestCode: manifest.code, repaired: true,
            receiptRepaired: missingReceipt, outboxRepaired: missingOutbox };
    },
    /** Collects orphaned published media while protecting every active/recoverable pointer and its rollback predecessor. */
    collectMediaGarbage: async function (request) {
        this.assertOnlineRuntime();
        if (!SERVICE.DefaultMediaPublicationTransferService || !SERVICE.DefaultMediaPublicationTransferService.collectGarbage) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_MEDIA_UNAVAILABLE', 'CMS Online media garbage collection service is unavailable');
        }
        let input = request.cmsPublicationTarget || request;
        let pointers = await this.manifests().getRetentionPointers(request);
        let manifestCodes = Array.from(new Set(pointers.reduce((codes, pointer) => {
            if (pointer.manifestCode) codes.push(pointer.manifestCode);
            if (pointer.previousManifestCode) codes.push(pointer.previousManifestCode);
            return codes;
        }, [])));
        let maximum = Number((((((CONFIG.get('cms') || {}).publication || {}).mediaGarbageCollection || {}).maximumProtectedManifests) || 1000));
        if (manifestCodes.length > maximum) throw new CLASSES.NodicsError('CMS_PUBLICATION_MEDIA_RETENTION_BOUNDARY', 'CMS protected manifest boundary exceeded');
        let protectedCodes = new Set();
        for (let code of manifestCodes) {
            let manifest = await this.manifests().getManifest(code, request);
            if (!manifest) throw new CLASSES.NodicsError('CMS_PUBLICATION_MEDIA_RETENTION_INCOMPLETE', 'A rollback-capable CMS manifest is unavailable');
            [].concat(manifest.mediaAssets || []).forEach(asset => asset && asset.code && protectedCodes.add(asset.code));
        }
        return SERVICE.DefaultMediaPublicationTransferService.collectGarbage({ tenant: request.tenant,
            authData: request.authData, protectedMediaCodes: Array.from(protectedCodes),
            dryRun: input.dryRun !== false, now: input.now });
    },
    /** Restores a release already imported into this Online target. */
    rollback: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        let manifest = await this.manifests().getManifest(input.manifestCode, request);
        if (!manifest) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'Rollback manifest is not deployed on the Online target');
        this.applyCorrelation(request, input, manifest);
        if (manifest.snapshot && manifest.snapshot.contractVersion === 2) {
            let pointers = await this.manifests().getSitePointers(manifest.snapshot.site, request);
            let identity = scope => [scope.site, scope.path, scope.locale, scope.channel, scope.accessMode].join('|');
            let currentScopes = pointers.map(identity).sort();
            let targetScopes = (manifest.snapshot.routes || []).map(identity).sort();
            if (currentScopes.length && JSON.stringify(currentScopes) !== JSON.stringify(targetScopes)) {
                throw new CLASSES.NodicsError('CMS_PUBLICATION_BUNDLE_ROLLBACK_SCOPE_CONFLICT',
                    'Site bundle rollback requires matching route scope; use explicit unpublish or retire for route changes');
            }
        }
        let committed = await this.transaction(request, async transactionRequest => {
            let activation = await this.manifests().activate(manifest, transactionRequest);
            await this.recordReceipt('ROLLBACK', manifest, activation, transactionRequest);
            let event = await SERVICE.DefaultCmsPublicationOutboxService.enqueue('ROLLBACK', manifest, transactionRequest);
            return { activation: activation, event: event };
        });
        await SERVICE.DefaultCmsPublicationOutboxService.deliver(committed.event, request);
        return committed.activation;
    },
    /** Transactionally removes one deployed release from Online delivery without deleting immutable manifests. */
    withdraw: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        let manifest = await this.manifests().getManifest(input.manifestCode, request);
        if (!manifest) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'Withdrawal manifest is not deployed on the Online target');
        this.applyCorrelation(request, input, manifest);
        let committed = await this.transaction(request, async transactionRequest => {
            let withdrawal = await this.manifests().withdraw(manifest, transactionRequest);
            await this.recordReceipt('WITHDRAW', manifest, withdrawal, transactionRequest);
            let event = await SERVICE.DefaultCmsPublicationOutboxService.enqueue('WITHDRAW', manifest, transactionRequest);
            return { withdrawal: withdrawal, event: event };
        });
        await SERVICE.DefaultCmsPublicationOutboxService.deliver(committed.event, request);
        return committed.withdrawal;
    }
};

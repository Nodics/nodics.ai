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
        const identity = request.publicationOperationKey || request.correlationId || manifest.code;
        const code = operation + '_' + manifest.code + '_' + crypto.createHash('sha256').update(String(identity)).digest('hex').slice(0, 16);
        const model = { code, active: true, publicationCode: manifest.publicationCode,
            manifestCode: manifest.code, sourceVersion: manifest.sourceVersion, operation, status: 'ONLINE',
            targetVersion: result.version, previousOnlineVersion: result.previousOnlineVersion,
            operationKey: request.publicationOperationKey, correlationId: request.correlationId || request.requestId };
        const expected = Object.freeze({ ...model });
        const read = async () => {
            const response = await SERVICE.DefaultCmsPublicationDeploymentReceiptService.get({ tenant: request.tenant,
                authData: request.authData, transactionContext: request.transactionContext,
                options: { recursive: false, skipItemCache: true }, query: { code }, searchOptions: { limit: 2 } });
            const rows = response?.result;
            if (!Array.isArray(rows) || rows.length > 1) throw new CLASSES.NodicsError('ERR_CMS_00117');
            const receipt = rows[0];
            if (receipt && Object.keys(expected).some(key => (receipt[key] ?? null) !== (expected[key] ?? null)))
                throw new CLASSES.NodicsError('ERR_CMS_00117');
            return receipt;
        };
        const existing = await read();
        if (existing) return existing;
        let failure;
        try { await SERVICE.DefaultCmsPublicationDeploymentReceiptService.save({ tenant: request.tenant,
            authData: request.authData, transactionContext: request.transactionContext, model }); }
        catch (error) { failure = error; }
        const persisted = await read();
        if (persisted) return persisted;
        throw failure || new CLASSES.NodicsError('ERR_CMS_00117');
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
        if (input.prepareOnly === true) {
            return this.transaction(request, async transactionRequest => {
                if ((input.manifest.mediaAssets || []).length) {
                    if (!SERVICE.DefaultMediaPublicationTransferService) {
                        throw new CLASSES.NodicsError('CMS_PUBLICATION_MEDIA_UNAVAILABLE', 'CMS Online media publication service is unavailable');
                    }
                    await SERVICE.DefaultMediaPublicationTransferService.importReferenced(input.manifest.mediaAssets,
                        Object.assign({}, transactionRequest, { publicationCode: input.manifest.publicationCode,
                            manifestCode: input.manifest.code }));
                }
                let manifest = await this.manifests().importManifest(input.manifest, transactionRequest);
                return { version: manifest.code, prepared: true };
            });
        }
        if (this.manifests().isSiteIndexManifest(input.manifest)) return this.deploySiteIndex(input.manifest, request);
        let committed = await this.transaction(request, async transactionRequest => {
            if ((input.manifest.mediaAssets || []).length) {
                if (!SERVICE.DefaultMediaPublicationTransferService) {
                    throw new CLASSES.NodicsError('CMS_PUBLICATION_MEDIA_UNAVAILABLE', 'CMS Online media publication service is unavailable');
                }
                await SERVICE.DefaultMediaPublicationTransferService.importReferenced(input.manifest.mediaAssets,
                    Object.assign({}, transactionRequest, { publicationCode: input.manifest.publicationCode,
                        manifestCode: input.manifest.code }));
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
    /** Loads and validates one prepared route manifest referenced by a site-index manifest. */
    loadIndexRouteManifest: async function (route, request) {
        if (!route.manifestCode) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'CMS site-index route manifest is required');
        let manifest = await this.manifests().getManifest(route.manifestCode, request);
        if (!manifest || manifest.contentHash !== route.contentHash) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_INTEGRITY', 'CMS site-index route manifest integrity validation failed');
        }
        let snapshot = manifest.snapshot || {};
        ['site', 'path', 'locale', 'channel', 'accessMode'].forEach(field => {
            if (snapshot[field] !== route[field]) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROUTE_MISSING',
                'CMS site-index route scope does not match its prepared manifest');
        });
        return manifest;
    },
    /** Activates prepared route manifests under one small site-index target version. */
    deploySiteIndex: async function (indexManifest, request) {
        let routes = [].concat(indexManifest.snapshot && indexManifest.snapshot.routes || []);
        if (!routes.length) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROUTE_MISSING', 'CMS site-index publication contains no delivery scope');
        let committed = await this.transaction(request, async transactionRequest => {
            let imported = await this.manifests().importManifest(indexManifest, transactionRequest);
            let activations = [];
            for (let route of routes) {
                let child = await this.loadIndexRouteManifest(route, transactionRequest);
                activations.push(await this.manifests().activateScope(child, child.snapshot, transactionRequest));
            }
            await this.recordReceipt('DEPLOY', imported, { version: imported.code, routeCount: routes.length }, transactionRequest);
            let event = await SERVICE.DefaultCmsPublicationOutboxService.enqueue('DEPLOY', imported, transactionRequest);
            let previous = Array.from(new Set(activations.map(item => item.previousOnlineVersion).filter(Boolean)));
            return { activation: { version: imported.code, routeCount: routes.length, chunked: true,
                previousOnlineVersion: previous.length === 1 ? previous[0] : undefined }, event: event };
        });
        await SERVICE.DefaultCmsPublicationOutboxService.deliver(committed.event, request);
        return committed.activation;
    },
    /** Returns the expected manifest code for a pointer covered by a manifest. */
    expectedPointerManifestCode: function (manifest, scope) {
        return this.manifests().isSiteIndexManifest(manifest) ? scope.manifestCode : manifest.code;
    },
    /** Finds the active site-index manifest matching the current route pointers for one site. */
    findActiveSiteIndex: async function (site, pointers, request) {
        let response = await SERVICE.DefaultCmsPublicationManifestService.get({ tenant: request.tenant,
            options: { recursive: false, skipItemCache: true },
            authData: request.authData, query: { rootCode: site, active: true }, searchOptions: { limit: 1000 } });
        let pointerMap = new Map(pointers.map(pointer => [this.scopeIdentity(pointer), pointer.manifestCode]));
        return this.manifests().items(response).find(manifest => {
            if (!this.manifests().isSiteIndexManifest(manifest)) return false;
            let routes = [].concat(manifest.snapshot && manifest.snapshot.routes || []);
            if (routes.length !== pointers.length) return false;
            return routes.every(route => pointerMap.get(this.scopeIdentity(route)) === route.manifestCode);
        });
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
                authData: request.authData, transactionContext: request.transactionContext, options: { recursive: false, skipItemCache: true }, query: { manifestCode: input.manifestCode }, searchOptions: { limit: 100 } });
            let events = await SERVICE.DefaultCmsPublicationEventOutboxService.get({ tenant: request.tenant,
                authData: request.authData, transactionContext: request.transactionContext, options: { recursive: false, skipItemCache: true }, query: { manifestCode: input.manifestCode }, searchOptions: { limit: 100 } });
            let safeReceipt = item => ({ code: item.code, active: item.active, publicationCode: item.publicationCode, manifestCode: item.manifestCode, sourceVersion: item.sourceVersion, operation: item.operation, status: item.status,
                targetVersion: item.targetVersion, previousOnlineVersion: item.previousOnlineVersion,
                operationKey: item.operationKey, correlationId: item.correlationId });
            let safeEvent = item => ({ code: item.code, active: item.active, publicationCode: item.publicationCode, manifestCode: item.manifestCode, operation: item.operation, status: item.status,
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
            if (versions.length !== 1) {
                let index = await this.findActiveSiteIndex(input.scope.site, pointers, request);
                if (index) return { version: index.code, routeCount: pointers.length, chunked: true };
            }
            if (versions.length !== 1) return { partial: true, routeCount: pointers.length };
            return { version: versions[0], routeCount: pointers.length };
        }
        let pointer = await this.manifests().getPointer(input.scope || {}, request);
        return pointer && { version: pointer.manifestCode, previousOnlineVersion: pointer.previousManifestCode };
    },
    /** Verifies that every delivery scope for a manifest is currently Online and records verification evidence. */
    verifyOnline: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        if (!input.manifestCode) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'CMS Online verification manifest is required');
        let manifest = await this.manifests().getManifest(input.manifestCode, request);
        if (!manifest) return { status: 'MANIFEST_MISSING', manifestCode: input.manifestCode, verified: false };
        this.applyCorrelation(request, input, manifest);
        let scopes = this.manifests().deliveryScopes(manifest);
        let drift = [];
        for (let scope of scopes) {
            let pointer = await this.manifests().getStoredPointer(scope, request);
            if (!pointer || pointer.active === false || pointer.manifestCode !== this.expectedPointerManifestCode(manifest, scope)) {
                drift.push({ site: scope.site, path: scope.path, locale: scope.locale, channel: scope.channel,
                    accessMode: scope.accessMode, state: !pointer ? 'MISSING' : pointer.active === false ? 'INACTIVE' : 'DIFFERENT_MANIFEST',
                    manifestCode: pointer && pointer.manifestCode });
            }
        }
        if (drift.length) return { status: 'POINTER_DRIFT', manifestCode: manifest.code, verified: false,
            drift: drift, routeCount: scopes.length };
        let committed = await this.transaction(request, async transactionRequest => {
            let receipt = await this.recordReceipt('VERIFY', manifest, { version: manifest.code, routeCount: scopes.length }, transactionRequest);
            return { receipt: receipt };
        });
        return { status: 'VERIFIED', manifestCode: manifest.code, verified: true,
            receiptCode: committed.receipt && committed.receipt.code, routeCount: scopes.length,
            correlationId: request.correlationId || request.requestId };
    },
    /** Detects active Online scope collisions before activation without changing pointers. */
    detectCollisions: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        let manifest = input.manifest || (input.manifestCode && await this.manifests().getManifest(input.manifestCode, request));
        if (!manifest) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'CMS collision detection manifest is required');
        this.applyCorrelation(request, input, manifest);
        let scopes = this.manifests().deliveryScopes(manifest);
        let collisions = [];
        for (let scope of scopes) {
            let pointer = await this.manifests().getStoredPointer(scope, request);
            if (pointer && pointer.active !== false && pointer.manifestCode &&
                    pointer.manifestCode !== this.expectedPointerManifestCode(manifest, scope)) {
                collisions.push({ site: scope.site, path: scope.path, locale: scope.locale, channel: scope.channel,
                    accessMode: scope.accessMode, activeManifestCode: pointer.manifestCode,
                    previousManifestCode: pointer.previousManifestCode, pointerCode: pointer.code });
            }
        }
        return { status: collisions.length ? 'COLLISION_DETECTED' : 'CLEAR',
            manifestCode: manifest.code, routeCount: scopes.length, collisionCount: collisions.length,
            collisions: collisions };
    },
    /** Builds a redacted target-local support bundle for one publication manifest. */
    supportBundle: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        if (!input.manifestCode) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'CMS support bundle manifest is required');
        let manifest = await this.manifests().getManifest(input.manifestCode, request);
        if (!manifest) return { status: 'MANIFEST_MISSING', manifestCode: input.manifestCode };
        this.applyCorrelation(request, input, manifest);
        let status = await this.getStatus(Object.assign({}, request, { cmsPublicationTarget: { manifestCode: manifest.code } }));
        let scopes = this.manifests().deliveryScopes(manifest);
        let drift = [];
        for (let scope of scopes) {
            let pointer = await this.manifests().getStoredPointer(scope, request);
            if (!pointer || pointer.active === false || pointer.manifestCode !== this.expectedPointerManifestCode(manifest, scope)) {
                drift.push({ site: scope.site, path: scope.path, locale: scope.locale, channel: scope.channel,
                    accessMode: scope.accessMode, state: !pointer ? 'MISSING' : pointer.active === false ? 'INACTIVE' : 'DIFFERENT_MANIFEST',
                    manifestCode: pointer && pointer.manifestCode });
            }
        }
        let verification = drift.length ? { status: 'POINTER_DRIFT', manifestCode: manifest.code, verified: false,
            drift: drift, routeCount: scopes.length } : { status: 'VERIFIED', manifestCode: manifest.code, verified: true,
            routeCount: scopes.length };
        let collisions = await this.detectCollisions(Object.assign({}, request, { cmsPublicationTarget: { manifestCode: manifest.code } }));
        return { status: 'READY', bundleType: 'CMS_PUBLICATION_SUPPORT', redacted: true,
            generatedAt: new Date().toISOString(), publicationCode: manifest.publicationCode,
            manifest: { code: manifest.code, rootType: manifest.rootType, rootCode: manifest.rootCode,
                sourceVersion: manifest.sourceVersion, contentHash: manifest.contentHash,
                correlationId: manifest.correlationId },
            scope: scopes.map(scope => ({ site: scope.site, path: scope.path,
                locale: scope.locale, channel: scope.channel, accessMode: scope.accessMode })),
            diagnostics: { status: status, verification: verification, collisions: collisions },
            redaction: { secrets: 'excluded', providerPaths: 'excluded', storageKeys: 'excluded',
                tokens: 'excluded', rawStackTraces: 'excluded' } };
    },
    /** Repairs missing receipt/outbox evidence only when every immutable manifest scope already owns the active Online pointer. */
    reconcile: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        if (!input.manifestCode) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'CMS reconciliation manifest is required');
        let manifest = await this.manifests().getManifest(input.manifestCode, request);
        if (!manifest) return { status: 'MANIFEST_MISSING', manifestCode: input.manifestCode, repaired: false };
        this.applyCorrelation(request, input, manifest);
        let scopes = this.manifests().deliveryScopes(manifest);
        if (!Array.isArray(scopes) || !scopes.length) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROUTE_MISSING', 'CMS publication contains no delivery scope');
        let drift = [];
        for (let scope of scopes) {
            let pointer = await this.manifests().getStoredPointer(scope, request);
            if (!pointer || pointer.active === false || pointer.manifestCode !== this.expectedPointerManifestCode(manifest, scope)) drift.push({ site: scope.site, path: scope.path,
                locale: scope.locale, channel: scope.channel, accessMode: scope.accessMode,
                state: !pointer ? 'MISSING' : pointer.active === false ? 'INACTIVE' : 'DIFFERENT_MANIFEST' });
        }
        let evidence = await this.getStatus(Object.assign({}, request, { cmsPublicationTarget: { manifestCode: manifest.code } }));
        const deployReceipts = evidence.receipts.filter(item => item.operation === 'DEPLOY');
        const mismatchedReceipt = deployReceipts.some(item => item.active !== true || item.status !== 'ONLINE' ||
            item.manifestCode !== manifest.code || item.publicationCode !== manifest.publicationCode ||
            item.sourceVersion !== manifest.sourceVersion || item.targetVersion !== manifest.code);
        if (mismatchedReceipt) return { status: 'RECEIPT_MISMATCH', manifestCode: manifest.code, repaired: false, repairRefused: true };
        let missingReceipt = !deployReceipts.length;
        let missingOutbox = !evidence.outbox.some(item => item.operation === 'DEPLOY');
        if (drift.length) return { status: 'POINTER_DRIFT', manifestCode: manifest.code, repaired: false,
            repairRefused: true, drift: drift, missingReceipt: missingReceipt, missingOutbox: missingOutbox };
        if (input.repairEvidence !== true || (!missingReceipt && !missingOutbox)) return { status: missingReceipt || missingOutbox ? 'EVIDENCE_GAP' : 'CONSISTENT',
            manifestCode: manifest.code, repaired: false, missingReceipt: missingReceipt, missingOutbox: missingOutbox };
        let committed = await this.transaction(request, async transactionRequest => {
            const observed = await this.reconcile(Object.assign({}, transactionRequest, {
                cmsPublicationTarget: { ...input, repairEvidence: false }
            }));
            if (observed.status !== 'EVIDENCE_GAP') return { diagnostic: observed };
            const predecessors = new Set();
            for (const scope of scopes) {
                const pointer = await this.manifests().getStoredPointer(scope, transactionRequest);
                if (!pointer || pointer.active === false || pointer.manifestCode !== this.expectedPointerManifestCode(manifest, scope))
                    throw new CLASSES.NodicsError('ERR_CMS_00116');
                const revision = Number(pointer.revision || 0);
                const fenced = await SERVICE.DefaultCmsOnlinePublicationPointerService.update({ tenant: request.tenant,
                    authData: request.authData, transactionContext: transactionRequest.transactionContext,
                    query: { code: pointer.code, revision, manifestCode: pointer.manifestCode, active: true },
                    model: { revision: revision + 1 } });
                if (this.manifests().affected(fenced) !== 1) throw new CLASSES.NodicsError('ERR_CMS_00116');
                if (pointer.previousManifestCode) predecessors.add(pointer.previousManifestCode);
            }
            const result = { version: manifest.code, previousOnlineVersion: predecessors.size === 1 ? [...predecessors][0] : undefined };
            if (observed.missingReceipt) await this.recordReceipt('DEPLOY', manifest, result, transactionRequest);
            const event = observed.missingOutbox ? await SERVICE.DefaultCmsPublicationOutboxService.enqueue('DEPLOY', manifest, transactionRequest) : undefined;
            return { event, receiptRepaired: observed.missingReceipt, outboxRepaired: observed.missingOutbox };
        });
        if (committed.diagnostic) return committed.diagnostic;
        if (committed.event) await SERVICE.DefaultCmsPublicationOutboxService.deliver(committed.event, request);
        return { status: 'REPAIRED', manifestCode: manifest.code, repaired: true,
            receiptRepaired: committed.receiptRepaired, outboxRepaired: committed.outboxRepaired };
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
    /** Replays failed media replication for one immutable manifest/package. */
    reconcileMediaReplication: async function (request) {
        this.assertOnlineRuntime();
        if (!SERVICE.DefaultMediaPublicationTransferService || !SERVICE.DefaultMediaPublicationTransferService.reconcileReplication) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_MEDIA_UNAVAILABLE', 'CMS Online media replication service is unavailable');
        }
        let input = request.cmsPublicationTarget || request;
        if (!input.manifestCode) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'CMS media replication manifest is required');
        let manifest = await this.manifests().getManifest(input.manifestCode, request);
        if (!manifest) return { status: 'MANIFEST_MISSING', manifestCode: input.manifestCode, synchronized: 0 };
        this.applyCorrelation(request, input, manifest);
        return SERVICE.DefaultMediaPublicationTransferService.reconcileReplication(manifest.mediaAssets || [],
            Object.assign({}, request, { publicationCode: manifest.publicationCode, manifestCode: manifest.code,
                retryCount: input.retryCount || request.retryCount || 0 }));
    },
    /** Finds due media replication obligations and replays their immutable CMS packages. */
    retryPendingMediaReplication: async function (request) {
        this.assertOnlineRuntime();
        if (!SERVICE.DefaultMediaReplicationQueueService || typeof SERVICE.DefaultMediaReplicationQueueService.get !== 'function') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_MEDIA_UNAVAILABLE', 'CMS media replication queue service is unavailable');
        }
        let input = request.cmsPublicationTarget || request;
        let maximum = Number(input.limit || ((((CONFIG.get('cms') || {}).publication || {}).mediaReplicationRetry || {}).maximumQueueRecords) || 25);
        let statuses = input.statuses || ['REPLICATION_PENDING', 'REPLICATION_FAILED', 'REPLICATION_RETRY_SCHEDULED'];
        let response = await SERVICE.DefaultMediaReplicationQueueService.get({ tenant: request.tenant,
            authData: request.authData, query: { status: { $in: statuses } }, searchOptions: { limit: maximum } });
        let rows = [].concat(response && response.result || []).filter(row => {
            if (!row || !row.manifestCode) return false;
            if (!row.nextRetryAt) return true;
            return new Date(row.nextRetryAt).getTime() <= Date.now();
        });
        let manifestCodes = Array.from(new Set(rows.map(row => row.manifestCode)));
        let result = { status: 'NO_PENDING_REPLICATION', scanned: rows.length, manifests: 0,
            synchronized: 0, queued: 0, skipped: 0, escalated: 0, failures: [] };
        for (let manifestCode of manifestCodes) {
            try {
                let replay = await this.reconcileMediaReplication(Object.assign({}, request, {
                    cmsPublicationTarget: { manifestCode: manifestCode, retryCount: input.retryCount || 1 }
                }));
                result.manifests += 1;
                result.synchronized += Number(replay.synchronized || 0);
                result.queued += Number(replay.queued || 0);
                result.skipped += Number(replay.skipped || 0);
                result.escalated += Number(replay.escalated || 0);
            } catch (error) {
                result.failures.push({ manifestCode: manifestCode, failureCode: error && (error.code || error.name) || 'CMS_MEDIA_REPLICATION_RETRY_FAILED',
                    failureMessage: String(error && error.message || error).slice(0, 500) });
            }
        }
        if (result.failures.length) result.status = 'RETRY_PARTIAL_FAILURE';
        else if (result.escalated) result.status = 'REPLICATION_ESCALATED';
        else if (result.queued) result.status = 'REPLICATION_RETRY_SCHEDULED';
        else if (result.manifests) result.status = 'REPLICATION_RETRY_COMPLETE';
        return result;
    },
    /** Creates a stable delivery-scope identity for route-level pointer comparison. */
    scopeIdentity: function (scope) {
        return [scope.site, scope.path, scope.locale, scope.channel, scope.accessMode].join('|');
    },
    /** Deactivates active site pointers that are outside the restored site-bundle manifest. */
    deactivateOutsideBundleScope: async function (manifest, request) {
        if (!manifest.snapshot || !['SITE', 'SITE_INDEX'].includes(manifest.snapshot.bundleType)) return 0;
        let targetScopes = new Set([].concat(this.manifests().deliveryScopes(manifest)).map(scope => this.scopeIdentity(scope)));
        let pointers = await this.manifests().getSitePointers(manifest.snapshot.site, request);
        let count = 0;
        for (let pointer of pointers) {
            if (targetScopes.has(this.scopeIdentity(pointer))) continue;
            let response = await SERVICE.DefaultCmsOnlinePublicationPointerService.update({ tenant: request.tenant, authData: request.authData,
                transactionContext: request.transactionContext,
                query: { code: pointer.code, revision: Number(pointer.revision || 0) },
                model: { active: false, revision: Number(pointer.revision || 0) + 1,
                    correlationId: request.correlationId || request.requestId } });
            if (this.manifests().affected(response) !== 1) {
                throw new CLASSES.NodicsError('CMS_PUBLICATION_POINTER_CONFLICT', 'CMS Online pointer revision conflict');
            }
            count += 1;
        }
        return count;
    },
    /** Verifies an operator rollback still owns all Online pointers it could change, inside the pointer transaction. */
    assertRollbackScope: async function (currentCode, predecessor, request) {
        const manifests = this.manifests();
        const current = await manifests.getManifest(currentCode, request);
        const currentScopes = manifests.deliveryScopes(current);
        const predecessorScopes = manifests.deliveryScopes(predecessor);
        const currentKeys = new Set(currentScopes.map(scope => this.scopeIdentity(scope)));
        const site = currentScopes[0]?.site;
        const isSite = current?.rootType === 'site';
        const scopedSiteRestore = !isSite && predecessor.rootType === 'site';
        const predecessorKeys = new Set(predecessorScopes.map(scope => this.scopeIdentity(scope)));
        if (!current || !site || !predecessorScopes.length ||
            (isSite && predecessor.rootType !== 'site') ||
            [...currentScopes, ...predecessorScopes].some(scope => scope.site !== site) ||
            (!isSite && (scopedSiteRestore ? currentScopes.some(scope => !predecessorKeys.has(this.scopeIdentity(scope))) :
                currentScopes.length !== predecessorScopes.length || predecessorScopes.some(scope => !currentKeys.has(this.scopeIdentity(scope)))))) {
            throw new CLASSES.NodicsError('ERR_CMS_00116');
        }
        if (isSite && (await manifests.getSitePointers(site, request)).some(pointer => !currentKeys.has(this.scopeIdentity(pointer))))
            throw new CLASSES.NodicsError('ERR_CMS_00116');
        for (const scope of currentScopes) {
            const pointer = await manifests.getPointer(scope, request);
            if (pointer?.manifestCode !== this.expectedPointerManifestCode(current, scope) ||
                (scopedSiteRestore && pointer.previousManifestCode !== this.expectedPointerManifestCode(predecessor, scope)))
                throw new CLASSES.NodicsError('ERR_CMS_00116');
        }
        return scopedSiteRestore ? currentScopes : undefined;
    },
    /** Restores a release already imported into this Online target. */
    rollback: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        let manifest = await this.manifests().getManifest(input.manifestCode, request);
        if (!manifest) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'Rollback manifest is not deployed on the Online target');
        this.applyCorrelation(request, input, manifest);
        let committed = await this.transaction(request, async transactionRequest => {
            const selectedScopes = input.expectedCurrentManifestCode !== undefined
                ? await this.assertRollbackScope(input.expectedCurrentManifestCode, manifest, transactionRequest) : undefined;
            if (!selectedScopes && (manifest.rootType === 'site' || input.expectedCurrentManifestCode === undefined))
                await this.deactivateOutsideBundleScope(manifest, transactionRequest);
            let activation;
            if (selectedScopes) {
                for (const scope of selectedScopes) {
                    const predecessorScope = this.manifests().deliveryScopes(manifest).find(candidate => this.scopeIdentity(candidate) === this.scopeIdentity(scope));
                    const restored = this.manifests().isSiteIndexManifest(manifest)
                        ? await this.loadIndexRouteManifest(predecessorScope, transactionRequest) : manifest;
                    await this.manifests().activateScope(restored, predecessorScope, transactionRequest);
                }
                activation = { version: manifest.code, routeCount: selectedScopes.length, scoped: true };
            } else if (this.manifests().isSiteIndexManifest(manifest)) {
                let activations = [];
                for (let route of [].concat(manifest.snapshot && manifest.snapshot.routes || [])) {
                    let child = await this.loadIndexRouteManifest(route, transactionRequest);
                    activations.push(await this.manifests().activateScope(child, child.snapshot, transactionRequest));
                }
                activation = { version: manifest.code, routeCount: activations.length, chunked: true };
            } else {
                activation = await this.manifests().activate(manifest, transactionRequest);
            }
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
            let withdrawal;
            if (this.manifests().isSiteIndexManifest(manifest)) {
                let count = 0;
                for (let scope of this.manifests().deliveryScopes(manifest)) {
                    let current = await this.manifests().getPointer(scope, transactionRequest);
                    if (!current) continue;
                    if (current.manifestCode !== scope.manifestCode) {
                        throw new CLASSES.NodicsError('CMS_PUBLICATION_WITHDRAWAL_SCOPE_CONFLICT', 'CMS Online pointer belongs to a different release');
                    }
                    let response = await SERVICE.DefaultCmsOnlinePublicationPointerService.update({ tenant: transactionRequest.tenant,
                        authData: transactionRequest.authData, transactionContext: transactionRequest.transactionContext,
                        query: { code: current.code, revision: Number(current.revision || 0) },
                        model: { active: false, revision: Number(current.revision || 0) + 1,
                            correlationId: transactionRequest.correlationId || transactionRequest.requestId } });
                    if (this.manifests().affected(response) !== 1) throw new CLASSES.NodicsError('CMS_PUBLICATION_POINTER_CONFLICT', 'CMS Online pointer revision conflict');
                    count += 1;
                }
                withdrawal = { version: manifest.code, routeCount: count, chunked: true };
            } else {
                withdrawal = await this.manifests().withdraw(manifest, transactionRequest);
            }
            await this.recordReceipt('WITHDRAW', manifest, withdrawal, transactionRequest);
            let event = await SERVICE.DefaultCmsPublicationOutboxService.enqueue('WITHDRAW', manifest, transactionRequest);
            return { withdrawal: withdrawal, event: event };
        });
        await SERVICE.DefaultCmsPublicationOutboxService.deliver(committed.event, request);
        return committed.withdrawal;
    }
};

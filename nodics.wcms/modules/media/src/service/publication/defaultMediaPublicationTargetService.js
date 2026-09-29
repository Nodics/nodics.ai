/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/service/publication/DefaultMediaPublicationTargetService
 * @description Prepares retained bytes invisibly and commits Media placement plus receipt through nDatabase transactions.
 * @layer service
 * @owner media
 * @override Transport must authenticate target calls; preserve explicit expected-version CAS and receipt replay checks.
 */
module.exports = {
    /** Resolves existing Media retention and manifest authority. */
    manifests: function () { return SERVICE.DefaultMediaRetainedPublicationService; },
    /** Requires explicit qualified Online scope; no runtime or schema-maintenance bypass is inferred. */
    assertTarget: function (request) { this.manifests().assertScope(request, 'ONLINE'); },
    /** Verifies one retained manifest through existing cleanup authority; never repairs activation or purges bytes. */
    reconcile: function (input, request) {
        this.assertTarget(request);
        if (input.operationKey !== undefined || input.operation !== undefined) return this.reconcileOperation(input, request);
        return SERVICE.DefaultMediaCleanupLifecycleService.reconcileRetainedPublication(input, request);
    },
    /** Reads exact operation receipt and pointer in one snapshot; never repairs source state or reactivates content. */
    reconcileOperation: async function (input, request) {
        this.validateOperation(input);
        const owner = this.manifests();
        if (!['DEPLOY', 'ROLLBACK'].includes(input.operation) || typeof input.mediaCode !== 'string' || !input.mediaCode ||
            !/^[a-f0-9]{64}$/.test(input.manifestCode || '')) throw owner.invalid('Exact Media operation identity is required');
        const code = owner.digest({ kind: 'MEDIA_PUBLICATION_RECEIPT', operationKey: input.operationKey });
        const fingerprint = owner.digest({ operation: input.operation, manifestCode: input.manifestCode, mediaCode: input.mediaCode,
            publicationCode: input.publicationCode, expectedVersion: input.expectedVersion });
        const evidence = await owner.transaction(request, async context => {
            const receipt = await owner.one(SERVICE.DefaultMediaPublicationReceiptService, { code }, context);
            const pointer = await this.pointer(input.mediaCode, context);
            const result = { operationKey: input.operationKey, publicationCode: input.publicationCode,
                manifestCode: input.manifestCode, mediaCode: input.mediaCode, repaired: false };
            if (!receipt) return { ...result, status: pointer && pointer.evidence && pointer.evidence.operationKey === input.operationKey ? 'CONFLICT' : 'NOT_COMMITTED' };
            if (!receipt.evidence || receipt.evidence.fingerprint !== fingerprint || !pointer ||
                pointer.manifestCode !== input.manifestCode || pointer.publicationCode !== input.publicationCode ||
                !pointer.evidence || pointer.evidence.operationKey !== input.operationKey || pointer.active !== true || pointer.status !== 'ACTIVE') {
                return { ...result, status: 'CONFLICT' };
            }
            return { ...receipt.evidence.result, ...result, status: 'ACTIVE' };
        });
        if (evidence.status === 'ACTIVE') await owner.load(input.manifestCode, input.mediaCode, request);
        return evidence;
    },
    /** Derives an owner-namespaced identity in the existing placement collection. */
    pointerCode: function (mediaCode) { return this.manifests().digest({ kind: 'MEDIA_PUBLICATION_POINTER', mediaCode }); },
    /** Reads the one authoritative active placement, never current imported media metadata. */
    pointer: function (mediaCode, request) {
        return this.manifests().one(SERVICE.DefaultMediaPlacementService, { code: this.pointerCode(mediaCode) }, request);
    },
    /** Returns content-free target status for nPublish prior-version capture. */
    getStatus: async function (input, request) {
        this.assertTarget(request);
        if (!input || typeof input.mediaCode !== 'string' || !input.mediaCode) throw this.manifests().invalid('Media target identity is required');
        let pointer = await this.pointer(input.mediaCode, request);
        return pointer ? { version: pointer.manifestCode, revision: pointer.revision,
            previousOnlineVersion: pointer.evidence && pointer.evidence.previousOnlineVersion } : null;
    },
    /** Validates all package metadata and bytes before retaining a hidden target placement. */
    prepare: async function (input, request) {
        this.assertTarget(request);
        let manifest = input && input.manifest;
        let maximum = Number(this.manifests().policy().maximumAssetBytes || 52428800);
        if (!manifest || typeof manifest.contentBase64 !== 'string' || manifest.contentBase64.length > 4 * Math.ceil(maximum / 3) ||
            !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(manifest.contentBase64) ||
            manifest.code !== this.manifests().digest(manifest.asset)) {
            throw this.manifests().invalid('Invalid Media publication package');
        }
        let bytes = Buffer.from(manifest.contentBase64, 'base64');
        this.manifests().validateBytes(manifest.asset, bytes);
        return this.manifests().retain(manifest.asset, bytes, request);
    },
    /** Prepares without publishing, or activates the exact prepared manifest through one target transaction. */
    deploy: async function (input, request) {
        this.assertTarget(request);
        if (input.prepareOnly !== true) this.validateOperation(input);
        let manifest = await this.prepare(input, request);
        if (input.prepareOnly === true) return { version: manifest.code, prepared: true, active: false };
        return this.commit(manifest, input, 'DEPLOY', request);
    },
    /** Requires explicit optimistic target expectation and stable operation identity. */
    validateOperation: function (input) {
        if (!input || typeof input.operationKey !== 'string' || !input.operationKey || input.operationKey.length > 512 ||
            typeof input.publicationCode !== 'string' || !input.publicationCode ||
            (input.expectedVersion !== null && (typeof input.expectedVersion !== 'string' || !/^[a-f0-9]{64}$/.test(input.expectedVersion)))) {
            throw this.manifests().invalid('Media target operation identity and expected version are required');
        }
    },
    /** Restores a retained target version without consulting mutable Staged metadata or bytes. */
    rollback: async function (input, request) {
        this.assertTarget(request);
        this.validateOperation(input);
        let manifest = await this.manifests().load(input.manifestCode, input.mediaCode, request);
        return this.commit(manifest, input, 'ROLLBACK', request);
    },
    /** Commits pointer and durable result together; replay cannot reactivate a release superseded by another operation. */
    commit: async function (manifest, input, operation, request) {
        this.assertTarget(request);
        this.validateOperation(input);
        let owner = this.manifests();
        let mediaCode = manifest.artifacts.asset.code;
        manifest = await owner.load(manifest.code, mediaCode, request);
        let receiptCode = owner.digest({ kind: 'MEDIA_PUBLICATION_RECEIPT', operationKey: input.operationKey });
        let fingerprint = owner.digest({ operation, manifestCode: manifest.code, mediaCode,
            publicationCode: input.publicationCode, expectedVersion: input.expectedVersion });
        return owner.transaction(request, async context => {
            let receipt = await owner.one(SERVICE.DefaultMediaPublicationReceiptService, { code: receiptCode }, context);
            let current = await this.pointer(mediaCode, context);
            if (receipt) {
                if (!receipt.evidence || receipt.evidence.fingerprint !== fingerprint || !current ||
                    current.manifestCode !== manifest.code || current.evidence.operationKey !== input.operationKey) {
                    throw owner.invalid('Media receipt replay conflicts with current activation');
                }
                return Object.assign({}, receipt.evidence.result, { replayed: true });
            }
            if ((current && current.manifestCode || null) !== input.expectedVersion) throw owner.invalid('Media activation version conflict');
            if (operation === 'ROLLBACK' && (!current || current.publicationCode !== input.publicationCode)) {
                throw owner.invalid('Media rollback does not own the current activation');
            }
            if (current && (!Number.isSafeInteger(current.revision) || current.revision < 1)) throw owner.invalid('Media placement revision is invalid');
            let revision = current ? current.revision + 1 : 1;
            if (!Number.isSafeInteger(revision)) throw owner.invalid('Media placement revision overflow');
            let retained = manifest.evidence.retained;
            let pointer = { code: this.pointerCode(mediaCode), active: true, mediaCode, mediaChecksum: manifest.artifacts.asset.checksum,
                checksumAlgorithm: 'sha256', targetRole: 'ONLINE', providerCode: retained.providerCode, storageKey: retained.storageKey,
                publicationCode: input.publicationCode, manifestCode: manifest.code, revision, status: 'ACTIVE',
                evidence: { operationKey: input.operationKey, previousOnlineVersion: input.expectedVersion } };
            if (current) {
                let response = await SERVICE.DefaultMediaPlacementService.update({ tenant: context.tenant, authData: context.authData,
                    transactionContext: context.transactionContext, query: { code: current.code, revision: current.revision, manifestCode: input.expectedVersion },
                    model: pointer });
                let result = response && response.result;
                if (!result || (result.modifiedCount !== undefined ? result.modifiedCount : result.nModified) !== 1) {
                    throw owner.invalid('Media placement compare-and-set was not acknowledged');
                }
            } else {
                await SERVICE.DefaultMediaPlacementService.save({ tenant: context.tenant, authData: context.authData,
                    transactionContext: context.transactionContext, model: pointer });
            }
            let confirmed = await this.pointer(mediaCode, context);
            if (!confirmed || confirmed.revision !== revision || confirmed.manifestCode !== manifest.code) throw owner.invalid('Media activation was not acknowledged');
            let result = { version: manifest.code, previousOnlineVersion: input.expectedVersion, receiptCode, operationKey: input.operationKey,
                receipt: { operationKey: input.operationKey, publicationCode: input.publicationCode,
                    sourceVersion: manifest.code, targetVersion: manifest.code, previousOnlineVersion: input.expectedVersion } };
            await SERVICE.DefaultMediaPublicationReceiptService.save({ tenant: context.tenant, authData: context.authData,
                transactionContext: context.transactionContext, model: { code: receiptCode, active: true,
                    publicationCode: input.publicationCode, manifestCode: manifest.code, mediaCode, targetRuntimeRole: 'ONLINE',
                    receiptType: 'PUBLICATION_AUDIT', status: operation === 'ROLLBACK' ? 'ROLLED_BACK' : 'ACCEPTED',
                    checksum: manifest.artifacts.asset.checksum, receivedAt: new Date(), evidence: { fingerprint, result } } });
            let saved = await owner.one(SERVICE.DefaultMediaPublicationReceiptService, { code: receiptCode }, context);
            if (!saved || !saved.evidence || saved.evidence.fingerprint !== fingerprint) throw owner.invalid('Media target receipt was not acknowledged');
            return result;
        });
    },
    /** Resolves only an activated immutable package and verified bytes for existing Media delivery. */
    resolveDelivery: async function (mediaCode, request) {
        this.assertTarget(request);
        let pointer = await this.pointer(mediaCode, request);
        if (!pointer || pointer.active !== true || pointer.status !== 'ACTIVE') throw this.manifests().invalid('Media is not activated');
        let manifest = await this.manifests().load(pointer.manifestCode, mediaCode, request);
        return { media: manifest.artifacts.asset, buffer: await this.manifests().readBytes(manifest, request) };
    }
};

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/service/publication/DefaultMediaPublicationVersionProviderService
 * @description Adapts retained Media manifests to nPublish without owning publication state or approval.
 * @layer service
 * @owner media
 * @override Replace transport through layered properties while preserving exact retained versions and receipts.
 */
module.exports = {
    targetReceiptContract: 'v1',
    /** Captures one exact version and delegates creation, validation and approval to existing nPublish authority. */
    createGoverned: async function (input, request) {
        this.assertEnabled();
        this.manifests().assertScope(request, 'STAGED');
        if (!input || typeof input.publicationCode !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(input.publicationCode) ||
            typeof input.mediaCode !== 'string' || !input.mediaCode || !Number.isSafeInteger(input.versionId) || input.versionId < 0 ||
            (input.expectedChecksum !== undefined && !/^[a-f0-9]{64}$/.test(input.expectedChecksum))) {
            throw this.manifests().invalid('Exact Media identity and publication code are required');
        }
        const lifecycle = SERVICE.DefaultPublicationLifecycleService;
        if (!lifecycle || !lifecycle.getWorkflowProvider('media') || !lifecycle.getDomainAdapter('media') ||
            lifecycle.getVersionProvider('media') !== SERVICE.DefaultMediaPublicationVersionProviderService) {
            throw this.manifests().invalid('Media publication providers are not installed');
        }
        let stage = 'INSPECT';
        try {
            let publication = await lifecycle.getRepository().get(input.publicationCode, request);
            if (publication) {
                const manifest = await this.getVersion(publication, request);
                if (publication.rootCode !== input.mediaCode || manifest.artifacts.asset.versionId !== input.versionId ||
                    (input.expectedChecksum !== undefined && manifest.artifacts.asset.checksum !== input.expectedChecksum)) {
                    throw this.manifests().invalid('Media publication retry identity conflict');
                }
            } else {
                stage = 'RETAIN';
                const manifest = await this.manifests().capture({ code: input.mediaCode, versionId: input.versionId }, request);
                if (input.expectedChecksum !== undefined && manifest.artifacts.asset.checksum !== input.expectedChecksum) {
                    throw this.manifests().invalid('Media publication source checksum changed');
                }
                stage = 'CREATE';
                publication = await lifecycle.create({ ...request, publication: { code: input.publicationCode, domain: 'media',
                    rootType: 'media', rootCode: input.mediaCode, sourceVersion: manifest.code } });
            }
            if (publication.state === 'STAGED') {
                stage = 'VALIDATE';
                publication = await lifecycle.validate({ ...request, publicationCode: publication.code, expectedRevision: publication.revision });
            }
            if (publication.state === 'VALIDATED' || publication.state === 'PENDING_APPROVAL') {
                stage = 'REQUEST_APPROVAL';
                publication = await lifecycle.requestApproval({ ...request, publicationCode: publication.code, expectedRevision: publication.revision });
            }
            return publication;
        } catch (cause) {
            const error = new CLASSES.NodicsError('ERR_MED_00023', 'Media publication request did not complete');
            error.mediaPublicationStage = stage;
            error.ownerErrorCode = cause && /^ERR_[A-Z0-9]+_[0-9]{5}$/.test(cause.code) ? cause.code : 'UNCLASSIFIED';
            throw error;
        }
    },
    /** Resolves the owning manifest service. */
    manifests: function () { return SERVICE.DefaultMediaRetainedPublicationService; },
    /** Rejects unqualified or wrong-role provider selection. */
    assertEnabled: function () {
        let policy = this.manifests().policy();
        if (policy.versionProviderEnabled !== true || policy.runtimeRole !== 'STAGED') {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Media publication provider is not qualified for Staged');
        }
    },
    /** Resolves only an explicitly installed transport implementing the Media target service contract. */
    transport: function () {
        this.assertEnabled();
        let name = this.manifests().policy().targetTransportProvider;
        let service = name && SERVICE[name];
        if (!service || !['deploy', 'getStatus', 'rollback'].every(method => typeof service[method] === 'function')) {
            throw new CLASSES.NodicsError('ERR_MED_00011', 'Media target transport is unavailable');
        }
        return service;
    },
    /** Resolves the previously captured exact manifest, never latest metadata or mutable source bytes. */
    getVersion: async function (publication, request) {
        this.assertEnabled();
        if (publication.domain !== 'media' || publication.rootType !== 'media') {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Media publication root is invalid');
        }
        return this.manifests().load(publication.sourceVersion, publication.rootCode, request);
    },
    /** Supplies the exact metadata dependency when selected as the existing nPublish domain adapter. */
    resolveDependencies: function (publication, manifest) {
        let asset = manifest.artifacts.asset;
        return [{ schema: 'media', code: asset.code, version: asset.versionId }];
    },
    /** Validates retained content without returning private bytes or provider locators in approval evidence. */
    validate: async function (publication, manifest, request) {
        let exact = await this.getVersion(publication, request);
        if (exact.code !== manifest.code) throw new CLASSES.NodicsError('ERR_MED_00014', 'Media publication identity changed');
        return { valid: true, manifestCode: exact.code, mediaCode: exact.artifacts.asset.code,
            checksum: exact.artifacts.asset.checksum, sizeBytes: exact.totalBytes };
    },
    /** Reads target activation evidence through the configured authenticated transport. */
    getOnlineVersion: function (publication, request) {
        return this.transport().getStatus({ mediaCode: publication.rootCode }, request);
    },
    /** Reads exact target pointers in one bounded owner call without caching or approving assets. */
    getOnlineVersions: function (mediaCodes, request) {
        return this.transport().getStatuses({ mediaCodes }, request);
    },
    /** Verifies retained bytes through a bounded target batch, preserving legacy transport overlays. */
    reconcileVersions: async function (assets, request) {
        const transport = this.transport();
        if (typeof transport.reconcileVersions === 'function') return transport.reconcileVersions({ assets }, request);
        const results = [];
        for (const asset of assets) results.push(await transport.reconcile(asset, request));
        return { results };
    },
    /** Reports retained target integrity through the existing nPublish reconciliation hook without repair. */
    reconcile: function (publication, request) {
        let transport = this.transport();
        if (typeof transport.reconcile !== 'function') {
            throw new CLASSES.NodicsError('ERR_MED_00011', 'Media target reconciliation is unavailable');
        }
        if (!publication.activationOperation) {
            if (publication.targetVersion || publication.state === 'ACTIVATING') throw this.manifests().invalid('Media activation intent is missing');
            return Promise.resolve({ status: 'NOT_DEPLOYED', repaired: false });
        }
        return transport.reconcile({ mediaCode: publication.rootCode, manifestCode: publication.sourceVersion,
            publicationCode: publication.code, operationKey: publication.activationOperation.key,
            expectedVersion: publication.activationOperation.previousOnlineVersion, operation: 'DEPLOY' }, request);
    },
    /** Independently authorizes a target command against the existing stored nPublish intent. */
    authorizeTarget: async function (input, request) {
        this.assertEnabled();
        SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'media');
        SERVICE.DefaultMediaPublicationTargetService.validateOperation(input);
        const publication = await SERVICE.DefaultPublicationLifecycleService.get({ ...request, publicationCode: input.publicationCode });
        if (!publication || publication.code !== input.publicationCode || publication.domain !== 'media' ||
            publication.rootType !== 'media' || publication.rootCode !== input.mediaCode || publication.sourceVersion !== input.sourceVersion) {
            throw this.manifests().invalid('Media source publication intent mismatch');
        }
        const manifest = await this.getVersion(publication, request);
        const activation = publication.activationOperation;
        const expected = input.operation === 'deploy' ? { state: 'ACTIVATING', key: activation && activation.key,
            version: manifest.code, previous: activation && activation.previousOnlineVersion } :
            input.operation === 'rollback' ? { state: 'ROLLING_BACK',
                key: publication.code + ':rollback:' + publication.targetVersion + ':' + publication.previousOnlineVersion,
                version: publication.previousOnlineVersion, previous: publication.targetVersion } : null;
        if (!expected || publication.state !== expected.state || !expected.key || input.operationKey !== expected.key ||
            input.manifestCode !== expected.version || input.expectedVersion !== expected.previous) {
            throw this.manifests().invalid('Media target operation is not currently authorized');
        }
        return { authorized: true, fingerprint: this.manifests().digest(input) };
    },
    /** Sends the immutable package; the target commits its pointer and receipt together. */
    activate: async function (publication, request) {
        let transport = this.transport();
        let manifest = await this.getVersion(publication, request);
        let input = { manifest: await this.manifests().exportPackage(manifest, request),
            publicationCode: publication.code, operationKey: publication.activationOperation && publication.activationOperation.key,
            expectedVersion: publication.activationOperation && publication.activationOperation.previousOnlineVersion };
        if (input.expectedVersion !== null && typeof input.expectedVersion !== 'string') {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Expected Online Media version is required');
        }
        return transport.deploy(input, request);
    },
    /** Restores only a retained target manifest; rollback never reads or reimports current Staged content. */
    rollback: function (publication, targetVersion, request) {
        if (!targetVersion || !publication.targetVersion) {
            throw new CLASSES.NodicsError('ERR_MED_00013', 'Retained Media rollback target is unavailable');
        }
        return this.transport().rollback({ mediaCode: publication.rootCode, manifestCode: targetVersion, sourceVersion: publication.sourceVersion,
            expectedVersion: publication.targetVersion, publicationCode: publication.code,
            operationKey: publication.code + ':rollback:' + publication.targetVersion + ':' + targetVersion }, request);
    }
};

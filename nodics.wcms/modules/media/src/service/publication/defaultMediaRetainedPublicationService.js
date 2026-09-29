/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module media/service/publication/DefaultMediaRetainedPublicationService
 * @description Retains exact Media metadata and bytes in existing transfer manifests and storage providers.
 * @layer service
 * @owner media
 * @override Extend metadata projection through this service; preserve digest, scope, byte retention and transaction guarantees.
 */
module.exports = {
    /** Returns effective Media publication policy. */
    policy: function () { return (CONFIG.get('media') || {}).publication || {}; },
    /** Produces a bounded owner error without leaking storage locators. */
    invalid: function (message) { return new CLASSES.NodicsError('ERR_MED_00014', message); },
    /** Requires an explicit tenant and configured qualification gate for internal publication operations. */
    assertScope: function (request, role) {
        if (!request || typeof request.tenant !== 'string' || !request.tenant.trim() ||
            this.policy().versionProviderEnabled !== true || (role && this.policy().runtimeRole !== role)) {
            throw this.invalid('Media retained publication is not qualified for this scope');
        }
    },
    /** Checks the existing transaction authority before allocating retained storage. */
    transactionScope: function (request) {
        this.assertScope(request);
        let service = SERVICE.DefaultDatabaseTransactionService;
        let scope = { tenant: request.tenant, moduleName: this.policy().transactionModuleName || 'media' };
        let capabilities = service && service.capabilities(scope);
        if (!capabilities || capabilities.multiRecordAtomic !== true || capabilities.contextPropagation !== true) {
            throw this.invalid('Media publication requires atomic transaction context propagation');
        }
        return scope;
    },
    /** Delegates atomic evidence writes to the existing provider-neutral database authority. */
    transaction: function (request, work) {
        let scope = this.transactionScope(request);
        return SERVICE.DefaultDatabaseTransactionService.execute(scope,
            transactionContext => work(Object.assign({}, request, { transactionContext })));
    },
    /** Reads one unambiguous record through its generated owner service. */
    one: async function (service, query, request) {
        let response = await service.get({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext, query, searchOptions: { limit: 2 } });
        if (!response || !Array.isArray(response.result) || response.result.length > 1) throw this.invalid('Ambiguous Media publication evidence');
        return response.result[0];
    },
    /** Canonicalizes JSON metadata for exact identity independent of field order. */
    canonical: function (value) {
        if (Array.isArray(value)) return value.map(item => this.canonical(item));
        if (value && typeof value === 'object') return Object.keys(value).sort().reduce((result, key) => {
            if (value[key] !== undefined) result[key] = this.canonical(value[key]);
            return result;
        }, {});
        return value;
    },
    /** Hashes the complete path-free metadata, including byte checksum and exact metadata version. */
    digest: function (asset) { return crypto.createHash('sha256').update(JSON.stringify(this.canonical(asset))).digest('hex'); },
    /** Projects delivery and ownership metadata without exposing provider locations. */
    project: function (record) {
        let asset = {};
        for (let key of ['code', 'versionId', 'name', 'description', 'folderCode', 'formatCode',
            'originalFileName', 'mimeType', 'extension', 'sizeBytes', 'checksum', 'checksumAlgorithm',
            'access', 'businessPurpose', 'ownerType', 'ownerReference', 'enterpriseCode', 'reusable']) {
            if (record[key] !== undefined) asset[key] = record[key];
        }
        return JSON.parse(JSON.stringify(asset));
    },
    /** Validates bytes against bounded SHA-256 metadata before any target side effect. */
    validateBytes: function (asset, bytes) {
        if (!asset || typeof asset.code !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,191}$/.test(asset.code) ||
            !Number.isSafeInteger(asset.versionId) || asset.versionId < 0 || asset.checksumAlgorithm !== 'sha256' ||
            !['PUBLIC', 'PRIVATE', 'SIGNED'].includes(asset.access) || !Buffer.isBuffer(bytes) || !bytes.length ||
            bytes.length !== asset.sizeBytes || bytes.length > Number(this.policy().maximumAssetBytes || 52428800) ||
            crypto.createHash('sha256').update(bytes).digest('hex') !== asset.checksum) {
            throw this.invalid('Retained Media metadata or bytes failed integrity validation');
        }
    },
    /** Requires the installed Media model, not a caller flag or configured policy, to expose CURRENT immutable versions. */
    assertVersionedSource: function (request) {
        const models = typeof NODICS !== 'undefined' && typeof NODICS.getModels === 'function' && NODICS.getModels('media', request.tenant);
        const name = typeof UTILS !== 'undefined' && typeof UTILS.createModelName === 'function' && UTILS.createModelName('media');
        const model = models && name && models[name];
        if (!model || model.versioned !== true || !model.rawSchema || model.rawSchema.versionedReadMode !== 'CURRENT') {
            throw this.invalid('Media publication requires qualified CURRENT versioned metadata storage');
        }
    },
    /** Reads exact source metadata, then pins its verified bytes before returning a publication source identity. */
    capture: async function (identity, request) {
        this.assertScope(request, 'STAGED');
        if (!identity || typeof identity.code !== 'string' || !Number.isSafeInteger(identity.versionId) || identity.versionId < 0) {
            throw this.invalid('Exact Media metadata version is required');
        }
        this.assertVersionedSource(request);
        let record = await this.one(SERVICE.DefaultMediaService,
            { code: identity.code, versionId: identity.versionId, active: true, status: 'READY' }, request);
        if (!record || record.code !== identity.code || record.versionId !== identity.versionId) throw this.invalid('Exact Media source is unavailable');
        let bytes = await SERVICE.DefaultMediaStorageProviderRegistryService.read({ providerCode: record.providerCode,
            storageKey: record.storageKey, maximumBytes: Number(this.policy().maximumAssetBytes || 52428800) });
        let asset = this.project(record);
        this.validateBytes(asset, bytes);
        return this.retain(asset, bytes, request);
    },
    /** Creates an invisible retained placement and atomically persists its existing transfer manifest. */
    retain: async function (asset, bytes, request) {
        this.assertScope(request);
        this.transactionScope(request);
        this.validateBytes(asset, bytes);
        if (JSON.stringify(this.canonical(asset)) !== JSON.stringify(this.canonical(this.project(asset)))) {
            throw this.invalid('Media publication metadata contains unsupported fields');
        }
        let code = this.digest(asset);
        let existing = await this.one(SERVICE.DefaultMediaTransferManifestService, { code }, request);
        if (existing) { await this.readBytes(existing, request); return existing; }
        let retained = await SERVICE.DefaultMediaStorageProviderRegistryService.storeRetained({ tenant: request.tenant,
            authData: request.authData, providerCode: this.policy().topology && this.policy().topology.activeProviderCode || undefined,
            enterpriseCode: asset.enterpriseCode, folderCode: asset.folderCode, formatCode: asset.formatCode,
            fileName: asset.originalFileName, originalFileName: asset.originalFileName, mimeType: asset.mimeType,
            sizeBytes: bytes.length, buffer: bytes });
        let manifest = { code, active: true, manifestCode: code, sourceRuntimeRole: 'STAGED', targetRuntimeRole: 'ONLINE',
            transportStrategy: 'PROVIDER_COPY', artifactCount: 1, totalBytes: bytes.length, status: 'READY',
            artifacts: { asset }, evidence: { retained } };
        await this.readBytes(manifest, request);
        return this.transaction(request, async context => {
            let winner = await this.one(SERVICE.DefaultMediaTransferManifestService, { code }, context);
            if (winner) { await this.readBytes(winner, context); return winner; }
            await SERVICE.DefaultMediaTransferManifestService.save({ tenant: context.tenant, authData: context.authData,
                transactionContext: context.transactionContext, model: manifest });
            let saved = await this.one(SERVICE.DefaultMediaTransferManifestService, { code }, context);
            if (!saved) throw this.invalid('Retained Media manifest was not acknowledged');
            await this.readBytes(saved, context);
            return saved;
        });
    },
    /** Loads a manifest whose identity is bound to exact metadata; no latest-record fallback is allowed. */
    load: async function (code, mediaCode, request) {
        this.assertScope(request);
        if (typeof code !== 'string' || !/^[a-f0-9]{64}$/.test(code)) throw this.invalid('Exact Media manifest identity is required');
        let manifest = await this.one(SERVICE.DefaultMediaTransferManifestService, { code }, request);
        if (!manifest || !manifest.artifacts || !manifest.artifacts.asset || manifest.artifacts.asset.code !== mediaCode) throw this.invalid('Retained Media manifest is unavailable');
        await this.readBytes(manifest, request);
        return manifest;
    },
    /** Reads only retained storage and checks both metadata and bytes on every export/delivery/rollback. */
    readBytes: async function (manifest, request) {
        this.assertScope(request);
        let asset = manifest && manifest.artifacts && manifest.artifacts.asset;
        let retained = manifest && manifest.evidence && manifest.evidence.retained;
        if (!asset || this.digest(asset) !== manifest.code || !retained || !retained.providerCode || !retained.storageKey) {
            throw this.invalid('Retained Media manifest integrity failed');
        }
        let bytes = await SERVICE.DefaultMediaStorageProviderRegistryService.read({ providerCode: retained.providerCode,
            storageKey: retained.storageKey, maximumBytes: Number(this.policy().maximumAssetBytes || 52428800) });
        this.validateBytes(asset, bytes);
        return bytes;
    },
    /** Exports path-free exact metadata and pinned bytes; targets generate their own private placement. */
    exportPackage: async function (manifest, request) {
        let bytes = await this.readBytes(manifest, request);
        return { code: manifest.code, asset: this.project(manifest.artifacts.asset), contentBase64: bytes.toString('base64') };
    }
};

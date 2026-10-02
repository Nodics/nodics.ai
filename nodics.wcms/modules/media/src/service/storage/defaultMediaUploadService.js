/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module nodics.wcms/media/src/service/storage/defaultMediaUploadService
 * @description Stores media-parsed media uploads and persists media-owned
 * metadata using the generated media model service.
 * @layer service
 * @owner media
 * @override Later layers may decorate upload governance while preserving
 * provider-neutral storage and media metadata ownership in media.
 */
module.exports = {

    /** Initializes the media upload service. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media upload service. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Inspects an upload without disclosing storage locators or changing Media.
     * Matching current versioned bytes may be reused; replacements still require CAS.
     * @param {Object} request Trusted tenant/principal and desired upload descriptor.
     * @returns {Promise<Object>} Path-free inspection and current revision.
     */
    inspectUpload: async function (request) {
        if (!request || typeof request.mediaCode !== 'string' || !request.mediaCode.trim() ||
            request.mediaCode.length > 256 || !/^[a-f0-9]{64}$/.test(request.checksum || '') ||
            !Number.isSafeInteger(request.sizeBytes) || request.sizeBytes <= 0) {
            throw new CLASSES.NodicsError('ERR_MED_00001', 'Invalid Media upload inspection');
        }
        SERVICE.DefaultMediaStoragePolicyService.validateDescriptor(request);
        const lifecycle = SERVICE.DefaultMediaLifecycleCoordinationService;
        const versioned = lifecycle.isVersioned(request);
        const read = async () => {
            const response = await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
                query: { code: request.mediaCode }, searchOptions: { limit: 2 } });
            if (!response || !Array.isArray(response.result)) {
                throw new CLASSES.NodicsError('ERR_MED_00014', 'Media inspection read was not acknowledged');
            }
            return response;
        };
        const rows = lifecycle.records(await read());
        if (rows.length > 1) throw new CLASSES.NodicsError('ERR_MED_00014', 'Ambiguous current Media metadata');
        const current = rows[0];
        if (current && current.code !== request.mediaCode) {
            throw new CLASSES.NodicsError('ERR_MED_00014', 'Media inspection identity mismatch');
        }
        const result = { contractVersion: 1, mediaCode: request.mediaCode, versioned: Boolean(versioned),
            exists: Boolean(current), unchanged: false };
        if (!current) return result;
        if (versioned) {
            if (!Number.isSafeInteger(current.versionId) || current.versionId < 0) {
                throw new CLASSES.NodicsError('ERR_MED_00014', 'Invalid current Media versionId');
            }
            result.versionId = current.versionId;
        }
        const fields = ['folderCode', 'formatCode', 'name', 'description', 'businessPurpose', 'ownerType', 'ownerReference', 'mimeType', 'sizeBytes'];
        if (!versioned || current.status !== 'READY' || current.active !== true ||
            current.checksumAlgorithm !== 'sha256' || current.checksum !== request.checksum ||
            fields.some(field => current[field] !== request[field])) return result;
        const buffer = await SERVICE.DefaultMediaStorageProviderRegistryService.read({ tenant: request.tenant,
            authData: request.authData, providerCode: current.providerCode, storageKey: current.storageKey,
            maximumBytes: request.sizeBytes });
        if (!Buffer.isBuffer(buffer) || buffer.length !== request.sizeBytes ||
            this.calculateChecksum(buffer, 'sha256') !== request.checksum) return result;
        // Do not authorize reuse from a version which changed during the provider read.
        const fresh = lifecycle.records(await read());
        if (fresh.length !== 1 || fresh[0].versionId !== current.versionId || fresh[0].checksum !== current.checksum) {
            throw new CLASSES.NodicsError('ERR_MED_00014', 'Media changed during upload inspection');
        }
        result.unchanged = true;
        return result;
    },

    /**
     * Stores one parsed upload and persists its media metadata.
     *
     * @param {Object} request Upload request.
     * @returns {Promise<Object>} Persisted media descriptor.
     */
    upload: async function (request) {
        let file = this.resolveFile(request);
        let checksumAlgorithm = this.resolveChecksumAlgorithm(request);
        let checksum = this.calculateChecksum(file.buffer, checksumAlgorithm);
        let mediaCode = request.mediaCode || request.code || this.buildMediaCode(file, checksum);
        const lifecycle = SERVICE.DefaultMediaLifecycleCoordinationService;
        const versioned = lifecycle && lifecycle.isVersioned(request);
        let previous;
        if (versioned) {
            const rows = lifecycle.records(await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
                query: { code: mediaCode }, searchOptions: { limit: 2 } }));
            if (rows.length > 1) throw new CLASSES.NodicsError('ERR_MED_00014', 'Ambiguous current Media metadata');
            previous = rows[0];
            if (previous && (!Number.isSafeInteger(request.versionId) || request.versionId !== previous.versionId)) {
                throw new CLASSES.NodicsError('ERR_MED_00014', 'Re-upload requires the current Media versionId');
            }
            if (previous && previous.legalHold === true) throw new CLASSES.NodicsError('ERR_MED_00019', 'Media legal hold blocks re-upload');
        }
        const storageRequest = {
            tenant: request.tenant,
            authData: request.authData,
            enterpriseCode: request.enterpriseCode,
            moduleName: request.moduleName,
            schemaName: request.schemaName,
            indexName: request.indexName,
            providerCode: request.providerCode,
            keyStrategy: request.keyStrategy,
            folderCode: request.folderCode || 'default',
            formatCode: request.formatCode || 'original',
            mediaCode: mediaCode,
            fileName: file.originalFileName || file.fileName,
            originalFileName: file.originalFileName || file.fileName,
            mimeType: file.mimeType,
            sizeBytes: file.sizeBytes,
            buffer: file.buffer
        };
        const registry = SERVICE.DefaultMediaStorageProviderRegistryService;
        let storage = await (versioned ? registry.storeRetained(storageRequest) : registry.store(storageRequest));
        if (versioned) {
            storage = Object.assign({}, registry.resolveLocation({ ...storageRequest, providerCode: storage.providerCode,
                storageKey: storage.storageKey, trustedStorageKey: true }), storage);
        }
        let media = {
            code: mediaCode,
            active: true,
            name: request.name || file.originalFileName || mediaCode,
            description: request.description,
            folderCode: storage.folderCode,
            formatCode: request.formatCode || 'original',
            providerCode: storage.providerCode,
            storageKey: storage.storageKey,
            originalFileName: storage.originalFileName,
            storedFileName: storage.fileName,
            relativePath: storage.relativePath || storage.storageKey,
            fullPath: storage.fullPath || storage.absolutePath,
            url: storage.url,
            accessUrl: storage.accessUrl || storage.url,
            mimeType: storage.mimeType,
            extension: storage.extension,
            sizeBytes: storage.sizeBytes,
            checksum: checksum,
            checksumAlgorithm: checksumAlgorithm,
            access: storage.access,
            businessPurpose: request.businessPurpose,
            ownerType: request.ownerType,
            enterpriseCode: request.enterpriseCode,
            ownerReference: request.ownerReference,
            reusable: request.reusable === true,
            retentionUntil: request.retentionUntil,
            legalHold: request.legalHold === true,
            status: 'READY'
        };
        let service = SERVICE.DefaultMediaService;
        if (!service || typeof service.save !== 'function') {
            throw new CLASSES.NodicsError('ERR_MED_00009', 'Media metadata service is unavailable');
        }
        if (versioned && previous) {
            const patch = { ...media }; delete patch.code;
            return lifecycle.updateMetadata(request, previous, patch);
        }
        if (versioned) media.versionId = 0;
        let response = await service.save({
            tenant: request.tenant,
            authData: request.authData,
            transactionContext: request.transactionContext,
            moduleName: 'media',
            query: { code: mediaCode },
            model: media
        });
        const saved = this.firstResult(response);
        if (versioned && (!saved || saved.code !== mediaCode || saved.versionId !== 0 || saved.storageKey !== media.storageKey)) {
            throw new CLASSES.NodicsError('ERR_MED_00014', 'Versioned Media upload was not acknowledged');
        }
        return saved || media;
    },

    /**
     * Resolves exactly one uploaded file from media-parsed descriptors.
     *
     * @param {Object} request Upload request.
     * @returns {Object} Parsed file descriptor.
     */
    resolveFile: function (request) {
        let files = request && request.files || [];
        let fileField = request && request.fileField;
        let matching = fileField ? files.filter(file => file.fieldName === fileField) : files;
        if (matching.length !== 1) {
            throw new CLASSES.NodicsError('ERR_MED_00001', 'Invalid media request: exactly one uploaded file is required');
        }
        let file = matching[0];
        if (!Buffer.isBuffer(file.buffer) || Number(file.sizeBytes || 0) <= 0) {
            throw new CLASSES.NodicsError('ERR_MED_00001', 'Invalid media request: uploaded file content is required');
        }
        return file;
    },

    /**
     * Resolves configured checksum algorithm.
     *
     * @param {Object} request Upload request.
     * @returns {string} Hash algorithm.
     */
    resolveChecksumAlgorithm: function (request) {
        let mediaConfig = SERVICE.DefaultMediaStoragePolicyService.getConfiguration();
        let upload = mediaConfig.upload || {};
        return request.checksumAlgorithm || upload.checksumAlgorithm || 'sha256';
    },

    /**
     * Calculates upload checksum.
     *
     * @param {Buffer} buffer File content.
     * @param {string} algorithm Hash algorithm.
     * @returns {string} Hex checksum.
     */
    calculateChecksum: function (buffer, algorithm) {
        return crypto.createHash(algorithm).update(buffer).digest('hex');
    },

    /**
     * Builds deterministic media code from original filename and checksum prefix.
     *
     * @param {Object} file Parsed file descriptor.
     * @param {string} checksum File checksum.
     * @returns {string} Media code.
     */
    buildMediaCode: function (file, checksum) {
        let fileName = String(file.originalFileName || file.fileName || 'media').replace(/[^a-zA-Z0-9._-]/g, '-');
        return fileName.replace(/\.[^.]+$/, '') + '-' + checksum.substring(0, 16);
    },

    /**
     * Extracts first generated service result.
     *
     * @param {Object} response Generated service response.
     * @returns {Object|undefined} First persisted model when available.
     */
    firstResult: function (response) {
        if (!response) return undefined;
        if (Array.isArray(response.result)) return response.result[0];
        if (response.result) return response.result;
        if (Array.isArray(response.data)) return response.data[0];
        return response.data;
    }
};

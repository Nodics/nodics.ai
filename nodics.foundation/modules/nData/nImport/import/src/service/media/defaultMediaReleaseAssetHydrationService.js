/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * @module nData/nImport/import/src/service/media/defaultMediaReleaseAssetHydrationService
 * @description Hydrates declarative media release records by storing their
 * physical assets through the nMedia storage provider before schema import.
 * @layer service
 * @owner nData
 * @override Project modules may extend asset metadata validation while
 * preserving provider-owned media storage fields and declarative data files.
 */
module.exports = {

    /** Initializes the media release asset hydrator. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media release asset hydrator. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Hydrates every media record in an import request when it declares an asset.
     *
     * @param {Object} request Model import request.
     * @returns {Promise<Object|Object[]>} Hydrated model or model list.
     */
    hydrateRequest: async function (request) {
        if (!this.isMediaSchemaRequest(request)) {
            return request && request.dataModel;
        }
        if (Array.isArray(request.dataModel)) {
            let hydrated = [];
            for (let index = 0; index < request.dataModel.length; index++) {
                hydrated.push(await this.hydrateModel(request, request.dataModel[index]));
            }
            request.dataModel = hydrated;
            return hydrated;
        }
        request.dataModel = await this.hydrateModel(request, request.dataModel);
        return request.dataModel;
    },

    /**
     * Checks whether the import target is the media-owned media schema.
     *
     * @param {Object} request Model import request.
     * @returns {boolean} True for media.media schema imports.
     */
    isMediaSchemaRequest: function (request) {
        let options = request && request.header && request.header.options || {};
        return options.moduleName === 'media' && options.schemaName === 'media';
    },

    /**
     * Hydrates one media model when it declares `asset.sourceFile`.
     *
     * @param {Object} request Model import request.
     * @param {Object} model Authored media model.
     * @returns {Promise<Object>} Hydrated model.
     */
    hydrateModel: async function (request, model) {
        if (!model || typeof model !== 'object') return model;
        let asset = this.resolveAssetDescriptor(model);
        if (!asset || !asset.sourceFile) {
            return model;
        }
        this.assertNoAuthoredStorageFields(model, asset);
        let sourcePath = this.resolveSourcePath(request, asset.sourceFile);
        let buffer = await fs.promises.readFile(sourcePath);
        let checksumAlgorithm = this.resolveChecksumAlgorithm(asset);
        let checksum = this.calculateChecksum(buffer, checksumAlgorithm);
        this.assertExpectedChecksum(asset, checksum, checksumAlgorithm);
        let fileName = asset.fileName || model.originalFileName || path.basename(sourcePath);
        let storage = await this.storeAsset(request, model, asset, {
            sourcePath: sourcePath,
            buffer: buffer,
            fileName: fileName,
            checksum: checksum,
            checksumAlgorithm: checksumAlgorithm
        });
        return this.buildHydratedModel(model, asset, storage, {
            fileName: fileName,
            checksum: checksum,
            checksumAlgorithm: checksumAlgorithm
        });
    },

    /**
     * Resolves the authoring-only asset descriptor.
     *
     * @param {Object} model Media model.
     * @returns {Object|undefined} Asset descriptor.
     */
    resolveAssetDescriptor: function (model) {
        if (model.asset && typeof model.asset === 'object') {
            return model.asset;
        }
        if (model.sourceFile) {
            return { sourceFile: model.sourceFile };
        }
        return undefined;
    },

    /**
     * Prevents release data from declaring provider-owned storage locations.
     *
     * @param {Object} model Media model.
     * @returns {undefined}
     * @throws {CLASSES.DataImportError} When authored data contains storage fields.
     */
    assertNoAuthoredStorageFields: function (model, asset) {
        let storageFields = ['providerCode', 'storageKey', 'storedFileName', 'relativePath', 'fullPath', 'url', 'accessUrl'];
        let authored = storageFields.filter(field => model[field] !== undefined && model[field] !== null && model[field] !== '');
        let authoredAsset = ['providerCode', 'keyStrategy', 'storageKey', 'relativePath', 'fullPath', 'url', 'accessUrl'].filter(field =>
            asset && asset[field] !== undefined && asset[field] !== null && asset[field] !== '');
        if (authored.length > 0) {
            throw new CLASSES.DataImportError('ERR_IMP_00003',
                'Media release data must not declare storage-owned field(s): ' + authored.join(', '));
        }
        if (authoredAsset.length > 0) {
            throw new CLASSES.DataImportError('ERR_IMP_00003',
                'Media release asset must not declare storage-owned field(s): ' + authoredAsset.join(', '));
        }
    },

    /**
     * Resolves one safe asset path from release roots carried by finalized data.
     *
     * @param {Object} request Model import request.
     * @param {string} sourceFile Authored relative asset path.
     * @returns {string} Existing absolute path.
     * @throws {CLASSES.DataImportError} When the path is unsafe or missing.
     */
    resolveSourcePath: function (request, sourceFile) {
        let relativePath = this.assertSafeRelativePath(sourceFile);
        let roots = this.resolveAssetBaseRoots(request);
        for (let index = 0; index < roots.length; index++) {
            let baseRoot = roots[index];
            let candidate = path.resolve(baseRoot, relativePath);
            if (this.isWithin(candidate, baseRoot) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                return candidate;
            }
        }
        throw new CLASSES.DataImportError('ERR_IMP_00003',
            'Media release asset not found: ' + relativePath);
    },

    /**
     * Resolves trusted release roots from generated header metadata and request context.
     *
     * @param {Object} request Model import request.
     * @returns {string[]} Candidate release roots.
     */
    resolveAssetBaseRoots: function (request) {
        let options = request && request.header && request.header.options || {};
        let roots = [].concat(options.assetBaseRoots || options.assetBaseRoot || []);
        if (request && request.sourceRoot) {
            roots.push(request.sourceRoot);
        }
        if (request && request.sourceDataFile) {
            roots.push(this.resolveReleaseRootForFile(request.sourceDataFile));
        }
        if (request && request.inputPath && request.inputPath.rootPath) {
            roots.push(request.inputPath.rootPath);
        }
        return Array.from(new Set(roots.filter(Boolean).map(root => path.resolve(root))));
    },

    /**
     * Resolves `.../data/<release>` for a data file path.
     *
     * @param {string} file Data file path.
     * @returns {string|undefined} Release root.
     */
    resolveReleaseRootForFile: function (file) {
        if (!file) return undefined;
        let resolved = path.resolve(file);
        let segments = resolved.split(path.sep);
        for (let index = segments.length - 2; index >= 0; index--) {
            if (segments[index] === 'data' && segments[index + 1]) {
                return segments.slice(0, index + 2).join(path.sep) || path.sep;
            }
        }
        return path.dirname(resolved);
    },

    /**
     * Ensures authored asset paths are relative and cannot escape release roots.
     *
     * @param {string} sourceFile Authored source path.
     * @returns {string} Normalized relative path.
     */
    assertSafeRelativePath: function (sourceFile) {
        if (!sourceFile || typeof sourceFile !== 'string') {
            throw new CLASSES.DataImportError('ERR_IMP_00003', 'Media release asset sourceFile must be a non-empty relative path');
        }
        let normalized = sourceFile.replace(/\\/g, '/');
        if (path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
            throw new CLASSES.DataImportError('ERR_IMP_00003', 'Media release asset sourceFile must stay inside the release folder');
        }
        return normalized;
    },

    /**
     * Checks containment after absolute resolution.
     *
     * @param {string} candidate Candidate path.
     * @param {string} baseRoot Trusted root.
     * @returns {boolean} True when candidate is below root.
     */
    isWithin: function (candidate, baseRoot) {
        let relative = path.relative(baseRoot, candidate);
        return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative));
    },

    /**
     * Resolves the checksum algorithm for the physical asset.
     *
     * @param {Object} asset Asset descriptor.
     * @returns {string} Hash algorithm.
     */
    resolveChecksumAlgorithm: function (asset) {
        if (asset && asset.checksumAlgorithm) return asset.checksumAlgorithm;
        if (SERVICE.DefaultMediaUploadService && typeof SERVICE.DefaultMediaUploadService.resolveChecksumAlgorithm === 'function') {
            return SERVICE.DefaultMediaUploadService.resolveChecksumAlgorithm({});
        }
        return 'sha256';
    },

    /**
     * Calculates a content checksum.
     *
     * @param {Buffer} buffer File bytes.
     * @param {string} algorithm Hash algorithm.
     * @returns {string} Hex checksum.
     */
    calculateChecksum: function (buffer, algorithm) {
        return crypto.createHash(algorithm).update(buffer).digest('hex');
    },

    /**
     * Verifies an optional authored checksum.
     *
     * @param {Object} asset Asset descriptor.
     * @param {string} checksum Calculated checksum.
     * @param {string} checksumAlgorithm Hash algorithm.
     * @returns {undefined}
     */
    assertExpectedChecksum: function (asset, checksum, checksumAlgorithm) {
        if (!asset || !asset.checksum) return;
        if (String(asset.checksum).toLowerCase() !== String(checksum).toLowerCase()) {
            throw new CLASSES.DataImportError('ERR_IMP_00003',
                'Media release asset checksum mismatch for ' + (asset.sourceFile || 'asset') +
                ' using ' + checksumAlgorithm);
        }
    },

    /**
     * Stores physical media through the configured nMedia provider.
     *
     * @param {Object} request Model import request.
     * @param {Object} model Authored media model.
     * @param {Object} asset Asset descriptor.
     * @param {Object} file File context.
     * @returns {Promise<Object>} Stored descriptor.
     */
    storeAsset: function (request, model, asset, file) {
        if (!SERVICE.DefaultMediaStorageProviderRegistryService ||
            typeof SERVICE.DefaultMediaStorageProviderRegistryService.store !== 'function') {
            return Promise.reject(new CLASSES.DataImportError('ERR_IMP_00003', 'Media storage provider is unavailable for release asset import'));
        }
        return SERVICE.DefaultMediaStorageProviderRegistryService.store({
            tenant: request.tenant,
            authData: request.authData,
            enterpriseCode: model.enterpriseCode || request.enterpriseCode,
            moduleName: 'media',
            schemaName: 'media',
            folderCode: model.folderCode || asset.folderCode || 'default',
            formatCode: model.formatCode || asset.formatCode || 'original',
            mediaCode: model.code,
            code: model.code,
            fileName: file.fileName,
            originalFileName: file.fileName,
            mimeType: model.mimeType || asset.mimeType || this.inferMimeType(file.fileName),
            sizeBytes: file.buffer.length,
            buffer: file.buffer
        });
    },

    /**
     * Builds the persisted media model and removes authoring-only markers.
     *
     * @param {Object} model Authored model.
     * @param {Object} asset Asset descriptor.
     * @param {Object} storage Stored descriptor.
     * @param {Object} file File context.
     * @returns {Object} Hydrated media model.
     */
    buildHydratedModel: function (model, asset, storage, file) {
        let hydrated = Object.assign({}, model, {
            active: model.active !== false,
            name: model.name || storage.originalFileName || model.code,
            folderCode: storage.folderCode,
            formatCode: model.formatCode || asset.formatCode || 'original',
            providerCode: storage.providerCode,
            storageKey: storage.storageKey,
            originalFileName: storage.originalFileName || file.fileName,
            storedFileName: storage.fileName,
            relativePath: storage.relativePath || storage.storageKey,
            fullPath: storage.fullPath || storage.absolutePath,
            url: storage.url,
            accessUrl: storage.accessUrl || storage.url,
            mimeType: storage.mimeType,
            extension: storage.extension,
            sizeBytes: storage.sizeBytes,
            checksum: file.checksum,
            checksumAlgorithm: file.checksumAlgorithm,
            access: storage.access,
            status: 'READY'
        });
        delete hydrated.asset;
        delete hydrated.sourceFile;
        return hydrated;
    },

    /**
     * Provides a small deterministic MIME fallback for release assets.
     *
     * @param {string} fileName File name.
     * @returns {string} MIME type.
     */
    inferMimeType: function (fileName) {
        let extension = String(path.extname(fileName || '') || '').toLowerCase();
        let types = {
            '.csv': 'text/csv',
            '.gif': 'image/gif',
            '.jpeg': 'image/jpeg',
            '.jpg': 'image/jpeg',
            '.json': 'application/json',
            '.pdf': 'application/pdf',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp',
            '.zip': 'application/zip'
        };
        return types[extension] || 'application/octet-stream';
    }
};

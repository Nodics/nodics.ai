/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module media/service/publication/DefaultMediaPublicationTransferService
 * @description Exports referenced Staged media and imports it into Online through media-owned providers.
 * @layer service
 * @owner media
 * @override Providers may replace byte transport while preserving bounded, checksum-verified, path-free payloads.
 */
module.exports = {
    /** Initializes media publication transfer. */
    init: function () { return Promise.resolve(true); },
    /** Completes media publication transfer initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns generated-service records. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Returns effective transfer policy. */
    policy: function () { return ((CONFIG.get('media') || {}).publication || {}); },
    /** Calculates the declared payload checksum. */
    checksum: function (buffer, algorithm) { return crypto.createHash(algorithm || 'sha256').update(buffer).digest('hex'); },
    /** Exports only explicitly referenced READY media without provider paths or credentials. */
    exportReferenced: async function (mediaCodes, request) {
        let codes = Array.from(new Set([].concat(mediaCodes || []).filter(Boolean))).sort();
        let policy = this.policy();
        if (codes.length > Number(policy.maximumAssets || 100)) throw new CLASSES.NodicsError('ERR_MED_00012', 'Media publication asset boundary exceeded');
        let assets = [];
        let total = 0;
        for (let code of codes) {
            let media = this.items(await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
                query: { code: code, active: true, status: 'READY' }, searchOptions: { limit: 2 } }));
            if (media.length !== 1) throw new CLASSES.NodicsError('ERR_MED_00013', 'Referenced media is unavailable or ambiguous');
            media = media[0];
            let maximumAsset = Number(policy.maximumAssetBytes || 52428800);
            let buffer = await SERVICE.DefaultMediaStorageProviderRegistryService.read({ providerCode: media.providerCode,
                storageKey: media.storageKey, maximumBytes: maximumAsset });
            let algorithm = media.checksumAlgorithm || 'sha256';
            if (!media.checksum || this.checksum(buffer, algorithm) !== media.checksum) {
                throw new CLASSES.NodicsError('ERR_MED_00014', 'Referenced media checksum validation failed');
            }
            total += buffer.length;
            if (total > Number(policy.maximumTotalBytes || 104857600)) throw new CLASSES.NodicsError('ERR_MED_00012', 'Media publication total boundary exceeded');
            assets.push({ code: media.code, name: media.name, description: media.description, folderCode: media.folderCode,
                formatCode: media.formatCode, originalFileName: media.originalFileName, mimeType: media.mimeType,
                sizeBytes: buffer.length, checksum: media.checksum, checksumAlgorithm: algorithm, access: media.access,
                businessPurpose: media.businessPurpose, ownerType: media.ownerType, enterpriseCode: media.enterpriseCode,
                ownerReference: media.ownerReference, reusable: media.reusable === true, contentBase64: buffer.toString('base64') });
        }
        return assets;
    },
    /** Imports path-free assets idempotently; Online generates its own provider locator. */
    importReferenced: async function (assets, request) {
        let policy = this.policy();
        assets = [].concat(assets || []);
        if (assets.length > Number(policy.maximumAssets || 100)) throw new CLASSES.NodicsError('ERR_MED_00012', 'Media publication asset boundary exceeded');
        let imported = [];
        let total = 0;
        for (let asset of assets) {
            let buffer = Buffer.from(String(asset.contentBase64 || ''), 'base64');
            total += buffer.length;
            if (!buffer.length || buffer.length !== Number(asset.sizeBytes) ||
                buffer.length > Number(policy.maximumAssetBytes || 52428800) ||
                total > Number(policy.maximumTotalBytes || 104857600) ||
                this.checksum(buffer, asset.checksumAlgorithm) !== asset.checksum) {
                throw new CLASSES.NodicsError('ERR_MED_00014', 'Published media payload integrity validation failed');
            }
            let existing = this.items(await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
                transactionContext: request.transactionContext, query: { code: asset.code }, searchOptions: { limit: 2 } }));
            if (existing.length) {
                if (existing.length !== 1 || existing[0].checksum !== asset.checksum) throw new CLASSES.NodicsError('ERR_MED_00015', 'Online media identity conflict');
                imported.push(existing[0]);
                continue;
            }
            imported.push(await SERVICE.DefaultMediaUploadService.upload({ tenant: request.tenant, authData: request.authData,
                transactionContext: request.transactionContext, mediaCode: asset.code, name: asset.name,
                description: asset.description, folderCode: asset.folderCode, formatCode: asset.formatCode,
                enterpriseCode: asset.enterpriseCode, businessPurpose: 'CMS_PUBLICATION', ownerType: 'CMS_PUBLICATION_ASSET',
                ownerReference: asset.checksum, reusable: true,
                retentionUntil: new Date(Date.now() + Number(policy.retentionDays || 7) * 86400000),
                files: [{ fieldName: 'publication', originalFileName: asset.originalFileName,
                    mimeType: asset.mimeType, sizeBytes: buffer.length, buffer: buffer }] }));
        }
        return imported;
    },
    /** Deletes only expired Online copies owned by publication and absent from the CMS protected reference set. */
    collectGarbage: async function (request) {
        let policy = this.policy();
        let protectedCodes = new Set([].concat(request.protectedMediaCodes || []).filter(Boolean));
        let maximum = Number(policy.garbageCollectionBatchSize || 100);
        let rows = this.items(await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
            query: { businessPurpose: 'CMS_PUBLICATION', status: 'READY' }, searchOptions: { limit: maximum + 1 } }));
        if (rows.length > maximum) throw new CLASSES.NodicsError('ERR_MED_00020', 'Published media garbage collection batch boundary exceeded');
        let now = new Date(request.now || Date.now());
        let result = { scanned: rows.length, protected: 0, retained: 0, deleted: 0, deletedMediaCodes: [] };
        for (let media of rows) {
            if (protectedCodes.has(media.code)) { result.protected += 1; continue; }
            if (media.legalHold === true || !media.retentionUntil || new Date(media.retentionUntil).getTime() > now.getTime()) {
                result.retained += 1; continue;
            }
            if (request.dryRun === true) { result.retained += 1; continue; }
            await SERVICE.DefaultMediaLifecycleCoordinationService.deleteExpired({ tenant: request.tenant,
                authData: request.authData, mediaCode: media.code, now: now });
            result.deleted += 1;
            result.deletedMediaCodes.push(media.code);
        }
        return result;
    }
};

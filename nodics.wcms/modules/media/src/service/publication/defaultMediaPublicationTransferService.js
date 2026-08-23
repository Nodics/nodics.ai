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
    /** Returns role-based production topology policy for target imports and replication. */
    topology: function () {
        let policy = this.policy();
        let topology = Object.assign({}, policy.topology || {});
        topology.policy = topology.policy || (topology.replicationEnabled ? 'PRIMARY_FIRST_WITH_DR_RECONCILIATION' : 'PRIMARY_ONLY');
        topology.activeLocationRole = topology.activeLocationRole || 'ACTIVE_PROD_MEDIA_LOCATION';
        topology.replicationLocationRole = topology.replicationLocationRole || 'REPLICATION_PROD_MEDIA_LOCATION';
        topology.retryDelaySeconds = Number(topology.retryDelaySeconds || 300);
        topology.maxRetryAttempts = Number(topology.maxRetryAttempts || 10);
        return topology;
    },
    /** Calculates the declared payload checksum. */
    checksum: function (buffer, algorithm) { return crypto.createHash(algorithm || 'sha256').update(buffer).digest('hex'); },
    /** Builds a stable code for target placement/replication records. */
    recordCode: function (parts) {
        return crypto.createHash('sha256').update([].concat(parts || []).map(part => String(part || '')).join('|')).digest('hex');
    },
    /** Normalizes redacted error details for operator-visible receipts. */
    errorCode: function (error) {
        return error && (error.code || error.name) || 'MEDIA_REPLICATION_FAILED';
    },
    /** Normalizes redacted error text without exposing provider paths or secrets. */
    errorMessage: function (error) {
        return String(error && error.message || error || 'Media replication failed').slice(0, 500);
    },
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
                ownerReference: media.ownerReference, reusable: media.reusable !== false,
                publicationCode: request.publicationCode, manifestCode: request.manifestCode,
                contentBase64: buffer.toString('base64') });
        }
        return assets;
    },
    /** Persists physical-placement evidence when the generated placement service is available. */
    savePlacement: async function (media, asset, role, request, status, evidence) {
        if (!SERVICE.DefaultMediaPlacementService || typeof SERVICE.DefaultMediaPlacementService.save !== 'function' || !media) return undefined;
        let topology = this.topology();
        let code = this.recordCode([asset.code, asset.checksum, role, asset.manifestCode || request.manifestCode || request.correlationId]);
        let model = { code: code, active: true, mediaCode: asset.code, mediaChecksum: asset.checksum,
            checksumAlgorithm: asset.checksumAlgorithm || 'sha256', targetRole: role,
            providerCode: media.providerCode, storageKey: media.storageKey, relativePath: media.relativePath,
            fullPath: media.fullPath, url: media.url, accessUrl: media.accessUrl,
            publicationCode: asset.publicationCode || request.publicationCode,
            manifestCode: asset.manifestCode || request.manifestCode,
            topologyCode: topology.topologyCode, status: status || 'ACTIVE',
            evidence: Object.assign({ correlationId: request.correlationId || request.requestId,
                operationKey: request.publicationOperationKey }, evidence || {}) };
        try {
            let response = await SERVICE.DefaultMediaPlacementService.save({ tenant: request.tenant, authData: request.authData,
                transactionContext: request.transactionContext, query: { code: code }, model: model });
            return response && Array.isArray(response.result) ? response.result[0] : model;
        } catch (error) {
            if (SERVICE.DefaultLoggerService && typeof SERVICE.DefaultLoggerService.warn === 'function') {
                SERVICE.DefaultLoggerService.warn('Media placement evidence could not be saved', { code: code, error: this.errorCode(error) });
            }
            return undefined;
        }
    },
    /** Records a durable replication obligation when the replication target cannot be synchronized now. */
    recordReplicationFailure: async function (asset, activeMedia, request, error) {
        if (!SERVICE.DefaultMediaReplicationQueueService || typeof SERVICE.DefaultMediaReplicationQueueService.save !== 'function') return undefined;
        let topology = this.topology();
        let retryCount = Number(request.retryCount || 0);
        let delay = Math.max(1, Number(topology.retryDelaySeconds || 300));
        let code = this.recordCode([asset.code, asset.checksum, asset.manifestCode || request.manifestCode || request.correlationId,
            topology.activeLocationRole, topology.replicationLocationRole]);
        let model = { code: code, active: true, mediaCode: asset.code, mediaChecksum: asset.checksum,
            checksumAlgorithm: asset.checksumAlgorithm || 'sha256',
            ownerModule: asset.ownerModule || request.ownerModule,
            ownerType: asset.ownerType,
            ownerReference: asset.ownerReference,
            publicationType: asset.publicationType || request.publicationType,
            publicationCode: asset.publicationCode || request.publicationCode,
            manifestCode: asset.manifestCode || request.manifestCode,
            activeLocationRole: topology.activeLocationRole,
            replicationLocationRole: topology.replicationLocationRole,
            activeProviderCode: activeMedia && activeMedia.providerCode || topology.activeProviderCode,
            replicationProviderCode: topology.replicationProviderCode,
            sourceStorageKey: activeMedia && activeMedia.storageKey,
            failureCode: this.errorCode(error), failureMessage: this.errorMessage(error),
            retryCount: retryCount,
            nextRetryAt: new Date(Date.now() + delay * 1000),
            status: retryCount >= Number(topology.maxRetryAttempts || 10) ? 'REPLICATION_ESCALATED' : 'REPLICATION_RETRY_SCHEDULED',
            evidence: { correlationId: request.correlationId || request.requestId,
                operationKey: request.publicationOperationKey,
                publicationPolicy: topology.policy,
                recordedAt: new Date().toISOString() } };
        let response = await SERVICE.DefaultMediaReplicationQueueService.save({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext, query: { code: code }, model: model });
        return response && Array.isArray(response.result) ? response.result[0] : model;
    },
    /** Marks one replication obligation synchronized after a successful target placement. */
    markReplicationSynchronized: async function (asset, replicationMedia, request) {
        if (!SERVICE.DefaultMediaReplicationQueueService || typeof SERVICE.DefaultMediaReplicationQueueService.save !== 'function') return undefined;
        let topology = this.topology();
        let code = this.recordCode([asset.code, asset.checksum, asset.manifestCode || request.manifestCode || request.correlationId,
            topology.activeLocationRole, topology.replicationLocationRole]);
        let model = { code: code, active: true, mediaCode: asset.code, mediaChecksum: asset.checksum,
            checksumAlgorithm: asset.checksumAlgorithm || 'sha256',
            ownerModule: asset.ownerModule || request.ownerModule,
            ownerType: asset.ownerType,
            ownerReference: asset.ownerReference,
            publicationType: asset.publicationType || request.publicationType,
            publicationCode: asset.publicationCode || request.publicationCode,
            manifestCode: asset.manifestCode || request.manifestCode,
            activeLocationRole: topology.activeLocationRole,
            replicationLocationRole: topology.replicationLocationRole,
            activeProviderCode: topology.activeProviderCode,
            replicationProviderCode: replicationMedia && replicationMedia.providerCode || topology.replicationProviderCode,
            targetStorageKey: replicationMedia && replicationMedia.storageKey,
            retryCount: Number(request.retryCount || 0),
            status: 'REPLICATION_SYNCHRONIZED',
            evidence: { correlationId: request.correlationId || request.requestId,
                operationKey: request.publicationOperationKey,
                synchronizedAt: new Date().toISOString() } };
        let response = await SERVICE.DefaultMediaReplicationQueueService.save({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext, query: { code: code }, model: model });
        return response && Array.isArray(response.result) ? response.result[0] : model;
    },
    /** Stores one physical target copy without changing the logical Online media identity. */
    storePlacementCopy: async function (asset, buffer, request, providerCode, sourceMedia) {
        let storage = await SERVICE.DefaultMediaStorageProviderRegistryService.transfer({ tenant: request.tenant,
            authData: request.authData, enterpriseCode: asset.enterpriseCode, targetProviderCode: providerCode,
            sourceProviderCode: sourceMedia && sourceMedia.providerCode,
            sourceStorageKey: sourceMedia && sourceMedia.storageKey,
            folderCode: asset.folderCode || 'default', formatCode: asset.formatCode || 'original',
            mediaCode: asset.code, fileName: asset.originalFileName, originalFileName: asset.originalFileName,
            mimeType: asset.mimeType, sizeBytes: buffer.length, maximumBytes: buffer.length, buffer: buffer });
        return Object.assign({ code: asset.code, checksum: asset.checksum, checksumAlgorithm: asset.checksumAlgorithm,
            folderCode: asset.folderCode, formatCode: asset.formatCode }, storage);
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
                query: { code: asset.code }, searchOptions: { limit: 2 } }));
            if (existing.length > 1) throw new CLASSES.NodicsError('ERR_MED_00015', 'Online media identity conflict');
            let activeMedia;
            if (existing.length === 1 && existing[0].checksum === asset.checksum) {
                activeMedia = existing[0];
                imported.push(activeMedia);
                await this.savePlacement(activeMedia, asset, this.topology().activeLocationRole, request, 'ACTIVE',
                    { reusedExisting: true });
                await this.replicateAsset(asset, buffer, activeMedia, request);
                continue;
            }
            activeMedia = await SERVICE.DefaultMediaUploadService.upload({ tenant: request.tenant, authData: request.authData,
                providerCode: this.topology().activeProviderCode || request.providerCode,
                mediaCode: asset.code, name: asset.name,
                description: asset.description, folderCode: asset.folderCode, formatCode: asset.formatCode,
                enterpriseCode: asset.enterpriseCode, businessPurpose: asset.businessPurpose || 'CMS_PUBLICATION',
                ownerType: asset.ownerType || 'CMS_PUBLICATION_ASSET',
                ownerReference: asset.ownerReference || asset.checksum, reusable: asset.reusable !== false,
                retentionUntil: asset.retentionUntil || new Date(Date.now() + Number(policy.retentionDays || 7) * 86400000),
                files: [{ fieldName: 'publication', originalFileName: asset.originalFileName,
                    mimeType: asset.mimeType, sizeBytes: buffer.length, buffer: buffer }] });
            imported.push(activeMedia);
            await this.savePlacement(activeMedia, asset, this.topology().activeLocationRole, request, 'ACTIVE',
                { reusedExisting: false });
            await this.replicateAsset(asset, buffer, activeMedia, request);
        }
        return imported;
    },
    /** Attempts replication and records a durable retry obligation when it cannot complete. */
    replicateAsset: async function (asset, buffer, activeMedia, request) {
        let topology = this.topology();
        if (topology.replicationEnabled !== true && topology.policy !== 'PRIMARY_FIRST_WITH_DR_RECONCILIATION' &&
            topology.policy !== 'STRICT_PROD_WITH_DR') return undefined;
        if (!topology.replicationProviderCode) {
            let error = new CLASSES.NodicsError('ERR_MED_00021', 'Media replication provider is not configured');
            let queued = await this.recordReplicationFailure(asset, activeMedia, request, error);
            if (topology.strictReplication === true || topology.policy === 'STRICT_PROD_WITH_DR') throw error;
            return queued;
        }
        try {
            let replicationMedia = await this.storePlacementCopy(asset, buffer, request, topology.replicationProviderCode, activeMedia);
            await this.savePlacement(replicationMedia, asset, topology.replicationLocationRole, request,
                'REPLICATION_SYNCHRONIZED', { sourceProviderCode: activeMedia && activeMedia.providerCode });
            return this.markReplicationSynchronized(asset, replicationMedia, request);
        } catch (error) {
            let queued = await this.recordReplicationFailure(asset, activeMedia, request, error);
            if (topology.strictReplication === true || topology.policy === 'STRICT_PROD_WITH_DR') throw error;
            return queued;
        }
    },
    /** Replays replication for approved package assets through governed provider APIs. */
    reconcileReplication: async function (assets, request) {
        let topology = this.topology();
        assets = [].concat(assets || []);
        let result = { scanned: assets.length, synchronized: 0, queued: 0, skipped: 0, escalated: 0,
            status: 'REPLICATION_RECONCILIATION_COMPLETE' };
        if (topology.replicationEnabled !== true && topology.policy !== 'PRIMARY_FIRST_WITH_DR_RECONCILIATION' &&
            topology.policy !== 'STRICT_PROD_WITH_DR') {
            result.status = 'REPLICATION_DISABLED';
            result.skipped = assets.length;
            return result;
        }
        for (let asset of assets) {
            let buffer = Buffer.from(String(asset.contentBase64 || ''), 'base64');
            if (!buffer.length || buffer.length !== Number(asset.sizeBytes) ||
                this.checksum(buffer, asset.checksumAlgorithm) !== asset.checksum) {
                throw new CLASSES.NodicsError('ERR_MED_00014', 'Published media payload integrity validation failed');
            }
            let existing = this.items(await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
                query: { code: asset.code, checksum: asset.checksum }, searchOptions: { limit: 2 } }));
            if (existing.length !== 1) {
                await this.recordReplicationFailure(asset, undefined, request,
                    new CLASSES.NodicsError('ERR_MED_00013', 'Active media is unavailable for replication replay'));
                result.queued += 1;
                continue;
            }
            let replay = await this.replicateAsset(asset, buffer, existing[0], Object.assign({}, request, {
                retryCount: Number(request.retryCount || 0) + 1
            }));
            if (replay && replay.status === 'REPLICATION_SYNCHRONIZED') result.synchronized += 1;
            else if (replay && replay.status === 'REPLICATION_ESCALATED') result.escalated += 1;
            else if (replay) result.queued += 1;
            else result.skipped += 1;
        }
        if (result.escalated) result.status = 'REPLICATION_ESCALATED';
        else if (result.queued) result.status = 'REPLICATION_RETRY_SCHEDULED';
        return result;
    },
    /** Retries due generic media replication obligations without assuming CMS ownership. */
    retryPendingReplication: async function (request) {
        if (!SERVICE.DefaultMediaReplicationQueueService || typeof SERVICE.DefaultMediaReplicationQueueService.get !== 'function') {
            throw new CLASSES.NodicsError('ERR_MED_00024', 'Media replication queue service is unavailable');
        }
        let statuses = request.statuses || ['REPLICATION_PENDING', 'REPLICATION_FAILED', 'REPLICATION_RETRY_SCHEDULED'];
        let maximum = Math.min(Number(request.batchSize || 100), 500);
        let now = request.now ? new Date(request.now) : new Date();
        let response = await SERVICE.DefaultMediaReplicationQueueService.get({ tenant: request.tenant, authData: request.authData,
            query: { active: true, status: { $in: statuses }, $or: [{ nextRetryAt: { $lte: now } }, { nextRetryAt: { $exists: false } }] },
            searchOptions: { limit: maximum } });
        let rows = this.items(response);
        let result = { scanned: rows.length, synchronized: 0, queued: 0, skipped: 0, escalated: 0,
            status: 'MEDIA_REPLICATION_RETRY_COMPLETE' };
        for (let row of rows) {
            let active = this.items(await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
                query: { code: row.mediaCode, checksum: row.mediaChecksum }, searchOptions: { limit: 2 } }));
            if (active.length !== 1 || !active[0].storageKey) {
                let missingAsset = { code: row.mediaCode, checksum: row.mediaChecksum, checksumAlgorithm: row.checksumAlgorithm,
                    ownerModule: row.ownerModule, ownerType: row.ownerType, ownerReference: row.ownerReference,
                    publicationType: row.publicationType, publicationCode: row.publicationCode, manifestCode: row.manifestCode };
                let queued = await this.recordReplicationFailure(missingAsset, undefined, Object.assign({}, request, {
                    retryCount: Number(row.retryCount || 0) + 1
                }), new CLASSES.NodicsError('ERR_MED_00013', 'Active media is unavailable for generic replication retry'));
                if (queued && queued.status === 'REPLICATION_ESCALATED') result.escalated += 1;
                else result.queued += 1;
                continue;
            }
            let media = active[0];
            let asset = { code: row.mediaCode, name: media.name, description: media.description,
                folderCode: media.folderCode, formatCode: media.formatCode, originalFileName: media.originalFileName,
                mimeType: media.mimeType, sizeBytes: media.sizeBytes, checksum: row.mediaChecksum,
                checksumAlgorithm: row.checksumAlgorithm || media.checksumAlgorithm || 'sha256',
                access: media.access, businessPurpose: media.businessPurpose, ownerModule: row.ownerModule,
                ownerType: row.ownerType || media.ownerType, ownerReference: row.ownerReference || media.ownerReference,
                publicationType: row.publicationType, publicationCode: row.publicationCode, manifestCode: row.manifestCode };
            try {
                let target = await this.storePlacementCopy(asset, { length: Number(media.sizeBytes || 0) }, request,
                    row.replicationProviderCode || this.topology().replicationProviderCode, {
                        providerCode: row.activeProviderCode || media.providerCode,
                        storageKey: row.sourceStorageKey || media.storageKey
                    });
                await this.savePlacement(target, asset, row.replicationLocationRole || this.topology().replicationLocationRole,
                    request, 'REPLICATION_SYNCHRONIZED', { sourceProviderCode: row.activeProviderCode || media.providerCode });
                let synchronized = await this.markReplicationSynchronized(asset, target, Object.assign({}, request, {
                    retryCount: Number(row.retryCount || 0) + 1
                }));
                if (synchronized && synchronized.status === 'REPLICATION_SYNCHRONIZED') result.synchronized += 1;
                else result.skipped += 1;
            } catch (error) {
                let queued = await this.recordReplicationFailure(asset, media, Object.assign({}, request, {
                    retryCount: Number(row.retryCount || 0) + 1
                }), error);
                if (queued && queued.status === 'REPLICATION_ESCALATED') result.escalated += 1;
                else result.queued += 1;
            }
        }
        if (result.escalated) result.status = 'MEDIA_REPLICATION_RETRY_ESCALATED';
        else if (result.queued) result.status = 'MEDIA_REPLICATION_RETRY_SCHEDULED';
        return result;
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

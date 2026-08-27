/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/test/MediaPublicationTransferContract */
const assert = require('assert');
const crypto = require('crypto');
const service = require('../src/service/publication/defaultMediaPublicationTransferService');

class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }

(async function () {
    let saved;
    let buffer = Buffer.from('referenced-media');
    let checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    global.CLASSES = { NodicsError };
    let mediaConfig = { publication: { maximumAssets: 2, maximumAssetBytes: 100,
        maximumTotalBytes: 100, retentionDays: 7, garbageCollectionBatchSize: 10 } };
    global.CONFIG = { get: key => key === 'media' ? mediaConfig : undefined };
    global.SERVICE = {
        DefaultMediaService: {
            get: async request => request.query.code === 'hero' ? { result: [{ code: 'hero', active: true, status: 'READY',
                name: 'Hero', folderCode: 'cmsAssets', formatCode: 'original', providerCode: 'staged-local',
                storageKey: 'private/staged/path.png', originalFileName: 'hero.png', mimeType: 'image/png',
                sizeBytes: buffer.length, checksum: checksum, checksumAlgorithm: 'sha256', access: 'PUBLIC' }] } : { result: [] }
        },
        DefaultMediaStorageProviderRegistryService: { read: async request => {
            assert.strictEqual(request.storageKey, 'private/staged/path.png'); return buffer;
        } },
        DefaultMediaUploadService: { upload: async request => { saved = request; return { code: request.mediaCode, checksum: checksum }; } }
    };

    let assets = await service.exportReferenced(['hero', 'hero'], { tenant: 'default', authData: {} });
    assert.strictEqual(assets.length, 1);
    assert.strictEqual(assets[0].contentBase64, buffer.toString('base64'));
    assert.strictEqual(Object.prototype.hasOwnProperty.call(assets[0], 'storageKey'), false);
    global.SERVICE.DefaultMediaService.get = async () => ({ result: [] });
    let imported = await service.importReferenced(assets, { tenant: 'default', authData: {}, transactionContext: { id: 'tx' } });
    assert.strictEqual(imported[0].code, 'hero');
    assert.strictEqual(saved.transactionContext, undefined);
    assert.strictEqual(saved.files[0].buffer.equals(buffer), true);
    assert.strictEqual(saved.businessPurpose, 'CMS_PUBLICATION');
    assert.strictEqual(saved.ownerType, 'CMS_PUBLICATION_ASSET');
    assert.strictEqual(saved.ownerReference, checksum);
    assert.strictEqual(saved.reusable, true);
    assert(saved.retentionUntil instanceof Date);
    let productAsset = Object.assign({}, assets[0], {
        code: 'productHero',
        businessPurpose: 'AGORA_PRODUCT_PRIMARY_IMAGE',
        ownerType: 'PRODUCT',
        ownerReference: 'linenWrapDress',
        reusable: false
    });
    await service.importReferenced([productAsset], { tenant: 'default', authData: {}, transactionContext: { id: 'tx' } });
    assert.strictEqual(saved.mediaCode, 'productHero');
    assert.strictEqual(saved.businessPurpose, 'AGORA_PRODUCT_PRIMARY_IMAGE');
    assert.strictEqual(saved.ownerType, 'PRODUCT');
    assert.strictEqual(saved.ownerReference, 'linenWrapDress');
    assert.strictEqual(saved.reusable, false);
    let refreshed = false;
    global.SERVICE.DefaultMediaService.get = async request => request.query.code === 'hero'
        ? { result: [{ code: 'hero', checksum: 'stale-online-checksum' }] }
        : { result: [] };
    global.SERVICE.DefaultMediaUploadService.upload = async request => {
        refreshed = true;
        saved = request;
        return { code: request.mediaCode, checksum: checksum };
    };
    imported = await service.importReferenced(assets, { tenant: 'default', authData: {} });
    assert.strictEqual(imported[0].code, 'hero');
    assert.strictEqual(refreshed, true);
    assert.strictEqual(saved.mediaCode, 'hero');
    assert.strictEqual(saved.files[0].buffer.equals(buffer), true);
    global.SERVICE.DefaultMediaService.get = async () => ({ result: [
        { code: 'hero', checksum: 'first' },
        { code: 'hero', checksum: 'second' }
    ] });
    await assert.rejects(service.importReferenced(assets, { tenant: 'default' }), error => error.code === 'ERR_MED_00015');
    let corrupt = Object.assign({}, assets[0], { contentBase64: Buffer.from('wrong').toString('base64'), sizeBytes: 5 });
    await assert.rejects(service.importReferenced([corrupt], { tenant: 'default' }), error => error.code === 'ERR_MED_00014');

    let placements = [];
    let replicationRecords = [];
    mediaConfig.publication.topology = { policy: 'PRIMARY_FIRST_WITH_DR_RECONCILIATION', replicationEnabled: true,
        activeLocationRole: 'ACTIVE_PROD_MEDIA_LOCATION', replicationLocationRole: 'REPLICATION_PROD_MEDIA_LOCATION',
        activeProviderCode: 'online-local', replicationProviderCode: 'dr-local', retryDelaySeconds: 1, maxRetryAttempts: 2 };
    global.SERVICE.DefaultMediaService.get = async request => request.query.code === 'hero' && request.query.checksum === checksum
        ? { result: [{ code: 'hero', checksum: checksum, providerCode: 'online-local', storageKey: 'active/hero.png' }] }
        : { result: [] };
    global.SERVICE.DefaultMediaStorageProviderRegistryService.transfer = async request => {
        if (request.targetProviderCode === 'dr-down') throw new NodicsError('DR_DOWN', 'Replication location is unavailable');
        assert.strictEqual(request.sourceProviderCode, 'online-local');
        assert.strictEqual(request.sourceStorageKey, 'active/hero.png');
        return { providerCode: request.targetProviderCode, storageKey: request.targetProviderCode + '/hero.png',
            folderCode: request.folderCode, relativePath: request.providerCode + '/hero.png', access: 'PUBLIC',
            originalFileName: request.originalFileName, fileName: 'hero.png', mimeType: request.mimeType,
            sizeBytes: request.sizeBytes };
    };
    global.SERVICE.DefaultMediaPlacementService = { save: async request => {
        assert.strictEqual(request.transactionContext, undefined);
        assert.strictEqual(request.moduleName, undefined);
        assert.strictEqual(request.schemaModel, undefined);
        placements.push(request.model); return { result: [request.model] };
    } };
    global.SERVICE.DefaultMediaReplicationQueueService = { save: async request => {
        assert.strictEqual(request.transactionContext, undefined);
        assert.strictEqual(request.moduleName, undefined);
        assert.strictEqual(request.schemaModel, undefined);
        replicationRecords.push(request.model); return { result: [request.model] };
    } };
    await service.reconcileReplication(assets, { tenant: 'default', authData: {}, moduleName: 'cms',
        schemaModel: { rawSchema: {} }, transactionContext: { id: 'tx' }, manifestCode: 'manifest-1' });
    assert.strictEqual(placements[0].targetRole, 'REPLICATION_PROD_MEDIA_LOCATION');
    assert.strictEqual(replicationRecords[0].status, 'REPLICATION_SYNCHRONIZED');
    global.SERVICE.DefaultMediaStorageProviderRegistryService.read = async request => {
        assert.strictEqual(request.providerCode, 'online-local');
        assert.strictEqual(request.storageKey, 'active/hero.png');
        return buffer;
    };
    let redactedAssets = assets.map(asset => {
        let clone = Object.assign({}, asset);
        delete clone.contentBase64;
        return clone;
    });
    await service.reconcileReplication(redactedAssets, { tenant: 'default', authData: {}, manifestCode: 'manifest-1' });
    assert.strictEqual(placements[1].targetRole, 'REPLICATION_PROD_MEDIA_LOCATION');
    assert.strictEqual(replicationRecords[1].status, 'REPLICATION_SYNCHRONIZED');
    mediaConfig.publication.topology.replicationProviderCode = 'dr-down';
    await service.reconcileReplication(assets, { tenant: 'default', authData: {}, manifestCode: 'manifest-1' });
    assert.strictEqual(replicationRecords[2].status, 'REPLICATION_RETRY_SCHEDULED');
    assert.strictEqual(replicationRecords[2].failureCode, 'DR_DOWN');
    mediaConfig.publication.topology.replicationEnabled = false;

    let genericTransfers = [];
    let genericQueueRecords = [{
        code: 'queue-product-hero', active: true, mediaCode: 'productHero', mediaChecksum: checksum,
        checksumAlgorithm: 'sha256', ownerModule: 'product', ownerType: 'PRODUCT', ownerReference: 'linenWrapDress',
        publicationType: 'PRODUCT', publicationCode: 'productPublication-1', manifestCode: 'productManifest-1',
        activeLocationRole: 'ACTIVE_PROD_MEDIA_LOCATION', replicationLocationRole: 'REPLICATION_PROD_MEDIA_LOCATION',
        activeProviderCode: 'online-local', replicationProviderCode: 'dr-local', sourceStorageKey: 'active/productHero.png',
        retryCount: 0, status: 'REPLICATION_RETRY_SCHEDULED'
    }];
    global.SERVICE.DefaultMediaReplicationQueueService.get = async () => ({ result: genericQueueRecords });
    global.SERVICE.DefaultMediaService.get = async request => request.query.code === 'productHero'
        ? { result: [{ code: 'productHero', name: 'Product Hero', checksum: checksum, providerCode: 'online-local',
            storageKey: 'active/productHero.png', folderCode: 'productAssets', formatCode: 'original',
            originalFileName: 'productHero.png', mimeType: 'image/png', sizeBytes: buffer.length,
            ownerType: 'PRODUCT', ownerReference: 'linenWrapDress', businessPurpose: 'AGORA_PRODUCT_PUBLICATION' }] }
        : { result: [] };
    global.SERVICE.DefaultMediaStorageProviderRegistryService.transfer = async request => {
        genericTransfers.push(request);
        return { providerCode: request.targetProviderCode, storageKey: 'dr/productHero.png', relativePath: 'dr/productHero.png', sizeBytes: request.sizeBytes };
    };
    replicationRecords = [];
    placements = [];
    let genericRetry = await service.retryPendingReplication({ tenant: 'default', authData: {}, now: '2026-08-23T00:00:00.000Z' });
    assert.strictEqual(genericRetry.status, 'MEDIA_REPLICATION_RETRY_COMPLETE');
    assert.strictEqual(genericRetry.synchronized, 1);
    assert.strictEqual(genericTransfers[0].sourceProviderCode, 'online-local');
    assert.strictEqual(genericTransfers[0].sourceStorageKey, 'active/productHero.png');
    assert.strictEqual(genericTransfers[0].targetProviderCode, 'dr-local');
    assert.strictEqual(replicationRecords[0].ownerModule, 'product');
    assert.strictEqual(replicationRecords[0].publicationType, 'PRODUCT');
    assert.strictEqual(replicationRecords[0].ownerReference, 'linenWrapDress');

    let deleted = [];
    global.SERVICE.DefaultMediaService.get = async () => ({ result: [
        { code: 'active', businessPurpose: 'CMS_PUBLICATION', status: 'READY', retentionUntil: '2026-01-01T00:00:00.000Z' },
        { code: 'rollback', businessPurpose: 'CMS_PUBLICATION', status: 'READY', retentionUntil: '2026-01-01T00:00:00.000Z' },
        { code: 'orphan', businessPurpose: 'CMS_PUBLICATION', status: 'READY', retentionUntil: '2026-01-01T00:00:00.000Z' },
        { code: 'young', businessPurpose: 'CMS_PUBLICATION', status: 'READY', retentionUntil: '2027-01-01T00:00:00.000Z' },
        { code: 'held', businessPurpose: 'CMS_PUBLICATION', status: 'READY', retentionUntil: '2026-01-01T00:00:00.000Z', legalHold: true }
    ] });
    global.SERVICE.DefaultMediaLifecycleCoordinationService = { deleteExpired: async request => deleted.push(request.mediaCode) };
    let collected = await service.collectGarbage({ tenant: 'default', authData: {},
        protectedMediaCodes: ['active', 'rollback'], now: '2026-06-01T00:00:00.000Z', dryRun: false });
    assert.deepStrictEqual(deleted, ['orphan']);
    assert.deepStrictEqual(collected, { scanned: 5, protected: 2, retained: 2, deleted: 1, deletedMediaCodes: ['orphan'] });
    console.log('media publication transfer contract validated');
})().catch(error => { console.error(error); process.exit(1); });

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
    global.CONFIG = { get: key => key === 'media' ? { publication: { maximumAssets: 2, maximumAssetBytes: 100,
        maximumTotalBytes: 100, retentionDays: 7, garbageCollectionBatchSize: 10 } } : undefined };
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
    assert.strictEqual(saved.transactionContext.id, 'tx');
    assert.strictEqual(saved.files[0].buffer.equals(buffer), true);
    assert.strictEqual(saved.businessPurpose, 'CMS_PUBLICATION');
    assert.strictEqual(saved.ownerType, 'CMS_PUBLICATION_ASSET');
    assert.strictEqual(saved.ownerReference, checksum);
    assert.strictEqual(saved.reusable, true);
    assert(saved.retentionUntil instanceof Date);
    let corrupt = Object.assign({}, assets[0], { contentBase64: Buffer.from('wrong').toString('base64'), sizeBytes: 5 });
    await assert.rejects(service.importReferenced([corrupt], { tenant: 'default' }), error => error.code === 'ERR_MED_00014');

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

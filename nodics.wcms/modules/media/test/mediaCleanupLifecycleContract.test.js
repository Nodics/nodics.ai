/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/test/mediaCleanupLifecycleContract
 * @description Validates generic media cleanup scan, passive marking, approval-gated cleanup, and Cron declaration.
 * @layer test
 * @owner media
 * @override Cleanup must remain media-owned and generic across CMS, product, import, export, and custom media owners.
 */

const assert = require('assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const service = require('../src/service/storage/defaultMediaCleanupLifecycleService');
const localProvider = require('../src/service/storage/provider/defaultLocalMediaStorageProviderService');
const manifest = require('../data/manifest.json');
const jobData = require('../data/init-v001/records/jobs/mediaCleanupRetentionJobData');
const jobHeader = require('../data/init-v001/headers/jobs/mediaCleanupRetentionJobHeader');

let savedCandidates = [];
let savedMedia = [];
let removed = [];
let candidateQuery;
let mediaQuery;
global.CONFIG = { get: (key) => key === 'media' ? { cleanup: { passiveRetentionDays: 1, cleanupApprovalRequired: true } } : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } } };
global.SERVICE = {
    DefaultMediaService: {
        get: (request) => {
            mediaQuery = request.query;
            return Promise.resolve({ result: [
                { code: 'product-image-old', checksum: 'abc', folderCode: 'productAssets', providerCode: 'local', storageKey: 'safe/product-image-old.png', ownerType: 'PRODUCT_IMAGE', ownerReference: 'sku-1', status: 'RETIRED', legalHold: false },
                { code: 'cms-legal-hold', checksum: 'hold', folderCode: 'cmsAssets', providerCode: 'local', ownerType: 'CMS_ASSET', status: 'RETIRED', legalHold: true },
            ].filter(row => !request.query.code || row.code === request.query.code) });
        },
        save: (request) => { savedMedia.push(request.model); return Promise.resolve({ result: [request.model] }); },
    },
    DefaultMediaReferenceService: { get: (request) => Promise.resolve({ result: request.query.mediaCode === 'product-image-old' ? [] : [{ code: 'active-ref' }] }) },
    DefaultMediaCleanupCandidateService: {
        get: (request) => {
            candidateQuery = request.query;
            return Promise.resolve({ result: [{ code: 'candidate-1', active: true, mediaCode: 'product-image-old', mediaChecksum: 'abc', status: 'PASSIVE', purgeEligibleAt: new Date('2026-01-01T00:00:00.000Z'), approvedAt: new Date('2026-01-02T00:00:00.000Z') }] });
        },
        save: (request) => { savedCandidates.push(request.model); return Promise.resolve({ result: [request.model] }); },
    },
    DefaultMediaPlacementService: { get: () => Promise.resolve({ result: [{ providerCode: 'local', storageKey: 'safe/product-image-old.png' }] }) },
    DefaultMediaStorageProviderRegistryService: { remove: (request) => { removed.push(request); return Promise.resolve({ removed: true }); } },
};

(async function () {
    const now = '2026-01-03T00:00:00.000Z';
    await assert.rejects(service.previewCandidates({ now, mediaCode: { $ne: '' } }), { code: 'ERR_MED_00025' });
    await assert.rejects(service.runRetentionCleanup({ now, candidateCode: { $ne: '' } }), { code: 'ERR_MED_00025' });
    let preview = await service.previewCandidates({ now, mediaCode: 'product-image-old' });
    assert.strictEqual(mediaQuery.code, 'product-image-old', 'a scoped preview must query the exact Media code');
    assert.strictEqual(preview.previewOnly, true, 'preview must be dry-run only');
    assert.strictEqual(preview.saved, 0, 'preview must not persist candidates');
    assert.strictEqual(preview.records[0].artifactClass, 'PRODUCT_ASSET', 'cleanup must classify product media generically');
    let scan = await service.scanCandidates({ now: '2026-01-03T00:00:00.000Z' });
    assert.strictEqual(scan.saved, 1, 'scan must persist one unreferenced candidate');
    assert.strictEqual(savedCandidates[0].status, 'CLEANUP_CANDIDATE', 'scan must create review candidate, not delete media');
    let passive = await service.markPassive({ candidateCode: 'candidate-1', now: '2026-01-03T00:00:00.000Z', source: 'operator' });
    assert.strictEqual(passive.status, 'PASSIVE', 'mark passive must not physically delete media');
    assert(savedMedia.some(media => media.status === 'RETIRED'), 'passive marking should retire logical media metadata');
    let cleanup = await service.runRetentionCleanup({ now, candidateCode: 'candidate-1' });
    assert.strictEqual(candidateQuery.code, 'candidate-1', 'a scoped run must query the exact candidate code');
    assert.strictEqual(cleanup.cleaned, 1, 'approved passive candidate must be cleaned');
    assert.strictEqual(removed[0].storageKey, 'safe/product-image-old.png', 'cleanup must remove through provider storage key only');
    assert.strictEqual(removed.length, 1, 'metadata and placement for the same file must be deduplicated');
    global.SERVICE.DefaultMediaPlacementService.get = async () => ({ result: [] });
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'nodics-media-cleanup-test-'));
    try {
        const file = path.join(root, 'safe/product-image-old.png');
        const sibling = path.join(root, 'safe/protected.png');
        await fs.mkdir(path.dirname(file));
        await fs.writeFile(file, 'disposable Media fixture');
        await fs.writeFile(sibling, 'must be preserved');
        global.SERVICE.DefaultMediaStorageKeyService = require('../src/service/storage/defaultMediaStorageKeyService');
        global.SERVICE.DefaultMediaStorageRootResolverService = { resolveLocalRoot: () => root };
        global.SERVICE.DefaultMediaStorageProviderRegistryService.remove = async (request) => {
            removed.push(request);
            return localProvider.remove(request);
        };
        cleanup = await service.runRetentionCleanup({ now: '2026-01-03T00:00:00.000Z' });
        assert.strictEqual(cleanup.cleaned, 1, 'an ordinary upload can use its owner metadata location');
        assert.strictEqual(cleanup.records[0].evidence.removedPlacements, 1);
        await assert.rejects(fs.stat(file), { code: 'ENOENT' });
        assert.strictEqual(await fs.readFile(sibling, 'utf8'), 'must be preserved');
    } finally {
        await fs.rm(root, { recursive: true, force: true });
    }
    global.SERVICE.DefaultMediaReferenceService.get = async () => ({ result: [{ code: 'late-reference' }] });
    cleanup = await service.runRetentionCleanup({ now: '2026-01-03T00:00:00.000Z' });
    assert.strictEqual(cleanup.cleaned, 0, 'a reference added after candidate approval blocks purge');
    assert.strictEqual(removed.length, 2, 'a newly referenced item must not reach the provider');
    global.SERVICE.DefaultMediaReferenceService.get = async () => ({ result: [] });
    global.SERVICE.DefaultMediaStorageProviderRegistryService.remove = async () => ({ removed: false });
    cleanup = await service.runRetentionCleanup({ now: '2026-01-03T00:00:00.000Z' });
    assert.strictEqual(cleanup.records[0].evidence.removedPlacements, 0, 'an already absent object must not count as removed');
    assert.strictEqual(cleanup.records[0].evidence.absentPlacements, 1, 'the receipt must distinguish already absent from removed');
    global.SERVICE.DefaultMediaStorageProviderRegistryService.remove = async () => ({});
    cleanup = await service.runRetentionCleanup({ now: '2026-01-03T00:00:00.000Z' });
    assert.strictEqual(cleanup.failed, 1, 'an unacknowledged removal must not report success');
    assert.strictEqual(savedCandidates.at(-1).status, 'CLEANUP_FAILED');
    assert(manifest.sections.mediaCleanupRetentionJob, 'media cleanup retention job must be declared in media manifest');
    assert.strictEqual(jobData.record1.jobDetail.internal.module, 'media', 'cleanup job must call Media module');
    assert.strictEqual(jobData.record1.jobDetail.internal.uri, '/cleanup/retention/run', 'cleanup job must call retention cleanup route');
    assert.strictEqual(jobHeader.cronjob.mediaCleanupRetentionJob.options.schemaName, 'cronJob', 'cleanup job header must install Cron job');
    console.log('media cleanup lifecycle contract validated');
})().catch((error) => { console.error(error); process.exit(1); });

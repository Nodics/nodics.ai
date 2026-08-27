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
const service = require('../src/service/storage/defaultMediaCleanupLifecycleService');
const manifest = require('../data/manifest.json');
const jobData = require('../data/init-v001/records/jobs/mediaCleanupRetentionJobData');
const jobHeader = require('../data/init-v001/headers/jobs/mediaCleanupRetentionJobHeader');

let savedCandidates = [];
let savedMedia = [];
let removed = [];
global.CONFIG = { get: (key) => key === 'media' ? { cleanup: { passiveRetentionDays: 1, cleanupApprovalRequired: true } } : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } } };
global.SERVICE = {
    DefaultMediaService: {
        get: () => Promise.resolve({ result: [
            { code: 'product-image-old', checksum: 'abc', folderCode: 'productAssets', providerCode: 'local', ownerType: 'PRODUCT_IMAGE', ownerReference: 'sku-1', status: 'RETIRED', legalHold: false },
            { code: 'cms-legal-hold', checksum: 'hold', folderCode: 'cmsAssets', providerCode: 'local', ownerType: 'CMS_ASSET', status: 'RETIRED', legalHold: true },
        ] }),
        save: (request) => { savedMedia.push(request.model); return Promise.resolve({ result: [request.model] }); },
    },
    DefaultMediaReferenceService: { get: (request) => Promise.resolve({ result: request.query.mediaCode === 'product-image-old' ? [] : [{ code: 'active-ref' }] }) },
    DefaultMediaCleanupCandidateService: {
        get: () => Promise.resolve({ result: [{ code: 'candidate-1', active: true, mediaCode: 'product-image-old', status: 'PASSIVE', purgeEligibleAt: new Date('2026-01-01T00:00:00.000Z'), approvedAt: new Date('2026-01-02T00:00:00.000Z') }] }),
        save: (request) => { savedCandidates.push(request.model); return Promise.resolve({ result: [request.model] }); },
    },
    DefaultMediaPlacementService: { get: () => Promise.resolve({ result: [{ providerCode: 'local', storageKey: 'safe/product-image-old.png' }] }) },
    DefaultMediaStorageProviderRegistryService: { remove: (request) => { removed.push(request); return Promise.resolve({ removed: true }); } },
};

(async function () {
    let preview = await service.previewCandidates({ now: '2026-01-03T00:00:00.000Z' });
    assert.strictEqual(preview.previewOnly, true, 'preview must be dry-run only');
    assert.strictEqual(preview.saved, 0, 'preview must not persist candidates');
    assert.strictEqual(preview.records[0].artifactClass, 'PRODUCT_ASSET', 'cleanup must classify product media generically');
    let scan = await service.scanCandidates({ now: '2026-01-03T00:00:00.000Z' });
    assert.strictEqual(scan.saved, 1, 'scan must persist one unreferenced candidate');
    assert.strictEqual(savedCandidates[0].status, 'CLEANUP_CANDIDATE', 'scan must create review candidate, not delete media');
    let passive = await service.markPassive({ candidateCode: 'candidate-1', now: '2026-01-03T00:00:00.000Z', source: 'operator' });
    assert.strictEqual(passive.status, 'PASSIVE', 'mark passive must not physically delete media');
    assert(savedMedia.some(media => media.status === 'RETIRED'), 'passive marking should retire logical media metadata');
    let cleanup = await service.runRetentionCleanup({ now: '2026-01-03T00:00:00.000Z' });
    assert.strictEqual(cleanup.cleaned, 1, 'approved passive candidate must be cleaned');
    assert.strictEqual(removed[0].storageKey, 'safe/product-image-old.png', 'cleanup must remove through provider storage key only');
    assert(manifest.sections.mediaCleanupRetentionJob, 'media cleanup retention job must be declared in media manifest');
    assert.strictEqual(jobData.record1.jobDetail.internal.module, 'media', 'cleanup job must call Media module');
    assert.strictEqual(jobData.record1.jobDetail.internal.uri, '/cleanup/retention/run', 'cleanup job must call retention cleanup route');
    assert.strictEqual(jobHeader.cronjob.mediaCleanupRetentionJob.options.schemaName, 'cronJob', 'cleanup job header must install Cron job');
    console.log('media cleanup lifecycle contract validated');
})().catch((error) => { console.error(error); process.exit(1); });

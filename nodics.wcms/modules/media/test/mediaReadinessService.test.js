/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/test/mediaReadinessService
 * @description Validates Media-owned object, physical artifact, reference, and cleanup readiness diagnostics.
 * @layer test
 * @owner media
 */
const assert = require('assert');
const service = require('../src/service/defaultMediaReadinessService');

global.SERVICE = {
    DefaultMediaService: { get: () => Promise.resolve({ result: [
        { code: 'ready-image', providerCode: 'local', storageKey: 'product/ready.png', mimeType: 'image/png',
            ownerType: 'PRODUCT_IMAGE', ownerReference: 'sku-1', status: 'READY' },
        { code: 'missing-blob', providerCode: 'local', mimeType: 'image/png',
            ownerType: 'PRODUCT_IMAGE', ownerReference: 'sku-2', status: 'READY' },
        { code: 'incomplete-metadata', storageKey: 'draft/item.png', status: 'READY' },
    ] }) },
    DefaultMediaReferenceService: { get: () => Promise.resolve({ result: [
        { code: 'ref-ready', mediaCode: 'ready-image', status: 'ACTIVE' },
        { code: 'ref-missing', mediaCode: 'missing-media', status: 'ACTIVE' },
        { code: 'ref-inactive', mediaCode: 'ready-image', status: 'INACTIVE' },
    ] }) },
    DefaultMediaCleanupLifecycleService: { previewCandidates: () => Promise.resolve({
        candidates: 1,
        records: [{ code: 'cleanup-1', mediaCode: 'old-image' }],
    }) },
};

(async function () {
    let readiness = await service.readiness({ tenant: 'default', authData: { tokenType: 'service' } });
    assert.strictEqual(readiness.contractVersion, 1);
    assert.strictEqual(readiness.businessStatus, 'NEEDS_ATTENTION');
    assert.strictEqual(readiness.summary.providerAvailable, true);
    assert.strictEqual(readiness.summary.mediaCount, 3);
    assert.strictEqual(readiness.summary.incompleteMetadataCount, 1);
    assert.strictEqual(readiness.summary.missingPhysicalCount, 1);
    assert.strictEqual(readiness.summary.referenceCount, 3);
    assert.strictEqual(readiness.summary.brokenReferenceCount, 2);
    assert.strictEqual(readiness.summary.cleanupCandidateCount, 1);
    assert(readiness.blockers.some(blocker => blocker.code === 'MEDIA_OBJECT_METADATA_INCOMPLETE'
        && blocker.repair.operation === 'media.repairObjects'));
    assert(readiness.blockers.some(blocker => blocker.code === 'MEDIA_PHYSICAL_ARTIFACT_MISSING'
        && blocker.repair.operation === 'media.reconcilePhysicalArtifacts'));
    assert(readiness.blockers.some(blocker => blocker.code === 'MEDIA_REFERENCE_BROKEN'
        && blocker.repair.operation === 'media.reconcileReferences'));
    assert(readiness.blockers.some(blocker => blocker.code === 'MEDIA_CLEANUP_REVIEW_REQUIRED'
        && blocker.repair.operation === 'media.cleanup.reviewCandidates'));
    console.log('media readiness service contract validated');
})().catch(error => { console.error(error); process.exit(1); });

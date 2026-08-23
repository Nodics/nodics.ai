/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/test/mediaArtifactPublicationContract
 * @description Validates generic physical media artifact manifests, receipts, non-publishable policy, and PROD/DR role switching.
 * @layer test
 * @owner media
 */
const assert = require('assert');
const service = require('../src/service/publication/defaultMediaArtifactPublicationService');

global.CONFIG = { get: (key) => key === 'media' ? { publication: { artifacts: { inlineThresholdBytes: 10, packageThresholdBytes: 100 } } } : undefined };
global.SERVICE = {
    DefaultMediaService: {
        get: () => Promise.resolve({ result: [
            { code: 'sku-image', checksum: 'abc', checksumAlgorithm: 'sha256', folderCode: 'productAssets', providerCode: 'local', storageKey: 'product/sku-image.png', ownerType: 'PRODUCT_IMAGE', ownerReference: 'sku-1', sizeBytes: 200, status: 'READY' },
            { code: 'debug-log', checksum: 'def', folderCode: 'logs', providerCode: 'local', storageKey: 'logs/debug.log', ownerType: 'OPERATIONAL_FILE', sizeBytes: 1, status: 'READY' },
        ] })
    },
    DefaultMediaTransferManifestService: { save: (request) => Promise.resolve({ result: [request.model] }) },
    DefaultMediaPublicationReceiptService: { save: (request) => Promise.resolve({ result: [request.model] }) }
};

(async function () {
    let manifest = await service.buildTransferManifest({ publicationCode: 'pub-1', mediaCodes: ['sku-image', 'debug-log'], sourceRuntimeRole: 'STAGED', targetRuntimeRole: 'ONLINE' });
    assert.strictEqual(manifest.artifactCount, 1, 'non-publishable operational files must be blocked from publication manifests');
    assert.strictEqual(manifest.artifacts[0].artifactClass, 'PRODUCT_ASSET', 'product media must be classified as product asset');
    assert.strictEqual(manifest.artifacts[0].transportStrategy, 'STREAMING_TRANSFER', 'large cross-provider artifact should use streaming transfer');
    let receipt = await service.recordReceipt({ publicationCode: 'pub-1', manifestCode: manifest.code, mediaCode: 'sku-image', targetRuntimeRole: 'ONLINE', receiptType: 'PUBLICATION_AUDIT', checksum: 'abc' });
    assert.strictEqual(receipt.receiptType, 'PUBLICATION_AUDIT', 'publication audit receipt must be recordable');
    let switched = service.switchProdDrRoles({ activeLocationRole: 'x', replicationLocationRole: 'y', reason: 'DR_ACTIVE' });
    assert.strictEqual(switched.activeLocationRole, 'y', 'DR switch must promote replication role to active role');
    assert.strictEqual(switched.replicationLocationRole, 'x', 'DR switch must demote previous active role to replication role');
    console.log('media artifact publication contract validated');
})().catch((error) => { console.error(error); process.exit(1); });

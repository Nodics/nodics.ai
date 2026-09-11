/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/test/mediaEvidencePreviewContract
 * @description Proves bounded service-authorized public media previews without weakening customer-original ownership.
 * @layer test
 * @owner media
 * @override Public preview MIME policy may be narrowed while retaining internal service, access and owner checks.
 */
const assert = require('node:assert/strict');
const service = require('../src/service/storage/defaultCustomerMediaService');
class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
global.CLASSES = { NodicsError };
let item, reads = 0;
const policy = { maximumBytes: 1024, publicPreviewMimeTypes: ['image/png', 'image/svg+xml'] };
global.CONFIG = { get: () => ({ evidenceRead: policy }) };
global.SERVICE = {
    DefaultMediaReferenceLookupService: { loadReference: async () => item },
    DefaultMediaStorageProviderRegistryService: { read: async request => {
        assert.equal(request.maximumBytes, 1024); reads++; return Buffer.from('image');
    } }
};
const context = { ...service, owner: async request => {
    if (request.authData.principalType !== 'customer') throw new NodicsError('ERR_MED_00007', 'Customer required');
    return request.authData.code;
} };
const internal = { code: 'sample', internalEvidenceRead: true, authData: { tenant: 'test', principalType: 'service', groups: ['serviceAccountUserGroup'] } };
const customer = { code: 'original', authData: { tenant: 'test', principalType: 'customer', code: 'alice', groups: ['customerUserGroup'] } };
(async () => {
    item = { code: 'sample', ownerType: 'APPLICATION', access: 'PUBLIC', mimeType: 'image/svg+xml', storageKey: 'private/provider/key' };
    const sample = await context.read(internal);
    assert.equal(sample.previewType, 'PUBLIC_MEDIA'); assert.equal(sample.contentBase64, 'aW1hZ2U=');
    assert.equal(sample.storageKey, undefined); assert.equal(reads, 1);
    await assert.rejects(() => context.read(customer), { code: 'ERR_MED_00008' });
    await assert.rejects(() => context.read({ ...internal, internalEvidenceRead: false }));
    item = { ...item, access: 'PRIVATE' };
    await assert.rejects(() => context.read(internal), { code: 'ERR_MED_00008' });
    item = { ...item, access: 'PUBLIC', mimeType: 'text/html' };
    await assert.rejects(() => context.read(internal), { code: 'ERR_MED_00008' });
    assert.equal(reads, 1, 'rejected previews must never read storage');
    item = { code: 'original', ownerType: 'CUSTOMER', ownerReference: 'alice', access: 'PRIVATE', mimeType: 'image/png' };
    assert.equal((await context.read(customer)).previewType, 'CUSTOMER_ORIGINAL');
    await assert.rejects(() => context.read({ ...customer, authData: { ...customer.authData, code: 'bob' } }), { code: 'ERR_MED_00008' });
    assert.equal((await context.read(internal)).previewType, 'CUSTOMER_ORIGINAL');
    console.log('Media evidence preview contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });

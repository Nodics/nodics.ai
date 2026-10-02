/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module media/test/MediaExactCurrentExportContract
 * @description Exercises qualified exact-current export integrity and legacy compatibility with in-memory providers only.
 * @layer test
 * @owner media
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const transfer = require('../src/service/publication/defaultMediaPublicationTransferService');
const retained = require('../src/service/publication/defaultMediaRetainedPublicationService');

function fixture(t) {
    const names = ['CONFIG', 'SERVICE', 'NODICS', 'UTILS', 'CLASSES'];
    const previous = names.map((name) => global[name]);
    t.after(() =>
        names.forEach((name, index) => {
            if (previous[index] === undefined) delete global[name];
            else global[name] = previous[index];
        })
    );
    const bytes = Buffer.from('exact media bytes');
    const policy = {
        versionProviderEnabled: true,
        runtimeRole: 'STAGED',
        maximumAssets: 3,
        maximumTotalBytes: 100
    };
    const model = {
        versioned: true,
        rawSchema: { versionedReadMode: 'CURRENT' }
    };
    const row = {
        code: 'hero',
        active: true,
        status: 'READY',
        versionId: 7,
        name: 'Hero',
        description: 'Metadata',
        folderCode: 'folder',
        formatCode: 'png',
        extension: 'png',
        originalFileName: 'hero.png',
        mimeType: 'image/png',
        sizeBytes: bytes.length,
        checksumAlgorithm: 'sha256',
        checksum: crypto.createHash('sha256').update(bytes).digest('hex'),
        access: 'PUBLIC',
        businessPurpose: 'CMS',
        ownerType: 'content',
        ownerReference: 'page',
        enterpriseCode: 'one',
        reusable: false,
        providerCode: 'private-provider',
        storageKey: 'private-key',
        fullPath: '/private/file'
    };
    let reads = 0;
    let byteReads = 0;
    global.CONFIG = {
        get: (key) => (key === 'media' ? { publication: policy } : undefined)
    };
    global.NODICS = { getModels: () => ({ MediaModel: model }) };
    global.UTILS = { createModelName: () => 'MediaModel' };
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code, message) {
                super(message);
                this.code = code;
            }
        }
    };
    global.SERVICE = {
        DefaultMediaRetainedPublicationService: retained,
        DefaultDatabaseTransactionService: {
            capabilities: () => ({
                multiRecordAtomic: true,
                contextPropagation: true
            })
        },
        DefaultMediaService: {
            get: async (request) => {
                reads++;
                if (policy.versionProviderEnabled)
                    assert.equal(request.skipcache, true);
                return { result: [{ ...row }] };
            }
        },
        DefaultMediaStorageProviderRegistryService: {
            read: async () => {
                byteReads++;
                return bytes;
            }
        }
    };
    return {
        policy,
        model,
        row,
        bytes,
        request: {
            tenant: 'one',
            publicationCode: 'pub',
            manifestCode: 'manifest'
        },
        reads: () => reads,
        byteReads: () => byteReads
    };
}

test('qualified export pins exact CURRENT version and full retained metadata with no locators', async (t) => {
    const f = fixture(t);
    const [asset] = await transfer.exportReferenced(
        ['hero', 'hero'],
        f.request
    );
    assert.deepEqual(asset, {
        ...retained.project(f.row),
        publicationCode: 'pub',
        manifestCode: 'manifest',
        contentBase64: f.bytes.toString('base64')
    });
    assert.equal(f.reads(), 2);
    assert.equal(f.byteReads(), 1);
    for (const key of ['storageKey', 'providerCode', 'fullPath'])
        assert.equal(Object.hasOwn(asset, key), false);
});

test('missing version and non-CURRENT storage reject rather than fabricate a pin', async (t) => {
    const f = fixture(t);
    delete f.row.versionId;
    await assert.rejects(transfer.exportReferenced(['hero'], f.request));
    assert.equal(f.byteReads(), 0);
    f.row.versionId = 7;
    f.model.rawSchema.versionedReadMode = 'HISTORY';
    await assert.rejects(transfer.exportReferenced(['hero'], f.request));
    assert.equal(f.byteReads(), 0);
});

test('byte count, checksum and algorithm must match retained projection exactly', async (t) => {
    const f = fixture(t);
    for (const [key, invalid] of [
        ['sizeBytes', 1],
        ['checksum', '0'.repeat(64)],
        ['checksumAlgorithm', 'md5']
    ]) {
        const previous = f.row[key];
        f.row[key] = invalid;
        await assert.rejects(transfer.exportReferenced(['hero'], f.request));
        f.row[key] = previous;
    }
    SERVICE.DefaultMediaStorageProviderRegistryService.read = async () =>
        Buffer.alloc(0);
    await assert.rejects(transfer.exportReferenced(['hero'], f.request));
});

test('concurrent version, full metadata or provider locator changes reject exact export', async (t) => {
    const f = fixture(t);
    for (const [key, value] of [
        ['versionId', 8],
        ['description', 'Changed'],
        ['storageKey', 'other']
    ]) {
        let reads = 0;
        SERVICE.DefaultMediaService.get = async () => ({
            result: [{ ...f.row, ...(++reads === 2 ? { [key]: value } : {}) }]
        });
        await assert.rejects(
            transfer.exportReferenced(['hero'], f.request),
            /changed/
        );
    }
});

test('ambiguous records, oversized export and unqualified atomic storage reject', async (t) => {
    const f = fixture(t);
    const get = SERVICE.DefaultMediaService.get;
    SERVICE.DefaultMediaService.get = async () => ({ result: [f.row, f.row] });
    await assert.rejects(transfer.exportReferenced(['hero'], f.request));
    SERVICE.DefaultMediaService.get = get;
    f.policy.maximumTotalBytes = 1;
    await assert.rejects(transfer.exportReferenced(['hero'], f.request));
    SERVICE.DefaultDatabaseTransactionService.capabilities = () => ({
        multiRecordAtomic: false
    });
    await assert.rejects(transfer.exportReferenced(['hero'], f.request));
});

test('disabled qualification preserves legacy unversioned export without invented version', async (t) => {
    const f = fixture(t);
    f.policy.versionProviderEnabled = false;
    delete f.row.versionId;
    f.model.versioned = false;
    const [asset] = await transfer.exportReferenced(['hero'], f.request);
    assert.equal(Object.hasOwn(asset, 'versionId'), false);
    assert.equal(asset.contentBase64, f.bytes.toString('base64'));
    assert.equal(asset.reusable, false);
    assert.equal(f.reads(), 1);
});

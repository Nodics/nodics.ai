/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/test/mediaUploadInspectionContract
 * @description Protects scoped revision inspection, verified reuse and unchanged upload CAS guards.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const service = require('../src/service/storage/defaultMediaUploadService');
const routes = require('../src/router/routers').media.storagePolicy;

describe('Media upload inspection', function () {
    let request;
    let current;
    let reads;
    let payload;
    beforeEach(function () {
        global.CLASSES = {
            NodicsError: class extends Error {
                constructor(code, message) {
                    super(message);
                    this.code = code;
                }
            }
        };
        payload = Buffer.from('asset');
        request = {
            tenant: 'tenant-a',
            authData: { principalId: 'operator' },
            mediaCode: 'asset-1',
            checksum: crypto.createHash('sha256').update(payload).digest('hex'),
            sizeBytes: payload.length,
            originalFileName: 'asset.svg',
            mimeType: 'image/svg+xml',
            folderCode: 'cmsAssets',
            formatCode: 'original',
            name: 'Asset',
            description: 'Asset',
            businessPurpose: 'APPLICATION_CONTENT',
            ownerType: 'CMS_COMPONENT',
            ownerReference: 'hero'
        };
        current = {
            ...request,
            code: request.mediaCode,
            versionId: 3,
            active: true,
            status: 'READY',
            checksumAlgorithm: 'sha256',
            providerCode: 'local',
            storageKey: 'private/key'
        };
        reads = [];
        global.SERVICE = {
            DefaultMediaStoragePolicyService: {
                validateDescriptor: () => ({}),
                getConfiguration: () => ({})
            },
            DefaultMediaLifecycleCoordinationService: {
                isVersioned: () => true,
                records: (value) => value.result
            },
            DefaultMediaService: {
                get: async (input) => {
                    reads.push(input);
                    return { result: current ? [current] : [] };
                }
            },
            DefaultMediaStorageProviderRegistryService: {
                read: async () => payload
            }
        };
    });
    it('publishes inspection under the same upload permission and exposure', function () {
        assert.equal(
            routes.inspectUpload.permission,
            routes.uploadMedia.permission
        );
        assert.equal(
            routes.inspectUpload.apiExposure,
            routes.uploadMedia.apiExposure
        );
        assert.deepEqual(
            routes.inspectUpload.accessGroups,
            routes.uploadMedia.accessGroups
        );
    });
    it('verifies persisted bytes and repeats the scoped read before reusing', async function () {
        const result = await service.inspectUpload(request);
        assert.deepEqual(result, {
            contractVersion: 1,
            mediaCode: 'asset-1',
            versioned: true,
            exists: true,
            unchanged: true,
            versionId: 3
        });
        assert.equal(reads.length, 2);
        for (const read of reads) {
            assert.equal(read.tenant, request.tenant);
            assert.equal(read.authData, request.authData);
            assert.deepEqual(read.query, { code: 'asset-1' });
            assert.equal(read.searchOptions.limit, 2);
        }
        assert.equal(result.storageKey, undefined);
    });
    it('returns the current CAS revision for changed metadata or corrupt bytes', async function () {
        current.name = 'Changed';
        assert.equal((await service.inspectUpload(request)).unchanged, false);
        current.name = request.name;
        payload = Buffer.from('other');
        const result = await service.inspectUpload(request);
        assert.equal(result.unchanged, false);
        assert.equal(result.versionId, 3);
    });
    it('distinguishes absent records without inventing a version', async function () {
        current = undefined;
        const result = await service.inspectUpload(request);
        assert.equal(result.exists, false);
        assert.equal(result.unchanged, false);
        assert.equal(result.versionId, undefined);
    });
    it('fails closed when metadata matches but physical bytes are missing', async function () {
        SERVICE.DefaultMediaStorageProviderRegistryService.read = async () => {
            throw Object.assign(new Error('missing bytes'), { code: 'ENOENT' });
        };
        await assert.rejects(
            service.inspectUpload(request),
            (error) => error.code === 'ENOENT'
        );
    });
    it('propagates denial and malformed reads instead of interpreting them as absence', async function () {
        SERVICE.DefaultMediaService.get = async () => {
            throw new Error('denied');
        };
        await assert.rejects(service.inspectUpload(request), /denied/);
        SERVICE.DefaultMediaService.get = async () => ({});
        await assert.rejects(
            service.inspectUpload(request),
            (error) => error.code === 'ERR_MED_00014'
        );
    });
    it('rejects a revision changed during provider verification', async function () {
        SERVICE.DefaultMediaStorageProviderRegistryService.read = async () => {
            current = { ...current, versionId: 4 };
            return payload;
        };
        await assert.rejects(
            service.inspectUpload(request),
            (error) => error.code === 'ERR_MED_00014'
        );
    });
    it('retains the upload guard for missing and stale CAS revisions', async function () {
        const upload = {
            ...request,
            files: [
                {
                    buffer: payload,
                    sizeBytes: payload.length,
                    originalFileName: 'asset.svg'
                }
            ]
        };
        await assert.rejects(
            service.upload(upload),
            (error) => error.code === 'ERR_MED_00014'
        );
        await assert.rejects(
            service.upload({ ...upload, versionId: 2 }),
            (error) => error.code === 'ERR_MED_00014'
        );
    });
});

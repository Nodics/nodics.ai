/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module media/test/mediaReadinessAggregateContract
 * @description Composes real controller, facade, scoped CURRENT owner read and aggregate projection with inert persistence mocks.
 * @layer test
 * @owner media
 */
const assert = require('node:assert/strict');
const owner = require('../src/service/storage/defaultMediaReadinessService');
const library = require('../src/service/defaultMediaLibraryService');
const controller = require('../src/controller/storage/defaultMediaStorageController');
const facade = require('../src/facade/storage/defaultMediaStorageFacade');
const routes = require('../src/router/routers').media.storagePolicy;
const getPipeline = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');

describe('Media persisted readiness aggregate', function () {
    let request, assets, rows, reads, granted, model;
    beforeEach(function () {
        global.CLASSES = {
            NodicsError: class extends Error {
                constructor(code, message) {
                    super(message);
                    this.code = code;
                }
            },
        };
        granted = true;
        model = {
            versioned: true,
            rawSchema: { versionedReadMode: 'CURRENT' },
        };
        global.NODICS = { getModels: () => ({ MediaModel: model }) };
        global.UTILS = { createModelName: () => 'MediaModel' };
        assets = Array.from({ length: 37 }, (_, index) => ({
            mediaCode: `asset-${index}`,
            checksum: 'a'.repeat(64),
            sizeBytes: 123,
            moduleName: 'media',
            schemaName: 'media',
            originalFileName: 'image.png',
            mimeType: 'image/png',
            folderCode: 'cmsAssets',
            formatCode: 'original',
            name: 'Image',
            description: 'Image',
            businessPurpose: 'CONTENT',
            ownerType: 'CMS_COMPONENT',
            ownerReference: 'component',
        }));
        rows = assets.map((asset) => ({
            ...asset,
            code: asset.mediaCode,
            enterpriseCode: 'enterprise-a',
            active: true,
            status: 'READY',
            versionId: 7,
            checksumAlgorithm: 'sha256',
            storageKey: 'private-path',
        }));
        reads = [];
        global.SERVICE = {
            DefaultMediaLibraryService: library,
            DefaultMediaReadinessService: owner,
            DefaultSecuredRequestPipelineService: {
                getGrantedPermissions: () => [],
                isPermissionGranted: () => granted,
            },
            DefaultMediaStoragePolicyService: {
                validateDescriptor: () => true,
            },
            DefaultMediaService: {
                get: async (input) => {
                    reads.push(input);
                    return { code: 'SUC_FIND_00000', result: rows };
                },
            },
            DefaultMediaStorageProviderRegistryService: {
                read: () => {
                    throw new Error('Routine readiness must not read bytes');
                },
            },
        };
        global.FACADE = { DefaultMediaStorageFacade: facade };
        request = {
            tenant: 'tenant-a',
            authData: {
                tenant: 'tenant-a',
                entCode: 'enterprise-a',
                tokenType: 'access',
            },
            httpRequest: { body: { assets } },
            httpResponse: { setHeader: () => {} },
        };
    });
    it('returns 37 exact persisted matches through real layers with one fresh read and no locators', async function () {
        const result = await controller.readReadiness(request);
        assert.equal(reads.length, 1);
        assert.equal(reads[0].options.skipItemCache, true);
        assert.equal(reads[0].tenant, 'tenant-a');
        assert.deepEqual(
            reads[0].query.code.$in,
            assets.map((asset) => asset.mediaCode),
        );
        assert.equal(result.data.items.length, 37);
        assert(
            result.data.items.every(
                (item) =>
                    item.metadataMatched && item.storedBytesVerified === false,
            ),
        );
        assert.equal(result.data.evidenceKind, 'PERSISTED_CURRENT_METADATA');
        assert(!JSON.stringify(result).includes('private-path'));
        assert.equal(
            routes.readReadiness.permission,
            routes.inspectUpload.permission,
        );
        assert.equal(
            routes.readReadiness.apiExposure,
            routes.inspectUpload.apiExposure,
        );
        assert.deepEqual(routes.readReadiness.authTokenTypes, ['access']);
    });
    it('bypasses actual generated item-cache lookup and re-reads changed persisted metadata', async function () {
        const priorConfig = global.CONFIG;
        global.CONFIG = { get: () => ({ enabled: true }) };
        let providerReads = 0;
        SERVICE.DefaultCacheService = {
            get: () => {
                throw new Error('Stale item cache must not be consulted');
            },
        };
        SERVICE.DefaultMediaService.get = async (input) => {
            const prepared = inputWithModel(input);
            await new Promise((resolve, reject) => {
                getPipeline.lookupGuardedCache(
                    prepared,
                    {},
                    {
                        nextSuccess: resolve,
                        error: (_request, _response, error) => reject(error),
                    },
                );
            });
            const response = {};
            await new Promise((resolve, reject) => {
                getPipeline.executeQuery.call(
                    {
                        LOG: { debug: () => {} },
                        readItems: async () => {
                            providerReads += 1;
                            return { result: rows, count: rows.length };
                        },
                    },
                    prepared,
                    response,
                    {
                        nextSuccess: resolve,
                        error: (_request, _response, error) => reject(error),
                    },
                );
            });
            return response.success;
        };
        function inputWithModel(input) {
            return {
                ...input,
                schemaModel: { rawSchema: {}, cache: { enabled: true } },
            };
        }
        try {
            assert.equal(
                (await controller.readReadiness(request)).data.items[0]
                    .versionId,
                7,
            );
            rows[0].versionId = 8;
            assert.equal(
                (await controller.readReadiness(request)).data.items[0]
                    .versionId,
                8,
            );
            assert.equal(providerReads, 2);
        } finally {
            global.CONFIG = priorConfig;
        }
    });
    it('rejects negative generated acknowledgements even when their rows match', async function () {
        for (const envelope of [
            { code: 'ERR_FIND_00005' },
            { code: 'SUC_FIND_00000', success: false },
            { code: 'SUC_FIND_00000', error: { code: 'ERR_FIND_00005' } },
            { code: 'SUC_FIND_00000', errors: [] },
            { code: 'SUC_FIND_00000', errInfo: 'private cause' },
            {},
        ]) {
            SERVICE.DefaultMediaService.get = async () => ({
                ...envelope,
                result: rows,
            });
            await assert.rejects(controller.readReadiness(request), {
                code: 'ERR_MED_00023',
            });
        }
    });
    it('normalizes failed owner reads without exposing a provider error or private cause', async function () {
        SERVICE.DefaultMediaService.get = async () => {
            throw new Error('secret provider locator');
        };
        await assert.rejects(controller.readReadiness(request), (error) => {
            assert.equal(error.code, 'ERR_MED_00023');
            assert.equal(
                error.message,
                'Media readiness evidence is unavailable',
            );
            assert.equal(error.cause, undefined);
            return true;
        });
    });
    it('reports missing, changed and retired records without manufacturing CURRENT evidence', async function () {
        rows = rows.slice(1);
        rows[0].checksum = 'b'.repeat(64);
        rows[1].active = false;
        rows[2].versionId = null;
        const data = (await controller.readReadiness(request)).data;
        assert.equal(data.items[0].exists, false);
        assert(
            data.items
                .slice(0, 4)
                .every((item) => item.metadataMatched === false),
        );
    });
    it('re-reads after a version or grant change rather than caching earlier evidence', async function () {
        await controller.readReadiness(request);
        rows[0].versionId = 8;
        assert.equal(
            (await controller.readReadiness(request)).data.items[0].versionId,
            8,
        );
        granted = false;
        await assert.rejects(controller.readReadiness(request));
        assert.equal(reads.length, 2);
    });
    it('rejects other-enterprise rows, duplicate rows and malformed owner acknowledgements', async function () {
        rows[0].enterpriseCode = 'other';
        await assert.rejects(controller.readReadiness(request));
        rows[0].enterpriseCode = 'enterprise-a';
        rows[1] = rows[0];
        await assert.rejects(controller.readReadiness(request));
        SERVICE.DefaultMediaService.get = async () => ({ result: {} });
        await assert.rejects(controller.readReadiness(request));
    });
    it('rejects unsigned tenant changes, service tokens and non-CURRENT versioned storage before owner reads', async function () {
        request.tenant = 'other';
        await assert.rejects(controller.readReadiness(request));
        request.tenant = 'tenant-a';
        request.authData.tokenType = 'service';
        await assert.rejects(controller.readReadiness(request));
        request.authData.tokenType = 'access';
        model.rawSchema.versionedReadMode = 'ALL';
        await assert.rejects(controller.readReadiness(request));
        assert.equal(reads.length, 0);
    });
    it('bounds complete aggregate requests and rejects duplicate codes, query expressions and authority input', async function () {
        for (const input of [
            { assets: [] },
            { assets: Array(101).fill(assets[0]) },
            { assets: [assets[0], assets[0]] },
            { assets: [{ ...assets[0], providerCode: 'caller' }] },
            { assets: [{ ...assets[0], mediaCode: { $ne: '' } }] },
            { assets, tenant: 'other' },
        ]) {
            request.httpRequest.body = input;
            await assert.rejects(controller.readReadiness(request));
        }
        assert.equal(reads.length, 0);
    });
});

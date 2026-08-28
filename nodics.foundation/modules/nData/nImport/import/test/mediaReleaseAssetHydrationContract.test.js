/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/mediaReleaseAssetHydrationContract
 * @description Verifies module release media data stays declarative while
 * physical assets are stored and media storage fields are hydrated by nImport.
 * @layer test
 * @owner import
 * @override Media provider implementations may change storage mechanics while
 * preserving the authored `asset.sourceFile` import contract.
 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

class DataImportError extends Error {
    constructor(code, message) {
        if (code instanceof Error) {
            super(message || code.message);
            this.cause = code;
            this.code = code.code;
        } else if (typeof code === 'object') {
            super(code.message);
            Object.assign(this, code);
        } else {
            super(message || code);
            this.code = code;
        }
        this.name = 'DataImportError';
    }
}

global.CLASSES = { DataImportError };

const service = require('../src/service/media/defaultMediaReleaseAssetHydrationService');

function createReleaseAsset() {
    let workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-media-release-'));
    let releaseRoot = path.join(workspace, 'modules', 'cms', 'data', 'core-v001');
    let assetPath = path.join(releaseRoot, 'assets', 'cms', 'home-hero.txt');
    fs.mkdirSync(path.dirname(assetPath), { recursive: true });
    fs.writeFileSync(assetPath, 'hero image bytes');
    return { workspace, releaseRoot, assetPath };
}

async function validatesHydration() {
    let { workspace, releaseRoot, assetPath } = createReleaseAsset();
    let storedRequests = [];
    global.SERVICE = {
        DefaultMediaUploadService: {
            resolveChecksumAlgorithm: function () {
                return 'sha256';
            }
        },
        DefaultMediaStorageProviderRegistryService: {
            store: async function (request) {
                storedRequests.push(request);
                return {
                    providerCode: 'local',
                    folderCode: request.folderCode,
                    storageKey: 'media/content/default/default/media/2026/08/homeHero.txt',
                    relativePath: 'media/content/default/default/media/2026/08/homeHero.txt',
                    fileName: request.fileName,
                    originalFileName: request.originalFileName,
                    mimeType: request.mimeType,
                    extension: 'txt',
                    sizeBytes: request.buffer.length,
                    fullPath: '/server/temp/media/content/default/default/media/2026/08/homeHero.txt',
                    url: '/media/homeHero',
                    accessUrl: '/media/homeHero',
                    access: 'PUBLIC'
                };
            }
        }
    };

    let request = {
        tenant: 'default',
        authData: { userGroups: ['admin'] },
        header: {
            options: {
                moduleName: 'media',
                schemaName: 'media',
                assetBaseRoots: [releaseRoot]
            }
        },
        dataModel: {
            code: 'homeHero',
            name: 'Home hero',
            folderCode: 'cmsAssets',
            formatCode: 'original',
            businessPurpose: 'contentMedia',
            ownerType: 'CMS_COMPONENT',
            ownerReference: 'homeHeroComponent',
            asset: {
                sourceFile: 'assets/cms/home-hero.txt',
                checksum: crypto.createHash('sha256').update(fs.readFileSync(assetPath)).digest('hex')
            }
        }
    };

    let hydrated = await service.hydrateRequest(request);
    assert.strictEqual(storedRequests.length, 1);
    assert.strictEqual(storedRequests[0].mediaCode, 'homeHero');
    assert.strictEqual(storedRequests[0].folderCode, 'cmsAssets');
    assert.strictEqual(storedRequests[0].formatCode, 'original');
    assert.strictEqual(storedRequests[0].moduleName, 'media');
    assert.strictEqual(storedRequests[0].schemaName, 'media');
    assert(Buffer.isBuffer(storedRequests[0].buffer));
    assert.strictEqual(hydrated.asset, undefined);
    assert.strictEqual(hydrated.sourceFile, undefined);
    assert.strictEqual(hydrated.providerCode, 'local');
    assert.strictEqual(hydrated.storageKey, 'media/content/default/default/media/2026/08/homeHero.txt');
    assert.strictEqual(hydrated.status, 'READY');
    assert.strictEqual(hydrated.checksum, request.dataModel.checksum);
    fs.rmSync(workspace, { recursive: true, force: true });
}

async function rejectsUnsafeSourceFile() {
    let { workspace, releaseRoot } = createReleaseAsset();
    global.SERVICE = {
        DefaultMediaStorageProviderRegistryService: {
            store: async function () {
                throw new Error('must not store unsafe assets');
            }
        }
    };
    await assert.rejects(() => service.hydrateRequest({
        header: { options: { moduleName: 'media', schemaName: 'media', assetBaseRoots: [releaseRoot] } },
        dataModel: { code: 'unsafe', asset: { sourceFile: '../secret.txt' } }
    }), /sourceFile must stay inside the release folder/);
    fs.rmSync(workspace, { recursive: true, force: true });
}

async function rejectsAuthoredStorageFields() {
    let { workspace, releaseRoot } = createReleaseAsset();
    await assert.rejects(() => service.hydrateRequest({
        header: { options: { moduleName: 'media', schemaName: 'media', assetBaseRoots: [releaseRoot] } },
        dataModel: {
            code: 'badStorage',
            storageKey: 'developer/owned/path.png',
            asset: { sourceFile: 'assets/cms/home-hero.txt' }
        }
    }), /must not declare storage-owned field/);
    fs.rmSync(workspace, { recursive: true, force: true });
}

(async function run() {
    await validatesHydration();
    await rejectsUnsafeSourceFile();
    await rejectsAuthoredStorageFields();
    console.log('Media release asset hydration contract validated');
}()).catch(error => {
    console.error(error);
    process.exit(1);
});

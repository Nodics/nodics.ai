/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('assert');
const bundleService = require('../src/service/defaultLocalizationBundleService');
const releaseService = require('../../localizationCore/src/service/defaultLocalizationReleaseManagementService');
const apiConfig = require('../config/properties');
const coreConfig = require('../../localizationCore/config/properties');
const release = { tenant: 'tenant-a', scopeCode: 'site-a', channel: 'web', locale: 'en', namespaces: ['common'], version: 'release-1', entries: {
    'common:welcome': { message: 'Welcome', parameters: [], exposure: 'PUBLIC' },
    'common:operator': { message: 'Operator only', parameters: [], exposure: 'OPERATOR' },
    'other:hidden': { message: 'Other namespace', parameters: [], exposure: 'PUBLIC' }
} };
global.CONFIG = { get: key => key === 'localization' ? { authority: coreConfig.localization.authority, api: Object.assign({}, apiConfig.localization.api, { compressionThresholdBytes: 1 }) } : undefined };
release.checksum = releaseService.checksum(release.entries);
const repository = { getOnline: async (scope, request) => request.tenant === 'tenant-a' && scope === 'site-a' ? { version: 'release-1' } : undefined, getRelease: async (version, request) => version === 'release-1' && request.tenant === 'tenant-a' ? release : undefined };
global.SERVICE = { DefaultLocalizationReleaseManagementService: Object.assign({}, releaseService, { repository: () => repository }), DefaultLocalizationMessageValidationService: { validate: () => [] } };

(async () => {
    let request = { tenant: 'tenant-a', scopeCode: 'site-a', channel: 'web', locale: 'en', namespaces: ['common'] };
    let response = await bundleService.get(request);
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.bundle.entries['common.welcome'], 'Welcome');
    assert.strictEqual(response.bundle.entries['common.operator'], undefined, 'non-public values must never leak');
    assert.strictEqual(response.bundle.entries['other.hidden'], undefined, 'unrequested namespaces must never leak');
    let unchanged = await bundleService.get(Object.assign({}, request, { ifNoneMatch: response.etag }));
    assert.strictEqual(unchanged.statusCode, 304);
    let compressed = await bundleService.get(Object.assign({}, request, { acceptsGzip: true }));
    assert.strictEqual(compressed.contentEncoding, 'gzip');
    assert.strictEqual(typeof compressed.encodedBody, 'string');
    await assert.rejects(() => bundleService.get(Object.assign({}, request, { tenant: 'tenant-b' })), error => error.code === 'ERR_LAPI_00001');
    console.log('localizationRuntimeBundleContract.test.js passed');
})().catch(error => { console.error(error); process.exitCode = 1; });

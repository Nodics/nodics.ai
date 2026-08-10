/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const zlib = require('node:zlib');
const bundleService = require('../src/service/defaultLocalizationBundleService');
const releaseService = require('../../localizationCore/src/service/defaultLocalizationReleaseManagementService');
const validation = require('../../localizationCore/src/service/defaultLocalizationMessageValidationService');
const apiConfig = require('../config/properties');
const coreConfig = require('../../localizationCore/config/properties');

const releases = new Map();
const pointers = new Map();
function release(tenant, version, message) {
    let value = { tenant, scopeCode: 'site-a', channel: 'web', locale: 'ar', namespaces: ['common'], version, entries: {
        'common:welcome': { message, parameters: ['name'], exposure: 'PUBLIC', ownerModule: 'common' },
        'common:operator': { message: 'Operator secret', parameters: [], exposure: 'OPERATOR', ownerModule: 'common' },
        'common:internal': { message: 'Internal secret', parameters: [], exposure: 'INTERNAL', ownerModule: 'common' }
    } };
    value.checksum = releaseService.checksum(value.entries);
    releases.set(tenant + ':' + version, value);
    return value;
}
release('tenant-a', 'release-1', 'مرحبا {name}');
release('tenant-a', 'release-2', 'أهلا {name}');
release('tenant-b', 'release-b', 'معزول {name}');
pointers.set('tenant-a:site-a', 'release-2');
pointers.set('tenant-b:site-a', 'release-b');

global.CONFIG = { get: key => key === 'localization' ? {
    authority: coreConfig.localization.authority,
    api: Object.assign({}, apiConfig.localization.api, { compressionThresholdBytes: 1, maximumBundleKeys: 2, maximumNamespaces: 2 })
} : undefined };
const repository = {
    getOnline: async (scope, request) => ({ version: pointers.get(request.tenant + ':' + scope) }),
    getRelease: async (version, request) => releases.get(request.tenant + ':' + version)
};
global.SERVICE = {
    DefaultLocalizationReleaseManagementService: Object.assign({}, releaseService, { repository: () => repository }),
    DefaultLocalizationMessageValidationService: validation
};

(async () => {
    const request = { tenant: 'tenant-a', scopeCode: 'site-a', channel: 'web', locale: 'ar', namespaces: ['common'] };
    const response = await bundleService.get(request);
    assert.equal(response.bundle.entries['common.welcome'], 'أهلا {name}');
    assert.equal(response.bundle.entries['common.operator'], undefined, 'operator content must not cross the public boundary');
    assert.equal(response.bundle.entries['common.internal'], undefined, 'internal content must not cross the public boundary');
    assert.equal((await bundleService.get(Object.assign({}, request, { tenant: 'tenant-b' }))).bundle.entries['common.welcome'], 'معزول {name}', 'tenant pointers must remain isolated');
    assert.equal((await bundleService.get(Object.assign({}, request, { ifNoneMatch: response.etag }))).statusCode, 304, 'ETag revalidation must suppress unchanged bodies');
    const compressed = await bundleService.get(Object.assign({}, request, { acceptsGzip: true }));
    const decoded = JSON.parse(zlib.gunzipSync(Buffer.from(compressed.encodedBody, 'base64')).toString('utf8'));
    assert.equal(decoded.releaseVersion, 'release-2', 'compressed response must preserve release identity');

    pointers.set('tenant-a:site-a', 'release-1');
    assert.equal((await bundleService.get(request)).bundle.releaseVersion, 'release-1', 'rollback must immediately resolve the restored immutable pointer');
    pointers.set('tenant-a:site-a', 'release-2');

    const corrupt = releases.get('tenant-a:release-2');
    corrupt.entries['common:welcome'].message = 'tampered';
    await assert.rejects(() => bundleService.get(request), error => error.code === 'ERR_LOC_00004', 'checksum tampering must fail closed');
    corrupt.entries['common:welcome'].message = 'أهلا {name}';

    assert.throws(() => bundleService.validateRequest(Object.assign({}, request, { namespaces: ['common', 'auth', 'docs'] })), error => error.code === 'ERR_LAPI_00000');
    assert.throws(() => bundleService.validateRequest(Object.assign({}, request, { namespaces: ['common', '../internal'] })), error => error.code === 'ERR_LAPI_00000');
    assert.throws(() => validation.validate('<img src=x onerror=alert(1)> {name}', []), error => error.code === 'ERR_LOC_00001', 'undeclared interpolation must fail');
    assert.deepEqual(validation.validate('<script>alert(1)</script>', []), [], 'messages remain inert strings and are never executed by the backend');
    console.log('localizationQualificationContract.test.js passed');
})().catch(error => { console.error(error); process.exitCode = 1; });

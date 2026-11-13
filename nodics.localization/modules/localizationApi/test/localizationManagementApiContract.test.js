/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const routers = require('../src/router/routers').localizationApi.localization;
const controller = require('../src/controller/defaultLocalizationApiController');

['coverage', 'queue', 'sideBySide', 'releases', 'memory', 'analytics', 'saveDraft', 'submitReview', 'approve', 'suggest', 'buildRelease', 'publishRelease', 'rollbackRelease'].forEach(name => {
    assert.equal(routers[name].secured, true);
    assert(routers[name].permission.startsWith('localization.'));
});
assert.equal(routers.runtimeBundle.secured, false);

let received;
global.FACADE = { DefaultLocalizationApiFacade: { coverage: request => { received = request; return { ok: true }; } } };
(async () => {
    const trustedAuth = { loginId: 'editor' };
    let request = { tenant: 'trusted', authData: trustedAuth, httpRequest: { body: { tenant: 'attacker', authData: { loginId: 'forged' }, namespaces: ['common'], locales: ['en'] } } };
    const response = await controller.coverage(request);
    assert.deepEqual(response, { code: 'SUC_LAPI_00002', result: { ok: true } });
    assert.strictEqual(received.authData, trustedAuth);
    assert.equal(received.tenant, 'trusted');
    assert.deepEqual(received.namespaces, ['common']);
    FACADE.DefaultLocalizationApiFacade.memory = input => {
        assert.equal(input.tenant, 'trusted');
        assert.equal(input.scopeCode, undefined);
        assert.deepEqual(input.locales, ['ar']);
        return { enabled: true, entries: [] };
    };
    assert.equal(routers.releases.permission, 'localization.release.build');
    assert.equal(routers.memory.permission, 'localization.operations.read');
    assert.equal((await controller.memory({ tenant: 'trusted', authData: trustedAuth,
        httpRequest: { body: { tenant: 'foreign', scopeCode: 'foreign', locales: ['ar'] } } })).result.enabled, true);
    const headers = new Map();
    FACADE.DefaultLocalizationApiFacade.getRuntimeBundle = input => {
        assert.equal(input.tenant, 'trusted');
        assert.equal(input.channel, 'web');
        assert.equal(input.acceptsGzip, false);
        assert.deepEqual(input.namespaces, ['common']);
        return input.ifNoneMatch ? { notModified: true, etag: '"fixture"' } :
            { bundle: { locale: 'ar', entries: { 'common.action.save': 'حفظ' } }, etag: '"fixture"' };
    };
    const httpRequest = { params: { locale: 'ar' }, query: { channel: { invalid: true }, namespaces: 'common' },
        headers: {}, res: { set: (name, value) => headers.set(name, value) } };
    const publicResult = await controller.getRuntimeBundle({ tenant: 'trusted', httpRequest });
    assert.equal(publicResult.code, 'SUC_LAPI_00000');
    assert.equal(publicResult.result.bundle.entries['common.action.save'], 'حفظ');
    assert.equal(headers.get('ETag'), '"fixture"');
    httpRequest.headers['if-none-match'] = '"fixture"';
    assert.deepEqual(await controller.getRuntimeBundle({ tenant: 'trusted', httpRequest }), { code: 'SUC_LAPI_00001' });
    console.log('localizationManagementApiContract.test.js passed');
})().catch(error => { console.error(error); process.exitCode = 1; });

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

['coverage', 'queue', 'sideBySide', 'analytics', 'saveDraft', 'submitReview', 'approve', 'suggest', 'buildRelease', 'publishRelease', 'rollbackRelease'].forEach(name => {
    assert.equal(routers[name].secured, true);
    assert(routers[name].permission.startsWith('localization.'));
});
assert.equal(routers.runtimeBundle.secured, false);

let received;
global.FACADE = { DefaultLocalizationApiFacade: { coverage: request => { received = request; return { ok: true }; } } };
(async () => {
    let request = { tenant: 'trusted', httpRequest: { body: { tenant: 'attacker', namespaces: ['common'], locales: ['en'] } } };
    await controller.coverage(request);
    assert.equal(received.tenant, 'trusted');
    assert.deepEqual(received.namespaces, ['common']);
    console.log('localizationManagementApiContract.test.js passed');
})().catch(error => { console.error(error); process.exitCode = 1; });

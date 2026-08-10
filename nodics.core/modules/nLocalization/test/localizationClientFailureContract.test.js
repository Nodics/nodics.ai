/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

global.CONFIG = { get: () => ({ client: {
    providerService: 'DefaultLocalizationAuthorityProviderService', allowLocalContextFallback: true
} }) };
global.SERVICE = {
    DefaultLocalizationContextService: { create: (request, policy) => ({ request, policy, local: true }) }
};

const client = require('../src/service/defaultLocalizationClientService');

(async () => {
    const local = await client.resolveContext({ tenant: 'a', policy: { defaultLocale: 'en' } });
    assert.strictEqual(local.local, true);
    await assert.rejects(() => client.getRuntimeBundle({}), error => error.code === 'ERR_L10N_00002');

    global.SERVICE.DefaultLocalizationAuthorityProviderService = {
        resolveContext: async request => ({ request, provider: true }),
        getRuntimeBundle: async request => ({ request, bundle: true })
    };
    assert.strictEqual((await client.resolveContext({ tenant: 'a' })).provider, true);
    assert.strictEqual((await client.getRuntimeBundle({ locale: 'en' })).bundle, true);
    console.log('localizationClientFailureContract.test.js passed');
})().catch(error => { console.error(error); process.exitCode = 1; });

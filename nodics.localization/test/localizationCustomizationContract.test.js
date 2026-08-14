/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

global.CONFIG = { get: () => ({ client: {
    providerService: 'CustomerLocalizationAuthorityProviderService', allowLocalContextFallback: false
} }) };
global.SERVICE = {
    CustomerLocalizationAuthorityProviderService: {
        resolveContext: async request => ({ locale: request.requestedLocale, customerProvider: true }),
        getRuntimeBundle: async request => ({ namespace: request.namespace, customerProvider: true })
    }
};

const client = require('../../nodics.foundation/modules/nLocalization/src/service/defaultLocalizationClientService');

(async () => {
    assert.strictEqual((await client.resolveContext({ requestedLocale: 'de' })).customerProvider, true);
    assert.strictEqual((await client.getRuntimeBundle({ namespace: 'checkout' })).customerProvider, true);
    console.log('localizationCustomizationContract.test.js passed');
})().catch(error => { console.error(error); process.exitCode = 1; });

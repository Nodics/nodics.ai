/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

global.CONFIG = { get: () => ({
    context: { rtlScripts: ['Arab', 'Hebr'] },
    limits: { maximumLocaleLength: 64, maximumFallbackLocales: 16, maximumScopePartLength: 128 }
}) };

const service = require('../src/service/defaultLocaleCanonicalizationService');

assert.strictEqual(service.canonicalize(' ar_ae '), 'ar-AE');
assert.strictEqual(service.canonicalize('EN-gb'), 'en-GB');
assert.deepStrictEqual(service.canonicalizeList(['en', 'en', 'ar_AE']), ['en', 'ar-AE']);

const resolution = service.resolve('ar-AE', {
    supportedLocales: ['en', 'ar'],
    defaultLocale: 'en',
    fallbackLocales: ['en']
});
assert.strictEqual(resolution.requestedLocale, 'ar-AE');
assert.strictEqual(resolution.resolvedLocale, 'ar');
assert.deepStrictEqual(resolution.fallbackLocales, ['en']);
assert.strictEqual(service.describe('ar-AE').direction, 'rtl');
assert.strictEqual(service.describe('en-GB').direction, 'ltr');
assert.throws(() => service.canonicalize('default'), error => error.code === 'ERR_L10N_00000');
assert.throws(() => service.canonicalize('not a locale'), error => error.code === 'ERR_L10N_00000');
assert.strictEqual(service.resolve('fr', {
    supportedLocales: ['en'], defaultLocale: 'en', fallbackLocales: []
}).resolvedLocale, 'en');

console.log('localeCanonicalizationContract.test.js passed');

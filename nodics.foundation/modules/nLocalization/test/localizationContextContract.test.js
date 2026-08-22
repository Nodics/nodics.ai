/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

global.CONFIG = { get: () => ({
    context: { contractVersion: 0, defaultChannel: 'web', rtlScripts: ['Arab', 'Hebr'] },
    limits: { maximumLocaleLength: 64, maximumFallbackLocales: 16, maximumScopePartLength: 128 }
}) };
global.ENUMS = { LOCALIZATION_CONTEXT_SOURCES: ['SITE_POLICY', 'PLATFORM_DEFAULT'] };
global.SERVICE = {
    DefaultLocaleCanonicalizationService: require('../src/service/defaultLocaleCanonicalizationService')
};

const contextService = require('../src/service/defaultLocalizationContextService');
const scopeService = require('../src/service/defaultLocalizationScopeService');
const context = contextService.create({
    tenant: 'tenant-a', site: 'store-a', requestedLocale: 'ar_AE', source: 'SITE_POLICY'
}, {
    supportedLocales: ['en', 'ar'], defaultLocale: 'en', fallbackLocales: ['en'], version: '0'
});

assert.strictEqual(context.contractVersion, 1);
assert.strictEqual(context.resolvedLocale, 'ar');
assert.strictEqual(context.direction, 'rtl');
assert.strictEqual(context.channel, 'web');
assert(Object.isFrozen(context));
assert(Object.isFrozen(context.fallbackLocales));
assert.throws(() => contextService.create({}, { supportedLocales: ['en'], defaultLocale: 'en' }),
    error => error.code === 'ERR_L10N_00003');
assert.throws(() => contextService.create({ tenant: 'a', source: 'REQUEST_PARAMETER' }, {
    supportedLocales: ['en'], defaultLocale: 'en'
}), error => error.code === 'ERR_L10N_00003');

assert.strictEqual(scopeService.bundleKey({
    tenant: 'tenant-a', scopeCode: 'store-a', channel: 'web', locale: 'en',
    namespaces: ['validation', 'common'], releaseVersion: '0.0.0'
}), 'tenant-a|store-a|web|en|common,validation|12');
assert.throws(() => scopeService.bundleKey({
    tenant: 'tenant|a', channel: 'web', locale: 'en', namespaces: ['common'], releaseVersion: '0.0.0'
}), error => error.code === 'ERR_L10N_00004');

console.log('localizationContextContract.test.js passed');

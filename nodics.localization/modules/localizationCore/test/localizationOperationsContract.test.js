/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const config = require('../config/properties').localization;
const operations = require('../src/service/defaultLocalizationOperationsService');
const overrides = require('../src/service/defaultLocalizationOverridePolicyService');
const machine = require('../src/service/defaultLocalizationMachineTranslationService');

global.CONFIG = { get: key => key === 'localization' ? config : undefined };
const keys = [
    { namespace: 'common', key: 'welcome', defaultMessage: 'Welcome', parameters: [], exposure: 'PUBLIC', ownerModule: 'common', protected: false },
    { namespace: 'auth', key: 'failure', defaultMessage: 'Sign-in failed', parameters: [], exposure: 'PUBLIC', ownerModule: 'profile', protected: true, overrideScopes: ['STANDARD'] }
];
const values = [
    { namespace: 'common', key: 'welcome', locale: 'en', message: 'Welcome', state: 'APPROVED', revision: 3, scopeType: 'STANDARD', auditTrail: [{ toState: 'APPROVED', actor: 'reviewer' }] },
    { namespace: 'common', key: 'welcome', locale: 'ar', message: 'مرحبا', state: 'REVIEW', revision: 2, scopeType: 'TENANT', scopeCode: 'tenant-a', auditTrail: [{ toState: 'DRAFT', actor: 'translator' }, { toState: 'REVIEW', actor: 'translator' }] }
];
const repository = {
    listKeys: async request => keys.filter(key => request.namespaces.includes(key.namespace)),
    listValues: async request => values.filter(value => value.locale === request.locale && request.namespaces.includes(value.namespace))
};
global.SERVICE = {
    DefaultLocalizationReleaseManagementService: { repository: () => repository },
    DefaultLocalizationTranslationMemoryPortService: { find: async () => ({ targetMessage: 'Memory translation' }) },
    DefaultLocalizationMessageValidationService: { validate: () => [] }
};

(async () => {
    let request = { tenant: 'tenant-a', namespaces: ['common', 'auth'], locales: ['en', 'ar'], fallbackLocales: ['en'] };
    let coverage = await operations.coverage(request);
    assert.deepEqual(coverage.locales.map(item => [item.locale, item.approved, item.review, item.fallback, item.missing]), [
        ['en', 1, 0, 0, 1], ['ar', 0, 1, 1, 1]
    ]);
    assert.equal(coverage.telemetry.fallback, 1);
    let queue = await operations.queue(request);
    assert(queue.some(item => item.key === 'failure' && item.state === 'MISSING'));
    assert.equal((await operations.sideBySide(request))[0].values.ar.state, 'REVIEW');
    assert.deepEqual((await operations.analytics(request)).transitionCounts, { APPROVED: 1, DRAFT: 1, REVIEW: 1 });

    assert.throws(() => overrides.validate({ tenant: 'tenant-a', scopeType: 'TENANT' }, keys[1]), error => error.code === 'ERR_LOC_00002' || error.code === 'ERR_LOC_00006');
    assert.deepEqual(overrides.validate({ tenant: 'tenant-a', scopeType: 'TENANT', authData: { groups: ['localizationProtectedAdminUserGroup'] } },
        Object.assign({}, keys[1], { overrideScopes: ['STANDARD', 'TENANT'] })), { scopeType: 'TENANT', scopeCode: 'tenant-a' });

    let suggestion = await machine.suggest({ tenant: 'tenant-a', sourceLocale: 'en', targetLocale: 'ar', sourceMessage: 'Welcome' });
    assert.equal(suggestion.source, 'MEMORY');
    assert.equal(suggestion.publishable, false);
    console.log('localizationOperationsContract.test.js passed');
})().catch(error => { console.error(error); process.exitCode = 1; });

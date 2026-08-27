/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('assert');
const config = require('../config/properties');
const validation = require('../src/service/defaultLocalizationMessageValidationService');
const contribution = require('../src/service/defaultLocalizationContributionService');
const releaseService = require('../src/service/defaultLocalizationReleaseManagementService');
const versionProvider = require('../src/service/defaultLocalizationPublicationVersionProviderService');
const valueLifecycle = require('../src/service/defaultLocalizationValueLifecycleService');
const overridePolicy = require('../src/service/defaultLocalizationOverridePolicyService');

global.CONFIG = { get: key => key === 'localization' ? config.localization : undefined };
const releases = new Map();
const online = new Map();
const keys = [];
const values = [];
const repository = {
    upsertKeys: async entries => { keys.splice(0, keys.length, ...entries); return entries; },
    listKeys: async request => keys.filter(key => request.namespaces.includes(key.namespace)),
    listValues: async request => values.filter(value => value.tenant === request.tenant && value.locale === request.locale),
    listApprovedValues: async request => values.filter(value => value.tenant === request.tenant && value.locale === request.locale && value.state === 'APPROVED'),
    getKey: async (namespace, key) => keys.find(item => item.namespace === namespace && item.key === key),
    getValue: async (namespace, key, locale, request) => values.find(item => item.tenant === request.tenant && item.namespace === namespace && item.key === key && item.locale === locale),
    saveValue: async value => { let index = values.findIndex(item => item.tenant === value.tenant && item.namespace === value.namespace && item.key === value.key && item.locale === value.locale); if (index >= 0) values[index] = value; else values.push(value); return value; },
    transitionValue: async (current, state, revision) => { current.state = state; current.revision = revision; return current; },
    createRelease: async release => { releases.set(release.version, release); return release; },
    getRelease: async (version, request) => { let release = releases.get(version); return release && release.tenant === request.tenant ? release : undefined; },
    getOnline: async (scope, request) => online.get(request.tenant + ':' + scope),
    activateRelease: async (release, publication, request) => { let identity = request.tenant + ':' + publication.rootCode; let previous = online.get(identity); let pointer = { version: release.version, previous: previous && previous.version }; online.set(identity, pointer); return pointer; },
    rollbackRelease: async (scope, target, publication, request) => { let pointer = { version: target }; online.set(request.tenant + ':' + scope, pointer); return pointer; }
};
global.SERVICE = { DefaultLocalizationMessageValidationService: validation, DefaultLocalizationContributionService: contribution, DefaultLocalizationReleaseManagementService: releaseService, DefaultLocalizationRepositoryService: repository, DefaultLocalizationOverridePolicyService: overridePolicy, DefaultLocalizationTranslationMemoryPortService: { record: async () => true } };

(async () => {
    assert.deepStrictEqual(validation.validate('Hello {name}', ['name']), ['name']);
    assert.throws(() => validation.validate('{count, plural, one {One}}', ['count']), error => error.code === 'ERR_LOC_00001');
    let imported = await require('../src/service/defaultLocalizationImportExportService').importContribution({ formatVersion: 1, ownerModule: 'pilot', entries: [
        { namespace: 'common', key: 'welcome', defaultMessage: 'Welcome {name}', parameters: ['name'], exposure: 'PUBLIC' },
        { namespace: 'common', key: 'internal.failure', defaultMessage: 'Internal failure', parameters: [], exposure: 'INTERNAL' }
    ] }, { tenant: 'tenant-a' });
    assert.strictEqual(imported.length, 2);
    assert.throws(() => contribution.validate({ formatVersion: 1, ownerModule: 'pilot', entries: [
        { namespace: 'common', key: 'same', defaultMessage: 'A', parameters: [], exposure: 'PUBLIC' },
        { namespace: 'common', key: 'same', defaultMessage: 'B', parameters: [], exposure: 'PUBLIC' }
    ] }), error => error.code === 'ERR_LOC_00004');
    let draft = await valueLifecycle.saveDraft({ tenant: 'tenant-a', locale: 'en', namespace: 'common', key: 'welcome', message: 'Welcome {name}', expectedRevision: 0, authData: { principalId: 'translator' } });
    assert.strictEqual(draft.state, 'DRAFT');
    let review = await valueLifecycle.submitReview({ tenant: 'tenant-a', locale: 'en', namespace: 'common', key: 'welcome', expectedRevision: 1, authData: { principalId: 'translator' } });
    let approved = await valueLifecycle.approve({ tenant: 'tenant-a', locale: 'en', namespace: 'common', key: 'welcome', expectedRevision: review.revision, authData: { principalId: 'reviewer' } });
    assert.strictEqual(approved.state, 'APPROVED');
    await valueLifecycle.saveDraft({ tenant: 'tenant-a', locale: 'en', namespace: 'common', key: 'internal.failure', message: 'Internal failure', expectedRevision: 0 });
    await valueLifecycle.submitReview({ tenant: 'tenant-a', locale: 'en', namespace: 'common', key: 'internal.failure', expectedRevision: 1 });
    await valueLifecycle.approve({ tenant: 'tenant-a', locale: 'en', namespace: 'common', key: 'internal.failure', expectedRevision: 2 });
    await assert.rejects(() => valueLifecycle.saveDraft({ tenant: 'tenant-a', locale: 'en', namespace: 'common', key: 'welcome', message: 'Hi {name}', expectedRevision: 1 }), error => error.code === 'ERR_LOC_00004');
    let request = { tenant: 'tenant-a', scopeCode: 'site-a', channel: 'web', locale: 'en', defaultLocale: 'en', namespaces: ['common'], authData: { principalId: 'editor-a' } };
    let release = await releaseService.build(request);
    assert.strictEqual(releaseService.validate(release).valid, true);
    assert.strictEqual(await repository.getRelease(release.version, { tenant: 'tenant-b' }), undefined, 'release lookup must remain tenant-isolated');
    await versionProvider.activate({ sourceVersion: release.version, rootCode: 'site-a' }, request);
    let second = Object.assign({}, release, { version: 'second', checksum: release.checksum }); releases.set('second', second);
    await versionProvider.activate({ sourceVersion: 'second', rootCode: 'site-a' }, request);
    await versionProvider.rollback({ rootCode: 'site-a' }, release.version, request);
    assert.strictEqual((await repository.getOnline('site-a', request)).version, release.version);
    let corrupt = Object.assign({}, release, { entries: Object.assign({}, release.entries, { 'common:tampered': { message: 'x', parameters: [], exposure: 'PUBLIC' } }) });
    assert.throws(() => releaseService.validate(corrupt), error => error.code === 'ERR_LOC_00004');
    console.log('localizationRegistryReleaseContract.test.js passed');
})().catch(error => { console.error(error); process.exitCode = 1; });

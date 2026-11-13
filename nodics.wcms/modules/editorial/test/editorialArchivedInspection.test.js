'use strict';
/**
 * @module editorial/test/editorialArchivedInspection
 * @description Qualifies scoped, bounded retained-history reads independently of current content-type readiness without granting editing or workflow authority.
 * @layer test
 * @owner editorial
 * @override Extend saved-history fixtures while retaining original employee scope, exact revision and no-write assertions.
 */
const assert = require('node:assert/strict');
const { test, afterEach } = require('node:test');
const service = require('../src/service/defaultEditorialDraftCommandService');
const authoring = require('../src/service/defaultEditorialArticleAuthoringService');
const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
afterEach(() => Object.assign(global, previous));
function fixture() {
    const article = { code: 'history', contentTypeCode: 'RETIRED_TYPE', status: 'ARCHIVED', revision: 2, lastAuthoringCommand: { private: true } };
    const locals = [{ code: 'history-en', articleCode: 'history', revision: 2, localeCode: 'en', title: 'Saved title', body: { blocks: [{ text: 'Saved body' }] } }];
    const request = { tenant: 'tenant-a', editorial: { articleCode: 'history', locale: 'en' }, authorization: 'Bearer original-actor', authData: { tenant: 'tenant-a', enterpriseCode: 'acme', principalId: 'employee-a', principalType: 'human', tokenType: 'access', type: 'Employee', userGroups: ['employeeUserGroup'], permissions: ['editorial.backoffice.read', 'editorial.backoffice.manage'] } };
    const settings = { publication: { runtimeRole: 'STAGED', maximumDependencies: 2 }, delivery: { supportedLocales: ['en', 'ar'] }, authoring: { presentation: { en: {} } } };
    const reads = [], writes = [];
    const scoped = (kind, r) => { assert.equal(r.tenant, request.tenant); assert.equal(r.authData, request.authData); assert.equal(r.options.recursive, false); reads.push({ kind, query: r.query }); };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
    global.CONFIG = { get: () => settings };
    global.SERVICE = {
        ...require('./helpers/editorialOwnerServices.js'),
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: r => r.authData.permissions, getEffectiveUserGroupCodes: groups => groups, isPermissionGranted: (permission, permissions) => permissions.includes(permission) },
        DefaultEditorialArticleService: { get: async r => { scoped('article', r); return { code: 'SUC_FIND_00000', result: [structuredClone(article)] }; }, update: async r => writes.push(r) },
        DefaultEditorialArticleLocalizationService: { get: async r => { scoped('localizations', r); return { code: 'SUC_FIND_00000', result: structuredClone(locals) }; }, save: async r => writes.push(r) },
        DefaultEditorialContentTypeService: { get: async () => { throw new Error('Archived history must not require current policy'); } },
        DefaultEditorialArticleAuthoringService: authoring,
        DefaultEditorialOnlineProjectionService: { getDeployment: async () => ({ status: 'NONE' }) },
    };
    return { article, locals, request, settings, reads, writes };
}
test('retained archived copy remains readable with no current policy, without exposing commands or readiness authority', async () => {
    const f = fixture();
    const result = await service.workspace(f.request);
    assert.equal(result.article.status, 'ARCHIVED');
    assert.equal(result.article.lastAuthoringCommand, undefined);
    assert.equal(result.localizations[0].title, 'Saved title');
    assert.deepEqual(result.requiredLocaleCodes, []);
    assert.deepEqual(result.operations, ['INSPECT']);
    assert.deepEqual(f.reads.map(r => r.kind), ['article', 'localizations', 'article']);
    assert.deepEqual(f.reads[1].query, { articleCode: 'history', revision: 2 });
    assert.deepEqual(f.writes, []);
});
test('read-only employees can inquire without receiving management operations', async () => {
    const f = fixture(); f.request.authData.permissions = ['editorial.backoffice.read'];
    const result = await service.workspace(f.request);
    assert.equal(result.article.status, 'ARCHIVED'); assert.deepEqual(result.operations, []); assert.deepEqual(f.writes, []);
});
for (const kind of ['denied', 'foreign-revision', 'foreign-article', 'duplicate', 'overflow']) {
    test(`${kind} localization evidence fails closed rather than returning partial history`, async () => {
        const f = fixture();
        if (kind === 'denied') global.SERVICE.DefaultEditorialArticleLocalizationService.get = async () => ({ code: 'ERR_AUTH_00003', result: f.locals });
        if (kind === 'foreign-revision') f.locals[0].revision = 1;
        if (kind === 'foreign-article') f.locals[0].articleCode = 'another';
        if (kind === 'duplicate') f.locals.push({ ...f.locals[0] });
        if (kind === 'overflow') f.locals.push({ ...f.locals[0], localeCode: 'ar' }, { ...f.locals[0], localeCode: 'fr' });
        await assert.rejects(service.workspace(f.request), { code: 'ERR_EDT_00008' }); assert.deepEqual(f.writes, []);
    });
}
test('foreign scope and absent read permission fail before reading any saved copy', async () => {
    const f = fixture(); f.request.authData.tenant = 'another';
    await assert.rejects(service.workspace(f.request), { code: 'ERR_AUTH_00003' });
    f.request.authData.tenant = 'tenant-a'; f.request.authData.permissions = [];
    await assert.rejects(service.workspace(f.request), { code: 'ERR_AUTH_00003' });
    assert.deepEqual(f.reads, []); assert.deepEqual(f.writes, []);
});
test('a root changed during inspection cannot be presented as the original archived revision', async () => {
    const f = fixture();
    global.SERVICE.DefaultEditorialArticleLocalizationService.get = async () => { f.article.revision = 3; return { code: 'SUC_FIND_00000', result: f.locals }; };
    await assert.rejects(service.workspace(f.request), { code: 'ERR_EDT_00008' }); assert.deepEqual(f.writes, []);
});
test('caller history flags and forged archived status do not relax policy for a working article', async () => {
    const f = fixture(); f.article.status = 'READY';
    f.request.editorial = { articleCode: 'history', article: { code: 'history', revision: 2, status: 'ARCHIVED' }, history: true, policy: { active: true } };
    global.SERVICE.DefaultEditorialContentTypeService.get = async () => ({ code: 'SUC_FIND_00000', result: [{ code: 'RETIRED_TYPE', active: false }] });
    await assert.rejects(service.workspace(f.request), { code: 'ERR_EDT_00002' }); assert.deepEqual(f.writes, []);
});

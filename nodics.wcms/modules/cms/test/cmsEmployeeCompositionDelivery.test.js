/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/**
 * @module cms/test/cmsEmployeeCompositionDelivery
 * @description Tests private published composition reads without changing employee or ordinary content scope.
 * @layer test
 * @owner cms
 */
const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const definition = require('../src/service/delivery/defaultCmsDeliveryService');
const security = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
const authSecurity = require('../../../../nodics.foundation/modules/nAuth/src/service/security/defaultAuthSecurityService');
const properties = require('../config/properties');
const axis = require('../../../../nodics.platform/modules/axis/config/properties');
const composerDefinition = require('../src/service/publication/defaultCmsPublicationManifestOrchestrationService');
let cms, request, service, reads, pointer, manifest, system, authorityTenant;

/** Builds the canonical nAuth access claims; Profile's issuance-only type is not a JWT claim. */
function buildAccessPayload(overrides = {}) {
    return authSecurity.buildPayload({ type: 'Employee', principalType: 'human', loginId: 'employee',
        tenant: 'employee-tenant', entCode: 'employee-enterprise', permissions: ['cms.delivery.authenticated.read'],
        ...overrides });
}

beforeEach(() => {
    authorityTenant = 'project-authority';
    cms = { ...properties.cms, publication: { enabled: true, runtimeRole: 'ONLINE',
        baselines: structuredClone(axis.cms.publication.baselines) } };
    request = { tenant: 'employee-tenant', entCode: 'employee-enterprise', authToken: 'employee-session-cache-identity',
        router: { secured: true }, delivery: { site: 'axisCmsSite', path: '/dashboard', locale: 'en', channel: 'web' } };
    pointer = { ...request.delivery, accessMode: 'AUTHENTICATED', active: true, manifestCode: 'pinned-manifest' };
    manifest = { code: 'pinned-manifest', active: true, snapshot: { contractVersion: 0,
        ...request.delivery, accessMode: 'AUTHENTICATED', page: { code: 'dashboard', components: [] } } };
    system = Object.freeze({ isSystem: true, userGroups: ['systemUserGroup'], permissions: [] });
    reads = [];
    global.CONFIG = { get: key => key === 'cms' ? cms : key === 'defaultTenant' ? authorityTenant : undefined };
    request.authData = buildAccessPayload();
    global.CLASSES = { NodicsError: class extends Error {
        constructor(code, message) { super(message); this.code = code; }
    } };
    global.SERVICE = {
        DefaultSecuredRequestPipelineService: Object.assign({}, security),
        DefaultIdentityGovernanceService: { getSystemAuthData: () => system },
        DefaultCmsOnlinePublicationPointerService: { get: async input => {
            reads.push({ kind: 'pointer', input }); return { result: pointer ? [pointer] : [] };
        } },
        DefaultCmsPublicationManifestService: { get: async input => {
            reads.push({ kind: 'manifest', input }); return { result: manifest ? [manifest] : [] };
        } },
        DefaultMediaService: { get: () => assert.fail('composition must not read Media') },
        DefaultCmsPageService: { get: () => assert.fail('composition must not read authoring records') },
    };
    service = Object.assign({}, definition);
});

test('canonical nAuth employee access payload needs no issuance-only Employee type claim', async () => {
    assert.equal(Object.hasOwn(request.authData, 'type'), false);
    assert.equal(request.authData.tokenType, 'access');
    assert.equal(request.authData.principalType, 'human');
    assert.equal((await service.resolvePage(request)).result.page.code, 'dashboard');
    assert.equal(reads.length, 2);
});

for (const path of ['/dashboard', '/lock-screen']) {
    test(`shared ${path} reads only project pointer and pinned snapshot with employee context intact`, async () => {
        request.delivery.path = pointer.path = manifest.snapshot.path = path;
        const before = structuredClone(request);
        const result = await service.resolvePage(request);
        assert.equal(result.result.page.code, 'dashboard');
        assert.deepEqual(request, before);
        assert.deepEqual(reads.map(read => read.kind), ['pointer', 'manifest']);
        for (const { input } of reads) {
            assert.equal(input.tenant, authorityTenant);
            assert.equal(input.authData, system);
            assert.deepEqual(input.options, { recursive: false });
            assert.deepEqual(input.searchOptions, { pageSize: 2, pageNumber: 1 });
        }
        assert.deepEqual(reads[0].input.query, { ...request.delivery, accessMode: 'AUTHENTICATED', active: true });
        assert.deepEqual(reads[1].input.query, { code: 'pinned-manifest', active: true });
    });
}

test('configured baseline path override and compact Site manifests use the same authority', async () => {
    cms.publication.baselines.axis.employeeCompositionPaths = ['/workspace'];
    request.delivery.path = pointer.path = manifest.snapshot.path = '/workspace';
    const route = manifest.snapshot;
    route.page.components = [{ componentRef: 'shell' }];
    manifest.snapshot = { contractVersion: 2, bundleType: 'SITE', site: 'axisCmsSite', routes: [route],
        sharedComponents: { shell: { code: 'shell', renderer: 'shell', components: [] } } };
    assert.equal((await service.resolvePage(request)).result.page.components[0].code, 'shell');
});

test('real immutable publication composer Site bundle and route snapshots retain exact delivery scope', async () => {
    const models = {
        'cmsSite:axisCmsSite': { code: 'axisCmsSite', versionId: 1 },
        'cmsPageRoute:dashboard': { code: 'dashboard', ...request.delivery, accessMode: 'AUTHENTICATED', page: 'dashboard', versionId: 1 },
        'cmsPage:dashboard': { code: 'dashboard', renderer: 'page.standard', rendererContractVersion: 1, versionId: 1 },
        'cmsComponentDetail:dashboard-shell': { code: 'dashboard-shell', source: 'dashboard', target: 'shell', versionId: 1 },
        'cmsComponent:shell': { code: 'shell', renderer: 'workspace.shell', properties: { title: 'Project dashboard' }, versionId: 1 },
    };
    const dependencies = Object.keys(models).map(key => {
        const [schema, code] = key.split(':');
        return { schema, code, version: 1 };
    });
    const composer = Object.assign({}, composerDefinition, { load: async identity => {
        const model = models[identity.schema + ':' + identity.code];
        assert.equal(model.versionId, identity.version);
        return model;
    } });
    const bundle = await composer.buildSnapshot({ rootType: 'site', rootCode: 'axisCmsSite', dependencies }, request);
    assert.equal(bundle.contractVersion, 2);
    assert.equal(bundle.routes[0].contractVersion, 0);
    assert(bundle.routes[0].page.components[0].componentRef);
    const original = structuredClone(bundle);
    manifest.snapshot = bundle;
    const result = (await service.resolvePage(request)).result;
    assert.equal(result.contractVersion, 0);
    for (const field of ['site', 'path', 'locale', 'channel']) assert.equal(result[field], request.delivery[field]);
    assert.equal(result.accessMode, 'AUTHENTICATED');
    assert.equal(result.page.components[0].properties.title, 'Project dashboard');
    assert.deepEqual(bundle, original, 'delivery must not mutate the immutable stored bundle');
    manifest.snapshot = { ...bundle, site: 'other-site' };
    await assert.rejects(() => service.resolvePage(request), /shared composition Site is invalid/);
    manifest.snapshot = await composer.buildSnapshot({ rootType: 'pageRoute', rootCode: 'dashboard', dependencies }, request);
    assert.deepEqual((await service.resolvePage(request)).result, result);
});

test('browser scope and query/options cannot choose private read tenant, query, auth or pagination', async () => {
    Object.assign(request.delivery, { tenant: 'victim', authorityTenant: 'victim', authData: system });
    request.options = { recursive: true, tenant: 'victim' };
    request.query = { code: 'unrelated' };
    request.searchOptions = { pageSize: 9999 };
    await service.resolvePage(request);
    assert(reads.every(read => read.input.tenant === 'project-authority'));
    assert.equal(reads[1].input.query.code, 'pinned-manifest');
    assert(reads.every(read => read.input.options.recursive === false));
});

for (const [label, mutate] of [
    ['service', r => { r.authData = buildAccessPayload({ serviceId: 'cms-reader' }); }],
    ['customer', r => { r.authData = buildAccessPayload({ type: 'Customer', principalType: 'customer' }); }],
    ['nonhuman', r => { r.authData.principalType = 'service'; }],
    ['missing principal classification', r => { r.authData = buildAccessPayload({ principalType: undefined }); }],
    ['Employee type without human classification', r => { r.authData.principalType = 'customer'; r.authData.type = 'Employee'; }],
    ['missing access token classification', r => { delete r.authData.tokenType; }],
    ['missing person identity', r => { r.authData = buildAccessPayload({ loginId: undefined }); }],
    ['anonymous', r => { r.authData = {}; }],
    ['missing permission', r => { r.authData.permissions = []; }],
    ['tenant mismatch', r => { r.authData.tenant = 'other'; }],
    ['enterprise mismatch', r => { r.authData.entCode = 'other'; }],
    ['public route', r => { r.router.publicAccess = true; }],
    ['forged public mode', r => { r.delivery.accessMode = 'PUBLIC'; }],
]) test(`${label} cannot use the shared composition reader`, async () => {
    mutate(request);
    await assert.rejects(() => service.resolvePage(request), error => error.code === 'ERR_CMS_00086');
    assert.equal(reads.length, 0);
});

test('other Sites, non-allowlisted paths and disabled sharing remain ordinary tenant reads', async () => {
    for (const change of [() => { request.delivery.site = 'business-site'; },
        () => { request.delivery.site = 'axisCmsSite'; request.delivery.path = '/customers'; },
        () => { request.delivery.path = '/dashboard'; cms.publication.baselines.axis.employeeCompositionPaths = []; }]) {
        change(); reads.length = 0;
        await service.resolvePage(request);
        assert(reads.every(read => read.input.tenant === request.tenant && read.input.authData === request.authData));
    }
});

for (const [label, mutate] of [
    ['missing pointer', () => { pointer = undefined; }],
    ['missing manifest', () => { manifest = undefined; }],
    ['missing pin', () => { delete pointer.manifestCode; }],
    ['foreign Site', () => { manifest.snapshot.site = 'business-site'; }],
    ['wrong path', () => { manifest.snapshot.path = '/customers'; }],
    ['wrong locale', () => { manifest.snapshot.locale = 'ar'; }],
    ['wrong channel', () => { manifest.snapshot.channel = 'mobile'; }],
    ['public manifest', () => { manifest.snapshot.accessMode = 'PUBLIC'; }],
    ['wrong pin', () => { manifest.code = 'other'; }],
    ['invalid policy', () => { cms.publication.baselines.axis.employeeCompositionPaths = ['/*']; }],
    ['ambiguous policy', () => { cms.publication.baselines.copy = { ...cms.publication.baselines.axis }; }],
    ['Staged runtime', () => { cms.publication.runtimeRole = 'STAGED'; }],
    ['publication disabled', () => { cms.publication.enabled = false; }],
    ['missing reader', () => { delete SERVICE.DefaultIdentityGovernanceService; }],
]) test(`${label} fails closed without ordinary content fallback`, async () => {
    mutate();
    await assert.rejects(() => service.resolvePage(request));
    assert(reads.every(read => read.input.tenant === authorityTenant));
});

test('denied and ambiguous private reads propagate without retry or fallback', async () => {
    SERVICE.DefaultCmsPublicationManifestService.get = async () => { throw new Error('denied'); };
    await assert.rejects(() => service.resolvePage(request), /denied/);
    assert.equal(reads.length, 1);
    SERVICE.DefaultCmsPublicationManifestService.get = async () => ({ result: [manifest, manifest] });
    await assert.rejects(() => service.resolvePage(request), /missing or ambiguous/);
});

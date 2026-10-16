/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the repository LICENSE. */
/**
 * @module cms/test/cmsBusinessAuthoringAccess
 * @description Exercises persisted business groups against real route/schema guards and scoped designer commands.
 * @owner cms
 * @layer test
 * @override Extend owner fixtures and negative cases without replacing authorization decisions with catalogue assertions.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const _ = require('lodash');
const router = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
const routerBuilder = require('../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterService');
const defaultRoutes = require('../../../../nodics.foundation/modules/nRouter/src/router/routers');
const schemaAccess = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
const saveGate = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService');
const getGate = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
const generatedCommon = require('../../../../nodics.foundation/modules/nService/src/service/common');
const schemaAuthority = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAuthoringPolicyService');
const versionedModel = require('../../../../nodics.foundation/modules/nDatabase/mongodb/vMongodb/src/schemas/model').default;
const schemas = require('../src/schemas/schemas').cms;
const routes = require('../src/router/routers').cms.cmsDesignerComposition;
const designer = require('../src/service/designer/defaultCmsDesignerCompositionService');
const access = require('../src/service/designer/defaultCmsDesignerAccessService');
const identityCatalogue = require('../../../../nodics.platform/modules/profile/src/service/identity/defaultIdentityCatalogueService');
const businessRoles = Object.fromEntries(Object.values(require('../data/init-v001/records/identity/cmsBusinessAccessRoleData'))
    .map(role => [role.code, role]));
const groups = Object.fromEntries([
    ...Object.values(require('../data/init-v001/records/identity/cmsBusinessAccessGroupData')),
    ...Object.values(require('../../../../nodics.platform/modules/axis/data/init-v001/records/identity/axisUserGroupData')),
    ...Object.values(require('../../../../nodics.platform/modules/profile/data/init-v001/records/identity/profileUserGroupData')),
].map(group => [group.code, group]));

/** Uses real persisted ancestry and permissions to form independently authenticated claims. */
function principal(level) {
    const codes = new Set(), permissions = new Set();
    const visit = code => {
        if (codes.has(code)) return;
        codes.add(code);
        (groups[code]?.permissions || []).forEach(permission => permissions.add(permission));
        (groups[code]?.parentGroups || []).forEach(visit);
    };
    visit(`cmsBusiness${level}UserGroup`);
    return { principalType: 'human', tokenType: 'access', tenant: 'tenant-a', enterpriseCode: 'enterprise-a',
        loginId: 'employee', userGroups: [...codes], permissions: [...permissions] };
}

/** Executes the actual generated save access gate without touching a database. */
function generatedSaveAllowed(authData, schemaName) {
    return new Promise((resolve, reject) => saveGate.checkAccess.call({ LOG: { debug() {} } },
        { tenant: 'tenant-a', authData, schemaModel: { rawSchema: schemas[schemaName] } }, {},
        { nextSuccess: () => resolve(true), error: (_request, _response, error) => reject(error) }));
}

/** Builds bounded owner repository doubles; saves still traverse the real generated schema ACL. */
function fixture(level = 'Edit') {
    let stage = 'STAGED';
    const scope = { enterpriseCode: 'enterprise-a', siteCode: 'site-a', catalogCode: 'catalog-a' };
    const rows = {
        DefaultCmsSiteService: [{ code: 'site-a', catalog: 'catalog-a', enterpriseCode: 'enterprise-a', active: true },
            { code: 'site-b', catalog: 'catalog-b', enterpriseCode: 'enterprise-b', active: true },
            { code: 'legacy-site', catalog: 'legacy-catalog', active: true }],
        DefaultCatalogService: [{ code: 'catalog-a', catalogType: 'CONTENT', active: true }],
        DefaultCmsPageTemplateService: [{ code: 'template', active: true }],
        DefaultCmsTypeCodeService: [{ code: 'page-type', kind: 'PAGE', active: true }, { code: 'component-type', kind: 'COMPONENT', active: true }],
        DefaultCmsSlotDefinitionService: [], DefaultCmsComponentTypeGroupService: [],
        DefaultCmsPageService: [], DefaultCmsComponentService: [], DefaultCmsComponentDetailService: [],
        DefaultCmsComponentLocalizationService: [], DefaultCmsComponentMediaService: [],
        DefaultCmsPageRouteService: [], DefaultCmsNavigationNodeService: [],
    };
    const writes = [];
    global.UTILS = { isBlank: _.isEmpty };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
    global.CONFIG = { get: key => ({ runtimeRole: { publication: stage },
        identityGovernance: require('../../../../nodics.foundation/modules/nAuth/config/properties').identityGovernance,
        routeActionAuthorization: { enabled: true, strict: true },
        accessPoints: { fullAccessPoint: 10, readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3 },
        cms: { designerAuthoring: { maximumReferenceLookupItems: 100 } },
    })[key] };
    global.NODICS = { getModule: () => ({ rawSchema: schemas }) };
    global.SERVICE = { DefaultCmsDesignerAccessService: access, DefaultSecuredRequestPipelineService: router,
        DefaultSchemaAccessHandlerService: schemaAccess, DefaultRecordOwnershipPolicyService: { enforce: async () => {} },
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ principalType: 'service', userGroups: ['serviceAccountUserGroup'] }) },
        DefaultCmsContractValidationService: { validateRenderer: async () => {}, validateRoute: async () => {},
            validateNavigationNode: async () => {}, validateAssociation: async () => {} },
        DefaultCmsDeliveryCacheInvalidationService: { invalidate: async () => {} },
    };
    for (const [serviceName, list] of Object.entries(rows)) {
        const schemaName = serviceName.replace(/^Default/, '').replace(/Service$/, '').replace(/^Cms/, 'cms');
        SERVICE[serviceName] = {
            get: request => {
                request.schemaModel = { tenant: request.tenant };
                const result = list.filter(item => access.queryMatches(item, request.query));
                return new Promise((resolve, reject) => getGate.executeQuery.call({ LOG: { debug() {} },
                    readItems: async () => ({ query: request.query, count: result.length,
                        result: structuredClone(result.slice(0, request.searchOptions.limit)) }),
                }, request, {}, { nextSuccess: (_request, response) => resolve(response.success),
                    error: (_request, _response, error) => reject(error) }));
            },
            save: async request => {
                await generatedSaveAllowed(request.authData, schemaName);
                const candidate = structuredClone(request.model);
                if (candidate.versionId === undefined) candidate.versionId = 0;
                const model = Object.assign({}, versionedModel, {
                    getItems: async () => ({ result: list.filter(row => row.code === candidate.code)
                        .sort((left, right) => right.versionId - left.versionId).slice(0, 1) }),
                });
                const { model: saved } = await model.validateModel({ code: candidate.code }, {}, candidate);
                writes.push({ serviceName, model: saved }); list.push(saved);
                return { result: [saved] };
            },
        };
    }
    const request = { tenant: 'tenant-a', authorization: 'Bearer cms-employee-token', authData: principal(level), body: {
        siteCode: 'site-a', catalogCode: 'catalog-a', templateCode: 'template',
        page: { code: 'page-a', name: 'Page', typeCode: 'page-type' }, sections: [],
    } };
    return { rows, writes, scope, request, stage: value => { stage = value; } };
}

test('real group/route/generated guards distinguish View, Edit and Full control without generic grants', async () => {
    fixture();
    for (const level of ['View', 'Edit', 'FullControl']) {
        const authData = principal(level);
        assert(!authData.permissions.some(permission => permission === '*' || permission.startsWith('system.schema.')));
        for (const [name, expected] of [['getAuthoringModel', true], ['saveDraftComposition', level !== 'View'],
            ['deleteComponent', level === 'FullControl']]) {
            const request = { tenant: 'tenant-a', authData, router: routes[name] };
            assert.equal(router.hasAccessGroup(request) && router.hasAcceptedTokenType(request) && router.hasRoutePermission(request), expected);
        }
        for (const schemaName of ['cmsPage', 'cmsComponent', 'cmsComponentDetail', 'cmsPageRoute']) {
            assert.equal(schemaAccess.getAccessPoint(authData, schemas[schemaName].accessGroups), 1);
            await assert.rejects(generatedSaveAllowed(authData, schemaName), { code: 'ERR_AUTH_00003' });
            assert.deepEqual(routerBuilder.selectDefaultRouterGroups(schemas[schemaName], defaultRoutes), ['schemaOperations']);
            assert.throws(() => schemaAuthority.assertMutationAllowed('cms', schemaName, 'create'), { code: 'ERR_AUTH_00003' });
        }
    }
});

test('Profile business descriptor resolves the same persisted Content groups admitted by Designer', async () => {
    const areas = identityCatalogue.businessAreas(businessRoles);
    assert.equal(areas.length, 1);
    assert.equal(areas[0].code, 'content');
    assert.equal(areas[0].ownerModule, 'cms');
    assert.equal(areas[0].scopeType, 'ENTERPRISE');
    for (const level of areas[0].levels) {
        const name = { view: 'View', edit: 'Edit', fullControl: 'FullControl' }[level.value];
        const f = fixture(name);
        assert.deepEqual(businessRoles[level.roleCode].groupCodes, [`cmsBusiness${name}UserGroup`]);
        const { result } = await designer.getAuthoringModel(f.request);
        assert.equal(result.operations.includes('saveDraftComposition'), level.value !== 'view');
        assert.equal(result.operations.includes('deleteComponent'), level.value === 'fullControl');
        assert.deepEqual(result.retirement.actions.map(action => action.operation),
            ['deleteSection', 'deleteComponent', 'detachMedia']);
        assert(result.retirement.actions.every(action => routes[action.operation] && action.label && action.consequence));
    }
    const f = fixture('View');
    f.request.authData = { ...f.request.authData, userGroups: ['employeeUserGroup'], permissions: [] };
    await assert.rejects(designer.getAuthoringModel(f.request), { code: 'ERR_AUTH_00003' });
});

test('Designer projects write operations only after awaited metadata and final admission', async () => {
    const f = fixture('Edit');
    const scopedDesigner = Object.assign({}, designer, { authoringMetadata: async request => {
        const metadata = await designer.authoringMetadata(request);
        f.stage('ONLINE');
        return metadata;
    } });
    assert.deepEqual((await scopedDesigner.getAuthoringModel(f.request)).result.operations, []);
    const changed = fixture('Edit');
    scopedDesigner.authoringMetadata = async request => {
        const metadata = await designer.authoringMetadata(request);
        request.authData.permissions = [];
        return metadata;
    };
    await assert.rejects(scopedDesigner.getAuthoringModel(changed.request), { code: 'ERR_AUTH_00003' });
    assert.equal(changed.writes.length, 0);
});

test('Edit saves a scoped draft through generated persistence; View and Online never write', async () => {
    const f = fixture();
    const result = await designer.saveDraftComposition(f.request);
    assert.equal(result.result.status, 'DRAFT_SAVED');
    assert.deepEqual(f.writes[0].model.authoringScope, f.scope);
    await designer.saveDraftComposition(f.request);
    assert.deepEqual(f.writes.map(write => write.model.versionId), [0, 1]);
    const count = f.writes.length;
    await assert.rejects(designer.saveDraftComposition({ ...f.request, authData: principal('View') }), { code: 'ERR_AUTH_00003' });
    f.stage('ONLINE');
    await assert.rejects(designer.saveDraftComposition(f.request), { code: 'ERR_AUTH_00003' });
    assert.equal(f.writes.length, count);
});

test('foreign/unbound Sites, shared catalogs and scope overrides fail before any writes', async () => {
    const f = fixture();
    for (const changes of [{ siteCode: 'site-b', catalogCode: 'catalog-b' },
        { siteCode: 'legacy-site', catalogCode: 'legacy-catalog' }, { enterpriseCode: 'enterprise-b' },
        { tenant: 'tenant-b' }, { siteCode: 'site-a', catalogCode: 'catalog-b' }]) {
        await assert.rejects(designer.saveDraftComposition({ ...f.request, body: { ...f.request.body, ...changes } }),
            { code: 'ERR_AUTH_00003' });
    }
    f.rows.DefaultCmsSiteService.push({ code: 'foreign-shared', catalog: 'catalog-a', enterpriseCode: 'enterprise-b', active: true });
    await assert.rejects(designer.saveDraftComposition(f.request), { code: 'ERR_AUTH_00003' });
    assert.equal(f.writes.length, 0);
});

test('foreign and unowned record collisions cannot be adopted or linked by a valid Site author', async () => {
    const f = fixture();
    const input = { siteCode: 'site-a', catalogCode: 'catalog-a', code: 'component', typeCode: 'component-type' };
    for (const authoringScope of [undefined, { ...f.scope, enterpriseCode: 'enterprise-b' }, { ...f.scope, catalogCode: 'other-catalog' }]) {
        f.rows.DefaultCmsComponentService.splice(0, Infinity, { code: 'component', authoringScope });
        f.rows.DefaultCmsPageService.splice(0, Infinity, { code: 'foreign-page', authoringScope });
        await assert.rejects(designer.addComponent({ ...f.request, body: input }), { code: 'ERR_AUTH_00003' });
        await assert.rejects(designer.assignRoute({ ...f.request, body: { ...input, code: 'route', site: 'site-b', page: 'foreign-page' } }),
            { code: 'ERR_AUTH_00003' });
        await assert.rejects(designer.assignRoute({ ...f.request, body: { ...input, code: 'route', site: 'site-a', page: 'foreign-page' } }),
            { code: 'ERR_AUTH_00003' });
        await assert.rejects(designer.deleteComponent({ ...f.request, authData: principal('FullControl'), body: input }),
            { code: 'ERR_AUTH_00003' });
    }
    assert.equal(f.writes.length, 0);
});

test('Full control retires only owned components; Edit cannot delete or bypass publication approval', async () => {
    const f = fixture('FullControl');
    const body = { siteCode: 'site-a', catalogCode: 'catalog-a', code: 'component', typeCode: 'component-type' };
    await designer.addComponent({ ...f.request, body });
    await assert.rejects(designer.deleteComponent({ ...f.request, authData: principal('Edit'), body }), { code: 'ERR_AUTH_00003' });
    await assert.rejects(designer.updateComponent({ ...f.request, authData: principal('Edit'),
        body: { ...body, active: false } }), { code: 'ERR_AUTH_00003' });
    const retired = await designer.deleteComponent({ ...f.request, body });
    assert.equal(retired.result.active, false);
    assert.equal(f.rows.DefaultCmsComponentService[0].active, true);
    assert.equal(f.rows.DefaultCmsComponentService.length, 2);
    assert.equal(retired.result.versionId, 1);
    assert(!f.request.authData.permissions.includes('cms.publication.emergencyOverride'));
    assert(!f.request.authData.permissions.includes('publish.lifecycle.approve'));
});

test('save and retirement refuse contradictory or ambiguous provider outcomes without replay', async () => {
    const corruptions = [
        response => ({ ...response, code: 'ERR_SAVE_00000' }),
        response => ({ ...response, success: false }),
        response => ({ ...response, acknowledged: false }),
        response => ({ ...response, errors: ['failed'] }),
        response => ({ ...response, errors: {} }),
        response => ({ ...response, error: 'failed' }),
        response => ({ ...response, result: [...response.result, ...response.result] }),
        () => ({ acknowledged: true, result: { modifiedCount: 1 } }),
    ];
    for (const retire of [false, true]) for (const corrupt of corruptions) {
        const f = fixture('FullControl');
        const request = { ...f.request, body: { siteCode: 'site-a', catalogCode: 'catalog-a',
            code: 'component', typeCode: 'component-type' } };
        if (retire) await designer.addComponent(request);
        const service = SERVICE.DefaultCmsComponentService;
        const save = service.save;
        let calls = 0;
        service.save = async input => { calls++; return corrupt(await save(input)); };
        await assert.rejects(retire ? designer.deleteComponent(request) : designer.addComponent(request));
        assert.equal(calls, 1, 'an uncertain write is inspected, never replayed');
        assert.equal(f.writes.length, retire ? 2 : 1, 'failure does not imply rollback');
    }
});

test('Edit updates use owner-read next versions and cannot choose a stored version', async () => {
    const f = fixture('Edit');
    const body = { siteCode: 'site-a', catalogCode: 'catalog-a', code: 'component', typeCode: 'component-type' };
    await designer.addComponent({ ...f.request, body });
    const response = await designer.updateComponent({ ...f.request,
        body: { ...body, versionId: 900, properties: { title: 'Updated' } } });
    assert.equal(response.result.versionId, 1);
    assert.equal(f.rows.DefaultCmsComponentService[0].versionId, 0);
    assert.equal(response.result.properties.title, 'Updated');
});

test('View metadata includes only bound enterprise Sites and never foreign navigation', async () => {
    const f = fixture('View');
    f.rows.DefaultCmsNavigationNodeService.push({ code: 'foreign-nav', status: 'ACTIVE', authoringScope: { enterpriseCode: 'enterprise-b' } });
    const result = await designer.getAuthoringModel(f.request);
    assert.deepEqual(result.result.metadata.sites.map(row => row.code), ['site-a']);
    assert.deepEqual(result.result.metadata.contentCatalogs.map(row => row.code), ['catalog-a']);
    assert.deepEqual(result.result.metadata.navigationNodes, []);
    assert.equal(f.writes.length, 0);
});

test('owner reads require affirmative generated evidence, selected tenant, exact query and complete count', async () => {
    const corruptions = [
        (_read, response) => { response.code = 'ERR_FIND_00000'; },
        (_read, response) => { delete response.code; },
        (_read, response) => { response.success = false; },
        (_read, response) => { response.success = 'true'; },
        (_read, response) => { response.acknowledged = false; },
        (_read, response) => { response.errors = [{ code: 'ERR_AUTH_00003' }]; },
        (_read, response) => { response.errors = {}; },
        (_read, response) => { response.error = { code: 'ERR_AUTH_00003' }; },
        (read) => { read.schemaModel.tenant = 'tenant-b'; },
        (read) => { delete read.schemaModel; },
        (_read, response) => { response.tenant = 'tenant-b'; },
        (_read, response) => { response.result[0].tenantCode = 'tenant-b'; },
        (_read, response) => { response.query = {}; },
        (_read, response) => { response.result[0].code = 'another-site'; },
        (_read, response) => { response.count = 2; },
        (_read, response) => { delete response.count; },
        (_read, response) => { response.total = 101; },
    ];
    for (const corrupt of corruptions) {
        const f = fixture();
        const original = SERVICE.DefaultCmsSiteService.get;
        SERVICE.DefaultCmsSiteService.get = async read => {
            const response = await original(read);
            corrupt(read, response);
            return response;
        };
        await assert.rejects(designer.saveDraftComposition(f.request), { code: 'ERR_AUTH_00003' });
        assert.equal(f.writes.length, 0);
    }
});

test('a truncated shared-Catalog lookup cannot conceal a foreign Site', async () => {
    const f = fixture();
    const original = SERVICE.DefaultCmsSiteService.get;
    SERVICE.DefaultCmsSiteService.get = async read => {
        const response = await original(read);
        if (read.query.catalog) response.count = 2;
        return response;
    };
    await assert.rejects(designer.saveDraftComposition(f.request), { code: 'ERR_AUTH_00003' });
    assert.equal(f.writes.length, 0);
});

test('system/customer identities and conflicting tenant aliases cannot become CMS employees', async () => {
    for (const change of [request => { request.authData.isSystem = true; },
        request => { request.authData.runtimeScope = 'PLATFORM'; },
        request => { request.authData.type = 'Customer'; },
        request => { request.authData.principalType = 'service'; },
        request => { request.authorization = ''; },
        request => { request.authData.userGroups = ['userGroup']; },
        request => { request.authData.userGroups = Array(1025).fill('employeeUserGroup'); },
        request => { const group = { code: 'employeeUserGroup', parentGroups: [] }; group.parentGroups.push(group); request.authData.userGroups = [group]; },
        request => { request.authData.groups = {}; },
        request => { request.authData.permissions = [{}]; },
        request => { request.authData.tenantCode = 'tenant-b'; },
        request => { request.tenantCode = 'tenant-b'; },
        request => { request.body.tenantCode = 'tenant-b'; }]) {
        const f = fixture(); change(f.request);
        await assert.rejects(designer.saveDraftComposition(f.request), { code: 'ERR_AUTH_00003' });
        assert.equal(f.writes.length, 0);
    }
});

test('identity, permissions and selected scope stay pinned across every awaited owner read', async () => {
    for (const phase of ['site', 'catalog', 'identity']) {
        for (const drift of [request => { request.authData.loginId = 'another-employee'; },
            request => { request.authData.permissions = ['cms.backoffice.view']; },
            request => { request.authData.enterpriseCode = 'enterprise-b'; },
            request => { request.authData.isSystem = true; },
            request => { request.authorization = 'Bearer changed-token'; },
            request => { request.authData.tenant = request.tenant = 'tenant-b'; },
            request => { request.body.catalogCode = 'another-catalog'; }]) {
            const f = fixture();
            const name = phase === 'identity' ? 'DefaultCmsComponentService' : 'DefaultCmsSiteService';
            const original = SERVICE[name].get;
            f.request.body = { siteCode: 'site-a', catalogCode: 'catalog-a', code: 'component', typeCode: 'component-type' };
            SERVICE[name].get = async read => {
                const response = await original(read);
                if (phase === 'identity' || phase === 'site' && read.query.code || phase === 'catalog' && read.query.catalog)
                    drift(f.request);
                return response;
            };
            await assert.rejects(designer.addComponent(f.request), { code: 'ERR_AUTH_00003' });
            assert.equal(f.writes.length, 0);
        }
    }
});

test('components are reusable across Sites in one owned Catalog; pages remain Site-bound', async () => {
    const f = fixture();
    f.rows.DefaultCmsSiteService.push({ code: 'site-c', catalog: 'catalog-a', enterpriseCode: 'enterprise-a', active: true });
    await designer.addComponent({ ...f.request, body: { siteCode: 'site-a', catalogCode: 'catalog-a', code: 'shared', typeCode: 'component-type' } });
    assert.deepEqual(f.rows.DefaultCmsComponentService[0].authoringScope, { enterpriseCode: 'enterprise-a', catalogCode: 'catalog-a' });
    f.rows.DefaultCmsPageService.push({ code: 'page-c', authoringScope: { ...f.scope, siteCode: 'site-c' } });
    const request = { ...f.request, body: { siteCode: 'site-c', catalogCode: 'catalog-a',
        code: 'placement-c', source: 'page-c', target: 'shared', slot: 'main' } };
    await designer.addSection(request);
    assert.equal(f.writes.at(-1).model.target, 'shared');
    assert.equal(f.writes.at(-1).model.authoringScope.siteCode, 'site-c');
    await assert.rejects(designer.assignRoute({ ...f.request, body: { siteCode: 'site-a', catalogCode: 'catalog-a',
        code: 'wrong-site-route', site: 'site-a', page: 'page-c' } }), { code: 'ERR_AUTH_00003' });
    f.rows.DefaultCmsPageTemplateService[0].authoringScope = { enterpriseCode: 'enterprise-a', catalogCode: 'other-catalog' };
    await assert.rejects(designer.saveDraftComposition(f.request), { code: 'ERR_AUTH_00003' });
});

test('business navigation admits the real Designer but does not advertise unauthorized Workbench pages', async () => {
    const f = fixture('View');
    const capability = require('../src/service/defaultCmsBackofficeCapabilityService').getCapability();
    const visible = capability.navigation.filter(item => item.featureState === 'ACTIVE' &&
        item.requiredPermissions.every(permission => router.isPermissionGranted(permission, f.request.authData.permissions, {})));
    assert(visible.some(item => item.route === '/content/designer'));
    assert(!visible.some(item => item.workbenchTarget));
    assert.deepEqual((await designer.getAuthoringModel(f.request)).result.operations, []);
});

test('real generated service selects the exact tenant model without requiring a tenant property on CMS rows', async () => {
    const f = fixture();
    const selected = [], model = { tenant: 'tenant-a' };
    NODICS.getModels = (moduleName, tenant) => {
        selected.push([moduleName, tenant]);
        return { mdlnm: model };
    };
    SERVICE.DefaultPipelineService = { start: (pipeline, read) => {
        assert.equal(pipeline, 'modelsGetInitializerPipeline');
        const result = f.rows.DefaultCmsSiteService.filter(row => access.queryMatches(row, read.query));
        return new Promise((resolve, reject) => getGate.executeQuery.call({ LOG: { debug() {} },
            readItems: async () => ({ query: read.query, count: result.length, result }),
        }, read, {}, { nextSuccess: (_request, response) => resolve(response.success),
            error: (_request, _response, error) => reject(error) }));
    } };
    SERVICE.DefaultCmsSiteService.get = read => {
        read.moduleName = 'cms';
        return generatedCommon.get(read);
    };
    const result = await access.records('DefaultCmsSiteService', f.request, { code: 'site-a' });
    assert.equal(result[0].tenant, undefined);
    assert.deepEqual(selected, [['cms', 'tenant-a']]);
    model.tenant = 'tenant-b';
    await assert.rejects(access.records('DefaultCmsSiteService', f.request, { code: 'site-a' }), { code: 'ERR_AUTH_00003' });
    assert.deepEqual(selected[1], ['cms', 'tenant-a']);
});

test('native platform full access uses the shared predicate without permitting external or cross-tenant wildcard claims', () => {
    const f = fixture();
    const request = { ...f.request, tenant: 'default', authData: { ...f.request.authData,
        tenant: 'default', enterpriseCode: 'default', entCode: 'default', authenticationMethod: 'PASSWORD',
        userGroups: ['platformAdministratorUserGroup'], permissions: ['*'] } };
    assert.deepEqual(access.authorize(request, 'cms.authoring.delete'), { tenant: 'default', enterpriseCode: 'default' });
    assert.throws(() => access.authorize({ ...f.request, tenant: 'default', authData: { ...request.authData,
        authenticationMethod: 'OIDC', externalIdentityLinkCode: 'external-link' } }, 'cms.authoring.write'), { code: 'ERR_AUTH_00003' });
    assert.throws(() => access.authorize({ ...f.request, authData: { ...request.authData,
        tenant: 'tenant-a' } }, 'cms.authoring.write'), { code: 'ERR_AUTH_00003' });
});

test('component-owned nested placements retain catalog sharing and cannot adopt page placement ownership', async () => {
    const f = fixture();
    f.rows.DefaultCmsSiteService.push({ code: 'site-c', catalog: 'catalog-a', enterpriseCode: 'enterprise-a', active: true });
    for (const code of ['parent', 'child']) await designer.addComponent({ ...f.request, body: {
        siteCode: 'site-a', catalogCode: 'catalog-a', code, typeCode: 'component-type' } });
    await designer.addSection({ ...f.request, body: { siteCode: 'site-a', catalogCode: 'catalog-a',
        code: 'nested', source: 'parent', target: 'child', slot: 'main' } });
    assert.deepEqual(f.writes.at(-1).model.authoringScope, { enterpriseCode: 'enterprise-a', catalogCode: 'catalog-a' });
    await designer.updateComponent({ ...f.request, body: { siteCode: 'site-c', catalogCode: 'catalog-a',
        code: 'parent', typeCode: 'component-type', subComponents: ['nested'] } });
    assert.deepEqual(f.writes.at(-1).model.subComponents, ['nested']);
    f.rows.DefaultCmsPageService.push({ code: 'page-a', authoringScope: f.scope });
    await assert.rejects(designer.updateSection({ ...f.request, body: { siteCode: 'site-a', catalogCode: 'catalog-a',
        code: 'nested', source: 'page-a', target: 'child', slot: 'main' } }), { code: 'ERR_AUTH_00003' });
});

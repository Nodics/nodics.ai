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
        DefaultCmsDocumentationProductService: [],
        DefaultCmsPageService: [], DefaultCmsComponentService: [], DefaultCmsComponentDetailService: [],
        DefaultCmsComponentLocalizationService: [], DefaultCmsComponentMediaService: [],
        DefaultCmsPageRouteService: [], DefaultCmsNavigationNodeService: [],
    };
    const writes = [];
    let realPlacementValidation = false;
    global.UTILS = { isBlank: _.isEmpty };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
    global.CONFIG = { get: key => ({ runtimeRole: { publication: stage },
        identityGovernance: require('../../../../nodics.foundation/modules/nAuth/config/properties').identityGovernance,
        routeActionAuthorization: { enabled: true, strict: true },
        accessPoints: { fullAccessPoint: 10, readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3 },
        cms: { designerAuthoring: { maximumReferenceLookupItems: 100 } },
    })[key] };
    global.NODICS = { getModule: () => ({ rawSchema: schemas }) };
    global.SERVICE = { DefaultCmsDesignerCompositionService: designer, DefaultCmsDesignerAccessService: access, DefaultSecuredRequestPipelineService: router,
        DefaultCmsDesignerReadService: require('../src/service/designer/defaultCmsDesignerReadService'),
        DefaultSchemaAccessHandlerService: schemaAccess, DefaultRecordOwnershipPolicyService: { enforce: async () => {} },
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ principalType: 'service', userGroups: ['serviceAccountUserGroup'] }) },
        DefaultCmsContractValidationService: { validateRenderer: async () => {}, validateRoute: async () => {}, validateComponentMedia: async () => {},
            validateDraftComponentMediaReference: async () => {}, validateNavigationNode: async () => {}, validateAssociation: async () => {} },
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
                if (realPlacementValidation && serviceName === 'DefaultCmsComponentDetailService')
                    await require('../src/service/validation/defaultCmsContractValidationService').validateAssociation(request);
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
    return { rows, writes, scope, request, stage: value => { stage = value; }, useRealPlacementValidation: () => { realPlacementValidation = true; } };
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
    for (const [field, definition] of Object.entries(schemas.cmsPage.definition).filter(([, definition]) => definition.required)) {
        assert.notEqual(f.writes[0].model[field], undefined, `new page must satisfy the owning schema's required ${field}`);
        if (definition.type === 'array') assert(Array.isArray(f.writes[0].model[field]));
    }
    const reopened = (await designer.getDraftComposition(f.request)).result;
    f.request.body.sourceVersion = reopened.sourceVersion;
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

test('a scoped documentation author can use a shared catalog with a verified read-only product peer', async () => {
    const f = fixture();
    f.rows.DefaultCmsSiteService.push({ code: 'published-docs', catalog: 'catalog-a', active: true });
    const products = f.rows.DefaultCmsDocumentationProductService;
    await assert.rejects(access.scope(f.request, 'cms.authoring.write'), { code: 'ERR_AUTH_00003' });
    products.push({ site: 'site-a', contentCatalog: 'catalog-a', publicRootPath: '/docs/project',
        defaultLocale: 'en', active: true });
    products.push({ site: 'published-docs', contentCatalog: 'catalog-a', active: true });
    f.rows.DefaultCmsPageRouteService.push({ site: 'site-a', path: '/docs/project', channel: 'web',
        page: 'root', accessMode: 'PUBLIC', active: true });
    f.rows.DefaultCmsPageService.push({ code: 'root', cmsSite: ['site-a'], template: 'template',
        typeCode: 'page-type', renderer: 'documentation.page.article', active: true });
    f.rows.DefaultCmsSlotDefinitionService.push(
        { template: 'template', name: 'article', allowedComponentTypes: ['article-type'], active: true },
        { template: 'template', name: 'navigation', allowedComponentTypes: ['navigation-type'], active: true });
    const { result } = await designer.getDocumentationDraftModel(f.request);
    assert.deepEqual(result, {
        siteCode: 'site-a', catalogCode: 'catalog-a', rootPath: '/docs/project', templateCode: 'template',
        typeCode: 'page-type', renderer: 'documentation.page.article', articleTypeCode: 'article-type',
        navigationTypeCode: 'navigation-type', accessMode: 'PUBLIC', locale: 'en',
    });
    const peer = { ...f.request, body: { siteCode: 'published-docs', catalogCode: 'catalog-a' } };
    delete peer[Object.getOwnPropertySymbols(peer)[0]];
    await assert.rejects(access.scope(peer, 'cms.authoring.write'), { code: 'ERR_AUTH_00003' });
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
    assert.deepEqual((await designer.getAuthoringModel(f.request)).result.operations, ['listDraftPages', 'getDraftComposition']);
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

test('HTTP Designer entry carries only the original authenticated bearer into the existing owner checks', async () => {
    const controller = require('../src/controller/defaultCmsDesignerCompositionController');
    const facade = require('../src/facade/defaultCmsDesignerCompositionFacade');
    const f = fixture('Edit');
    SERVICE.DefaultCmsDesignerCompositionService = designer;
    global.FACADE = { DefaultCmsDesignerCompositionFacade: facade };
    delete f.request.authorization;
    f.request.httpRequest = { headers: { authorization: 'Bearer original-http-employee' }, body: {} };
    const original = structuredClone(f.request.authData);
    const result = await controller.getAuthoringModel(f.request);
    assert.deepEqual(result.result.metadata.sites.map(site => site.code), ['site-a']);
    assert.equal(f.request.authorization, 'Bearer original-http-employee');
    assert.deepEqual(f.request.authData, original);
    assert.equal(f.writes.length, 0);
    for (const headers of [{}, { authorization: '' }]) {
        const denied = fixture('Edit');
        SERVICE.DefaultCmsDesignerCompositionService = designer;
        denied.request.httpRequest = { headers, body: { authorization: 'Bearer body-supplied', authData: f.request.authData } };
        denied.request.authorization = 'Bearer unbound-wrapper-value';
        await assert.rejects(controller.getAuthoringModel(denied.request), { code: 'ERR_AUTH_00003' });
        assert.equal(denied.writes.length, 0);
    }
});

test('authoring metadata bounds queries to owned Catalog references before historical documentation volume', async () => {
    const f = fixture('Edit');
    const shared = { enterpriseCode: 'enterprise-a', catalogCode: 'catalog-a' };
    f.rows.DefaultCmsSlotDefinitionService.push(...Array.from({ length: 120 }, (_, index) =>
        ({ code: 'historical-slot-' + index, active: true })));
    f.rows.DefaultCmsSlotDefinitionService.push({ code: 'owned-slot', active: true, authoringScope: shared });
    f.rows.DefaultCmsPageTemplateService.push({ code: 'owned-template', active: true, authoringScope: shared });
    f.rows.DefaultCmsTypeCodeService.push(
        { code: 'owned-component-type', kind: 'COMPONENT', active: true, authoringScope: shared },
        { code: 'foreign-type', kind: 'COMPONENT', active: true,
            authoringScope: { enterpriseCode: 'enterprise-b', catalogCode: 'catalog-b' } });
    const { result } = await designer.getAuthoringModel(f.request);
    assert.deepEqual(result.metadata.slotDefinitions.map(row => row.code), ['owned-slot']);
    assert.deepEqual(result.metadata.pageTemplates.map(row => row.code), ['owned-template']);
    assert.deepEqual(result.metadata.componentTypes.map(row => row.code), ['owned-component-type']);
    assert.equal(f.writes.length, 0);
});

test('metadata lookup survives actual generated paging normalization beyond the default page', async () => {
    const f = fixture('Edit');
    const originalConfig = CONFIG.get;
    CONFIG.get = key => key === 'defaultPageSize' ? 20 : key === 'defaultPageNumber' ? 1 : originalConfig(key);
    f.rows.DefaultCmsSlotDefinitionService.push(...Array.from({ length: 24 }, (_, index) => ({
        code: 'owned-slot-' + index, active: true,
        authoringScope: { enterpriseCode: 'enterprise-a', catalogCode: 'catalog-a' }
    })));
    const originalGet = SERVICE.DefaultCmsSlotDefinitionService.get;
    SERVICE.DefaultCmsSlotDefinitionService.get = async read => {
        await new Promise((resolve, reject) => getGate.buildOptions.call({ LOG: { debug() {} } }, read, {}, {
            nextSuccess: resolve, error: (_request, _response, error) => reject(error)
        }));
        return originalGet(read);
    };
    const { result } = await designer.getAuthoringModel(f.request);
    assert.equal(result.metadata.slotDefinitions.length, 24);
    assert.equal(f.writes.length, 0);
});

test('configured business content fields reject incomplete or malformed component writes', async () => {
    const f = fixture();
    f.rows.DefaultCmsSlotDefinitionService.push({ code: 'main-slot', name: 'main', template: 'template', active: true, authoringScope: { enterpriseCode: 'enterprise-a', catalogCode: 'catalog-a' } });
    const configured = CONFIG.get;
    CONFIG.get = key => key === 'cms' ? { designerAuthoring: { componentKinds: [{
        typeCode: 'component-type', fields: [
            { property: 'title', label: 'Heading', control: 'text', required: true, maxLength: 40 },
            { property: 'items', label: 'Cards', control: 'items', required: true, maximumItems: 3,
                itemFields: [{ property: 'title', label: 'Card heading', control: 'text', required: true }] }
        ]
    }] } } : configured(key);
    const input = { siteCode: 'site-a', catalogCode: 'catalog-a', code: 'business-component', typeCode: 'component-type' };
    for (const properties of [{}, { title: 'Business heading', items: [] }, { title: 'Business heading', items: [{}] },
        { title: 'Business heading', items: 'wrong' }, { title: 'x'.repeat(41), items: [{ title: 'One' }] }]) {
        await assert.rejects(designer.addComponent({ ...f.request, body: { ...input, properties } }), { code: 'ERR_CMS_00100' });
        assert.equal(f.writes.length, 0);
        await assert.rejects(designer.saveDraftComposition({ ...f.request, body: { ...f.request.body,
            sections: [{ slot: 'main', components: [{ ...input, properties }] }] } }), { code: 'ERR_CMS_00100' });
        assert.equal(f.writes.length, 0, 'whole draft validates content before the first Page write');
    }
    await assert.rejects(designer.saveDraftComposition({ ...f.request, body: { ...f.request.body,
        sections: [{ slot: 'main', components: [{ ...input,
            properties: { title: 'Business heading', items: [{ title: 'One' }] },
            localizations: [{ locale: 'ar', properties: { title: { invalid: 'not text' } } }] }] }] } }), { code: 'ERR_CMS_00100' });
    assert.equal(f.writes.length, 0);
    const properties = { title: 'Business heading', items: [{ title: 'One' }, { title: 'Two' }] };
    const result = await designer.addComponent({ ...f.request, body: { ...input, properties } });
    assert.deepEqual(result.result.properties, properties);
    assert.deepEqual(result.result.authoringScope, { enterpriseCode: 'enterprise-a', catalogCode: 'catalog-a' });
});

test('publication readiness names unreviewed translations before creating any publication', async () => {
    const f = fixture();
    f.rows.DefaultCmsSlotDefinitionService.push({ code: 'main-slot', name: 'main', template: 'template', active: true, authoringScope: { enterpriseCode: 'enterprise-a', catalogCode: 'catalog-a' } });
    const body = { ...f.request.body, route: { path: '/new-page', locale: 'en' }, sections: [{ slot: 'main', components: [{ code: 'bilingual', typeCode: 'component-type', properties: { title: 'Hello' }, localizations: [{ locale: 'en', properties: { title: 'Hello' }, status: 'DRAFT' }] }] }] };
    await assert.rejects(designer.validatePublishReadiness({ ...f.request, body }), error => error.code === 'ERR_CMS_00106' && /mark it ready/.test(error.message));
    assert.equal(f.writes.length, 0);
    body.sections[0].components[0].localizations[0].status = 'READY';
    assert.equal((await designer.validatePublishReadiness({ ...f.request, body })).result.status, 'READY_TO_PUBLISH');
});

test('route locale comes from the configured shared delivery policy independently of editing language', () => {
    fixture(); const configured = CONFIG.get;
    CONFIG.get = key => key === 'cms' ? { localization: { defaultLocale: 'en', supportedLocales: ['en', 'ar'], legacyRouteLocale: 'default' } } : configured(key);
    assert.deepEqual(designer.clientLocalizationPolicy(), { defaultLocale: 'en', supportedLocales: ['en', 'ar'], fallbackLocales: [], routeLocale: 'default' });
});

/** Seeds in-memory owner doubles only; live acceptance creates records through the normal APIs. */
function savedPageFixture(level = 'Edit') {
    const f = fixture(level), shared = { enterpriseCode: 'enterprise-a', catalogCode: 'catalog-a' };
    f.request.body.pageCode = 'page-a';
    f.rows.DefaultCmsPageService.push({ code: 'page-a', name: 'Business page', template: 'template', typeCode: 'page-type',
        cmsSite: ['site-a'], active: true, versionId: 0, authoringScope: f.scope, seo: { title: 'Retained page SEO' } });
    f.rows.DefaultCmsSlotDefinitionService.push({ code: 'main-slot', name: 'main', template: 'template', active: true, authoringScope: shared });
    f.rows.DefaultCmsComponentService.push({ code: 'block-a', typeCode: 'component-type', renderer: 'renderer',
        accessMode: 'PUBLIC', properties: { title: 'Original', extension: { retained: true } }, active: true, versionId: 0,
        authoringScope: shared, customExtension: { retained: true } });
    f.rows.DefaultCmsComponentDetailService.push({ code: 'stable-placement', source: 'page-a', target: 'block-a', slot: 'main', index: 7,
        active: true, versionId: 0, authoringScope: f.scope, layout: { retained: true } });
    f.rows.DefaultCmsComponentLocalizationService.push({ code: 'original-translation-identity', componentCode: 'block-a', locale: 'en',
        properties: { title: 'Original' }, seo: { title: 'Translation SEO' }, status: 'READY', active: true, versionId: 0, authoringScope: shared });
    f.rows.DefaultCmsComponentMediaService.push({ code: 'original-media-identity', componentMediaCode: 'original-media-identity', componentCode: 'block-a',
        mediaCode: 'image-a', role: 'primary', mediaType: 'IMAGE', position: 0, active: true, versionId: 0, authoringScope: shared });
    return f;
}

test('View reopens exact saved identities without writes or authoring permission', async () => {
    const f = savedPageFixture('View');
    assert.deepEqual((await designer.listDraftPages(f.request)).result.pages, [{ code: 'page-a', name: 'Business page' }]);
    const value = (await designer.getDraftComposition(f.request)).result;
    assert(value.editable);
    assert.match(value.sourceVersion, /^[a-f0-9]{64}$/);
    assert.equal(value.draft.sections[0].code, 'stable-placement');
    assert.equal(value.draft.sections[0].index, 7);
    assert.equal(value.draft.sections[0].components[0].localizations[0].code, 'original-translation-identity');
    assert.equal(value.draft.sections[0].components[0].media[0].code, 'original-media-identity');
    assert.equal(f.writes.length, 0);
    await assert.rejects(designer.saveDraftComposition({ ...f.request, body: value.draft }), { code: 'ERR_AUTH_00003' });
});

test('reopened save preserves unexposed owner attributes, translation identity, SEO and sibling Media', async () => {
    const f = savedPageFixture();
    const value = (await designer.getDraftComposition(f.request)).result;
    value.draft.sections[0].components[0].properties.title = 'Updated';
    await designer.saveDraftComposition({ ...f.request, body: value.draft });
    const saved = name => f.writes.find(write => write.serviceName === name).model;
    assert.deepEqual(saved('DefaultCmsPageService').seo, { title: 'Retained page SEO' });
    assert.deepEqual(saved('DefaultCmsComponentService').customExtension, { retained: true });
    assert.deepEqual(saved('DefaultCmsComponentService').properties.extension, { retained: true });
    assert.deepEqual(saved('DefaultCmsComponentDetailService').layout, { retained: true });
    assert.equal(saved('DefaultCmsComponentLocalizationService').code, 'original-translation-identity');
    assert.deepEqual(saved('DefaultCmsComponentLocalizationService').seo, { title: 'Translation SEO' });
    assert.equal(saved('DefaultCmsComponentMediaService').code, 'original-media-identity');
});

test('stale or absent saved-source evidence rejects before the first write', async () => {
    const f = savedPageFixture();
    const value = (await designer.getDraftComposition(f.request)).result;
    const latest = { ...f.rows.DefaultCmsComponentService[0], versionId: 1, properties: { title: 'Another author' } };
    f.rows.DefaultCmsComponentService.push(latest);
    await assert.rejects(designer.saveDraftComposition({ ...f.request, body: value.draft }), { code: 'ERR_CMS_00111' });
    delete value.draft.sourceVersion;
    await assert.rejects(designer.saveDraftComposition({ ...f.request, body: value.draft }), { code: 'ERR_CMS_00111' });
    assert.equal(f.writes.length, 0);
});

test('unsupported embedded references and multiple routes cannot be flattened by saved editing', async () => {
    for (const change of [
        f => { f.rows.DefaultCmsPageService[0].cmsComponents = ['embedded']; },
        f => { f.rows.DefaultCmsComponentService[0].subComponents = ['nested']; },
        f => { f.rows.DefaultCmsPageRouteService.push(...['route-a', 'route-b'].map(code => ({ code, page: 'page-a', site: 'site-a', path: `/${code}`, active: true, versionId: 0, authoringScope: f.scope }))); }
    ]) {
        const f = savedPageFixture(); change(f);
        const value = (await designer.getDraftComposition(f.request)).result;
        assert.equal(value.editable, false); assert(value.issues.length);
        // A caller cannot turn a read-only owner projection into an editable one.
        await assert.rejects(designer.saveDraftComposition({ ...f.request, body: value.draft }), error => ['ERR_CMS_00111', 'ERR_CMS_00105'].includes(error.code));
        assert.equal(f.writes.length, 0);
    }
});

test('retired heads are not resurrected and tied version history is rejected', async () => {
    const f = savedPageFixture();
    f.rows.DefaultCmsComponentDetailService.push({ ...f.rows.DefaultCmsComponentDetailService[0], versionId: 1, active: false });
    assert.equal((await designer.getDraftComposition(f.request)).result.draft.sections.length, 0);
    f.rows.DefaultCmsPageService.push({ ...f.rows.DefaultCmsPageService[0], versionId: 1, active: false });
    assert.deepEqual((await designer.listDraftPages(f.request)).result.pages, []);
    await assert.rejects(designer.getDraftComposition(f.request), { code: 'ERR_CMS_00100' });
    const ambiguous = savedPageFixture();
    ambiguous.rows.DefaultCmsComponentService.push({ ...ambiguous.rows.DefaultCmsComponentService[0] });
    await assert.rejects(designer.getDraftComposition(ambiguous.request), { code: 'ERR_AUTH_00003' });
});

test('saved reads reject foreign relationships, oversized history and Online without writes', async () => {
    for (const change of [
        f => { f.rows.DefaultCmsComponentService[0].authoringScope.catalogCode = 'foreign'; },
        f => { f.rows.DefaultCmsComponentLocalizationService[0].authoringScope.enterpriseCode = 'foreign'; },
        f => { f.rows.DefaultCmsComponentMediaService[0].authoringScope.catalogCode = 'foreign'; },
        f => { f.rows.DefaultCmsComponentDetailService[0].authoringScope.siteCode = 'foreign'; },
        f => { f.rows.DefaultCmsPageService.push(...Array.from({ length: 101 }, (_, index) => ({ ...f.rows.DefaultCmsPageService[0], versionId: index + 1 }))); },
        f => f.stage('ONLINE')
    ]) {
        const f = savedPageFixture(); change(f);
        await assert.rejects(designer.getDraftComposition(f.request), { code: 'ERR_AUTH_00003' });
        assert.equal(f.writes.length, 0);
    }
});

test('saved read HTTP entry uses query selection and original authenticated bearer', async () => {
    const f = savedPageFixture('View');
    global.FACADE = { DefaultCmsDesignerCompositionFacade: require('../src/facade/defaultCmsDesignerCompositionFacade') };
    SERVICE.DefaultCmsDesignerCompositionService = designer;
    const request = { tenant: f.request.tenant, authData: f.request.authData,
        httpRequest: { headers: { authorization: f.request.authorization }, query: { siteCode: 'site-a', catalogCode: 'catalog-a', pageCode: 'page-a' },
            body: { siteCode: 'site-b', catalogCode: 'catalog-b' } } };
    const result = await require('../src/controller/defaultCmsDesignerCompositionController').getDraftComposition(request);
    assert.equal(result.result.draft.page.code, 'page-a');
    assert.equal(f.writes.length, 0);
});

test('saved inspection rejects conflicting page identities and malformed content without writes', async () => {
    const alias = savedPageFixture();
    alias.request.body.pageCode = 'another-page';
    await assert.rejects(designer.getDraftComposition(alias.request), { code: 'ERR_AUTH_00003' });
    for (const change of [f => { f.rows.DefaultCmsComponentService[0].properties = ['invalid']; },
        f => { f.rows.DefaultCmsComponentLocalizationService[0].seo = ['invalid']; }]) {
        const f = savedPageFixture(); change(f);
        await assert.rejects(designer.getDraftComposition(f.request), { code: 'ERR_CMS_00100' });
        assert.equal(f.writes.length, 0);
    }
});

test('an authorized complete missing-page read reports typed not-found; foreign ownership remains denied', async () => {
    const missing = fixture('View');
    await assert.rejects(designer.getDraftComposition(missing.request), { code: 'ERR_CMS_00088' });
    assert.equal(missing.writes.length, 0);
    const foreign = savedPageFixture('View');
    foreign.rows.DefaultCmsPageService[0].authoringScope.siteCode = 'foreign';
    await assert.rejects(designer.getDraftComposition(foreign.request), { code: 'ERR_AUTH_00003' });
    assert.equal(foreign.writes.length, 0);
});

test('reopened publication validates saved translations, not omitted or forged caller readiness', async () => {
    const f = savedPageFixture();
    f.rows.DefaultCmsPageRouteService.push({ code: 'route-a', page: 'page-a', site: 'site-a', path: '/page', locale: 'default', channel: 'web', active: true, versionId: 0, authoringScope: f.scope });
    f.rows.DefaultCmsComponentLocalizationService[0].status = 'DRAFT';
    const value = (await designer.getDraftComposition(f.request)).result;
    value.draft.sections[0].components[0].localizations = [];
    await assert.rejects(designer.submitForPublication({ ...f.request, body: value.draft }), { code: 'ERR_CMS_00106' });
    delete value.draft.sourceVersion;
    await assert.rejects(designer.submitForPublication({ ...f.request, body: value.draft }), { code: 'ERR_CMS_00106' });
    value.draft.sourceVersion = value.sourceVersion;
    f.rows.DefaultCmsComponentLocalizationService.push({ ...f.rows.DefaultCmsComponentLocalizationService[0], versionId: 1, status: 'READY' });
    await assert.rejects(designer.submitForPublication({ ...f.request, body: value.draft }), { code: 'ERR_CMS_00111' });
    assert.equal(f.writes.length, 0);
});

test('a composed add-before-existing save frees the old position and preserves actual historical collision checks', async () => {
    const f = savedPageFixture(); f.useRealPlacementValidation();
    f.rows.DefaultCmsComponentDetailService[0].index = 0;
    const value = (await designer.getDraftComposition(f.request)).result;
    value.draft.sections[0].index = 1;
    value.draft.sections.unshift({ slot: 'main', index: 0, components: [{ code: 'new-block', typeCode: 'component-type', renderer: 'renderer', properties: { title: 'New section' }, localizations: [], media: [] }] });
    await designer.saveDraftComposition({ ...f.request, body: value.draft });
    const after = (await designer.getDraftComposition(f.request)).result;
    assert.deepEqual(after.draft.sections.map(section => [section.components[0].code, section.index]), [['new-block', 0], ['block-a', 1]]);
    const writes = f.writes.filter(write => write.serviceName === 'DefaultCmsComponentDetailService');
    assert.deepEqual(writes.map(write => [write.model.code, write.model.index]), [['stable-placement', 2], ['page-a-main-new-block', 0], ['stable-placement', 1]]);
    assert(writes.every(write => write.model.active === true));
    assert.equal(f.rows.DefaultCmsComponentDetailService.filter(row => row.code === 'stable-placement').length, 3);
    assert.equal(after.draft.sections[1].components[0].localizations[0].code, 'original-translation-identity');
});

test('a composed swap preserves both identities and never treats their old active positions as current occupants', async () => {
    const f = savedPageFixture(); f.useRealPlacementValidation();
    f.rows.DefaultCmsComponentDetailService[0].index = 0;
    f.rows.DefaultCmsComponentService.push({ ...f.rows.DefaultCmsComponentService[0], code: 'block-b', properties: { title: 'Second' } });
    f.rows.DefaultCmsComponentDetailService.push({ ...f.rows.DefaultCmsComponentDetailService[0], code: 'second-placement', target: 'block-b', index: 1 });
    const value = (await designer.getDraftComposition(f.request)).result;
    value.draft.sections.reverse(); value.draft.sections.forEach((section, index) => { section.index = index; });
    await designer.saveDraftComposition({ ...f.request, body: value.draft });
    const after = (await designer.getDraftComposition(f.request)).result;
    assert.deepEqual(after.draft.sections.map(section => [section.code, section.index]), [['second-placement', 0], ['stable-placement', 1]]);
    assert.equal(f.rows.DefaultCmsComponentDetailService.length, 6);
    assert(f.rows.DefaultCmsComponentDetailService.every(row => row.active === true));
});

test('omitted occupants, duplicate desired positions and cross-page placement reuse reject before any write', async () => {
    for (const change of [
        value => { value.draft.sections = [{ slot: 'main', index: 7, components: [{ code: 'new-block', typeCode: 'component-type', properties: { title: 'New' } }] }]; },
        value => { value.draft.sections.push({ slot: 'main', index: 7, components: [{ code: 'new-block', typeCode: 'component-type', properties: { title: 'New' } }] }); }
    ]) {
        const f = savedPageFixture(); f.useRealPlacementValidation();
        const value = (await designer.getDraftComposition(f.request)).result; change(value);
        await assert.rejects(designer.saveDraftComposition({ ...f.request, body: value.draft }), { code: 'ERR_CMS_00104' });
        assert.equal(f.writes.length, 0);
    }
    const f = savedPageFixture();
    f.rows.DefaultCmsComponentDetailService.push({ ...f.rows.DefaultCmsComponentDetailService[0], code: 'other-page-placement', source: 'other-page' });
    const value = (await designer.getDraftComposition(f.request)).result;
    value.draft.sections[0].code = 'other-page-placement';
    await assert.rejects(designer.saveDraftComposition({ ...f.request, body: value.draft }), { code: 'ERR_CMS_00104' });
    assert.equal(f.writes.length, 0);
});

test('a failed final placement is not replayed or reported as rollback; old source evidence cannot repeat it', async () => {
    const f = savedPageFixture(); f.useRealPlacementValidation();
    f.rows.DefaultCmsComponentDetailService[0].index = 0;
    const value = (await designer.getDraftComposition(f.request)).result;
    value.draft.sections[0].index = 1;
    value.draft.sections.unshift({ slot: 'main', index: 0, components: [{ code: 'new-block', typeCode: 'component-type', properties: { title: 'New' } }] });
    const save = SERVICE.DefaultCmsComponentDetailService.save; let failed = 0;
    SERVICE.DefaultCmsComponentDetailService.save = async request => {
        if (request.model.code === 'page-a-main-new-block') { failed++; throw new Error('Simulated final placement unavailable'); }
        return save(request);
    };
    await assert.rejects(designer.saveDraftComposition({ ...f.request, body: value.draft }), /Simulated final placement unavailable/);
    assert.equal(failed, 1);
    const partial = (await designer.getDraftComposition(f.request)).result;
    assert.notEqual(partial.sourceVersion, value.sourceVersion);
    assert.deepEqual(partial.draft.sections.map(section => section.index), [2]);
    const count = f.writes.length;
    await assert.rejects(designer.saveDraftComposition({ ...f.request, body: value.draft }), { code: 'ERR_CMS_00111' });
    assert.equal(f.writes.length, count); assert.equal(failed, 1);
});

test('saved graph reads resolve current bindings before filtering out moved placement, translation and route history', async () => {
    const f = savedPageFixture();
    f.rows.DefaultCmsComponentDetailService.push({ ...f.rows.DefaultCmsComponentDetailService[0], versionId: 1, source: 'another-page' });
    assert.equal((await designer.getDraftComposition(f.request)).result.draft.sections.length, 0);
    const g = savedPageFixture();
    g.rows.DefaultCmsComponentLocalizationService.push({ ...g.rows.DefaultCmsComponentLocalizationService[0], versionId: 1, componentCode: 'another-component' });
    g.rows.DefaultCmsPageRouteService.push(...[0, 1].map(versionId => ({ code: 'route-a', page: versionId ? 'another-page' : 'page-a', site: 'site-a', path: '/page', active: true, versionId, authoringScope: g.scope })));
    const result = (await designer.getDraftComposition(g.request)).result;
    assert.equal(result.draft.sections[0].components[0].localizations.length, 0);
    assert.equal(result.draft.route, undefined);
});

test('position validation rejects incomplete, changed-tenant and contradictory generated evidence', async () => {
    const validation = require('../src/service/validation/defaultCmsContractValidationService');
    for (const corrupt of [
        (_read, response) => { response.count++; },
        (_read, response) => { response.code = 'ERR_FIND_00003'; },
        (_read, response) => { response.acknowledged = false; },
        (read) => { read.schemaModel.tenant = 'foreign'; },
        (read) => { read.authData.permissions = []; },
        (read, response) => { if (read.query.code) { response.result.push({ ...response.result[0] }); response.count++; } }
    ]) {
        const f = savedPageFixture(); const get = SERVICE.DefaultCmsComponentDetailService.get;
        SERVICE.DefaultCmsComponentDetailService.get = async read => { const response = await get(read); corrupt(read, response); return response; };
        await assert.rejects(validation.validateAssociation({ tenant: f.request.tenant, authData: structuredClone(f.request.authData),
            model: { code: 'new-placement', source: 'page-a', target: 'new-block', slot: 'main', index: 7 } }), { code: 'ERR_CMS_00104' });
        assert.equal(f.writes.length, 0);
    }
});

test('grouped component intents receive distinct ordered placements and invalid order cannot silently default', async () => {
    const f = fixture(); f.useRealPlacementValidation();
    f.rows.DefaultCmsSlotDefinitionService.push({ code: 'main-slot', name: 'main', template: 'template', active: true });
    const components = ['first', 'second'].map(code => ({ code, typeCode: 'component-type', properties: { title: code } }));
    const body = { ...f.request.body, sections: [{ slot: 'main', components }, { slot: 'main', components: [{ code: 'third', typeCode: 'component-type', properties: { title: 'Third' } }] }] };
    await designer.saveDraftComposition({ ...f.request, body });
    assert.deepEqual(f.writes.filter(write => write.serviceName === 'DefaultCmsComponentDetailService').map(write => write.model.index), [0, 1, 2]);
    for (const index of [-1, Number.MAX_SAFE_INTEGER + 1, 'invalid', null, '', false]) {
        assert.throws(() => designer.normalizeDraft({ ...body, sections: [{ slot: 'main', index, components }] }), { code: 'ERR_CMS_00104' });
    }
});


test('nested composition saves canonical parent placements and faithfully reopens translated child content', async () => {
    const f = savedPageFixture(); f.useRealPlacementValidation();
    const opened = (await designer.getDraftComposition(f.request)).result;
    opened.draft.sections[0].components[0].sections = [{ slot: 'body', index: 0, components: [{
        code: 'nested-child', typeCode: 'component-type', renderer: 'renderer', accessMode: 'PUBLIC',
        properties: { title: 'Child content', retained: { enabled: true } },
        localizations: [{ locale: 'ar', status: 'READY', properties: { title: 'محتوى فرعي' } }], media: []
    }] }];
    const saved = await designer.saveDraftComposition({ ...f.request, body: opened.draft });
    assert.equal(saved.result.evidence.componentCount, 2);
    const childPlacement = f.writes.find(write => write.serviceName === 'DefaultCmsComponentDetailService' && write.model.target === 'nested-child').model;
    assert.equal(childPlacement.source, 'block-a'); assert.equal(childPlacement.authoringScope.siteCode, undefined);
    const reopened = (await designer.getDraftComposition(f.request)).result;
    const child = reopened.draft.sections[0].components[0].sections[0].components[0];
    assert.equal(child.code, 'nested-child'); assert.equal(child.localizations[0].properties.title, 'محتوى فرعي');
    assert.deepEqual(child.properties.retained, { enabled: true });
    assert.notEqual(reopened.sourceVersion, opened.sourceVersion);
    f.writes.length = 0;
    const next = { ...f.rows.DefaultCmsComponentService.find(row => row.code === 'nested-child'), versionId: 1, properties: { title: 'Changed by another author' } };
    f.rows.DefaultCmsComponentService.push(next);
    await assert.rejects(designer.saveDraftComposition({ ...f.request, body: reopened.draft }), { code: 'ERR_CMS_00111' });
    assert.equal(f.writes.length, 0);
});

test('nested cycles, shared identities and foreign children reject before any write', async () => {
    for (const code of ['block-a', 'page-a', 'foreign-child']) {
        const f = savedPageFixture();
        const opened = (await designer.getDraftComposition(f.request)).result;
        if (code === 'foreign-child') f.rows.DefaultCmsComponentService.push({ ...f.rows.DefaultCmsComponentService[0], code, authoringScope: { enterpriseCode:'enterprise-b',catalogCode:'catalog-b' } });
        opened.draft.sections[0].components[0].sections = [{slot:'body',components:[{code,typeCode:'component-type',renderer:'renderer',properties:{title:'Unsafe'}}]}];
        await assert.rejects(designer.saveDraftComposition({ ...f.request, body: opened.draft }), error => ['ERR_AUTH_00003','ERR_CMS_00104'].includes(error.code));
        assert.equal(f.writes.length,0);
    }
    const f = savedPageFixture();
    f.rows.DefaultCmsComponentDetailService.push({ ...f.rows.DefaultCmsComponentDetailService[0],code:'cycle',source:'block-a',authoringScope:{enterpriseCode:'enterprise-a',catalogCode:'catalog-a'} });
    await assert.rejects(designer.getDraftComposition(f.request),{code:'ERR_CMS_00100'});
});

test('Framework nesting limits reject deep or oversized graphs and nested translations remain a publication gate', async () => {
    const f = savedPageFixture(), opened = (await designer.getDraftComposition(f.request)).result;
    let block=opened.draft.sections[0].components[0];
    for(let index=0;index<8;index++){const child={code:'child-'+index,typeCode:'component-type',properties:{title:'Child'}};block.sections=[{slot:'body',components:[child]}];block=child;}
    assert.throws(()=>designer.normalizeDraft(opened.draft),{code:'ERR_CMS_00104'});
    const simple=(await designer.getDraftComposition(f.request)).result.draft;
    simple.route={path:'/nested'};
    simple.sections[0].components[0].sections=[{slot:'body',components:[{code:'unreviewed',typeCode:'component-type',localizations:[{locale:'ar',status:'DRAFT',properties:{title:'Unreviewed'}}]}]}];
    await assert.rejects(designer.validatePublishReadiness.call({...designer,validateDraftGraph:async()=>({})},{...f.request,body:simple}),{code:'ERR_CMS_00106'});
    assert.equal(f.writes.length,0);
});


test('Designer references select current versions and never revive retired heads', async () => {
    const f = fixture();
    f.rows.DefaultCmsTypeCodeService.splice(0, 2,
        { code: 'page-type', kind: 'PAGE', active: true, versionId: 0, authoringScope: f.scope },
        { code: 'page-type', kind: 'PAGE', active: true, versionId: 1, authoringScope: f.scope },
        { code: 'component-type', kind: 'COMPONENT', active: true, versionId: 0, authoringScope: f.scope },
        { code: 'component-type', kind: 'COMPONENT', active: true, versionId: 1, authoringScope: f.scope });
    assert.equal((await designer.getSingle('DefaultCmsTypeCodeService', f.request,
        { code: 'page-type', kind: 'PAGE', active: true }, 'ERR_CMS_00100')).versionId, 1);
    assert.equal((await designer.authoringMetadata(f.request)).componentTypes.filter(row => row.code === 'component-type').length, 1);
    f.rows.DefaultCmsTypeCodeService.push({ code: 'component-type', kind: 'COMPONENT', active: false, versionId: 2, authoringScope: f.scope });
    await assert.rejects(designer.validateComponentForSlot(f.request, { code: 'child', typeCode: 'component-type', localizations: [] }, {}), { code: 'ERR_CMS_00100' });
    assert.equal((await designer.authoringMetadata(f.request)).componentTypes.length, 0);
    assert.equal(f.writes.length, 0);
});

test('Designer admits declared renderer aliases and active canonical mappings only', async () => {
    const f = fixture();
    const original = CONFIG.get;
    CONFIG.get = key => key === 'cms' ? { designerAuthoring: { componentKinds: [
        { typeCode: 'component-type', renderer: 'example.alias', label: 'Content', fields: [] }
    ] } } : original(key);
    const mappings = [{ code: 'component-type', renderer: 'example.canonical', active: true, versionId: 0, authoringScope: f.scope }];
    SERVICE.DefaultCmsTypeCode2RendererService = { get: async request => { request.schemaModel = { tenant: request.tenant }; const result = mappings.filter(row => access.queryMatches(row, request.query)); return { code: 'SUC_FIND_00000', query: request.query, count: result.length, result }; } };
    for (const renderer of ['example.alias', 'example.canonical'])
        await designer.validateComponentForSlot(f.request, { code: 'child', typeCode: 'component-type', renderer, localizations: [] }, {});
    await assert.rejects(designer.validateComponentForSlot(f.request,
        { code: 'child', typeCode: 'component-type', renderer: 'unregistered.renderer', localizations: [] }, {}), { code: 'ERR_CMS_00100' });
    assert.equal(f.writes.length, 0);
});

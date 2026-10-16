/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module wasteCore/test/wasteBusinessWorkbench @description Real groups, secured owner controller, metadata/query utilities and generated service reads over isolated provider doubles. @layer test @owner wasteCore */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), Module = require('node:module'), path = require('node:path'), _ = require('lodash');
const foundation = '../../../../nodics.foundation/modules/';
const owner = require('../src/service/defaultWasteBusinessWorkbenchService');
const persistence = require('../src/service/defaultWastePersistenceService');
const operational = require('../src/service/defaultWasteOperationalAccessService');
const controller = require('../../wasteApi/src/controller/defaultWasteBusinessWorkbenchController');
const routes = require('../../wasteApi/src/router/routers').wasteApi.businessWorkbench;
const security = require(foundation + 'nRouter/src/service/request/defaultSecuredRequestPipelineService');
const access = require(foundation + 'nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
const identity = require(foundation + 'nAuth/src/service/identity/defaultIdentityGovernanceService');
const utility = require(foundation + 'nDatabase/database/src/service/schema/defaultSchemaUtilityService');
const safeQuery = require(foundation + 'nDatabase/database/src/service/schema/defaultSchemaSafeQueryService');
const defaults = require(foundation + 'nDatabase/database/config/properties');
const base = require(foundation + 'nDatabase/database/src/schemas/schemas').default;
const getInitializer = require(foundation + 'nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
const properties = require('../config/properties');
const groups = require('../data/init-v001/records/identity/wasteCoreBusinessAccessGroupData');
const roles = require('../data/init-v001/records/identity/wasteCoreBusinessAccessRoleData');

function matches(row, query) {
    return Object.entries(query).every(([field, value]) => {
        if (field === '$and') return value.every(part => matches(row, part));
        if (field === '$or') return value.some(part => matches(row, part));
        if (field === '$nor') return !value.some(part => matches(row, part));
        const actual = _.get(row, field);
        if (value && typeof value === 'object') return Object.entries(value).every(([operator, expected]) => {
            if (operator === '$in') return expected.includes(actual);
            if (operator === '$nin') return !expected.includes(actual);
            if (operator === '$exists') return (actual !== undefined) === expected;
            if (operator === '$regex') return new RegExp(expected, value.$options).test(actual);
            return operator === '$options';
        });
        return value === null ? actual == null : actual === value;
    });
}

function generated(schema, moduleName) {
    const filename = require.resolve(foundation + 'nService/src/service/common');
    let source = fs.readFileSync(filename, 'utf8');
    const title = schema[0].toUpperCase() + schema.slice(1);
    for (const [key, value] of Object.entries({ schmanm: schema, mdulnm: moduleName, mdlnm: title + 'Model',
        srvcName: 'Default' + title + 'Service', dsdName: 'Default' + title + 'Facade' })) source = source.replaceAll(key, value);
    const compiled = new Module(filename, module); compiled.paths = module.paths; compiled._compile(source, filename);
    return compiled.exports;
}

function fixture(t, level = 'view') {
    const saved = Object.fromEntries(['SERVICE', 'CONFIG', 'NODICS', 'UTILS', 'CLASSES'].map(key => [key, global[key]]));
    t.after(() => { for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete global[key]; else global[key] = value; } });
    const config = { ...structuredClone(defaults), waste: structuredClone(properties.waste), defaultPageSize: 25, defaultPageNumber: 1,
        identityGovernance: { systemAccessGroups: ['serviceAccountUserGroup'] }, routeActionAuthorization: { enabled: true, strict: true } };
    const modules = {}, models = {}, rows = {}, calls = [], scopeCalls = [], modelSelections = [];
    const partitions = { 'tenant-a': {}, 'tenant-b': {} };
    const reader = { ...getInitializer, LOG: { debug() {} } };
    global.CONFIG = { get: key => config[key] };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
    global.UTILS = { ...require(foundation + 'nCommon/src/utils/utils'), isBlank: value => value == null || !Object.keys(value).length,
        isObject: value => value !== null && typeof value === 'object', isArray: Array.isArray };
    global.SERVICE = { DefaultWasteBusinessWorkbenchService: owner, DefaultWasteOperationalAccessService: operational,
        DefaultWastePersistenceService: persistence, DefaultIdentityGovernanceService: identity,
        DefaultSecuredRequestPipelineService: security, DefaultSchemaAccessHandlerService: access,
        DefaultSchemaUtilityService: utility, DefaultSchemaSafeQueryService: safeQuery,
        DefaultSchemaAuthoringPolicyService: require(foundation + 'nDatabase/database/src/service/schema/defaultSchemaAuthoringPolicyService'),
        DefaultRecordOwnershipPolicyService: require(foundation + 'nDatabase/database/src/service/access/defaultRecordOwnershipPolicyService'),
        DefaultBackofficeCapabilityDefinitionService: require(foundation + 'nService/src/service/module/defaultBackofficeCapabilityDefinitionService') };
    let inject = () => {}, scopes = { principalCode: 'employee-a', scopes: [{ scopeType: 'BUSINESS_UNIT', scopeCode: 'point-a' }], deniedScopes: [] };
    SERVICE.DefaultModuleService = { invokeModule: async request => { scopeCalls.push(request); return { data: structuredClone(scopes) }; } };
    const names = ['wasteCore', 'wasteCollection', 'wasteSubmission', 'wasteReceipt', 'wasteVerification', 'wasteImpact'];
    for (const moduleName of names) {
        modules[moduleName] = { rawSchema: {} };
        partitions['tenant-a'][moduleName] = {};
        partitions['tenant-b'][moduleName] = {};
        const authored = require(path.resolve(__dirname, '../../', moduleName, 'src/schemas/schemas'))[moduleName];
        const policy = require(path.resolve(__dirname, '../../', moduleName, 'config/properties')).schemaPolicies[moduleName].operational;
        for (const [name, schema] of Object.entries(authored)) {
            if (!owner.supports(name)) continue;
            const raw = _.merge({}, base.super, base.base, schema, policy);
            modules[moduleName].rawSchema[name] = raw;
            const title = name[0].toUpperCase() + name.slice(1);
            models[title + 'Model'] = { rawSchema: raw, primaryKey: 'code', schemaName: name,
                async getItems(request) {
                    const { query, searchOptions: options } = request;
                    const found = (rows[name] || []).filter(row => matches(row, query));
                    assert(Number.isSafeInteger(options.limit)); assert(Number.isSafeInteger(options.skip));
                    return { result: structuredClone(found.slice(options.skip, options.skip + options.limit)), count: found.length };
                } };
            partitions['tenant-a'][moduleName][title + 'Model'] = models[title + 'Model'];
            partitions['tenant-b'][moduleName][title + 'Model'] = { ...models[title + 'Model'],
                getItems: async () => assert.fail('Foreign tenant model must never be read') };
            SERVICE['Default' + title + 'Service'] = generated(name, moduleName);
        }
    }
    global.NODICS = { getServerState: () => 'started', isModuleActive: name => Boolean(modules[name]) || name === 'wasteApi',
        getModule: name => modules[name], getModels: (moduleName, tenant) => {
            modelSelections.push({ moduleName, tenant });
            return partitions[tenant]?.[moduleName];
        },
        getRouters: name => name === 'wasteApi' ? routes : {} };
    SERVICE.DefaultPipelineService = { start: async (pipeline, request) => {
        assert.equal(pipeline, 'modelsGetInitializerPipeline');
        assert.equal(request.schemaModel, models[request.schemaModel.schemaName[0].toUpperCase() + request.schemaModel.schemaName.slice(1) + 'Model']);
        calls.push({ tenant: request.tenant, auth: structuredClone(request.authData), query: structuredClone(request.query), schema: request.schemaModel.schemaName });
        const response = {};
        for (const step of ['checkAccess', 'buildOptions', 'executeQuery']) await new Promise((resolve, reject) =>
            reader[step](request, response, { nextSuccess: resolve, error: (_r, _s, error) => reject(error) }));
        await inject(request, response.success);
        return response.success;
    } };
    const role = Object.values(roles).find(row => row.accessLevel === level), group = Object.values(groups).find(row => row.code === role.groupCodes[0]);
    const axis = Object.values(require('../../../../nodics.platform/modules/axis/data/init-v001/records/identity/axisUserGroupData')).find(row => row.code === 'axisOperationalUserGroup');
    const profile = Object.values(require('../../../../nodics.platform/modules/profile/data/init-v001/records/identity/profileUserGroupData'));
    const byCode = new Map([...profile, axis, group].map(row => [row.code, row]));
    const hydrate = code => { const row = structuredClone(byCode.get(code)); assert(row, code); return { ...row, parentGroups: (row.parentGroups || []).map(hydrate) }; };
    const request = { tenant: 'tenant-a', moduleName: 'wasteApi', authorization: 'Bearer opaque-original',
        authData: { tenant: 'tenant-a', entCode: 'enterprise-a', principalType: 'human', tokenType: 'access', loginId: 'employee-a',
            userGroups: [hydrate(group.code)], permissions: [] }, httpRequest: { params: { schemaName: 'wasteAsset' }, body: { query: {} } } };
    const point = (code, enterprise = 'enterprise-a') => ({ code, operatorEnterpriseRef: { module: 'profile', schema: 'enterprise', code: enterprise } });
    rows.wasteCollectionPoint = [point('point-a'), point('point-b'), point('point-foreign', 'enterprise-b')];
    rows.wasteSubmission = [{ code: 'sub-a', preferredCollectionPointCode: 'point-a', submissionStatus: 'APPROVED' },
        { code: 'sub-b', preferredCollectionPointCode: 'point-b' }];
    rows.wasteAsset = [{ code: 'asset-a', sourceSubmissionCode: 'sub-a', assetTypeCode: 'device', assetStatus: 'OWNED', revision: 2,
        evidenceRefs: [{ private: true }], ownerRef: { code: 'private-customer' } }, { code: 'asset-b', sourceSubmissionCode: 'sub-b' }];
    return { request, config, rows, calls, scopeCalls, scopes, models, modelSelections, setInject(fn) { inject = fn; }, setScopes(value) { scopes = value; } };
}

function run(f, operation, body = {}, schema = 'wasteAsset') {
    f.request.httpRequest = { body, params: { schemaName: schema } };
    f.request.router = routes[operation];
    return new Promise((resolve, reject) => security.checkAccess(f.request, {}, {
        nextSuccess: () => controller[operation](f.request).then(resolve, reject), error: (_r, _s, error) => reject(error) }));
}

for (const level of ['view', 'edit', 'fullControl']) test('real ' + level + ' group reads owner descriptors and scoped generated data without system schema permissions', async t => {
    const f = fixture(t, level), auth = structuredClone(f.request.authData);
    const descriptor = (await run(f, 'capabilities')).data;
    assert.equal(descriptor.moduleName, 'wasteApi'); assert.equal(descriptor.schemaName, 'wasteAsset');
    assert.deepEqual(descriptor.operations, ['read', 'search']); assert.equal(descriptor.mutationMode, 'READ_ONLY');
    assert.deepEqual(descriptor.relationships, []); assert.deepEqual(descriptor.bulkCapabilities.operations, []);
    assert(descriptor.bulkCapabilities.maximumItems > 0); assert(descriptor.form.defaultColumns.length > 0);
    assert.equal(descriptor.apiOperations.search.path, '/business/waste/wasteAsset/search');
    assert.equal(descriptor.apiOperations.create.active, false);
    for (const [operation, method] of Object.entries({ create: 'PUT', update: 'PATCH', delete: 'DELETE', deleteImpact: 'POST', bulk: 'POST' })) {
        assert.equal(descriptor.apiOperations[operation].method, method);
        assert.equal(descriptor.apiOperations[operation].active, false);
    }
    assert.equal(descriptor.form.contractVersion, 1);
    for (const key of ['sections', 'hiddenFields', 'managedCreateFields', 'defaultColumns']) assert(Array.isArray(descriptor.form[key]));
    assert.equal(typeof descriptor.form.copy, 'object');
    assert.equal(access.getAccessPoint(f.request.authData, properties.schemaPolicies.wasteCore.operational.accessGroups, f.request), 0);
    assert.equal((await run(f, 'schemas')).data.schemas.length, 9);
    const result = (await run(f, 'search', { query: {} })).data;
    assert.deepEqual(result.records.map(row => row.code), ['asset-a']); assert.equal(result.totalCount, 1);
    assert(!JSON.stringify(result).includes('private')); assert.deepEqual(f.request.authData, auth);
    assert(f.calls.every(call => call.tenant === 'tenant-a' && call.auth.isSystem === true));
    assert(f.scopeCalls.every(call => call.header.Authorization === 'Bearer opaque-original' && call.header['X-Enterprise-Code'] === 'enterprise-a'));
    assert(!security.getGrantedPermissions(f.request).includes('system.schema.view'));
});

test('signed scope, original human proof and foreign provider rows fail closed', async t => {
    const f = fixture(t);
    for (const change of [{ tenant: 'other' }, { entCode: 'other' }, { authorization: '' }]) {
        const request = { ...f.request, ...change };
        await assert.rejects(controller.search(request), /SCOPE/);
    }
    for (const change of [{ principalType: 'service' }, { tokenType: 'service' }, { isSystem: true }, { runtimeScope: {} }, { enterpriseCode: 'foreign' }]) {
        await assert.rejects(controller.search({ ...f.request, authData: { ...f.request.authData, ...change } }), /SCOPE/);
    }
    for (const [schema, row] of [['wasteCollectionPoint', { code: 'point-a', operatorEnterpriseRef: { code: 'enterprise-b' } }],
        ['wasteSubmission', { code: 'sub-a', preferredCollectionPointCode: 'point-b' }],
        ['wasteAsset', { code: 'asset-a', sourceSubmissionCode: 'sub-b' }],
        ['wasteAsset', { code: 'asset-a', sourceSubmissionCode: 'sub-a', tenant: 'foreign' }]]) {
        f.setInject((request, result) => { if (request.schemaModel.schemaName === schema) result.result = [row]; });
        await assert.rejects(run(f, 'search', { query: {} }), /PROVIDER_SCOPE/);
    }
});

test('Profile denied collection scopes override allows and global scopes retain enterprise ceiling', async t => {
    const f = fixture(t);
    f.scopes.scopes = [{ scopeType: 'GLOBAL', scopeCode: '*' }];
    const result = (await run(f, 'search', { query: {} }, 'wasteCollectionPoint')).data;
    assert.deepEqual(result.records.map(row => row.code), ['point-a', 'point-b']);
    f.scopes.deniedScopes = [{ scopeType: 'BUSINESS_UNIT', scopeCode: 'point-a' }];
    assert.deepEqual((await run(f, 'search', { query: {} }, 'wasteCollectionPoint')).data.records.map(row => row.code), ['point-b']);
    f.scopes.deniedScopes = [{ scopeType: 'ENTERPRISE', scopeCode: 'enterprise-a' }];
    await assert.rejects(run(f, 'search', { query: {} }), /SCOPE/);
});

test('unknown resources, raw operators, ownership aliases and oversized scope sets cannot widen queries', async t => {
    const f = fixture(t);
    await assert.rejects(run(f, 'capabilities', {}, 'wasteLifecyclePolicy'), /UNQUALIFIED_SCHEMA/);
    for (const body of [{ tenant: 'foreign' }, { query: { tenant: 'foreign' } }, { query: { $or: [] } },
        { query: { filters: { field: 'sourceSubmissionCode', operator: 'EQ', value: 'sub-b' } } }]) await assert.rejects(run(f, 'search', body));
    f.config.waste.operations.maximumScopePoints = 1;
    f.scopes.scopes = [{ scopeType: 'ENTERPRISE', scopeCode: 'enterprise-a' }];
    await assert.rejects(run(f, 'search', { query: {} }), /SCOPE_LIMIT/);
});

test('awaited permission, profile-scope and provider-partition drift reject before disclosure', async t => {
    const f = fixture(t);
    f.setInject((request) => { if (request.schemaModel.schemaName === 'wasteAsset') request.tenant = 'foreign'; });
    await assert.rejects(run(f, 'search', { query: {} }), /PROVIDER_SCOPE/);
    f.setInject((request) => { if (request.schemaModel.schemaName === 'wasteAsset') f.scopes.scopes = []; });
    await assert.rejects(run(f, 'search', { query: {} }), /SCOPE/);
});

test('Workbench metadata uses the same Waste API target and complete shared descriptor contract', t => {
    fixture(t);
    for (const route of Object.values(routes)) {
        assert.equal(route.apiVersion, 'v0'); assert.equal(route.cache.enabled, false);
        assert.equal(route.secured, true); assert.deepEqual(route.authTokenTypes, ['access']);
        assert.equal(route.permission, 'waste.backoffice.view');
    }
    const capability = require('../src/service/defaultWasteBackofficeCapabilityService').getCapability();
    const rows = capability.navigation.filter(row => row.workbenchPresentation?.schemaDiscovery);
    assert.deepEqual(rows.map(row => row.workbenchTarget.schemaName).sort(), [
        'wasteCollectionPoint', 'wasteSubmission', 'wasteVerification', 'wasteReceipt',
        'wasteAsset', 'wasteAssetOwnershipEvent', 'wasteAssetMarketplaceProjection',
    ].sort());
    for (const row of rows) {
        assert.equal(row.workbenchTarget.moduleName, 'wasteApi');
        assert.deepEqual(row.workbenchPresentation.schemaDiscovery, { path: '/business/waste/schemas', apiVersion: 'v0' });
        assert(row.workbenchPresentation.defaultColumns.every(field => owner.readFields(row.workbenchTarget.schemaName).includes(field)));
    }
    const policy = capability.navigation.find(row => row.id === 'waste-management');
    assert.equal(policy.workbenchPresentation.schemaDiscovery, undefined);
});

test('every qualified relationship rejects foreign rows and retains only its owner disclosure fields', async t => {
    const f = fixture(t);
    const links = {
        wasteReceipt: { submissionCode: 'sub-a', collectionPointCode: 'point-a' },
        wasteVerification: { submissionCode: 'sub-a' }, wasteMetadataSuggestion: { submissionCode: 'sub-a' },
        wasteAssetOwnershipEvent: { assetCode: 'asset-a' }, wasteAssetMarketplaceProjection: { assetCode: 'asset-a' },
        wasteImpactSelection: { assetCode: 'asset-a' },
    };
    for (const [schema, link] of Object.entries(links)) {
        f.rows[schema] = [{ code: schema + '-a', ...link, evidence: { secret: true } },
            { code: schema + '-b', ...Object.fromEntries(Object.keys(link).map(key => [key, key === 'assetCode' ? 'asset-b' : key === 'submissionCode' ? 'sub-b' : 'point-b'])) }];
        const result = (await run(f, 'search', { query: {} }, schema)).data;
        assert.deepEqual(result.records.map(row => row.code), [schema + '-a']);
        assert(!JSON.stringify(result).includes('secret'));
        f.setInject((request, response) => { if (request.schemaModel.schemaName === schema) response.result = [f.rows[schema][1]]; });
        await assert.rejects(run(f, 'search', { query: {} }, schema), /PROVIDER_SCOPE/);
        f.setInject(() => {});
    }
    f.rows.wasteSubmission = [{ code: 'stale', preferredCollectionPointCode: 'point-b', confirmedFacts: { preferredCollectionPointCode: 'point-a' } },
        { code: 'confirmed', confirmedFacts: { preferredCollectionPointCode: 'point-a' } }];
    assert.deepEqual((await run(f, 'search', { query: {} }, 'wasteSubmission')).data.records.map(row => row.code), ['confirmed']);
});

test('No access and permission revocation deny the actual owner route before disclosure', async t => {
    const f = fixture(t), original = structuredClone(f.request.authData);
    f.request.authData.userGroups = [{ code: 'employeeUserGroup', permissions: [] }];
    for (const operation of ['schemas', 'capabilities', 'search']) await assert.rejects(run(f, operation));
    assert.equal(f.calls.length, 0);
    f.request.authData = original;
    f.setInject(() => { f.request.authData.userGroups = []; });
    await assert.rejects(run(f, 'search', { query: {} }), /SCOPE/);
});

test('shared page settings cannot exceed owner bounds and incomplete scope pages never authorize', async t => {
    const f = fixture(t);
    f.config.schemaApi.maximumPageSize = 10000;
    f.config.schemaApi.allowedPageSizes = [25, 100, 10000];
    const descriptor = (await run(f, 'capabilities')).data;
    assert.equal(descriptor.queryCapabilities.maximumPageSize, 100);
    assert.deepEqual(descriptor.queryCapabilities.allowedPageSizes, [25, 100]);
    await assert.rejects(run(f, 'search', { query: { pageSize: 10000 } }));
    f.config.schemaApi.maximumBulkItems = -1;
    await assert.rejects(run(f, 'capabilities'), /UNAVAILABLE/);
    f.config.schemaApi.maximumBulkItems = 100;
    f.setInject((_request, response) => { response.count = 1; response.result = []; });
    await assert.rejects(run(f, 'schemas'), /PROVIDER_SCOPE/);
});

test('owner persistence preserves generated CAS writes with canonical identity, never invented service groups', async t => {
    const f = fixture(t, 'edit'), auth = structuredClone(f.request.authData), writes = [];
    const repository = SERVICE.DefaultWasteAssetService;
    repository.update = async request => { writes.push(request); };
    await persistence.update('wasteAsset', f.request, { code: 'asset-a', revision: 2 }, { assetStatus: 'LOCKED' });
    assert.deepEqual(writes[0].authData, identity.getSystemAuthData());
    assert.deepEqual(writes[0].query, { code: 'asset-a', revision: 2 });
    assert.equal(writes[0].authData.loginId, undefined); assert.deepEqual(f.request.authData, auth);
    delete SERVICE.DefaultIdentityGovernanceService;
    assert.throws(() => persistence.context(f.request), /Canonical persistence authority/);
});

test('generated model selection supplies the tenant partition without invented row tenant fields', async t => {
    const f = fixture(t);
    for (const model of Object.values(f.models)) {
        assert.equal(model.rawSchema.definition.tenant, undefined);
        assert.equal(model.rawSchema.definition.tenantCode, undefined);
    }
    for (const rows of Object.values(f.rows)) for (const row of rows) assert.equal(row.tenant, undefined);
    assert.deepEqual((await run(f, 'search', { query: {} })).data.records.map(row => row.code), ['asset-a']);
    assert(f.modelSelections.length > 0);
    assert(f.modelSelections.every(selection => selection.tenant === 'tenant-a'));
    assert.deepEqual([...new Set(f.modelSelections.map(selection => selection.moduleName))].sort(), ['wasteCollection', 'wasteCore', 'wasteSubmission']);
});

test('plausible scoped rows cannot override a failed or missing generated success envelope', async t => {
    const f = fixture(t);
    const failures = [{ code: 'ERR_FIND_00003' }, { code: undefined }, { code: 'SUC_GET' },
        { error: { private: 'failure' } }, { errors: ['private failure'] }, { errors: {} },
        { success: false }, { success: 1 }, { acknowledged: false }, { acknowledged: 'true' }];
    for (const schema of ['wasteCollectionPoint', 'wasteSubmission', 'wasteAsset']) for (const failure of failures) {
        f.setInject((request, response) => { if (request.schemaModel.schemaName === schema) Object.assign(response, failure); });
        await assert.rejects(run(f, 'search', { query: {} }), { code: 'ERR_WASTE_WORKBENCH_PROVIDER_OUTCOME' });
    }
    f.setInject((_request, response) => Object.assign(response, { success: true, acknowledged: true, error: null, errors: [] }));
    assert.equal((await run(f, 'search', { query: {} })).data.records[0].code, 'asset-a');
});

test('scalar disclosure rejects nested provider structures while localized names stay flat', async t => {
    const f = fixture(t);
    for (const value of [{ private: { evidence: 'secret' } }, ['secret'], new Date(), Infinity]) {
        f.rows.wasteAsset[0].assetStatus = value;
        await assert.rejects(run(f, 'search', { query: {} }), { code: 'ERR_WASTE_WORKBENCH_PROVIDER_FIELD' });
    }
    f.rows.wasteCollectionPoint[0].status = { private: 'secret' };
    await assert.rejects(run(f, 'search', { query: {} }, 'wasteCollectionPoint'), { code: 'ERR_WASTE_WORKBENCH_PROVIDER_FIELD' });
    delete f.rows.wasteCollectionPoint[0].status;
    f.rows.wasteCollectionPoint[0].name = { en: { private: 'secret' } };
    await assert.rejects(run(f, 'search', { query: {} }, 'wasteCollectionPoint'), { code: 'ERR_WASTE_WORKBENCH_PROVIDER_FIELD' });
    f.rows.wasteCollectionPoint[0].name = { en: 'Collection centre', fr: 'Centre' };
    assert.deepEqual((await run(f, 'search', { query: {} }, 'wasteCollectionPoint')).data.records[0].name, f.rows.wasteCollectionPoint[0].name);
});

test('conflicting tenant aliases and malformed group ancestry fail before Profile or persistence', async t => {
    const f = fixture(t), original = structuredClone(f.request.authData);
    await assert.rejects(controller.search({ ...f.request, tenantCode: 'tenant-b' }), { code: 'ERR_WASTE_WORKBENCH_SCOPE' });
    await assert.rejects(controller.search({ ...f.request, authData: { ...original, tenantCode: 'tenant-b' } }), { code: 'ERR_WASTE_WORKBENCH_SCOPE' });
    const cyclic = { code: 'employeeUserGroup' }; cyclic.parentGroups = [cyclic];
    for (const userGroups of [null, {}, 'employeeUserGroup', [null], [7], new Array(1), [cyclic],
        [{ code: 'employeeUserGroup', active: 'true' }], [{ code: 'employeeUserGroup', permissions: {} }],
        [{ code: 'employeeUserGroup', permissions: [{}] }], [{ code: 'employeeUserGroup', parentGroups: 'adminGroup' }]]) {
        await assert.rejects(controller.search({ ...f.request, authData: { ...original, userGroups } }), { code: 'ERR_WASTE_WORKBENCH_SCOPE' });
    }
    assert.equal(f.calls.length, 0); assert.equal(f.scopeCalls.length, 0);
});

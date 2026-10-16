/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module product/test/productBusinessAuthoring @description Actual access records, compiled generated service, base/vService pipeline steps and vMongodb provider with isolated driver I/O. Not live qualification. @layer test @owner product */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), Module = require('node:module');
const _ = require('lodash');
const owner = require('../src/service/defaultProductBusinessAuthoringService');
const controller = require('../src/controller/defaultProductBusinessAuthoringController');
const properties = require('../config/properties'), schemas = require('../src/schemas/schemas').product;
const groups = require('../data/init-v001/records/identity/productBusinessAccessGroupData');
const roles = require('../data/init-v001/records/identity/productBusinessAccessRoleData');
const publisher = require('../data/init-v001/records/identity/productUserGroupData');
const permissions = require('../data/init-v001/records/identity/productPermissionData');
const routes = require('../src/router/routers').product.businessAuthoring;
const capability = require('../src/service/defaultProductBackofficeCapabilityService');
const foundation = '../../../../../../nodics.foundation/modules/';
const db = foundation + 'nDatabase/database/';
const security = require(foundation + 'nRouter/src/service/request/defaultSecuredRequestPipelineService');
const access = require(db + 'src/service/schema/defaultSchemaAccessHandlerService');
const identity = require(foundation + 'nAuth/src/service/identity/defaultIdentityGovernanceService');
const utility = require(db + 'src/service/schema/defaultSchemaUtilityService');
const authoring = require(db + 'src/service/schema/defaultSchemaAuthoringPolicyService');
const safeQuery = require(db + 'src/service/schema/defaultSchemaSafeQueryService');
const schemaDefaults = require(db + 'config/properties');
const baseSchemas = require(db + 'src/schemas/schemas');
const commonUtils = require(foundation + 'nCommon/src/utils/utils');
const mongodb = require(foundation + 'nDatabase/mongodb/src/schemas/model').default;
const versioned = require(foundation + 'nDatabase/mongodb/vMongodb/src/schemas/model').default;
const saveBase = require(db + 'src/service/procs/save/defaultModelSaveInitializerService');
const updateBase = require(db + 'src/service/procs/update/defaultModelsUpdateInitializerService');
const getBase = require(db + 'src/service/procs/get/defaultModelsGetInitializerService');
const saveVersion = require(foundation + 'nService/vService/src/service/procs/save/defaultModelSaveInitializerService');
const updateVersion = require(foundation + 'nService/vService/src/service/procs/update/defaultModelsUpdateInitializerService');
const getVersion = require(foundation + 'nService/vService/src/service/procs/get/defaultModelsGetInitializerService');

function generatedService() {
    const filename = require.resolve(foundation + 'nService/src/service/common.js');
    let source = fs.readFileSync(filename, 'utf8');
    for (const [key, value] of Object.entries({ schmanm: 'product', mdulnm: 'product', mdlnm: 'ProductModel',
        srvcName: 'DefaultProductService', dsdName: 'DefaultProductFacade' })) source = source.replaceAll(key, value);
    const compiled = new Module(filename, module); compiled.paths = module.paths; compiled._compile(source, filename);
    return compiled.exports;
}

function matches(row, query) {
    return Object.entries(query).every(([key, value]) => key === '$and' ? value.every(part => matches(row, part)) :
        key === '$or' ? value.some(part => matches(row, part)) : value && typeof value === 'object' ?
            value.$regex !== undefined ? new RegExp(value.$regex, value.$options).test(row[key]) :
                value.$in ? value.$in.includes(row[key]) : value.$ne !== undefined ? row[key] !== value.$ne : false : row[key] === value);
}

function fixture(t, level = 'edit') {
    const before = Object.fromEntries(['SERVICE', 'CONFIG', 'NODICS', 'UTILS', 'CLASSES'].map(key => [key, global[key]]));
    t.after(() => Object.assign(global, before));
    const config = { ...structuredClone(schemaDefaults), product: structuredClone(properties.product),
        runtimeRole: { code: 'COMMERCE_STAGED', publication: 'STAGED' },
        identityGovernance: { systemAccessGroups: ['serviceAccountUserGroup'] }, defaultPageSize: 25, defaultPageNumber: 1 };
    const raw = _.merge({}, baseSchemas.default.super, baseSchemas.default.base, schemas.product,
        { accessGroups: properties.schemaPolicies.product.tenantOwned.accessGroups, versionedReadMode: 'CURRENT' });
    const history = [], calls = [], inserted = [], pipelines = [];
    let afterRead = () => {}, beforeInsert = () => {}, afterWrite = () => {}, generatedResponse = response => response;
    const log = { debug() {}, error() {} };
    const reader = { ...getBase, ...getVersion, LOG: log }, writer = { ...saveBase, ...saveVersion, LOG: log },
        updater = { ...updateBase, ...updateVersion, LOG: log };
    global.CONFIG = { get: key => config[key] };
    global.UTILS = { ...commonUtils, isBlank: value => value == null || (typeof value === 'object' && !Object.keys(value).length),
        isArray: Array.isArray, isObject: value => value !== null && typeof value === 'object' };
    global.CLASSES = { NodicsError: class extends Error {
        constructor(error, message, code) { super(message || error?.message || String(error)); this.code = code || error?.code || error; }
    } };
    const insert = async model => {
        await beforeInsert(model);
        if (history.some(row => row.tenant === model.tenant && row.code === model.code && row.versionId === model.versionId))
            throw Object.assign(new Error('Duplicate immutable identity'), { code: 11000 });
        history.push(structuredClone(model)); inserted.push(structuredClone(model));
        return { acknowledged: true, insertedId: model.code + ':' + model.versionId };
    };
    const wrapper = { ...mongodb, ...versioned, rawSchema: raw, versioned: true, primaryKey: 'code', schemaName: 'product',
        find(query, options = {}) {
            let rows = history.filter(row => row.tenant === 'tenant-a' && matches(row, query)).map(row => structuredClone(row));
            return { sort(sort) { const [key, direction] = Object.entries(sort)[0]; rows.sort((a, b) => direction * (a[key] - b[key])); return this; },
                count: async () => rows.length, toArray: async () => rows.slice(0, options.limit || rows.length) };
        },
        aggregate(pipeline) {
            // Real provider constructs and validates the pipeline; this driver double executes its bounded stages.
            const newest = new Map();
            history.filter(row => row.tenant === 'tenant-a').forEach(row => {
                if (!newest.has(row.code) || newest.get(row.code).versionId < row.versionId) newest.set(row.code, row);
            });
            let rows = [...newest.values()].filter(row => matches(row, pipeline.find(stage => stage.$match).$match));
            const count = rows.length, page = pipeline.find(stage => stage.$facet).$facet.result;
            const sort = page.find(stage => stage.$sort).$sort;
            rows.sort((a, b) => { for (const [key, direction] of Object.entries(sort)) {
                if (a[key] !== b[key]) return direction * (a[key] < b[key] ? -1 : 1);
            } return 0; });
            const skip = page.find(stage => stage.$skip)?.$skip || 0, limit = page.find(stage => stage.$limit).$limit;
            return { toArray: async () => [{ metadata: [{ count }], result: structuredClone(rows.slice(skip, skip + limit)) }] };
        },
        insertOne: insert,
        insertMany: async models => { for (const model of models) await insert(model); return { acknowledged: true, insertedCount: models.length }; },
    };
    const moduleObject = { rawSchema: { product: raw } };
    global.NODICS = { getServerState: () => 'started', getModule: name => name === 'product' ? moduleObject : undefined,
        isModuleActive: () => true, getModels: () => ({ ProductModel: wrapper }), getRouters: () => routes };
    global.SERVICE = { DefaultProductBusinessAuthoringService: owner, DefaultProductService: generatedService(),
        DefaultSchemaUtilityService: utility, DefaultSchemaAuthoringPolicyService: authoring,
        DefaultSchemaSafeQueryService: safeQuery, DefaultSecuredRequestPipelineService: security,
        DefaultIdentityGovernanceService: identity, DefaultSchemaAccessHandlerService: access,
        DefaultModelSaveInitializerService: writer, DefaultModelsUpdateInitializerService: updater, DefaultModelsGetInitializerService: reader,
        DefaultRecordOwnershipPolicyService: require(db + 'src/service/access/defaultRecordOwnershipPolicyService'),
        DefaultBackofficeCapabilityDefinitionService: require(foundation + 'nService/src/service/module/defaultBackofficeCapabilityDefinitionService'),
    };
    SERVICE.DefaultPipelineService = { start: async (pipeline, input) => {
        pipelines.push(pipeline);
        calls.push({ pipeline, tenant: input.tenant, authData: structuredClone(input.authData), query: structuredClone(input.query),
            ...(input.model ? { model: structuredClone(input.model) } : {}) });
        const response = {}, steps = pipeline === 'modelsGetInitializerPipeline' ? ['checkAccess', 'buildOptions', 'executeQuery'] :
            pipeline === 'modelSaveInitializerPipeline' ? ['validateModel', 'checkAccess', 'applyDefaultValues', 'removeVirtualProperties', 'saveModel'] :
                ['checkAccess', 'executeQuery'];
        const processor = pipeline === 'modelsGetInitializerPipeline' ? reader : pipeline === 'modelSaveInitializerPipeline' ? writer : updater;
        for (const step of steps) await new Promise((resolve, reject) => processor[step](input, response,
            { nextSuccess: resolve, error: (_input, _response, error) => reject(error) }));
        if (pipeline === 'modelsGetInitializerPipeline') await afterRead(response.success);
        else await afterWrite(response.success);
        return generatedResponse(response.success, pipeline);
    } };
    const role = Object.values(roles).find(row => row.accessLevel === level);
    const actualGroup = Object.values(groups).find(row => row.code === role.groupCodes[0]);
    // Hydrated persisted group shape, including the actual inherited Axis operational chain.
    const axisGroups = require('../../../../../../nodics.platform/modules/axis/data/init-v001/records/identity/axisUserGroupData');
    const axis = Object.values(axisGroups).find(row => row.code === 'axisOperationalUserGroup');
    assert(axis);
    assert.deepEqual(axis.parentGroups, ['employeeUserGroup']);
    const hydrated = { ...structuredClone(actualGroup), parentGroups: [{ ...structuredClone(axis), parentGroups: [{ code: 'employeeUserGroup', active: true }] }] };
    const request = { tenant: 'tenant-a', entCode: 'enterprise-a', moduleName: 'product',
        authData: { tenant: 'tenant-a', entCode: 'enterprise-a', principalId: 'employee-a', principalType: 'human', tokenType: 'access',
            userGroups: [hydrated], permissions: [] }, httpRequest: { body: {}, params: {} } };
    const seed = (changes = {}) => { const row = { tenant: 'tenant-a', enterpriseCode: 'enterprise-a', code: 'root-a', name: 'Product A',
        catalogVersion: 'catalog-a', status: 'DRAFT', versionId: 0, revision: 0, ...changes }; history.push(row); return row; };
    return { request, config, raw, wrapper, history, calls, inserted, pipelines, seed, actualGroup, role,
        setAfterRead: fn => { afterRead = fn; }, setBeforeInsert: fn => { beforeInsert = fn; }, setAfterWrite: fn => { afterWrite = fn; },
        setGeneratedResponse: fn => { generatedResponse = fn; } };
}

function command(f, operation, body) {
    f.request.httpRequest.body = body;
    return controller[operation](f.request).then(result => result.data);
}
const create = { code: 'root-a', name: 'Product A', catalogVersion: 'catalog-a' };
const update = { query: { code: 'root-a', versionId: 0 }, model: { name: 'Revised' }, options: { recursive: false, returnModified: true } };
const archive = { actionId: 'archiveProduct', identity: { code: 'root-a', versionId: 0 }, idempotencyKey: 'explicit-action-a' };

for (const level of ['view', 'edit', 'fullControl']) test('actual ' + level + ' role exposes scoped descriptor/reads with schema ACL zero', async t => {
    const f = fixture(t, level), original = structuredClone(f.request), descriptor = (await controller.schemas(f.request)).data.schemas[0];
    assert.equal(access.getAccessPoint(f.request.authData, f.raw.accessGroups, f.request), 0);
    assert.deepEqual(descriptor.operations, level === 'view' ? ['read', 'search'] : ['read', 'search', 'create', 'update']);
    assert.equal(descriptor.apiOperations.capabilities.path, '/business/products/capabilities');
    assert.equal(descriptor.apiOperations.create.active, level !== 'view');
    assert.equal(descriptor.concurrency.field, 'versionId'); assert.equal(descriptor.concurrency.managed, true);
    assert.equal(descriptor.apiOperations.delete.active, false); assert.deepEqual(descriptor.relationships, []);
    assert.deepEqual(descriptor.queryCapabilities.filterFields.map(field => field.field), ['code', 'name', 'status', 'catalogVersion']);
    assert.equal(descriptor.mutationPolicy.publishRequired, true);
    assert.deepEqual(descriptor.bulkCapabilities.operations, []);
    assert(Number.isInteger(descriptor.bulkCapabilities.maximumItems) && descriptor.bulkCapabilities.maximumItems > 0);
    assert.equal(descriptor.form.contractVersion, 1);
    for (const name of ['sections', 'hiddenFields', 'managedCreateFields', 'defaultColumns']) assert(Array.isArray(descriptor.form[name]));
    assert.equal(typeof descriptor.form.copy, 'object');
    assert(Object.values(descriptor.form.copy).every(value => typeof value === 'string'));
    assert.deepEqual(f.request, original);
    f.seed(); f.seed({ code: 'foreign', enterpriseCode: 'enterprise-b' }); f.seed({ code: 'neutral', enterpriseCode: undefined });
    f.seed({ code: 'other-tenant', tenant: 'tenant-b' });
    const page = await command(f, 'search', { query: {} });
    assert.deepEqual(page.records.map(row => row.code), ['root-a']); assert.equal(page.totalCount, 1);
    f.request.httpRequest.params.productCode = 'root-a';
    assert.equal((await controller.read(f.request)).data.name, 'Product A');
    assert(f.calls.every(call => call.authData.isSystem === true));
    assert(!JSON.stringify(page).includes('enterprise-a')); assert(!JSON.stringify(page).includes('tenant-a'));
    assert(!f.actualGroup.permissions.includes('commerce.product.publish'));
});

test('actual Axis parser accepts Product owner discovery, capabilities and search envelopes',
    { skip: !process.env.AXIS_WORKBENCH_CONTRACTS }, async t => {
        // Explicit checkout selection keeps standalone framework tests independent of the frontend repository.
        const source = fs.readFileSync(process.env.AXIS_WORKBENCH_CONTRACTS, 'utf8');
        const parser = await import('data:text/javascript;base64,' + Buffer.from(Module.stripTypeScriptTypes(source)).toString('base64'));
        for (const level of ['view', 'edit', 'fullControl']) for (const stage of ['STAGED', 'ONLINE']) {
            await t.test(level + ' ' + stage, async child => {
                const f = fixture(child, level);
                f.config.runtimeRole.publication = stage;
                const discovery = await controller.schemas(f.request);
                const descriptors = parser.parseWorkbenchSchemaList(JSON.parse(JSON.stringify(discovery.data)));
                assert.equal(descriptors.length, 1);
                const capabilities = await controller.capabilities(f.request);
                assert.deepEqual(parser.parseWorkbenchSchema(JSON.parse(JSON.stringify(capabilities.data))), descriptors[0]);
                assert.equal(descriptors[0].operations.includes('create'), stage === 'STAGED' && level !== 'view');
                assert.deepEqual(descriptors[0].bulkCapabilities.operations, []);
                f.seed();
                const page = parser.parseWorkbenchRecordPage(JSON.parse(JSON.stringify((await controller.search(f.request)).data)));
                assert.equal(page.totalCount, 1);
                assert.equal(page.records[0].code, 'root-a');
                const malformed = structuredClone(discovery.data.schemas[0]);
                malformed.bulkCapabilities.maximumItems = 0;
                assert.throws(() => parser.parseWorkbenchSchema(malformed));
                malformed.bulkCapabilities.maximumItems = 100;
                malformed.form = { sections: [] };
                assert.throws(() => parser.parseWorkbenchSchema(malformed));
            });
        }
    });

test('Edit uses real generated version-zero save and successor update without publication or ACL grants', async t => {
    const f = fixture(t), initialAuth = structuredClone(f.request.authData);
    assert.equal((await command(f, 'create', create)).versionId, 0);
    assert.equal((await command(f, 'update', update)).versionId, 1);
    assert.equal(f.history[0].name, 'Product A'); assert.equal(f.history[1].name, 'Revised');
    assert.equal(f.history[1].revision, 1); assert.equal(f.history[1].updatedBy, 'employee-a');
    assert(f.pipelines.includes('modelSaveInitializerPipeline')); assert(f.pipelines.includes('modelsUpdateInitializerPipeline'));
    const write = f.calls.find(call => call.pipeline === 'modelsUpdateInitializerPipeline');
    assert.deepEqual(write.query, { tenant: 'tenant-a', enterpriseCode: 'enterprise-a', code: 'root-a', versionId: 0, revision: 0 });
    assert.deepEqual(f.request.authData, initialAuth);
    await assert.rejects(command(f, 'archive', { ...archive, identity: { code: 'root-a', versionId: 1 } }), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
    assert.equal(f.inserted.length, 2);
});

test('Full control explicitly archives a successor and retains prior Online source evidence untouched', async t => {
    const f = fixture(t, 'fullControl'), seal = { records: [{ code: 'dependency', versionId: 2, hash: 'retained' }] };
    const old = f.seed({ status: 'ACTIVE', publicationReferences: seal }), before = structuredClone(old);
    const result = await command(f, 'archive', { ...archive, model: owner.project(old) });
    assert.equal(result.status, 'ARCHIVED'); assert.equal(result.versionId, 1); assert.equal(result.revision, 1);
    assert.deepEqual(old, before); assert.deepEqual(f.history[1].publicationReferences, seal);
    assert.deepEqual(f.pipelines.filter(name => name !== 'modelsGetInitializerPipeline'), ['modelsUpdateInitializerPipeline']);
    await assert.rejects(command(f, 'update', { ...update, query: { code: 'root-a', versionId: 1 } }), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' });
    assert.equal(f.inserted.length, 1);
});

test('View has no writes, Full control has no publication/approval bypass, explicit publisher group is retained', async t => {
    const f = fixture(t, 'view'); f.seed();
    for (const [op, body] of [['create', create], ['update', update], ['archive', archive]])
        await assert.rejects(command(f, op, body), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
    assert.equal(f.inserted.length, 0);
    for (const group of Object.values(groups)) {
        assert(!group.parentGroups.includes('commerceOperatorUserGroup'));
        assert(!group.permissions.some(code => code.startsWith('system.schema.') || code.startsWith('publish.')));
    }
    assert(publisher.record0.permissions.includes('commerce.product.publish'));
    const catalogue = Object.values(permissions).map(row => row.code);
    assert(catalogue.includes('commerce.product.write')); assert(catalogue.includes('commerce.product.archive'));
});

for (const change of [f => { f.request.tenant = 'tenant-b'; }, f => { f.request.entCode = 'enterprise-b'; },
    f => { f.request.authData.enterpriseCode = 'enterprise-b'; }, f => { f.request.authData.tokenType = 'service'; },
    f => { f.request.authData.principalType = 'customer'; }, f => { f.request.authData.isSystem = true; },
    f => { f.request.authData.userGroups = ['productBusinessEditUserGroup']; }, f => { delete f.request.authData.entCode; }])
    test('unauthorized or contradictory original identity refuses before generated I/O: ' + change.toString(), async t => {
        const f = fixture(t); change(f);
        await assert.rejects(command(f, 'create', create), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
        assert.equal(f.calls.length, 0);
    });

test('Online descriptors remain read-only and all source writes are denied regardless of Full control', async t => {
    const f = fixture(t, 'fullControl'); f.config.runtimeRole.publication = 'ONLINE'; f.seed();
    assert.deepEqual(owner.descriptor(f.request).operations, ['read', 'search']);
    assert.equal(capability.rootActions()[0].featureState, 'DISABLED');
    for (const [op, body] of [['create', create], ['update', update], ['archive', archive]])
        await assert.rejects(command(f, op, body), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
    assert.equal(f.inserted.length, 0);
});

test('unqualified ordinary/history/missing version ports fail closed without enabling schema versioning', async t => {
    const f = fixture(t);
    for (const change of [() => { f.wrapper.versioned = false; }, () => { f.wrapper.rawSchema.versionedReadMode = 'HISTORY'; },
        () => { f.wrapper.updateVersionedItems = undefined; }]) {
        const before = { versioned: f.wrapper.versioned, mode: f.raw.versionedReadMode, update: f.wrapper.updateVersionedItems };
        change(); await assert.rejects(command(f, 'create', create), { code: 'ERR_PRODUCT_AUTHORING_STORAGE' });
        f.wrapper.versioned = before.versioned; f.raw.versionedReadMode = before.mode; f.wrapper.updateVersionedItems = before.update;
    }
    assert.equal(properties.schemaPolicies.product.catalogueVersioned.isVersionedEnabled, false); assert.equal(f.calls.length, 0);
});

test('create rejects scope, proof, counters, query operators and undeclared fields; archive cannot hide in ordinary status', async t => {
    const f = fixture(t, 'fullControl');
    for (const field of ['tenant', 'enterpriseCode', 'versionId', 'revision', 'createdBy', 'updatedBy', 'publicationReferences', 'listingAuthoring', '$set', 'extra'])
        await assert.rejects(command(f, 'create', { ...create, [field]: 'injected' }), { code: 'ERR_PRODUCT_AUTHORING_INPUT' });
    await assert.rejects(command(f, 'create', { ...create, status: 'ARCHIVED' }), { code: 'ERR_PRODUCT_AUTHORING_INPUT' });
    assert.equal(f.calls.length, 0);
    f.seed();
    await assert.rejects(command(f, 'update', { ...update, model: { status: 'ARCHIVED' } }), { code: 'ERR_PRODUCT_AUTHORING_INPUT' });
    await assert.rejects(command(f, 'update', { ...update, options: { upsert: true } }), { code: 'ERR_PRODUCT_AUTHORING_INPUT' });
    await assert.rejects(command(f, 'update', { ...update, query: { code: { $ne: 'x' }, versionId: 0 } }), { code: 'ERR_PRODUCT_AUTHORING_INPUT' });
    assert.equal(f.inserted.length, 0);
});

test('foreign, neutral, stale, archived and marketplace-owned roots cannot be changed', async t => {
    const f = fixture(t, 'fullControl');
    for (const changes of [{ enterpriseCode: 'foreign' }, { enterpriseCode: undefined }, { versionId: 2 },
        { status: 'ARCHIVED' }, { listingAuthoring: { sourceProof: 'retained' } }]) {
        f.history.length = 0; f.seed(changes);
        await assert.rejects(command(f, 'update', update)); await assert.rejects(command(f, 'archive', archive));
        assert.equal(f.inserted.length, 0);
    }
});

test('safe queries cannot inject enterprise filters or raw operators; current grouping precedes filtering', async t => {
    const f = fixture(t, 'view'); f.seed(); f.seed({ versionId: 1, status: 'ARCHIVED' });
    const page = await command(f, 'search', { query: { search: 'Product', pageSize: 10 } });
    assert.equal(page.records.length, 1); assert.equal(page.records[0].versionId, 1);
    for (const query of [{ tenant: 'foreign' }, { $where: 'unsafe' }, { pageNumber: 10001 },
        { filters: { operator: 'AND', conditions: [{ field: 'enterpriseCode', operator: 'EQUALS', value: 'foreign' }] } }])
        await assert.rejects(command(f, 'search', { query }));
});

test('provider scope escape is rejected even when a scoped query was sent', async t => {
    const f = fixture(t); f.seed();
    f.setAfterRead(response => { response.result[0].enterpriseCode = 'foreign'; });
    await assert.rejects(command(f, 'update', update), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' });
    assert.equal(f.inserted.length, 0);
});

test('await-time identity, runtime or schema drift prevents owner writes; copied admission is not authority', async t => {
    const f = fixture(t); f.seed();
    f.setAfterRead(() => { f.request.authData.principalId = 'changed'; });
    await assert.rejects(command(f, 'update', update), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
    assert.equal(f.inserted.length, 0);
    assert.throws(() => owner.local({}), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
    f.request.authData.principalId = 'employee-a'; f.setAfterRead(() => { f.config.runtimeRole.publication = 'ONLINE'; });
    await assert.rejects(command(f, 'update', update), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
    assert.equal(f.inserted.length, 0);
});

test('concurrent edits append only one successor and stale retries never silently advance the version', async t => {
    const f = fixture(t); f.seed();
    let arrivals = 0, release;
    const held = new Promise(resolve => { release = resolve; });
    f.setBeforeInsert(async () => { if (++arrivals === 2) release(); await held; });
    const result = await Promise.allSettled([owner.execute(f.request, 'update', update),
        owner.execute(structuredClone(f.request), 'update', { ...update, model: { name: 'Competitor' } })]);
    assert.equal(result.filter(row => row.status === 'fulfilled').length, 1); assert.equal(f.inserted.length, 1);
    f.setBeforeInsert(() => {});
    await assert.rejects(command(f, 'update', update), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' });
    assert.equal(f.inserted.length, 1);
});

test('post-write outage is not retried or compensated by deletion; reload shows the immutable successor', async t => {
    const f = fixture(t); f.seed(); f.setAfterWrite(() => { throw new Error('simulated response interruption'); });
    await assert.rejects(command(f, 'update', update), /interruption/); assert.equal(f.inserted.length, 1);
    f.setAfterWrite(() => {});
    await assert.rejects(command(f, 'update', update), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' });
    f.request.httpRequest.params.productCode = 'root-a';
    assert.equal((await controller.read(f.request)).data.versionId, 1); assert.equal(f.inserted.length, 1);
});

test('root navigation uses the agreed discovery contract and archive action; child schemas retain their own owners', t => {
    const f = fixture(t), metadata = capability.getCapability();
    for (const id of ['catalog-and-products', 'products']) {
        const item = metadata.navigation.find(row => row.id === id);
        assert.deepEqual(item.workbenchPresentation.schemaDiscovery, { path: '/business/products/schemas', apiVersion: 'v0' });
        assert.equal(item.lifecycleActions[0].permission, 'commerce.product.archive');
        assert.equal(item.lifecycleActions[0].operationRoute, '/business/products/archive');
    }
    assert.equal(metadata.navigation.find(row => row.id === 'product-localizations').workbenchPresentation.schemaDiscovery, undefined);
    assert(Object.values(routes).every(route => route.secured && route.authTokenTypes.join() === 'access' &&
        route.accessGroups.join() === 'employeeUserGroup' && route.permissionConfig.startsWith('product.businessAuthoring.')));
    assert.equal(utility.buildDescriptor(f.request, { rawSchema: { product: f.raw } }, 'product', 'product'), undefined);
});

test('layered owner permission/field restrictions remain effective without changing generic ACLs', async t => {
    const f = fixture(t); f.config.product.businessAuthoring.writePermission = 'partner.product.author';
    await assert.rejects(command(f, 'create', create), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
    f.request.authData.permissions = ['partner.product.author'];
    f.raw.backoffice.businessAuthoring.writableFields = f.raw.backoffice.businessAuthoring.writableFields.filter(name => name !== 'productType');
    await assert.rejects(command(f, 'create', { ...create, productType: 'PHYSICAL' }), { code: 'ERR_PRODUCT_AUTHORING_INPUT' });
    assert.equal((await command(f, 'create', create)).versionId, 0);
    assert.equal(access.getAccessPoint(f.request.authData, f.raw.accessGroups, f.request), 0);
});

test('actual groups satisfy only their route permissions and No access cannot discover Product descriptors', async t => {
    const f = fixture(t, 'view');
    for (const [level, code] of [['view', 'productBusinessViewUserGroup'], ['edit', 'productBusinessEditUserGroup'],
        ['fullControl', 'productBusinessFullControlUserGroup']]) {
        const group = Object.values(groups).find(row => row.code === code);
        f.request.authData.userGroups[0].permissions = [...group.permissions];
        for (const route of Object.values(routes)) {
            const permission = security.getRoutePermissions(route)[0];
            const expected = permission === 'commerce.product.read' ||
                permission === 'commerce.product.write' && level !== 'view' ||
                permission === 'commerce.product.archive' && level === 'fullControl';
            assert.equal(owner.permitted(f.request, permission), expected);
        }
    }
    f.request.authData.userGroups[0].permissions = [];
    await assert.rejects(controller.schemas(f.request), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
    assert.equal(f.calls.length, 0);
});

test('duplicate create and changed catalogue/identity cannot adopt another root or append a version', async t => {
    const f = fixture(t); await command(f, 'create', create);
    await assert.rejects(command(f, 'create', create), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' });
    for (const model of [{ code: 'other' }, { catalogVersion: 'other' }])
        await assert.rejects(command(f, 'update', { ...update, model }), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' });
    assert.equal(f.inserted.length, 1);
});

test('archive accepts the existing lifecycle envelope but rejects forged row echoes, scope and action identities', async t => {
    const f = fixture(t, 'fullControl'); const row = f.seed();
    for (const body of [{ ...archive, actionId: 'publish' }, { ...archive, enterpriseCode: 'other' },
        { ...archive, model: { ...owner.project(row), name: 'Injected' } },
        { ...archive, identity: { code: 'root-a', versionId: '0' } }])
        await assert.rejects(command(f, 'archive', body), { code: 'ERR_PRODUCT_AUTHORING_INPUT' });
    assert.equal(f.inserted.length, 0);
});

test('read-only schema and original schema mutation across an await never authorize a source write', async t => {
    const f = fixture(t); f.seed();
    f.raw.backoffice.mutationMode = 'READ_ONLY';
    await assert.rejects(command(f, 'update', update), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
    delete f.raw.backoffice.mutationMode;
    f.setAfterRead(() => { f.raw.definition.name.required = false; });
    await assert.rejects(command(f, 'update', update), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
    assert.equal(f.inserted.length, 0);
});

test('conflicting tenant aliases and malformed hydrated groups fail with owner scope errors before I/O', async t => {
    const f = fixture(t), original = structuredClone(f.request.authData);
    const corruptions = [
        () => { f.request.authData.tenantCode = 'foreign'; },
        () => { f.request.tenantCode = 'foreign'; },
        ...[undefined, null, {}, 'employeeUserGroup', [null], [42], [{ code: '' }], [['employeeUserGroup']]]
            .map(value => () => { f.request.authData.userGroups = value; }),
        () => { f.request.authData.userGroups[0].parentGroups = 'employeeUserGroup'; },
        () => { f.request.authData.userGroups[0].parentGroups.push(null); },
        () => { f.request.authData.userGroups[0].parentGroups.push(f.request.authData.userGroups[0]); },
        () => { f.request.authData.userGroups[0].permissions = 'commerce.product.write'; },
        () => { f.request.authData.userGroups[0].permissions.push({ code: 'commerce.product.write' }); },
        () => { f.request.authData.userGroups.length += 1; },
    ];
    for (const corrupt of corruptions) {
        f.request.authData = structuredClone(original); delete f.request.tenantCode; corrupt();
        await assert.rejects(controller.schemas(f.request), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
        await assert.rejects(command(f, 'create', create), { code: 'ERR_PRODUCT_AUTHORING_SCOPE' });
    }
    assert.equal(f.calls.length, 0);
    f.request.authData = { ...structuredClone(original), tenantCode: original.tenant };
    f.request.tenantCode = original.tenant;
    assert.equal((await command(f, 'create', create)).versionId, 0);
});

const refusedOutcomes = [
    ['missing', () => undefined], ['null', () => null], ['empty', () => ({})],
    ['ERR with plausible result', response => ({ ...response, code: 'ERR_REFUSED_00000' })],
    ['missing success code', response => ({ ...response, code: undefined })],
    ['wrong success code', response => ({ ...response, code: 'SUC_OTHER_00000' })],
    ['success false', response => ({ ...response, success: false })],
    ['error', response => ({ ...response, error: { code: 'REFUSED' } })],
    ['errors', response => ({ ...response, errors: [{ code: 'REFUSED' }] })],
    ['malformed errors', response => ({ ...response, errors: 'REFUSED' })],
    ['acknowledged false', response => ({ ...response, acknowledged: false })],
    ['missing result', response => ({ ...response, result: undefined })],
];

test('read and search require affirmative generated envelopes even with plausible scoped rows', async t => {
    const f = fixture(t); f.seed(); f.request.httpRequest.params.productCode = 'root-a';
    for (const [name, corrupt] of [...refusedOutcomes,
        ['missing count', response => ({ ...response, count: undefined })]]) {
        f.setGeneratedResponse(corrupt);
        await assert.rejects(controller.read(f.request), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' }, name);
        await assert.rejects(command(f, 'search', { query: {} }), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' }, name);
        await assert.rejects(command(f, 'update', update), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' }, name);
    }
    assert.equal(f.inserted.length, 0);
    f.history.length = 0;
    f.setGeneratedResponse(response => ({ ...response, code: 'ERR_FIND_00000' }));
    await assert.rejects(command(f, 'create', create), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' });
    assert.equal(f.inserted.length, 0);
});

for (const operation of ['create', 'update', 'archive']) test(operation + ' refuses failed or missing generated write outcomes despite a persisted successor', async t => {
    const f = fixture(t, 'fullControl');
    for (const [name, corrupt] of refusedOutcomes) {
        f.history.length = 0; f.inserted.length = 0; f.calls.length = 0;
        if (operation !== 'create') f.seed();
        f.setGeneratedResponse((response, pipeline) => pipeline === 'modelsGetInitializerPipeline' ? response : corrupt(response));
        await assert.rejects(command(f, operation, operation === 'create' ? create : operation === 'update' ? update : archive),
            { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' }, name);
        assert.equal(f.inserted.length, 1, name);
        assert.equal(f.calls.filter(call => call.pipeline === 'modelsGetInitializerPipeline').length, 1, name + ': no automatic reconciliation read');
        assert.equal(f.calls.length, 2, name + ': no retries');
        f.setGeneratedResponse(response => response);
        f.request.httpRequest.params.productCode = 'root-a';
        const reloaded = (await controller.read(f.request)).data;
        assert.equal(reloaded.versionId, operation === 'create' ? 0 : 1, name);
    }
});

test('save acknowledgment must be the exact scoped version-zero record, not invented counts or a foreign row', async t => {
    const f = fixture(t);
    for (const result of [() => ({ acknowledged: true, insertedCount: 1 }),
        row => ({ ...row, enterpriseCode: 'foreign' }), row => ({ ...row, tenant: 'foreign' }),
        row => ({ ...row, code: 'other' }), row => ({ ...row, versionId: 1 }), row => ({ ...row, revision: 1 }),
        row => ({ ...row, name: 'Unchanged' }), row => ({ ...row, updatedBy: 'other' }),
        row => ({ ...row, success: false }), row => ({ ...row, acknowledged: false }),
        row => ({ ...row, errors: ['refused'] })]) {
        f.history.length = 0; f.calls.length = 0;
        f.setGeneratedResponse((response, pipeline) => pipeline === 'modelSaveInitializerPipeline'
            ? { ...response, result: result(response.result) } : response);
        await assert.rejects(command(f, 'create', create), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' });
        assert.equal(f.calls.length, 2);
    }
});

test('versioned update requires an affirmative single-insert provider result and exact scoped readback', async t => {
    const f = fixture(t);
    for (const result of [{}, { acknowledged: false, insertedCount: 1 }, { insertedCount: 1 },
        { acknowledged: true, insertedCount: 0 }, { acknowledged: true, insertedCount: 2 },
        { acknowledged: true, insertedCount: 1, success: false },
        { acknowledged: true, insertedCount: 1, error: 'refused' },
        { acknowledged: true, insertedCount: 1, errors: ['refused'] }]) {
        f.history.length = 0; f.calls.length = 0; f.seed();
        f.setGeneratedResponse((response, pipeline) => pipeline === 'modelsUpdateInitializerPipeline' ? { ...response, result } : response);
        await assert.rejects(command(f, 'update', update), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' });
        assert.equal(f.calls.length, 2);
    }
    f.setGeneratedResponse(response => response);
    for (const changes of [{ enterpriseCode: 'foreign' }, { tenant: 'foreign' }, { code: 'other' },
        { versionId: 0 }, { revision: 0 }, { name: 'Product A' }, { updatedBy: 'other' }, { status: 'ARCHIVED' }]) {
        f.history.length = 0; f.inserted.length = 0; f.seed();
        f.setAfterRead(response => { if (f.inserted.length) Object.assign(response.result[0], changes); });
        await assert.rejects(command(f, 'update', update), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' });
        assert.equal(f.inserted.length, 1);
    }
});

test('explicitly refused update cannot adopt a concurrent newer row as its successful write', async t => {
    const f = fixture(t); f.seed();
    let attempts = 0;
    SERVICE.DefaultProductService.update = async () => {
        attempts += 1;
        f.seed({ versionId: 1, revision: 1, name: 'Revised', updatedBy: 'employee-a' });
        return { code: 'ERR_UPD_00000', success: false, result: { acknowledged: false, insertedCount: 0 } };
    };
    await assert.rejects(command(f, 'update', update), { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' });
    assert.equal(attempts, 1); assert.equal(f.inserted.length, 0);
    assert.equal(f.calls.length, 1);
    f.request.httpRequest.params.productCode = 'root-a';
    assert.equal((await controller.read(f.request)).data.versionId, 1);
});

test('affirmative writes still require successful exact readback and do not retry or compensate uncertain outcomes', async t => {
    const f = fixture(t, 'fullControl');
    for (const operation of ['create', 'update', 'archive']) for (const [name, corrupt] of [
        ...refusedOutcomes,
        ['foreign readback', response => ({ ...response, result: response.result.map(row => ({ ...row, enterpriseCode: 'foreign' })) })],
        ['changed ordinary field', response => ({ ...response, result: response.result.map(row => ({ ...row, name: 'Unexpected' })) })],
    ]) {
        f.history.length = 0; f.inserted.length = 0; f.calls.length = 0;
        if (operation !== 'create') f.seed();
        f.setGeneratedResponse((response, pipeline) => pipeline === 'modelsGetInitializerPipeline' && f.inserted.length
            ? corrupt(response) : response);
        await assert.rejects(command(f, operation, operation === 'create' ? create : operation === 'update' ? update : archive),
            { code: 'ERR_PRODUCT_AUTHORING_CONFLICT' }, operation + ': ' + name);
        assert.equal(f.inserted.length, 1); assert.equal(f.calls.length, 3);
        assert.equal(f.history.length, operation === 'create' ? 1 : 2);
    }
});

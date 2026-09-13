/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module database/test/schemaUtilityContract
 * @description Verifies shared metadata and generated utility behavior without a Workbench dependency.
 * @layer test
 * @owner nDatabase
 */
'use strict';
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const utility = require('../src/service/schema/defaultSchemaUtilityService');
const safeQuery = require('../src/service/schema/defaultSchemaSafeQueryService');
const workbench = require('./helpers/schemaApiHarness');
const authoring = require('../src/service/schema/defaultSchemaAuthoringPolicyService');
const defaults = require('../config/properties').schemaApi;
let schema, modules, inactive, stage, reads, impacts, writes, request, model;

beforeEach(() => {
    schema = {
        model: true,
        accessGroups: { editor: 10 },
        definition: {
            code: { type: 'string', primary: true, required: true },
            name: { type: 'string', required: true, searchOptions: { enabled: true } },
            note: { type: 'string' },
            revision: { type: 'int' },
            warehouse: { type: 'string' },
            password: { type: 'string' },
            apiKey: { type: 'string' },
            accessGroups: { type: 'object' },
        },
        refSchema: { warehouse: { enabled: true, moduleName: 'location', schemaName: 'warehouse',
            propertyName: 'code', type: 'one', onTargetDelete: 'RESTRICT' } },
        backoffice: { concurrency: { field: 'revision', managed: true },
            mutationPolicy: { publishRequired: true }, bulkOperations: ['DELETE'],
            form: { sections: { details: { label: 'Details', fields: ['name', 'removedField'] } } } },
    };
    modules = { catalog: { rawSchema: { item: schema } }, api: { metaData: { prefix: 'catalog' } } };
    inactive = new Set(); stage = 'STAGED'; reads = []; impacts = []; writes = 0;
    model = { schemaName: 'item' };
    global.CONFIG = { get: key => ({ schemaApi: defaults, runtimeRole: { publication: stage },
        accessPoints: { readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3 } })[key] };
    global.NODICS = { getModule: name => modules[name], isModuleActive: name => !inactive.has(name),
        getModels: () => ({ itemModel: model }) };
    global.UTILS = { createModelName: name => name + 'Model' };
    global.CLASSES = { NodicsError: class extends Error {
        constructor(code, message) { super(message); this.code = code; }
    } };
    global.FACADE = { DefaultSchemaUtilityFacade: require('../src/facade/schema/defaultSchemaUtilityFacade') };
    global.SERVICE = {
        DefaultSchemaUtilityService: utility,
        DefaultSchemaSafeQueryService: safeQuery,
        DefaultSchemaAuthoringPolicyService: authoring,
        DefaultSchemaAccessHandlerService: { getAccessPoint: auth => auth.access },
        DefaultItemService: {
            get: async input => { reads.push(input); return { count: 1, result: [{ code: 'one', name: 'One' }] }; },
            save: async () => { writes++; return { code: 'unexpected' }; },
            update: async () => { writes++; return { code: 'unexpected' }; },
            remove: async () => { writes++; return { code: 'unexpected' }; },
        },
        DefaultReferenceIntegrityService: {
            inspectRemove: async input => { impacts.push(input); return { blocked: false, references: [] }; },
        },
    };
    request = { moduleName: 'catalog', schemaName: 'item', tenant: 'tenant-one', authData: { access: 10 },
        generatedServiceName: 'DefaultItemService', schemaModel: model };
});

/** Builds the existing Workbench HTTP envelope for the same authenticated operation. */
function legacyRequest(body = {}, context = request) {
    return { ...context, httpRequest: { params: { schema: 'item' }, body } };
}

test('generated metadata works without Workbench and both interfaces retain safe effective schema details', async () => {
    assert.equal(SERVICE.DefaultSchemaWorkbenchService, undefined);
    const generated = await utility.capabilitiesGenerated(request);
    assert.deepEqual(generated, await discoveryController.get(legacyRequest()));
    const descriptor = generated.data;
    assert.equal(descriptor.moduleName, 'catalog');
    assert.deepEqual(new Set(descriptor.operations), new Set(['read', 'search', 'create', 'update', 'delete']));
    assert.deepEqual(descriptor.fields.map(field => field.name), ['code', 'name', 'note', 'revision', 'warehouse']);
    assert.equal(descriptor.fields.find(field => field.name === 'revision').readOnly, true);
    assert.deepEqual(descriptor.concurrency, { mode: 'COMPARE_AND_SET', field: 'revision', required: true, managed: true });
    assert.equal(descriptor.relationships[0].targetModule, 'location');
    assert.equal(descriptor.relationships[0].onTargetDelete, 'RESTRICT');
    assert.deepEqual(descriptor.form.sections[0], { id: 'details', label: 'Details', fields: ['name'] });
    assert(descriptor.form.sections.some(section => section.fields.includes('note')));
    assert(!JSON.stringify(descriptor).includes('password'));
    assert.equal(reads.length + impacts.length + writes, 0);
});

test('generated safe search matches Workbench translation and preserves tenant/auth scope', async () => {
    const query = { search: 'One', pageSize: 10, pageNumber: 1, sort: { field: 'code', direction: 'ASC' },
        filters: { operator: 'AND', items: [{ field: 'code', operator: 'EQUALS', value: 'one' }] } };
    const generated = await safeQuery.searchGenerated({ ...request, browserQuery: { query } });
    const legacy = await workbench.search(legacyRequest({ query }));
    assert.deepEqual(generated, legacy);
    assert.equal(reads.length, 2);
    for (const input of reads) {
        assert.equal(input.tenant, request.tenant);
        assert.strictEqual(input.authData, request.authData);
        assert.deepEqual(input.options, { recursive: false });
        assert.deepEqual(input.query, { $and: [
            { $or: [{ name: { $regex: 'One', $options: 'i' } }] }, { $and: [{ code: 'one' }] },
        ] });
        assert.equal(input.searchOptions.projection.password, undefined);
        assert.equal(input.searchOptions.projection.apiKey, undefined);
    }
    assert.deepEqual(reads[0].searchOptions, reads[1].searchOptions);
    assert.equal(reads[0].moduleName, 'catalog');
});

test('both search interfaces reject protected filters, unbounded paging and raw query operators before reads', async () => {
    for (const query of [
        { filters: { operator: 'AND', items: [{ field: 'password', operator: 'EQUALS', value: 'x' }] } },
        { pageSize: 100000 },
        { filters: { $where: 'arbitrary' } },
    ]) {
        await assert.rejects(async () => safeQuery.searchGenerated({ ...request, browserQuery: query }), { code: 'ERR_DBS_00003' });
        await assert.rejects(async () => workbench.search(legacyRequest(query)), { code: 'ERR_DBS_00003' });
    }
    assert.equal(reads.length, 0);
});

test('delete impact uses identical scoped identity and concurrency without any mutation', async () => {
    const identity = { code: 'one', revision: 7 };
    assert.deepEqual(await utility.deleteImpactGenerated({ ...request, utilityBody: { identity } }),
        await workbench.previewDeleteImpact(legacyRequest({ identity })));
    assert.deepEqual(impacts[0], impacts[1]);
    assert.strictEqual(impacts[0].schemaModel, model);
    assert.strictEqual(impacts[0].authData, request.authData);
    assert.equal(impacts[0].tenant, request.tenant);
    assert.deepEqual(impacts[0].query, identity);
    for (const invalid of [{ code: 'one' }, { code: { $ne: null }, revision: 7 }]) {
        const code = invalid.revision === undefined ? 'ERR_CONCURRENCY_00002' : 'ERR_DBS_00003';
        await assert.rejects(async () => utility.deleteImpactGenerated({ ...request, utilityBody: { identity: invalid } }), { code });
        await assert.rejects(async () => workbench.previewDeleteImpact(legacyRequest({ identity: invalid })), { code });
    }
    assert.equal(impacts.length, 2);
    assert.equal(writes, 0);
});

test('denied, excluded and inactive schemas remain unavailable through either interface', async () => {
    for (const exclude of [
        () => { request.authData.access = 0; },
        () => { schema.backoffice.enabled = false; },
        () => { inactive.add('catalog'); },
    ]) {
        exclude();
        await assert.rejects(async () => utility.capabilitiesGenerated(request), { code: 'ERR_DBS_00004' });
        await assert.rejects(async () => safeQuery.searchGenerated(request), { code: 'ERR_DBS_00004' });
        await assert.rejects(async () => discoveryController.get(legacyRequest()), { code: 'ERR_DBS_00004' });
        request.authData.access = 10; delete schema.backoffice.enabled; inactive.clear();
    }
    assert.equal(reads.length + impacts.length + writes, 0);
});

test('API aliases resolve the same active owner and reject an inactive route host', async () => {
    const aliased = { ...request, moduleName: 'api' };
    const descriptor = await utility.capabilitiesGenerated(aliased);
    assert.equal(descriptor.data.moduleName, 'catalog');
    assert.deepEqual(descriptor, await discoveryController.get(legacyRequest({}, aliased)));
    inactive.add('api');
    await assert.rejects(async () => utility.capabilitiesGenerated(aliased), { code: 'ERR_DBS_00004' });
    await assert.rejects(async () => discoveryController.get(legacyRequest({}, aliased)), { code: 'ERR_DBS_00004' });
});

test('Online authoring stays read-only for metadata, delete impact and Workbench mutations', async () => {
    stage = 'ONLINE';
    const descriptor = (await utility.capabilitiesGenerated(request)).data;
    assert.deepEqual(descriptor.operations, ['search', 'read']);
    assert.equal(descriptor.mutationMode, 'READ_ONLY');
    assert.deepEqual(descriptor.bulkCapabilities.operations, []);
    assert.deepEqual(descriptor, (await discoveryController.get(legacyRequest())).data);
    const body = { identity: { code: 'one', revision: 7 }, model: { name: 'Changed' } };
    await assert.rejects(async () => utility.deleteImpactGenerated({ ...request, utilityBody: body }), { code: 'ERR_DBS_00004' });
    for (const operation of ['createRecord', 'updateRecord', 'deleteRecord', 'previewDeleteImpact']) {
        await assert.rejects(async () => workbench[operation](legacyRequest(body)), { code: operation === 'previewDeleteImpact' ? 'ERR_DBS_00004' : 'ERR_AUTH_00003' });
    }
    assert.equal(impacts.length + writes, 0);
});

test('metadata customization applies to generated search and Workbench through the effective utility owner', async () => {
    SERVICE.DefaultSchemaUtilityService = Object.assign({}, utility, {
        buildFields: function (...args) { return utility.buildFields.apply(this, args).filter(field => field.name !== 'note'); },
        getAllowedOperations: function (...args) { return utility.getAllowedOperations.apply(this, args).filter(operation => operation !== 'delete'); },
    });
    const generated = await SERVICE.DefaultSchemaUtilityService.capabilitiesGenerated(request);
    assert.deepEqual(generated, await discoveryController.get(legacyRequest()));
    assert(!generated.data.fields.some(field => field.name === 'note'));
    assert(!generated.data.operations.includes('delete'));
    await safeQuery.searchGenerated(request);
    assert.equal(reads[0].searchOptions.projection.note, undefined);
    request.authData.access = 0;
    await assert.rejects(async () => safeQuery.searchGenerated(request), { code: 'ERR_DBS_00004' });
});

test('missing shared metadata owner fails closed even when a Workbench service is installed', async () => {
    delete SERVICE.DefaultSchemaUtilityService;
    SERVICE.DefaultSchemaWorkbenchService = workbench;
    await assert.rejects(async () => safeQuery.searchGenerated(request), { code: 'ERR_DBS_00004' });
    await assert.rejects(async () => discoveryController.get(legacyRequest()), { code: 'ERR_DBS_00004' });
    assert.equal(reads.length + impacts.length + writes, 0);
});

/** Instantiates an existing generated template without writing generated artifacts to the checkout. */
function compileTemplate(relativePath) {
    const filename = path.resolve(__dirname, relativePath);
    const replacements = { mdulnm: 'catalog', mdlnm: 'itemModel', schmanm: 'item',
        srvcName: 'DefaultItemService', dsdName: 'DefaultItemFacade' };
    let source = fs.readFileSync(filename, 'utf8');
    for (const [placeholder, value] of Object.entries(replacements)) source = source.replaceAll(placeholder, value);
    const generated = new Module(filename, module);
    generated.paths = module.paths;
    generated._compile(source, filename);
    return generated.exports;
}

test('existing generated controller/facade/service templates reach the shared owner without Workbench', async () => {
    const controller = compileTemplate('../../../nController/src/controller/common.js');
    const facade = compileTemplate('../../../nFacade/src/facade/common.js');
    SERVICE.DefaultItemService = compileTemplate('../../../nService/src/service/common.js');
    SERVICE.DefaultPipelineService = { start: async (pipeline, input) => {
        assert.equal(pipeline, 'modelsGetInitializerPipeline');
        assert.strictEqual(input.schemaModel, model);
        reads.push(input);
        return { count: 1, result: [{ code: 'one' }] };
    } };
    global.FACADE = { DefaultItemFacade: facade, DefaultSchemaUtilityFacade: discoveryFacade };
    const http = body => ({ tenant: request.tenant, authData: request.authData, moduleName: 'catalog',
        httpRequest: { body, params: {} } });
    const descriptor = await controller.capabilities(http({ moduleName: 'other', schemaName: 'hidden' }));
    assert.deepEqual(descriptor, await discoveryController.get(legacyRequest()));
    const callbackDescriptor = await new Promise((resolve, reject) => controller.capabilities(http({}),
        (error, value) => error ? reject(error) : resolve(value)));
    assert.deepEqual(callbackDescriptor, descriptor);
    const body = { query: { search: 'One', pageSize: 10 } };
    assert.deepEqual(await controller.safeSearch(http(body)), await workbench.search(legacyRequest(body)));
    assert.equal(reads.length, 2);
    assert(reads.every(input => input.tenant === request.tenant && input.authData === request.authData));
    const identity = { identity: { code: 'one', revision: 7 } };
    assert.deepEqual(await controller.deleteImpact(http(identity)), await workbench.previewDeleteImpact(legacyRequest(identity)));
    assert.deepEqual(impacts[0], impacts[1]);
    assert.equal(SERVICE.DefaultSchemaWorkbenchService, undefined);
});


test('schema API projection follows prepared route aliases and versions without granting access', () => {
    const route = { controller: 'DefaultItemController', operation: 'save', method: 'put',
        key: '/custom-items', apiVersion: 'v2', active: true };
    NODICS.getRouters = name => { assert.equal(name, 'api'); return { create: route,
        unrelated: { ...route, controller: 'BusinessCommandController' } }; };
    request.moduleName = 'api';
    const descriptor = utility.resolveDescriptor(request, 'api', 'item');
    assert.deepEqual(descriptor.apiOperations, { create: {
        method: 'PUT', path: '/custom-items', apiVersion: 'v2', active: true } });
    request.authData.access = 0;
    assert.equal(utility.resolveDescriptor(request, 'api', 'item'), undefined);
});

test('schema API projection retains disabled routes and rejects ambiguous or unsafe declarations', () => {
    let routes = { create: { controller: 'DefaultItemController', operation: 'save', method: 'PUT',
        key: '/items', active: false } };
    NODICS.getRouters = () => routes;
    assert.equal(utility.buildApiOperations('catalog', 'item').create.active, false);
    routes.alias = { ...routes.create, key: '/other-items' };
    assert.throws(() => utility.buildApiOperations('catalog', 'item'), /ambiguous/);
    delete routes.alias;
    for (const key of ['//external.test', '/items/../secrets', '/items/:id', '/items?token=x']) {
        routes.create.key = key;
        assert.throws(() => utility.buildApiOperations('catalog', 'item'), /safely/);
    }
    routes = {};
    assert.equal(utility.buildApiOperations('catalog', 'item'), undefined);
});


const discoveryController = require('../src/controller/schema/defaultSchemaUtilityController');
const discoveryFacade = require('../src/facade/schema/defaultSchemaUtilityFacade');

test('canonical discovery uses the shared owner without Workbench and preserves the descriptor envelopes', async () => {
    global.FACADE = { DefaultSchemaUtilityFacade: discoveryFacade };
    const input = legacyRequest();
    modules.catalog.rawSchema.hidden = { ...schema, backoffice: { enabled: false } };
    modules.catalog.rawSchema.notModel = { ...schema, model: false };
    const response = await discoveryController.list(input);
    assert.deepEqual(response, await utility.listSchemas(input));
    assert.deepEqual(response.data.schemas.map(item => item.schemaName), ['item']);
    const detail = await discoveryController.get(legacyRequest({}, { ...request,
        httpRequest: { params: { schema: 'item' } } }));
    assert.deepEqual(detail, await utility.capabilitiesGenerated(request));
    assert.equal(SERVICE.DefaultSchemaWorkbenchService, undefined);
    assert.equal(response.data.schemas[0].fields.some(field => field.name === 'password'), false);
    assert.equal(response.data.schemas[0].fields.some(field => field.name === 'accessGroups'), false);
    assert.equal(writes, 0);
});

test('discovery route selection preserves trusted context and rejects body/query scope forgery', async () => {
    global.FACADE = { DefaultSchemaUtilityFacade: discoveryFacade };
    const input = { ...request, schemaName: 'hidden', httpRequest: {
        params: { schema: 'item' }, query: { moduleName: 'other', schemaName: 'hidden' },
        body: { moduleName: 'other', schemaName: 'hidden', authData: { access: 999 }, tenant: 'other' } } };
    const originalAuth = input.authData;
    const scope = {};
    Object.defineProperty(input, 'verifiedScope', { value: scope });
    const actual = Object.assign({}, utility, { getSchema: function (received, schemaName) {
        assert.strictEqual(received, input); assert.strictEqual(received.verifiedScope, scope);
        assert.strictEqual(received.authData, originalAuth); assert.equal(received.tenant, 'tenant-one');
        assert.equal(schemaName, 'item');
        return utility.getSchema.call(this, received, schemaName);
    } });
    SERVICE.DefaultSchemaUtilityService = actual;
    const result = await discoveryController.get(input);
    assert.equal(result.data.schemaName, 'item');
    assert.equal(input.schemaName, 'hidden', 'transport must not rewrite unrelated trusted request fields');
    assert.equal(input.moduleName, 'catalog');
});

test('canonical discovery preserves alias activation, authoring restrictions and effective schema extensions', async () => {
    global.FACADE = { DefaultSchemaUtilityFacade: discoveryFacade };
    schema.definition.custom = { type: 'string' };
    delete schema.definition.note;
    const input = { ...request, moduleName: 'api', httpRequest: { params: { schema: 'item' } } };
    const listed = await discoveryController.list(input);
    assert.equal(listed.data.moduleName, 'catalog');
    assert(listed.data.schemas[0].fields.some(field => field.name === 'custom'));
    assert(!listed.data.schemas[0].fields.some(field => field.name === 'note'));
    for (const value of ['ONLINE','OPERATIONAL','UNASSIGNED']) {
        stage = value;
        const response = await discoveryController.get(input);
        assert.equal(response.data.authoring.authoringAllowed, false);
        assert(!response.data.operations.includes('create'));
        assert(!response.data.operations.includes('update'));
    }
    inactive.add('api');
    await assert.rejects(discoveryController.list(input), { code: 'ERR_DBS_00004' });
    inactive.clear(); inactive.add('catalog');
    await assert.rejects(discoveryController.get(input), { code: 'ERR_DBS_00004' });
});

test('canonical discovery hides inaccessible schemas and handles missing detail without listing another module', async () => {
    global.FACADE = { DefaultSchemaUtilityFacade: discoveryFacade };
    const input = { ...request, authData: { access: 0 }, httpRequest: { params: { schema: 'item' } } };
    assert.deepEqual((await discoveryController.list(input)).data.schemas, []);
    await assert.rejects(discoveryController.get(input), { code: 'ERR_DBS_00004' });
    input.authData.access = 10; input.httpRequest.params.schema = 'missing';
    await assert.rejects(discoveryController.get(input), { code: 'ERR_DBS_00004' });
    input.moduleName = 'missing';
    await assert.rejects(discoveryController.list(input), { code: 'ERR_DBS_00004' });
});

test('canonical discovery and generated capabilities share effective operation overrides', async () => {
    global.FACADE = { DefaultSchemaUtilityFacade: discoveryFacade };
    const collection = { code: 'SUC_DBS_00000', data: { moduleName: 'catalog', schemas: [] } };
    const detail = { code: 'SUC_DBS_00000', data: { custom: true } };
    SERVICE.DefaultSchemaUtilityService = Object.assign({}, utility, {
        listSchemas: () => Promise.resolve(collection), getSchema: () => Promise.resolve(detail) });
    assert.strictEqual(await discoveryController.list(request), collection);
    assert.strictEqual(await SERVICE.DefaultSchemaUtilityService.listSchemas(request), collection);
    assert.strictEqual(await discoveryController.get(legacyRequest()), detail);
    assert.strictEqual(await SERVICE.DefaultSchemaUtilityService.getSchema(request, request.schemaName), detail);
    assert.strictEqual(await SERVICE.DefaultSchemaUtilityService.capabilitiesGenerated(request), detail);
});

test('canonical discovery preserves callback completion and fails closed when the effective facade or owner is missing', async () => {
    global.FACADE = { DefaultSchemaUtilityFacade: discoveryFacade };
    const expected = await utility.listSchemas(request);
    assert.deepEqual(await new Promise((resolve, reject) => discoveryController.list(request,
        (error, result) => error ? reject(error) : resolve(result))), expected);
    delete SERVICE.DefaultSchemaUtilityService;
    let callbacks = 0;
    await discoveryController.get(legacyRequest(), error => { callbacks++; assert.equal(error.code, 'ERR_DBS_00004'); });
    assert.equal(callbacks, 1);
    await assert.rejects(discoveryController.list(request), { code: 'ERR_DBS_00004' });
    delete FACADE.DefaultSchemaUtilityFacade;
    await assert.rejects(discoveryController.get(legacyRequest()), { code: 'ERR_DBS_00004' });
    assert.equal(writes, 0);
});


test('canonical discovery enforces permission customization, exposure and inactive routes without retired adapters', () => {
    const definitions = require('../src/router/routers').common;
    const security = require('../../../nRouter/src/service/request/defaultSecuredRequestPipelineService');
    const exposure = require('../../../nRouter/src/service/request/defaultRequestHandlerPipelineService');
    const binding = require('../../../nRouter/src/service/router/defaultRouterOperationService');
    const previousGet = CONFIG.get;
    let discoveryPermission = 'system.schema.view';
    let enabled = true;
    CONFIG.get = key => key === 'routeActionAuthorization' ? { enabled: true, strict: true, groupPermissions: {} }
        : key === 'schemaApi' ? { ...defaults, discoveryPermission }
        : key === 'apiExposure' ? { categories: { schemaApi: { enabled } } } : previousGet(key);
    global._ = require('lodash');
    let handled = 0, rejected = 0;
    SERVICE.DefaultRequestHandlerService = { startRequestHandler: () => handled++ };
    const router = Object.assign({}, binding, { sendRouterError: () => rejected++ });
    const routes = [definitions.schemaDiscovery.listSchemas, definitions.schemaDiscovery.getSchema];
    assert.equal(definitions.schemaApi, undefined);
    for (const relative of ['controller/schema/defaultSchemaWorkbenchController.js', 'facade/schema/defaultSchemaWorkbenchFacade.js', 'service/schema/defaultSchemaWorkbenchService.js']) {
        assert.equal(fs.existsSync(path.resolve(__dirname, '../src', relative)), false);
    }
    for (const route of routes) {
        assert.equal(route.secured, true); assert.deepEqual(route.accessGroups, ['userGroup']);
        assert.equal(security.hasRoutePermission({ router: route, authData: { permissions: [] } }), false);
        assert.equal(security.hasRoutePermission({ router: route, authData: { permissions: [discoveryPermission] } }), true);
        assert.equal(exposure.getApiExposureCategory(route), 'schemaApi');
        NODICS.getRouter = () => ({ ...route, active: false });
        router.bindOperation({}, {}, route);
    }
    assert.equal(handled, 0); assert.equal(rejected, 2);
    discoveryPermission = 'schema.discovery.read'; enabled = false;
    for (const route of routes) {
        assert.equal(security.hasRoutePermission({ router: route, authData: { permissions: ['system.schema.view'] } }), false);
        assert.equal(security.hasRoutePermission({ router: route, authData: { permissions: [discoveryPermission] } }), true);
        assert.equal(exposure.isApiExposureEnabled(exposure.getApiExposureCategory(route)), false);
    }
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module commercialAgreement/test/detachedCatalogue @description Composes registered schema routes, safe-query translation and exact detached Agreement reads without native calls. @layer test @owner commercialAgreement */
const test = require('node:test'), assert = require('node:assert/strict');
const owner = require('../src/service/defaultCommercialAgreementOperationService');
const controller = require('../src/controller/defaultCommercialAgreementController');
const defaults = require('../config/properties').commercialAgreement;
const foundation = '../../../../../../nodics.foundation/modules/';
const generated = require(foundation + 'nController/src/controller/common');
const safeQuery = require(foundation + 'nDatabase/database/src/service/schema/defaultSchemaSafeQueryService');
const utility = require(foundation + 'nDatabase/database/src/service/schema/defaultSchemaUtilityService');
const schemaDefaults = require(foundation + 'nDatabase/database/config/properties').schemaApi;
const routers = require(foundation + 'nRouter/src/router/routers').default;
let policy, calls, response, request, descriptorChange, rows;
function descriptor(module) {
    const schemaName = module === 'product' ? 'product' : 'priceRow';
    const schema = require('../../' + module + '/src/schemas/schemas')[module][schemaName];
    const definition = { ...schema.definition, versionId: { type: 'int' } };
    const routes = Object.entries(schema.router.groups).filter(([, enabled]) => enabled).flatMap(([name]) => Object.values(routers[name]));
    const search = routes.find(route => route.operation === 'safeSearch');
    assert(!routes.some(route => route.operation === 'get'), 'Legacy getter group is not registered');
    const result = { moduleName: module, schemaName, operations: ['search', 'read'],
        fields: Object.keys(definition).map(name => ({ name })),
        queryCapabilities: utility.buildQueryCapabilities({ definition }, {}, 'code'),
        apiOperations: { search: { method: search.method, path: search.key.replace('schemaName', schemaName.toLowerCase()), apiVersion: 'v0', active: true } } };
    descriptorChange?.(result);
    return result;
}
function page(records) { return { code: 'SUC_DBS_00000', data: { records, totalCount: records.length, pageSize: 10, pageNumber: 1 } }; }
const ref = (module, schema, code) => ({ module, schema, code, versionId: 0 });
test.beforeEach(t => {
    const previous = Object.fromEntries(['CONFIG', 'SERVICE', 'CLASSES', 'FACADE'].map(k => [k, global[k]]));
    t.after(() => Object.assign(global, previous));
    policy = structuredClone(defaults); policy.catalogueReferences.mode = 'REMOTE'; calls = []; descriptorChange = undefined; response = undefined;
    request = { tenant: 'demo', authData: { tenant: 'demo', entCode: 'default', principalType: 'human',
        tokenType: 'access', loginId: 'native-admin' }, authorization: 'Bearer synthetic-test-only' };
    rows = [{ tenant: 'demo', code: 'package', versionId: 0, productCode: 'package', unitAmount: '0', currency: 'AED' }];
    global.CONFIG = { get: key => key === 'schemaApi' ? schemaDefaults : policy };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.SERVICE = { DefaultModuleService: { invokeModule: async input => {
        calls.push(input);
        const d = descriptor(input.moduleName), prefix = '/' + d.schemaName.toLowerCase();
        if (input.apiName === prefix + '/capabilities' && input.methodName === 'GET') return { code: 'SUC_DBS_00000', data: d };
        assert.equal(input.apiName, prefix + '/safe-search', 'Only registered canonical search route is available');
        assert.equal(input.methodName, 'POST');
        if (response !== undefined) return response;
        const parsed = safeQuery.buildSearchInput(input.requestBody, d);
        return { code: 'SUC_DBS_00000', data: { records: rows, totalCount: rows.length, pageNumber: parsed.pageNumber, pageSize: parsed.pageSize } };
    } }, DefaultProductService: { get: () => assert.fail('No Online catalogue fallback') },
    DefaultPriceRowService: { get: () => assert.fail('No Online catalogue fallback') } };
});
test('original controller bearer reaches registered Product and Pricing safe-search with exact version filters', async () => {
    let admitted;
    global.FACADE = { DefaultCommercialAgreementFacade: { record: async input => { admitted = input; return { revision: 1 }; } } };
    await controller.record({ tenant: request.tenant, authData: request.authData, header: function () {},
        httpRequest: { headers: { authorization: request.authorization }, body: { authorization: 'untrusted-body' } } });
    assert.equal(admitted.authorization, request.authorization);
    for (const [module, schema, service] of [['product', 'product', 'DefaultProductService'], ['pricing', 'priceRow', 'DefaultPriceRowService']]) {
        assert.deepEqual(await owner.resolveReference(admitted, ref(module, schema, 'package'), service), rows[0]);
        const call = calls.at(-1);
        assert.deepEqual(call.requestBody, { pageNumber: 1, pageSize: 10, filters: { operator: 'AND', items: [
            { field: 'code', operator: 'EQUALS', value: 'package' }, { field: 'versionId', operator: 'EQUALS', value: 0 } ] } });
        assert.equal(call.header.Authorization, request.authorization); assert.equal(call.header['X-Enterprise-Code'], 'default');
        assert.equal(call.targetAuthority.publication, 'STAGED'); assert.equal(call.maxAttempts, 1);
    }
    assert.equal(calls.length, 4);
});
test('missing bearer, service actor, invalid bounds and unavailable source refuse without local fallback', async () => {
    for (const change of [() => { request.authorization = undefined; }, () => { request.authData.principalType = 'service'; },
        () => { policy.catalogueReferences.timeoutMs = 0; }]) {
        const before = structuredClone(request), saved = structuredClone(policy); change();
        await assert.rejects(owner.resolveReference(request, ref('product', 'product', 'package'), 'DefaultProductService'), /ERR_AGREEMENT_REFERENCE/);
        request = before; policy = saved;
    }
    assert.equal(calls.length, 0);
    SERVICE.DefaultModuleService.invokeModule = async () => { throw new Error('private transport detail'); };
    await assert.rejects(owner.resolveReference(request, ref('product', 'product', 'package'), 'DefaultProductService'), error => error.message === 'ERR_AGREEMENT_REFERENCE');
});
test('wrong versions, foreign tenant, duplicate records and failed pages never confirm a reference', async () => {
    const row = rows[0];
    for (const value of [page([{ ...row, versionId: 1 }]), page([{ ...row, tenant: 'other' }]), page([row, row]),
        { ...page([row]), success: false }, { ...page([row]), code: 'ERR_PRIVATE' },
        { data: { records: [row], totalCount: 2, pageSize: 10, pageNumber: 1 } }, page([{ code: 'package', versionId: 0 }])]) {
        response = value;
        await assert.rejects(owner.resolveReference(request, ref('product', 'product', 'package'), 'DefaultProductService'));
    }
});
test('source policy and original authority changes across either owner read refuse', async () => {
    for (const changeOn of [1, 2]) {
        const invoke = SERVICE.DefaultModuleService.invokeModule; let count = 0;
        SERVICE.DefaultModuleService.invokeModule = async input => { const result = await invoke(input); if (++count === changeOn) policy.catalogueReferences.connectionName += '-changed'; return result; };
        await assert.rejects(owner.resolveReference(request, ref('product', 'product', 'package'), 'DefaultProductService'), /ERR_AGREEMENT_REFERENCE/);
        SERVICE.DefaultModuleService.invokeModule = invoke;
    }
    SERVICE.DefaultModuleService.invokeModule = async () => { request.authData.entCode = 'other'; return {}; };
    await assert.rejects(owner.resolveReference(request, ref('product', 'product', 'package'), 'DefaultProductService'), /ERR_AGREEMENT_REFERENCE/);
});
test('real generated safe-search controller and translator preserve the exact version through the owner get pipeline', async () => {
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultSchemaUtilityService = { resolveDescriptor: () => descriptor('product') };
    SERVICE.GeneratedSourceProduct = { get: async incoming => {
        assert.deepEqual(incoming.query, { $and: [{ code: 'package' }, { versionId: 0 }] });
        assert.equal(incoming.searchOptions.pageSize, 10); assert.equal(incoming.options.recursive, false);
        assert.equal(incoming.searchOptions.projection.versionId, 1); assert.equal(incoming.searchOptions.projection.tenant, 1);
        assert.equal(incoming.authData, request.authData);
        return { code: 'SUC_FIND_00000', count: 1, result: rows };
    } };
    global.FACADE = { dsdName: { safeSearch: incoming => safeQuery.searchGenerated({ ...incoming, schemaName: 'product', generatedServiceName: 'GeneratedSourceProduct' }) } };
    SERVICE.DefaultModuleService.invokeModule = input => input.methodName === 'GET' ? invoke(input) :
        generated.safeSearch({ moduleName: 'product', tenant: 'demo', authData: request.authData, httpRequest: { body: input.requestBody } });
    assert.equal((await owner.resolveReference(request, ref('product', 'product', 'package'), 'DefaultProductService')).versionId, 0);
});
test('capability-bound page size follows owner overrides and missing or foreign contracts cannot redirect the bearer', async () => {
    descriptorChange = d => { d.queryCapabilities.allowedPageSizes = [25, 50]; };
    await owner.resolveReference(request, ref('product', 'product', 'package'), 'DefaultProductService');
    assert.equal(calls.at(-1).requestBody.pageSize, 25);
    for (const mutate of [d => { d.apiOperations.search.active = false; }, d => { d.apiOperations.search.path = '/other'; },
        d => { d.queryCapabilities.allowedPageSizes = []; }, d => { d.fields = d.fields.filter(f => f.name !== 'versionId'); },
        d => { d.queryCapabilities.filterFields = d.queryCapabilities.filterFields.filter(f => f.field !== 'versionId'); }]) {
        descriptorChange = mutate; calls = [];
        await assert.rejects(owner.resolveReference(request, ref('product', 'product', 'package'), 'DefaultProductService'), /ERR_AGREEMENT_REFERENCE/);
        assert.equal(calls.length, 1);
    }
});
test('missing owner mode does not substitute a default reference source', async () => {
    delete policy.catalogueReferences.mode;
    await assert.rejects(owner.resolveReference(request, ref('product', 'product', 'package'), 'DefaultProductService'), /ERR_AGREEMENT_CONFIG/);
    assert.equal(calls.length, 0);
});
test('configuration regression C4: detached timeout uses default and override range without inline ceiling',async()=>{
    await owner.resolveReference(request,ref('product','product','package'),'DefaultProductService');
    assert.equal(calls.at(-1).timeoutMs,defaults.catalogueReferences.timeoutMs);
    policy.catalogueReferences.validation.timeoutMs={minimum:1,maximum:100000};
    policy.catalogueReferences.timeoutMs=90000;
    await owner.resolveReference(request,ref('product','product','package'),'DefaultProductService');
    assert.equal(calls.at(-1).timeoutMs,90000);
    const good=structuredClone(policy);
    for(const change of [p=>{delete p.validation},p=>{p.validation.timeoutMs={minimum:0,maximum:100000}},
        p=>{p.validation.timeoutMs={minimum:2,maximum:1}},p=>{p.validation.timeoutMs.maximum='100000'},
        p=>{p.validation.timeoutMs.maximum=20000},p=>{p.timeoutMs=0}]){
        policy=structuredClone(good);change(policy.catalogueReferences);calls=[];
        await assert.rejects(owner.resolveReference(request,ref('product','product','package'),'DefaultProductService'),/ERR_AGREEMENT_REFERENCE/);
        assert.equal(calls.length,0);
    }
});

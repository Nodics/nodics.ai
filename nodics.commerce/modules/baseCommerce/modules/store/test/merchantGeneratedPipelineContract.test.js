/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module store/test/merchantGeneratedPipelineContract @description Connects the compiled generated Store get, real pipeline engine, Mongo adapter and protected Store hooks with isolated Profile/cursor fixtures. No native persistence or provider qualification. @layer test @owner store */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const root = '../../../../../../';
const foundation = root + 'nodics.foundation/modules/';
const merchant = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceMerchantService');
const owner = require('../src/service/defaultStoreMerchantReadService');
const schemas = require('../src/schemas/schemas').store;
const properties = require('../config/properties');
const schemaOwner = require(foundation + 'nDatabase/database/src/service/schema/defaultDatabaseSchemaHandlerService');
const access = require(foundation + 'nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
const policy = require(foundation + 'nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService');
const initializer = require(foundation + 'nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
const mongo = require(foundation + 'nDatabase/mongodb/src/schemas/model').default;
const pipeline = require(foundation + 'nPipeline/src/service/pipeline/defaultPipelineService');
const clone = value => structuredClone(value);
const input = () => ({ tenant: 'tenant', authorization: 'Bearer fixture-only', payload: {},
    authData: { principalType: 'human', tokenType: 'access', loginId: 'merchant', tenant: 'tenant',
        entCode: 'issuer', userGroups: ['employeeUserGroup', 'commerceMerchantUserGroup'] } });

/** Materializes the canonical service template using the generator's schema placeholders, without writing generated files. */
function generatedStore() {
    const filename = path.resolve(__dirname, foundation, 'nService/src/service/common.js');
    let source = fs.readFileSync(filename, 'utf8');
    for (const [key, value] of Object.entries({ mdulnm: 'store', mdlnm: 'storeModel',
        schmanm: 'store', srvcName: 'DefaultStoreService' })) source = source.replaceAll(key, value);
    const compiled = new Module(filename, module);
    compiled.paths = module.paths;
    compiled._compile(source, filename);
    return compiled.exports;
}

/** Installs real read orchestration with only external Profile, ownership admission and Mongo cursor/count fixtures. */
function fixture(t) {
    const keys = ['_', 'CONFIG', 'UTILS', 'CLASSES', 'PIPELINE', 'NODICS', 'SERVICE'];
    const previous = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
    const stringMethod = Object.getOwnPropertyDescriptor(String.prototype, 'toUpperCaseFirstChar');
    t.after(() => {
        for (const key of keys) {
            if (previous[key]) Object.defineProperty(global, key, previous[key]);
            else delete global[key];
        }
        if (stringMethod) Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', stringMethod);
        else delete String.prototype.toUpperCaseFirstChar;
    });
    Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', { configurable: true, writable: true,
        value: function () { return this.charAt(0).toUpperCase() + this.slice(1); } });
    global._ = require('lodash');
    const log = { debug() {}, warn() {}, error() {}, info() {} };
    const state = { findCalls: 0, countCalls: 0, profileReads: 0, hooks: [], sameRequest: true,
        records: [{ code: 'own', tenant: 'tenant', status: 'ACTIVE', active: true, name: 'Own outlet',
            revision: 1, enterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: 'issuer' },
            privateField: 'must-not-escape', primaryLocationRef: { code: 'private-location' } }],
        scopes: { principalCode: 'merchant', principalType: 'human', scopeCount: 1, deniedScopes: [],
            scopes: [{ scopeType: 'STORE', scopeCode: 'own', enterpriseCode: 'issuer',
                capabilityCode: 'digitalCore', permissionCode: 'commerce.coupon.pos.redeem' }] } };
    class NodicsError extends Error {
        constructor(value, message, code) { super(message || value?.message || String(value)); this.code = code || value?.code || value; }
        static enrich(error) { return error; }
    }
    global.CLASSES = { NodicsError,
        PipelineHead: require(foundation + 'nPipeline/src/lib/pipelineHead'),
        PipelineNode: require(foundation + 'nPipeline/src/lib/pipelineNode') };
    global.UTILS = { isBlank: value => value == null || _.isEmpty(value), isObject: _.isObject,
        generateUniqueCode: () => 'fixture-only' };
    global.CONFIG = { get: key => ({ schemaPolicies: properties.schemaPolicies,
        accessPoints: { readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3, fullAccessPoint: 10 },
        runtimeRole: 'COMMERCE', cache: { enabled: false }, promotion: {},
        digitalCore: { merchantRedemption: { enabled: true, storeScope: { enabled: true, qualified: true },
            presentation: { storeLabel: 'Outlet' } } } }[key]) };
    global.PIPELINE = { ...require(foundation + 'nPipeline/src/pipelines/pipelines'),
        ...require(foundation + 'nDatabase/database/src/pipelines/pipelines') };
    const effective = schemaOwner.applyNamedSchemaPolicies('store', clone(schemas));
    const model = { ...mongo, moduleName: 'store', schemaName: 'store', rawSchema: effective.store,
        cache: { enabled: false },
        find(query) {
            state.findCalls++;
            assert.deepEqual(query, { tenant: 'tenant', code: 'own', status: 'ACTIVE' });
            return { toArray: async () => clone(state.records) };
        },
        countDocuments: async () => { state.countCalls++; return state.records.length; },
        projectReadResult(request, success) {
            state.beforeProjection?.(request, success);
            return mongo.projectReadResult.call(this, request, success);
        } };
    state.model = model;
    global.NODICS = { getModels: (moduleName, tenant) => {
        assert.equal(moduleName, 'store'); assert.equal(tenant, 'tenant'); return { storeModel: model };
    } };
    const observe = request => { if (request !== state.request) state.sameRequest = false; };
    const generated = generatedStore();
    global.SERVICE = {
        DefaultLoggerService: { createLogger: () => log, inheritRequestPrivacy() {}, isSensitiveRequest: () => false },
        DefaultPipelineService: { ...pipeline, LOG: log },
        DefaultModelsGetInitializerService: { ...initializer, LOG: log },
        DefaultDigitalCommerceMerchantService: merchant,
        DefaultStoreMerchantReadService: owner,
        DefaultSchemaAccessHandlerService: access,
        DefaultRecordOwnershipPolicyService: { enforce: async () => true },
        DefaultDatabaseConfigurationService: { getSchemaInterceptors: () => ({}), getSchemaValidators: () => ({}) },
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ['commerce.coupon.pos.redeem'],
            isPermissionGranted: (permission, granted) => granted.includes(permission) },
        DefaultModuleService: { invokeModule: async request => {
            assert.equal(request.apiName, '/identity/scopes/me');
            assert.equal(request.header.Authorization, 'Bearer fixture-only');
            assert.equal(request.header['X-Enterprise-Code'], 'issuer');
            state.profileReads++; return { code: 'SUC_PROFILE', data: clone(state.scopes) };
        } },
        DefaultSchemaReadAccessPolicyService: { ...policy,
            providerRead(request, receiver) { observe(request); return policy.providerRead.call(this, request, receiver); },
            providerResult(request, response, receiver) {
                observe(request);
                state.beforeHook?.(request, response, receiver, state.hooks.length);
                state.hooks.push({ hasCode: 'code' in response.success, code: response.success.code,
                    count: response.success.count, rows: response.success.result.length });
                return policy.providerResult.call(this, request, response, receiver);
            } },
        DefaultStoreService: { get: async request => {
            state.request = request; state.options = request.options; state.searchOptions = request.searchOptions;
            const result = await generated.get(state.copyRequest ? { ...request } : request);
            state.finalResult = result;
            state.afterGet?.(result);
            return result;
        } }
    };
    return state;
}

test('real generated Store pipeline projects the code-less Mongo envelope before its strict final success envelope', async t => {
    const state = fixture(t);
    assert.deepEqual((await merchant.workspace(input())).stores, [{ code: 'own', name: 'Own outlet', revision: 1 }]);
    assert.equal(state.sameRequest, true);
    assert.equal(state.request.options, state.options);
    assert.equal(state.request.searchOptions, state.searchOptions);
    assert.equal(state.request.internalPersistence, undefined);
    assert.deepEqual(state.searchOptions, { pageSize: 2, pageNumber: 1, limit: 2, skip: 0, snapshot: false });
    assert.deepEqual(state.options, { recursive: false, skipItemCache: true });
    assert.deepEqual(state.hooks, [{ hasCode: false, code: undefined, count: 1, rows: 1 },
        { hasCode: true, code: 'SUC_FIND_00000', count: 1, rows: 1 }]);
    assert.equal(state.finalResult.code, 'SUC_FIND_00000');
    assert.equal(state.findCalls, 1); assert.equal(state.countCalls, 1);
    assert(state.profileReads >= 4);
    assert(!JSON.stringify(state.finalResult).includes('must-not-escape'));
    assert(!JSON.stringify(state.finalResult).includes('private-location'));
    assert.throws(() => owner.providerRead(state.request, state.model), { code: 'ERR_AUTH_00003' });
});

test('real generated empty Store read confirms absence without fabricating an outlet', async t => {
    const state = fixture(t); state.records = [];
    assert.deepEqual((await merchant.workspace(input())).stores, []);
    assert.equal(state.finalResult.code, 'SUC_FIND_00000');
    assert.equal(state.finalResult.count, 0); assert.equal(state.hooks.length, 2);
});

test('real pipeline copied request loses private admission before any Mongo find or count', async t => {
    const state = fixture(t); state.copyRequest = true;
    await assert.rejects(merchant.workspace(input()), { code: 'ERR_AUTH_00003' });
    assert.equal(state.sameRequest, false);
    assert.equal(state.findCalls, 0); assert.equal(state.countCalls, 0); assert.equal(state.hooks.length, 0);
});

for (const [name, change] of [
    ['failed code', result => { result.code = 'ERR_FIND_00000'; }],
    ['non-success code', result => { result.code = 'NO_DATA'; }],
    ['present undefined code', result => { result.code = undefined; }],
    ['null code', result => { result.code = null; }],
    ['numeric code', result => { result.code = 1; }],
    ['inherited failed code', result => { Object.setPrototypeOf(result, { code: 'ERR_FIND_00000' }); }],
    ['failed success', result => { result.success = false; }],
    ['negative acknowledgement', result => { result.acknowledged = false; }],
    ['error marker', result => { result.error = true; }],
    ['error list', result => { result.errors = ['failed']; }],
    ['malformed errors', result => { result.errors = {}; }],
    ['missing count', result => { delete result.count; }],
    ['string count', result => { result.count = '1'; }],
    ['count mismatch', result => { result.count = 0; }],
    ['copied query', result => { result.query = clone(result.query); }],
    ['copied options', result => { result.options = clone(result.options); }],
]) {
    test('real Mongo early projection rejects ' + name, async t => {
        const state = fixture(t); state.beforeProjection = (_request, result) => change(result);
        await assert.rejects(merchant.workspace(input()), { code: 'ERR_AUTH_00003' });
        assert.equal(state.findCalls, 1); assert.equal(state.countCalls, 1);
        assert.equal(state.finalResult, undefined);
    });
}

test('early code omission cannot be reused by a substituted receiver or a second projection', async t => {
    const state = fixture(t);
    state.beforeHook = (_request, _response, receiver) => { state.request.schemaModel = { ...receiver }; };
    await assert.rejects(merchant.workspace(input()), { code: 'ERR_AUTH_00003' });
    state.beforeHook = (_request, response, _receiver, index) => { if (index > 0) delete response.success.code; };
    state.hooks = [];
    await assert.rejects(merchant.workspace(input()), { code: 'ERR_AUTH_00003' });
    assert.equal(state.hooks.length, 2);
});

test('real early projection still rejects foreign Store ownership and fresh Profile denial', async t => {
    const state = fixture(t); state.records[0].enterpriseRef.code = 'foreign';
    await assert.rejects(merchant.workspace(input()), { code: 'ERR_AUTH_00003' });
    state.records[0].enterpriseRef.code = 'issuer';
    state.beforeProjection = () => { state.scopes.deniedScopes = [{ scopeType: 'STORE', scopeCode: 'own' }]; };
    await assert.rejects(merchant.workspace(input()), { code: 'ERR_AUTH_00003' });
    assert.equal(state.finalResult, undefined);
});

for (const [name, change] of [
    ['missing code', result => { delete result.code; }],
    ['failed code', result => { result.code = 'ERR_FIND_00000'; }],
    ['non-string code', result => { result.code = { toString: () => 'SUC_FIND_00000' }; }],
    ['negative acknowledgement', result => { result.acknowledged = false; }],
    ['failed success', result => { result.success = false; }],
    ['error marker', result => { result.error = true; }],
    ['error list', result => { result.errors = ['failed']; }],
    ['count mismatch', result => { result.count = 0; }],
]) {
    test('strict final generated Store response rejects ' + name + ' after genuine projection', async t => {
        const state = fixture(t); state.afterGet = change;
        await assert.rejects(merchant.workspace(input()), { code: 'ERR_AUTH_00003' });
        assert.equal(state.hooks.length, 2);
    });
}

test('code-less arbitrary override and forged/copied hook calls do not acquire an early envelope exception', async t => {
    const state = fixture(t);
    SERVICE.DefaultStoreService.get = async request => {
        const response = { success: { count: 1, result: clone(state.records), query: request.query, options: request.searchOptions } };
        await assert.rejects(owner.providerResult({ ...request, schemaModel: state.model }, response, state.model),
            { code: 'ERR_AUTH_00003' });
        return response.success;
    };
    await assert.rejects(merchant.workspace(input()), { code: 'ERR_AUTH_00003' });
    assert.equal(state.findCalls, 0); assert.equal(state.countCalls, 0);
});

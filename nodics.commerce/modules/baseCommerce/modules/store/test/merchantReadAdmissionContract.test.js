/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module store/test/merchantReadAdmissionContract @description Exercises actual generated access and protected-read seams with canonical Digital staff parsing; fixtures do not qualify native Profile or persistence. @layer test @owner store */
const test = require('node:test'), assert = require('node:assert/strict');
const root = '../../../../../../';
const merchant = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceMerchantService');
const owner = require('../src/service/defaultStoreMerchantReadService');
const context = require('../src/service/defaultStoreContextService');
const schemas = require('../src/schemas/schemas').store;
const properties = require('../config/properties');
const access = require(root + 'nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
const schemaOwner = require(root + 'nodics.foundation/modules/nDatabase/database/src/service/schema/defaultDatabaseSchemaHandlerService');
const policy = require(root + 'nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService');
const initializer = { ...require(root + 'nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService'), LOG: { debug() {} } };
let scopes, calls, profileReads, records, mutate, model, retained;
const clone = value => structuredClone(value);
const input = () => ({ tenant: 'tenant', authorization: 'Bearer fixture-only',
    authData: { principalType: 'human', tokenType: 'access', loginId: 'merchant', tenant: 'tenant',
        entCode: 'issuer', userGroups: ['employeeUserGroup', 'commerceMerchantUserGroup'] }, payload: {} });
const allow = code => ({ scopeType: 'STORE', scopeCode: code, enterpriseCode: 'issuer',
    capabilityCode: 'digitalCore', permissionCode: 'commerce.coupon.pos.redeem' });
const step = (method, request, response) => new Promise((resolve, reject) => initializer[method](request, response, {
    nextSuccess: resolve, error: (_r, _s, error) => reject(error)
}));
test.beforeEach(() => {
    scopes = { principalCode: 'merchant', principalType: 'human', scopes: [allow('own')], deniedScopes: [] };
    calls = []; profileReads = 0; mutate = undefined; retained = undefined;
    records = [{ _id: 'id', code: 'own', tenant: 'tenant', status: 'ACTIVE', active: true, name: 'Own outlet',
        revision: 3, enterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: 'issuer' },
        privateField: 'must-not-escape', defaultCurrency: 'AED', primaryLocationRef: { code: 'private-location' } }];
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.UTILS = { isBlank: value => !value || Object.keys(value).length === 0 };
    const digitalCore = { merchantRedemption: { enabled: true, storeScope: { enabled: true, qualified: true },
        presentation: { storeLabel: 'Outlet' } } };
    global.CONFIG = { get: key => ({ schemaPolicies: properties.schemaPolicies, accessPoints: {
        readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3, fullAccessPoint: 10 },
        runtimeRole: 'COMMERCE', digitalCore, promotion: {} }[key]) };
    const effective = schemaOwner.applyNamedSchemaPolicies('store', clone(schemas));
    model = { moduleName: 'store', schemaName: 'store', rawSchema: effective.store };
    global.SERVICE = {
        DefaultDigitalCommerceMerchantService: merchant, DefaultStoreMerchantReadService: owner,
        DefaultStoreContextService: context, DefaultSchemaAccessHandlerService: access,
        DefaultSchemaReadAccessPolicyService: policy,
        DefaultRecordOwnershipPolicyService: { enforce: async () => true },
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ['commerce.coupon.pos.redeem'],
            isPermissionGranted: (p, permissions) => permissions.includes(p) || permissions.includes('*') },
        DefaultModuleService: { invokeModule: async request => {
            assert.equal(request.apiName, '/identity/scopes/me');
            assert.equal(request.header.Authorization, 'Bearer fixture-only');
            profileReads++; return { data: clone(scopes) };
        } },
        DefaultStoreService: { get: async request => {
            calls.push(clone(request)); retained = request; request.schemaModel = model;
            await step('checkAccess', request, {});
            await step('buildOptions', request, {});
            await step('lookupCache', request, {});
            if (mutate) await mutate(request);
            const result = { success: { code: 'SUC_FIND_00000', count: records.length, result: clone(records) } };
            await policy.providerResult(request, result, model);
            return result.success;
        } }
    };
});

test('workspace reads only exact Profile Store grants with original narrow auth and projects outlet choices', async () => {
    const original = input();
    const result = await merchant.workspace(original);
    assert.deepEqual(result.stores, [{ code: 'own', name: 'Own outlet', revision: 3 }]);
    assert.deepEqual(calls.map(r => r.query), [{ tenant: 'tenant', code: 'own', status: 'ACTIVE' }]);
    assert.deepEqual(calls[0].authData, original.authData);
    assert(profileReads >= 2, 'fresh Profile authority before query and before response');
    assert(!JSON.stringify(result).includes('privateField'));
    assert.equal(original.scopes, undefined);
});

test('exact merchant outlet resolution uses the same private generated read', async () => {
    assert.deepEqual(await context.resolveMerchantStore({ ...input(), payload: { storeCode: 'own' } }, 'issuer'),
        { code: 'own', name: 'Own outlet', revision: 3, enterpriseCode: 'issuer' });
    await assert.rejects(context.resolveMerchantStore({ ...input(), payload: { storeCode: 'own' } }, 'foreign'));
});

test('merchant schema read point does not admit generic reads, exports or mutations', async () => {
    const request = { ...input(), query: { code: 'own' }, schemaModel: model };
    await step('checkAccess', request, {});
    await assert.rejects(policy.providerRead(request, model), { code: 'ERR_AUTH_00003' });
    await assert.rejects(policy.providerResult(request, { success: { code: 'SUC_FIND_00000', count: 1, result: clone(records) } }, model));
    assert.equal(access.getAccessPoint(request.authData, model.rawSchema.accessGroups), 1);
    for (const path of ['save/defaultModelSaveInitializerService', 'update/defaultModelsUpdateInitializerService',
        'remove/defaultModelsRemoveInitializerService']) {
        const mutation = { ...require(root + 'nodics.foundation/modules/nDatabase/database/src/service/procs/' + path),
            LOG: { debug() {} } };
        await assert.rejects(new Promise((resolve, reject) => mutation.checkAccess(request, {}, {
            nextSuccess: resolve, error: (_r, _s, error) => reject(error)
        })), { code: 'ERR_AUTH_00003' });
    }
    for (const schema of ['salesChannel', 'pointOfService']) {
        const effective = schemaOwner.applyNamedSchemaPolicies('store', clone(schemas))[schema];
        assert.equal(access.getAccessPoint(request.authData, effective.accessGroups), 0);
    }
});

test('broader ALLOW grants, foreign qualifiers and matching DENY never enumerate Stores', async () => {
    for (const selection of [
        { scopes: [{ scopeType: 'GLOBAL', scopeCode: '*' }], deniedScopes: [] },
        { scopes: [{ ...allow('own'), tenantCode: 'foreign' }], deniedScopes: [] },
        { scopes: [{ ...allow('own'), capabilityCode: 'unrelated' }], deniedScopes: [] },
        { scopes: [allow('own')], deniedScopes: [{ scopeType: 'GLOBAL', scopeCode: '*' }] },
        { scopes: [allow('own')], deniedScopes: [{ scopeType: 'ENTERPRISE', scopeCode: 'issuer' }] },
        { scopes: [allow('own')], deniedScopes: [{ scopeType: 'STORE', scopeCode: 'own' }] }
    ]) {
        scopes = { ...scopes, ...selection };
        assert.deepEqual(await owner.list(input()), []);
        await assert.rejects(owner.read(input(), 'own'));
    }
    assert.equal(calls.length, 0);
});

test('foreign row scope and Profile revocation during read refuse without exposing raw Store fields', async () => {
    records[0].enterpriseRef.code = 'foreign';
    await assert.rejects(owner.read(input(), 'own'));
    records[0].enterpriseRef.code = 'issuer';
    mutate = async () => { scopes.deniedScopes = [{ scopeType: 'STORE', scopeCode: 'own' }]; };
    await assert.rejects(owner.read(input(), 'own'));
});

test('copied, changed, expired and no-hook private requests cannot gain Store access', async () => {
    mutate = async request => {
        await assert.rejects(policy.providerRead({ ...request }, model));
        request.query.code = 'foreign';
    };
    await assert.rejects(owner.read(input(), 'own'));
    await assert.rejects(policy.providerRead(retained, model));
    SERVICE.DefaultStoreService.get = async () => ({ code: 'SUC_FIND_00000', count: 1, result: clone(records) });
    await assert.rejects(owner.read(input(), 'own'), 'a success label alone is not generated-hook evidence');
});

test('ordinary admin, operator and service reads retain effective access without Digital admission', async () => {
    for (const group of ['adminGroup', 'commerceOperatorUserGroup', 'serviceAccountUserGroup']) {
        const request = { tenant: 'tenant', authData: { userGroups: [group] }, query: { status: 'ACTIVE' } };
        assert.equal(await policy.providerRead(request, model), true);
        const response = { success: { result: clone(records) } };
        assert.equal(await policy.providerResult(request, response, model), response);
        assert.equal(response.success.result[0].privateField, 'must-not-escape');
    }
});

test('later schema narrowing still denies before the provider despite owner admission', async () => {
    delete model.rawSchema.accessGroups.commerceMerchantUserGroup;
    await assert.rejects(owner.read(input(), 'own'), { code: 'ERR_AUTH_00003' });
});

test('unbounded, duplicate and contradictory results cannot be projected as outlet success', async () => {
    records.push(clone(records[0]));
    await assert.rejects(owner.read(input(), 'own'));
    scopes.scopes = Array.from({ length: 101 }, (_, n) => allow('store' + n));
    calls = [];
    await assert.rejects(owner.list(input()));
    assert.equal(calls.length, 0);
});

test('customer, missing permission and failed Profile responses refuse before Store queries', async () => {
    await assert.rejects(owner.list({ ...input(), authData: { ...input().authData, principalType: 'customer' } }));
    SERVICE.DefaultSecuredRequestPipelineService.getGrantedPermissions = () => [];
    await assert.rejects(owner.list(input()));
    SERVICE.DefaultSecuredRequestPipelineService.getGrantedPermissions = () => ['commerce.coupon.pos.redeem'];
    SERVICE.DefaultModuleService.invokeModule = async () => ({ success: false, data: clone(scopes) });
    await assert.rejects(owner.list(input()));
    assert.equal(calls.length, 0);
});

test('forged scope context cannot directly invoke the selected generated-read helper', async () => {
    await assert.rejects(owner.readSelected({ ...input(), enterpriseCode: 'issuer', scopes: clone(scopes) }, 'own'));
    assert.equal(calls.length, 0);
});

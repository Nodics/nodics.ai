/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const service = require('../src/service/identity/defaultProfileReferenceService');
const controller = require('../src/controller/identity/defaultProfileReferenceController');
const settings = require('../config/properties').profileReferenceRead;
const auth = { tenant: 'tenant-a', tokenType: 'service', principalType: 'service',
    runtimeScope: { instanceCode: 'runtime-1' }, modules: ['profile'], permissions: ['profile.address.reference.read', 'profile.enterprise.reference.read'] };
const calls = [], actor = { userGroups: ['serviceAccountUserGroup'] };
global.CONFIG = { get: () => settings };
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
let response = { code: 'SUC_FIND_00000', result: [{ code: 'REF_1', name: { en: 'Display name' }, addressLine1: 'Street', city: 'City', countryCode: 'AE', tenant: { properties: { secret: true } }, apiKey: 'private', contacts: ['private'] }] };
const owner = { get: async request => { calls.push(request); return response; } };
global.SERVICE = { DefaultAddressService: owner, DefaultEnterpriseService: owner, DefaultProfileReferenceService: service,
    DefaultIdentityGovernanceService: { getSystemAuthData: () => actor } };
const request = extra => ({ tenant: 'tenant-a', authData: auth, payload: { type: 'address', codes: ['REF_1'] }, ...extra });
(async () => {
    const result = await service.read(request());
    assert.deepEqual(result.result, [{ code: 'REF_1', addressLine1: 'Street', city: 'City', countryCode: 'AE' }]);
    assert.deepEqual(calls[0].query, { code: { $in: ['REF_1'] }, active: true });
    assert.equal(calls[0].tenant, 'tenant-a');
    assert.equal(calls[0].authData, actor);
    assert.equal(calls[0].options.recursive, false);
    const enterprise = await service.read(request({ payload: { type: 'enterprise', codes: ['REF_1'] } }));
    assert.deepEqual(enterprise.result, [{ code: 'REF_1', name: { en: 'Display name' } }]);
    for (const change of [{ tenant: 'tenant-b' }, { modules: [] }, { permissions: [] }, { permissions: ['profile.enterprise.reference.read'] }, { tokenType: 'access' }, { principalType: 'customer' }, { runtimeScope: {} }]) {
        await assert.rejects(service.read(request({ authData: { ...auth, ...change } })), { code: 'ERR_AUTH_00003' });
    }
    for (const payload of [{ type: 'employee', codes: ['REF_1'] }, { type: 'constructor', codes: ['REF_1'] }, { type: 'address', codes: [] }, { type: 'address', codes: [{ $ne: null }] }, { type: 'address', codes: Array(101).fill('REF_1') }]) {
        await assert.rejects(service.read(request({ payload })));
    }
    assert.equal(calls.length, 2, 'Rejected callers and selectors must not reach persistence');
    const mapped = await controller.read({ tenant: 'tenant-a', authData: auth,
        httpRequest: { body: { type: 'enterprise', codes: ['REF_1'], tenant: 'tenant-b', authData: { userGroups: ['adminGroup'] } } } });
    assert.deepEqual(mapped.result, enterprise.result);
    assert.equal(calls[2].tenant, 'tenant-a');
    response = { code: 'ERR_SYS_00000', result: [] };
    await assert.rejects(service.read(request()), /unavailable/);
    response = { code: 'SUC_FIND_00000', result: [{ code: 'OTHER', addressLine1: 'private' }] };
    assert.deepEqual((await service.read(request())).result, []);
    const customized = { ...service, settings: () => ({ ...settings, maximumCodes: 1 }), project: record => ({ code: record.code }) };
    await assert.rejects(customized.read(request({ payload: { type: 'address', codes: ['A', 'B'] } })));
    response = { code: 'SUC_FIND_00000', result: [{ code: 'REF_1', addressLine1: 'Street' }] };
    assert.deepEqual((await customized.read(request())).result, [{ code: 'REF_1' }]);
    console.log('Profile scoped reference read contract passed');
})().catch(error => { console.error(error); process.exitCode = 1; });

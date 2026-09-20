/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const service = require('../src/service/defaultLocationOperationService');
const auth = { tokenType: 'service', principalType: 'service', tenant: 'tenant-a',
    runtimeScope: { instanceCode: 'runtime-1' }, modules: ['locationCore'], permissions: ['location.location.read'] };
const calls = [];
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
global.SERVICE = { DefaultLocationService: { get: async request => { calls.push(request); return { code: 'SUC_FIND_00000', result: [{ code: 'LOC_1' }] }; } } };
(async () => {
    await service.read({ tenant: 'tenant-a', authData: auth, locationCode: 'LOC_1' });
    assert.deepEqual(calls[0].query, { code: 'LOC_1' });
    assert.equal(calls[0].tenant, 'tenant-a');
    assert.deepEqual(calls[0].authData.userGroups, ['serviceAccountUserGroup']);
    assert.equal(auth.userGroups, undefined, 'Incoming runtime credential must not gain groups');
    for (const change of [{ tenant: 'tenant-b' }, { modules: [] }, { permissions: [] }, { tokenType: 'access' }, { principalType: 'customer' }, { runtimeScope: {} }]) {
        assert.throws(() => service.read({ tenant: 'tenant-a', authData: { ...auth, ...change }, locationCode: 'LOC_1' }), { code: 'ERR_AUTH_00003' });
    }
    assert.throws(() => service.read({ tenant: 'tenant-a', authData: auth, locationCode: { $ne: null } }), { code: 'ERR_LOCATION_CODE_REQUIRED' });
    assert.equal(calls.length, 1);
    const human = { userGroups: ['employeeUserGroup'] };
    await service.read({ tenant: 'tenant-a', authData: human, locationCode: 'LOC_1' });
    assert.equal(calls[1].authData, human, 'Human schema authorization stays unchanged');
    const customized = { ...service, readContext: context => ({ ...context, marker: 'later-layer' }) };
    await customized.read({ tenant: 'tenant-a', locationCode: 'LOC_1' });
    assert.equal(calls[2].marker, 'later-layer');
    console.log('Location scoped runtime read contract passed');
})().catch(error => { console.error(error); process.exitCode = 1; });

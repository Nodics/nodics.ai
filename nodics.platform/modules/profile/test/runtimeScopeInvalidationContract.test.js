/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/runtimeScopeInvalidationContract @description Ensures acknowledged runtime scope changes invalidate affected principals through the existing Profile identity owner. @layer test @owner profile */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const governance = require('../src/service/identity/defaultPrincipalScopeGovernanceService');
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(code, message) { super(message || code); } } };
test('scope changes deduplicate affected principals and await the existing employee mutation', async () => {
    const request = { tenant: 'warehouse' }, updated = [];
    governance.captureRuntimeScopePrincipals(request, [{ scopeType: 'RUNTIME_DEPLOYMENT', principalCode: 'jobs-1' }, { scopeType: 'GLOBAL', principalCode: 'admin' }]);
    governance.captureRuntimeScopePrincipals(request, [{ scopeType: 'RUNTIME_DEPLOYMENT', principalCode: 'jobs-1' }, { scopeType: 'RUNTIME_DEPLOYMENT', principalCode: 'jobs-2' }]);
    let release;
    global.SERVICE = { DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
        DefaultEmployeeService: { update: async options => { updated.push(options); if (updated.length === 1) await new Promise(resolve => { release = resolve; }); return { code: 'SUC_UPD_00000', result: { acknowledged: true, matchedCount: 1, modifiedCount: 1 } }; } } };
    let complete = false; const pending = governance.invalidateRuntimeScopeCredentials(request).then(() => { complete = true; });
    await Promise.resolve(); assert.equal(complete, false); assert.equal(updated.length, 1); release(); await pending;
    assert.deepEqual(updated.map(item => item.query.loginId), ['jobs-1', 'jobs-2']);
    assert(updated.every(item => item.tenant === 'warehouse' && item.model.$set.authVersion === 1));
});
test('failed propagation cannot be reported as a completed scope change', async () => {
    SERVICE.DefaultEmployeeService.update = async () => ({ success: false });
    await assert.rejects(governance.invalidateRuntimeScopeCredentials({ tenant: 'warehouse', runtimeScopePrincipalCodes: ['jobs-1'] }), /invalidation/);
    SERVICE.DefaultPrincipalScopeAssignmentService = { get: async () => ({ success: false, result: [] }) };
    await assert.rejects(governance.prepareRuntimeScopeRemoval({ tenant: 'warehouse', query: { code: 'grant' } }), /authoritative/);
});


test('canonical generated envelopes govern scope reads and exactly one acknowledged principal mutation', async () => {
    SERVICE.DefaultPrincipalScopeAssignmentService = { get: async () => ({ code: 'SUC_FIND_00000', result: [{ scopeType: 'RUNTIME_DEPLOYMENT', principalCode: 'jobs-1' }] }) };
    const request = { tenant: 'warehouse', query: { code: 'grant' } };
    await governance.prepareRuntimeScopeRemoval(request);
    assert.deepEqual(request.runtimeScopePrincipalCodes, ['jobs-1']);
    for (const response of [{ success: true }, { code: 'ERR_UPD_00000', result: { acknowledged: true, matchedCount: 1 } },
        { code: 'SUC_UPD_00000', result: { acknowledged: false, matchedCount: 1 } },
        { code: 'SUC_UPD_00000', result: { acknowledged: true, matchedCount: 0 } },
        { code: 'SUC_UPD_00000', result: { acknowledged: true, matchedCount: 2 } }]) {
        SERVICE.DefaultEmployeeService.update = async () => response;
        await assert.rejects(governance.invalidateRuntimeScopeCredentials(request), /invalidation/);
    }
});


test('governed reset proves deleted principal absence and revokes its shared stamp', async () => {
    const authority = {}, revoked = [];
    const request = { tenant: 'warehouse', localResetAuthority: authority, runtimeScopePrincipalCodes: ['jobs-1'] };
    SERVICE.DefaultLocalResetProviderService = { authorizes: input => input.localResetAuthority === authority };
    SERVICE.DefaultEmployeeService.get = async input => {
        assert.equal(input.tenant, 'warehouse'); assert.equal(input.query.loginId, 'jobs-1');
        return { code: 'SUC_FIND_00000', result: [] };
    };
    SERVICE.DefaultEmployeeService.update = async () => { throw Error('Unexpected missing-principal update'); };
    SERVICE.DefaultPrincipalSecurityStampService = { revoke: async (...args) => { revoked.push(args); return 7; } };
    await governance.invalidateRuntimeScopeCredentials(request);
    assert.deepEqual(revoked, [['warehouse', 'jobs-1']]);
    await assert.rejects(governance.invalidateRuntimeScopeCredentials({ ...request, localResetAuthority: {} }), /missing-principal/);
    SERVICE.DefaultEmployeeService.get = async () => ({ success: false, code: 'SUC_FIND_00000', result: [] });
    await assert.rejects(governance.invalidateRuntimeScopeCredentials(request), /authoritative/);
    SERVICE.DefaultEmployeeService.get = async () => ({ code: 'SUC_FIND_00000', result: [] });
    SERVICE.DefaultPrincipalSecurityStampService.revoke = async () => { throw Error('Shared cache unavailable'); };
    await assert.rejects(governance.invalidateRuntimeScopeCredentials(request), /cache unavailable/);
    SERVICE.DefaultPrincipalSecurityStampService.revoke = async () => false;
    await assert.rejects(governance.invalidateRuntimeScopeCredentials(request), /revocation/);
    SERVICE.DefaultEmployeeService.get = async () => ({ code: 'SUC_FIND_00000', result: [{ loginId: 'jobs-1' }] });
    SERVICE.DefaultEmployeeService.update = async () => ({ code: 'SUC_UPD_00000', result: { acknowledged: true, matchedCount: 0 } });
    await assert.rejects(governance.invalidateRuntimeScopeCredentials(request), /invalidation/);
    delete SERVICE.DefaultLocalResetProviderService;
});

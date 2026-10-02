/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module profile/test/principalScopeLifetimeContract
 * @description Exercises real Profile scope lifetime and authoritative-read boundaries.
 * @owner profile @layer test
 * These are service fixtures, not deployed identity or database acceptance.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../src/service/identity/defaultPrincipalScopeGovernanceService');
const policy = require('../config/properties').principalAuthorizationScopes;
global.CONFIG = { get: key => key === 'principalAuthorizationScopes' ? policy : undefined };
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
const auth = { principalType: 'human', loginId: 'member@example.test', userGroups: [] };
const at = '2026-09-30T08:00:00.000Z';
const scope = (changes = {}) => ({ code: 'member-scope', principalType: 'human', principalCode: auth.loginId,
    scopeType: 'ENTERPRISE', scopeCode: 'example', enterpriseCode: 'example', tenantCode: 'exampleTenant',
    effect: 'ALLOW', status: 'ACTIVE', inheritanceMode: 'DIRECT', ...changes });

for (const field of ['effectiveFrom', 'effectiveTo']) {
    for (const value of ['not-a-date', [], {}, 123]) {
        test('rejects one-sided malformed ' + field + ':' + JSON.stringify(value), () => {
            assert.throws(() => source.validateAssignment(scope({ [field]: value })), error => error.code === 'ERR_AUTH_00003');
        });
    }
}
test('an expiry is exclusive, including its exact boundary', () => {
    assert.equal(source.isEffective(scope({ effectiveTo: at }), at), false);
});
test('a finite effective window allows its start and rejects a future start', () => {
    assert.equal(source.isEffective(scope({ effectiveFrom: at, effectiveTo: '2026-10-01T08:00:00Z' }), at), true);
    assert.equal(source.isEffective(scope({ effectiveFrom: '2026-10-01T08:00:00Z' }), at), false);
});
test('explicit inactivity cannot grant access despite an ACTIVE label', () => {
    assert.equal(source.isEffective(scope({ active: false }), at), false);
});
test('malformed current time cannot make a scope effective', () => {
    assert.equal(source.isEffective(scope(), 'invalid-clock'), false);
});
test('malformed effective time on a DENY cannot be silently discarded', () => {
    assert.throws(() => source.resolveAssignments(auth, [scope(), scope({ code: 'deny', effect: 'DENY', effectiveTo: 'broken' })], { now: at }), error => error.code === 'ERR_AUTH_00003');
});
test('a missing stored lifecycle state must not inherit an ACTIVE default during resolution', () => {
    assert.equal(source.resolveAssignments(auth, [scope({ status: undefined })], { now: at }).scopeCount, 0);
});

for (const response of [undefined, {}, { code: 'ERR_DBS_00000', result: [] }, { code: 'SUC_DBS_00000', result: {} }, { code: 'SUC_DBS_00000', result: [], errors: ['failure'] }]) {
    test('failed or malformed authoritative read never becomes an empty permitted scope list: ' + JSON.stringify(response), async () => {
        global.SERVICE = { DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ principalType: 'service' }) },
            DefaultPrincipalScopeAssignmentService: { get: async () => response } };
        await assert.rejects(source.getEffectiveScopes({ tenant: 'exampleTenant', authData: auth }), error => error.code === 'ERR_AUTH_00003');
    });
}
test('valid owner reads bypass item cache and retain exact principal scope', async () => {
    let observed;
    global.SERVICE = { DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ principalType: 'service' }) },
        DefaultPrincipalScopeAssignmentService: { get: async request => { observed = request; return { code: 'SUC_DBS_00000', result: [scope()] }; } } };
    const result = await source.getEffectiveScopes({ tenant: 'exampleTenant', authData: auth });
    assert.equal(observed.options.skipItemCache, true);
    assert.equal(result.scopeCount, 1);
    assert.equal(result.scopes[0].enterpriseCode, 'example');
});
test('valid DENY precedence survives lifetime validation', () => {
    const result = source.resolveAssignments(auth, [scope(), scope({ code: 'deny', effect: 'DENY' })], { now: at });
    assert.equal(result.scopeCount, 0); assert.equal(result.deniedScopes.length, 1);
});

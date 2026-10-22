/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/runtimeDeploymentSeedPreservation @description Explicit seed admission, placement preservation and insert-only runtime grants. @owner profile @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../src/service/identity/defaultRuntimeAuthorizationService');
const wrapper = require('../src/service/principalScopeAssignment/defaultPrincipalScopeAssignmentService');
function fixture() {
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    const rows = [], writes = [], checks = [], privateReads = [];
    const owner = { ...wrapper,
        get: async request => {
            const selectors = request.query.$or || [request.query];
            const result = rows.filter(row => selectors.some(selector => Object.entries(selector).every(([key, value]) =>
                (key.startsWith('runtimeScope.') ? row.runtimeScope?.[key.slice(13)] : row[key]) === value)));
            return { code: 'SUC_READ', count: result.length, result: structuredClone(result) };
        },
        save: async request => {
            assert.equal(request.query, undefined);
            assert.deepEqual(request.options, { insertOnly: true });
            if (rows.some(row => row.code === request.model.code)) throw new Error('duplicate');
            writes.push(structuredClone(request)); rows.push({ ...structuredClone(request.model), _id: 'id' });
            return { code: 'SUC_SAVE', result: rows.at(-1) };
        },
    };
    global.SERVICE = { DefaultRuntimeAuthorizationService: runtime, DefaultPrincipalScopeAssignmentService: owner,
        DefaultIdentityCatalogueGovernanceService: { authorizeSeed: async request => { assert.equal(request.authData, auth); } },
        DefaultPrincipalSecurityStampGovernanceService: {
            inventory: async (service, tenant, query) => {
                assert.equal(service, owner); assert.equal(tenant, 'default');
                privateReads.push(structuredClone(query));
                return (await service.get({ query })).result;
            },
        },
        DefaultIdentityCatalogueService: { requirePermissions: async permissions => { checks.push(permissions); } } };
    const auth = { userGroups: ['adminGroup'] };
    const model = { code: 'grant', scopeCode: 'grant', scopeType: 'RUNTIME_DEPLOYMENT', active: true,
        principalType: 'service', principalCode: 'apiAdmin', tenantCode: 'default', enterpriseCode: 'default',
        effect: 'ALLOW', status: 'ACTIVE', inheritanceMode: 'DIRECT',
        runtimeScope: { projectCode: 'project', environmentCode: 'production', serverCode: 'server', instanceCode: 'instance', modules: ['profile'], permissions: ['profile.read'] } };
    return { owner, rows, writes, checks, privateReads, model,
        request: { tenant: 'default', authData: auth, models: [model] } };
}
test('explicit grant seeds use catalogue admission and insert-only owner saves, then preserve revoked/narrowed records', async () => {
    for (const environment of ['kickoffLocal', 'production']) {
        const f = fixture(); f.model.runtimeScope.environmentCode = environment;
        const source = structuredClone(f.model);
        await f.owner.ensureDeploymentAll(f.request);
        assert.equal(f.writes.length, 1); assert.equal(f.checks.length, 1);
        assert.equal(f.privateReads.length, 3);
        Object.assign(f.rows[0], { active: false, status: 'REVOKED', effect: 'DENY' });
        f.rows[0].runtimeScope.permissions = []; f.rows[0].runtimeScope.modules = [];
        const original = structuredClone(f.rows);
        await f.owner.ensureDeploymentAll(f.request);
        assert.deepEqual(f.rows, original); assert.equal(f.writes.length, 1);
        assert.equal(f.privateReads.length, 4);
        assert.deepEqual(f.model, source);
    }
});
test('deployment seed admission cannot be replaced by public flags or header groups', async () => {
    const f = fixture();
    SERVICE.DefaultIdentityCatalogueGovernanceService.authorizeSeed = async () => { throw new Error('not admitted'); };
    await assert.rejects(f.owner.ensureDeploymentAll({ ...f.request, isSystem: true, startup: true }), /not admitted/);
    assert.equal(f.writes.length, 0);
});
test('conflicting retained placement and identity refuse before any batch writes', async () => {
    for (const key of ['principalCode', 'tenantCode', 'enterpriseCode', 'scopeCode']) {
        const f = fixture(); f.rows.push({ ...structuredClone(f.model), _id: 'id', [key]: 'other' });
        await assert.rejects(f.owner.ensureDeploymentAll(f.request)); assert.equal(f.writes.length, 0);
    }
    for (const key of ['projectCode', 'environmentCode', 'serverCode', 'instanceCode']) {
        const f = fixture(); const original = { ...structuredClone(f.model), _id: 'id' };
        original.runtimeScope[key] = 'other'; f.rows.push(original);
        f.request.models.unshift({ ...structuredClone(f.model), code: 'new', scopeCode: 'new', principalCode: 'other-service' });
        await assert.rejects(f.owner.ensureDeploymentAll(f.request)); assert.equal(f.writes.length, 0);
    }
});
test('malformed source, duplicate placement, incomplete reads and unavailable permission references refuse', async () => {
    for (const mutate of [f => { f.model.runtimeScope.permissions = ['*']; }, f => { f.model.tenantCode = 'other'; },
        f => { f.request.models.push({ ...structuredClone(f.model), code: 'alias', scopeCode: 'alias' }); },
        f => { SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory = async () => [{ _id: 'one' }, { _id: 'two' }]; },
        f => { SERVICE.DefaultIdentityCatalogueService.requirePermissions = async () => { throw new Error('missing permission'); }; }]) {
        const f = fixture(); mutate(f); await assert.rejects(f.owner.ensureDeploymentAll(f.request)); assert.equal(f.writes.length, 0);
    }
});

test('an existing alternate-code binding cannot be shadowed by another assignment', async () => {
    const f = fixture();
    f.rows.push({ ...structuredClone(f.model), _id: 'id', code: 'retained-alias', scopeCode: 'retained-alias' });
    await assert.rejects(f.owner.ensureDeploymentAll(f.request)); assert.equal(f.writes.length, 0);
});

test('deployment seeds refuse incomplete private inventory and unsuccessful saves without retries or false success receipts', async () => {
    for (const result of [undefined, null, {}, 'rows', [{ _id: 'one' }, { _id: 'two' }]]) {
        const f = fixture();
        SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory = async () => result;
        await assert.rejects(f.owner.ensureDeploymentAll(f.request));
        assert.equal(f.writes.length, 0);
    }
    for (const flag of [false, 'false', 'true', 0, null]) {
        for (const outcome of [{ acknowledged: flag }, { success: flag }, { result: { acknowledged: flag } }]) {
            const f = fixture(), save = f.owner.save;
            f.owner.save = async request => ({ ...await save(request), ...outcome });
            await assert.rejects(f.owner.ensureDeploymentAll(f.request));
            assert.equal(f.writes.length, 1);
        }
    }
});

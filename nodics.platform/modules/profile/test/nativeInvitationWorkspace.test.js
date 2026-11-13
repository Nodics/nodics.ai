/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module profile/test/nativeInvitationWorkspace
 * @description Protects independent unused-invitation projection and qualification without enabling membership operations.
 * @layer test
 * @owner profile
 */
const test = require('node:test'), assert = require('node:assert/strict');
const source = require('../src/service/enterprise/defaultEnterpriseTeamAdministrationService');
const properties = require('../config/properties');
const capability = require('../src/service/defaultProfileBackofficeCapabilityService');

test('native invitation task publishes withdrawal only for the exact unused non-designated assignment', async () => {
    const enterprise = { code: 'business', name: 'Business', defaultAdminAssignmentCode: 'admin' };
    const rows = [
        { code: 'unused', status: 'ACTIVE' }, { code: 'registered', status: 'REGISTERED' },
        { code: 'started', status: 'ACTIVE', registration: { phase: 'PREPARED' } },
        { code: 'admin', status: 'ACTIVE' }, { code: 'linked', status: 'ACTIVE', membership: { phase: 'COMPLETE' } },
    ].map(x => ({ revision: 1, active: true, enterpriseCode: 'business', tenantCode: 'subject', normalizedEmail: x.code + '@example.test', ...x }));
    const configuration = structuredClone(properties.enterpriseManagement);
    Object.assign(configuration.teamAdministration, { enabled: true, serializedWritesQualified: true, invitationWithdrawalQualified: true });
    global.CONFIG = { get: key => key === 'enterpriseManagement' ? configuration : undefined };
    let reads = 0;
    global.SERVICE = { DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
        DefaultEnterpriseAccessAssignmentService: { get: async request => {
            reads++; assert.equal(request.tenant, 'authority'); assert.equal(request.searchOptions.pageSize, 101);
            assert.equal(request.options.skipItemCache, true); assert.deepEqual(request.query, { enterpriseCode: 'business', active: true });
            return { code: 'SUC_DBS_00000', result: rows, count: rows.length };
        } } };
    let admitted = false;
    const m = { enabled: () => false, authority: () => 'authority', base: () => ({ input: value => assert.deepEqual(value, {}) }),
        verifyAdministrator: async (_q, code) => { assert.equal(code, 'business'); admitted = true; },
        rows: envelope => envelope.result, project: async item => ({ code: item.code, status: item.status, revision: item.revision }) };
    const owner = { ...source, memberships: () => m, fail: code => { throw new Error(code); },
        enterpriseForAccess: async () => { assert.equal(admitted, true); return { enterprise, tenantCode: 'subject' }; },
        assignment: async code => ({ item: rows.find(x => x.code === code), enterprise }) };
    const request = { authData: { entCode: 'business' } };
    const result = await owner.workspace(request);
    assert.deepEqual(result.items.map(x => x.actions), [['WITHDRAW'], [], [], [], []]);
    assert.equal(result.items[2].registration, undefined);
    assert.equal(configuration.memberships.enabled, false);
    configuration.teamAdministration.invitationWithdrawalQualified = false;
    await assert.rejects(owner.workspace(request), /UNAVAILABLE/);
    assert.equal(reads, 1);
    configuration.teamAdministration.invitationWithdrawalQualified = true;
    rows[0].tenantCode = 'foreign';
    await assert.rejects(owner.workspace(request), /CONFLICT/);
    rows[0].tenantCode = 'subject';
    while (rows.length < 101) rows.push({ ...rows[0], code: 'overflow-' + rows.length });
    await assert.rejects(owner.workspace(request), /UNAVAILABLE/);
});

test('default Team exposure stays off; a selected withdrawal task does not advertise personal membership switching', () => {
    assert.equal(properties.apiExposure.categories.profileTeam.enabled, false);
    const configuration = structuredClone(properties.enterpriseManagement);
    delete configuration.workspace; // Aggregate authoring has its own owner; this fixture isolates Team discovery.
    Object.assign(configuration.teamAdministration, { enabled: true, serializedWritesQualified: true, invitationWithdrawalQualified: true });
    let exposed = true;
    global.CONFIG = { get: key => key === 'apiExposure' ? { categories: { profileTeam: { enabled: exposed } } } : undefined };
    const owner = { ...capability, getEnterpriseManagementConfig: () => configuration };
    let result = owner.getCapability();
    assert.equal(result.navigation.find(x => x.id === 'employees').backendWorkspace.workspaceCode, 'profile.enterpriseTeam');
    assert.equal(result.publicFeatureAvailability.features.enterpriseMembershipDiscovery, false);
    assert.equal(result.publicFeatureAvailability.features.enterpriseMembershipSwitch, false);
    exposed = false; result = owner.getCapability();
    assert.notEqual(result.navigation.find(x => x.id === 'employees')?.backendWorkspace?.workspaceCode, 'profile.enterpriseTeam');
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/test/identityAssessmentContract
 * @description Inert generated-owner fixtures for assessment admission, completeness, redaction and overrides; not live migration acceptance.
 * @layer test
 * @owner profile
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../src/service/identity/defaultIdentityGovernanceMigrationService');
const management = require('../src/service/enterprise/defaultEnterpriseManagementService');
const properties = require('../config/properties');
const statuses = require('../src/utils/statusDefinitions');

/** Creates isolated generated-service data; write attempts always fail. */
function fixture() {
    const policy = { ...properties.identityGovernance.migration.assessment, enabled: true, pageSize: 2 };
    global.CONFIG = { get: key => ({ defaultTenant: 'root', defaultEnterprise: 'platform',
        identityGovernance: { migration: { assessment: policy, serviceGroup: 'serviceAccountUserGroup', servicePrincipalCodes: [] } },
        enterpriseManagement: {} }[key]) };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.ENUMS = { ProfileRegistrationPhase: { COMPLETE: { key: 'COMPLETE' } },
        ProfileIdentityAssessmentConsistency: { TWO_PASS_OBSERVED_MATCH: { key: 'TWO_PASS_OBSERVED_MATCH' } } };
    const service = { ...source }, data = new Map(), calls = [];
    const request = { tenant: 'root', identityMigration: {}, authData: { tokenType: 'access',
        principalType: 'human', loginId: 'private-admin', tenant: 'root', entCode: 'platform',
        userGroups: ['runtimeConfigAdminUserGroup'], permissions: ['identity.migration.preview'] } };
    global.SERVICE = {
        DefaultEnterpriseManagementService: { ...management },
        DefaultIdentityGovernanceMigrationService: service,
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) }
    };
    const faults = {};
    for (const [kind, descriptor] of Object.entries(service.assessmentSources())) {
        global.SERVICE[descriptor.service] = {
            get: async input => {
                calls.push({ kind, ...input });
                const rows = data.get(input.tenant + ':' + kind) || [];
                const start = (input.searchOptions.pageNumber - 1) * input.searchOptions.pageSize;
                const response = { code: 'SUC_DBS_00000', count: rows.length,
                    result: structuredClone(rows.slice(start, start + input.searchOptions.pageSize)) };
                return faults.read ? faults.read(response, kind, input) : response;
            },
            save: async () => assert.fail('Assessment must not write'),
            update: async () => assert.fail('Assessment must not write'),
            delete: async () => assert.fail('Assessment must not write')
        };
    }
    data.set('root:tenants', [{ _id: 't-root', code: 'root' }]);
    data.set('root:enterprises', [{ _id: 'enterprise-root', code: 'platform', tenant: 'root' }]);
    data.set('root:groups', [{ _id: 'g1', code: 'staff' }]);
    data.set('root:passwords', [{ _id: 'p1', code: 'credential', loginId: 'person@example.test', password: 'NEVER_EXPORT_HASH' }]);
    data.set('root:employees', [{ _id: 'e1', code: 'employee', loginId: 'person@example.test',
        principalType: 'human', password: 'p1', userGroups: ['staff'], name: 'NEVER_EXPORT_NAME' }]);
    return { service, request, policy, data, calls, faults };
}

test('default is disabled; enabled assessment has no apply authority and exports no identities or secrets', async () => {
    assert.equal(properties.identityGovernance.migration.assessment.enabled, false);
    const f = fixture(), before = structuredClone([...f.data]);
    const { data } = await f.service.assessIdentities(f.request);
    assert.equal(data.inventoryComplete, true);
    assert.equal(data.atomicSnapshot, false);
    assert.equal(data.readyForApply, false);
    assert.equal(data.reviewRequired, false);
    assert.equal(data.counts.employees, 1);
    assert.deepEqual([...f.data], before);
    assert.match(data.fingerprint, /^[a-f0-9]{64}$/);
    for (const value of ['person@example.test', 'private-admin', 'NEVER_EXPORT_HASH', 'NEVER_EXPORT_NAME', 'credential']) {
        assert.equal(JSON.stringify(data).includes(value), false);
    }
    assert.equal(f.calls.filter(call => call.kind === 'passwords')[0].searchOptions.projection.password, undefined);
    assert.ok(f.calls.every(call => call.options.recursive === false && call.options.skipItemCache === true));
});

test('admission rejects disabled, service, system, customer, wrong-context and caller-selected inventories before reads', async () => {
    const changes = [
        f => { f.policy.enabled = false; },
        f => { f.request.authData.principalType = 'service'; },
        f => { f.request.authData.principalType = 'customer'; },
        f => { f.request.authData.isSystem = true; },
        f => { f.request.authData.tokenType = 'internal'; },
        f => { f.request.authData.permissions = []; },
        f => { f.request.authData.entCode = 'other'; },
        f => { f.request.authData.tenant = 'other'; },
        f => { f.request.tenant = 'other'; },
        f => { f.request.identityMigration = { tenant: 'other' }; },
        f => { f.request.query = { filter: 'anything' }; },
        f => { f.policy.pageSize = 0; }
    ];
    for (const change of changes) {
        const f = fixture(); change(f);
        await assert.rejects(f.service.assessIdentities(f.request), { code: 'ERR_PROFILE_IDENTITY_ASSESSMENT' });
        assert.equal(f.calls.length, 0);
    }
});

test('native Password super-schema metadata without code survives generated get and Mongo read composition', async () => {
    const f = fixture();
    const database = require('../../../../nodics.foundation/modules/nDatabase/database/src/schemas/schemas');
    ENUMS.ContactType = Object.fromEntries(['EMAIL', 'PHONE', 'FAX', 'PAGER'].map(key => [key, { key }]));
    const profile = require('../src/schemas/schemas');
    const adapter = require('../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model').default;
    const get = { ...require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService'),
        LOG: { debug() {} } };
    assert.equal(profile.profile.password.super, 'super');
    assert.equal(Object.hasOwn(database.default.super.definition, 'code'), false);
    assert.equal(Object.hasOwn(profile.profile.password.definition, 'code'), false);
    const rows = [{ _id: 'p1', loginId: 'person@example.test', active: true, revision: 1 }];
    global.UTILS = { isBlank: value => value === undefined || value === null || Object.keys(value).length === 0 };
    const reads = [];
    const model = { ...adapter, rawSchema: {},
        countDocuments: async () => rows.length,
        find: (_query, options) => {
            assert.equal(options.projection.password, undefined);
            reads.push(options);
            const selected = rows.slice(options.skip || 0, (options.skip || 0) + options.limit);
            const cursor = { sort: () => cursor, toArray: async () => structuredClone(selected) };
            return cursor;
        } };
    SERVICE.DefaultPasswordService.get = input => new Promise((resolve, reject) => {
        const request = { ...input, schemaModel: model,
            searchOptions: { ...input.searchOptions,
                skip: (input.searchOptions.pageNumber - 1) * input.searchOptions.pageSize,
                limit: input.searchOptions.pageSize } };
        get.executeQuery(request, {}, { nextSuccess: (_request, response) => resolve(response.success),
            error: (_request, _response, error) => reject(error) });
    });
    const descriptors = f.service.assessmentSources;
    f.service.assessmentSources = function () {
        const sources = descriptors.call(this);
        sources.passwords.codeOptional = false;
        return sources;
    };
    await assert.rejects(f.service.assessIdentities(f.request), { code: 'ERR_PROFILE_IDENTITY_ASSESSMENT' });
    f.service.assessmentSources = descriptors;
    reads.length = 0;
    const result = (await f.service.assessIdentities(f.request)).data;
    assert.equal(result.inventoryComplete, true);
    assert.equal(result.reviewRequired, false);
    assert.equal(result.counts.passwords, 1);
    assert.equal(reads.length, 2);
    assert.equal(JSON.stringify(result).includes('person@example.test'), false);
    assert.equal(Object.hasOwn(rows[0], 'code'), false);
    rows.push({ ...rows[0] });
    await assert.rejects(f.service.assessIdentities(f.request), { code: 'ERR_PROFILE_IDENTITY_ASSESSMENT' });
});

test('optional Password code does not relax IDs, malformed codes or other owner identities', async () => {
    for (const configure of [
        f => f.data.set('root:passwords', [{ loginId: 'person@example.test' }]),
        f => f.data.set('root:passwords', [{ _id: 'p1', code: null }]),
        f => f.data.set('root:passwords', [{ _id: 'p1', code: '' }]),
        f => f.data.set('root:passwords', [{ _id: 'p1', code: 'same' }, { _id: 'p2', code: 'same' }]),
        f => f.data.set('root:employees', [{ _id: 'e1', loginId: 'person@example.test' }]),
    ]) {
        const f = fixture(); configure(f);
        await assert.rejects(f.service.assessIdentities(f.request), { code: 'ERR_PROFILE_IDENTITY_ASSESSMENT' });
    }
});

test('failed or malformed envelopes, count truncation and repeated pages reject without leaking provider errors', async () => {
    const failures = [
        () => ({ result: [] }),
        response => ({ ...response, success: false }),
        response => ({ ...response, code: 'ERR_DB_PRIVATE' }),
        response => ({ ...response, errors: {} }),
        response => ({ ...response, errors: ['secret-provider-detail'] }),
        response => ({ ...response, count: undefined }),
        response => ({ ...response, count: response.count + 1 }),
        response => ({ ...response, result: null }),
        () => { throw new Error('secret-provider-detail'); }
    ];
    for (const read of failures) {
        const f = fixture(); f.faults.read = read;
        await assert.rejects(f.service.assessIdentities(f.request), error =>
            error.code === 'ERR_PROFILE_IDENTITY_ASSESSMENT' && !error.message.includes('secret-provider-detail'));
    }
    const f = fixture(); f.policy.pageSize = 1;
    f.faults.read = response => ({ ...response, count: 2, result: [{ _id: 'repeat', code: 'repeat' }] });
    await assert.rejects(f.service.assessIdentities(f.request));
});

test('record, tenant and page budgets fail closed, including a missing terminal page', async () => {
    for (const configure of [f => { f.policy.maximumRecords = 1; },
        f => { f.policy.pageSize = 1; f.policy.maximumPages = 1; },
        f => { f.policy.maximumTenants = 1; f.data.set('root:tenants', [{ _id: 't2', code: 'other' }]); }]) {
        const f = fixture(); configure(f);
        await assert.rejects(f.service.assessIdentities(f.request));
    }
});

test('a later-pass revision change blocks success and effective inventory overrides are used', async () => {
    const f = fixture(), original = f.service.assessmentState;
    let passes = 0;
    f.service.assessmentState = async function (context) {
        const state = await original.call(this, context);
        state.partitions[0].employees[0].revision = ++passes;
        return state;
    };
    await assert.rejects(f.service.assessIdentities(f.request));
    assert.equal(passes, 2);
});

test('cross-tenant email collisions and customer coexistence require proof; plus aliases stay distinct', async () => {
    const f = fixture();
    f.data.set('root:tenants', [{ _id: 't-root', code: 'root' }, { _id: 't2', code: 'second' }]);
    f.data.set('second:employees', [{ _id: 'e2', code: 'second-employee', loginId: ' PERSON@example.test ',
        principalType: 'human', password: 'absent', userGroups: ['unknown'] }]);
    f.data.set('root:customers', [{ _id: 'c1', code: 'customer', loginId: 'person@example.test',
        principalType: 'customer', password: 'p1', userGroups: ['staff'] },
    { _id: 'c2', code: 'alias', loginId: 'person+alias@example.test', principalType: 'customer', password: 'absent', userGroups: [] }]);
    const report = (await f.service.assessIdentities(f.request)).data;
    const codes = report.findings.map(item => item.code);
    for (const code of ['DUPLICATE_EMPLOYEE_EMAIL', 'UNPROVEN_DUAL_IDENTITY', 'NORMALIZATION_VARIANT',
        'SHARED_CREDENTIAL_REVIEW', 'MISSING_CREDENTIAL', 'UNRESOLVED_GROUP']) {
        assert.ok(codes.includes('RSN_PROFILE_IDENTITY_' + code));
    }
    assert.equal(codes.includes('RSN_PROFILE_IDENTITY_DUPLICATE_CUSTOMER_EMAIL'), false);
    for (const item of report.findings) {
        assert.ok(statuses[item.code]);
        assert.ok(item.references.every(ref => /^[a-f0-9]{64}$/.test(ref)));
    }
    const again = (await f.service.assessIdentities(f.request)).data;
    assert.notEqual(report.fingerprint, again.fingerprint, 'References cannot become a reusable account directory');
});

test('orphan, checkpoint, claim and tenant conflicts are retained without proposing repairs', async () => {
    const f = fixture();
    f.data.get('root:passwords').push({ _id: 'orphan', code: 'orphan-credential', loginId: 'unused@example.test' });
    f.data.set('root:assignments', [1, 2].map(id => ({ _id: 'a' + id, code: 'assignment' + id,
        normalizedEmail: 'person@example.test', enterpriseCode: 'missing', tenantCode: 'root', identityClaimed: true,
        registration: { phase: 'CREDENTIAL', employeeCode: 'not-created', passwordCode: 'orphan-credential' } })));
    const codes = (await f.service.assessIdentities(f.request)).data.findings.map(row => row.code);
    for (const code of ['ORPHAN_CREDENTIAL_REVIEW', 'MISSING_ENTERPRISE', 'DUPLICATE_IDENTITY_CLAIM',
        'REGISTRATION_IN_PROGRESS', 'MISSING_REGISTRATION_ARTIFACT']) assert.ok(codes.includes('RSN_PROFILE_IDENTITY_' + code));
});

test('controller preserves callback delivery and route preserves preview permission', async () => {
    const f = fixture(), controller = require('../src/controller/identity/defaultIdentityGovernanceController');
    f.service.assessIdentities = async () => ({ code: 'SUC_SYS_00000', data: { readyForApply: false } });
    const result = await new Promise((resolve, reject) => controller.assessIdentities(f.request,
        (error, value) => error ? reject(error) : resolve(value)));
    assert.equal(result.data.readyForApply, false);
    const fs = require('node:fs');
    const router = fs.readFileSync(require.resolve('../src/router/routers'), 'utf8');
    assert.match(router, /assessment:\s*\{\s*secured: true,\s*accessGroups: \["runtimeConfigAdminUserGroup"\],\s*permission: "identity.migration.preview"/);
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module profile/test/enterpriseAccessAssignmentSafety
 * @description Exercises assignment identity and registered-state guards through
 * the real Profile service with isolated generated-service fixtures. These are
 * not live persistence, concurrent provisioning or complete registration tests.
 * @layer test
 * @owner profile
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const service = require('../src/service/enterprise/defaultEnterpriseManagementService');

let rows;
let reads;
let writes;
let readFailure;
let malformedRead;
const future = '2099-01-01T00:00:00.000Z';
const past = '2000-01-01T00:00:00.000Z';

/** Builds an authorised fixture without enrolling an actual employee. */
function request(email = 'alex.smith@example.test', enterpriseCode = 'EXAMPLE_A') {
    return {
        authData: { tokenType: 'access', loginId: 'test-admin', entCode: enterpriseCode, userGroups: ['adminGroup'] },
        params: { enterpriseCode },
        body: { email, roleCode: 'OPERATOR', idempotencyKey: 'assignment-fixture-001' }
    };
}

/** Supplies one stored association with an intentionally legacy identifier. */
function assignment(overrides = {}) {
    return {
        code: 'enterpriseAccess_EXAMPLE_A_alex_smith_example_test',
        email: 'alex.smith@example.test',
        normalizedEmail: 'alex.smith@example.test',
        enterpriseCode: 'EXAMPLE_A',
        tenantCode: 'test-tenant',
        roleCode: 'OPERATOR',
        groupCodes: ['axisViewerUserGroup'],
        scopeType: 'ENTERPRISE',
        scopeCode: 'EXAMPLE_A',
        status: 'PENDING',
        expiresAt: future,
        active: true,
        ...overrides
    };
}

/** Implements exact filters before bounded paging, as required of owner reads. */
function matching(requestValue) {
    return rows.filter(row => Object.entries(requestValue.query).every(([key, value]) => row[key] === value))
        .slice(0, requestValue.searchOptions.pageSize);
}

test.beforeEach(() => {
    rows = [];
    reads = [];
    writes = [];
    readFailure = false;
    malformedRead = false;
    global.CONFIG = { get: key => {
        if (key === 'defaultTenant') return 'profile-authority';
        if (key === 'defaultEnterprise') return 'platform-owner';
        if (key === 'enterpriseManagement') return { accessAssignments: {
            defaultExpiryDays: 14,
            activeStatuses: ['PENDING', 'ACTIVE'],
            roles: { OPERATOR: { groupCodes: ['axisViewerUserGroup'], scopeType: 'ENTERPRISE' } }
        } };
        return undefined;
    } };
    global.CLASSES = { NodicsError: class extends Error {
        constructor(code, message) { super(message); this.code = code; }
    } };
    global.SERVICE = {
        DefaultEnterpriseService: { retrieveEnterprise: async code => ({ code, active: true, tenant: 'test-tenant' }) },
        DefaultEnterpriseAccessAssignmentService: {
            get: async input => {
                reads.push(structuredClone(input));
                if (readFailure) throw new Error('fixture owner unavailable');
                if (malformedRead) return { result: null };
                return { result: matching(input).map(row => structuredClone(row)) };
            },
            save: async input => {
                writes.push(structuredClone(input));
                const index = rows.findIndex(row => row.code === input.model.code);
                if (index === -1) rows.push(structuredClone(input.model));
                else rows[index] = structuredClone(input.model);
                return { result: structuredClone(input.model) };
            }
        }
    };
});

test('assignment key retains punctuation-distinct mailbox identities', () => {
    const emails = ['alex.smith@example.test', 'alex-smith@example.test', 'alex+smith@example.test', 'alex_smith@example.test'];
    assert.equal(new Set(emails.map(email => service.assignmentCode('EXAMPLE_A', email))).size, emails.length);
});

test('assignment key binds the enterprise without ambiguous underscore boundaries', () => {
    assert.notEqual(service.assignmentCode('EXAMPLE_A', 'b_c@example.test'), service.assignmentCode('EXAMPLE_A_b', 'c@example.test'));
    assert.notEqual(service.assignmentCode('EXAMPLE_A', 'a@example.test'), service.assignmentCode('EXAMPLE_B', 'a@example.test'));
});

test('key is deterministic and existing email normalization is preserved', () => {
    const email = service.normalizeEmail('  Alex.Smith@Example.Test  ');
    assert.equal(email, 'alex.smith@example.test');
    assert.equal(service.assignmentCode('EXAMPLE_A', email), service.assignmentCode('EXAMPLE_A', 'alex.smith@example.test'));
});

test('new key uses the existing canonical digest with bounded length', () => {
    const email = 'a'.repeat(64) + '@' + 'b'.repeat(63) + '.' + 'c'.repeat(63) + '.test';
    const code = service.assignmentCode('E'.repeat(128), email);
    assert.match(code, /^enterpriseAccess_[a-f0-9]{64}$/);
    assert.equal(code, 'enterpriseAccess_' + service.commandDigest(['enterpriseAccess', 'E'.repeat(128), email]));
});

test('later-layer digest customization is resolved through the effective service', () => {
    const owner = { ...service, commandDigest: value => {
        assert.deepEqual(value, ['enterpriseAccess', 'EXAMPLE_A', 'a@example.test']);
        return 'configured-digest';
    } };
    assert.equal(owner.assignmentCode('EXAMPLE_A', 'a@example.test'), 'enterpriseAccess_configured-digest');
});

test('new assignments with previously colliding emails persist as distinct fixtures', async () => {
    await service.preAssignAccess(request('alex.smith@example.test'));
    await service.preAssignAccess(request('alex-smith@example.test'));
    assert.equal(rows.length, 2);
    assert.equal(new Set(rows.map(row => row.code)).size, 2);
    assert.deepEqual(new Set(rows.map(row => row.normalizedEmail)), new Set(['alex.smith@example.test', 'alex-smith@example.test']));
});

test('an existing pending legacy code is retained on an authorised refresh', async () => {
    rows.push(assignment());
    const before = rows[0].code;
    const result = await service.preAssignAccess(request('  ALEX.SMITH@example.test  '));
    assert.equal(rows.length, 1);
    assert.equal(result.code, before);
    assert.equal(result.status, 'PENDING');
});

test('registered assignment cannot be downgraded to pending', async () => {
    rows.push(assignment({ status: 'REGISTERED', registeredLoginId: 'alex.smith@example.test' }));
    const before = structuredClone(rows);
    await assert.rejects(service.preAssignAccess(request()), /already registered/);
    assert.equal(writes.length, 0);
    assert.deepEqual(rows, before);
});

test('expired invitation time does not erase completed-registration protection', async () => {
    rows.push(assignment({ status: 'REGISTERED', expiresAt: past }));
    await assert.rejects(service.preAssignAccess(request()), /already registered/);
    assert.equal(writes.length, 0);
});

test('registered-state query is exact and cannot be hidden by a first page of pending rows', async () => {
    rows.push(...Array.from({ length: 30 }, (_, index) => assignment({ code: 'pending-' + index })));
    rows.push(assignment({ code: 'completed-legacy', status: 'REGISTERED', expiresAt: past }));
    await assert.rejects(service.preAssignAccess(request()), /already registered/);
    const guard = reads.find(read => read.query.status === 'REGISTERED');
    assert.ok(guard);
    assert.equal(guard.tenant, 'profile-authority');
    assert.equal(guard.query.enterpriseCode, 'EXAMPLE_A');
    assert.equal(guard.query.normalizedEmail, 'alex.smith@example.test');
    assert.equal(guard.options.recursive, false);
    assert.equal(guard.options.skipItemCache, true);
    assert.equal(guard.searchOptions.pageSize, 1);
    assert.equal(writes.length, 0);
});

test('completed assignment remains excluded from public pending-registration resolution', async () => {
    rows.push(assignment({ status: 'REGISTERED' }));
    const result = await service.resolvePreAssignedAccess({ query: { email: 'alex.smith@example.test', enterpriseCode: 'EXAMPLE_A' } });
    assert.deepEqual(result, { status: 'NOT_FOUND', matched: false });
    assert.equal(writes.length, 0);
});

test('a registered assignment in another enterprise is not overwritten or reused', async () => {
    rows.push(assignment({ status: 'REGISTERED', enterpriseCode: 'EXAMPLE_B', code: 'other-completed' }));
    const other = structuredClone(rows[0]);
    const result = await service.preAssignAccess(request());
    assert.equal(result.enterpriseCode, 'EXAMPLE_A');
    assert.equal(result.status, 'PENDING');
    assert.deepEqual(rows[0], other);
    assert.equal(rows.length, 2);
});

test('registry read failure propagates before any assignment save', async () => {
    readFailure = true;
    await assert.rejects(service.preAssignAccess(request()), /owner unavailable/);
    assert.equal(writes.length, 0);
});

test('malformed registered-state read fails closed instead of fabricating absence', async () => {
    malformedRead = true;
    await assert.rejects(service.preAssignAccess(request()), /registration state is unavailable/);
    assert.equal(writes.length, 0);
});

test('another-enterprise actor is rejected before registry reads or writes', async () => {
    const input = request();
    input.authData.entCode = 'EXAMPLE_B';
    await assert.rejects(service.preAssignAccess(input), /caller enterprise/);
    assert.equal(reads.length, 0);
    assert.equal(writes.length, 0);
});

test('existing assignment-key override remains the creation seam', async () => {
    const owner = { ...service, assignmentCode: () => 'CUSTOM_ASSIGNMENT_ID' };
    const result = await owner.preAssignAccess(request());
    assert.equal(result.code, 'CUSTOM_ASSIGNMENT_ID');
    assert.equal(rows.length, 1);
});

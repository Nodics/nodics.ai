/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module profile/test/enterpriseMembershipContract
 * @description Owner-injected fixtures for canonical credentials, private mutation guards and qualified team serialization; not installed persistence or browser acceptance.
 * @layer test
 * @owner profile
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const implementation = require('../src/service/enterprise/defaultEnterpriseMembershipService');
const teamImplementation = require('../src/service/enterprise/defaultEnterpriseTeamAdministrationService');
const registration = require('../src/service/enterprise/defaultEnterpriseRegistrationService');
const stampGovernance = require('../src/service/identity/defaultPrincipalSecurityStampGovernanceService');

/** Initializes explicit disabled defaults and generated-owner fixtures. @returns {Object} Membership owner. */
function fixture() {
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        }
    };
    global.CONFIG = { get: () => undefined };
    global.NODICS = { getModels: () => ({ PasswordModel: { dataBase: {} } }) };
    global.SERVICE = {
        DefaultProfileService: { getProfileModuleName: () => 'profile' },
        DefaultDatabaseConfigurationService: { toObjectId: (_model, value) => value },
        DefaultEnterpriseRegistrationService: registration,
        DefaultIdentityGovernanceService: {
            getSystemAuthData: () => ({ isSystem: true })
        }
    };
    const owner = {
        ...implementation,
        digest: (value) =>
            crypto
                .createHash('sha256')
                .update(JSON.stringify(value))
                .digest('hex')
    };
    SERVICE.DefaultEnterpriseMembershipService = owner;
    return owner;
}
test('membership qualification fails closed by default and survives partial customer overrides', () => {
    const m = fixture();
    assert.throws(() => m.policy(), {
        code: 'ERR_PROFILE_MEMBERSHIP_UNAVAILABLE'
    });
    CONFIG.get = () => ({
        memberships: {
            enabled: true,
            inventoryQualified: true,
            pageSize: 50,
            maximumInventoryPages: 2
        }
    });
    assert.throws(
        () => ({ ...m, project: () => ({ custom: true }) }).policy(),
        { code: 'ERR_PROFILE_MEMBERSHIP_UNAVAILABLE' }
    );
});
test('credential reads stay at the immutable original tenant and credential ID', async () => {
    const m = fixture(),
        calls = [];
    SERVICE.DefaultPasswordService = {
        get: async (request) => {
            calls.push(request);
            return {
                code: 'SUC_READ',
                result: [
                    {
                        loginId: 'person@example.test',
                        active: true,
                        password: 'stored-hash'
                    }
                ]
            };
        }
    };
    await m.credential({
        identity: { tenantCode: 'original' },
        person: { password: 'credential-1', loginId: 'person@example.test' }
    });
    assert.equal(calls[0].tenant, 'original');
    assert.deepEqual(calls[0].query, { _id: 'credential-1' });
});
test('private identity binding cannot be forged through a body or operator path', async () => {
    const m = fixture();
    await assert.rejects(
        m.protectPrincipal({
            isSystem: true,
            model: { authenticationIdentity: { tenantCode: 'other' } }
        }),
        { code: 'ERR_PROFILE_MEMBERSHIP_FORBIDDEN' }
    );
    await assert.rejects(
        m.protectPrincipal({
            model: { $set: { 'authenticationIdentity.recordId': 'other' } }
        }),
        { code: 'ERR_PROFILE_MEMBERSHIP_FORBIDDEN' }
    );
    await assert.rejects(
        m.protectPrincipal({
            model: { $rename: { name: 'authenticationIdentity' } }
        }),
        { code: 'ERR_PROFILE_MEMBERSHIP_FORBIDDEN' }
    );
});
test('ordinary employees still require a credential before save', () => {
    const m = fixture();
    assert.throws(
        () =>
            m.protectPrincipalSave({
                model: { code: 'person', principalType: 'human' }
            }),
        { code: 'ERR_PROFILE_MEMBERSHIP_IDENTITY' }
    );
});
test('failed generated reads never become an empty membership directory', async () => {
    const m = fixture();
    SERVICE.DefaultEmployeeService = {
        get: async () => ({ code: 'ERR_READ', result: [] })
    };
    await assert.rejects(
        m.read('DefaultEmployeeService', 'target', { code: 'person' }),
        { code: 'ERR_PROFILE_MEMBERSHIP_STORAGE' }
    );
});
test('a completed team command can only be resumed with the original actor and input', async () => {
    const m = fixture(),
        actor = {
            identity: {
                tenantCode: 'original',
                recordKind: 'EMPLOYEE',
                recordId: 'person-1'
            }
        };
    const input = {
        assignmentCode: 'a',
        revision: 4,
        operationId: 'operation_123456789'
    };
    const hash = m.digest({
        operation: 'REVOKE',
        input,
        identity: actor.identity,
        enterpriseCode: 'target'
    });
    SERVICE.DefaultEnterpriseService = {
        get: async (request) => {
            assert.deepEqual(request.options, {
                recursive: false,
                skipItemCache: true
            });
            return {
                code: 'SUC_READ',
                result: [
                    {
                        code: 'target',
                        active: true,
                        teamOperation: {
                            id: input.operationId,
                            hash,
                            phase: 'COMPLETE'
                        }
                    }
                ]
            };
        }
    };
    const team = {
        ...teamImplementation,
        policy: () => {},
        memberships: () => ({
            ...m,
            administrator: async () => actor,
            authority: () => 'authority',
            read: async () => ({
                code: 'target',
                active: true,
                teamOperation: {
                    id: input.operationId,
                    hash,
                    phase: 'COMPLETE'
                }
            })
        })
    };
    assert.equal(
        (await team.begin({}, 'REVOKE', input, 'target')).teamOperation.phase,
        'COMPLETE'
    );
    await assert.rejects(team.begin({}, 'SUSPEND', input, 'target'), {
        code: 'ERR_PROFILE_TEAM_CONFLICT'
    });
});
test('a pending operation is not stolen by another operation or an elapsed clock', async () => {
    const m = fixture();
    SERVICE.DefaultEnterpriseService = {
        get: async () => ({
            code: 'SUC_READ',
            result: [
                {
                    code: 'target',
                    active: true,
                    teamOperation: {
                        id: 'old_operation_123456',
                        phase: 'PENDING',
                        createdAt: '2000-01-01'
                    }
                }
            ]
        })
    };
    const team = {
        ...teamImplementation,
        policy: () => {},
        memberships: () => ({
            ...m,
            administrator: async () => ({ identity: {} }),
            authority: () => 'authority',
            read: async () => ({
                code: 'target',
                active: true,
                teamOperation: {
                    id: 'old_operation_123456',
                    phase: 'PENDING',
                    createdAt: '2000-01-01'
                }
            })
        })
    };
    await assert.rejects(
        team.begin(
            {},
            'REVOKE',
            { operationId: 'new_operation_123456' },
            'target'
        ),
        { code: 'ERR_PROFILE_TEAM_CONFLICT' }
    );
});
test('the designated administrator cannot be restricted before handover', async () => {
    fixture();
    const team = { ...teamImplementation };
    await assert.rejects(
        team.assertMayRestrict(
            { code: 'default', enterpriseCode: 'target' },
            { defaultAdminAssignmentCode: 'default' }
        ),
        { code: 'ERR_PROFILE_TEAM_LAST_ADMIN' }
    );
});
test('password invalidation follows the credential reference, not a same-email account of another kind', async () => {
    fixture();
    const reads = [],
        writes = [];
    SERVICE.DefaultPasswordService = {
        get: async (request) => {
            reads.push(request);
            return { code: 'SUC_READ', result: [{ _id: 'credential-1' }] };
        }
    };
    SERVICE.DefaultEmployeeService = {
        get: async (request) => {
            reads.push(request);
            return { code: 'SUC_READ', result: [] };
        }
    };
    SERVICE.DefaultCustomerService = {
        get: async (request) => {
            reads.push(request);
            return {
                code: 'SUC_READ',
                result: [{ _id: 'original-customer', password: 'credential-1' }]
            };
        },
        update: async (request) => {
            writes.push(request);
            return {
                code: 'SUC_UPDATE',
                result: { acknowledged: true, matchedCount: 1 }
            };
        }
    };
    await stampGovernance.bumpLoginId({
        tenant: 'original',
        query: { _id: 'credential-1' },
        model: { password: 'changed-hash' }
    });
    assert.deepEqual(reads[1].query, { password: 'credential-1' });
    assert.deepEqual(writes[0].query, { _id: 'original-customer' });
    assert.equal(writes[0].tenant, 'original');
});

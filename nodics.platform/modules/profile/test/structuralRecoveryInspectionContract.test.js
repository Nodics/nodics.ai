/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/test/structuralRecoveryInspectionContract
 * @description Authored read-only redaction, audit drift and recovery-fence fixtures; not installed migration acceptance.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/identity/defaultIdentityGovernanceMigrationService");

test("locked audit inspection retains locks, redacts changes and performs no writes", async () => {
    global.CLASSES = { NodicsError: class extends Error {} };
    const audit = {
        code: "audit",
        status: "RECOVERING",
        planFingerprint: "a".repeat(64),
        appliedChangeCount: 1,
        recoveryOperationId: "private-operation",
        preview: {
            changes: [{ code: "private-person", from: { apiKey: "secret" } }],
        },
    };
    global.SERVICE = {
        DefaultIdentityMigrationAuditService: {},
        DefaultPrincipalSecurityStampGovernanceService: {
            inventory: async () => [audit],
        },
    };
    const owner = {
        ...source,
        getPolicy: () => ({ recoveryInspectionMaximumChanges: 1000 }),
        readReviewedStructuralAudit: async () => audit,
        inspectStructuralChange: async () => "AFTER",
    };
    const response = await owner.inspectReviewedMigration({ tenant: "tenant" });
    assert.equal(response.data.locked, true);
    assert.equal(response.data.effects, false);
    assert.equal(response.data.readyForApply, false);
    assert.deepEqual(response.data.states, [{ index: 0, state: "AFTER" }]);
    for (const secret of ["private-person", "private-operation", "secret"])
        assert.equal(JSON.stringify(response).includes(secret), false);
    assert.equal(audit.status, "RECOVERING");
    global.SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory =
        async () => [{ ...audit, appliedChangeCount: 2 }];
    await assert.rejects(owner.inspectReviewedMigration({ tenant: "tenant" }));
});

test("inspection and recovery gates are independent and default closed", async () => {
    global.CLASSES = { NodicsError: class extends Error {} };
    const owner = {
        ...source,
        getPolicy: () => ({
            reviewedRecoveryEnabled: true,
            reviewedRecoveryQualified: true,
        }),
    };
    global.SERVICE = { DefaultEnterpriseMembershipService: {} };
    await assert.rejects(
        owner.readReviewedStructuralAudit({ authData: {} }, true),
    );
});

test("recovery progress rejects another operation even after an ambiguous matching patch", async () => {
    global.CLASSES = { NodicsError: class extends Error {} };
    let query;
    global.SERVICE = {
        DefaultIdentityMigrationAuditService: {
            update: async (request) => {
                query = request.query;
                return {
                    code: "SUC_SYS_00000",
                    result: { acknowledged: true, matchedCount: 0 },
                };
            },
        },
        DefaultEnterpriseRegistrationService: { assertWrite: () => {} },
        DefaultPrincipalSecurityStampGovernanceService: {
            inventory: async () => [
                {
                    code: "audit",
                    status: "RECOVERING",
                    appliedChangeCount: 1,
                    recoveryOperationId: "other",
                },
            ],
        },
    };
    const owner = {
        ...source,
        systemRequest: (_, additions) => additions,
        getTenant: (request) => request.tenant,
    };
    await assert.rejects(
        owner.updateAudit(
            { tenant: "tenant" },
            "audit",
            "RECOVERING",
            { appliedChangeCount: 1 },
            { recoveryOperationId: "own" },
        ),
    );
    assert.equal(query.recoveryOperationId, "own");
});

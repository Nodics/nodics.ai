/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module profile/test/enterpriseTeamWorkspace
 * @description Injected team workspace projection and scope fixtures; not installed persistence or browser acceptance.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");

function fixture(rows) {
  const enterprise = {
    code: "business",
    name: "Business",
    defaultAdminAssignmentCode: "designated",
    teamOperation: {
      id: "operation_12345678",
      phase: "PENDING",
      actor: "private",
      hash: "private",
    },
  };
  let admitted;
  const service = {
    ...owner,
    policy: () => {},
    fail: (suffix) => {
      throw new Error(suffix);
    },
    administrators: async () => rows.filter((item) => item.admin),
    memberships: () => ({
      base: () => ({ input: (value) => assert.deepEqual(value, {}) }),
      administrator: async (request, code) => {
        assert.equal(request.authData.entCode, code);
        admitted = code;
      },
      authority: () => "platform",
      // Projection-only owner substitute, not private-reader integration qualification.
      enterprise: (code) =>
        SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
          code,
        ),
      inventory: async (_name, _authority, selector) => {
        assert.equal(admitted, "business");
        assert.deepEqual(selector, {
          enterpriseCode: "business",
          active: true,
        });
        return rows;
      },
      assignment: async (code) => ({
        item: rows.find((item) => item.code === code),
        enterprise,
      }),
      project: (item) => ({
        code: item.code,
        status: item.status,
        revision: item.revision,
      }),
    }),
  };
  global.SERVICE = {
    DefaultEnterpriseManagementService: {
      retrieveEnterpriseForAccess: async (code) => {
        assert.equal(code, admitted);
        return { enterprise, tenantCode: "businessTenant" };
      },
    },
  };
  global.CONFIG = {
    get: () => ({ teamAdministration: { presentation: { title: "Team" } } }),
  };
  return service;
}
function row(code, status = "REGISTERED", extra = {}) {
  return {
    code,
    status,
    revision: 1,
    tenantCode: "businessTenant",
    normalizedEmail: code + "@example.test",
    membership: { phase: "COMPLETE", identity: "private" },
    ...extra,
  };
}
test("fresh current-enterprise workspace projects guarded actions and no private operation evidence", async () => {
  const service = fixture([
    row("designated", "REGISTERED", { admin: true }),
    row("successor", "REGISTERED", { admin: true }),
    row("operator"),
    row("suspended", "SUSPENDED"),
    row("invited", "ACTIVE", { membership: undefined }),
    row("review", "REVIEW_PENDING"),
  ]);
  const value = await service.workspace({
    authData: { entCode: "business" },
  });
  assert.equal(value.items.length, 5);
  assert.deepEqual(value.items[0].actions, []);
  assert.deepEqual(value.items[1].actions, ["SUSPEND", "REVOKE", "HANDOVER"]);
  assert.deepEqual(value.items[2].actions, ["SUSPEND", "REVOKE"]);
  assert.deepEqual(value.items[3].actions, ["RESUME"]);
  assert.deepEqual(value.items[4].actions, []);
  assert.deepEqual(value.operation, {
    id: "operation_12345678",
    phase: "PENDING",
  });
  assert.equal(value.items[0].membership, undefined);
});
test("workspace rejects overflow and cross-tenant assignments", async () => {
  await assert.rejects(
    fixture(Array.from({ length: 101 }, (_, i) => row(String(i)))).workspace({
      authData: { entCode: "business" },
    }),
    /UNAVAILABLE/,
  );
  await assert.rejects(
    fixture([row("foreign", "REGISTERED", { tenantCode: "other" })]).workspace({
      authData: { entCode: "business" },
    }),
    /CONFLICT/,
  );
});
test("withdrawal is offered only after qualification and only for unused invitations", async () => {
  const service = fixture([
    row("unused", "ACTIVE", { membership: undefined }),
    row("started", "ACTIVE", {
      membership: undefined,
      registration: { phase: "PREPARED" },
    }),
    row("claimed", "ACTIVE", { membership: undefined, identityClaimed: true }),
  ]);
  CONFIG.get = () => ({
    teamAdministration: {
      invitationWithdrawalQualified: true,
      presentation: { title: "Team" },
    },
  });
  const value = await service.workspace({ authData: { entCode: "business" } });
  assert.deepEqual(
    value.items.map((item) => item.actions),
    [["WITHDRAW"], [], []],
  );
});
test("last active administrator cannot be offered restriction even without designation", async () => {
  const value = await fixture([
    row("last", "REGISTERED", { admin: true }),
  ]).workspace({ authData: { entCode: "business" } });
  assert.deepEqual(value.items[0].actions, ["HANDOVER"]);
});

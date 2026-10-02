/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/humanScopeInvalidationContract @description Verifies private scope mutation targets, bounded direct/group propagation and independent linked membership invalidation with injected owners. @layer test @owner profile */
const assert = require("node:assert/strict");
const test = require("node:test");
const scope = require("../src/service/identity/defaultPrincipalScopeGovernanceService");
const stamps = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
const memberships = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const interceptors = require("../src/interceptors/interceptors");

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message || code);
        this.code = code;
      }
    },
  };
  global.CONFIG = { get: () => undefined };
  global.UTILS = { isObject: (value) => value && typeof value === "object" };
  const queries = [],
    updates = [],
    invalidations = [];
  const rows = { employee: [], customer: [], group: [] };
  let updateResponse = {
    code: "SUC_UPDATE",
    result: { acknowledged: true, matchedCount: 1 },
  };
  const service = (kind) => ({
    get: async (input) => {
      queries.push({ kind, input });
      return { code: "SUC_READ", count: rows[kind].length, result: rows[kind] };
    },
    update: async (input) => {
      updates.push({ kind, input });
      return updateResponse;
    },
  });
  global.SERVICE = {
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultPrincipalSecurityStampGovernanceService: stamps,
    DefaultEmployeeService: service("employee"),
    DefaultCustomerService: service("customer"),
    DefaultUserGroupService: service("group"),
    DefaultEnterpriseMembershipService: {
      enabled: () => true,
      invalidatePrincipalMemberships: async (tenant, ids) =>
        invalidations.push({ tenant, ids }),
    },
  };
  return {
    rows,
    queries,
    updates,
    invalidations,
    failUpdate: () => {
      updateResponse = {
        code: "SUC_UPDATE",
        result: { acknowledged: false, matchedCount: 1 },
      };
    },
  };
}

test("direct customer scope changes advance only customer owner and post-write propagation repeats", async () => {
  const f = fixture();
  f.rows.customer = [{ _id: "customer", loginId: "customer@example.test" }];
  const request = { tenant: "origin" };
  await scope.prepareScopeInvalidation(request, [
    {
      principalType: "customer",
      principalCode: "customer-code",
      scopeType: "ENTERPRISE",
    },
  ]);
  assert.equal(f.updates.length, 1);
  assert.equal(f.updates[0].kind, "customer");
  assert.deepEqual(f.updates[0].input.query, { _id: "customer" });
  assert.equal(f.queries[0].input.query.$or[0].principalType, "customer");
  await scope.invalidateScopeCredentials(request);
  assert.equal(f.updates.length, 2);
  f.failUpdate();
  await assert.rejects(
    scope.invalidateScopeCredentials(request),
    /invalidation/,
  );
});

test("linked employee scope mutations invalidate target memberships without changing canonical credentials", async () => {
  const f = fixture();
  f.rows.employee = [
    {
      _id: "projection",
      loginId: "person",
      authenticationIdentity: {
        tenantCode: "origin",
        recordKind: "CUSTOMER",
        recordId: "canonical",
      },
    },
  ];
  await scope.prepareScopeInvalidation({ tenant: "target" }, [
    { principalType: "human", principalCode: "person", scopeType: "TENANT" },
  ]);
  assert.equal(f.updates.length, 0);
  assert.deepEqual(f.invalidations, [
    { tenant: "target", ids: ["projection"] },
  ]);
  SERVICE.DefaultEnterpriseMembershipService.enabled = () => false;
  await assert.rejects(
    scope.prepareScopeInvalidation({ tenant: "target" }, [
      { principalType: "human", principalCode: "person" },
    ]),
    /membership owner/,
  );
});

test("group scopes resolve current inheritance and reject request-field target forgery", async () => {
  const f = fixture();
  f.rows.group = [
    { _id: "parent", code: "parent" },
    { _id: "child", code: "child", parentGroups: ["parent"] },
  ];
  const request = { tenant: "target" };
  await scope.prepareScopeInvalidation(request, [
    { principalType: "group", groupCode: "parent" },
  ]);
  const employees = f.queries.find((item) => item.kind === "employee");
  assert.deepEqual(employees.input.query.$or[0].userGroups.$in.sort(), [
    "child",
    "parent",
  ]);
  await assert.rejects(
    scope.invalidateScopeCredentials({
      tenant: "target",
      scopeMutationTargets: [],
    }),
    /Prepared/,
  );
});

test("updates retain old and new direct targets and reject unsupported operators before reads", async () => {
  const f = fixture();
  const owner = { ...scope, validateAssignment: (value) => value };
  SERVICE.DefaultPrincipalScopeAssignmentService = {
    get: async () => ({
      code: "SUC_READ",
      count: 1,
      result: [
        {
          _id: "scope",
          code: "scope",
          scopeType: "TENANT",
          principalType: "human",
          principalCode: "old",
        },
      ],
    }),
  };
  await owner.validateUpdate({
    tenant: "target",
    query: { code: "scope" },
    model: { $set: { principalCode: "new" } },
  });
  const selectors = f.queries.find((item) => item.kind === "employee").input
    .query.$or;
  assert.deepEqual(
    selectors.map((item) => item.$or[0].loginId),
    ["old", "new"],
  );
  await assert.rejects(
    owner.validateUpdate({
      tenant: "target",
      query: {},
      model: { $rename: { principalCode: "groupCode" } },
    }),
  );
});

test("save/upsert captures existing scope preimages and keeps synchronous validation separate", async () => {
  const f = fixture();
  const owner = { ...scope, validateAssignment: (value) => value };
  SERVICE.DefaultPrincipalScopeAssignmentService = {
    get: async () => ({
      code: "SUC_READ",
      count: 1,
      result: [
        {
          _id: "scope",
          code: "scope",
          scopeType: "TENANT",
          principalType: "human",
          principalCode: "old",
        },
      ],
    }),
  };
  const request = {
    tenant: "target",
    model: {
      code: "scope",
      scopeType: "TENANT",
      principalType: "customer",
      principalCode: "new",
    },
  };
  assert.equal(owner.validateSave(request), true);
  await owner.prepareScopeSave(request);
  assert(f.queries.some((item) => item.kind === "employee"));
  assert(f.queries.some((item) => item.kind === "customer"));
  assert.equal(interceptors.prepareHumanScopeSave.trigger, "preSave");
  assert.equal(interceptors.invalidateHumanScopeRemoval.trigger, "postRemove");
});

test("membership propagation uses authority storage and exact target projection IDs", async () => {
  fixture();
  let query;
  const written = [];
  const owner = {
    ...memberships,
    enabled: () => true,
    authority: () => "authority",
    inventory: async (service, tenant, lookup) => {
      assert.equal(tenant, "authority");
      query = lookup;
      return [{ code: "membership", membership: { phase: "COMPLETE" } }];
    },
    write: async (item, patch) => written.push({ item, patch }),
  };
  await owner.invalidatePrincipalMemberships("target", [
    "projection",
    "projection",
  ]);
  assert.deepEqual(query["membership.projectionId"], { $in: ["projection"] });
  assert.equal(query.tenantCode, "target");
  assert.equal(written.length, 1);
  assert.equal(written[0].patch.membership.phase, "COMPLETE");
});

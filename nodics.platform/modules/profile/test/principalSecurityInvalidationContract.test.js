/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/test/principalSecurityInvalidationContract
 * @description Exercises bounded invalidation inventory and pre-removal/group interceptor contracts without runtime writes.
 * @layer test
 * @owner profile
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const owner = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
const interceptors = require("../src/interceptors/interceptors");
const employee = require("../src/service/interceptors/defaultEmployeeUpdateInterceptorService");

test("post-write group propagation retains captured removed and renamed groups", async () => {
  const f = fixture();
  SERVICE.DefaultUserGroupService = {
    get: async () => ({
      code: "SUC_READ",
      count: 1,
      result: [{ _id: "child", code: "child", parentGroups: ["renamed"] }],
    }),
  };
  SERVICE.DefaultEmployeeService = f.service;
  SERVICE.DefaultCustomerService = f.service;
  let codes;
  SERVICE.DefaultEnterpriseMembershipService = {
    invalidateGroupMemberships: async (_tenant, value) => {
      codes = value;
    },
  };
  await owner.invalidatePreparedGroupMembers({
    tenant: "origin",
    affectedMembershipGroups: ["removed"],
    model: { $set: { code: "renamed" } },
  });
  assert.deepEqual(codes.sort(), ["child", "removed", "renamed"]);
  assert.equal(
    interceptors.finalizeGroupMemberSecurityStamps.trigger,
    "postUpdate",
  );
  assert.equal(
    interceptors.finalizeRemovedGroupSecurityStamps.trigger,
    "postRemove",
  );
  await assert.rejects(
    owner.invalidatePreparedGroupMembers({ tenant: "origin" }),
  );
});

function fixture(rows = []) {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  global.CONFIG = { get: () => ({ pageSize: 2, maximumPages: 2 }) };
  global.UTILS = { isObject: (value) => value && typeof value === "object" };
  const calls = [],
    registered = [];
  const service = {
    get: async (request) => {
      calls.push(request);
      const start =
        (request.searchOptions.pageNumber - 1) * request.searchOptions.pageSize;
      return {
        code: "SUC_READ",
        count: rows.length,
        result: rows.slice(start, start + request.searchOptions.pageSize),
      };
    },
  };
  global.SERVICE = {
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultEmployeeService: service,
    DefaultPrincipalSecurityStampService: {
      reserveVersion: async (_tenant, minimum) => minimum,
      register: async (tenant, key, version) => {
        registered.push({ tenant, key, version });
        return true;
      },
    },
  };
  return { service, calls, registered };
}

test("inventory traverses all pages and preserves original tenant and fresh reads", async () => {
  const rows = [1, 2, 3].map((id) => ({ _id: String(id) }));
  const f = fixture(rows);
  assert.deepEqual(await owner.inventory(f.service, "origin", {}), rows);
  assert.equal(f.calls.length, 2);
  assert(
    f.calls.every(
      (request) =>
        request.tenant === "origin" && request.options.skipItemCache === true,
    ),
  );
});

test("malformed, changing, repeated, truncated and overflowing inventories fail closed", async () => {
  fixture();
  for (const response of [
    { code: "ERR_READ", count: 0, result: [] },
    { code: "SUC_READ", result: [] },
    { code: "SUC_READ", count: 2, result: [{ _id: "a" }] },
    { code: "SUC_READ", count: 2, result: [{ _id: "a" }, { _id: "a" }] },
    { code: "SUC_READ", count: 1, result: [null] },
  ]) {
    await assert.rejects(
      owner.inventory({ get: async () => response }, "origin", {}),
    );
  }
  let page = 0;
  await assert.rejects(
    owner.inventory(
      {
        get: async () => ({
          code: "SUC_READ",
          count: ++page === 1 ? 3 : 4,
          result:
            page === 1
              ? [{ _id: "a" }, { _id: "b" }]
              : [{ _id: "c" }, { _id: "d" }],
        }),
      },
      "origin",
      {},
    ),
  );
  const f = fixture([1, 2, 3, 4, 5].map((id) => ({ _id: String(id) })));
  await assert.rejects(owner.inventory(f.service, "origin", {}));
});

test("removal registers both login and immutable identity stamps without modifying the delete model", async () => {
  const f = fixture([
    { _id: "person", loginId: "person@example.test", authVersion: 7 },
  ]);
  const request = {
    tenant: "origin",
    schemaModel: { schemaName: "employee" },
    query: { _id: "person" },
  };
  await owner.preparePrincipalRemoval(request);
  assert.deepEqual(f.registered, [
    { tenant: "origin", key: "person@example.test", version: 8 },
    { tenant: "origin", key: "identity:EMPLOYEE:person", version: 8 },
  ]);
  assert.equal(request.model, undefined);
  assert.equal(
    interceptors.invalidateRemovedEmployeeSecurityStamps.trigger,
    "preRemove",
  );
  assert.equal(
    interceptors.invalidateRemovedCustomerSecurityStamps.trigger,
    "preRemove",
  );
});

test("failed stamp registration rejects removal admission", async () => {
  fixture([{ _id: "person", loginId: "person", authVersion: 2 }]);
  SERVICE.DefaultPrincipalSecurityStampService.register = async () => {
    throw new Error("cache unavailable");
  };
  await assert.rejects(
    owner.preparePrincipalRemoval({
      tenant: "origin",
      schemaModel: { schemaName: "employee" },
      query: {},
    }),
  );
});

test("operator-only updates stamp through $set and cannot unset the reserved version", async () => {
  fixture([{ _id: "person", loginId: "person", authVersion: 2 }]);
  const request = {
    tenant: "origin",
    schemaModel: { schemaName: "employee" },
    query: {},
    model: { $unset: { phone: "" } },
  };
  await owner.preparePrincipalUpdate(request);
  assert.deepEqual(request.model.$set, { authVersion: 3 });
  await assert.rejects(
    owner.preparePrincipalUpdate({
      ...request,
      model: { $unset: { authVersion: "" } },
    }),
  );
});

test("group mutation invalidates transitive pre-image members and validates acknowledgement", async () => {
  const f = fixture();
  const groups = [
    { _id: "base", code: "base" },
    { _id: "child", code: "child", parentGroups: ["base"] },
  ];
  SERVICE.DefaultUserGroupService = {
    get: async (request) => {
      assert.equal(request.tenant, "origin");
      assert.deepEqual(request.options, {
        recursive: false,
        skipItemCache: true,
      });
      assert.deepEqual(request.authData, { isSystem: true });
      const rows = groups.filter(
        (group) => !request.query.code || group.code === request.query.code,
      );
      const start =
        (request.searchOptions.pageNumber - 1) * request.searchOptions.pageSize;
      return {
        code: "SUC_READ",
        count: rows.length,
        result: structuredClone(
          rows.slice(start, start + request.searchOptions.pageSize),
        ),
      };
    },
  };
  SERVICE.DefaultEmployeeService = {
    get: async () => ({
      code: "SUC_READ",
      count: 1,
      result: [{ _id: "person", loginId: "person" }],
    }),
    update: async (request) => {
      f.calls.push(request);
      return {
        code: "SUC_UPDATE",
        result: { acknowledged: true, matchedCount: 1 },
      };
    },
  };
  SERVICE.DefaultCustomerService = {
    get: async () => ({ code: "SUC_READ", count: 0, result: [] }),
  };
  let affected;
  SERVICE.DefaultEnterpriseMembershipService = {
    invalidateGroupMemberships: async (_tenant, codes) => {
      affected = codes;
    },
  };
  await owner.bumpGroupMembers({ tenant: "origin", query: { code: "base" } });
  assert.deepEqual(affected.sort(), ["base", "child"]);
  assert.deepEqual(f.calls[0].query, { _id: "person" });
  SERVICE.DefaultEmployeeService.update = async () => ({
    code: "SUC_UPDATE",
    result: { acknowledged: false, matchedCount: 1 },
  });
  await assert.rejects(
    owner.bumpGroupMembers({ tenant: "origin", query: { code: "base" } }),
  );
  assert.equal(interceptors.bumpGroupMemberSecurityStamps.trigger, "preUpdate");
  assert.equal(
    interceptors.invalidateRemovedGroupSecurityStamps.trigger,
    "preRemove",
  );
});

test("operator suspension records the same marker as plain updates without changing private provisioning", async () => {
  fixture();
  const request = { model: { $set: { active: false } }, options: {} };
  await employee.employeePreUpdate(request, {});
  assert.equal(request.model.$set.registrationSuspended, true);
  SERVICE.DefaultEnterpriseRegistrationService = {
    ownsProvisioningMutation: () => true,
  };
  const provisioning = { model: { $set: { active: true } }, options: {} };
  await employee.employeePreUpdate(provisioning, {});
  assert.equal(provisioning.model.$set.registrationSuspended, undefined);
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/test/enterpriseHierarchyContract
 * @description Deferred fixtures for fresh code-reference traversal and non-authorizing creation checks.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/enterprise/defaultEnterpriseService");
const management = require("../src/service/enterprise/defaultEnterpriseManagementService");

function fixture() {
  const enterprises = {
    child: {
      _id: "child-id",
      code: "child",
      tenant: "child-tenant",
      active: true,
      superEnterprise: "parent",
    },
    parent: {
      _id: "parent-id",
      code: "parent",
      tenant: { code: "parent-tenant" },
      active: true,
      superEnterprise: { code: "root" },
    },
    root: {
      _id: "root-id",
      code: "root",
      tenant: "root-tenant",
      active: true,
      subEnterprises: ["unrelated"],
    },
  };
  const tenants = Object.fromEntries(
    ["child", "parent", "root"].map((code) => [
      code + "-tenant",
      {
        _id: code + "-tenant-id",
        code: code + "-tenant",
        active: true,
      },
    ]),
  );
  const policy = { maximumDepth: 32 },
    calls = [],
    faults = {};
  global.CONFIG = {
    get: (key) =>
      key === "defaultTenant"
        ? "authority"
        : key === "enterpriseManagement"
          ? { hierarchy: policy }
          : undefined,
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  const reader = (kind, rows) => async (request) => {
    assert.equal(request.tenant, "authority");
    assert.equal(request.options.recursive, false);
    assert.equal(request.options.skipItemCache, true);
    assert.equal(request.searchOptions.pageSize, 2);
    calls.push({ kind, code: request.query.code });
    if (faults.read) return faults.read;
    if (faults.drift && calls.length === 7)
      enterprises.child.superEnterprise = "root";
    const row = rows[request.query.code];
    return { code: "SUC_GET", result: row ? [structuredClone(row)] : [] };
  };
  const owner = { ...source, get: reader("enterprise", enterprises) };
  global.SERVICE = {
    DefaultEnterpriseService: owner,
    DefaultTenantService: { get: reader("tenant", tenants) },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ principalType: "service" }),
    },
  };
  return { owner, enterprises, tenants, policy, calls, faults };
}
test("existing code references form a fresh bounded chain, never access rights", async () => {
  const f = fixture();
  assert.deepEqual(await f.owner.hierarchy("child"), [
    { code: "child", tenantCode: "child-tenant", parentCode: "parent" },
    { code: "parent", tenantCode: "parent-tenant", parentCode: "root" },
    { code: "root", tenantCode: "root-tenant" },
  ]);
  assert.equal(f.calls.length, 12);
});
test("proposed child is counted in the later-layer maximum depth", async () => {
  const f = fixture();
  f.policy.maximumDepth = 3;
  await assert.rejects(f.owner.hierarchy("child", "new-child"));
  f.policy.maximumDepth = 4;
  assert.equal((await f.owner.hierarchy("child", "new-child")).length, 3);
});
test("invalid parent paths reject rather than expanding recursive references", async () => {
  for (const mutate of [
    (f) => {
      f.enterprises.root.superEnterprise = "child";
    },
    (f) => {
      f.enterprises.child.superEnterprise = "missing";
    },
    (f) => {
      f.enterprises.parent.active = false;
    },
    (f) => {
      f.tenants["parent-tenant"].active = false;
    },
    (f) => {
      f.enterprises.parent.superEnterprise = { _id: "database-id" };
    },
    (f) => {
      f.enterprises.parent.tenant = ["parent-tenant"];
    },
    (f) => {
      f.policy.maximumDepth = 2;
    },
    (f) => {
      f.policy.maximumDepth = 0;
    },
    (f) => {
      f.policy.maximumDepth = 129;
    },
    (f) => {
      f.faults.drift = true;
    },
  ]) {
    const f = fixture();
    mutate(f);
    await assert.rejects(f.owner.hierarchy("child"));
  }
});
test("self-parent and descendant-parent creation reject", async () => {
  const f = fixture();
  await assert.rejects(f.owner.hierarchy("child", "child"));
  await assert.rejects(f.owner.hierarchy("child", "root"));
});
test("failed, ambiguous and malformed generated envelopes never imply a hierarchy", async () => {
  for (const result of [
    { code: "ERR_GET", result: [] },
    { code: "SUC_GET", result: [] },
    {
      code: "SUC_GET",
      result: [
        { code: "child", active: true },
        { code: "child", active: true },
      ],
    },
    { code: "SUC_GET", result: [{ code: "other", active: true }] },
    { code: "SUC_GET", success: false, result: [] },
    { code: "SUC_GET", errors: {}, result: [] },
  ]) {
    const f = fixture();
    f.faults.read = result;
    await assert.rejects(f.owner.hierarchy("child"));
  }
});
test("reference normalizer is replaceable through effective partial exports", async () => {
  const f = fixture();
  let calls = 0;
  const owner = {
    ...f.owner,
    hierarchyReferenceCode: function (...args) {
      calls++;
      return source.hierarchyReferenceCode.apply(this, args);
    },
  };
  await owner.hierarchy("child");
  assert.ok(calls > 1);
});

test("creation rejects an invalid parent before tenant, enterprise or activation writes", async () => {
  fixture();
  const writes = [];
  const owner = {
    ...management,
    ensureTenant: async () => writes.push("tenant"),
    activateEnterpriseRuntime: async () => writes.push("activation"),
    prepareDefaultAdministrator: async () => writes.push("administrator"),
  };
  SERVICE.DefaultEnterpriseService = {
    ...source,
    get: async () => ({ code: "SUC_GET", result: [] }),
    hierarchy: async () => {
      throw new Error("invalid parent");
    },
    save: async () => writes.push("enterprise"),
  };
  const request = {
    authData: {
      tokenType: "access",
      loginId: "operator",
      principalType: "human",
      entCode: "default",
      userGroups: ["adminGroup"],
    },
    body: {
      code: "new-child",
      name: "Child",
      tenantCode: "new-tenant",
      superEnterpriseCode: "missing",
    },
  };
  await assert.rejects(owner.create(request), /invalid parent/);
  assert.deepEqual(writes, []);
  delete request.body.superEnterpriseCode;
  await assert.rejects(
    owner.create(request, { superEnterprise: "missing" }),
    /invalid parent/,
  );
  assert.deepEqual(writes, []);
});

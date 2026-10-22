/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/profileParticipantDirectoryContract @description Bounded recipient lookup and tenant/privacy authority regression tests. @layer test @owner profile */
const test = require("node:test"), assert = require("node:assert/strict");
const owner = require("../src/service/customer/defaultProfileParticipantDirectoryService");
function setup(t) {
  const globals = ["SERVICE", "CONFIG", "CLASSES"].map(key => [key, global[key]]);
  t.after(() => globals.forEach(([key, value]) => value === undefined ? delete global[key] : global[key] = value));
  const policy = { enabled: true, minimumSearchLength: 3, maximumSearchLength: 100, maximumResults: 20 };
  const row = { code: "customer1", active: true, name: { firstName: "Sam", lastName: "Test" }, loginId: "private@example.test", password: "secret", contacts: ["private"] };
  const f = { policy, row, reads: [], verifications: 0 };
  global.CONFIG = { get: key => key === "profileParticipantDirectory" ? policy : key === "defaultTenant" ? "authority" : undefined };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.SERVICE = {
    DefaultLoggerService: { assertSensitiveRequest: () => {} },
    DefaultEnterpriseMembershipService: { verifyAuthenticatedActor: async () => { f.verifications++; } },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ privateOwner: true }) },
    DefaultCustomerService: { get: async r => { f.reads.push(r); return { code: "SUC_OK", result: [f.row], count: 1 }; } },
    DefaultEnterpriseService: { get: async r => { f.reads.push(r); return { code: "SUC_OK", result: [f.row], count: 1 }; } },
  };
  f.request = { tenant: "business", authData: { tenant: "business", entCode: "enterprise", loginId: "actor", tokenType: "access", principalType: "customer" },
    body: { ownerType: "CUSTOMER", search: "Sam" } };
  return f;
}
test("search returns display and typed identity only; no contacts, login or credentials", async t => {
  const f = setup(t);
  f.request.authorization = { route: { key: "/participants/search" }, grants: ["customerUserGroup"], authorize: () => true };
  f.request.header = () => undefined;
  const result = await owner.search(f.request);
  assert.deepEqual(result.items, [{ ownerType: "CUSTOMER", ownerCode: "customer1", displayName: "Sam Test" }]);
  assert.equal(f.reads[0].tenant, "business");
  assert.equal(f.verifications, 2);
  assert.equal(f.reads[0].options.recursive, false);
  assert.equal(f.reads[0].searchOptions.pageSize, 20);
});
test("Enterprise lookup uses authority storage but is constrained to original tenant", async t => {
  const f = setup(t); f.row = { code: "partner", active: true, name: "Partner", tenant: "business", properties: { private: true } };
  f.request.body = { ownerType: "ENTERPRISE", ownerCode: "partner" };
  const result = await owner.resolve(f.request);
  assert.equal(result.recipient.ownerCode, "partner");
  assert.equal(f.reads[0].tenant, "authority");
  assert.deepEqual(f.reads[0].query, { active: true, code: "partner", tenant: "business" });
  f.row.tenant = "foreign";
  await assert.rejects(owner.resolve(f.request), /ERR_AUTH/);
});
test("no generic query, empty enumeration, raw regex or ambiguous exact evidence", async t => {
  const f = setup(t);
  await assert.rejects(owner.search({ ...f.request, body: { ownerType: "CUSTOMER", search: "" } }), /ERR_AUTH/);
  await assert.rejects(owner.search({ ...f.request, body: { ownerType: "CUSTOMER", search: "Sam", query: {} } }), /ERR_AUTH/);
  await owner.search({ ...f.request, body: { ownerType: "CUSTOMER", search: "S.*" } });
  assert.equal(f.reads[0].query.$or[1]["name.firstName"].$regex, "^S\\.\\*");
  SERVICE.DefaultCustomerService.get = async () => ({ code: "SUC_OK", result: [f.row], count: 2 });
  await assert.rejects(owner.resolve({ ...f.request, body: { ownerType: "CUSTOMER", ownerCode: "customer1" } }), /ERR_AUTH/);
});
test("scope drift and inactive targets refuse before recipient output", async t => {
  const f = setup(t); f.row.active = false;
  await assert.rejects(owner.search(f.request), /ERR_AUTH/);
  f.row.active = true;
  SERVICE.DefaultCustomerService.get = async r => { r.tenant = "foreign"; return { code: "SUC_OK", result: [f.row], count: 1 }; };
  await assert.rejects(owner.search(f.request), /ERR_AUTH/);
  SERVICE.DefaultCustomerService.get = async () => { f.request.authData.entCode = "changed"; return { code: "SUC_OK", result: [f.row], count: 1 }; };
  await assert.rejects(owner.search(f.request), /ERR_AUTH/);
});

test("directory preserves original HTTP selectors and rejects contradictory aliases before reads", async t => {
  const f = setup(t);
  const controller = require("../src/controller/customer/defaultProfileParticipantDirectoryController");
  const previous = global.FACADE;
  t.after(() => previous === undefined ? delete global.FACADE : global.FACADE = previous);
  global.FACADE = { DefaultProfileParticipantDirectoryFacade: {
    search: request => owner.search(request),
  } };
  f.request.httpRequest = { body: structuredClone(f.request.body) };
  assert.equal((await controller.search(f.request)).data.items.length, 1);
  for (const mutate of [
    r => { r.payload = { ownerType: "CUSTOMER", search: "Other" }; },
    r => { r.httpRequest.body.search = "Other"; },
    r => { r.query = { tenant: "foreign" }; },
    r => { r.httpRequest.headers = { "X-Enterprise-Code": "foreign" }; },
  ]) {
    const r = structuredClone(f.request), before = f.reads.length;
    mutate(r);
    await assert.rejects(controller.search(r), { message: "ERR_AUTH_00003" });
    assert.equal(f.reads.length, before);
  }
  const httpOnly = { ...f.request, body: undefined };
  assert.equal((await controller.search(httpOnly)).data.items.length, 1);
});

test("directory pins selectors and policy across reads and redacts private dependency failures", async t => {
  for (const mode of ["BODY", "POLICY", "STORAGE", "MEMBERSHIP"]) {
    const f = setup(t);
    if (mode === "MEMBERSHIP") SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor = async () => {
      throw new Error("private identity diagnostics");
    };
    SERVICE.DefaultCustomerService.get = async () => {
      if (mode === "BODY") f.request.body.search = "Other";
      if (mode === "POLICY") f.policy.maximumResults++;
      if (mode === "STORAGE") throw new Error("private database diagnostics");
      return { code: "SUC_OK", result: [f.row], count: 1 };
    };
    await assert.rejects(owner.search(f.request), { message: "ERR_AUTH_00003" });
  }
});

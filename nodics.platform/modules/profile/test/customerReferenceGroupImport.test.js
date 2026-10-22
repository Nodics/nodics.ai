/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/customerReferenceGroupImport @description Verifies credential-free additive customer group adoption through Profile governance. @layer test @owner profile */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const customer = require("../src/service/customer/defaultCustomerService");
const governance = require("../src/service/identity/defaultPrincipalGovernanceService");
const stamps = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");

function matches(row, query) {
  return Object.entries(query).every(([field, value]) => {
    if (field === "$or") return value.some((part) => matches(row, part));
    const actual = field.split(".").reduce((current, name) => current?.[name], row);
    if (value && Object.hasOwn(value, "$exists")) return (actual !== undefined) === value.$exists;
    if (value && Object.hasOwn(value, "$in")) return value.$in.includes(actual);
    return JSON.stringify(actual) === JSON.stringify(value);
  });
}

function fixture(t) {
  const previous = Object.fromEntries(["CONFIG", "CLASSES", "SERVICE", "UTILS"].map((key) => [key, global[key]]));
  t.after(() => Object.assign(global, previous));
  global.CONFIG = { get: (name) => name === "identityGovernance" ? { principalPolicy: {
    allowedTypes: ["human", "service", "customer"], serviceType: "service",
    serviceGroup: "serviceGroup", minimumServiceApiKeyLength: 32,
  } } : name === "principalSecurityStamp" ? { pageSize: 100, maximumPages: 2 } : undefined };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.UTILS = { isObject: (value) => value && typeof value === "object" };
  const instruction = { code: "customer", loginId: "customer@demo.test",
    expectedGroupCodes: ["customerUserGroup"],
    groupCodes: ["loyaltyParticipantCustomerUserGroup", "wasteCarbonCustomerUserGroup"] };
  const records = [{ _id: "customer-id", code: instruction.code, loginId: instruction.loginId,
    active: true, principalType: "customer", password: "password-reference", authVersion: 4,
    userGroups: [...instruction.expectedGroupCodes] }];
  const groups = [...instruction.expectedGroupCodes, ...instruction.groupCodes].map((code) => ({ code, active: true }));
  const writes = [], registered = [];
  const envelope = (result) => ({ code: "SUC_OWNER_READ", count: result.length, result: structuredClone(result) });
  const port = (rows) => ({ get: async (request) => envelope(rows.filter((row) => matches(row, request.query))) });
  const owner = { ...customer, ...port(records), update: async (request) => {
    writes.push(structuredClone(request));
    request.schemaModel = { schemaName: "customer" };
    await governance.validateUpdate(request);
    await stamps.preparePrincipalUpdate(request);
    const selected = records.filter((row) => matches(row, request.query));
    selected.forEach((row) => Object.assign(row, structuredClone(request.model)));
    if (selected.length === 1) await stamps.registerPreparedPrincipalUpdate(request);
    return { code: "SUC_OWNER_UPDATE", result: { acknowledged: true, matchedCount: selected.length } };
  } };
  global.SERVICE = {
    DefaultCustomerService: owner,
    DefaultUserGroupService: port(groups),
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultPrincipalSecurityStampService: {
      reserveVersion: async (_tenant, minimum) => minimum,
      register: async (tenant, key, version) => { registered.push({ tenant, key, version }); return true; },
    },
  };
  const authData = { userGroups: ["adminGroup"] };
  return { instruction, records, groups, writes, registered, owner,
    request: { tenant: "default", authData, models: [instruction] } };
}

test("customer group adoption preserves credentials and is idempotent", async (t) => {
  const f = fixture(t), password = f.records[0].password;
  assert.deepEqual(await f.owner.addReferenceGroupsAll(f.request), { result: [{ code: "customer" }] });
  assert.equal(f.writes.length, 1);
  assert.equal(f.writes[0].model.password, undefined);
  assert.equal(f.records[0].password, password);
  assert.deepEqual(f.records[0].userGroups, [...f.instruction.expectedGroupCodes, ...f.instruction.groupCodes]);
  assert.equal(f.records[0].authVersion, 5);
  await f.owner.addReferenceGroupsAll(f.request);
  assert.equal(f.writes.length, 1);
});

test("customer group adoption rejects drift before mutation", async (t) => {
  const f = fixture(t);
  f.records[0].userGroups.push("unexpectedGroup");
  await assert.rejects(f.owner.addReferenceGroupsAll(f.request), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  assert.equal(f.writes.length, 0);
});

test("customer group adoption rejects missing group definitions", async (t) => {
  const f = fixture(t);
  f.groups.pop();
  await assert.rejects(f.owner.addReferenceGroupsAll(f.request));
  assert.equal(f.writes.length, 0);
});

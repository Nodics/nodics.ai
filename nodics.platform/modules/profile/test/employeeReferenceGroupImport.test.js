/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/employeeReferenceGroupImport @description Exercises additive release adoption through real principal governance and stamp owners with isolated persistence ports. @layer test @owner profile */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const employee = require("../src/service/employee/defaultEmployeeService");
const governance = require("../src/service/identity/defaultPrincipalGovernanceService");
const stamps = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
const interceptor = require("../src/service/interceptors/defaultEmployeeUpdateInterceptorService");
const properties = require("../config/properties");

function matches(row, query) {
  return Object.entries(query).every(([field, value]) => {
    if (field === "$or") return value.some(part => matches(row, part));
    const actual = field.split(".").reduce((current, name) => current?.[name], row);
    if (value && Object.hasOwn(value, "$exists")) return (actual !== undefined) === value.$exists;
    if (value && Object.hasOwn(value, "$in")) return value.$in.includes(actual);
    return JSON.stringify(actual) === JSON.stringify(value);
  });
}
function fixture(t) {
  const previous = Object.fromEntries(["CONFIG", "CLASSES", "SERVICE", "UTILS"].map(key => [key, global[key]]));
  t.after(() => Object.assign(global, previous));
  const config = structuredClone(properties);
  config.identityGovernance = { principalPolicy: {
    allowedTypes: ["human", "service", "customer"], serviceType: "service",
    serviceGroup: "serviceGroup", minimumServiceApiKeyLength: 32,
  } };
  global.CONFIG = { get: name => name === "principalSecurityStamp" ? { pageSize: 100, maximumPages: 2 } : config[name] };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.UTILS = { isObject: value => value && typeof value === "object" };
  const instruction = { code: "employee", loginId: "employee@demo.test", enterpriseCode: "DEMO",
    roleCodes: ["COMMERCE_SETUP_PUBLISHER"],
    groupCodes: [...config.enterpriseManagement.accessAssignments.roles.COMMERCE_SETUP_PUBLISHER.groupCodes] };
  const records = [{ _id: "employee-id", code: instruction.code, loginId: instruction.loginId,
    active: true, principalType: "human", password: "password-reference", authVersion: 7,
    userGroups: ["employeeGroup", "existingCustomGroup"], metadata: { enterpriseCode: "DEMO", retained: true } }];
  const groups = [...new Set([...records[0].userGroups, ...instruction.groupCodes])].map(code => ({ code, active: true }));
  const enterprises = [{ _id: "enterprise-id", code: "DEMO", active: true }];
  const reads = [], writes = [], registered = [];
  const envelope = result => ({ code: "SUC_OWNER_READ", count: result.length, result: structuredClone(result) });
  const port = rows => ({ get: async request => {
    reads.push(request);
    return envelope(rows.filter(row => matches(row, request.query)));
  } });
  const owner = { ...employee, ...port(records), update: async request => {
    writes.push(structuredClone(request));
    request.schemaModel = { schemaName: "employee" };
    await governance.validateUpdate(request);
    await interceptor.employeePreUpdate(request);
    await stamps.preparePrincipalUpdate(request);
    const selected = records.filter(row => matches(row, request.query));
    selected.forEach(row => Object.assign(row, structuredClone(request.model)));
    if (selected.length === 1) await stamps.registerPreparedPrincipalUpdate(request);
    return { code: "SUC_OWNER_UPDATE", result: { acknowledged: true, matchedCount: selected.length } };
  } };
  global.SERVICE = {
    DefaultEmployeeService: owner, DefaultUserGroupService: port(groups), DefaultEnterpriseService: port(enterprises),
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultPrincipalSecurityStampService: {
      reserveVersion: async (_tenant, minimum) => minimum,
      register: async (tenant, key, version) => { registered.push({ tenant, key, version }); return true; },
    },
  };
  const authData = { userGroups: ["normal-import-owner"] };
  const request = { tenant: "default", authData, models: [instruction], options: { bypass: true }, query: {} };
  return { config, instruction, records, groups, enterprises, reads, writes, registered, owner, request, authData };
}

test("additive adoption preserves password and extra groups, retains import authority and invokes real governance/stamp hooks", async t => {
  const f = fixture(t), original = structuredClone(f.records[0]);
  assert.deepEqual(await f.owner.addReferenceGroupsAll(f.request), { result: [{ code: "employee" }] });
  assert.equal(f.writes.length, 1);
  assert.deepEqual(f.writes[0].model, { userGroups: [...original.userGroups, ...f.instruction.groupCodes] });
  assert.deepEqual(f.writes[0].authData, f.authData);
  assert.deepEqual(f.writes[0].options, { returnModified: true });
  assert.deepEqual(f.writes[0].query.userGroups, original.userGroups);
  assert.equal(f.writes[0].query.authVersion, 7);
  assert.equal(f.writes[0].query.password, original.password);
  assert.equal(f.writes[0].query["metadata.enterpriseCode"], "DEMO");
  assert.equal(f.records[0].password, original.password);
  assert.deepEqual(f.records[0].metadata, original.metadata);
  assert.equal(f.records[0].authVersion, 8);
  assert.deepEqual(f.registered, [
    { tenant: "default", key: "employee@demo.test", version: 8 },
    { tenant: "default", key: "identity:EMPLOYEE:employee-id", version: 8 },
  ]);
  const reads = f.reads.filter(read => !read.authData.isSystem);
  assert(reads.every(read => read.authData === f.authData && read.options.skipItemCache && read.options.recursive === false));
  await f.owner.addReferenceGroupsAll(f.request);
  assert.equal(f.writes.length, 1);
  assert.equal(f.registered.length, 2);
});

test("legacy absent stamp uses explicit CAS absence and normal stamp allocation", async t => {
  const f = fixture(t);
  delete f.records[0].authVersion;
  await f.owner.addReferenceGroupsAll(f.request);
  assert.deepEqual(f.writes[0].query.authVersion, { $exists: false });
  assert.equal(f.records[0].authVersion, 1);
});

test("complete batch preflight rejects missing later employee without first mutation", async t => {
  const f = fixture(t);
  f.request.models.push({ ...f.instruction, code: "missing", loginId: "missing@demo.test" });
  await assert.rejects(f.owner.addReferenceGroupsAll(f.request));
  assert.equal(f.writes.length, 0);
});

for (const [name, mutate] of Object.entries({
  "password instruction": f => { f.instruction.password = "never-accepted"; },
  "empty authority": f => { f.request.authData = {}; },
  "empty import groups": f => { f.request.authData = { userGroups: [] }; },
  "duplicate instruction": f => { f.request.models.push(f.instruction); },
  "duplicate group": f => { f.instruction.groupCodes.push(f.instruction.groupCodes[0]); },
  "role drift": f => { f.instruction.groupCodes.pop(); },
  "administrative role": f => { f.instruction.roleCodes = ["ENTERPRISE_ADMIN"]; f.instruction.groupCodes = ["adminGroup", "axisViewerUserGroup"]; },
  "runtime group": f => { f.config.enterpriseManagement.accessAssignments.roles.COMMERCE_SETUP_PUBLISHER.groupCodes = ["runtimeConfigAdminUserGroup"]; f.instruction.groupCodes = ["runtimeConfigAdminUserGroup"]; },
  "inactive group": f => { f.groups.at(-1).active = false; },
  "missing group": f => { f.groups.pop(); },
  "foreign enterprise": f => { f.records[0].metadata.enterpriseCode = "FOREIGN"; },
  "contradictory enterprise": f => { f.records[0].enterpriseCode = "FOREIGN"; },
  "inactive enterprise": f => { f.enterprises[0].active = false; },
  "duplicate enterprise": f => { f.enterprises.push({ ...f.enterprises[0], _id: "other" }); },
  "duplicate employee": f => { f.records.push({ ...f.records[0], _id: "other" }); },
  "inactive employee": f => { f.records[0].active = false; },
  "service employee": f => { f.records[0].principalType = "service"; },
  "external binding": f => { f.records[0].authenticationIdentity = { recordId: "external" }; },
  "invalid stamp": f => { f.records[0].authVersion = "7"; },
})) test(`${name} rejects before any mutation`, async t => {
  const f = fixture(t); mutate(f);
  await assert.rejects(f.owner.addReferenceGroupsAll(f.request));
  assert.equal(f.writes.length, 0);
  assert.equal(f.registered.length, 0);
});

for (const field of ["userGroups", "password", "authVersion", "metadata"]) {
  test(`concurrent ${field} edit fails CAS without overwriting or retrying`, async t => {
    const f = fixture(t), update = f.owner.update;
    let calls = 0;
    f.owner.update = async request => {
      calls++;
      f.records[0][field] = ({ userGroups: ["employeeGroup", "concurrent"], password: "new-password-reference",
        authVersion: 20, metadata: { enterpriseCode: "FOREIGN" } })[field];
      return update(request);
    };
    await assert.rejects(f.owner.addReferenceGroupsAll(f.request));
    assert.equal(calls, 1);
    assert.equal(f.registered.length, 0);
    assert(!f.records[0].userGroups.includes(f.instruction.groupCodes[0]));
  });
}

test("uncertain post-write acknowledgement stops; replay verifies current union without another effect", async t => {
  const f = fixture(t), update = f.owner.update;
  f.owner.update = async request => { await update(request); return { code: "SUC_OWNER_UPDATE", result: { acknowledged: false, matchedCount: 1 } }; };
  await assert.rejects(f.owner.addReferenceGroupsAll(f.request));
  assert.equal(f.writes.length, 1);
  assert.equal(f.registered.length, 2);
  f.owner.update = update;
  await f.owner.addReferenceGroupsAll(f.request);
  assert.equal(f.writes.length, 1);
  assert.equal(f.records[0].authVersion, 8);
});

test("generated update authority denial is not replaced by system authority or retried", async t => {
  const f = fixture(t); let calls = 0;
  f.owner.update = async request => { calls++; assert.equal(request.authData, f.authData); throw new Error("schema access denied"); };
  await assert.rejects(f.owner.addReferenceGroupsAll(f.request), /schema access denied/);
  assert.equal(calls, 1);
  assert.equal(f.registered.length, 0);
});

test("normal group governance rejects an inactive retained group rather than dropping it", async t => {
  const f = fixture(t); f.groups[0].active = false;
  await assert.rejects(f.owner.addReferenceGroupsAll(f.request));
  assert.equal(f.records[0].authVersion, 7);
  assert.equal(f.registered.length, 0);
});

test("actual nImport resolves and dispatches the additive Employee owner using normal header authority", async t => {
  const f = fixture(t);
  const descriptor = Object.getOwnPropertyDescriptor(String.prototype, "toUpperCaseFirstChar");
  if (!descriptor) Object.defineProperty(String.prototype, "toUpperCaseFirstChar", {
    configurable: true, value: function () { return this.charAt(0).toUpperCase() + this.slice(1); },
  });
  t.after(() => {
    if (descriptor) Object.defineProperty(String.prototype, "toUpperCaseFirstChar", descriptor);
    else delete String.prototype.toUpperCaseFirstChar;
  });
  CLASSES.DataImportError = CLASSES.NodicsError;
  const definition = require("../../../../nodics.foundation/modules/nData/nImport/import/src/service/process/model/defaultModelImportProcessService");
  const importer = {
    ...definition,
    normalizeModelsForSchema: (_header, models) => models,
    reconcileContentPackVersions: async (_request, _service, models) => models,
    reconcileManagedRevisions: async (_request, _service, models) => models,
    isGovernedContentPackRun: () => false,
  };
  const request = { tenant: "default", options: {}, header: {
    options: { operation: "addReferenceGroupsAll", moduleName: "profile", schemaName: "employee", userGroups: f.authData.userGroups },
    query: { code: "$code", loginId: "$loginId" },
  } };
  assert.equal(await importer.ensureLocalSchemaService(request), f.owner);
  assert.deepEqual(await importer.insertLocalSchemaModel(request, [f.instruction]), [{ code: "employee" }]);
  assert.deepEqual(f.writes[0].authData, f.authData);
  assert.equal(f.writes[0].model.password, undefined);
  assert.equal(f.records[0].authVersion, 8);
});

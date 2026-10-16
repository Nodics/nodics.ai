/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module profile/test/enterpriseBusinessAccess
 * @description Business-access owner regressions with isolated persistence, audit and stamp doubles; not live qualification.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const get = require("lodash/get");
const businessSource = require("../src/service/enterprise/defaultEnterpriseBusinessAccessService");
const membershipSource = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const teamSource = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");
const registrationSource = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const securedSource = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const utilsSource = require("../../../../nodics.foundation/modules/nCommon/src/utils/utils");
const catalogueFixture = require("./helpers/identityCatalogueFixture");
const clone = value => structuredClone(value);
const conflict = /ERR_PROFILE_(TEAM|MEMBERSHIP|REGISTRATION)_/;
const success = result => ({ code: "SUC_DBS_00000", result });
const envelope = rows => ({ ...success(clone(rows)), count: rows.length });

for (const marker of [{ acknowledged: false }, { acknowledged: 1 }, { success: "true" },
  { errors: ["read refused"] }, { errors: "" }, { code: "ERR_DBS_00000" }]) {
  test("business inventory rejects provider failure despite plausible records " + JSON.stringify(marker), async () => {
    const f = fixture();
    f.hooks.employeeRead = () => ({ ...envelope([f.person]), ...marker });
    await assert.rejects(f.business.workspace(f.request), conflict);
    assert.equal(f.calls.employee.length, 0);
    assert.equal(f.calls.assignment.length, 0);
  });
}

function fixture(linked = false) {
  const business = { ...businessSource };
  const roles = catalogueFixture.roles();
  const groups = Object.fromEntries(catalogueFixture.records("UserGroup")
    .concat(catalogueFixture.records("BusinessAccessGroup"), catalogueFixture.records("SpecialAccessGroup"))
    .map(row => [row.code, clone(row)]));
  const codes = role => clone(roles[role].groupCodes);
  const enterprise = { code: "business", tenantCode: "businessTenant", active: true };
  const actor = { _id: "actor-id", code: "administrator", loginId: "admin@example.test", principalType: "human", active: true, authVersion: 3 };
  const identity = { tenantCode: "businessTenant", recordKind: "EMPLOYEE", recordId: actor._id };
  const person = { _id: "person-id", code: "employee", loginId: "employee@example.test", name: { firstName: "Test", lastName: "Employee" },
    principalType: "human", active: true, authVersion: 4, password: "retained-password-reference",
    metadata: { enterpriseCode: enterprise.code, qualification: "retained" }, enterpriseCode: enterprise.code,
    userGroups: [...codes("PRODUCT_VIEW"), ...codes("ORDER_VIEW"), ...codes("CONTENT_VIEW"), "advancedReviewer"] };
  groups.advancedReviewer = { code: "advancedReviewer", active: true, permissions: ["commerce.refund.execute"] };
  groups.employeeUserGroup ||= { code: "employeeUserGroup", active: true, permissions: [] };
  const scope = { code: "scope-a", scopeType: "ENTERPRISE", scopeCode: enterprise.code, principalCode: person.loginId, effect: "ALLOW", status: "ACTIVE" };
  const item = { code: "assignment-a", tenantCode: "businessTenant", enterpriseCode: enterprise.code, revision: 7,
    active: true, status: "REGISTERED", normalizedEmail: person.loginId, roleCode: "PRODUCT_VIEW",
    groupCodes: clone(person.userGroups), scopeType: "ENTERPRISE", scopeCode: enterprise.code,
    registration: { phase: "COMPLETE", employeeCode: person.code, passwordId: "original-password", assignmentDigest: "original-digest" },
    membership: { phase: "COMPLETE", projectionId: person._id, identity: { tenantCode: "anchorTenant", recordKind: "EMPLOYEE", recordId: "anchor-id" }, assignmentDigest: "accepted-digest" } };
  if (linked) {
    person.authenticationIdentity = clone(item.membership.identity);
    person.registrationAssignmentCode = item.code;
    delete person.password;
  }
  const calls = { employee: [], assignment: [], fence: [], audit: [], stamp: [], reads: [], actor: 0, conversions: [] };
  const hooks = {};
  const config = catalogueFixture.properties();
  global.CONFIG = { get: key => get(config, key) };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.UTILS = { ...require("lodash"), ...utilsSource };
  global.NODICS = { getModels: (_module, tenant) => ({ EmployeeModel: { dataBase: "fixture", tenant } }) };
  const registration = { ...registrationSource,
    assertAssignment: async () => {},
  };
  const memberships = { ...membershipSource,
    authority: () => "authorityTenant", base: () => registration, policy: () => {},
    locator: () => clone(identity), anchor: async () => ({ person: clone(actor), identity: clone(identity) }),
    read: async (name, tenant, query) => {
      if (name === "DefaultEnterpriseAccessAssignmentService") {
        assert.equal(tenant, "authorityTenant");
        assert.equal(query.code, item.code);
        return clone(item);
      }
      assert.equal(name, "DefaultEmployeeService");
      assert.equal(tenant, "businessTenant");
      assert.equal(query.loginId, actor.loginId);
      return clone(actor);
    },
    registerMembership: async current => { calls.stamp.push(clone(current)); await hooks.stamp?.(current); },
  };
  const team = { ...teamSource, policy: () => {},
    persist: async (previous, query, patch) => {
      calls.fence.push(clone({ query, patch }));
      assert.equal(previous.teamRevision, enterprise.teamRevision);
      if (query["teamOperation.id"]) assert.equal(query["teamOperation.id"], enterprise.teamOperation.id);
      if (query["teamOperation.phase"]) assert.equal(query["teamOperation.phase"], enterprise.teamOperation.phase);
      Object.assign(enterprise, clone(patch));
      await hooks.fence?.(patch);
      return clone(enterprise);
    },
  };
  const hydrated = (code, seen = new Set()) => {
    if (!groups[code]) return undefined;
    assert.ok(!seen.has(code), "fixture group ancestry must be acyclic");
    const row = clone(groups[code]);
    row.parentGroups = (row.parentGroups || []).map(parent => typeof parent === "string" ? hydrated(parent, new Set([...seen, code])) : parent);
    return row;
  };
  global.SERVICE = {
    DefaultEnterpriseBusinessAccessService: business,
    DefaultEnterpriseMembershipService: memberships,
    DefaultEnterpriseTeamAdministrationService: team,
    DefaultEnterpriseRegistrationService: registration,
    DefaultIdentityCatalogueService: catalogueFixture.catalogue(() => roles),
    DefaultSecuredRequestPipelineService: { ...securedSource },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultProfileService: { getProfileModuleName: () => "profile" },
    DefaultDatabaseConfigurationService: { toObjectId: (model, value) => { calls.conversions.push({ model, value }); return value; } },
    DefaultPrincipalSecurityStampService: { validate: async auth => { calls.actor++; await hooks.actor?.(auth); } },
    DefaultPrincipalScopeAssignmentService: { update: async () => assert.fail("Business levels must not mutate scopes") },
    DefaultEnterpriseService: { get: async request => {
      assert.equal(team.ownsEnterpriseRead(request), true);
      const response = envelope([enterprise]);
      team.redactEnterprise(request, response);
      return response;
    } },
    DefaultEnterpriseManagementService: {
      ...require("../src/service/enterprise/defaultEnterpriseManagementService"),
      retrieveEnterpriseForAccess: async (code, reader) => {
      assert.equal(code, enterprise.code);
      const response = await reader(SERVICE.DefaultEnterpriseService, { tenant: "authorityTenant", query: { code },
        options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, pageNumber: 1 } });
      return { enterprise: response.result[0], tenantCode: enterprise.tenantCode };
    } },
    DefaultUserGroupService: { get: async request => {
      assert.equal(request.tenant, "businessTenant");
      assert.equal(request.options.skipItemCache, true);
      return envelope(request.query.code.$in.map(code => hydrated(code)).filter(Boolean));
    } },
    DefaultEmployeeService: {
      get: async request => {
        calls.reads.push(request);
        assert.equal(request.tenant, "businessTenant");
        assert.equal(request.options.skipItemCache, true);
        assert.equal(request.options.recursive, false);
        return hooks.employeeRead ? hooks.employeeRead(request) : envelope([person]);
      },
      update: async command => {
        calls.employee.push(command);
        assert.equal(business.ownsEmployeeWrite(command), true);
        assert.equal(business.ownsEmployeeWrite(clone(command)), false);
        const before = clone(person);
        for (const [key, value] of Object.entries(command.query)) {
          if (value && value.$exists === false) assert.equal(before[key], undefined, key);
          else assert.deepEqual(value, before[key], key);
        }
        await hooks.privateWrite?.(command);
        if (hooks.beforeEmployee) return hooks.beforeEmployee(command);
        Object.assign(person, clone(command.model), { authVersion: person.authVersion + 1 });
        await hooks.afterEmployee?.(person);
        return hooks.employeeResult === undefined ? success({ acknowledged: true, matchedCount: 1, modifiedCount: 1 }) : hooks.employeeResult;
      },
    },
    DefaultEnterpriseAccessAssignmentService: {
      get: async request => { assert.equal(request.tenant, "authorityTenant"); return envelope(linked ? [item] : []); },
      update: async command => {
        calls.assignment.push(clone(command));
        assert.equal(memberships.ownsMembershipWrite(command), true);
        assert.equal(command.query.revision, item.revision);
        assert.deepEqual(Object.keys(command.model).sort(), ["code", "membership", "membershipMutation", "revision"]);
        if (hooks.beforeAssignment) return hooks.beforeAssignment(command);
        Object.assign(item, clone(command.model), { revision: item.revision + 1 });
        if (hooks.afterAssignment) return hooks.afterAssignment(command);
        return success({ acknowledged: true, matchedCount: 1 });
      },
    },
    DefaultAuthAuditService: { record: async event => { calls.audit.push(clone(event)); return hooks.audit ? hooks.audit(event) : true; } },
  };
  const request = { tenant: "businessTenant", authData: { tenant: "businessTenant", entCode: enterprise.code,
    loginId: actor.loginId, authVersion: actor.authVersion, tokenType: "access", principalType: "human", authenticationMethod: "PASSWORD",
    permissions: ["profile.enterpriseAccess.assign"] } };
  const command = async (changes = [{ businessArea: "products", accessLevel: "edit" }], operationId = "operation_12345678") => {
    const workspace = await business.workspace(request);
    return { ...request, body: { employeeCode: person.code, reviewFingerprint: workspace.employees[0].reviewFingerprint, operationId, changes } };
  };
  return { business, memberships, team, person, item, enterprise, actor, identity, scope, roles, groups, codes, hooks, calls, request, command };
}

test("fresh business group authority refuses unsuccessful shared-owner reads", async () => {
  for (const flag of [false, "false", "true", 0, null]) for (const field of ["acknowledged", "success"]) {
    const f = fixture(), read = SERVICE.DefaultUserGroupService.get;
    SERVICE.DefaultUserGroupService.get = async request => ({ ...await read(request), [field]: flag });
    await assert.rejects(f.business.workspace(f.request), conflict);
    assert.equal(f.calls.employee.length, 0);
  }
});

test("business change cannot acknowledge contradictory provider status after a committed write", async () => {
  for (const flag of [false, "false", "true", 0, null]) for (const field of ["acknowledged", "success"]) {
    const f = fixture(), command = await f.command();
    f.hooks.employeeResult = { ...success({ acknowledged: true, matchedCount: 1 }), [field]: flag };
    await assert.rejects(f.business.change(command), conflict);
    assert.equal(f.calls.employee.length, 1);
    assert.deepEqual(f.calls.audit.map(event => event.outcome), ["REQUESTED"]);
  }
});

test("native multi-area change retains advanced groups, other areas, scope and credentials", async () => {
  const f = fixture(), before = clone(f.person), scope = clone(f.scope);
  const request = await f.command([{ businessArea: "products", accessLevel: "edit" }, { businessArea: "orders", accessLevel: "fullControl" }]);
  assert.deepEqual(await f.business.change(request), { employeeCode: f.person.code, changed: true });
  assert.deepEqual(f.person.userGroups, [...f.codes("CONTENT_VIEW"), "advancedReviewer", ...f.codes("PRODUCT_EDIT"), ...f.codes("ORDER_FULL_CONTROL")]);
  assert.deepEqual(f.person, { ...before, userGroups: f.person.userGroups, authVersion: before.authVersion + 1 });
  assert.deepEqual(f.scope, scope);
  assert.equal(f.calls.employee.length, 1);
  assert.equal(f.business.ownsEmployeeWrite(f.calls.employee[0]), false);
  assert.deepEqual(f.calls.audit.map(event => event.outcome), ["REQUESTED", "SUCCESS"]);
  assert.ok(f.calls.reads.every(read => read.authData === f.request.authData));
  const publicResult = JSON.stringify(await f.business.workspace(f.request));
  for (const secret of [before.password, before._id, "qualification", "authenticationIdentity"]) assert.ok(!publicResult.includes(secret), secret);
});

test("No access removes only the selected area and an empty native group set falls back to Employee", async () => {
  const f = fixture();
  await f.business.change(await f.command([{ businessArea: "products", accessLevel: "noAccess" }]));
  assert.deepEqual(f.person.userGroups, [...f.codes("ORDER_VIEW"), ...f.codes("CONTENT_VIEW"), "advancedReviewer"]);
  assert.equal(f.person.active, true);
  f.person.userGroups = f.codes("PRODUCT_VIEW");
  await f.business.change(await f.command([{ businessArea: "products", accessLevel: "noAccess" }], "operation_23456789"));
  assert.deepEqual(f.person.userGroups, ["employeeUserGroup"]);
  assert.equal(f.calls.assignment.length, 0);
});

for (const [name, drift] of Object.entries({
  employee: f => { f.person.authVersion++; },
  credential: f => { f.person.password = "new-password"; },
  catalogue: f => { f.roles.PRODUCT_EDIT.groupCodes = f.codes("PRODUCT_FULL_CONTROL"); },
  enterprise: f => { f.enterprise.teamRevision = 9; },
})) test("stale review rejects " + name + " drift before persistence", async () => {
  const f = fixture(), request = await f.command();
  drift(f);
  await assert.rejects(f.business.change(request), conflict);
  assert.equal(f.calls.employee.length + f.calls.assignment.length + f.calls.fence.length + f.calls.audit.length, 0);
});

for (const [name, mutate] of Object.entries({
  service: f => { f.request.authData.principalType = "service"; },
  customer: f => { f.request.authData.principalType = "customer"; },
  external: f => { f.request.authData.authenticationMethod = "EXTERNAL"; },
  system: f => { f.request.authData.isSystem = true; },
  runtime: f => { f.request.authData.runtimeScope = "profile"; },
  refresh: f => { f.request.authData.tokenType = "refresh"; },
  requestTenant: (_f, request) => { request.tenant = "foreign"; },
  enterpriseTenant: f => { f.enterprise.tenantCode = "foreign"; },
  inactiveEnterprise: f => { f.enterprise.active = false; },
  permission: f => { f.request.authData.permissions = []; },
  staleActor: f => { f.actor.authVersion++; },
  inactiveGroup: f => { f.groups[f.codes("PRODUCT_EDIT")[0]].active = false; },
  missingGroup: f => { delete f.groups[f.codes("PRODUCT_EDIT")[0]]; },
  wildcard: f => { f.groups[f.codes("PRODUCT_EDIT")[0]].permissions = ["commerce.*"]; },
  inheritedWildcard: f => { f.groups[f.codes("PRODUCT_EDIT")[0]].parentGroups = [{ code: "parent", active: true, permissions: ["*"] }]; },
  privilegedParent: f => { f.groups[f.codes("PRODUCT_EDIT")[0]].parentGroups = [{ code: "adminGroup", active: true }]; },
  sharedGroup: f => { f.roles.PRODUCT_EDIT.groupCodes = f.codes("ORDER_VIEW"); },
})) test("actor/tenant/catalogue admission rejects " + name, async () => {
  const f = fixture(), request = await f.command();
  mutate(f, request);
  await assert.rejects(f.business.change(request), conflict);
  assert.equal(f.calls.employee.length + f.calls.assignment.length + f.calls.fence.length, 0);
});

test("native actor is freshly revalidated after requested audit", async () => {
  const f = fixture(), request = await f.command();
  f.hooks.audit = event => { if (event.outcome === "REQUESTED") f.actor.authVersion++; return true; };
  await assert.rejects(f.business.change(request), conflict);
  assert.equal(f.calls.employee.length, 0);
});

for (const [name, result] of Object.entries({
  missing: null, failed: { code: "ERR_DBS_00000" }, zero: success({ acknowledged: true, matchedCount: 0 }),
  uncertain: success({ matchedCount: 1 }), multiple: success({ acknowledged: true, matchedCount: 2 }),
  stringCount: success({ acknowledged: true, matchedCount: "1" }),
  error: { ...success({ acknowledged: true, matchedCount: 1 }), error: "failure" },
  errors: { ...success({ acknowledged: true, matchedCount: 1 }), errors: ["failure"] },
  malformedErrors: { ...success({ acknowledged: true, matchedCount: 1 }), errors: {} },
})) test("native CAS refuses " + name + " acknowledgement without replay", async () => {
  const f = fixture(), request = await f.command();
  f.hooks.employeeResult = result;
  await assert.rejects(f.business.change(request), conflict);
  assert.equal(f.calls.employee.length, 1);
  assert.equal(f.business.ownsEmployeeWrite(f.calls.employee[0]), false);
  assert.deepEqual(f.calls.audit.map(event => event.outcome), ["REQUESTED"]);
});

test("native uncertain thrown write releases private proof and is not retried", async () => {
  const f = fixture(), request = await f.command();
  f.hooks.beforeEmployee = () => { throw new Error("uncertain storage response"); };
  await assert.rejects(f.business.change(request), /uncertain storage/);
  assert.equal(f.calls.employee.length, 1);
  assert.equal(f.business.ownsEmployeeWrite(f.calls.employee[0]), false);
});

for (const [name, mutate] of Object.entries({
  password: person => { person.password = "unexpected-credential"; },
  enterprise: person => { person.metadata.enterpriseCode = "foreign"; },
  identity: person => { person.authenticationIdentity = { recordId: "foreign" }; },
  groups: person => { person.userGroups.push("adminGroup"); },
  unchangedStamp: person => { person.authVersion = 4; },
  missingStamp: person => { delete person.authVersion; },
  malformedStamp: person => { person.authVersion = "invalid"; },
})) test("native readback refuses " + name + " drift", async () => {
  const f = fixture(), request = await f.command();
  f.hooks.afterEmployee = mutate;
  await assert.rejects(f.business.change(request), conflict);
  assert.deepEqual(f.calls.audit.map(event => event.outcome), ["REQUESTED"]);
});

test("private Employee write binds request identity, tenant, actor, selector, options and group-only payload", async () => {
  const f = fixture();
  f.hooks.privateWrite = command => {
    assert.equal(f.business.ownsEmployeeWrite({ ...command }), false);
    for (const [key, value] of Object.entries({ tenant: "foreign", authData: { ...command.authData, loginId: "other" },
      query: { ...command.query, code: "other" }, options: { ...command.options, upsert: true },
      model: { userGroups: ["adminGroup"] } })) {
      const previous = command[key];
      command[key] = value;
      assert.equal(f.business.ownsEmployeeWrite(command), false, key);
      command[key] = previous;
    }
    for (const key of ["password", "active", "enterpriseCode", "scopeCode"]) {
      command.model[key] = "forbidden";
      assert.equal(f.business.ownsEmployeeWrite(command), false, key);
      delete command.model[key];
    }
    command.model.authVersion = 5;
    assert.equal(f.business.ownsEmployeeWrite(command), true, "normal stamp hook remains allowed");
    delete command.model.authVersion;
  };
  await f.business.change(await f.command());
  assert.equal(f.business.ownsEmployeeWrite(f.calls.employee[0]), false);
});

for (const mode of ["missing", "refused", "throws", "postwrite"]) test("audit failure " + mode + " never returns success", async () => {
  const f = fixture(), request = await f.command();
  if (mode === "missing") delete SERVICE.DefaultAuthAuditService;
  else f.hooks.audit = event => {
    if (mode === "throws") throw new Error("audit unavailable");
    return mode === "postwrite" && event.outcome === "REQUESTED";
  };
  await assert.rejects(f.business.change(request), /ERR_PROFILE_TEAM_CONFLICT|audit unavailable/);
  assert.equal(f.calls.employee.length, mode === "postwrite" ? 1 : 0);
});

test("linked current groups change through membership owner while original registration and top fields remain", async () => {
  const f = fixture(true), before = clone(f.item), person = clone(f.person), scope = clone(f.scope);
  const request = await f.command([{ businessArea: "products", accessLevel: "noAccess" }, { businessArea: "orders", accessLevel: "edit" }]);
  assert.deepEqual(await f.business.change(request), { employeeCode: f.person.code, changed: true, revision: 8 });
  assert.deepEqual(f.memberships.currentGroupCodes(f.item), [...f.codes("CONTENT_VIEW"), "advancedReviewer", ...f.codes("ORDER_EDIT")]);
  for (const key of Object.keys(before).filter(key => !["revision", "membership"].includes(key))) assert.deepEqual(f.item[key], before[key], key);
  for (const key of Object.keys(before.membership)) assert.deepEqual(f.item.membership[key], before.membership[key], key);
  assert.deepEqual(f.person, person);
  assert.deepEqual(f.scope, scope);
  assert.equal(f.calls.employee.length, 0);
  assert.equal(f.calls.assignment.length, 1);
  assert.equal(f.calls.stamp.length, 1);
  assert.equal(f.enterprise.teamOperation.phase, "COMPLETE");
  assert.ok(f.calls.conversions.some(call => call.value === f.person._id), "linked inventory uses provider ID conversion");
  const workspace = await f.business.workspace(f.request);
  assert.equal(workspace.employees[0].selections.find(area => area.businessArea === "products").accessLevel, "noAccess");
  assert.equal(workspace.employees[0].selections.find(area => area.businessArea === "orders").accessLevel, "edit");
});

async function interrupted(f) {
  const request = await f.command();
  f.hooks.stamp = () => { throw new Error("stamp interrupted after commit"); };
  await assert.rejects(f.business.change(request), /stamp interrupted/);
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  assert.equal(f.item.revision, 8);
  delete f.hooks.stamp;
  return request;
}

test("same-operation recovery repairs exact committed membership without replay and repeats completed outcome", async () => {
  const f = fixture(true), request = await interrupted(f);
  const input = clone(f.enterprise.teamOperation.input), actor = clone(f.enterprise.teamOperation.actor);
  const result = await f.business.change(request);
  assert.deepEqual(result, { employeeCode: f.person.code, changed: true, revision: 8 });
  assert.equal(f.calls.assignment.length, 1);
  assert.equal(f.calls.stamp.length, 2);
  assert.equal(f.enterprise.teamOperation.phase, "COMPLETE");
  assert.deepEqual(f.enterprise.teamOperation.input, input);
  assert.deepEqual(f.enterprise.teamOperation.actor, actor);
  assert.deepEqual(await f.business.change(request), result);
  assert.equal(f.calls.stamp.length, 2);
});

for (const [name, mutate] of Object.entries({
  changedInput: (f, request) => { request.body.changes[0].accessLevel = "fullControl"; },
  changedActor: f => { f.identity.recordId = "different-actor"; },
  lostPermission: f => { f.request.authData.permissions = []; },
  wrongOperation: f => { f.enterprise.teamOperation.operation = "REVOKE"; },
  corruptHash: f => { f.enterprise.teamOperation.hash = "corrupt"; },
  wrongRevision: f => { f.item.revision++; },
  wrongMarker: f => { f.item.membership.lastTeamOperation = "operation_different"; },
  wrongGroups: f => { f.item.membership.businessAccess.groupCodes.push("adminGroup"); },
  foreignTenant: f => { f.item.tenantCode = "foreign"; },
  ambiguousCommit: f => { delete f.item.membership.businessAccess; },
})) test("same-operation recovery refuses " + name + " and retains the fence", async () => {
  const f = fixture(true), request = await interrupted(f);
  mutate(f, request);
  await assert.rejects(f.business.change(request), conflict);
  assert.equal(f.calls.assignment.length, 1);
  assert.equal(f.calls.stamp.length, 1);
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
});

test("post-repair drift refuses completion and retains the existing operation", async () => {
  const f = fixture(true), request = await interrupted(f);
  f.hooks.stamp = () => { f.item.membership.businessAccess.groupCodes.push("adminGroup"); };
  await assert.rejects(f.business.change(request), conflict);
  assert.equal(f.calls.assignment.length, 1);
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
});

test("safe prewrite refusal completes the fence as failure and same-operation retry cannot turn it into success", async () => {
  const f = fixture(true), request = await f.command();
  f.hooks.fence = patch => { if (patch.teamOperation.phase === "PENDING") f.item.revision++; };
  await assert.rejects(f.business.change(request), conflict);
  assert.equal(f.calls.assignment.length, 0);
  assert.equal(f.enterprise.teamOperation.phase, "COMPLETE");
  assert.equal(f.enterprise.teamOperation.outcome.errorCode, "ERR_PROFILE_TEAM_CONFLICT");
  await assert.rejects(f.business.change(request), conflict);
  assert.equal(f.calls.assignment.length, 0);
});

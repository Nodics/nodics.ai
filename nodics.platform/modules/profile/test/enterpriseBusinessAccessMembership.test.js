/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module profile/test/enterpriseBusinessAccessMembership
 * @description Exercises edited membership authority through real authentication, session, invalidation and assignment guards with isolated storage/token owners.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const lodash = require("lodash");
const membershipSource = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const businessSource = require("../src/service/enterprise/defaultEnterpriseBusinessAccessService");
const registrationSource = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const managementSource = require("../src/service/enterprise/defaultEnterpriseManagementService");
const authenticationSource = require("../src/service/authentication/defaultAuthenticationProviderService");
const governanceSource = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
const consentSource = require("../src/service/enterprise/defaultEnterpriseAdministrationConsentService");
const enterpriseSource = require("../src/service/enterprise/defaultEnterpriseService");
const securedSource = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const stampSource = require("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultPrincipalSecurityStampService");
const utilsSource = require("../../../../nodics.foundation/modules/nCommon/src/utils/utils");
const catalogueFixture = require("./helpers/identityCatalogueFixture");
const interceptors = require("../src/interceptors/interceptors");
const clone = value => structuredClone(value);
const envelope = rows => ({ code: "SUC_DBS_00000", result: clone(rows), count: rows.length });

// The storage double evaluates the selectors emitted by real owners, including
// the current-group branch; ignoring these predicates would hide missed invalidation.
function matches(row, query) {
  return Object.entries(query).every(([key, value]) => {
    if (key === "$or") return value.some(branch => matches(row, branch));
    const actual = lodash.get(row, key);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      assert.deepEqual(Object.keys(value), ["$in"], "unexpected fixture query operator");
      return (Array.isArray(actual) ? actual : [actual]).some(entry => value.$in.includes(entry));
    }
    return lodash.isEqual(actual, value);
  });
}

function fixture() {
  const config = catalogueFixture.properties();
  config.defaultTenant = "authority";
  config.enterpriseManagement.memberships = { enabled: true, inventoryQualified: true, sessionBindingQualified: true,
    assignmentClaimIndexQualified: true, pageSize: 20, maximumInventoryPages: 2 };
  global.CONFIG = { get: key => lodash.get(config, key) };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.ENUMS = { ProfileEmployeeApplicationStatus: { APPROVED: { key: "APPROVED" }, REGISTERED: { key: "REGISTERED" } } };
  global.UTILS = { ...lodash, ...utilsSource,
    compareHash: async (submitted, stored) => { assert.equal(stored, "anchor-hash"); return submitted === "correct-proof"; } };
  global.NODICS = { getModels: (_module, tenant) => Object.fromEntries(["Employee", "Password", "PrincipalScopeAssignment"]
    .map(name => [name + "Model", { dataBase: "fixture", tenant }])) };
  const roles = catalogueFixture.roles();
  const codes = role => clone(roles[role].groupCodes);
  const groupRows = Object.fromEntries(catalogueFixture.records("UserGroup").concat(catalogueFixture.records("BusinessAccessGroup"))
    .map(row => [row.code, { ...clone(row), _id: "id-" + row.code }]));
  const identity = { tenantCode: "anchorTenant", recordKind: "EMPLOYEE", recordId: "anchor-id" };
  const anchor = { _id: identity.recordId, code: "anchor-person", loginId: "person@example.test", active: true,
    principalType: "human", authVersion: 3, password: "anchor-password", userGroups: ["platformAdministratorUserGroup"] };
  const person = { _id: "projection-id", code: "projection", loginId: anchor.loginId, active: true, principalType: "human", authVersion: 2,
    authenticationIdentity: clone(identity), userGroups: ["platformAdministratorUserGroup"], userGroupCodes: ["adminGroup"], userGroupPermissions: ["*"] };
  const enterprise = { code: "business", active: true, tenant: { code: "targetTenant", active: true } };
  const item = { _id: "assignment-id", code: "assignment-a", tenantCode: "targetTenant", enterpriseCode: enterprise.code,
    normalizedEmail: person.loginId, registeredLoginId: person.loginId, active: true, status: "REGISTERED", revision: 8,
    roleCode: "PRODUCT_VIEW", groupCodes: codes("PRODUCT_VIEW"), scopeType: "ENTERPRISE", scopeCode: enterprise.code,
    membership: { phase: "COMPLETE", projectionId: person._id, identity: clone(identity),
      businessAccess: { version: 1, groupCodes: codes("ORDER_EDIT"), operationId: "operation_12345678" } } };
  const scope = { _id: "scope-id", active: true, status: "ACTIVE", effect: "ALLOW", principalType: "human", principalCode: person.loginId,
    enterpriseCode: enterprise.code, tenantCode: "targetTenant", scopeType: "ENTERPRISE", scopeCode: enterprise.code, inheritanceMode: "DIRECT" };
  const calls = { reads: [], groups: [], writes: [], stamps: [], sessions: [], tokens: [], state: [], credentials: [], scopes: [], removed: [] };
  const stamps = new Map(), refresh = new Map();
  const memberships = { ...membershipSource };
  const registration = { ...registrationSource };
  const management = { ...managementSource, retrieveEnterpriseForAccess: async code => {
    assert.equal(code, enterprise.code);
    return { enterprise: clone(enterprise), tenantCode: enterprise.tenant.code };
  } };
  const auth = { ...authenticationSource,
    findToken: async (_module, key) => clone(stamps.get(key)),
    updateAuthData: async options => { calls.state.push(clone(options)); },
    createRefreshToken: async session => {
      const key = "refresh-" + (calls.sessions.length + 1);
      calls.sessions.push(clone(session)); refresh.set(key, clone(session)); return key;
    },
    consumeToken: async (_module, key) => { const result = refresh.get(key); refresh.delete(key); return clone(result); },
    generateAuthToken: session => { calls.tokens.push(clone(session)); return "access-" + calls.tokens.length; },
    recordAuthEvent: async () => true,
    removeToken: async (_module, key) => { calls.removed.push(key); refresh.delete(key); },
  };
  const hydrate = code => {
    const row = clone(groupRows[code]);
    assert.ok(row, code);
    row.parentGroups = (row.parentGroups || []).map(parent => typeof parent === "string" ? hydrate(parent) : parent);
    return row;
  };
  const read = (name, rows, request) => {
    calls.reads.push({ name, request: clone(request) });
    assert.equal(request.options.skipItemCache, true);
    return envelope(rows.filter(row => matches(row, request.query || {})));
  };
  const guard = async (trigger, request) => {
    const configured = Object.values(interceptors).find(row => row.item === "enterpriseAccessAssignment" && row.trigger === trigger &&
      row.handler === "DefaultEnterpriseMembershipService.protectAssignment");
    assert.ok(configured, "generated assignment mutation must retain its existing guard");
    assert.equal(configured.active, "true");
    const [owner, method] = configured.handler.split(".");
    return SERVICE[owner][method](request);
  };
  global.SERVICE = {
    DefaultEnterpriseMembershipService: memberships,
    DefaultEnterpriseBusinessAccessService: { ...businessSource },
    DefaultEnterpriseRegistrationService: registration,
    DefaultEnterpriseManagementService: management,
    DefaultIdentityCatalogueService: catalogueFixture.catalogue(() => roles),
    DefaultAuthenticationProviderService: auth,
    DefaultSecuredRequestPipelineService: { ...securedSource },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultProfileService: { getProfileModuleName: () => "profile" },
    DefaultDatabaseConfigurationService: { toObjectId: (_model, value) => value },
    DefaultUserStateService: { findUserState: async request => {
      assert.equal(request.tenant, identity.tenantCode); return { _id: "anchor-state", locked: false, attempts: 0 };
    } },
    DefaultPasswordService: { get: async request => {
      calls.credentials.push(clone(request)); assert.equal(request.tenant, identity.tenantCode);
      assert.deepEqual(request.query, { _id: anchor.password });
      return envelope([{ _id: anchor.password, loginId: person.loginId, active: true, password: "anchor-hash", provider: "PASSWORD" }]);
    } },
    DefaultEnterpriseService: { ...enterpriseSource, retrieveEnterprise: async () => clone(enterprise) },
    DefaultEmployeeService: {
      get: async request => read("employee", request.tenant === identity.tenantCode ? [anchor] : [person], request),
      findByLoginId: async request => {
        assert.equal(request.tenant, item.tenantCode); assert.equal(request.loginId, person.loginId); return clone(person);
      },
      update: async () => assert.fail("group invalidation must update membership authority, not projection groups"),
    },
    DefaultCustomerService: { get: async request => read("customer", [], request) },
    DefaultPrincipalScopeAssignmentService: { get: async request => {
      assert.equal(request.tenant, item.tenantCode); return read("scope", [scope], request);
    } },
    DefaultPrincipalScopeGovernanceService: {
      isEffective: row => row.active === true,
      getEffectiveScopes: async request => { calls.scopes.push(clone(request)); return { scopes: [clone(scope)], deniedScopes: [] }; },
    },
    DefaultUserGroupService: { get: async request => {
      assert.equal(request.tenant, item.tenantCode);
      const result = Object.values(groupRows).filter(row => matches(row, request.query || {}));
      if (request.options.recursive) calls.groups.push(clone(request.query.code.$in));
      return read("group", request.options.recursive ? result.map(row => hydrate(row.code)) : result, request);
    } },
    DefaultEnterpriseAccessAssignmentService: {
      get: async request => { assert.equal(request.tenant, "authority"); return read("assignment", [item], request); },
      update: async request => {
        await guard("preUpdate", request);
        assert.equal(memberships.ownsMembershipWrite(request), true);
        await assert.rejects(guard("preUpdate", clone(request)), { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" });
        assert.ok(matches(item, request.query));
        calls.writes.push(clone(request));
        Object.assign(item, clone(request.model), { revision: item.revision + 1 });
        return { code: "SUC_DBS_00000", result: { acknowledged: true, matchedCount: 1 } };
      },
    },
    DefaultPrincipalSecurityStampService: { ...stampSource },
    DefaultCacheService: {
      putVersioned: async request => {
        assert.equal(request.channelName, "auth");
        assert.equal(request.versionProperty, "authVersion");
        const previous = stamps.get(request.key);
        const value = previous && previous.authVersion > request.value.authVersion ? previous : clone(request.value);
        stamps.set(request.key, value);
        calls.stamps.push({ tenant: value.tenant, principalId: value.principalId, version: value.authVersion });
        return { code: "SUC_CACHE_00000", result: clone(value) };
      },
    },
    DefaultAuthSecurityService: { getAuthorizationPolicyVersion: () => 1, validateAuthorizationPolicy: () => {} },
  };
  const retainOriginal = () => {
    item.groupCodes = codes(item.roleCode);
    item.membership.assignmentDigest = registration.assignmentDigest(item);
    item.registration = { phase: "COMPLETE", assignmentDigest: item.membership.assignmentDigest, passwordId: "original-registration-password" };
  };
  retainOriginal();
  scope.code = "membershipScope_" + memberships.digest(item.code);
  const login = () => auth.authenticate({ person: clone(person), enterprise: clone(enterprise), type: "Employee", request: { password: "correct-proof" } });
  const edit = groupCodes => memberships.write(clone(item), { membership: { ...clone(item.membership),
    businessAccess: { version: 1, groupCodes: clone(groupCodes), operationId: "operation_23456789" } } });
  return { memberships, auth, governance: { ...governanceSource }, item, person, anchor, identity, scope, enterprise, roles,
    groupRows, codes, hydrate, calls, stamps, config, guard, login, edit, retainOriginal };
}

test("password authentication and refresh issue current membership groups using only anchor credentials", async () => {
  const f = fixture(), before = clone(f.person), original = clone(f.item.groupCodes);
  const result = await f.login();
  assert.ok(result.authToken && result.refreshToken);
  const expected = f.auth.resolveSessionUserGroups({ userGroups: f.codes("ORDER_EDIT").map(f.hydrate) });
  const permissions = UTILS.getUserGroupPermissions(f.codes("ORDER_EDIT").map(f.hydrate));
  assert.deepEqual(f.calls.tokens[0].userGroups, expected);
  assert.deepEqual(f.calls.tokens[0].permissions, permissions);
  assert.equal(f.calls.tokens[0].authenticationMethod, "PASSWORD");
  assert.deepEqual(f.calls.tokens[0].sessionContext, { owner: "profile", code: f.item.code, version: 8 });
  assert.ok(!f.calls.tokens[0].userGroups.includes("platformAdministratorUserGroup"));
  assert.ok(!f.calls.tokens[0].permissions.includes("*"));
  assert.ok(f.calls.scopes.every(request => lodash.isEqual(request.authData.userGroups, expected)));
  await f.auth.rotateRefreshToken({ refreshToken: result.refreshToken, entCode: f.enterprise.code, type: "Employee" });
  assert.deepEqual(f.calls.tokens[1].userGroups, expected);
  assert.deepEqual(f.calls.tokens[1].permissions, permissions);
  assert.ok(f.calls.credentials.length >= 2);
  assert.ok(f.calls.state.every(call => call.tenant === f.identity.tenantCode));
  assert.deepEqual(f.person, before);
  assert.deepEqual(f.item.groupCodes, original);
});

test("managed edit invalidates retained session revision and fresh authentication picks up current groups", async () => {
  const f = fixture(), previous = await f.login(), before = clone(f.item);
  await f.edit(f.codes("PRODUCT_EDIT"));
  assert.equal(f.item.revision, 9);
  assert.deepEqual(f.item.registration, before.registration);
  assert.deepEqual(f.item.groupCodes, before.groupCodes);
  await assert.rejects(SERVICE.DefaultPrincipalSecurityStampService.validate({ ...f.calls.tokens[0], tokenType: "access" }),
    { code: "ERR_AUTH_00001" });
  await assert.rejects(f.auth.rotateRefreshToken({ refreshToken: previous.refreshToken }), /ERR_AUTH_00001|ERR_PROFILE_MEMBERSHIP_/);
  assert.equal(f.calls.tokens.length, 1, "stale refresh cannot mint upgraded authority");
  await f.login();
  assert.deepEqual(f.calls.tokens[1].userGroups, f.auth.resolveSessionUserGroups({ userGroups: f.codes("PRODUCT_EDIT").map(f.hydrate) }));
  assert.equal(f.calls.tokens[1].sessionContext.version, 9);
  assert.equal(await SERVICE.DefaultPrincipalSecurityStampService.validate({ ...f.calls.tokens[1], tokenType: "access" }), true);
  assert.equal(f.calls.writes.length, 1);
});

test("unedited membership still authenticates with the original accepted groups", async () => {
  const f = fixture();
  delete f.item.membership.businessAccess;
  await f.login();
  assert.deepEqual(f.calls.tokens[0].userGroups,
    f.auth.resolveSessionUserGroups({ userGroups: f.item.groupCodes.map(f.hydrate) }));
  assert.deepEqual(f.memberships.currentGroupCodes(f.item), f.item.groupCodes);
});

test("context validation rechecks current group activation and never falls back to original invitation groups", async () => {
  const f = fixture();
  await f.login();
  const session = clone(f.calls.sessions[0]);
  f.groupRows[f.codes("ORDER_EDIT")[0]].active = false;
  await assert.rejects(f.memberships.validateContext(session), { code: "ERR_PROFILE_MEMBERSHIP_ASSIGNMENT" });
  assert.equal(f.calls.writes.length, 0);
});

for (const [name, patch] of Object.entries({
  wrongVersion: { version: 2 }, emptyGroups: { groupCodes: [] }, duplicateGroups: { groupCodes: ["same", "same"] },
  malformedGroups: { groupCodes: [null] }, missingOperation: { operationId: undefined },
})) test("authentication rejects malformed current membership " + name, async () => {
  const f = fixture();
  Object.assign(f.item.membership.businessAccess, patch);
  await assert.rejects(f.login(), { code: "ERR_PROFILE_TEAM_CONFLICT" });
  assert.equal(f.calls.tokens.length + f.calls.sessions.length, 0);
});

test("inviter revalidation uses current membership grants for both removal and addition of authority", async () => {
  const f = fixture();
  f.item.roleCode = "ENTERPRISE_ADMIN";
  f.retainOriginal();
  const invitation = { enterpriseCode: f.enterprise.code, roleCode: "PRODUCT_VIEW", groupCodes: f.codes("PRODUCT_VIEW"),
    invitationAuthority: { version: 1, identity: clone(f.identity), membershipCode: f.item.code, enterpriseCode: f.enterprise.code } };
  await assert.rejects(f.memberships.assertInviter(invitation), { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" });
  f.item.roleCode = "PRODUCT_VIEW";
  f.retainOriginal();
  f.item.membership.businessAccess.groupCodes = f.codes("ENTERPRISE_ADMIN");
  await f.memberships.assertInviter(invitation);
  assert.equal(f.calls.writes.length, 0);
});

test("existing pre/post group hooks invalidate memberships matching only edited groups and descendants", async () => {
  const f = fixture(), previous = await f.login(), original = clone(f.item);
  const currentCode = f.codes("ORDER_EDIT")[0];
  assert.ok(!f.item.groupCodes.includes(currentCode));
  f.groupRows.editedParent = { _id: "parent-id", code: "editedParent", active: true, permissions: [] };
  f.groupRows[currentCode].parentGroups = [...(f.groupRows[currentCode].parentGroups || []), "editedParent"];
  const request = { tenant: f.item.tenantCode, query: { code: "editedParent" }, model: { permissions: ["commerce.order.read"] } };
  await f.governance.bumpGroupMembers(request);
  assert.ok(request.affectedMembershipGroups.includes(currentCode));
  assert.equal(f.calls.writes.length, 1);
  assert.equal(f.item.revision, original.revision + 1);
  assert.deepEqual(f.item.membership.businessAccess, original.membership.businessAccess);
  assert.deepEqual(f.item.registration, original.registration);
  assert.deepEqual(f.item.groupCodes, original.groupCodes);
  assert.ok(f.item.membership.permissionMutation);
  await assert.rejects(f.auth.rotateRefreshToken({ refreshToken: previous.refreshToken }), /ERR_AUTH_00001/);
  const firstMutation = f.item.membership.permissionMutation;
  await f.governance.invalidatePreparedGroupMembers(request);
  assert.equal(f.calls.writes.length, 2);
  assert.equal(f.item.revision, original.revision + 2);
  assert.notEqual(f.item.membership.permissionMutation, firstMutation);
  const targeted = f.calls.reads.filter(call => call.name === "assignment" && call.request.query.$or);
  assert.ok(targeted.length >= 2);
  for (const call of targeted) assert.ok(call.request.query.$or.some(branch => branch["membership.businessAccess.groupCodes"]));
  assert.equal(f.calls.stamps.at(-1).version, f.item.revision);
});

test("unrelated group invalidation does not change accepted membership or session revision", async () => {
  const f = fixture(), before = clone(f.item);
  await f.memberships.invalidateGroupMemberships(f.item.tenantCode, ["unrelatedGroup"]);
  await f.memberships.invalidateGroupMemberships("foreignTenant", f.codes("ORDER_EDIT"));
  assert.deepEqual(f.item, before);
  assert.equal(f.calls.writes.length + f.calls.stamps.length, 0);
});

const forgedPatches = {
  nested: { membership: { businessAccess: { version: 1, groupCodes: ["adminGroup"], operationId: "operation_12345678" } } },
  dotted: { "membership.businessAccess.groupCodes": ["adminGroup"] },
  set: { $set: { "membership.businessAccess": { version: 1, groupCodes: ["adminGroup"] } } },
  unset: { $unset: { "membership.businessAccess": true } },
  rename: { $rename: { name: "membership.businessAccess" } },
  push: { $push: { "membership.businessAccess.groupCodes": "adminGroup" } },
  mutation: { membershipMutation: "forged" },
};
for (const trigger of ["preSave", "preUpdate", "preRemove"]) test("registered " + trigger + " assignment guard refuses forged private business-access patches", async () => {
  const f = fixture(), before = clone(f.item);
  for (const [name, model] of Object.entries(forgedPatches)) {
    const request = { tenant: "authority", authData: { isSystem: true }, isSystem: true, ownsMembershipWrite: true,
      query: { code: f.item.code }, model: clone(model), options: { upsert: true } };
    await assert.rejects(f.guard(trigger, request), { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" }, name);
  }
  await assert.rejects(f.guard(trigger, { tenant: "authority", query: { code: f.item.code }, model: { name: "replacement" } }),
    { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" }, "replacement/removal cannot erase current authority");
  assert.deepEqual(f.item, before);
  assert.equal(f.calls.writes.length, 0);
});

test("assignment guard checks every bulk member while real owner write admits only its private request", async () => {
  const f = fixture();
  await assert.rejects(f.guard("preSave", { tenant: "authority", model: [{ code: "ordinary" }, forgedPatches.nested] }),
    { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" });
  await f.edit(f.codes("PRODUCT_EDIT"));
  assert.equal(f.calls.writes.length, 1);
  assert.deepEqual(f.memberships.currentGroupCodes(f.item), f.codes("PRODUCT_EDIT"));
});

test("consent source authority retains a digest of current membership groups, not invitation groups", async () => {
  const f = fixture();
  f.item.roleCode = "ENTERPRISE_ADMIN";
  f.retainOriginal();
  f.item.membership.businessAccess.groupCodes = [...f.codes("ENTERPRISE_ADMIN"), ...f.codes("PRODUCT_EDIT")];
  const consent = { ...consentSource,
    enterprise: async () => clone(f.enterprise),
    policy: () => ({ administratorRoleCodes: ["ENTERPRISE_ADMIN"], permission: "profile.enterpriseAccess.assign",
      accessManagementPermission: "profile.enterpriseAccess.assign" }),
  };
  const result = await consent.sourceAuthority(f.enterprise.code, clone(f.identity), f.item.code);
  const currentGroups = f.memberships.currentGroupCodes(f.item).map(f.hydrate)
    .sort((left, right) => left.code === right.code ? 0 : left.code < right.code ? -1 : 1);
  assert.equal(result.groupsDigest, f.memberships.digest(currentGroups));
  assert.equal(result.revision, f.item.revision);
  assert.ok(result.sourceBindings.some(binding => binding.authVersion === f.item.revision));
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/profilePlatformAdministratorEvidence @description Real HTTP facade/service and identity-owner contracts using isolated generated storage and credential/stamp ports. @layer test @owner profile */
const test = require("node:test"), assert = require("node:assert/strict"), crypto = require("node:crypto");
const evidence = require("../src/service/identity/defaultProfilePlatformAdministratorEvidenceService");
const facade = require("../src/facade/identity/defaultProfilePlatformAdministratorEvidenceFacade");
const controller = require("../src/controller/identity/defaultProfilePlatformAdministratorEvidenceController");
const membership = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const registration = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const principal = require("../src/service/identity/defaultPrincipalGovernanceService");
const catalogue = require("../src/service/identity/defaultIdentityCatalogueService");
const catalogueGovernance = require("../src/service/identity/defaultIdentityCatalogueGovernanceService");
const groups = require("../src/service/group/defaultUserGroupGovernanceService");
const inventory = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
const router = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const routes = require("../src/router/routers").profile;
const groupCode = "platformAdministratorUserGroup", permission = "loyalty.wallet.testCredit";
const copy = value => structuredClone(value);

function fixture(t) {
  const keys = ["CONFIG", "SERVICE", "FACADE", "CLASSES", "NODICS", "UTILS"];
  const previous = keys.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => previous.forEach(([key, descriptor]) => descriptor
    ? Object.defineProperty(global, key, descriptor) : delete global[key]));
  const defaults = require("../config/properties");
  const authDefaults = require("../../../../nodics.foundation/modules/nAuth/config/properties");
  const config = { ...defaults, defaultTenant: "authority", defaultEnterprise: "PLATFORM",
    profilePlatformAdministratorEvidence: copy(defaults.profilePlatformAdministratorEvidence),
    identityGovernance: { ...copy(authDefaults.identityGovernance), ...copy(defaults.identityGovernance) } };
  const rows = {
    Employee: [{ _id: "admin-id", code: "admin", loginId: "admin", active: true, principalType: "human",
      userGroups: [groupCode], authVersion: 7, password: "private-password-reference" }],
    Tenant: [{ _id: "tenant-id", code: "authority", active: true }],
    Enterprise: [{ _id: "enterprise-id", code: "PLATFORM", tenant: "authority", active: true }],
    UserGroup: [{ _id: "group-id", code: groupCode, active: true, parentGroups: ["adminGroup"], permissions: ["*"] },
      { _id: "parent-id", code: "adminGroup", active: true, parentGroups: [], permissions: [] }],
    Permission: [{ _id: "wildcard-id", code: "*", ownerModule: "profile", active: true },
      { _id: "command-id", code: permission, ownerModule: "loyaltyWallet", active: true }],
  };
  const state = { reads: [], stampChecks: 0, locked: false, headers: {}, sensitive: 0 };
  global.CONFIG = { get: key => key.split(".").reduce((value, part) => value?.[part], config) };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.UTILS = { isObject: value => value !== null && typeof value === "object" };
  global.NODICS = { getModels: () => ({ EmployeeModel: { dataBase: {} } }), getSelectedEnvironmentName: () => "isolated-test" };
  global.FACADE = { DefaultProfilePlatformAdministratorEvidenceFacade: facade };
  global.SERVICE = {
    DefaultProfilePlatformAdministratorEvidenceService: evidence,
    DefaultEnterpriseMembershipService: membership, DefaultEnterpriseRegistrationService: registration,
    DefaultPrincipalGovernanceService: principal, DefaultIdentityCatalogueService: catalogue,
    DefaultIdentityCatalogueGovernanceService: catalogueGovernance, DefaultUserGroupGovernanceService: groups,
    DefaultPrincipalSecurityStampGovernanceService: inventory, DefaultSecuredRequestPipelineService: router,
    DefaultProfileService: { getProfileModuleName: () => "profile" },
    DefaultDatabaseConfigurationService: { toObjectId: (_model, id) => id },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultLoggerService: { assertSensitiveRequest: () => { state.sensitive++; }, inheritRequestPrivacy: () => {} },
    DefaultUserStateService: { findUserState: async () => ({ locked: state.locked }) },
    DefaultPrincipalSecurityStampService: { validate: async auth => {
      state.stampChecks++;
      state.onStamp?.(state.stampChecks);
      assert.equal(auth.principalType, "human", "actor validation must not be replaced by service authentication");
      if (state.revoked || rows.Employee[0]?.authVersion !== auth.authVersion) throw Error("private stamp diagnostic");
    } },
  };
  for (const name of Object.keys(rows)) SERVICE["Default" + name + "Service"] = {
    get: async r => {
      assert.equal(r.tenant, "authority");
      assert.equal(r.options.skipItemCache, true);
      assert.equal(r.options.recursive, false);
      assert.equal(r.authData.isSystem, true, "only existing Profile private generated read authority is used");
      if (name === "Permission") await catalogueGovernance.authorize(r);
      const result = rows[name].filter(row => Object.entries(r.query).every(([key, value]) =>
        value && Array.isArray(value.$in) ? value.$in.includes(row[key]) : row[key] === value));
      const start = (r.searchOptions.pageNumber - 1) * r.searchOptions.pageSize;
      const response = { code: "SUC_READ", count: result.length, result: copy(result.slice(start, start + r.searchOptions.pageSize)) };
      state.reads.push({ name, query: copy(r.query) });
      state.onRead?.(name, response);
      return response;
    },
    save: () => assert.fail("evidence endpoint cannot write"), update: () => assert.fail("evidence endpoint cannot update"),
  };
  const request = { tenant: "authority", authData: { tenant: "authority", entCode: "PLATFORM", principalType: "human",
    loginId: "admin", tokenType: "access", authenticationMethod: "PASSWORD", authVersion: 7,
    userGroups: [groupCode], permissions: ["*"] },
    httpRequest: { body: { permission, nonce: crypto.randomUUID() }, headers: { authorization: "Bearer original", "x-enterprise-code": "PLATFORM" } },
    httpResponse: { setHeader: (name, value) => { state.headers[name] = value; } } };
  return { config, rows, state, request, run: () => controller.evidence(request), service: () => evidence.evidence(request) };
}

test("secured route reaches real controller/facade/service and all fresh identity/catalogue owners without writes", async t => {
  const f = fixture(t), original = copy({ auth: f.request.authData, http: f.request.httpRequest }), before = copy(f.rows);
  const route = routes.platformAdministratorEvidence.evidence;
  assert.equal(route.key, "/identity/platform-administrator/evidence");
  assert.equal(route.method, "POST");
  assert.equal(route.secured, true);
  assert.deepEqual(route.authTokenTypes, ["access"]);
  assert.deepEqual(route.accessGroups, [groupCode]);
  assert.equal(route.permission, permission);
  assert.equal(route.controller, "DefaultProfilePlatformAdministratorEvidenceController");
  assert.equal(route.operation, "evidence");
  assert.equal(route.requestPrivacy.sensitive, true);
  assert.equal(route.cache.enabled, false);
  assert.equal(routes.participantDirectory.resolve.key, "/participants/resolve");
  const response = await f.run();
  assert.equal(response.code, "SUC_PRFL_00000");
  assert.deepEqual(response.data, { contractVersion: 1, nonce: f.request.httpRequest.body.nonce,
    tenant: "authority", enterpriseCode: "PLATFORM", actorCode: "admin", principalType: "human",
    platformAdministrator: true, permission, authVersion: 7 });
  assert.equal(f.state.headers["Cache-Control"], "no-store");
  assert.equal(f.state.stampChecks, 2);
  assert.equal(f.state.sensitive, 1);
  assert.deepEqual(f.rows, before);
  assert.deepEqual({ auth: f.request.authData, http: f.request.httpRequest }, original);
  for (const name of ["Employee", "Tenant", "Enterprise", "UserGroup", "Permission"])
    assert.ok(f.state.reads.some(read => read.name === name), name + " must be read freshly");
});

test("Express header accessor is not cloned or invoked as transport data", async t => {
  const f = fixture(t), express = require("express");
  Object.setPrototypeOf(f.request.httpRequest, express.request);
  assert.equal(typeof f.request.httpRequest.header, "function");
  assert.equal(f.request.httpRequest.header("x-enterprise-code"), "PLATFORM");
  const before = copy(f.rows), auth = copy(f.request.authData);
  assert.equal((await f.run()).data.platformAdministrator, true);
  f.request.httpRequest.header = () => assert.fail("proof must not invoke the header accessor");
  assert.equal((await f.run()).data.platformAdministrator, true);
  assert.equal(f.state.stampChecks, 4);
  assert.deepEqual(f.rows, before);
  assert.deepEqual(f.request.authData, auth);
});

test("Express transport still rejects conflicting and changed header maps", async t => {
  for (const location of ["headers", "header", "httpRequest.headers"]) {
    await t.test(location, async t => {
      const f = fixture(t);
      Object.setPrototypeOf(f.request.httpRequest, require("express").request);
      const target = location.startsWith("httpRequest.") ? f.request.httpRequest : f.request;
      const key = location.split(".").at(-1);
      target[key] = { "x-enterprise-code": "BUSINESS" };
      await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
      assert.equal(f.state.reads.length, 0);
      target[key] = { "x-enterprise-code": "PLATFORM", authorization: "Bearer original" };
      f.state.onRead = () => { target[key].authorization = "Bearer substituted"; };
      await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
      target[key] = { "x-enterprise-code": "PLATFORM", authorization: "Bearer original" };
      f.state.onRead = () => { target[key] = { "x-enterprise-code": "BUSINESS" }; };
      await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
    });
  }
});

test("callback transport returns one envelope or one redacted owner error", async t => {
  const f = fixture(t); let calls = 0;
  await controller.evidence(f.request, (error, result) => { calls++; assert.equal(error, null); assert.equal(result.data.platformAdministrator, true); });
  f.state.revoked = true;
  await controller.evidence(f.request, error => { calls++; assert.equal(error.code, "ERR_AUTH_00003"); assert.equal(error.message, "ERR_AUTH_00003"); });
  assert.equal(calls, 2);
});

test("Wallet original-token proof transport interoperates with the actual Profile endpoint", async t => {
  const f = fixture(t);
  const wallet = require("../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyEnterpriseTestCreditService");
  SERVICE.DefaultLoyaltyParticipantService = require("../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyParticipantService");
  f.config.loyalty = copy(require("../../../../nodics.loyalty/modules/loyaltyWallet/config/properties").loyalty);
  f.config.loyalty.enterpriseTestCredits = { ...f.config.loyalty.enterpriseTestCredits, enabled: true, allowedEnvironments: ["isolated-test"] };
  f.config.runtimeRole = { code: "COHOST", publication: "OPERATIONAL" };
  NODICS.isModuleActive = name => name === "loyaltyWallet";
  const source = { tenant: "authority", authData: copy(f.request.authData), authorization: "Bearer original",
    payload: { walletCode: "wallet", programCode: "program", rewardTypeCode: "point", amount: "10.00", reason: "Test allocation", idempotencyKey: "key", confirmed: true } };
  SERVICE.DefaultModuleService = { ...require("../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService"), invokeModule: async call => {
    assert.equal(call.apiName, routes.platformAdministratorEvidence.evidence.key);
    assert.equal(call.header.Authorization, source.authorization);
    assert.equal(call.header["X-Enterprise-Code"], source.authData.entCode);
    assert.equal(call.tenant, source.tenant);
    assert.equal(call.methodName, "POST");
    f.request.httpRequest.body = call.requestBody;
    return controller.evidence(f.request);
  } };
  const before = copy(source);
  assert.deepEqual(await wallet.platformAdministrator(wallet.context(source)), {
    actorCode: "admin", authVersion: 7, authorityTenant: "authority", authorityEnterpriseCode: "PLATFORM" });
  assert.deepEqual(source, before);
  f.rows.UserGroup[0].active = false;
  await assert.rejects(wallet.platformAdministrator(wallet.context(source)), { code: "ERR_AUTH_00003" });
});

test("Program eligibility reads compose real native Profile proof, permission vocabulary and auth stamp", async t => {
  const f = fixture(t);
  const program = require("../../../../nodics.loyalty/modules/loyaltyProgram/src/service/defaultLoyaltyProgramEligibilityAdministrationService");
  const participant = require("../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyParticipantService");
  const programPermission = "loyalty.program.partnerEligibility.manage";
  f.config.loyalty = { ...copy(require("../../../../nodics.loyalty/modules/loyaltyWallet/config/properties").loyalty),
    ...copy(require("../../../../nodics.loyalty/modules/loyaltyProgram/config/properties").loyalty) };
  f.rows.Permission.push({ _id: "program-permission", code: programPermission, active: true, ownerModule: "loyaltyProgram" });
  SERVICE.DefaultLoyaltyParticipantService = participant;
  const source = { tenant: "authority", authData: copy(f.request.authData), authorization: "Bearer original", payload: { programCode: "program" } };
  const nonces = [];
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    assert.equal(call.header.Authorization, source.authorization);
    assert.equal(call.header["X-Enterprise-Code"], source.authData.entCode);
    assert.equal(call.requestBody.permission, programPermission);
    nonces.push(call.requestBody.nonce);
    return { result: await evidence.evidence({ tenant: source.tenant, authData: copy(source.authData), authorization: source.authorization,
      body: call.requestBody, headers: { authorization: source.authorization, "x-enterprise-code": source.authData.entCode } }) };
  } };
  SERVICE.DefaultLoyaltyProgramService = { get: async request => {
    assert.deepEqual(request.authData, source.authData, "Program persistence retains the actual human identity");
    return { code: "SUC_READ", count: 1, result: [{ code: "program", active: true, status: "ACTIVE", revision: 2 }] };
  } };
  assert.equal((await program.read(source)).revision, 2);
  assert.equal(nonces.length, 2); assert.equal(new Set(nonces).size, 2);
  assert.equal(f.state.stampChecks, 4);
  f.state.revoked = true;
  await assert.rejects(program.read(source));
});

test("Promotion cross-enterprise review composes native Profile proof and same-tenant directory without scope substitution", async t => {
  const f = fixture(t);
  const base = '../../../../nodics.commerce/modules/baseCommerce/modules/promotion/';
  const review = require(base + 'src/service/defaultPromotionAdministrativeReviewService');
  const directory = require('../src/service/customer/defaultProfileParticipantDirectoryService');
  f.config.promotion = copy(require(base + 'config/properties').promotion);
  f.rows.Permission.push({ _id: 'approval-id', code: 'commerce.promotion.approve', ownerModule: 'promotion', active: true });
  f.rows.Enterprise.push({ _id: 'issuer-id', code: 'ISSUER', tenant: 'authority', active: true });
  SERVICE.DefaultPromotionDraftService = require(base + 'src/service/defaultPromotionDraftService');
  SERVICE.DefaultPromotionBusinessWorkbenchService = require(base + 'src/service/defaultPromotionBusinessWorkbenchService');
  SERVICE.DefaultCouponSellerAuthorizationService = require(base + 'src/service/defaultCouponSellerAuthorizationService');
  const source = { tenant: 'authority', authData: copy(f.request.authData), authorization: 'Bearer original',
    promotionCode: 'reviewed-offer', payload: { issuerEnterpriseCode: 'ISSUER' } };
  const nonces=[];
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    assert.equal(call.header.Authorization, 'Bearer original');
    assert.equal(call.header['X-Enterprise-Code'], 'PLATFORM');
    assert.equal(call.tenant, 'authority');
    const request = {tenant:'authority',authData:copy(source.authData),authorization:source.authorization,
      body:call.requestBody,headers:{authorization:source.authorization,'x-enterprise-code':'PLATFORM'}};
    if (call.apiName === '/identity/platform-administrator/evidence') {
      nonces.push(call.requestBody.nonce);return {result:await evidence.evidence(request)};
    }
    assert.equal(call.apiName,'/participants/resolve');return {result:await directory.resolve(request)};
  } };
  const before=copy(source), rows=copy(f.rows);
  const context=await review.context(source);
  assert.equal(context.scope().enterpriseCode,'ISSUER');
  assert.equal(context.scope().authData.entCode,'PLATFORM');
  await context.revalidate();
  assert.equal(new Set(nonces).size,nonces.length);
  assert.deepEqual(source,before);assert.deepEqual(f.rows,rows);
  f.rows.Enterprise[1].tenant='foreign';await assert.rejects(review.context(source));
  f.rows.Enterprise[1].tenant='authority';f.rows.Enterprise[1].active=false;await assert.rejects(review.context(source));
  f.rows.Enterprise[1].active=true;
  f.rows.Employee[0].userGroups=['adminGroup'];await assert.rejects(review.context(source));
  f.rows.Employee[0].userGroups=[groupCode];
  source.authData.entCode='ISSUER';await assert.rejects(review.context(source));source.authData.entCode='PLATFORM';
  f.rows.Employee[0].authVersion++;await assert.rejects(context.revalidate());
});

test('Promotion authoring permissions require fresh persisted native proof, not an allowlist grant', async t => {
  const f = fixture(t);
  for (const permission of ['commerce.promotion.read', 'commerce.promotion.draft.write', 'commerce.promotion.manage']) {
    f.request.httpRequest.body = { permission, nonce: crypto.randomUUID() };
    await assert.rejects(f.run(), { code: 'ERR_AUTH_00003' });
    f.rows.Permission.push({ _id: permission, code: permission, ownerModule: 'promotion', active: true });
    assert.equal((await f.run()).data.permission, permission);
    f.rows.Permission.at(-1).active = false;
    await assert.rejects(f.run(), { code: 'ERR_AUTH_00003' });
    f.rows.Permission.at(-1).active = true;
  }
  f.rows.Employee[0].userGroups = ['adminGroup'];
  await assert.rejects(f.run(), { code: 'ERR_AUTH_00003' });
});

test("Wallet target policy admission uses native admin proof and exact same-tenant directory without membership activation", async t => {
  const f = fixture(t);
  const wallet = require("../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyParticipantTransferService");
  const participant = require("../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyParticipantService");
  const directory = require("../src/service/customer/defaultProfileParticipantDirectoryService");
  f.config.enterpriseManagement = { ...f.config.enterpriseManagement,
    memberships: { ...f.config.enterpriseManagement?.memberships, enabled: false } };
  f.config.loyalty = copy(require("../../../../nodics.loyalty/modules/loyaltyWallet/config/properties").loyalty);
  f.rows.Permission.push({ _id: "policy-id", code: "loyalty.transfers.manage", ownerModule: "loyaltyWallet", active: true });
  f.rows.Enterprise.push({ _id: "target-id", code: "TARGET", tenant: "authority", active: true });
  SERVICE.DefaultLoyaltyParticipantService = participant;
  SERVICE.DefaultLoyaltyRewardOperationService = { fail: (code, message) => { throw Object.assign(Error(message), { code }); } };
  const source = { tenant: "authority", authData: copy(f.request.authData), authorization: "Bearer original",
    payload: { enterpriseCode: "TARGET", programCode: "program", rewardTypeCode: "points" } };
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    assert.equal(call.header.Authorization, source.authorization);
    assert.equal(call.header["X-Enterprise-Code"], "PLATFORM");
    assert.equal(call.tenant, "authority");
    const request = { tenant: "authority", authData: copy(source.authData), authorization: source.authorization,
      body: call.requestBody, headers: { authorization: source.authorization, "x-enterprise-code": "PLATFORM" } };
    if (call.apiName === "/identity/platform-administrator/evidence") return { result: await evidence.evidence(request) };
    assert.equal(call.apiName, "/participants/resolve");
    return { result: await directory.resolve(request) };
  } };
  const before = copy(source), rows = copy(f.rows);
  const admitted = await wallet.administrativeSettingsContext(source);
  assert.deepEqual(admitted.owner, { ownerType: "ENTERPRISE", ownerCode: "TARGET" });
  await admitted.revalidate();
  assert.deepEqual(source, before); assert.deepEqual(f.rows, rows);
  Object.assign(source.payload, { expectedRevision: null, selections: { maximumAmount: "10" } });
  const updateContext = await wallet.administrativeSettingsContext(source, true);
  assert.equal(updateContext.actorCode, "admin");
  await updateContext.revalidate();
  assert.deepEqual(f.rows, rows);
  source.payload = copy(before.payload);
  const permissions = f.config.profilePlatformAdministratorEvidence.allowedPermissions;
  f.config.profilePlatformAdministratorEvidence.allowedPermissions = [permission];
  await assert.rejects(wallet.administrativeSettingsContext(source), { code: "ERR_AUTH_00003" });
  f.config.profilePlatformAdministratorEvidence.allowedPermissions = permissions;
  f.rows.Enterprise[1].tenant = "foreign";
  await assert.rejects(wallet.administrativeSettingsContext(source));
  f.rows.Enterprise[1].tenant = "authority"; f.rows.Enterprise[1].active = false;
  await assert.rejects(wallet.administrativeSettingsContext(source));
  f.rows.Enterprise[1].active = true; f.rows.UserGroup[0].active = false;
  await assert.rejects(wallet.administrativeSettingsContext(source), { code: "ERR_AUTH_00003" });
});

test("framework defaults are complete; missing, disabled or malformed policy never recreates fallback authority", async t => {
  const f = fixture(t), original = copy(f.config.profilePlatformAdministratorEvidence);
  for (const value of [undefined, { ...original, enabled: false }, { ...original, allowedPermissions: ["*"] },
    { ...original, maximumGroups: 0 }, { ...original, allowedPermissions: [permission, permission] }]) {
    f.config.profilePlatformAdministratorEvidence = value;
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
  assert.equal(f.state.reads.length, 0);
});

test("unknown permissions, malformed nonces, arbitrary selectors and contradictory body sources refuse before reads", async t => {
  const f = fixture(t), original = copy(f.request.httpRequest.body);
  for (const body of [{ ...original, permission: "loyalty.wallet.read" }, { ...original, nonce: "cached" },
    { ...original, nonce: "1".repeat(500) }, { ...original, tenant: "authority" }, { ...original, platformAdministrator: true }]) {
    f.request.httpRequest.body = body;
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
  f.request.httpRequest.body = original;
  f.request.payload = { ...original, nonce: crypto.randomUUID() };
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  assert.equal(f.state.reads.length, 0);
});

test("native human access and exact authority scope cannot be replaced by group names, enterprise admin or system flags", async t => {
  const f = fixture(t), original = copy(f.request.authData);
  for (const patch of [{ principalType: "service" }, { principalType: "customer" }, { isSystem: true },
    { tokenType: "service" }, { tokenType: "refresh" }, { authenticationMethod: "LINKED" }, { sessionContext: {} },
    { runtimeScope: {} }, { externalIdentityLinkCode: "link" }, { tenant: "business" }, { entCode: "BUSINESS" },
    { enterpriseCode: "BUSINESS" }, { userGroups: ["adminGroup"] }, { permissions: [permission] }, { authVersion: 0 }]) {
    f.request.authData = { ...original, ...patch };
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
  assert.equal(f.state.reads.length, 0);
});

test("request partition and Enterprise headers cannot select a different authority", async t => {
  const f = fixture(t);
  f.request.tenant = "business";
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.request.tenant = "authority";
  f.request.httpRequest.headers["x-enterprise-code"] = "BUSINESS";
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  assert.equal(f.state.reads.length, 0);
});

test("fresh persisted principal, native placement, lockout and current authVersion are mandatory", async t => {
  const f = fixture(t), original = copy(f.rows.Employee[0]);
  for (const patch of [{ active: false }, { disabled: true }, { registrationSuspended: true }, { authVersion: 8 },
    { principalType: "service" }, { authenticationIdentity: {} }, { identityLinkRetirement: true },
    { registrationAssignmentCode: "invited" }, { enterpriseCode: "BUSINESS" }, { apiKeyHash: "credential" },
    { userGroups: ["adminGroup"] }]) {
    f.rows.Employee[0] = { ...original, ...patch };
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
  f.rows.Employee[0] = original; f.state.locked = true;
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
});

test("missing or ambiguous principal and inactive or foreign authority entities refuse", async t => {
  const f = fixture(t), person = copy(f.rows.Employee[0]);
  f.rows.Employee.length = 0;
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.rows.Employee.push(person, { ...person, _id: "duplicate" });
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.rows.Employee.pop();
  f.rows.Tenant[0].active = false;
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.rows.Tenant[0].active = true; f.rows.Enterprise[0].tenant = "business";
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
});

test("persisted reserved grant and active requested/wildcard vocabulary are checked independently of token claims", async t => {
  const f = fixture(t), originalGroups = copy(f.rows.UserGroup), originalPermissions = copy(f.rows.Permission);
  for (const change of [
    () => { f.rows.UserGroup[0].active = false; },
    () => { f.rows.UserGroup[0].permissions = [permission]; },
    () => { f.rows.Permission[0].active = false; },
    () => { f.rows.Permission[0].ownerModule = "other"; },
    () => { f.rows.Permission[1].active = false; },
    () => { f.rows.UserGroup[1].permissions = ["*"]; },
  ]) {
    f.rows.UserGroup = copy(originalGroups); f.rows.Permission = copy(originalPermissions); change();
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
});

test("fresh ancestor reads reject service ancestry, missing/inactive parents, inherited platform authority and cycles", async t => {
  const f = fixture(t), original = copy(f.rows.UserGroup);
  for (const change of [
    () => { f.rows.UserGroup[1].active = false; },
    () => { f.rows.UserGroup[1].parentGroups = ["missing"]; },
    () => { f.rows.UserGroup[1].parentGroups = [groupCode]; },
    () => { f.rows.UserGroup[1].parentGroups = ["adminGroup"]; },
    () => { f.rows.UserGroup[1].parentGroups = ["serviceAccountUserGroup"]; f.rows.UserGroup.push({ _id: "service", code: "serviceAccountUserGroup", active: true, permissions: [] }); },
  ]) {
    f.rows.UserGroup = copy(original); change();
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
});

test("bounded group resolution and failed/truncated/duplicate inventories cannot produce proof", async t => {
  const f = fixture(t);
  f.config.profilePlatformAdministratorEvidence.maximumGroups = 1;
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.config.profilePlatformAdministratorEvidence.maximumGroups = 100;
  for (const change of [r => { r.code = "ERR_READ"; }, r => { r.count++; }, r => { r.result.push(copy(r.result[0])); r.count++; }]) {
    f.state.onRead = (name, r) => { if (name === "UserGroup") change(r); };
    await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  }
});

test("post-read revocation and original request or policy mutation fail closed with no partial proof", async t => {
  const f = fixture(t);
  f.state.onStamp = count => { if (count === 2) f.state.revoked = true; };
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.state.revoked = false; f.state.onStamp = undefined;
  f.state.onRead = name => { if (name === "UserGroup") f.request.httpRequest.headers.authorization = "Bearer substituted"; };
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  f.state.onRead = name => { if (name === "UserGroup") f.config.profilePlatformAdministratorEvidence.enabled = false; };
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
});

test("later owner customization may narrow the command without replacing existing authority and transport", async t => {
  const f = fixture(t);
  SERVICE.DefaultProfilePlatformAdministratorEvidenceService = { ...evidence, groups: async function () { this.fail(); } };
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
  SERVICE.DefaultProfilePlatformAdministratorEvidenceService = evidence;
  assert.equal((await f.run()).data.platformAdministrator, true);
});

for (const permission of ['commerce.product.read', 'commerce.product.write', 'commerce.product.archive',
  'commerce.pricing.read', 'commerce.pricing.write', 'commerce.pricing.publish']) test('native owner proof for ' + permission + ' is not a grant or adminGroup shortcut', async t => {
  const f = fixture(t);
  f.rows.Permission[1] = { _id: 'owner-permission', code: permission, ownerModule: permission.split('.')[1], active: true };
  f.request.httpRequest.body.permission = permission;
  const before = copy(f.rows), proof = await f.run();
  assert.equal(proof.data.permission, permission); assert.equal(proof.data.platformAdministrator, true);
  assert.deepEqual(f.rows, before);
  f.rows.Employee[0].userGroups = ['adminGroup'];
  await assert.rejects(f.run(), { code: 'ERR_AUTH_00003' });
  f.rows.Employee[0].userGroups = [groupCode]; f.rows.Permission[1].active = false;
  await assert.rejects(f.run(), { code: 'ERR_AUTH_00003' });
});

test('Product target proof composes real Profile native evidence and same-tenant participant directory', async t => {
  const f = fixture(t), base = '../../../../nodics.commerce/modules/baseCommerce/modules/product/';
  const administrative = require(base + 'src/service/defaultProductAdministrativeAuthoringService');
  const directory = require('../src/service/customer/defaultProfileParticipantDirectoryService');
  f.config.product = copy(require(base + 'config/properties').product);
  f.rows.Permission.push({ _id: 'product-write', code: 'commerce.product.write', ownerModule: 'product', active: true });
  f.rows.Enterprise.push({ _id: 'market-id', code: 'MARKET', tenant: 'authority', active: true });
  SERVICE.DefaultProductBusinessAuthoringService = require(base + 'src/service/defaultProductBusinessAuthoringService');
  SERVICE.DefaultProductAdministrativeCatalogueService = require(base + 'src/service/defaultProductAdministrativeCatalogueService');
  const source = { tenant: 'authority', authData: copy(f.request.authData), authorization: 'Bearer original',
    payload: { targetEnterpriseCode: 'MARKET', command: { code: 'new-product', name: 'Product', catalogVersion: 'catalog' } } };
  const nonces = [];
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    assert.equal(call.header.Authorization, source.authorization); assert.equal(call.header['X-Enterprise-Code'], 'PLATFORM');
    const request = { tenant: 'authority', authData: copy(source.authData), authorization: source.authorization,
      body: call.requestBody, headers: { authorization: source.authorization, 'x-enterprise-code': 'PLATFORM' } };
    if (call.apiName === '/identity/platform-administrator/evidence') {
      nonces.push(call.requestBody.nonce); return { result: await evidence.evidence(request) };
    }
    assert.equal(call.apiName, '/participants/resolve'); return { result: await directory.resolve(request) };
  } };
  const before = copy(source), records = copy(f.rows), context = await administrative.context(source, 'create');
  assert.equal(context.scope().enterpriseCode, 'MARKET'); await context.revalidate();
  assert.equal(new Set(nonces).size, nonces.length); assert.deepEqual(source, before); assert.deepEqual(f.rows, records);
  f.rows.Employee[0].userGroups = ['adminGroup']; await assert.rejects(context.revalidate());
  f.rows.Employee[0].userGroups = [groupCode]; f.rows.Enterprise[1].tenant = 'foreign'; await assert.rejects(context.revalidate());
  f.rows.Enterprise[1].tenant = 'authority'; f.rows.Enterprise[1].active = false; await assert.rejects(context.revalidate());
  f.rows.Enterprise[1].active = true; f.rows.Employee[0].authVersion++; await assert.rejects(context.revalidate());
});

test('existing schema manage vocabulary qualifies native wallet selection proof without granting it', async t => {
  const f = fixture(t);
  f.rows.Permission.push({ _id: 'schema-manage-id', code: 'system.schema.manage', ownerModule: 'database', active: true });
  f.request.httpRequest.body.permission = 'system.schema.manage';
  const result = await f.run();
  assert.equal(result.data.permission, 'system.schema.manage');
  f.rows.Permission.at(-1).active = false;
  await assert.rejects(f.run(), { code: 'ERR_AUTH_00003' });
});

/** Composes the new credential-scope command with real native proof, catalogue, audit and security-stamp owners over generated storage doubles. */
function serviceScopeFixture(t) {
  const f = fixture(t);
  const migration = require('../src/service/identity/defaultIdentityGovernanceMigrationService');
  const commands = require('../src/controller/identity/defaultIdentityGovernanceController');
  f.config.identityGovernance.migration.version = 5;
  f.rows.Permission.push(...['identity.credential.rotate', 'owner.read', 'owner.reserve', 'owner.release'].map((code, i) =>
    ({ _id: 'scope-permission-' + i, code, active: true, ownerModule: 'profile' })));
  const target = { _id: 'service-id', code: 'integration', loginId: 'integration', active: true, principalType: 'service',
    userGroups: ['serviceAccountUserGroup'], authVersion: 20, apiKeyScopes: ['owner.read'],
    apiKeyHash: 'private-existing-key-hash', apiKeyPrefix: 'retained', apiKeyStatus: 'active',
    apiKeyCreatedAt: '2026-01-01T00:00:00.000Z', apiKeyExpiresAt: '2030-01-01T00:00:00.000Z',
    password: 'existing-password-id', metadata: { retained: true } };
  f.rows.Employee.push(target); f.rows.IdentityMigrationAudit = [];
  const matches = (row, query) => Object.entries(query).every(([key, value]) => key === '$or'
    ? value.some(part => matches(row, part)) : require('node:util').isDeepStrictEqual(row[key], value));
  const normalRead = SERVICE.DefaultEmployeeService.get;
  SERVICE.DefaultEmployeeService.get = async request => {
    if (!request.query.$or && !request.query.apiKeyScopes) return normalRead(request);
    assert.equal(request.authData.isSystem, true);
    assert.equal(request.options.skipItemCache, true);
    const result = f.rows.Employee.filter(row => matches(row, request.query));
    return { code: 'SUC_READ', count: result.length, result: copy(result) };
  };
  f.state.writes = []; f.state.registered = [];
  SERVICE.DefaultPrincipalSecurityStampService.reserveVersion = async (_tenant, minimum) => minimum;
  SERVICE.DefaultPrincipalSecurityStampService.register = async (tenant, code, version) => f.state.registered.push({ tenant, code, version });
  SERVICE.DefaultEmployeeService.update = async request => {
    assert.deepEqual(Object.keys(request.model), ['apiKeyScopes']);
    request.schemaModel = { schemaName: 'employee' };
    await inventory.preparePrincipalUpdate(request);
    f.state.beforePersist?.(target);
    if (!matches(target, request.query)) return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 0 } };
    f.state.writes.push(copy(request.model)); Object.assign(target, copy(request.model));
    await inventory.registerPreparedPrincipalUpdate(request);
    f.state.afterPersist?.(target);
    return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 1 } };
  };
  SERVICE.DefaultIdentityMigrationAuditService = {
    get: async request => {
      const result = f.rows.IdentityMigrationAudit.filter(row => matches(row, request.query));
      return { code: 'SUC_READ', count: result.length, result: copy(result) };
    },
    save: async request => {
      if (f.state.auditFailure) throw Error('audit unavailable');
      const row = { _id: 'audit-' + f.rows.IdentityMigrationAudit.length, ...copy(request.model) };
      f.rows.IdentityMigrationAudit.push(row); return { code: 'SUC_SAVE', result: row };
    },
    update: async request => {
      const row = f.rows.IdentityMigrationAudit.find(item => matches(item, request.query));
      if (row) Object.assign(row, copy(request.model.$set));
      return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: row ? 1 : 0 } };
    },
  };
  SERVICE.DefaultIdentityGovernanceMigrationService = migration;
  f.request.httpRequest.body = { principalCode: target.code, loginId: target.loginId,
    expectedAuthVersion: target.authVersion, expectedScopeCodes: [...target.apiKeyScopes],
    scopeCodes: ['owner.read', 'owner.reserve'], confirmed: true };
  f.request.router = routes.identityMigration.updateServiceScopes;
  f.request.moduleName = 'profile';
  const update = () => new Promise((resolve, reject) => router.checkAccess(f.request, {}, {
    error: (_request, _response, error) => reject(error),
    nextSuccess: () => { f.state.controllerReached = true; resolve(commands.updateServiceScopes(f.request)); },
  }));
  return { ...f, target, command: f.request.httpRequest.body, update };
}

test('service scope update uses native proof, registered vocabulary, exact CAS, owner stamps and redacted audit without rotating keys', async t => {
  const f = serviceScopeFixture(t), before = copy(f.target);
  const route = routes.identityMigration.updateServiceScopes;
  assert.equal(route.key, '/identity/credential/scopes');
  assert.equal(route.permissionConfig, 'identityGovernance.serviceScopeManagement.permission');
  assert.equal(route.permission, undefined);
  assert.equal(CONFIG.get(route.permissionConfig), 'identity.credential.rotate');
  assert.equal(route.requestPrivacy.sensitive, true); assert.deepEqual(route.accessGroups, ['adminGroup']);
  const response = await f.update();
  assert.equal(response.data.status, 'APPLIED'); assert.equal(response.data.authVersion, 21);
  assert.deepEqual(f.target, { ...before, apiKeyScopes: f.command.scopeCodes, authVersion: 21 });
  assert.equal(f.state.writes.length, 1);
  assert.deepEqual(f.state.registered.map(row => row.code), ['integration', 'identity:EMPLOYEE:service-id']);
  assert.equal(f.rows.IdentityMigrationAudit[0].status, 'APPLIED');
  const serialized = JSON.stringify({ response, audits: f.rows.IdentityMigrationAudit });
  for (const secret of [before.apiKeyHash, before.password, before.apiKeyPrefix]) assert(!serialized.includes(secret));
  assert.equal(f.state.headers['Cache-Control'], 'no-store');
});

test('service scope update rejects wrong actor, revoked native proof and tenant aliases before writes', async t => {
  for (const mutate of [f => { f.request.authData.principalType = 'service'; }, f => { f.request.authData.tokenType = 'refresh'; },
    f => { f.request.authData.userGroups = ['adminGroup']; }, f => { f.rows.Employee[0].userGroups = ['adminGroup']; },
    f => { f.state.revoked = true; }, f => { f.request.tenant = 'foreign'; },
    f => { f.request.httpRequest.headers['x-enterprise-code'] = 'foreign'; }]) {
    const f = serviceScopeFixture(t); mutate(f);
    await assert.rejects(f.update()); assert.equal(f.state.writes.length, 0); assert.equal(f.rows.IdentityMigrationAudit.length, 0);
  }
});

test('service scope update rejects unregistered, wildcard, stale, ambiguous and unconfirmed commands', async t => {
  for (const mutate of [f => { f.command.scopeCodes.push('*'); }, f => { f.command.scopeCodes.push('owner.*'); },
    f => { f.command.scopeCodes.push('unregistered'); }, f => { f.command.scopeCodes.push('owner.read'); },
    f => { f.command.expectedAuthVersion--; }, f => { f.command.expectedScopeCodes = ['owner.release']; },
    f => { f.command.confirmed = false; }, f => { f.command.loginId = 'different'; },
    f => { f.rows.Employee.push({ ...f.target, _id: 'duplicate', code: 'duplicate' }); },
    f => { f.command.newApiKey = 'not-accepted'; }, f => { f.config.identityGovernance.serviceScopeManagement.maximumScopeCodes = 0; }]) {
    const f = serviceScopeFixture(t); mutate(f);
    await assert.rejects(f.update()); assert.equal(f.state.writes.length, 0); assert.equal(f.rows.IdentityMigrationAudit.length, 0);
  }
});

test('service scope update refuses concurrent changes and does not claim success after altered credential readback', async t => {
  const f = serviceScopeFixture(t);
  f.state.beforePersist = target => { target.authVersion++; target.apiKeyScopes = ['owner.release']; };
  await assert.rejects(f.update()); assert.equal(f.state.writes.length, 0); assert.equal(f.state.registered.length, 0);
  assert.deepEqual(f.target.apiKeyScopes, ['owner.release']); assert.equal(f.rows.IdentityMigrationAudit[0].status, 'APPLYING');
  const g = serviceScopeFixture(t);
  g.state.afterPersist = target => { target.apiKeyHash = 'changed-externally'; };
  await assert.rejects(g.update()); assert.equal(g.rows.IdentityMigrationAudit[0].status, 'APPLYING');
});

test('service scope update supports exact no-op and requires durable audit before mutation', async t => {
  const f = serviceScopeFixture(t); f.command.scopeCodes = [...f.command.expectedScopeCodes];
  assert.equal((await f.update()).data.status, 'NO_CHANGES'); assert.equal(f.state.writes.length, 0);
  const g = serviceScopeFixture(t); g.state.auditFailure = true;
  await assert.rejects(g.update()); assert.equal(g.state.writes.length, 0);
  const h = serviceScopeFixture(t); h.command.scopeCodes = [...h.command.expectedScopeCodes];
  h.state.onStamp = count => { if (count === 3) h.target.authVersion++; };
  await assert.rejects(h.update()); assert.equal(h.state.writes.length, 0);
});

test('service scope update has one CAS winner for competing confirmed operators', async t => {
  const f = serviceScopeFixture(t);
  const commands = require('../src/controller/identity/defaultIdentityGovernanceController');
  const other = { ...f.request, authData: copy(f.request.authData), httpRequest: {
    ...f.request.httpRequest, headers: copy(f.request.httpRequest.headers), body: copy(f.command),
  } };
  other.httpRequest.body.scopeCodes = ['owner.read', 'owner.release'];
  const outcomes = await Promise.allSettled([f.update(), commands.updateServiceScopes(other)]);
  assert.equal(outcomes.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(f.state.writes.length, 1);
  assert.equal(f.rows.IdentityMigrationAudit.filter(row => row.status === 'APPLIED').length, 1);
  assert.equal(f.target.apiKeyHash, 'private-existing-key-hash');
  assert.equal(f.target.authVersion, 21);
});


test('service scope update composes registered admin route admission with fresh native owner proof', async t => {
  const seededGroups = Object.values(require('../data/init-v001/records/identity/profileUserGroupData'));
  const admin = seededGroups.find(row => row.code === 'adminGroup');
  const native = seededGroups.find(row => row.code === groupCode);
  assert.equal(admin.active, true);
  assert.equal(native.active, true);
  assert(native.parentGroups.includes(admin.code));
  assert(native.permissions.includes('*'));
  await t.test('registered native claims reach controller and complete private proof', async t => {
    const f = serviceScopeFixture(t);
    f.request.authData.userGroups = [native.code];
    f.request.authData.permissions = [...native.permissions];
    assert.equal((await f.update()).data.status, 'APPLIED');
    assert.equal(f.state.controllerReached, true);
  });
  await t.test('adminGroup plus explicit permission reaches controller but cannot replace native proof', async t => {
    const f = serviceScopeFixture(t);
    f.request.authData.userGroups = [admin.code];
    f.request.authData.permissions = [CONFIG.get(f.request.router.permissionConfig)];
    await assert.rejects(f.update());
    assert.equal(f.state.controllerReached, true);
    assert.equal(f.state.writes.length, 0);
    assert.equal(f.rows.IdentityMigrationAudit.length, 0);
  });
  await t.test('permission without registered route group stops before controller', async t => {
    const f = serviceScopeFixture(t);
    f.request.authData.userGroups = ['userGroup'];
    f.request.authData.permissions = [CONFIG.get(f.request.router.permissionConfig)];
    await assert.rejects(f.update(), { code: 'ERR_AUTH_00003' });
    assert.equal(f.state.controllerReached, undefined);
    assert.equal(f.state.writes.length, 0);
  });
});


test('service scope update exposes only registered static failure stages after router admission', async t => {
  const definitions = require('../src/utils/statusDefinitions');
  const cases = [
    ['POLICY', f => { f.config.identityGovernance.serviceScopeManagement.maximumScopeCodes = 0; }],
    ['INPUT', f => { f.command.confirmed = false; }],
    ['NATIVE_PROOF', f => { f.state.revoked = true; }],
    ['TARGET', f => { f.target.apiKeyStatus = 'revoked'; }],
    ['CURRENT_STATE', f => { f.command.expectedAuthVersion--; }],
    ['VOCABULARY', f => { f.command.scopeCodes = ['missing.registered.scope']; }],
    ['AUDIT_PREPARE', f => { f.state.auditFailure = true; }],
    ['WRITE', f => { f.state.beforePersist = row => { row.authVersion++; }; }],
    ['READBACK', f => { f.state.afterPersist = row => { row.apiKeyHash = 'private-upstream-detail'; }; }],
  ];
  for (const [stage, mutate] of cases) await t.test(stage, async t => {
    const f = serviceScopeFixture(t); mutate(f);
    const code = 'ERR_PROFILE_SERVICE_SCOPE_' + stage;
    assert.equal(definitions[code].code, '403');
    await assert.rejects(f.update(), error => {
      assert.equal(error.code, code);
      assert.equal(error.message, code);
      assert.equal(error.cause, undefined);
      return true;
    });
    assert.equal(f.state.controllerReached, true);
  });
});


test('service scope update preserves native proof with normalized Express header accessor', async t => {
  const f = serviceScopeFixture(t), express = require('express');
  Object.setPrototypeOf(f.request.httpRequest, express.request);
  f.request.header = f.request.httpRequest.header;
  f.request.headers = f.request.httpRequest.headers;
  assert.equal(typeof f.request.header, 'function');
  assert.equal((await f.update()).data.status, 'APPLIED');
  assert.equal(f.state.writes.length, 1);
});

test('native proof header normalization rejects malformed maps and preserves null-prototype map binding', async t => {
  for (const value of ['not-a-header-map', [], 42, () => {}]) await t.test(typeof value + ':' + Array.isArray(value), async t => {
    const f = fixture(t); f.request.headers = value;
    await assert.rejects(f.run(), { code: 'ERR_AUTH_00003' });
    assert.equal(f.state.reads.length, 0);
  });
  await t.test('null-prototype maps accept unchanged and reject changed authority', async t => {
    const f = fixture(t);
    f.request.header = () => assert.fail('accessor must never be called');
    f.request.headers = Object.assign(Object.create(null), f.request.httpRequest.headers);
    assert.equal((await f.run()).data.platformAdministrator, true);
    f.state.onRead = () => { f.request.headers['x-enterprise-code'] = 'OTHER'; };
    await assert.rejects(f.run(), { code: 'ERR_AUTH_00003' });
  });
});


test('service scope update carries actual logger private route admission into derived native proof', async t => {
  const f = serviceScopeFixture(t);
  const logger = require('../../../../nodics.foundation/modules/nConfig/src/service/DefaultLoggerService');
  SERVICE.DefaultLoggerService = logger;
  f.config.log = { requestPrivacy: { qualified: true, captureMode: 'disabled' } };
  const http = f.request.httpRequest;
  Object.setPrototypeOf(http, require('express').request);
  f.request.header = http.header;
  f.request.headers = http.headers;
  f.request.query = Object.create(null);
  f.request.authorization = 'Bearer fixture-original';
  await logger.runRequestPrivacy(http, async () => {
    assert.equal(logger.resolveRequestPrivacy(http, true), true);
    assert.equal(logger.admitPrivateRoute(http), true);
    logger.inheritRequestPrivacy(f.request, http);
    assert.equal(logger.hasPrivateCaptureProtection(f.request), true);
    assert.equal(logger.hasPrivateCaptureProtection({ ...f.request }), false);
    assert.equal((await f.update()).data.status, 'APPLIED');
  });
});

test('service scope update cannot synthesize private admission from copied flags with actual logger', async t => {
  const f = serviceScopeFixture(t);
  SERVICE.DefaultLoggerService = require('../../../../nodics.foundation/modules/nConfig/src/service/DefaultLoggerService');
  f.config.log = { requestPrivacy: { qualified: true, captureMode: 'disabled' } };
  f.request.requestPrivacy = { sensitive: true }; f.request.protected = true;
  await assert.rejects(f.update(), /Sensitive request capture protection is required/);
  assert.equal(f.state.writes.length, 0);
});

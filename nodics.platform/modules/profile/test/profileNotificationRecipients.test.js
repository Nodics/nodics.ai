/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/profileNotificationRecipients @description Shared recipient projection with actual Profile generated-read, native identity, scope and group-governance services; isolated persistence/credential ports only. @layer test @owner profile */
const test = require("node:test"), assert = require("node:assert/strict");
const recipient = require("../src/service/identity/defaultProfileNotificationRecipientService");
const registration = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const membership = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const scopes = require("../src/service/identity/defaultPrincipalScopeGovernanceService");
const catalogue = require("../src/service/identity/defaultIdentityCatalogueService");
const groups = require("../src/service/group/defaultUserGroupGovernanceService");
const router = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const tokens = require("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService");
const clone = value => structuredClone(value);

test("source callbacks inherit owner response bounds and honor later overrides without enabling delivery", async t => {
  const saved = ["CONFIG", "SERVICE", "CLASSES"].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => saved.forEach(([key, descriptor]) => descriptor
    ? Object.defineProperty(global, key, descriptor) : delete global[key]));
  const config = clone(require("../config/properties"));
  global.CONFIG = { get: key => config[key] };
  global.CLASSES = { NodicsError: class extends Error {} };
  const stopped = new Error("isolated transport boundary");
  let invocation;
  global.SERVICE = {
    DefaultProfileNotificationRecipientService: recipient,
    DefaultProfileCommerceNotificationRecipientService: { unwrap: value => value },
    DefaultLoggerService: { runSensitiveOperation: (_request, work) => work() },
    DefaultModuleService: { invokeModule: async call => { invocation = call; throw stopped; } },
  };
  for (const kind of ["Transfer", "Gift", "Auction", "Coupon"]) {
    const service = require("../src/service/identity/defaultProfile" + kind + "NotificationRecipientService");
    const key = "profile" + kind + "Notifications", settings = config[key];
    assert.equal(settings.enabled, false);
    assert.equal(settings.maxResponseBytes, 8192);
    settings.enabled = true;
    if (Object.hasOwn(settings, "qualified")) settings.qualified = true;
    for (const bytes of [8192, 32768]) {
      settings.maxResponseBytes = bytes;
      const policy = service.policy();
      invocation = undefined;
      await assert.rejects(service.source(
        ["Gift", "Auction"].includes(kind) ? "tenant" : { tenant: "tenant" },
        { source: {}, channel: "IN_APP" }, policy), error => error === stopped);
      assert.equal(invocation.maxResponseBytes, bytes);
      assert.equal(invocation.maxAttempts, 1);
      assert.equal(invocation.followRedirects, false);
      assert.equal(invocation.requireInternalAuth, true);
    }
    for (const invalid of [undefined, 0, -1, 1.5, "8192", Infinity]) {
      settings.maxResponseBytes = invalid;
      assert.throws(() => service.policy());
    }
  }
});

function fixture(t) {
  const globals = ["SERVICE", "CONFIG", "NODICS", "CLASSES", "UTILS", "FACADE"].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => globals.forEach(([key, descriptor]) => descriptor ? Object.defineProperty(global, key, descriptor) : delete global[key]));
  const config = { ...clone(require("../config/properties")), defaultTenant: "authority",
    identityGovernance: clone(require("../../../../nodics.foundation/modules/nAuth/config/properties").identityGovernance) };
  Object.assign(config.enterpriseManagement.memberships, { enabled: true, inventoryQualified: true,
    sessionBindingQualified: true, assignmentClaimIndexQualified: true });
  const p = { ...config.profileTransferNotifications.recipientSelection, maximumRecipients: config.profileTransferNotifications.maximumRecipients };
  const db = {
    Customer: [{ code: "C1", _id: "C1-id", loginId: "customer@example.test", principalType: "customer", active: true, transferNotificationPreferences: { IN_APP: true } }],
    Enterprise: [{ code: "E1", tenant: "tenant", active: true, transferNotificationPreferences: { IN_APP: true }, transferNotificationRecipients: [{ employeeCode: "U1" }] }],
    Employee: [{ code: "U1", _id: "U1-id", loginId: "employee@example.test", active: true, principalType: "human", userGroups: ["reader"],
      transferNotificationPreferences: { IN_APP: true }, email: "never-exposed@example.test" }],
    UserGroup: [{ code: "reader", active: true, permissions: [], parentGroups: ["walletReader"] },
      { code: "walletReader", active: true, parentGroups: [], permissions: ["loyalty.wallet.read"] }],
    Permission: [{ code: "loyalty.wallet.read", active: true }],
    PrincipalScopeAssignment: [{ code: "scope", principalType: "human", principalCode: "employee@example.test", status: "ACTIVE", active: true,
      effect: "ALLOW", scopeType: "ENTERPRISE", scopeCode: "E1", tenantCode: "tenant" }],
  };
  const privateRequests = new WeakSet(), state = { reads: [], locked: false, assignments: [], assignment: null };
  const request = { tenant: "tenant", authData: { tenant: "tenant", entCode: "runtime", principalType: "service", tokenType: "service",
    serviceId: "runtime", modules: ["profile"], permissions: [], runtimeInstanceId: "instance",
    runtimeScope: { instanceCode: "instance", projectCode: "project", environmentCode: "unit", serverCode: "server", assignmentCode: "grant" } } };
  privateRequests.add(request);
  global.CONFIG = { get: key => key.split(".").reduce((value, part) => value?.[part], config) };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.UTILS = { isObject: v => v !== null && typeof v === "object" };
  global.NODICS = { getModels: () => ({ EmployeeModel: { dataBase: {} }, CustomerModel: { dataBase: {} } }) };
  const match = (row, query) => Object.entries(query).every(([key, value]) => key === "$or" ? value.some(q => match(row, q))
    : value && Array.isArray(value.$in) ? value.$in.includes(row[key]) : row[key] === value);
  global.SERVICE = {
    DefaultProfileNotificationRecipientService: recipient, DefaultEnterpriseRegistrationService: registration,
    DefaultEnterpriseManagementService: require("../src/service/enterprise/defaultEnterpriseManagementService"),
    DefaultEnterpriseMembershipService: { ...membership, inventory: async () => clone(state.assignments), authority: () => "authority",
      assignment: async () => ({ item: clone(state.assignment) }) },
    DefaultIdentityCatalogueService: { ...catalogue, rows: async (service, query) => {
      assert.equal(service, "DefaultPermissionService"); return clone(db.Permission.filter(row => match(row, query)));
    } },
    DefaultUserGroupGovernanceService: groups, DefaultPrincipalScopeGovernanceService: scopes,
    DefaultSecuredRequestPipelineService: router, DefaultServiceTokenService: tokens,
    DefaultProfileService: { getProfileModuleName: () => "profile" },
    DefaultDatabaseConfigurationService: { toObjectId: (_model, id) => id },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultUserStateService: { findUserState: async () => ({ locked: state.locked }) },
    DefaultLoggerService: { assertSensitiveRequest: r => assert.ok(privateRequests.has(r)),
      runSensitiveOperation: async (r, work) => { privateRequests.add(r); return work(); } },
  };
  for (const name of Object.keys(db)) SERVICE["Default" + name + "Service"] = {
    get: async r => {
      assert.equal(r.tenant, name === "Enterprise" ? "authority" : "tenant");
      assert.equal(r.options.skipItemCache, true); assert.equal(r.options.recursive, false); assert.equal(r.authData.isSystem, true);
      const rows = clone(db[name].filter(row => match(row, r.query)));
      const response = { code: "SUC_READ", result: rows, count: rows.length };
      state.reads.push(name); await state.onRead?.(name, response, r); return response;
    },
    save: () => assert.fail("recipient projection never writes"), update: () => assert.fail("recipient projection never writes"),
  };
  return { request, db, state, config, p, run: (owner = { type: "ENTERPRISE", code: "E1" }) => recipient.select(request, owner, p) };
}

test("actual native Employee and inherited persisted permission resolve the existing Employee inbox namespace", async t => {
  const f = fixture(t), original = clone(f.request);
  assert.deepEqual(await f.run(), ["profile-employee:U1"]);
  assert.deepEqual(f.request, original); assert.ok(f.state.reads.includes("PrincipalScopeAssignment"));
  assert.equal(f.db.Customer.length, 1, "Enterprise recipients are not converted to Customers");
});
test("Customer source owner retains its own opted-in inbox without reading Employees", async t => {
  const f = fixture(t); assert.deepEqual(await f.run({ type: "CUSTOMER", code: "C1" }), ["C1"]);
  assert.equal(f.state.reads.includes("Employee"), false);
  f.db.Customer[0].transferNotificationPreferences.IN_APP = false; assert.deepEqual(await f.run({ type: "CUSTOMER", code: "C1" }), []);
});
test("Enterprise and Employee must independently opt in; absent roster has no actor/admin fallback", async t => {
  const f = fixture(t); delete f.db.Enterprise[0].transferNotificationRecipients;
  f.db.Enterprise[0].adminEmail = "administrator@example.test"; assert.deepEqual(await f.run(), []);
  f.db.Enterprise[0].transferNotificationRecipients = [{ employeeCode: "U1" }];
  delete f.db.Employee[0].transferNotificationPreferences; assert.deepEqual(await f.run(), []);
  f.db.Employee[0].transferNotificationPreferences = { IN_APP: true };
  f.db.Enterprise[0].transferNotificationPreferences.IN_APP = false; assert.deepEqual(await f.run(), []);
});
test("inactive or missing selected Employees suppress rather than falling back to Customer identities", async t => {
  const f = fixture(t); f.db.Employee[0].active = false; assert.deepEqual(await f.run(), []);
  f.db.Employee = []; assert.deepEqual(await f.run(), []);
});
test("locked canonical Employee refuses through the real membership identity owner", async t => {
  const f = fixture(t); f.state.locked = true; await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
});
test("locked Customer anchor and an Employee inbox namespace collision refuse", async t => {
  const f = fixture(t); f.state.locked = true;
  await assert.rejects(f.run({ type: "CUSTOMER", code: "C1" }));
  f.state.locked = false;
  f.db.Customer.push({ code: "profile-employee:U1", active: false });
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
});
test("service principals cannot be Enterprise recipients even if given the same code, groups and preferences", async t => {
  const f = fixture(t); f.db.Employee[0].principalType = "service"; assert.deepEqual(await f.run(), []);
});
test("scope alone grants no permission; permission alone grants no Enterprise scope", async t => {
  const f = fixture(t); f.db.UserGroup[1].permissions = []; assert.deepEqual(await f.run(), []);
  f.db.UserGroup[1].permissions = ["loyalty.wallet.read"]; f.db.PrincipalScopeAssignment = []; assert.deepEqual(await f.run(), []);
});
test("current tenant/Enterprise deny takes precedence over a valid inherited group grant", async t => {
  const f = fixture(t);
  f.db.PrincipalScopeAssignment.push({ ...f.db.PrincipalScopeAssignment[0], code: "denied", effect: "DENY", scopeType: "TENANT", scopeCode: "tenant" });
  assert.deepEqual(await f.run(), []);
});
test("unrelated denial does not suppress a qualified owner; wrong capability/Enterprise allow cannot authorize", async t => {
  const f = fixture(t); f.db.PrincipalScopeAssignment.push({ ...f.db.PrincipalScopeAssignment[0], code: "unrelated", effect: "DENY", permissionCode: "different.permission" });
  assert.deepEqual(await f.run(), ["profile-employee:U1"]);
  f.db.PrincipalScopeAssignment[0].capabilityCode = "digitalCore"; assert.deepEqual(await f.run(), []);
  delete f.db.PrincipalScopeAssignment[0].capabilityCode; f.db.PrincipalScopeAssignment[0].scopeCode = "foreign"; assert.deepEqual(await f.run(), []);
});
test("cross-tenant owner or Employee evidence refuses before projection", async t => {
  const f = fixture(t); f.db.Enterprise[0].tenant = "foreign"; await assert.rejects(f.run());
  f.db.Enterprise[0].tenant = "tenant"; f.db.Employee[0].tenant = "foreign"; await assert.rejects(f.run());
});
test("old Customer-mapped roster, duplicate roster and malformed fields are rejected, not compatibility converted", async t => {
  const f = fixture(t);
  for (const roster of [[{ ownerType: "CUSTOMER", ownerCode: "C1" }], [{ employeeCode: "U1" }, { employeeCode: "U1" }],
    [{ employeeCode: "U1", email: "extra@example.test" }]]) {
    f.db.Enterprise[0].transferNotificationRecipients = roster; await assert.rejects(f.run());
  }
});
test("fresh persisted groups cannot smuggle cycles, deleted permissions or inherited platform full access", async t => {
  const f = fixture(t); f.db.UserGroup[1].parentGroups = ["reader"]; await assert.rejects(f.run());
  f.db.UserGroup[1].parentGroups = []; f.db.Permission[0].active = false; await assert.rejects(f.run());
  f.db.Permission[0].active = true; f.db.UserGroup[1].permissions = ["*"]; await assert.rejects(f.run());
});
test("linked Employee projection needs exactly its completed accepted Enterprise membership", async t => {
  const f = fixture(t), original = clone(f.db.Employee[0]);
  f.db.Employee.push({ ...original, code: "anchor", _id: "anchor-id" });
  const identity = { tenantCode: "tenant", recordKind: "EMPLOYEE", recordId: "anchor-id" };
  f.db.Employee[0].authenticationIdentity = identity;
  await assert.rejects(f.run());
  f.state.assignments = [{ code: "accepted" }];
  f.state.assignment = { code: "accepted", active: true, revision: 2, status: "REGISTERED", tenantCode: "tenant", enterpriseCode: "E1", groupCodes: ["reader"],
    membership: { phase: "COMPLETE", projectionId: "U1-id", identity } };
  f.state.assignment.membership.assignmentDigest = registration.assignmentDigest(f.state.assignment);
  assert.deepEqual(await f.run(), ["profile-employee:U1"]);
  f.state.assignment.status = "SUSPENDED"; await assert.rejects(f.run());
});
test("preference revocation during resolution invalidates the snapshot instead of returning stale recipients", async t => {
  const f = fixture(t); let scopesRead = false;
  f.state.onRead = name => { if (name === "PrincipalScopeAssignment" && !scopesRead) { scopesRead = true; f.db.Employee[0].transferNotificationPreferences.IN_APP = false; } };
  await assert.rejects(f.run()); assert.deepEqual(await f.run(), []);
});
test("storage failure is unavailable evidence, not a successful empty recipient list", async t => {
  const f = fixture(t); f.state.onRead = (name, response) => { if (name === "Employee") response.code = "ERR_STORAGE"; };
  await assert.rejects(f.run(), { code: "ERR_AUTH_00003" });
});
test("runtime token/private context is required and the original identity cannot drift during reads", async t => {
  const f = fixture(t); await assert.rejects(recipient.select(clone(f.request), { type: "ENTERPRISE", code: "E1" }, f.p));
  f.state.onRead = () => { f.request.authData.tenant = "foreign"; }; await assert.rejects(f.run());
});
test("framework recipient bounds and explicit later-layer field selection work without business defaults in code", async t => {
  const f = fixture(t);
  f.p.preferencesField = "selectedOutcomePreferences"; f.p.recipientsField = "selectedOutcomeRecipients";
  f.db.Enterprise[0].selectedOutcomePreferences = { IN_APP: true }; f.db.Employee[0].selectedOutcomePreferences = { IN_APP: true };
  f.db.Enterprise[0].selectedOutcomeRecipients = [{ employeeCode: "U1" }];
  assert.deepEqual(await f.run(), ["profile-employee:U1"]);
  f.config.profileNotificationRecipients.maximumGroups = 1; await assert.rejects(f.run());
  f.config.profileNotificationRecipients.maximumGroups = 100; f.p.maximumRecipients = 0; await assert.rejects(f.run());
});
test("unsafe policy property paths are not dynamic destination lookups", async t => {
  const f = fixture(t); f.p.preferencesField = "__proto__"; await assert.rejects(f.run()); assert.equal(f.state.reads.length, 0);
});
test("identifiers and policy fields cannot hide trailing whitespace or control characters", async t => {
  const f = fixture(t);
  await assert.rejects(f.run({ type: "ENTERPRISE", code: "E1\n" }));
  f.p.preferencesField = "transferNotificationPreferences\n"; await assert.rejects(f.run());
  assert.equal(f.state.reads.length, 0);
});

test("transfer wrapper validates shared selection policy and refuses system admission before its source read", async t => {
  for (const mode of ["MISSING_SELECTION", "SYSTEM"]) {
    const f = fixture(t), p = f.config.profileTransferNotifications;
    Object.assign(p, { enabled: true, qualified: true });
    Object.assign(f.request.authData, { modules: ["profile", "loyaltyWallet"], permissions: [p.permission] });
    f.request.body = { source: { operationCode: "transfer-1", side: "RECIPIENT" }, channel: "IN_APP" };
    if (mode === "MISSING_SELECTION") delete p.recipientSelection;
    if (mode === "SYSTEM") f.request.authData.isSystem = true;
    let calls = 0;
    const transfer = { ...require("../src/service/identity/defaultProfileTransferNotificationRecipientService"),
      source: async () => { calls++; throw new Error("must not read source"); } };
    await assert.rejects(transfer.resolve(f.request), { code: "ERR_AUTH_00003" });
    assert.equal(calls, 0); assert.equal(f.state.reads.length, 0);
  }
});

/** Reuses actual identity/grant owners above with Bidding's source reader/client and Profile HTTP layers. Only credential transport and generated persistence are isolated. */
function auctionFixture(t) {
  const f = fixture(t), auction = require("../src/service/identity/defaultProfileAuctionNotificationRecipientService");
  const bidding = require("../../../../nodics.commerce/modules/bidding/src/service/defaultBiddingAuctionNotificationService");
  const controller = require("../src/controller/identity/defaultProfileAuctionNotificationRecipientController");
  f.config.bidding = clone(require("../../../../nodics.commerce/modules/bidding/config/properties").bidding);
  Object.assign(f.config.bidding.auction.notifications, { enabled: true, qualified: true });
  f.config.bidding.stores = { store: { enterpriseCode: "issuer" } };
  Object.assign(f.config.profileAuctionNotifications, { enabled: true, qualified: true });
  for (const kind of ["Customer", "Enterprise", "Employee"]) f.db[kind][0].auctionNotificationPreferences = { IN_APP: true };
  f.db.Enterprise[0].auctionNotificationRecipients = [{ employeeCode: "U1" }];
  f.db.UserGroup[1].permissions = ["commerce.bid.participate"];
  f.db.Permission = [{ code: "commerce.bid.participate", active: true }];
  const round = { code: "AUCTION_" + "a".repeat(64), tenant: "tenant", storeCode: "store", enterpriseCode: "issuer", notificationEvents: {} };
  const event = { code: "AUCTION_EVENT_" + "b".repeat(64), kind: "WINNER_PENDING", roundCode: round.code,
    storeCode: "store", ownerRef: { module: "profile", schema: "enterprise", code: "E1" }, currency: "UNIT", amount: "5.00" };
  round.notificationEvents[event.code] = event;
  const body = { source: { roundCode: round.code, eventCode: event.code, storeCode: "store" }, channel: "IN_APP" };
  Object.assign(f.request.authData, { modules: ["profile", "bidding", "commsApi"], permissions: [f.config.profileAuctionNotifications.permission, "commerce.bid.manage"] });
  f.request.body = clone(body);
  const headers = {}, calls = [];
  f.request.httpResponse = { setHeader: (name, value) => { headers[name] = value; } };
  global.FACADE = { DefaultProfileAuctionNotificationRecipientFacade: require("../src/facade/identity/defaultProfileAuctionNotificationRecipientFacade") };
  Object.assign(SERVICE, {
    DefaultProfileAuctionNotificationRecipientService: auction,
    DefaultProfileCommerceNotificationRecipientService: require("../src/service/customer/defaultProfileCommerceNotificationRecipientService"),
    DefaultBiddingAuctionNotificationService: bidding,
    DefaultBiddingAuctionService: require("../../../../nodics.commerce/modules/bidding/src/service/defaultBiddingAuctionService"),
    DefaultBiddingService: require("../../../../nodics.commerce/modules/bidding/src/service/defaultBiddingService"),
    DefaultNegotiatedPriceService: require("../../../../nodics.commerce/modules/baseCommerce/modules/pricing/src/service/defaultNegotiatedPriceService"),
    DefaultBiddingAuctionPortsService: require("../../../../nodics.commerce/modules/bidding/src/service/defaultBiddingAuctionPortsService"),
    DefaultBiddingAuctionRoundService: { get: async r => {
      assert.equal(r.tenant, "tenant"); assert.equal(r.query.enterpriseCode, "issuer");
      if (r.query.code) assert.equal(r.query.code, round.code);
      else assert.equal(r.query["notificationEvents." + event.code + ".code"], event.code);
      f.state.roundReads = (f.state.roundReads || 0) + 1; await f.state.onRoundRead?.();
      return { code: f.state.storageError ? "ERR_READ" : "SUC_READ", result: f.state.missingRound ? [] : [clone(round)] };
    } },
    DefaultModuleService: { invokeModule: async call => {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(call);
      assert.equal(call.requireInternalAuth, true); assert.equal(call.header, undefined);
      assert.deepEqual(call.request, { tenant: "tenant" }); assert.equal(call.secureTransport.required, true);
      assert.equal(call.maxAttempts, 1); assert.equal(call.followRedirects, false); calls.push(call);
      const r = { tenant: "tenant", authData: clone(f.request.authData), payload: clone(call.requestBody) };
      if (call.moduleName === "profile") {
        assert.equal(call.apiName, "/internal/auctions/notification-recipients");
        return SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => controller.resolve(r));
      }
      assert.equal(call.moduleName, "bidding");
      if (call.apiName === "/internal/auctions/notification-eligibility") {
        r.authData.entCode = "issuer";
        return { data: await SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => bidding.eligibility(r)) };
      }
      assert.equal(call.apiName, "/internal/auctions/notification-source");
      const proof = await SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => bidding.source(r));
      f.state.changeProof?.(proof); return { data: proof };
    } },
  });
  return { ...f, auction, bidding, controller, round, event, calls, headers,
    resolve: () => controller.resolve(f.request),
    recipients: () => bidding.recipients({ tenant: "tenant" }, event, bidding.policy()) };
}

test("auction real source -> Profile controller/facade -> current Employee grants composes with actual Bidding recipient client", async t => {
  const f = auctionFixture(t), response = await f.resolve();
  assert.equal(f.headers["Cache-Control"], "no-store"); assert.equal(response.code, "SUC_PRFL_00000");
  assert.deepEqual(response.data.owner, { ownerType: "ENTERPRISE", ownerCode: "E1" });
  assert.equal(response.data.recipients[0].recipientId, "profile-employee:U1");
  assert.deepEqual(await f.recipients(), response.data.recipients);
  assert.equal(f.state.roundReads, 4); assert.ok(f.state.reads.includes("UserGroup"));
  assert.equal(JSON.stringify(response).includes("employee@example.test"), false);
  assert.equal(f.db.Customer.length, 1); assert.equal(f.round.enterpriseCode, "issuer");
});
test("auction Customer owner receives only its own opt-in inbox; each persisted event kind is accepted", async t => {
  const f = auctionFixture(t); f.event.ownerRef = { module: "profile", schema: "customer", code: "C1" };
  for (const kind of ["SELECTED", "CANCELLED", "UNSELECTED_RELEASED", "WINNER_PENDING", "UNSOLD"]) {
    f.event.kind = kind; assert.equal((await f.recipients())[0].recipientId, "C1");
  }
  f.db.Customer[0].auctionNotificationPreferences.IN_APP = false; assert.deepEqual(await f.recipients(), []);
});
test("auction persisted permission and scope are independently required, with deny precedence and no recipient fallback", async t => {
  for (const change of ["PERMISSION", "SCOPE", "DENY", "ROSTER", "OWNER_OPTOUT", "EMPLOYEE_OPTOUT"]) {
    const f = auctionFixture(t);
    if (change === "PERMISSION") f.db.UserGroup[1].permissions = [];
    if (change === "SCOPE") f.db.PrincipalScopeAssignment = [];
    if (change === "DENY") f.db.PrincipalScopeAssignment.push({ ...f.db.PrincipalScopeAssignment[0], code: "deny", effect: "DENY" });
    if (change === "ROSTER") delete f.db.Enterprise[0].auctionNotificationRecipients;
    if (change === "OWNER_OPTOUT") f.db.Enterprise[0].auctionNotificationPreferences.IN_APP = false;
    if (change === "EMPLOYEE_OPTOUT") f.db.Employee[0].auctionNotificationPreferences.IN_APP = false;
    assert.deepEqual(await f.recipients(), [], change);
  }
});
test("auction activation and qualification are independent framework gates; incomplete policy refuses before reads", async t => {
  for (const change of ["DISABLED", "UNQUALIFIED", "MISSING_SELECTION", "MISSING_GROUP_BOUND", "BAD_TYPES"]) {
    const f = auctionFixture(t), p = f.config.profileAuctionNotifications;
    if (change === "DISABLED") p.enabled = false;
    if (change === "UNQUALIFIED") p.qualified = false;
    if (change === "MISSING_SELECTION") delete p.recipientSelection;
    if (change === "MISSING_GROUP_BOUND") delete f.config.profileNotificationRecipients.maximumGroups;
    if (change === "BAD_TYPES") p.sourceTypes.push(p.sourceTypes[0]);
    await assert.rejects(f.resolve(), { code: "ERR_AUTH_00003" }); assert.equal(f.calls.length, 0);
  }
});
test("auction endpoint requires real scoped runtime admission, exact selectors and private capture before any source call", async t => {
  const mutations = [f => { f.request.authData.permissions = []; }, f => { f.request.authData.modules = ["profile"]; },
    f => { delete f.request.authData.runtimeScope; }, f => { f.request.authData.isSystem = true; },
    f => { f.request.authData.principalType = "human"; }, f => { f.request.authData.tenant = "foreign"; },
    f => { f.request.enterpriseCode = "E1"; }, f => { f.request.body.owner = "E1"; },
    f => { f.request.body.source.ownerCode = "E1"; }, f => { f.request.body.source.roundCode += "\n"; },
    f => { f.request.query = { recipient: "U1" }; }, f => { f.request.payload = { other: true }; },
    f => { f.request.httpRequest = { headers: { "x-tenant-code": "foreign" } }; }];
  for (const mutate of mutations) {
    const f = auctionFixture(t); mutate(f);
    await assert.rejects(f.resolve(), { code: "ERR_AUTH_00003" }); assert.equal(f.calls.length, 0);
  }
  const f = auctionFixture(t);
  await assert.rejects(f.auction.resolve({ ...f.request }), { code: "ERR_AUTH_00003" }); assert.equal(f.calls.length, 0);
});
test("auction source proof cannot change tenant, owner kind, digest, event, round, store or committed status", async t => {
  for (const field of ["tenant", "owner", "sourceDigest", "eventCode", "sourceCode", "roundCode", "storeCode", "committed", "sourceType", "channel"]) {
    const f = auctionFixture(t); f.state.changeProof = proof => { proof[field] = field === "owner" ? { ownerType: "EMPLOYEE", ownerCode: "U1" } : "foreign"; };
    await assert.rejects(f.resolve(), { code: "ERR_AUTH_00003" }); assert.equal(f.state.reads.length, 0);
  }
});
test("auction missing or failed persisted source is uncertainty, not an empty recipient result", async t => {
  for (const mode of ["ERROR", "MISSING", "EVENT", "TENANT", "STORE"]) {
    const f = auctionFixture(t);
    if (mode === "ERROR") f.state.storageError = true;
    if (mode === "MISSING") f.state.missingRound = true;
    if (mode === "EVENT") delete f.round.notificationEvents[f.event.code];
    if (mode === "TENANT") f.round.tenant = "foreign";
    if (mode === "STORE") f.round.storeCode = "foreign";
    await assert.rejects(f.resolve(), { code: "ERR_AUTH_00003" }); assert.equal(f.state.reads.length, 0);
  }
});
test("auction source, grant, preference and original request drift refuse without returning stale recipients", async t => {
  for (const mode of ["SOURCE", "PERMISSION", "PREFERENCE", "REQUEST", "POLICY"]) {
    const f = auctionFixture(t); f.state.onRoundRead = () => {
      if (f.state.roundReads !== 2) return;
      if (mode === "SOURCE") f.event.amount = "6.00";
      if (mode === "PERMISSION") f.db.UserGroup[1].permissions = [];
      if (mode === "PREFERENCE") f.db.Employee[0].auctionNotificationPreferences.IN_APP = false;
      if (mode === "REQUEST") f.request.authData.entCode = "other";
      if (mode === "POLICY") f.config.profileAuctionNotifications.timeoutMs++;
    };
    await assert.rejects(f.resolve(), { code: "ERR_AUTH_00003" });
  }
});
test("auction opaque addresses bind the exact immutable event digest and typed owner", async t => {
  const f = auctionFixture(t), first = await f.recipients(); f.event.amount = "6.00";
  const second = await f.recipients(); assert.equal(second[0].recipientId, first[0].recipientId);
  assert.notEqual(second[0].recipientAddressReference, first[0].recipientAddressReference);
});
test("auction callback controller keeps error details redacted and transport responses non-cacheable", async t => {
  const f = auctionFixture(t); f.state.storageError = true;
  await new Promise((resolve, reject) => f.controller.resolve(f.request, (error, value) => {
    try { assert.equal(error.code, "ERR_AUTH_00003"); assert.equal(value, undefined); resolve(); } catch (e) { reject(e); }
  }));
  assert.equal(f.headers["Cache-Control"], "no-store");
});
test("auction actual dispatch eligibility rechecks Profile grants and suppresses frozen recipients without readdressing", async t => {
  const f = auctionFixture(t), [selected] = await f.recipients();
  const message = { ...selected, channel: "IN_APP", purpose: "AUCTION_WINNER_PENDING", idempotencyKey: "retained-auction-command" };
  f.event.messages = [clone(message)];
  const input = { tenant: "tenant", ...message, sourceModule: "bidding", sourceType: message.purpose, sourceCode: f.event.code };
  assert.equal((await f.bidding.isDispatchEligible(input)).eligible, true);
  f.db.UserGroup[1].permissions = [];
  const suppressed = await f.bidding.isDispatchEligible(input);
  assert.equal(suppressed.eligible, false); assert.equal(suppressed.recipientId, selected.recipientId);
  assert.equal(suppressed.recipientAddressReference, selected.recipientAddressReference);
  assert.deepEqual(f.event.messages, [message]);
  f.db.UserGroup[1].permissions = ["commerce.bid.participate"];
  f.db.Enterprise[0].auctionNotificationRecipients = [];
  assert.equal((await f.bidding.isDispatchEligible(input)).eligible, false);
  f.state.storageError = true;
  await assert.rejects(f.bidding.isDispatchEligible(input));
});
test("auction framework route and identity schema definitions are private and inert without grants or roster defaults", t => {
  const previous = Object.getOwnPropertyDescriptor(global, "ENUMS");
  t.after(() => previous ? Object.defineProperty(global, "ENUMS", previous) : delete global.ENUMS);
  global.ENUMS = { ContactType: Object.fromEntries(require("../src/utils/enums").ContactType.definition.map(key => [key, { key }])) };
  const properties = require("../config/properties"), route = require("../src/router/routers").profile.auctionNotificationRecipients.resolve;
  assert.equal(properties.profileAuctionNotifications.enabled, false);
  assert.equal(properties.profileAuctionNotifications.qualified, false);
  assert.deepEqual(route.authTokenTypes, ["service"]); assert.equal(route.apiExposure, "moduleInternal");
  assert.equal(route.requestPrivacy.sensitive, true); assert.equal(route.cache.enabled, false);
  assert.equal(route.permissionConfig, "profileAuctionNotifications.permission");
  assert.equal(route.controller, "DefaultProfileAuctionNotificationRecipientController");
  const schemas = require("../src/schemas/schemas").profile;
  for (const name of ["customer", "employee", "enterprise"]) {
    const field = schemas[name].definition.auctionNotificationPreferences;
    assert.equal(field.required, false); assert.equal(field.default, undefined);
  }
  assert.equal(schemas.enterprise.definition.auctionNotificationRecipients.type, "array");
  assert.equal(schemas.enterprise.definition.auctionNotificationRecipients.default, undefined);
});

/** Real Digital manifest/receipt proof and Communication delivery compose with the real Profile identity owners; generated storage and credential transport are isolated. */
function giftFixture(t) {
  const f = fixture(t), path = require("node:path"), root = path.resolve(__dirname, "../../../..");
  const digitalRoot = path.join(root, "nodics.commerce/modules/digitalCommerce/modules/digitalCore");
  const digital = require(path.join(digitalRoot, "src/service/defaultDigitalBundleGiftNotificationService"));
  const bundles = require(path.join(digitalRoot, "src/service/defaultDigitalBundleService"));
  const profile = require("../src/service/identity/defaultProfileGiftNotificationRecipientService");
  const controller = require("../src/controller/identity/defaultProfileGiftNotificationRecipientController");
  const commsRoot = path.join(root, "nodics.communication/modules/commsCore");
  const communication = require(path.join(commsRoot, "src/service/defaultCommunicationRuntimeService"));
  const defaults = require(path.join(digitalRoot, "config/properties"));
  f.config.digitalCore = clone(defaults.digitalCore); f.config.runtimeRole = { code: "COMMERCE" };
  Object.assign(f.config.profileGiftNotifications, { enabled: true, qualified: true });
  Object.assign(f.config.digitalCore.giftNotifications, { enabled: true, qualified: true,
    sourceCallers: [{ tenant: "tenant", principalEnterpriseCode: "runtime", enterpriseCode: "market", serviceId: "runtime", ...f.request.authData.runtimeScope }] });
  Object.assign(f.request.authData, { modules: ["profile", "digitalCore", "commsApi"],
    permissions: [f.config.profileGiftNotifications.permission, "commerce.digital.notification.read", "communication.request"] });
  for (const kind of ["Customer", "Enterprise", "Employee"]) f.db[kind][0].giftNotificationPreferences = { IN_APP: true };
  f.db.Enterprise[0].giftNotificationRecipients = [{ employeeCode: "U1" }];
  f.db.UserGroup[1].permissions = ["commerce.digital.bundle.manage"];
  f.db.Permission = [{ code: "commerce.digital.bundle.manage", active: true }];
  const manifest = { code: "bundle:" + "a".repeat(64), revision: 1, status: "ACTIVE", active: true, tenant: "tenant", enterpriseCode: "sender-business",
    ownerRef: { module: "profile", schema: "customer", code: "C1" }, components: [{ kind: "CERTIFICATE", reference: { module: "wasteCore", schema: "wasteAsset", code: "asset" }, quantity: "1", expectedRevision: 1 }] };
  manifest.digest = bundles.digest({ ownerRef: manifest.ownerRef, components: manifest.components });
  const row = { code: "bundle-operation:" + "b".repeat(64), revision: 1, purpose: "GIFT", status: "PENDING", active: true, tenant: "tenant", enterpriseCode: "market",
    ownerRef: clone(manifest.ownerRef), recipientRef: { module: "profile", schema: "enterprise", code: "E1" },
    manifestCode: manifest.code, manifestRevision: 1, deadline: new Date(Date.now() + 3600000).toISOString(),
    evidence: { manifestEnterpriseCode: manifest.enterpriseCode, manifestDigest: manifest.digest }, checkpoints: { 0: {} } };
  const receipt = status => ({ status, operationKey: row.code + ":0", receiptCode: "receipt-" + status,
    quantity: "1", reference: clone(manifest.components[0].reference) });
  row.checkpoints[0].reserve = receipt("RESERVED");
  const source = { enterpriseCode: "market", operationCode: row.code, event: "PENDING", side: "RECIPIENT" };
  f.request.body = { source: clone(source), channel: "IN_APP" };
  const calls = [], stores = {}, headers = {};
  f.request.httpResponse = { setHeader: (key, value) => { headers[key] = value; } };
  global.FACADE = { DefaultProfileGiftNotificationRecipientFacade: require("../src/facade/identity/defaultProfileGiftNotificationRecipientFacade") };
  Object.assign(NODICS, { getSelectedEnvironmentName: () => "unit", getIndexedModules: () => new Map([["digitalCore", { name: "digitalCore", path: digitalRoot }]]),
    getRawModule: () => ({ name: "digitalCore", path: digitalRoot }) });
  const models = NODICS.getModels;
  NODICS.getModels = name => name === "digitalCore" ? { digitalBundleOperation: { primaryKey: "code", compareAndSetItem() {}, rawSchema: {} } } : models();
  UTILS.createModelName = name => name;
  f.config.communication = clone(require(path.join(commsRoot, "config/properties")).communication);
  Object.assign(f.config.communication, { trustedSourceModules: ["digitalCore"], dispatchEligibilityOwners: clone(defaults.communication.dispatchEligibilityOwners) });
  for (const template of Object.values(f.config.digitalCore.giftNotifications.templates)) f.config.communication.templateResources.selections[template] = true;
  Object.assign(SERVICE, {
    DefaultProfileGiftNotificationRecipientService: profile,
    DefaultProfileCommerceNotificationRecipientService: require("../src/service/customer/defaultProfileCommerceNotificationRecipientService"),
    DefaultDigitalBundleGiftNotificationService: digital, DefaultDigitalBundleService: bundles,
    DefaultDigitalCommerceEntitlementService: require(path.join(digitalRoot, "src/service/defaultDigitalCommerceEntitlementService")),
    DefaultDigitalCouponReminderDeliveryService: require(path.join(digitalRoot, "src/service/defaultDigitalCouponReminderDeliveryService")),
    DefaultCommunicationRuntimeService: communication, DefaultCommunicationCoreService: require(path.join(commsRoot, "src/service/defaultCommunicationCoreService")),
    DefaultCommunicationTemplateService: require(path.join(commsRoot, "src/service/defaultCommunicationTemplateService")),
    DefaultModelConcurrencyService: { getField: () => "revision" },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
  });
  for (const [name, item] of [["DefaultDigitalBundleOperationService", row], ["DefaultDigitalBundleManifestService", manifest]]) SERVICE[name] = {
    get: async r => {
      assert.deepEqual(r.query, { tenant: "tenant", enterpriseCode: item.enterpriseCode, code: item.code });
      f.state.sourceReads = (f.state.sourceReads || 0) + 1; await f.state.onSourceRead?.(name);
      return { code: f.state.storageError ? "ERR_READ" : "SUC_READ", result: f.state.missing ? [] : [clone(item)] };
    },
    update: async r => {
      if (!Object.entries(r.query).every(([key, value]) => item[key] === value)) return { code: "SUC_UPDATE", result: { matchedCount: 0 } };
      Object.assign(item, clone(r.model), { revision: item.revision + 1 });
      return { code: "SUC_UPDATE", result: { matchedCount: 1 } };
    },
  };
  for (const name of ["CommsIntent", "CommsDeliveryAttempt", "CommsInboxMessage", "CommsSuppression"]) {
    stores[name] = new Map();
    SERVICE["Default" + name + "Service"] = {
      get: async r => ({ code: "SUC_READ", result: [...stores[name].values()].filter(item => item.tenant === r.tenant && Object.entries(r.query).every(([key, value]) => item[key] === value)).map(clone) }),
      save: async r => {
        if (name === "CommsInboxMessage" && f.state.inboxFailure) throw Error("inbox unavailable");
        const key = r.tenant + r.model.code;
        if (stores[name].has(key)) throw Error("duplicate");
        const saved = { ...clone(r.model), tenant: r.tenant, revision: 1 }; stores[name].set(key, saved); return { code: "SUC_SAVE", result: clone(saved) };
      },
      update: async r => {
        const saved = stores[name].get(r.tenant + r.query.code);
        if (!saved || saved.revision !== r.query.revision) throw Error("revision conflict");
        Object.assign(saved, clone(r.model), { revision: saved.revision + 1 }); return { code: "SUC_UPDATE", result: { matchedCount: 1 } };
      },
    };
  }
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    calls.push(call); SERVICE.DefaultLoggerService.assertSensitiveRequest(call);
    assert.equal(call.requireInternalAuth, true); assert.equal(call.header, undefined); assert.equal(call.secureTransport.required, true);
    assert.deepEqual(call.request, { tenant: "tenant" });
    const r = { tenant: "tenant", authData: clone(f.request.authData), body: clone(call.requestBody) };
    if (call.moduleName === "profile") {
      assert.equal(call.apiName, "/internal/bundles/gifts/notification-recipients");
      return SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => controller.resolve(r));
    }
    if (call.moduleName === "digitalCore") {
      assert.equal(call.apiName, "/internal/bundles/gifts/notification-source");
      const proof = await SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => digital.source(r));
      f.state.changeProof?.(proof); return { data: proof };
    }
    assert.equal(call.moduleName, "commsApi"); assert.equal(call.apiName, "/internal/communications");
    const response = await communication.request(r, call.requestBody);
    if (f.state.lostAck) throw Error("lost acknowledgement");
    return { data: response };
  } };
  return { ...f, digital, row, manifest, source, stores, calls, headers, receipt,
    resolve: () => controller.resolve(f.request), recipients: () => digital.recipients({ tenant: "tenant" }, source, digital.settings()),
    notify: () => digital.notify({ tenant: "tenant", enterpriseCode: "market" }, row.code, source.event) };
}
test("gift real source receipts and typed Enterprise recipient compose through Profile HTTP and Digital client", async t => {
  const f = giftFixture(t), result = await f.resolve();
  assert.equal(f.headers["Cache-Control"], "no-store"); assert.equal(result.data.eligible, true);
  assert.deepEqual(result.data.ownerRef, { type: "ENTERPRISE", code: "E1" });
  assert.equal(result.data.recipients[0].recipientId, "profile-employee:U1");
  assert.deepEqual(await f.recipients(), result.data); assert.equal(f.db.Customer.length, 1);
  assert.equal(JSON.stringify(result).includes("employee@example.test"), false);
});
test("gift postcommit handoff actually delivers Customer sender and Enterprise Employee recipient once through existing Communication", async t => {
  const f = giftFixture(t); f.state.lostAck = true;
  assert.equal((await f.notify()).status, "UNCONFIRMED");
  assert.equal(f.stores.CommsInboxMessage.size, 2);
  f.state.lostAck = false; assert.equal((await f.notify()).status, "RECORDED");
  assert.equal(f.stores.CommsIntent.size, 2); assert.equal(f.stores.CommsInboxMessage.size, 2);
  assert.deepEqual([...f.stores.CommsInboxMessage.values()].map(v => v.recipientId).sort(), ["C1", "profile-employee:U1"]);
  assert.equal(f.row.status, "PENDING"); assert.equal(f.row.evidence.decision, undefined);
});
test("gift permission, scope, both opt-ins and explicit roster independently gate recipients without fallback", async t => {
  for (const mode of ["PERMISSION", "SCOPE", "DENY", "OWNER", "STAFF", "ROSTER"]) {
    const f = giftFixture(t);
    if (mode === "PERMISSION") f.db.UserGroup[1].permissions = [];
    if (mode === "SCOPE") f.db.PrincipalScopeAssignment = [];
    if (mode === "DENY") f.db.PrincipalScopeAssignment.push({ ...f.db.PrincipalScopeAssignment[0], code: "deny", effect: "DENY" });
    if (mode === "OWNER") f.db.Enterprise[0].giftNotificationPreferences.IN_APP = false;
    if (mode === "STAFF") f.db.Employee[0].giftNotificationPreferences.IN_APP = false;
    if (mode === "ROSTER") delete f.db.Enterprise[0].giftNotificationRecipients;
    assert.deepEqual((await f.recipients()).recipients, [], mode);
  }
});
test("gift all terminal events require exact complete receipt phases and selected original side", async t => {
  for (const event of ["ACCEPTED", "CANCELLED", "DECLINED", "EXPIRED"]) {
    const f = giftFixture(t); f.source.event = event; f.source.side = "SENDER";
    Object.assign(f.row.evidence, { decision: { ACCEPTED: "ACCEPT", CANCELLED: "CANCEL", DECLINED: "DECLINE", EXPIRED: "EXPIRE" }[event], decidedAt: new Date().toISOString() });
    f.row.status = event === "ACCEPTED" ? "COMPLETED" : "RELEASED";
    await assert.rejects(f.recipients());
    Object.assign(f.row.checkpoints[0], event === "ACCEPTED" ? { transfer: f.receipt("TRANSFERRED"), finalize: f.receipt("COMPLETED") } : { release: f.receipt("RELEASED") });
    const result = await f.recipients(); assert.equal(result.sourceType, "DIGITAL_BUNDLE_GIFT_" + event); assert.equal(result.recipients[0].recipientId, "C1");
  }
});
test("gift stale pending proof is ineligible without owner or digest and never reads recipient identities", async t => {
  const f = giftFixture(t); f.row.evidence.decision = "ACCEPT";
  const result = await f.recipients(); assert.equal(result.eligible, false); assert.deepEqual(result.recipients, []);
  assert.equal(result.ownerRef, undefined); assert.equal(result.sourceDigest, undefined); assert.equal(f.state.reads.length, 0);
});
test("gift invalid source proof, missing source grants and unavailable persisted receipts never become empty successful selection", async t => {
  for (const mode of ["PROOF", "GRANT", "RECEIPT", "STORAGE", "MANIFEST"]) {
    const f = giftFixture(t);
    if (mode === "PROOF") f.state.changeProof = proof => { proof.ownerRef = { type: "EMPLOYEE", code: "U1" }; };
    if (mode === "GRANT") f.config.digitalCore.giftNotifications.sourceCallers = [];
    if (mode === "RECEIPT") f.row.checkpoints[0].reserve.operationKey = "other";
    if (mode === "STORAGE") f.state.storageError = true;
    if (mode === "MANIFEST") f.manifest.digest = "wrong";
    await assert.rejects(f.resolve(), { code: "ERR_AUTH_00003" }); assert.equal(f.state.reads.length, 0);
  }
});
test("gift runtime admission, default gates and exact source selectors refuse before transport", async t => {
  for (const mutate of [f => { f.config.profileGiftNotifications.enabled = false; }, f => { f.config.profileGiftNotifications.qualified = false; },
    f => { f.request.authData.permissions = []; }, f => { f.request.authData.modules = ["profile"]; },
    f => { delete f.request.authData.runtimeScope; }, f => { f.request.authData.isSystem = true; },
    f => { f.request.transactionContext = {}; }, f => { f.request.body.ownerRef = {}; },
    f => { f.request.body.source.side = "EMPLOYEE"; }, f => { f.request.body.source.operationCode += "\n"; },
    f => { f.request.enterpriseCode = "market"; }, f => { f.request.query = { recipient: "U1" }; }]) {
    const f = giftFixture(t); mutate(f); await assert.rejects(f.resolve(), { code: "ERR_AUTH_00003" }); assert.equal(f.calls.length, 0);
  }
});
test("gift source, actor, policy and consent changes across awaits refuse stale projections", async t => {
  for (const mode of ["SOURCE", "ACTOR", "POLICY", "CONSENT"]) {
    const f = giftFixture(t); f.state.onSourceRead = () => {
      if (f.state.sourceReads !== 5) return;
      if (mode === "SOURCE") f.row.evidence.decision = "ACCEPT";
      if (mode === "ACTOR") f.request.authData.entCode = "other";
      if (mode === "POLICY") f.config.profileGiftNotifications.timeoutMs++;
      if (mode === "CONSENT") f.db.Employee[0].giftNotificationPreferences.IN_APP = false;
    };
    await assert.rejects(f.resolve(), { code: "ERR_AUTH_00003" });
  }
});
test("gift actual dispatch hook suppresses frozen recipients after permission revocation or a pending decision", async t => {
  const f = giftFixture(t), proof = await f.recipients(), selected = proof.recipients[0];
  const input = { tenant: "tenant", ...selected, sourceModule: "digitalCore", sourceType: "DIGITAL_BUNDLE_GIFT_PENDING", purpose: "DIGITAL_BUNDLE_GIFT_PENDING",
    sourceCode: f.digital.sourceCode(f.source), channel: "IN_APP", idempotencyKey: f.digital.key(f.source, selected.recipientId) };
  assert.equal((await f.digital.isDispatchEligible(input)).eligible, true);
  f.db.UserGroup[1].permissions = []; assert.equal((await f.digital.isDispatchEligible(input)).eligible, false);
  f.db.UserGroup[1].permissions = ["commerce.digital.bundle.manage"];
  f.row.evidence.decision = "ACCEPT"; assert.equal((await f.digital.isDispatchEligible(input)).eligible, false);
  f.state.storageError = true; await assert.rejects(f.digital.isDispatchEligible(input));
});

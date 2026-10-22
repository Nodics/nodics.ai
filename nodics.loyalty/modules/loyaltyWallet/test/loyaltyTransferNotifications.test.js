/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
require("./helpers/runtimeEnums.js")();
/** @module loyaltyWallet/test/loyaltyTransferNotifications @description Real Wallet/Profile/Communication owner contract with isolated persistence and credential-transport ports; no live runtime or providers. @layer test @owner loyaltyWallet */
const test = require("node:test"), assert = require("node:assert/strict"), path = require("node:path");
const wallet = require("../src/service/defaultLoyaltyTransferNotificationService");
const participant = require("../src/service/defaultLoyaltyParticipantService");
const transfer = require("../src/service/defaultLoyaltyParticipantTransferService");
const operations = require("../src/service/defaultLoyaltyRewardOperationService");
const root = "../../../../";
const profile = require(root + "nodics.platform/modules/profile/src/service/identity/defaultProfileTransferNotificationRecipientService");
const recipientSelector = require(root + "nodics.platform/modules/profile/src/service/identity/defaultProfileNotificationRecipientService");
const profileController = require(root + "nodics.platform/modules/profile/src/controller/identity/defaultProfileTransferNotificationRecipientController");
const profileFacade = require(root + "nodics.platform/modules/profile/src/facade/identity/defaultProfileTransferNotificationRecipientFacade");
const registration = require(root + "nodics.platform/modules/profile/src/service/enterprise/defaultEnterpriseRegistrationService");
const unwrap = require(root + "nodics.platform/modules/profile/src/service/customer/defaultProfileCommerceNotificationRecipientService");
const runtime = require(root + "nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService");
const core = require(root + "nodics.communication/modules/commsCore/src/service/defaultCommunicationCoreService");
const templates = require(root + "nodics.communication/modules/commsCore/src/service/defaultCommunicationTemplateService");
const commsFacade = require(root + "nodics.communication/modules/commsApi/src/facade/defaultCommunicationApiFacade");
const commsOperations = require(root + "nodics.communication/modules/commsApi/src/service/defaultCommunicationOperationsService");
const tokens = require(root + "nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService");
const router = require(root + "nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const moduleTransport = require(root + "nodics.foundation/modules/nService/src/service/module/defaultModuleService");
const copy = value => structuredClone(value);

function fixture(t, enterpriseSender = false) {
  const globals = ["SERVICE", "FACADE", "CONFIG", "NODICS", "CLASSES"];
  const previous = globals.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => previous.forEach(([key, descriptor]) => descriptor ? Object.defineProperty(global, key, descriptor) : delete global[key]));
  const profileDefaults = require(root + "nodics.platform/modules/profile/config/properties");
  const config = { ...copy(profileDefaults), defaultTenant: "authority",
    identityGovernance: copy(require(root + "nodics.foundation/modules/nAuth/config/properties").identityGovernance),
    loyalty: { ...copy(require("../../loyaltyCore/config/properties").loyalty), ...copy(require("../config/properties").loyalty) },
    communicationApi: copy(require(root + "nodics.communication/modules/commsApi/config/properties").communicationApi),
    communication: copy(require(root + "nodics.communication/modules/commsCore/config/properties").communication) };
  // Deliberately qualify only this isolated fixture; all definitions come from their framework owners.
  Object.assign(config.loyalty.transferNotifications, { enabled: true, qualified: true });
  Object.assign(config.profileTransferNotifications, { enabled: true, qualified: true });
  const contributions = copy(require("../config/properties").communication);
  Object.assign(config.communication, { trustedSourceModules: ["loyaltyWallet"],
    dispatchEligibilityOwners: contributions.dispatchEligibilityOwners });
  Object.assign(config.communication.templateResources.modules, contributions.templateResources.modules);
  config.communication.templateResources.selections = { LOYALTY_TRANSFER_SENT_IN_APP: true, LOYALTY_TRANSFER_RECEIVED_IN_APP: true };
  const sourceOwner = { ownerType: enterpriseSender ? "ENTERPRISE" : "CUSTOMER", ownerCode: enterpriseSender ? "E1" : "C1" };
  const recipient = { ownerType: "ENTERPRISE", ownerCode: "E2" };
  const row = { code: "TRANSFER_fixture", ...sourceOwner, active: true, revision: 0, actorCode: "actor",
    completedAt: "2026-10-19T00:00:00.000Z",
    intent: { ...sourceOwner, recipient, programCode: "program", rewardTypeCode: "point", amount: "10.00", scale: 2, idempotencyKey: "key" },
    result: { status: "COMPLETED", amount: "10.00", feeAmount: "1.00", debitEntryCode: "DEBIT", creditEntryCode: "CREDIT" } };
  const common = { active: true, sourceType: "WALLET_TRANSFER", sourceCode: row.code, programCode: "program", rewardTypeCode: "point" };
  const db = { RewardTransferOperation: [row], RewardLedgerEntry: [
    { ...common, code: "DEBIT", entryType: "CAPTURE", walletCode: "W1", targetCode: "W2", amount: "11.00" },
    { ...common, code: "CREDIT", entryType: "EARN", walletCode: "W2", amount: "10.00", metadata: { debitEntryCode: "DEBIT", fromWalletCode: "W1" } }],
    LoyaltyWallet: [{ code: "W1", ...sourceOwner }, { code: "W2", ...recipient }],
    Customer: ["C1", "C2", "C3"].map(code => ({ code, tenant: "tenant", principalType: "customer", active: true, transferNotificationPreferences: { IN_APP: true }, email: "private@invalid.test" })),
    Employee: ["U1", "U2", "U3"].map(code => ({ code, _id: code, loginId: code, principalType: "human", tenant: "tenant", active: true,
      userGroups: ["walletReader"], transferNotificationPreferences: { IN_APP: true } })),
    UserGroup: [{ code: "walletReader", active: true, parentGroups: [], permissions: ["loyalty.wallet.read"] }],
    Enterprise: ["E1", "E2"].map((code, i) => ({ code, tenant: "tenant", active: true,
      transferNotificationPreferences: { IN_APP: true }, transferNotificationRecipients: [{ employeeCode: "U" + (i + 1) }], adminEmail: "never@invalid.test" })) };
  const state = { calls: [], reads: [], writes: [], headers: {} }, privateRequests = new WeakSet();
  global.CONFIG = { get: key => key.split(".").reduce((value, part) => value?.[part], config) };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  const module = { name: "loyaltyWallet", path: path.resolve(__dirname, "..") };
  global.NODICS = { getIndexedModules: () => new Map([[module.name, module]]), getRawModule: () => module,
    getInternalAuthToken: tenant => { assert.equal(tenant, "tenant"); return "test-runtime-credential"; } };
  global.FACADE = { DefaultProfileTransferNotificationRecipientFacade: profileFacade };
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService"),
    DefaultLoyaltyTransferNotificationService: wallet, DefaultLoyaltyParticipantService: participant,
    DefaultLoyaltyParticipantTransferService: transfer, DefaultLoyaltyRewardOperationService: operations,
    DefaultProfileTransferNotificationRecipientService: profile, DefaultProfileCommerceNotificationRecipientService: unwrap,
    DefaultProfileNotificationRecipientService: recipientSelector,
    DefaultEnterpriseMembershipService: {
      resolve: async (person, tenant, kind) => { assert.equal(kind, person.principalType === "human" ? "EMPLOYEE" : "CUSTOMER"); return { identity: { recordId: person._id, tenantCode: tenant, recordKind: kind }, person }; },
      inventory: async () => [], authority: () => "authority",
    },
    DefaultIdentityCatalogueService: { codes: values => { assert.ok(Array.isArray(values)); }, requirePermissions: async () => [] },
    DefaultUserGroupGovernanceService: { validateGraph: () => {}, validatePermissions: async () => {} },
    DefaultPrincipalScopeGovernanceService: { getEffectiveScopes: async r => ({ principalType: "human", principalCode: r.authData.loginId,
      scopes: [{ scopeType: "ENTERPRISE", scopeCode: r.authData.loginId === "U1" ? "E1" : "E2" }], deniedScopes: [] }) },
    DefaultEnterpriseRegistrationService: registration,
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultServiceTokenService: tokens, DefaultSecuredRequestPipelineService: router,
    DefaultCommunicationRuntimeService: runtime, DefaultCommunicationCoreService: core,
    DefaultCommunicationTemplateService: templates, DefaultCommunicationOperationsService: commsOperations,
    DefaultLoggerService: {
      runSensitiveOperation: async (request, work) => { privateRequests.add(request); return work(); },
      assertSensitiveRequest: request => assert.ok(privateRequests.has(request), "exact admitted private object required"),
      hasPrivateCaptureProtection: request => privateRequests.has(request),
    },
  };
  for (const name of Object.keys(db)) {
    SERVICE["Default" + name + "Service"] = {
      get: async request => {
        assert.equal(request.tenant, name === "Enterprise" ? "authority" : "tenant");
        assert.equal(request.options.skipItemCache, true);
        assert.equal(request.options.recursive, false);
        if (["Customer", "Enterprise", "Employee", "UserGroup"].includes(name)) assert.equal(request.authData.isSystem, true);
        else assert.deepEqual(request.authData.userGroups, ["serviceAccountUserGroup"], "private owner storage boundary, not public customer CRUD");
        const result = db[name].filter(row => Object.entries(request.query).every(([key, value]) => row[key] === value));
        const response = { code: "SUC_READ", count: result.length, result: copy(result) };
        state.reads.push({ name, query: copy(request.query) });
        await state.onRead?.(name, response, request);
        return response;
      },
      update: async request => {
        assert.equal(name, "RewardTransferOperation", "notifications never write balances, ledgers or Profile records");
        assert.deepEqual(Object.keys(request.model).sort(), ["code", "notificationPlan", "revision"]);
        const found = db[name].find(item => item.code === request.query.code && item.revision === request.query.revision);
        await state.onWrite?.(request);
        if (!found || found.revision !== request.query.revision) return { code: "SUC_WRITE", result: { matchedCount: 0 } };
        Object.assign(found, copy(request.model)); state.writes.push(name);
        return { code: "SUC_WRITE", result: { matchedCount: 1 } };
      },
      save: () => assert.fail("notification does not create a Wallet outbox or Profile record"),
    };
  }
  for (const name of ["CommsIntent", "CommsDeliveryAttempt", "CommsInboxMessage", "CommsSuppression"]) {
    db[name] = [];
    SERVICE["Default" + name + "Service"] = {
      get: async ({ tenant, query }) => ({ code: "SUC_READ", result: copy(db[name].filter(row => row.tenant === tenant &&
        Object.entries(query).every(([key, value]) => value && Array.isArray(value.$in) ? value.$in.includes(row[key]) : row[key] === value))) }),
      save: async ({ tenant, model }) => {
        if (db[name].some(row => row.tenant === tenant && row.code === model.code)) throw Error("duplicate");
        const saved = { ...copy(model), tenant, revision: 1 }; db[name].push(saved);
        return { code: "SUC_WRITE", result: copy(saved) };
      },
      update: async ({ tenant, query, model }) => {
        const found = db[name].find(row => row.tenant === tenant && row.code === query.code && row.revision === query.revision);
        if (!found) throw Error("stale revision");
        Object.assign(found, copy(model), { revision: found.revision + 1 });
        return { code: "SUC_WRITE", result: { matchedCount: 1 } };
      },
    };
  }
  const request = { tenant: "tenant", authorization: "Bearer original-human-token",
    authData: { tenant: "tenant", entCode: enterpriseSender ? "E1" : "E0", loginId: "actor",
      principalType: enterpriseSender ? "human" : "customer", tokenType: "access", permissions: ["loyalty.wallet.read"] } };
  // Test-only validated credential transport. Production callers supply requireInternalAuth, never this principal.
  const runtimeRequest = body => ({ tenant: "tenant", payload: copy(body), authData: {
    tenant: "tenant", entCode: "runtimeEnterprise", tokenType: "service", principalType: "service", serviceId: "fixture-runtime",
    modules: ["profile", "loyaltyApi", "loyaltyWallet", "commsApi"],
    permissions: ["profile.transfer.notification.recipient.resolve", "loyalty.transfer.notification.source", "communication.request"],
    runtimeInstanceId: "instance", runtimeScope: { instanceCode: "instance", projectCode: "project", environmentCode: "unit", serverCode: "server", assignmentCode: "assignment" } } });
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    state.calls.push(copy(call)); await state.onCall?.(call);
    if (call.apiName === "/customer/identity" || call.apiName === "/identity/scopes/me") {
      assert.equal(call.header.Authorization, request.authorization);
      assert.equal(call.requireInternalAuth, undefined);
      return call.apiName === "/customer/identity"
        ? { contractVersion: 1, tenant: "tenant", enterpriseCode: "E0", customer: { loginId: "actor", code: "C1" } }
        : { principalCode: "actor", scopes: [{ scopeType: "ENTERPRISE", scopeCode: "E1" }], deniedScopes: [] };
    }
    assert.equal(call.requireInternalAuth, true);
    assert.equal(call.header, undefined); assert.deepEqual(call.request, { tenant: "tenant" });
    assert.equal(call.authData, undefined); assert.equal(call.maxAttempts, 1);
    assert.deepEqual(moduleTransport.buildInternalAuthorizationHeader(call), { Authorization: "Bearer test-runtime-credential" });
    SERVICE.DefaultLoggerService.assertSensitiveRequest(call);
    const target = runtimeRequest(call.requestBody);
    return SERVICE.DefaultLoggerService.runSensitiveOperation(target, async () => {
      let result;
      if (call.apiName === "/internal/transfers/notification-recipients") {
        target.httpResponse = { setHeader: (key, value) => { state.headers[key] = value; } };
        result = await profileController.resolve(target);
      } else if (call.apiName === "/internal/transfers/notification-source") result = await wallet.source(target);
      else if (call.apiName === "/internal/communications") result = await commsFacade.requestCommunication(target);
      else if (/^\/internal\/communications\/COMM_[a-f0-9]{64}\/inspect$/.test(call.apiName)) {
        target.intentCode = call.apiName.split("/")[3]; result = await commsFacade.inspectDelivery(target);
      } else assert.fail("unexpected route " + call.apiName);
      await state.onResponse?.(call, result);
      return copy(result);
    });
  } };
  const protect = (input, work) => SERVICE.DefaultLoggerService.runSensitiveOperation(input, work);
  return { db, row, state, config, request, runtimeRequest, protect, run: () => wallet.notify(request, row.code) };
}

for (const enterprise of [false, true]) test(`real owner chain delivers both sides for ${enterprise ? "Enterprise" : "Customer"} sender and inspects replay`, async t => {
  const f = fixture(t, enterprise), before = copy(f.request), ledger = copy(f.db.RewardLedgerEntry);
  const first = await f.run();
  assert.equal(first.status, "RECORDED");
  assert.deepEqual(first.outcomes.map(row => row.status), ["DELIVERED", "DELIVERED"]);
  assert.deepEqual(f.db.CommsInboxMessage.map(row => row.recipientId).sort(), [enterprise ? "profile-employee:U1" : "C1", "profile-employee:U2"]);
  assert.equal(f.db.CommsIntent.length, 2); assert.equal(f.db.CommsDeliveryAttempt.length, 2);
  assert.ok(f.db.CommsIntent.every(row => row.renderedContent.templateIdentity.ownerModule === "loyaltyWallet"));
  assert.equal(f.state.headers["Cache-Control"], "no-store");
  assert.deepEqual(f.request, before); assert.deepEqual(f.db.RewardLedgerEntry, ledger);
  assert.equal(JSON.stringify([f.row.notificationPlan, f.db.CommsIntent, f.db.CommsInboxMessage, first]).includes("@invalid.test"), false);
  assert.equal((await f.run()).status, "RECORDED");
  assert.equal(f.db.CommsInboxMessage.length, 2); assert.equal(f.db.CommsDeliveryAttempt.length, 2);
  assert.equal(f.state.calls.filter(row => row.apiName.endsWith("/inspect")).length, 2);
});
test("Wallet response-size policy inherits its owner default and honors later overrides without changing transport authority", async t => {
  const f = fixture(t), baseline = require("../config/properties").loyalty.transferNotifications.maxResponseBytes;
  assert.equal(wallet.policy().maxResponseBytes, baseline);
  f.config.loyalty.transferNotifications.maxResponseBytes = 32768;
  assert.equal((await f.run()).status, "RECORDED");
  const calls = f.state.calls.filter(call => call.apiName === "/internal/transfers/notification-recipients" ||
    call.apiName.startsWith("/internal/communications"));
  assert.ok(calls.length > 0);
  for (const call of calls) {
    assert.equal(call.maxResponseBytes, 32768);
    assert.equal(call.requireInternalAuth, true);
    assert.equal(call.header, undefined);
    assert.equal(call.maxAttempts, 1);
    assert.equal(call.followRedirects, false);
  }
});
test("invalid Wallet response limits refuse before private transport", async t => {
  const f = fixture(t);
  for (const value of [undefined, null, 0, -1, 1.5, "16384", NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    f.config.loyalty.transferNotifications.maxResponseBytes = value;
    assert.throws(() => wallet.policy(), /ERR_LOYALTY_TRANSFER/);
  }
  assert.equal(f.state.calls.length, 0);
});

test("delivered Enterprise transfer uses the actual Profile self identity and Communication Employee inbox without a Customer account", async t => {
  const f = fixture(t, true);
  assert.equal((await f.run()).status, "RECORDED");
  const identityOwner = require(root + "nodics.platform/modules/profile/src/service/identity/defaultProfileCouponNotificationRecipientService");
  const incoming = { tenant: "tenant", authorization: "Bearer employee-access", auth: { type: "bearer", credential: "employee-access" },
    authData: { tenant: "tenant", entCode: "E2", principalType: "human", tokenType: "access", loginId: "U2" } };
  const before = copy(incoming), customerCount = f.db.Customer.length;
  let identityReads = 0;
  // Isolated validated human-credential transport and membership port; both endpoint implementations are real.
  SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor = async r => {
    assert.deepEqual(r.authData, incoming.authData); assert.equal(r.tenant, "tenant");
  };
  SERVICE.DefaultEmployeeService.findByLoginId = async r => {
    assert.equal(r.tenant, "tenant"); assert.equal(r.loginId, "U2"); return copy(f.db.Employee[1]);
  };
  SERVICE.DefaultModuleService.invokeModule = async call => {
    identityReads++;
    assert.equal(call.apiName, "/employee/inbox-identity"); assert.equal(call.methodName, "GET");
    assert.deepEqual(call.header, { Authorization: incoming.authorization, "X-Enterprise-Code": "E2" });
    assert.equal(call.requireInternalAuth, undefined); assert.equal(call.authData, undefined);
    const target = { tenant: "tenant", authData: copy(incoming.authData) };
    return f.protect(target, async () => ({ code: "SUC_PRFL_00000", data: await identityOwner.inboxIdentity(target) }));
  };
  const inbox = await commsFacade.listEmployeeInbox(incoming);
  assert.equal(inbox.length, 1);
  assert.equal(inbox[0].code, f.db.CommsInboxMessage.find(row => row.recipientId === "profile-employee:U2").code);
  assert.deepEqual(inbox[0].source, { module: "loyaltyWallet", type: "LOYALTY_TRANSFER_COMPLETED", code: f.row.code });
  assert.equal(inbox[0].recipientId, undefined); assert.equal(inbox[0].recipientAddressReference, undefined);
  assert.equal(f.db.Customer.length, customerCount); assert.deepEqual(incoming, before); assert.equal(identityReads, 1);
  await assert.rejects(commsFacade.listEmployeeInbox({ ...incoming, authorization: "Bearer substituted" }));
  assert.equal(identityReads, 1, "forged original bearer never reaches Profile");
});

test("default-off and transaction-scoped calls perform no reads or sends", async t => {
  const f = fixture(t); f.config.loyalty.transferNotifications.enabled = false;
  assert.equal((await f.run()).status, "NOT_REQUESTED");
  f.config.loyalty.transferNotifications.enabled = true; f.request.transactionContext = {};
  assert.equal((await f.run()).status, "UNCONFIRMED");
  assert.equal(f.state.reads.length, 0); assert.equal(f.state.calls.length, 0);
});

test("lost delivery acknowledgement recovers the same Communication intent without duplicate inbox or accounting", async t => {
  const f = fixture(t); let lost = false;
  f.state.onResponse = call => { if (!lost && call.apiName === "/internal/communications") { lost = true; throw Error("lost acknowledgement"); } };
  assert.equal((await f.run()).status, "UNCONFIRMED");
  assert.equal(f.db.CommsInboxMessage.length, 2);
  assert.equal((await f.run()).status, "RECORDED");
  assert.equal(f.db.CommsIntent.length, 2); assert.equal(f.db.CommsDeliveryAttempt.length, 2);
  assert.equal(f.row.notificationPlan.entries.filter(row => row.intentCode).length, 2);
});

test("explicit Enterprise roster plus both preferences are required, with no employee or adminEmail fallback", async t => {
  const f = fixture(t); delete f.db.Enterprise[1].transferNotificationRecipients;
  f.db.Customer[0].transferNotificationPreferences.IN_APP = false;
  assert.equal((await f.run()).status, "RECORDED");
  assert.deepEqual(f.row.notificationPlan.entries, []); assert.equal(f.db.CommsIntent.length, 0);
  f.db.Enterprise[1].transferNotificationRecipients = [{ employeeCode: "U3" }];
  f.db.Customer[0].transferNotificationPreferences.IN_APP = true;
  await f.run(); assert.equal(f.db.CommsIntent.length, 0, "a frozen empty plan is not readdressed");
});

test("recipient opt-out after freezing suppresses only that side through real pre-dispatch eligibility", async t => {
  const f = fixture(t);
  f.state.onCall = call => { if (call.apiName === "/internal/communications") f.db.Employee[1].transferNotificationPreferences.IN_APP = false; };
  const result = await f.run();
  assert.deepEqual(result.outcomes.map(row => row.status), ["DELIVERED", "SUPPRESSED"]);
  assert.deepEqual(f.db.CommsInboxMessage.map(row => row.recipientId), ["C1"]);
});

test("changed Enterprise roster cannot readdress frozen intent on a retry", async t => {
  const f = fixture(t); let unavailable = true;
  f.state.onCall = call => { if (unavailable && call.apiName === "/internal/communications") throw Error("transport unavailable"); };
  assert.equal((await f.run()).status, "UNCONFIRMED");
  f.db.Enterprise[1].transferNotificationRecipients = [{ employeeCode: "U3" }]; unavailable = false;
  const result = await f.run();
  assert.deepEqual(result.outcomes.map(row => row.status), ["DELIVERED", "SUPPRESSED"]);
  assert.equal(f.db.CommsIntent.some(row => row.recipientId === "profile-employee:U3"), false);
});

test("failed first-side request does not prevent the second side from recording delivery", async t => {
  const f = fixture(t);
  f.state.onCall = call => { if (call.apiName === "/internal/communications" && call.requestBody.recipientId === "C1") throw Error("unavailable"); };
  const result = await f.run();
  assert.deepEqual(result.outcomes.map(row => row.status), ["UNCONFIRMED", "DELIVERED"]);
  assert.deepEqual(f.db.CommsInboxMessage.map(row => row.recipientId), ["profile-employee:U2"]);
});

test("missing or mismatched canonical credit never establishes committed source evidence", async t => {
  const f = fixture(t); f.db.RewardLedgerEntry[1].metadata.debitEntryCode = "FOREIGN";
  assert.equal((await f.run()).status, "UNCONFIRMED");
  assert.equal(f.state.writes.length, 0); assert.equal(f.db.CommsIntent.length, 0);
});

test("recipient source proof is read twice and a changed side refuses without blocking the other owner", async t => {
  const f = fixture(t); let calls = 0;
  f.state.onResponse = (call, result) => { if (call.apiName.endsWith("notification-source") && ++calls === 2) result.sourceDigest = "0".repeat(64); };
  assert.equal((await f.run()).status, "UNCONFIRMED");
  assert.deepEqual(f.row.notificationPlan.resolvedSides, ["RECIPIENT"]);
  assert.deepEqual(f.db.CommsInboxMessage.map(row => row.recipientId), ["profile-employee:U2"]);
  assert.equal((await f.run()).status, "RECORDED");
  assert.equal(f.db.CommsInboxMessage.length, 2);
});

test("Profile route is private and recipient service rejects forged/incomplete runtime authority", async t => {
  const f = fixture(t);
  const route = require(root + "nodics.platform/modules/profile/src/router/routers").profile.transferNotificationRecipients.resolve;
  assert.equal(route.key, "/internal/transfers/notification-recipients"); assert.deepEqual(route.authTokenTypes, ["service"]);
  assert.equal(route.permission, "profile.transfer.notification.recipient.resolve"); assert.equal(route.requestPrivacy.sensitive, true);
  for (const change of [r => { r.authData = copy(f.request.authData); }, r => { delete r.authData.runtimeScope; },
    r => { r.authData.modules = ["profile"]; }, r => { r.authData.permissions = []; },
    r => { r.authData.permissions = "profile.transfer.notification.recipient.resolve"; }, r => { r.tenant = "foreign"; },
    r => { r.payload.source.ownerCode = "C3"; }, r => { r.payload.channel = "EMAIL"; },
    r => { r.enterpriseCode = "foreign"; }, r => { r.tenantCode = "foreign"; },
    r => { r.httpRequest = { headers: { "x-enterprise-code": "foreign" } }; },
    r => { r.httpRequest = { query: { recipient: "U3" } }; },
    r => { r.body = { source: { operationCode: "OTHER", side: "SENDER" }, channel: "IN_APP" }; }]) {
    const request = f.runtimeRequest({ source: { operationCode: f.row.code, side: "RECIPIENT" }, channel: "IN_APP" }); change(request);
    await assert.rejects(f.protect(request, () => profileController.resolve(request)), { code: "ERR_AUTH_00003" });
  }
  assert.equal(f.state.reads.length, 0); assert.equal(f.db.CommsIntent.length, 0);
});

test("Wallet source endpoint requires private protection, Profile delegation, exact tenant and no open transaction", async t => {
  const f = fixture(t);
  const make = () => f.runtimeRequest({ operationCode: f.row.code, side: "SENDER", channel: "IN_APP" });
  await assert.rejects(wallet.source(make()));
  for (const change of [r => { r.authData.modules = ["loyaltyApi"]; }, r => { r.authData.permissions = []; },
    r => { r.authData.permissions = "loyalty.transfer.notification.source"; },
    r => { r.tenant = "foreign"; }, r => { r.transactionContext = {}; }, r => { r.authData = copy(f.request.authData); }]) {
    const request = make(); change(request); await assert.rejects(f.protect(request, () => wallet.source(request)));
  }
  assert.equal(f.state.reads.length, 0);
});

test("foreign, duplicate or Customer-mapped Enterprise recipients fail closed without fallback", async t => {
  const f = fixture(t);
  for (const roster of [[{ ownerType: "CUSTOMER", ownerCode: "C2" }], [{ employeeCode: "U2", ownerCode: "C2" }],
    [{ employeeCode: "U2" }, { employeeCode: "U2" }]]) {
    f.db.Enterprise[1].transferNotificationRecipients = roster;
    assert.equal((await f.run()).status, "UNCONFIRMED");
  }
  f.db.Enterprise[1].transferNotificationRecipients = [{ employeeCode: "U2" }];
  f.db.Employee[1].tenant = "foreign";
  assert.equal((await f.run()).status, "UNCONFIRMED");
  assert.deepEqual(f.row.notificationPlan.resolvedSides, ["SENDER"]);
  assert.deepEqual(f.db.CommsInboxMessage.map(row => row.recipientId), ["C1"]);
});

test("missing template selection records no fake successful delivery and never uses a synthetic provider", async t => {
  const f = fixture(t); f.config.communication.templateResources.selections = {};
  const result = await f.run(); assert.equal(result.status, "UNCONFIRMED");
  assert.equal(f.db.CommsIntent.length, 0); assert.equal(f.db.CommsInboxMessage.length, 0);
  assert.deepEqual(f.config.communication.providers, {});
});

test("concurrent notify calls converge on exactly two durable intents and inbox messages", async t => {
  const f = fixture(t);
  await Promise.all([f.run(), f.run()]);
  assert.equal((await f.run()).status, "RECORDED");
  assert.equal(f.db.CommsIntent.length, 2); assert.equal(f.db.CommsInboxMessage.length, 2);
  assert.equal(new Set(f.row.notificationPlan.entries.map(row => row.intentCode)).size, 2);
});

test("unknown dispatch proof retains ACCEPTED intents; pointer recovery and inspection never retry delivery", async t => {
  const f = fixture(t);
  f.state.onCall = call => {
    if (f.db.CommsIntent.length && call.apiName.endsWith("notification-recipients")) throw Error("source unavailable");
  };
  assert.equal((await f.run()).status, "UNCONFIRMED");
  assert.equal(f.db.CommsIntent.length, 2); assert.equal(f.db.CommsInboxMessage.length, 0);
  f.state.onCall = undefined;
  for (let replay = 0; replay < 2; replay++) {
    const result = await f.run();
    assert.equal(result.status, "RECORDED");
    assert.deepEqual(result.outcomes.map(row => row.status), ["ACCEPTED", "ACCEPTED"]);
  }
  assert.equal(f.db.CommsDeliveryAttempt.length, 0); assert.equal(f.db.CommsInboxMessage.length, 0);
});

test("zero-match receipt CAS cannot authorize dispatch of an unpersisted plan", async t => {
  const f = fixture(t);
  SERVICE.DefaultRewardTransferOperationService.update = async () => ({ code: "SUC_WRITE", result: { matchedCount: 0 } });
  assert.equal((await f.run()).status, "UNCONFIRMED");
  assert.equal(f.row.notificationPlan, undefined); assert.equal(f.db.CommsIntent.length, 0);
});

test("failed generated reads cannot become missing records or authorize source proof", async t => {
  const f = fixture(t);
  f.state.onRead = (name, result) => { if (name === "RewardLedgerEntry") result.code = "ERR_STORAGE"; };
  assert.equal((await f.run()).status, "UNCONFIRMED");
  assert.equal(f.state.writes.length, 0); assert.equal(f.db.CommsIntent.length, 0);
});

test("original participant scope cannot change across Profile admission", async t => {
  const f = fixture(t);
  f.state.onCall = call => { if (call.apiName === "/customer/identity") f.request.authorization = "Bearer substituted"; };
  assert.equal((await f.run()).status, "UNCONFIRMED");
  assert.equal(f.state.reads.length, 0); assert.equal(f.db.CommsIntent.length, 0);
});

test("dispatch reference binds immutable source digest, not only recipient identity", async t => {
  const f = fixture(t);
  f.state.onCall = call => { if (call.apiName === "/internal/communications") f.row.completedAt = "2026-10-19T00:00:01.000Z"; };
  assert.equal((await f.run()).status, "UNCONFIRMED");
  assert.equal(f.db.CommsInboxMessage.length, 0);
  assert.ok(f.db.CommsIntent.every(row => row.status === "SUPPRESSED"));
});

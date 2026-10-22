/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const reminder = require("../src/service/defaultDigitalCommerceCouponReminderService");
const source = require("../src/service/defaultDigitalCommerceCouponAcquisitionService");
const lifecycle = require("../src/service/defaultDigitalCommerceEntitlementService");
const properties = require("../config/properties");
const registry = require("../../../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessActionAdapterRegistryService");
const delivery = require("../src/service/defaultDigitalCouponReminderDeliveryService");
const path = require("node:path"), root = path.resolve(__dirname, "../../../../../..");
const profile = require(path.join(root, "nodics.platform/modules/profile/src/service/identity/defaultProfileCouponNotificationRecipientService"));
const communication = require(path.join(root, "nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService"));
const scopes = require(path.join(root, "nodics.platform/modules/profile/src/service/identity/defaultPrincipalScopeGovernanceService"));
let saved;
test.beforeEach(() => { saved = Object.fromEntries(["CONFIG", "SERVICE", "CLASSES", "NODICS", "UTILS"].map(k => [k, global[k]])); });
test.afterEach(() => { Object.assign(global, saved); });
/** @module digitalCore/test/digitalCouponReminder @description Tests real bounded owner reads and Process adapter selection without activating a schedule or sending a message. @layer test @owner digitalCore */
/** Supplies isolated canonical coupon records to the real complete source reader. */
function fixture() {
  const config = structuredClone(properties), now = Date.now(), expiresAt = new Date(now + 3600000).toISOString();
  config.digitalCore.couponReminders.enabled = true;
  config.digitalCore.couponAcquisition.sourcePageSize = 1;
  config.process.actionAdapters.allowedActions = ["digitalCore.couponExpirySweep"];
  const policy = { version: 2, purchasedAt: new Date(now - 7200000).toISOString(),
    originalOwnerRef: { type: "CUSTOMER", code: "buyer" }, couponOffer: { expiry: { mode: "FIXED", at: expiresAt } },
    finality: { refundable: false, transferable: false, singleUse: true } };
  const item = { tenant: "t", enterpriseCode: "shop", ownerId: "login", code: "e1", status: "ACTIVE", active: true,
    digitalDeliveryType: "COUPON_CODE", providerOwner: "promotion", claimStatus: "UNCLAIMED", providerCode: "coupon",
    orderCode: "order", orderEntryCode: "entry", productCode: "product", purchasedAt: policy.purchasedAt, validTo: expiresAt, purchasePolicy: policy };
  const coupon = { tenant: "t", enterpriseCode: "shop", soldTo: "login", code: "coupon", orderCode: "order", entryCode: "entry",
    productCode: "product", active: true, status: "DELIVERED", benefitStatus: "UNCLAIMED", soldAt: policy.purchasedAt,
    validTo: expiresAt, purchasePolicy: structuredClone(policy) };
  const db = { DefaultDigitalEntitlementService: [item],
    DefaultCheckoutCheckpointService: [{ tenant: "t", enterpriseCode: "shop", ownerId: "login", code: "order", orderCode: "order", status: "COMPLETED",
      evidence: { orderCode: "order", digitalDeliveryCodes: ["coupon"] } }],
    DefaultDigitalDeliveryService: [{ tenant: "t", enterpriseCode: "shop", ownerId: "login", code: "delivery", entitlementCode: "e1",
      orderCode: "order", providerCode: "coupon", deliveryType: "COUPON_CODE", status: "DELIVERED", active: true,
      deliveredAt: new Date(now - 3600000).toISOString() }] };
  const r = { tenant: "t", authData: { tenant: "t", enterpriseCode: "shop", principalType: "service",
    modules: ["workflow", "digitalCore"], permissions: ["commerce.digital.notification.read"] } };
  const context = { source: "cronjob", cronJobTenant: "t", cronJobCode: "expiry", firedAt: new Date(now).toISOString() };
  const execution = { instance: { code: "instance", tenant: "t", context }, context,
    node: { action: { moduleName: "digitalCore", operation: "couponExpirySweep" } }, payload: {} };
  const reads = [];
  global.CONFIG = { get: name => config[name] };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.SERVICE = { DefaultDigitalCommerceCouponReminderService: reminder,
    DefaultDigitalCouponReminderDeliveryService: { notify: async (_r, c) => ({ occurrenceKey: c.occurrenceKey, status: "SKIPPED", deliveryAttempted: false }) },
    DefaultDigitalCommerceCouponAcquisitionService: source, DefaultDigitalCommerceEntitlementService: lifecycle,
    DefaultCouponOfferService: { validate: value => value },
    DefaultServiceTokenService: { requireRuntimePrincipal: input => input.authData },
    DefaultIdentityGovernanceService: { getSystemAuthData: async () => ({ isSystem: true }) },
    DefaultPromotionOperationService: { readLifecycleCoupon: async () => structuredClone(coupon) } };
  for (const name of Object.keys(db)) SERVICE[name] = { get: async input => {
    reads.push(input);
    const rows = db[name].filter(row => Object.entries(input.query).every(([k, v]) => row[k] === v)).sort((a, b) => a.code.localeCompare(b.code));
    const offset = (input.searchOptions.pageNumber - 1) * input.searchOptions.pageSize;
    return { code: "SUC_READ", count: rows.length, result: structuredClone(rows.slice(offset, offset + input.searchOptions.pageSize)) };
  } };
  return { config, r, execution, item, coupon, db, reads };
}
test("owner defaults remain inert and unselected; no source reads or schedule registration", async () => {
  const f = fixture(); f.config.digitalCore.couponReminders.enabled = false;
  assert.equal(properties.process.actionAdapters.allowedActions, undefined);
  assert.equal((await registry.execute(f.r, f.execution)).output.sourceStatus, "DISABLED");
  assert.equal(f.reads.length, 0);
});

/** Composes real Digital, Profile, scope resolution, template rendering and Communication delivery with isolated storage/transport only. */
function composed() {
  const f = fixture(), cfg = f.config;
  global.UTILS = { isObject: value => value !== null && typeof value === "object" };
  cfg.defaultTenant = "master";
  cfg.runtimeRole = { code: "COMMERCE" };
  cfg.profileCouponNotifications = structuredClone(require(path.join(root, "nodics.platform/modules/profile/config/properties")).profileCouponNotifications);
  cfg.profileCouponNotifications.enabled = true;
  cfg.profileNotificationRecipients = structuredClone(require(path.join(root, "nodics.platform/modules/profile/config/properties")).profileNotificationRecipients);
  cfg.communication = structuredClone(require(path.join(root, "nodics.communication/modules/commsCore/config/properties")).communication);
  cfg.communication.dispatchEligibilityOwners = structuredClone(properties.communication.dispatchEligibilityOwners);
  cfg.communication.trustedSourceModules = ["digitalCore"];
  cfg.communication.templateResources.selections.DIGITAL_COUPON_EXPIRING_IN_APP = true;
  const runtimeScope = { projectCode: "project", environmentCode: "unit", serverCode: "profile", instanceCode: "instance", assignmentCode: "grant" };
  cfg.digitalCore.couponReminders.sourceCallers = [{ tenant: "t", principalEnterpriseCode: "runtime", enterpriseCode: "shop", serviceId: "profile-runtime", ...runtimeScope }];
  const privateRequests = new WeakSet(), stores = {}, calls = [];
  const customer = { code: "buyer", tenant: "t", active: true, principalType: "customer", couponReminderPreferences: { IN_APP: true } };
  const enterprise = { code: "owning-business", tenant: "t", active: true, couponReminderPreferences: { IN_APP: true }, couponReminderRecipients: [{ employeeCode: "staff" }] };
  const employee = { code: "staff", loginId: "staff-login", tenant: "t", active: true, principalType: "human", enterpriseCode: enterprise.code,
    couponReminderPreferences: { IN_APP: true }, userGroups: ["coupon-reader"] };
  const groups = [{ code: "coupon-reader", active: true, parentGroups: ["digital-reader"], permissions: [] },
    { code: "digital-reader", active: true, parentGroups: [], permissions: ["commerce.digital.own.read"] }];
  const permissions = [{ code: "commerce.digital.own.read", active: true }];
  const assignments = [{ code: "allow", active: true, status: "ACTIVE", principalType: "human", principalCode: employee.loginId,
    scopeType: "ENTERPRISE", scopeCode: enterprise.code, enterpriseCode: enterprise.code, permissionCode: "commerce.digital.own.read", capabilityCode: "digitalCore", effect: "ALLOW" }];
  Object.assign(SERVICE, {
    DefaultDigitalCouponReminderDeliveryService: delivery,
    DefaultProfileCouponNotificationRecipientService: profile,
    DefaultProfileNotificationRecipientService: require(path.join(root, "nodics.platform/modules/profile/src/service/identity/defaultProfileNotificationRecipientService")),
    DefaultIdentityCatalogueService: {
      ...require(path.join(root, "nodics.platform/modules/profile/src/service/identity/defaultIdentityCatalogueService")),
      rows: async (name, query) => {
        assert.equal(name, "DefaultPermissionService");
        return structuredClone(permissions.filter(row => query.code.$in.includes(row.code)));
      },
    },
    DefaultUserGroupGovernanceService: require(path.join(root, "nodics.platform/modules/profile/src/service/group/defaultUserGroupGovernanceService")),
    DefaultSecuredRequestPipelineService: require(path.join(root, "nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService")),
    DefaultProfileCommerceNotificationRecipientService: require(path.join(root, "nodics.platform/modules/profile/src/service/customer/defaultProfileCommerceNotificationRecipientService")),
    DefaultPrincipalScopeGovernanceService: { ...scopes, getPolicy: () => ({ maximumAssignmentsPerPrincipal: 100 }) },
    DefaultPrincipalScopeAssignmentService: { get: async () => ({ code: "SUC_READ", result: structuredClone(assignments) }) },
    DefaultEnterpriseMembershipService: {
      resolve: async row => { if (f.locked) throw new Error("identity locked"); return { person: row,
        identity: { tenantCode: "t", recordKind: row.principalType === "human" ? "EMPLOYEE" : "CUSTOMER", recordId: row.code } }; },
      authority: () => "master", inventory: async () => [],
    },
    DefaultEnterpriseRegistrationService: { read: async (name, partition, query) => {
      calls.push({ name, partition, query });
      const row = name === "DefaultUserGroupService" ? groups.find(g => g.code === query.code)
        : name === "DefaultEnterpriseService" ? enterprise : name === "DefaultEmployeeService" ? employee : customer;
      assert.equal(partition, name === "DefaultEnterpriseService" ? "master" : "t");
      return row?.code === query.code ? structuredClone(row) : undefined;
    } },
    DefaultLoggerService: { runSensitiveOperation: async (r, fn) => { privateRequests.add(r); return fn(); },
      assertSensitiveRequest: r => assert(privateRequests.has(r)) },
    DefaultCommunicationRuntimeService: communication,
    DefaultCommunicationCoreService: require(path.join(root, "nodics.communication/modules/commsCore/src/service/defaultCommunicationCoreService")),
    DefaultCommunicationTemplateService: require(path.join(root, "nodics.communication/modules/commsCore/src/service/defaultCommunicationTemplateService")),
  });
  const digitalModule = { name: "digitalCore", path: path.resolve(__dirname, "..") };
  global.NODICS = { getSelectedEnvironmentName: () => "unit", getIndexedModules: () => new Map([["digitalCore", digitalModule]]), getRawModule: () => digitalModule };
  for (const schema of ["CommsIntent", "CommsDeliveryAttempt", "CommsInboxMessage", "CommsSuppression"]) {
    stores[schema] = new Map();
    SERVICE["Default" + schema + "Service"] = {
      get: async ({ tenant, query }) => ({ code: "SUC_READ", result: [...stores[schema].values()].filter(row => row.tenant === tenant &&
        Object.entries(query).every(([k, v]) => row[k] === v)).map(row => structuredClone(row)) }),
      save: async ({ tenant, model }) => {
        if (schema === "CommsInboxMessage" && f.inboxFailure) throw new Error("inbox unavailable");
        const key = tenant + model.code;
        if (stores[schema].has(key)) throw new Error("duplicate");
        stores[schema].set(key, { ...structuredClone(model), tenant, revision: 1 });
        return { code: "SUC_SAVE", result: structuredClone(stores[schema].get(key)) };
      },
      update: async ({ tenant, query, model }) => {
        const row = stores[schema].get(tenant + query.code);
        if (!row || row.revision !== query.revision) throw new Error("CAS failed");
        Object.assign(row, structuredClone(model), { revision: row.revision + 1 });
        return { code: "SUC_UPDATE", result: { matchedCount: 1 } };
      },
    };
  }
  const auth = { principalType: "service", tenant: "t", entCode: "runtime", modules: ["profile", "digitalCore", "commsApi"],
    permissions: ["commerce.digital.notification.read", "profile.commerce.notification.recipient.resolve"],
    serviceId: "profile-runtime", runtimeScope, runtimeInstanceId: "instance" };
  const trusted = body => ({ tenant: "t", entCode: "runtime", authData: structuredClone(auth), body: structuredClone(body) });
  const transport = async call => {
    assert.equal(call.requireInternalAuth, true); assert.equal(call.header, undefined);
    assert.equal(call.secureTransport.required, true);
    if (call.moduleName === "profile") {
      if (f.profileFailure) throw new Error("Profile unavailable");
      const r = trusted(call.requestBody);
      return { data: await SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => profile.resolve(r)) };
    }
    if (call.moduleName === "digitalCore") {
      const r = trusted(call.requestBody);
      f.sourceReads = (f.sourceReads || 0) + 1;
      f.onSourceRead?.(f.sourceReads);
      return { data: await SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => reminder.source(r)) };
    }
    assert.equal(call.moduleName, "commsApi");
    assert.equal(call.apiName, "/internal/communications");
    const result = await communication.request(trusted({}), call.requestBody);
    if (f.lostAck) throw new Error("lost acknowledgement");
    return { data: result };
  };
  SERVICE.DefaultModuleService = { invokeModule: transport };
  return Object.assign(f, { customer, enterprise, employee, groups, permissions, assignments, stores, calls, trusted, transport });
}

test("real sweep -> Profile callback -> Communication template and inbox delivers once across scans and lost acknowledgement", async () => {
  const f = composed(), before = structuredClone([f.item, f.coupon]);
  f.lostAck = true;
  assert.equal((await registry.execute(f.r, f.execution)).output.sourceStatus, "UNCONFIRMED");
  assert.equal(f.stores.CommsInboxMessage.size, 1);
  f.lostAck = false;
  const result = await registry.execute(f.r, f.execution);
  assert.equal(result.output.outcomes[0].outcomes[0].status, "DELIVERED");
  assert.equal(f.stores.CommsIntent.size, 1); assert.equal(f.stores.CommsDeliveryAttempt.size, 1);
  const inbox = [...f.stores.CommsInboxMessage.values()][0];
  assert.equal(inbox.recipientId, "buyer"); assert.match(inbox.body, /e1/);
  assert.equal(inbox.body.includes("login"), false);
  assert.deepEqual([f.item, f.coupon], before);
});

test("Enterprise reminders target only explicitly selected currently authorized Employee inboxes, not the purchaser", async () => {
  const f = composed();
  f.item.purchasePolicy.originalOwnerRef = f.coupon.purchasePolicy.originalOwnerRef = { type: "ENTERPRISE", code: f.enterprise.code };
  const result = await registry.execute(f.r, f.execution);
  assert.equal(result.output.outcomes[0].outcomes[0].status, "DELIVERED");
  assert.equal([...f.stores.CommsInboxMessage.values()][0].recipientId, "profile-employee:staff");
  assert.equal(JSON.stringify(result).includes("staff-login"), false);
  assert.ok(f.calls.some(call => call.name === "DefaultUserGroupService" && call.query.code === "digital-reader"));
});

test("missing or invalid persisted recipient permission evidence stays unconfirmed, never a successful empty roster", async () => {
  for (const kind of ["MISSING_GROUP", "INACTIVE_PERMISSION", "CYCLE"]) {
    const f = composed();
    f.item.purchasePolicy.originalOwnerRef = f.coupon.purchasePolicy.originalOwnerRef = { type: "ENTERPRISE", code: f.enterprise.code };
    if (kind === "MISSING_GROUP") f.groups.pop();
    if (kind === "INACTIVE_PERMISSION") f.permissions[0].active = false;
    if (kind === "CYCLE") f.groups[1].parentGroups = ["coupon-reader"];
    const result = (await registry.execute(f.r, f.execution)).output.outcomes[0];
    assert.equal(result.status, "UNCONFIRMED", kind);
    assert.equal(f.stores.CommsIntent.size, 0);
    assert.equal(f.stores.CommsInboxMessage.size, 0);
  }
});

test("no opted-in eligible recipient is a recorded skip; unavailable Profile remains uncertainty", async () => {
  for (const kind of ["CUSTOMER_OPTOUT", "NO_ROSTER", "STAFF_OPTOUT", "INACTIVE", "FOREIGN", "DENIED", "NO_ALLOW", "NO_PERMISSION", "UNAVAILABLE"]) {
    const f = composed();
    if (kind === "CUSTOMER_OPTOUT") f.customer.couponReminderPreferences.IN_APP = false;
    else {
      f.item.purchasePolicy.originalOwnerRef = f.coupon.purchasePolicy.originalOwnerRef = { type: "ENTERPRISE", code: f.enterprise.code };
      if (kind === "NO_ROSTER") delete f.enterprise.couponReminderRecipients;
      if (kind === "STAFF_OPTOUT") f.employee.couponReminderPreferences.IN_APP = false;
      if (kind === "INACTIVE") f.employee.active = false;
      if (kind === "FOREIGN") f.assignments[0].scopeCode = "other";
      if (kind === "DENIED") f.assignments.push({ ...f.assignments[0], code: "deny", effect: "DENY", permissionCode: "*" });
      if (kind === "NO_ALLOW") f.assignments.length = 0;
      if (kind === "NO_PERMISSION") f.groups[1].permissions = [];
      if (kind === "UNAVAILABLE") f.profileFailure = true;
    }
    const result = (await registry.execute(f.r, f.execution)).output.outcomes[0];
    assert.equal(result.status, kind === "UNAVAILABLE" ? "UNCONFIRMED" : "SKIPPED", kind);
    if (kind !== "UNAVAILABLE") assert.equal(result.reason, "NO_ELIGIBLE_RECIPIENT");
    assert.equal(f.stores.CommsIntent.size, 0);
  }
});

test("Communication retries frozen reminders without duplicate inbox and suppresses newly used coupons or revoked recipient authority", async () => {
  for (const change of ["NONE", "REDEEMED", "OPTOUT", "REMOVED", "DENIED", "PERMISSION_REVOKED", "EXPIRED"]) {
    const f = composed();
    f.item.purchasePolicy.originalOwnerRef = f.coupon.purchasePolicy.originalOwnerRef = { type: "ENTERPRISE", code: f.enterprise.code };
    f.inboxFailure = true;
    const result = (await registry.execute(f.r, f.execution)).output.outcomes[0].outcomes[0];
    assert.equal(result.status, "RETRY_PENDING");
    const intent = [...f.stores.CommsIntent.values()][0], original = structuredClone(intent.renderedContent);
    f.inboxFailure = false; intent.nextAttemptAt = new Date(0);
    if (change === "REDEEMED") f.coupon.benefitStatus = "REDEEMED";
    if (change === "OPTOUT") f.employee.couponReminderPreferences.IN_APP = false;
    if (change === "REMOVED") f.enterprise.couponReminderRecipients = [];
    if (change === "DENIED") f.assignments.push({ ...f.assignments[0], code: "deny", effect: "DENY" });
    if (change === "PERMISSION_REVOKED") f.groups[1].permissions = [];
    if (change === "EXPIRED") intent.expiresAt = new Date(0).toISOString();
    const retried = await communication.retry(f.trusted({}), result.intentCode);
    assert.equal(retried.status, change === "NONE" ? "DELIVERED" : change === "EXPIRED" ? "CANCELLED" : "SUPPRESSED", change);
    assert.equal(f.stores.CommsIntent.size, 1);
    assert.equal(f.stores.CommsInboxMessage.size, change === "NONE" ? 1 : 0);
    assert.deepEqual(intent.renderedContent, original);
  }
});

test("source and roster drift at final dispatch cannot create an inbox or readdress the frozen intent", async () => {
  const f = composed();
  f.onSourceRead = n => { if (n === 7) f.customer.couponReminderPreferences.IN_APP = false; };
  const result = await registry.execute(f.r, f.execution);
  assert.equal(f.stores.CommsInboxMessage.size, 0);
  assert.equal(result.output.outcomes[0].outcomes[0].status, "SUPPRESSED");
});

test("private source callback rejects foreign runtime assignment, source body authority, aliases and absent grant", async () => {
  for (const mutation of [r => { r.authData.runtimeScope.assignmentCode = "other"; }, r => { r.body.ownerRef = { type: "CUSTOMER", code: "other" }; },
    r => { r.enterpriseCode = "shop"; }, r => { r.body.enterpriseCode = "other"; }, r => { r.authData.permissions = []; }]) {
    const f = composed(), candidate = (await reminder.candidates({ tenant: "t", enterpriseCode: "shop" }, Date.now(), reminder.settings()))[0];
    const r = f.trusted({ enterpriseCode: "shop", entitlementCode: "e1", occurrenceKey: candidate.occurrenceKey, channel: "IN_APP" });
    mutation(r);
    await assert.rejects(SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => reminder.source(r)));
    assert.equal(f.stores.CommsIntent.size, 0);
  }
});
test("selected Process action scans persisted units and returns stable typed source identities, never contacts or delivery success", async () => {
  const f = fixture();
  const first = await registry.execute(f.r, f.execution), second = await registry.execute(f.r, f.execution);
  assert.equal(first.status, "COMPLETED"); assert.equal(first.output.deliveryAttempted, false);
  assert.deepEqual(first.output.candidates, second.output.candidates);
  assert.deepEqual(first.output.candidates[0].ownerRef, { type: "CUSTOMER", code: "buyer" });
  assert.equal("recipientAddressReference" in first.output.candidates[0], false);
  assert.ok(f.reads.every(r => r.query.tenant === "t" && r.query.enterpriseCode === "shop" && r.authData.isSystem));
  f.item.purchasePolicy.originalOwnerRef = f.coupon.purchasePolicy.originalOwnerRef = { type: "ENTERPRISE", code: "owner-enterprise" };
  assert.equal((await registry.execute(f.r, f.execution)).output.candidates[0].ownerRef.code, "owner-enterprise");
});
test("no-expiry, used, expired and outside-window coupons never produce reminders", async () => {
  for (const mode of ["NONE", "USED", "EXPIRED", "LATER"]) {
    const f = fixture();
    if (mode === "USED") f.coupon.benefitStatus = "REDEEMED";
    else if (mode === "NONE") {
      for (const value of [f.item, f.coupon]) { value.purchasePolicy.couponOffer.expiry = { mode: "NONE" }; delete value.validTo; }
    } else {
      const at = new Date(Date.now() + (mode === "EXPIRED" ? -10000 : 172800000)).toISOString();
      for (const value of [f.item, f.coupon]) { value.validTo = at; value.purchasePolicy.couponOffer.expiry.at = at; }
    }
    assert.deepEqual((await registry.execute(f.r, f.execution)).output.candidates, []);
  }
});
test("wrong actor, tenant, scope, forged provenance and arbitrary payload reject before persistence", async () => {
  for (const mutate of [f => { f.r.authData.principalType = "human"; }, f => { f.r.enterpriseCode = "other"; },
    f => { f.execution.context.cronJobTenant = "other"; }, f => { f.execution.context.firedAt = new Date(0).toISOString(); },
    f => { f.r.authData.permissions = []; }, f => { f.execution.payload = { service: "Injected" }; }]) {
    const f = fixture(); mutate(f); await assert.rejects(registry.execute(f.r, f.execution)); assert.equal(f.reads.length, 0);
  }
});
test("missing committed proof, mismatched owners and failed generated envelopes do not become an empty successful scan", async () => {
  for (const mutate of [f => { f.db.DefaultCheckoutCheckpointService[0].status = "PENDING"; },
    f => { f.db.DefaultDigitalDeliveryService = []; }, f => { f.coupon.soldTo = "foreign"; },
    () => { SERVICE.DefaultDigitalEntitlementService.get = async () => ({ code: "ERR_READ", count: 0, result: [] }); }]) {
    const f = fixture(); mutate(f); await assert.rejects(registry.execute(f.r, f.execution));
  }
});
test("bounded pagination includes later pages, refuses truncation, and catches lifecycle drift before returning", async () => {
  let f = fixture();
  f.db.DefaultDigitalEntitlementService.push({ ...structuredClone(f.item), code: "e2", status: "REVOKED" });
  assert.equal((await registry.execute(f.r, f.execution)).output.candidates.length, 1);
  assert.ok(f.reads.some(r => r.searchOptions.pageNumber === 2));
  f.config.digitalCore.couponAcquisition.maximumSourcePages = 1;
  await assert.rejects(registry.execute(f.r, f.execution));
  f = fixture(); let calls = 0;
  SERVICE.DefaultPromotionOperationService.readLifecycleCoupon = async () => {
    if (++calls === 2) f.coupon.benefitStatus = "REDEEMED";
    return structuredClone(f.coupon);
  };
  await assert.rejects(registry.execute(f.r, f.execution));
});
test("invalid and missing framework defaults reject rather than enabling fallback values", async () => {
  const f = fixture(); delete f.config.digitalCore.couponReminders.maximumCandidates;
  await assert.rejects(registry.execute(f.r, f.execution));
});

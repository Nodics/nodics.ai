/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const service = require("../src/service/identity/defaultProfileCouponNotificationRecipientService");
const registration = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
/** @module profile/test/profileCouponNotificationRecipients @description Tests coupon source/recipient admission over real Profile generated read envelopes, without runtime credentials or external delivery. @layer test @owner profile */
/** Installs exact source proof and isolated generated identities behind the real Profile record reader. */
function fixture(t) {
  const previous = Object.fromEntries(["CONFIG", "SERVICE", "CLASSES"].map(k => [k, global[k]]));
  t.after(() => Object.assign(global, previous));
  const config = { ...structuredClone(require("../config/properties")), defaultTenant: "master" };
  const policy = config.profileCouponNotifications;
  policy.enabled = true;
  const input = { source: { enterpriseCode: "shop", entitlementCode: "entitlement", occurrenceKey: "COUPON_EXPIRY_" + "a".repeat(64) }, channel: "IN_APP" };
  const request = { tenant: "t", entCode: "runtime", body: structuredClone(input), authData: { tenant: "t", entCode: "runtime", principalType: "service",
    modules: ["profile", "digitalCore"], permissions: [policy.permission] } };
  const proof = { contractVersion: 1, tenant: "t", sourceModule: "digitalCore", sourceType: "DIGITAL_COUPON_EXPIRING",
    source: { ...input.source, channel: input.channel }, eligible: true, ownerRef: { type: "CUSTOMER", code: "customer" },
    expiresAt: new Date(Date.now() + 60000).toISOString() };
  const person = { code: "customer", active: true, principalType: "customer", couponReminderPreferences: { IN_APP: true } };
  const state = { calls: 0, reads: 0, person, proof, policy, request };
  global.CONFIG = { get: k => config[k] };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.SERVICE = {
    DefaultServiceTokenService: { requireRuntimePrincipal: r => r.authData },
    DefaultLoggerService: { assertSensitiveRequest() {}, runSensitiveOperation: async (_r, fn) => fn() },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultEnterpriseRegistrationService: registration,
    DefaultProfileNotificationRecipientService: require("../src/service/identity/defaultProfileNotificationRecipientService"),
    DefaultProfileCommerceNotificationRecipientService: require("../src/service/customer/defaultProfileCommerceNotificationRecipientService"),
    DefaultEnterpriseMembershipService: { resolve: async () => ({ person }) },
    DefaultCustomerService: { get: async r => {
      state.reads++; assert.equal(r.tenant, "t"); assert.equal(r.query.code, "customer");
      assert.equal(r.options.skipItemCache, true); state.onRead?.();
      return { code: "SUC_READ", count: 1, result: [structuredClone(person)] };
    } },
    DefaultModuleService: { invokeModule: async call => {
      state.calls++; state.onSource?.();
      assert.equal(call.apiName, "/internal/coupons/reminder-source"); assert.equal(call.requireInternalAuth, true);
      assert.equal(call.header, undefined); return { data: structuredClone(proof) };
    } },
  };
  return state;
}

test("canonical Customer opt-in uses the real generated read owner, no contact/login authority", async t => {
  const f = fixture(t), result = await service.resolve(f.request);
  assert.equal(f.calls, 2); assert.equal(f.reads, 4);
  assert.equal(result.recipients[0].recipientId, "customer");
  assert.match(result.recipients[0].recipientAddressReference, /^profile-inbox:[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(result).includes("loginId"), false);
});

test("disabled, forged actor, tenant, owner, channel or body aliases refuse before source transport", async t => {
  const mutations = [f => { f.policy.enabled = false; }, f => { f.request.authData.principalType = "human"; },
    f => { f.request.authData.isSystem = true; }, f => { f.request.authData.modules = ["profile"]; },
    f => { f.request.authData.permissions = []; }, f => { f.request.tenant = "other"; },
    f => { f.request.enterpriseCode = "shop"; }, f => { f.request.body.ownerRef = f.proof.ownerRef; },
    f => { f.request.body.channel = "EMAIL"; }, f => { f.request.payload = { forged: true }; }];
  for (const mutation of mutations) {
    const f = fixture(t); mutation(f); await assert.rejects(service.resolve(f.request)); assert.equal(f.calls, 0);
  }
});

test("current inactive source or opt-out skips without recipient substitution", async t => {
  const f = fixture(t); f.proof.eligible = false;
  assert.deepEqual((await service.resolve(f.request)).recipients, []); assert.equal(f.reads, 0);
  f.proof.eligible = true; f.person.couponReminderPreferences.IN_APP = false;
  assert.deepEqual((await service.resolve(f.request)).recipients, []);
});

test("source, policy and request mutation during await refuse rather than acknowledge a skip", async t => {
  for (const change of ["OWNER", "POLICY", "AUTH", "BODY", "PREFERENCE"]) {
    const f = fixture(t);
    if (change === "OWNER") f.onSource = () => { if (f.calls === 2) f.proof.ownerRef.code = "other"; };
    if (change === "POLICY") f.onSource = () => { f.policy.maximumRecipients++; };
    if (change === "AUTH") f.onSource = () => { f.request.authData.entCode = "other"; };
    if (change === "BODY") f.onSource = () => { f.request.body.source.entitlementCode = "other"; };
    if (change === "PREFERENCE") f.onRead = () => { if (f.reads === 2) f.person.couponReminderPreferences.IN_APP = false; };
    await assert.rejects(service.resolve(f.request), undefined, change);
  }
});

test("failed generated identity envelopes never become no eligible recipient", async t => {
  const f = fixture(t); SERVICE.DefaultCustomerService.get = async () => ({ code: "ERR_READ", result: [] });
  await assert.rejects(service.resolve(f.request));
});

test("coupon malformed occurrence or incomplete selector policy refuses before transport, and transport diagnostics are redacted", async t => {
  for (const kind of ["OCCURRENCE", "POLICY", "MODULES"]) {
    const f = fixture(t);
    if (kind === "OCCURRENCE") f.request.body.source.occurrenceKey += "\n";
    if (kind === "POLICY") delete f.policy.recipientSelection;
    if (kind === "MODULES") f.request.authData.modules = "profile,digitalCore";
    await assert.rejects(service.resolve(f.request), { message: kind === "MODULES" ? "ERR_AUTH_00003" : "ERR_PROFILE_COUPON_RECIPIENT_" + (kind === "OCCURRENCE" ? "INPUT" : "POLICY") }); assert.equal(f.calls, 0);
  }
  const f = fixture(t);
  SERVICE.DefaultModuleService.invokeModule = async () => { throw new Error("private destination and credential diagnostics"); };
  await assert.rejects(service.resolve(f.request), { message: "ERR_PROFILE_COUPON_RECIPIENT_SOURCE_RPC" });
});

test("Employee self inbox rejects body selectors, inactive principals, namespace collision and signed alias drift", async t => {
  for (const mode of ["BODY", "INACTIVE", "COLLISION", "ALIAS", "DRIFT"]) {
    fixture(t);
    const r = { tenant: "t", authData: { tenant: "t", entCode: "business", loginId: "staff", principalType: "human", tokenType: "access" } };
    SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor = async () => { if (mode === "DRIFT") r.authData.loginId = "other"; };
    SERVICE.DefaultEmployeeService = { findByLoginId: async () => ({ code: "staff", loginId: "staff", principalType: "human", active: mode !== "INACTIVE" }) };
    SERVICE.DefaultCustomerService.get = async () => ({ code: "SUC_READ", result: mode === "COLLISION" ? [{ code: "profile-employee:staff" }] : [] });
    if (mode === "BODY") r.body = { recipientId: "other" };
    if (mode === "ALIAS") r.enterpriseCode = "other";
    await assert.rejects(service.inboxIdentity(r));
  }
});

test("Employee self inbox revalidates actor after private reads and redacts dependency failures", async t => {
  for (const mode of ["SUCCESS", "REVOKED", "STORAGE", "IDENTITY"]) {
    fixture(t);
    const request = { tenant: "t", authData: { tenant: "t", entCode: "business",
      loginId: "staff", principalType: "human", tokenType: "access" } };
    let checks = 0;
    SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor = async () => {
      checks++;
      if (mode === "IDENTITY" || mode === "REVOKED" && checks === 2)
        throw new Error("private identity diagnostics");
    };
    SERVICE.DefaultEmployeeService = { findByLoginId: async () => ({
      code: "staff", loginId: "staff", principalType: "human", active: true,
    }) };
    SERVICE.DefaultCustomerService.get = async () => {
      if (mode === "STORAGE") throw new Error("private database diagnostics");
      return { code: "SUC_READ", result: [] };
    };
    if (mode === "SUCCESS") {
      assert.equal((await service.inboxIdentity(request)).recipientId, "profile-employee:staff");
      assert.equal(checks, 2);
    } else await assert.rejects(service.inboxIdentity(request), { message: "ERR_AUTH_00003" });
  }
});


test("real controller/facade, runtime admission and error registry expose only fixed private stages", async t => {
  for (const mode of ["SUCCESS", "SOURCE_RPC", "SOURCE_PROOF", "SELECTION", "BOUND", "UNADMITTED"]) {
    const f = fixture(t);
    const oldFacade = global.FACADE, oldUtils = global.UTILS;
    t.after(() => { global.FACADE = oldFacade; global.UTILS = oldUtils; });
    const definitions = { ...require("../src/utils/statusDefinitions"),
      ERR_AUTH_00003: { code: "403", message: "Access Denied" },
      ERR_SYS_00000: { code: "500", message: "Unknown error" } };
    const get = CONFIG.get;
    CONFIG.get = key => key === "defaultErrorCodes" ? { NodicsError: "ERR_SYS_00000" } : get(key);
    SERVICE.DefaultStatusService = { get: code => definitions[code] };
    global.UTILS = { isObject: value => value !== null && typeof value === "object" };
    CLASSES.NodicsError = require("../../../../nodics.foundation/modules/nCommon/src/lib/nodicsError");
    SERVICE.DefaultServiceTokenService = require("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService");
    SERVICE.DefaultProfileCouponNotificationRecipientService = service;
    global.FACADE = { DefaultProfileCouponNotificationRecipientFacade: require("../src/facade/identity/defaultProfileCouponNotificationRecipientFacade") };
    Object.assign(f.request.authData, { tokenType: "service", serviceId: "service", runtimeInstanceId: "instance",
      runtimeScope: { instanceCode: "instance", projectCode: "project", environmentCode: "unit", serverCode: "server", assignmentCode: "grant" } });
    const privateRequests = new WeakSet([f.request]);
    SERVICE.DefaultLoggerService = {
      assertSensitiveRequest: request => assert.ok(privateRequests.has(request)),
      runSensitiveOperation: async (request, work) => { privateRequests.add(request); return work(); },
    };
    let cacheControl;
    f.request.httpResponse = { setHeader: (name, value) => { assert.equal(name, "Cache-Control"); cacheControl = value; } };
    const secret = "private-contact-token-remote-cause";
    if (mode === "SOURCE_RPC") SERVICE.DefaultModuleService.invokeModule = async () => { throw Object.assign(new Error(secret), { code: "ERR_PROFILE_COUPON_RECIPIENT_SELECTION" }); };
    if (mode === "SOURCE_PROOF") f.proof.source.entitlementCode = secret;
    if (mode === "SELECTION") SERVICE.DefaultCustomerService.get = async () => { throw new Error(secret); };
    if (mode === "BOUND") f.onSource = () => { f.request.authData.entCode = secret; };
    if (mode === "UNADMITTED") delete f.request.authData.runtimeScope;
    const controller = require("../src/controller/identity/defaultProfileCouponNotificationRecipientController");
    if (mode === "SUCCESS") {
      const result = await controller.resolve(f.request);
      assert.equal(result.data.recipients[0].recipientId, "customer");
      assert.equal(f.calls, 2); assert.equal(f.reads, 4);
    } else {
      const error = await new Promise(resolve => controller.resolve(f.request, resolve));
      assert.equal(error.code, mode === "UNADMITTED" ? "ERR_AUTH_00003" : "ERR_PROFILE_COUPON_RECIPIENT_" + mode);
      assert.equal(error.responseCode, "403");
      assert.equal(error.metadata, undefined); assert.deepEqual(error.causes, []);
      assert.equal(JSON.stringify(error).includes(secret), false);
      assert.equal(error.message.includes(secret), false);
      if (mode === "UNADMITTED") assert.equal(f.calls, 0);
    }
    assert.equal(cacheControl, "no-store");
  }
});

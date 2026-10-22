/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyApi/test/loyaltyParticipantApiContract @description Distinct access-token participant routes preserve identity and private command evidence. @layer test @owner loyaltyApi */
const test = require("node:test"), assert = require("node:assert/strict");
const routes = require("../src/router/routers").loyaltyApi;
const controller = require("../src/controller/defaultLoyaltyInternalController");
test("participant routes are private, permissioned and separate from service-only accounting", () => {
  for (const route of Object.values(routes.participation)) {
    assert.equal(route.secured, true);
    assert.deepEqual(route.authTokenTypes, ["access"]);
    assert.equal(route.apiExposure, "loyaltyParticipation");
    assert.equal(route.requestPrivacy.sensitive, true);
    assert.equal(route.cache.enabled, false);
    assert.ok(route.permission.startsWith("loyalty."));
    assert.equal(typeof controller[route.operation], "function");
  }
  assert.deepEqual(routes.internal.transferRewards.authTokenTypes, ["service"]);
  assert.equal(routes.participation.partnerConversionStatus.method, "POST");
});
test("participant transport preserves original bearer/actor and delegates one confirmed command", async t => {
  const old = global.FACADE;
  t.after(() => old === undefined ? delete global.FACADE : global.FACADE = old);
  const auth = { principalType: "human", tenant: "business", entCode: "enterprise", loginId: "employee" };
  let calls = 0, cache;
  const payload = { recipient: { ownerType: "CUSTOMER", ownerCode: "recipient" }, amount: "4.00", idempotencyKey: "original", confirmed: true };
  global.FACADE = { DefaultLoyaltyInternalFacade: { participantTransfer: async request => {
    calls++; assert.equal(request.authData, auth); assert.equal(request.authorization, "Bearer original");
    assert.deepEqual(request.payload, payload);
    return { status: "COMPLETED", operationCode: "receipt" };
  } } };
  const response = await controller.participantTransfer({ tenant: "business", authData: auth,
    httpRequest: { headers: { authorization: "Bearer original" }, body: payload },
    httpResponse: { setHeader: (key, value) => { if (key === "Cache-Control") cache = value; } } });
  assert.equal(calls, 1); assert.equal(cache, "no-store");
  assert.equal(response.data.status, "COMPLETED");
  assert.equal(JSON.stringify(response).includes("Bearer"), false);
});
test("auction APIs preserve participant or scheduler identity and delegate each exact operation", async t => {
  const previous = ["SERVICE", "FACADE"].map(key => [key, global[key]]);
  t.after(() => previous.forEach(([key, value]) => value === undefined ? delete global[key] : global[key] = value));
  const facade = require("../src/facade/defaultLoyaltyInternalFacade");
  global.FACADE = { DefaultLoyaltyInternalFacade: facade };
  for (const [operation, route] of Object.entries(routes.auctionFunds)) {
    assert.deepEqual(route.authTokenTypes, ["access", "service"]);
    assert.deepEqual(route.permissions, ["commerce.bid.participate", "commerce.bid.manage"]);
    assert.equal(route.cache.enabled, false); assert.equal(route.requestPrivacy.sensitive, true);
    assert.equal(route.key, "/auction-funds/" + operation);
    const auth = { principalType: "service", tokenType: "service", tenant: "t" };
    let calls = 0;
    global.SERVICE = { DefaultLoyaltyAuctionFundsService: { [operation]: async request => {
      assert.equal(request.authData, auth); assert.equal(request.authorization, "Bearer original");
      assert.deepEqual(request.payload, { original: "command" }); calls++;
      return { confirmed: true };
    } } };
    await controller[route.operation]({ tenant: "t", authData: auth,
      httpRequest: { headers: { authorization: "Bearer original" }, body: { original: "command" } } });
    assert.equal(calls, 1);
  }
});
test("test-credit command is platform-admin-only and defaults do not activate funding", () => {
  const route = routes.participation.enterpriseTestCredit;
  assert.deepEqual(route.accessGroups, ["platformAdministratorUserGroup"]);
  assert.equal(route.permission, "loyalty.wallet.testCredit");
  const defaults = require("../../loyaltyWallet/config/properties").loyalty.enterpriseTestCredits;
  assert.equal(defaults.enabled, false); assert.deepEqual(defaults.allowedEnvironments, []);
  const schemas = require("../../loyaltyWallet/src/schemas/schemas").loyaltyWallet;
  assert.equal(schemas.rewardTestCreditOperation.router.enabled, false);
  assert.equal(schemas.rewardTestCreditOperation.backoffice.enabled, false);
  assert.equal(schemas.rewardTestCreditOperation.transaction.enabled, true);
});
test("partner choices retain the original participant and delegate an empty read selector", async t => {
  const previous = ["SERVICE", "FACADE"].map(key => [key, global[key]]);
  t.after(() => previous.forEach(([key, value]) => value === undefined ? delete global[key] : global[key] = value));
  const route = routes.participation.partnerConversionOptions;
  assert.equal(route.key, "/participant/partner-conversions/options");
  assert.equal(route.method, "POST");
  assert.equal(route.permission, "loyalty.partnerConversion.read");
  const auth = { principalType: "human", tokenType: "access", tenant: "tenant", entCode: "buyer" };
  let called = 0;
  global.FACADE = { DefaultLoyaltyInternalFacade: require("../src/facade/defaultLoyaltyInternalFacade") };
  global.SERVICE = { DefaultLoyaltyPartnerRewardConversionService: { options: async request => {
    assert.equal(request.authData, auth); assert.equal(request.authorization, "Bearer original");
    assert.deepEqual(request.payload, {}); called++;
    return { enabled: false, options: [] };
  } } };
  const result = await controller.partnerConversionOptions({ tenant: "tenant", authData: auth,
    httpRequest: { headers: { authorization: "Bearer original" }, body: {} } });
  assert.equal(called, 1); assert.equal(result.data.enabled, false);
});
test("notification proof preserves private service authority and cannot expose an accounting command", async t => {
  const previous = ["SERVICE", "FACADE"].map(key => [key, global[key]]);
  t.after(() => previous.forEach(([key, value]) => value === undefined ? delete global[key] : global[key] = value));
  const route = routes.transferNotifications.source;
  assert.deepEqual(route.authTokenTypes, ["service"]);
  assert.equal(route.permission, "loyalty.transfer.notification.source");
  assert.equal(route.requestPrivacy.sensitive, true); assert.equal(route.cache.enabled, false);
  const auth = { principalType: "service", tokenType: "service", tenant: "t" }, payload = { operationCode: "TRANSFER_original", side: "SENDER", channel: "IN_APP" };
  global.FACADE = { DefaultLoyaltyInternalFacade: require("../src/facade/defaultLoyaltyInternalFacade") };
  global.SERVICE = { DefaultLoyaltyTransferNotificationService: { source: async request => {
    assert.equal(request.authData, auth); assert.deepEqual(request.payload, payload);
    return { confirmed: true };
  } } };
  const result = await controller.transferNotificationSource({ tenant: "t", authData: auth, httpRequest: { body: payload } });
  assert.equal(result.data.confirmed, true);
});

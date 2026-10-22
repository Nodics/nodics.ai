/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module loyaltyRewardProvider/test/loyaltyRewardWalletAuthorization @description Verifies customer wallet ownership before any reservation. @layer test @owner loyaltyRewardProvider */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  provider = require("../src/service/defaultLoyaltyRewardPaymentProviderService");
const customerAuth = { tenant: "default", entCode: "default", tokenType: "access", principalType: "customer", loginId: "buyer@example.test" };
const identity = { contractVersion: 1, tenant: "default", enterpriseCode: "default", customer: { code: "canonical-customer", loginId: customerAuth.loginId } };
test.beforeEach(() => {
  const defaults = { ...require("../config/properties"),
    ...require("../../../../paymentMethods/modules/loyaltyRewardPayment/config/properties"),
    ...require("../../../../../../../../nodics.loyalty/modules/loyaltyCore/config/properties") };
  global.CONFIG = { get: key => defaults[key] };
});
test.afterEach(() => {
  delete global.SERVICE;
  delete global.CONFIG;
});
test("canonical Profile identity must match the wallet owner before payment", async () => {
  let reserved = false;
  global.SERVICE = {
    DefaultModuleService: {
      invokeModule: async (request) =>
        request.moduleName === "profile"
          ? {
              data: identity,
            }
          : request.methodName === "GET"
            ? {
                data: {
                  ownerType: "CUSTOMER",
                  ownerCode: "different-customer",
                  code: "foreign", status: "OPEN",
                },
              }
            : ((reserved = true), { reservation: { code: "R" } }),
    },
  };
  await assert.rejects(
    provider.execute({
      operation: "AUTHORIZE",
      tenant: "default",
      walletCode: "foreign",
      amount: "5",
      idempotencyKey: "test-key",
      authorization: "Bearer customer-test-token",
      authData: { ...customerAuth },
    }),
    /not available/,
  );
  assert.equal(reserved, false);
});
test("missing customer bearer fails before any remote ownership read", async () => {
  global.SERVICE = { DefaultModuleService: { invokeModule: () => assert.fail("No owner call without customer proof") } };
  await assert.rejects(provider.assertWalletOwner({ tenant: "default", authData: { ...customerAuth } }, "wallet"), /bearer authorization/);
});
test("customer bearer reaches owner reads but never payment evidence", async () => {
  const method = require("../../../../paymentMethods/modules/loyaltyRewardPayment/src/service/defaultLoyaltyRewardPaymentMethodService");
  const execution = require("../../../../paymentCore/src/service/defaultPaymentExecutionService");
  const ports = require("../../../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutPlacementPortsService");
  global.SERVICE = {
    DefaultLoyaltyRewardPaymentMethodService: method,
    DefaultExactAmountService: require("../../../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService"),
    DefaultModuleService: { invokeModule: async input => {
      if (input.moduleName === "profile") {
        assert.equal(input.header.Authorization, "Bearer customer-test-token");
        assert.equal(input.header["X-Enterprise-Code"], "default");
      } else assert.equal(input.header, undefined, "Wallet read retains the approved internal transport");
      return input.moduleName === "profile"
        ? { data: identity }
        : { data: { wallet: { code: "wallet", status: "OPEN", ownerType: "CUSTOMER", ownerCode: "canonical-customer" } } };
    } }
  };
  const prepared = ports.preparePaymentMethod({ tenant: "default", idempotencyKey: "proof", ownerId: "buyer",
    authData: { ...customerAuth },
    httpRequest: { headers: { authorization: "Bearer customer-test-token" } },
    payload: { paymentMethod: "LOYALTY_REWARD", walletCode: "wallet", authorization: "Bearer forged" }
  }, { totalAmount: "9", currency: "POINTS" });
  const result = await execution.execute({ ...prepared, operation: "AUTHORIZE" }, {
    code: "loyalty-reward-points",
    execute: async request => { await provider.assertWalletOwner(request, request.walletCode); return { status: "AUTHORIZED", reference: "reservation" }; }
  }, { find: async () => undefined, record: async value => value });
  assert.equal(result.status, "AUTHORIZED");
  assert(!JSON.stringify(result).includes("customer-test-token"));
  assert.equal(result.authorization, undefined);
});
test("missing identity cannot authorize a reward payment", async () => {
  await assert.rejects(
    provider.assertWalletOwner({ authData: {} }, "wallet"),
    /Authenticated participant/,
  );
});
test("a reference alone, foreign movement or conflicting hold state never establishes payment success", () => {
  global.SERVICE = { DefaultExactAmountService: require("../../../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService") };
  const payload = { walletCode: "wallet", programCode: "program", rewardTypeCode: "points", amount: "5.00", sourceType: "PAYMENT", sourceCode: "payment", targetType: "ORDER", targetCode: "order", idempotencyKey: "original" };
  assert.throws(() => provider.validateEvidence("AUTHORIZE", payload, { reservation: { code: "hold" } }), /accounting evidence/);
  const result = { ledgerEntry: { ...payload, entryType: "RESERVE", code: "ledger", reservationCode: "hold" }, reservation: { ...payload, code: "hold", status: "RESERVED" } };
  provider.validateEvidence("AUTHORIZE", payload, result);
  for (const key of ["walletCode", "programCode", "rewardTypeCode", "sourceCode", "targetCode", "idempotencyKey", "amount", "entryType"])
    assert.throws(() => provider.validateEvidence("AUTHORIZE", payload, { ...result, ledgerEntry: { ...result.ledgerEntry, [key]: key === "amount" ? "6.00" : "foreign" } }), /accounting evidence/);
  assert.throws(() => provider.validateEvidence("AUTHORIZE", payload, { ...result, reservation: { ...result.reservation, status: "RELEASED" } }), /reservation evidence/);
});
test("Enterprise employee pays only from the represented Enterprise with explicit scope and checkout permission", async () => {
  const request = { tenant: "default", authorization: "Bearer enterprise-token", authData: {
    ...customerAuth, principalType: "human", entCode: "enterprise-a", permissions: ["commerce.checkout.place"] } };
  let wallet = { code: "wallet", status: "OPEN", ownerType: "ENTERPRISE", ownerCode: "enterprise-a" };
  const evidence = { principalCode: customerAuth.loginId, scopes: [{ scopeType: "ENTERPRISE", scopeCode: "enterprise-a" }], deniedScopes: [] };
  global.SERVICE = {
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: r => r.authData.permissions, isPermissionGranted: (p, values) => values.includes(p) },
    DefaultModuleService: { invokeModule: async input => {
      if (input.moduleName === "profile") {
        assert.equal(input.apiName, "/identity/scopes/me");
        assert.equal(input.header.Authorization, request.authorization);
        return { data: evidence };
      }
      return { data: wallet };
    } },
  };
  await provider.assertWalletOwner(request, "wallet");
  wallet = { ...wallet, ownerType: "CUSTOMER", ownerCode: "canonical-customer" };
  await assert.rejects(provider.assertWalletOwner(request, "wallet"), /not available/);
  evidence.deniedScopes.push({ scopeType: "ENTERPRISE", scopeCode: "enterprise-a" });
  await assert.rejects(provider.assertWalletOwner(request, "wallet"), /not authorized/);
  evidence.deniedScopes.length = 0;
  request.authData.permissions = [];
  await assert.rejects(provider.assertWalletOwner(request, "wallet"), /not authorized/);
});
test("missing framework provider definitions and failed owner envelopes never synthesize defaults or success", async () => {
  global.CONFIG = { get: () => undefined };
  assert.throws(() => provider.providerConfig(), /configuration is unavailable/);
  assert.throws(() => provider.normalizeLoyaltyResponse({ data: { code: "ERR_DENIED", result: { reservation: { code: "not-proof" } } } }), /could not be confirmed/);
});
test("wildcard capability denials precede wallet reads and foreign Enterprise qualifiers never grant access", async () => {
  const request = { tenant: "default", authorization: "Bearer employee", authData: {
    ...customerAuth, principalType: "human", entCode: "enterprise-a", permissions: ["commerce.checkout.place"] } };
  const evidence = { principalCode: customerAuth.loginId,
    scopes: [{ scopeType: "ENTERPRISE", scopeCode: "enterprise-a" }], deniedScopes: [] };
  let walletReads = 0;
  global.SERVICE = {
    DefaultSecuredRequestPipelineService: require("../../../../../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService"),
    DefaultModuleService: { invokeModule: async input => {
      if (input.moduleName === "profile") {
        assert.equal(input.header.Authorization, request.authorization);
        return { data: evidence };
      }
      walletReads++;
      return { data: { code: "wallet", status: "OPEN", ownerType: "ENTERPRISE", ownerCode: "enterprise-a" } };
    } }
  };
  await provider.assertWalletOwner(request, "wallet");
  assert.equal(walletReads, 1);
  for (const [scopeType, scopeCode] of [["GLOBAL", "*"], ["TENANT", "default"], ["ENTERPRISE", "enterprise-a"]]) {
    evidence.deniedScopes = [{ scopeType, scopeCode, capabilityCode: "*", permissionCode: "commerce.checkout.place" }];
    await assert.rejects(provider.assertWalletOwner(request, "wallet"), /not authorized/);
  }
  assert.equal(walletReads, 1);
  evidence.deniedScopes = [];
  evidence.scopes = [{ scopeType: "GLOBAL", scopeCode: "*", enterpriseCode: "foreign" }];
  await assert.rejects(provider.assertWalletOwner(request, "wallet"), /not authorized/);
  const customized = { ...provider, matchesParticipantScope: () => false };
  evidence.scopes = [{ scopeType: "ENTERPRISE", scopeCode: "enterprise-a" }];
  await assert.rejects(customized.assertWalletOwner(request, "wallet"), /not authorized/);
  assert.equal(walletReads, 1);
});

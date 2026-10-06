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
test.afterEach(() => {
  delete global.SERVICE;
  delete global.CONFIG;
});
test("canonical Profile identity must match the wallet owner before payment", async () => {
  let reserved = false;
  global.CONFIG = { get: () => undefined };
  global.SERVICE = {
    DefaultModuleService: {
      invokeModule: async (request) =>
        request.moduleName === "profile"
          ? {
              data: [
                { code: "canonical-customer", loginId: "buyer@example.test" },
              ],
            }
          : request.methodName === "GET"
            ? {
                data: {
                  ownerType: "CUSTOMER",
                  ownerCode: "different-customer",
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
      authData: { principalType: "customer", loginId: "buyer@example.test" },
    }),
    /not available/,
  );
  assert.equal(reserved, false);
});
test("missing customer bearer fails before any remote ownership read", async () => {
  global.SERVICE = { DefaultModuleService: { invokeModule: () => assert.fail("No owner call without customer proof") } };
  await assert.rejects(provider.assertWalletOwner({ authData: { principalType: "customer", loginId: "buyer@example.test" } }, "wallet"), /bearer authorization/);
});
test("customer bearer reaches owner reads but never payment evidence", async () => {
  const method = require("../../../../paymentMethods/modules/loyaltyRewardPayment/src/service/defaultLoyaltyRewardPaymentMethodService");
  const execution = require("../../../../paymentCore/src/service/defaultPaymentExecutionService");
  const ports = require("../../../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutPlacementPortsService");
  global.CONFIG = { get: () => undefined };
  global.SERVICE = {
    DefaultLoyaltyRewardPaymentMethodService: method,
    DefaultModuleService: { invokeModule: async input => {
      if (input.moduleName === "profile") {
        assert.equal(input.header.Authorization, "Bearer customer-test-token");
        assert.equal(input.header["X-Enterprise-Code"], "default");
      } else assert.equal(input.header, undefined, "Wallet read retains the approved internal transport");
      return input.moduleName === "profile"
        ? { data: [{ code: "customer", loginId: "buyer@example.test" }] }
        : { data: { wallet: { ownerType: "CUSTOMER", ownerCode: "customer" } } };
    } }
  };
  const prepared = ports.preparePaymentMethod({ tenant: "default", idempotencyKey: "proof", ownerId: "buyer",
    authData: { principalType: "customer", loginId: "buyer@example.test", entCode: "default" },
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
    /Authenticated customer/,
  );
});

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
      authData: { principalType: "customer", loginId: "buyer@example.test" },
    }),
    /not available/,
  );
  assert.equal(reserved, false);
});
test("missing identity cannot authorize a reward payment", async () => {
  await assert.rejects(
    provider.assertWalletOwner({ authData: {} }, "wallet"),
    /Authenticated customer/,
  );
});

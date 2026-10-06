"use strict";

/** @module loyaltyApi/test/loyaltyWalletReadContext @description Verifies authorized wallet reads use Loyalty-owned storage context without changing the runtime credential. @layer test @owner loyaltyApi */
const test = require("node:test");
const assert = require("node:assert/strict");
const facade = require("../src/facade/defaultLoyaltyInternalFacade");
const operations = require("../../loyaltyWallet/src/service/defaultLoyaltyRewardOperationService");

test("wallet read uses the same owner storage context as reward operations", async () => {
  const authData = Object.freeze({
    principalType: "service", tenant: "tenant-a", entCode: "enterprise-a",
    userGroups: [], groups: [], permissions: ["loyalty.wallet.read"],
    runtimeScope: { serverCode: "commerceServer" },
  });
  global.SERVICE = {
    DefaultLoyaltyRewardOperationService: operations,
    DefaultLoyaltyWalletService: { get: async request => {
      assert.equal(request.tenant, "tenant-a");
      assert.equal(request.authData.entCode, "enterprise-a");
      assert.equal(request.authData.principalId, "loyaltyRewardOperationService");
      assert.deepEqual(request.authData.userGroups, ["serviceAccountUserGroup"]);
      assert.deepEqual(request.query, { code: "wallet-a" });
      assert.equal(request.pageSize, 1);
      return { code: "SUC_DBS_00000", result: [{ code: "wallet-a", ownerType: "CUSTOMER", ownerCode: "customer-a" }] };
    } },
  };
  try {
    assert.equal((await facade.wallet({ tenant: "tenant-a", authData, walletCode: "wallet-a" })).ownerCode, "customer-a");
    assert.deepEqual(authData.userGroups, []);
    assert.deepEqual(authData.permissions, ["loyalty.wallet.read"]);
    await assert.rejects(facade.wallet({ tenant: "tenant-a", authData }), /walletCode is required/);
  } finally {
    delete global.SERVICE;
  }
});

/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module loyaltyWallet/test/loyaltyWalletProjectionPaging @description Verifies recent ledger projection paging and owner isolation through generated reads. @layer test @owner loyaltyWallet */
const assert = require("node:assert/strict");
const walletService = require("../src/service/defaultLoyaltyWalletOperationService");
const operations = require("../src/service/defaultLoyaltyRewardOperationService");

async function main() {
  const records = Array.from({ length: 120 }, (_, index) => ({
    code: `entry-${String(index).padStart(3, "0")}`,
    walletCode: "wallet-a",
    postedAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
  }));
  records.push({
    code: "private-other-owner",
    walletCode: "wallet-b",
    postedAt: "2027-01-01",
  });
  const context = {
    tenant: "tenant-from-auth",
    authData: { principalType: "service" },
    payload: { ownerType: "CUSTOMER", ownerCode: "customer-a" },
  };
  global.SERVICE = {
    DefaultLoyaltyRewardOperationService: operations,
    DefaultLoyaltyWalletService: {
      get: async (request) => {
        assert.equal(request.tenant, context.tenant);
        assert.deepEqual(request.query, {
          ownerType: "CUSTOMER",
          ownerCode: "customer-a",
        });
        return { result: [{ code: "wallet-a" }] };
      },
    },
    DefaultLoyaltyWalletRewardBalanceService: {
      get: async () => ({ result: [] }),
    },
    DefaultRewardLedgerEntryService: {
      get: async (request) => {
        assert.equal(request.tenant, context.tenant);
        assert.deepEqual(request.query, { walletCode: "wallet-a" });
        assert.deepEqual(request.searchOptions, {
          pageSize: 100,
          pageNumber: 1,
          sort: { postedAt: -1, code: -1 },
        });
        return {
          result: records
            .filter((row) => row.walletCode === request.query.walletCode)
            .sort(
              (a, b) =>
                b.postedAt.localeCompare(a.postedAt) ||
                b.code.localeCompare(a.code),
            )
            .slice(0, request.searchOptions.pageSize),
        };
      },
    },
  };
  const result = await walletService.projection(context);
  assert.equal(result.entries.length, 100);
  assert.equal(result.entries[0].code, "entry-119");
  assert.equal(result.entries.at(-1).code, "entry-020");
  assert.equal(
    result.entries.some((row) => row.walletCode !== "wallet-a"),
    false,
  );
  console.log("Loyalty recent ledger projection and owner isolation passed");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

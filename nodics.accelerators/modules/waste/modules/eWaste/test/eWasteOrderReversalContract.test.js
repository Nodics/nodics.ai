/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/test/eWasteOrderReversalContract @description Verifies original buyer identity mapping, service-only execution and exact original sale ledger reversal precision. @layer test @owner eWaste */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  service = require("../src/service/defaultEWasteOrderReversalService");
const event = {
  code: "sale",
  assetCode: "asset",
  toOwnerRef: { code: "customer-code" },
  metadata: { rewardPrice: 4 },
  rewardSettlementRefs: [{ code: "seller-proceeds" }],
  carbonSettlementRefs: [
    { code: "seller-carbon-debit" },
    { code: "buyer-carbon-credit" },
  ],
};
let customers, calls;
test.beforeEach(() => {
  customers = [{ code: "customer-code" }];
  calls = [];
  global.SERVICE = {
    DefaultWastePersistenceService: {
      list: async () => [event],
      one: async () => ({ metadata: { refundCode: "refund" } }),
    },
    DefaultWasteAssetReversalOperationService: { code: () => "reversal" },
    DefaultEWasteExperienceService: {
      settings: () => ({
        marketplace: {
          refundsEnabled: true,
          orderCodePrefix: "ORDER_",
          rewardScale: 2,
          carbonScale: 3,
        },
      }),
      unwrap: (v) => v,
      remote: async (r, connection, module, path, method, body) => {
        if (module === "profile") {
          assert.deepEqual(body.query, {
            $or: [{ code: "buyer@login" }, { loginId: "buyer@login" }],
          });
          return customers;
        }
        calls.push({ path, body, key: r.idempotencyKey });
        return { ledgerEntry: { code: "reverse-" + calls.length } };
      },
    },
  };
});
const input = () => ({
  authData: { principalType: "service" },
  payload: {
    ownerId: "buyer@login",
    orderCode: "ORDER_1",
    refundCode: "refund",
    totalAmount: "4.00",
  },
});
test("Commerce login identity resolves to the original Profile customer before reversal", async () => {
  assert.equal((await service.sale(service.context(input()))).code, "sale");
  customers = [{ code: "other" }];
  await assert.rejects(
    service.sale(service.context(input())),
    /does not match/,
  );
  customers = [{ code: "customer-code" }, { code: "other" }];
  await assert.rejects(
    service.sale(service.context(input())),
    /does not match/,
  );
});
test("employee callers cannot invoke internal asset refund ports", () =>
  assert.throws(
    () =>
      service.context({ ...input(), authData: { principalType: "employee" } }),
    /internal service/,
  ));
test("only original sale ledgers are reversed, with carbon precision and credit recovered before debit restoration", async () => {
  const result = await service.settle(input());
  assert.deepEqual(
    calls.map((c) => [c.path.split("/")[2], c.body.scale]),
    [
      ["seller-proceeds", 2],
      ["buyer-carbon-credit", 3],
      ["seller-carbon-debit", 3],
    ],
  );
  assert.equal(result.refs.length, 3);
  assert(
    calls.every(
      (c) => c.body.sourceCode === "ORDER_1" && c.key === c.body.idempotencyKey,
    ),
  );
  assert(!calls.some((c) => c.path.includes("submission")));
});

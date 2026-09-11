/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/test/eWasteBiddingBoundaryContract @description Verifies that eWaste consumes generic Commerce bids while retaining its domain and store boundary. @layer test @owner eWaste */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  base = require("../src/service/defaultEWasteMarketplaceService");
const wasteBid = {
  code: "bid",
  storeCode: "ewasteStore",
  sourceRef: { module: "wasteCore", schema: "wasteAsset", code: "asset" },
};
function adapter(remote) {
  return {
    ...base,
    settings: () => ({ storeCode: "ewasteStore" }),
    experience: () => ({
      store: () => ({
        customer: () => ({ code: "buyer" }),
        fail: (code, message) => {
          throw Error(message);
        },
      }),
    }),
    customerRemote: remote,
  };
}
test("domain history excludes ordinary Commerce products and other stores", async () => {
  const service = adapter(async (request, module, path, method) => {
    assert.equal(module, "bidding");
    assert.equal(method, "GET");
    return {
      bids: [
        wasteBid,
        { ...wasteBid, code: "otherStore", storeCode: "other" },
        { ...wasteBid, code: "book", sourceRef: undefined },
      ],
      policyVersion: "generic",
    };
  });
  assert.deepEqual((await service.bids({})).bids, [wasteBid]);
});
test("domain decision rejects an unrelated bid before forwarding a mutation", async () => {
  let writes = 0;
  const service = adapter(async (request, module, path, method) => {
    if (method === "POST") writes++;
    return { ...wasteBid, sourceRef: undefined };
  });
  await assert.rejects(
    service.decideBid({ code: "other", payload: { action: "ACCEPT" } }),
    /does not belong/,
  );
  assert.equal(writes, 0);
});
test("eligible domain decisions retain Commerce ownership and the reviewed command", async () => {
  const calls = [];
  const service = adapter(async (request, module, path, method, body) => {
    calls.push({ module, path, method, body });
    return wasteBid;
  });
  await service.decideBid({
    code: "bid",
    payload: { action: "WITHDRAW" },
    expectedRevision: 2,
    confirmed: true,
    idempotencyKey: "reviewed-key",
  });
  assert.equal(calls[1].module, "bidding");
  assert.equal(calls[1].path, "/bids/bid/decisions");
  assert.deepEqual(calls[1].body, {
    action: "WITHDRAW",
    expectedRevision: 2,
    confirmed: true,
    idempotencyKey: "reviewed-key",
  });
});

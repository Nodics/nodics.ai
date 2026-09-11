/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/test/promotionCouponTokenCompatibilityContract @description Verifies explicitly configured legacy coupon hash lookup while canonical issuance stays unchanged and ambiguous purchased tokens fail closed. @layer test @owner promotion */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto"),
  service = require("../src/service/defaultPromotionOperationService");
let policies;
test.beforeEach(() => {
  policies = [];
  global.CONFIG = { get: () => ({ legacyTokenHashPolicies: policies }) };
});
test("canonical hashing is the only default and legacy lookup needs an explicit supported policy", () => {
  const canonical = crypto
    .createHash("sha256")
    .update("tenant|TOKEN")
    .digest("hex");
  assert.equal(service.tokenHashSelector("tenant", " token "), canonical);
  policies = ["TENANT_COLON_UPPERCASE_SHA256"];
  assert.deepEqual(service.tokenHashSelector("tenant", " token "), {
    $in: [
      canonical,
      crypto.createHash("sha256").update("tenant:TOKEN").digest("hex"),
    ],
  });
  assert.equal(service.hashToken("tenant", " token "), canonical);
  policies = ["UNKNOWN"];
  assert.throws(
    () => service.tokenHashSelector("tenant", "token"),
    /Unsupported/,
  );
});
test("legacy and canonical records sharing a presented token are rejected instead of choosing a customer purchase", async () => {
  const owner = {
    ...service,
    enterpriseQuery: (_, q) => q,
    serviceAuthData: () => ({}),
    listFromService: async () => [
      { code: "one", soldTo: "buyer", status: "DELIVERED" },
      { code: "two", soldTo: "other", status: "DELIVERED" },
    ],
  };
  global.SERVICE = { DefaultCouponService: {} };
  await assert.rejects(
    owner.merchantCoupon({ tenant: "tenant", couponToken: "token" }),
    /unavailable/,
  );
});

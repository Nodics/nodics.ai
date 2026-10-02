/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module digitalCore/test/merchantStoreScopeContract @description Injected outlet-scope and validation binding fixtures; not installed Store/Promotion acceptance. @layer test @owner digitalCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/defaultDigitalCommerceMerchantService");
test("store fulfillment requires a positive exact Store scope and retains enterprise DENY", () => {
  global.SERVICE = {
    DefaultSecuredRequestPipelineService: { isPermissionGranted: () => true },
  };
  const merchant = {
    enterpriseCode: "merchant",
    store: { code: "outlet", revision: 2 },
  };
  const r = {
    tenant: "tenant",
    scopes: {
      scopes: [{ scopeType: "ENTERPRISE", scopeCode: "merchant" }],
      deniedScopes: [],
    },
  };
  assert.equal(owner.scoped(r, merchant), false);
  r.scopes.scopes.push({ scopeType: "STORE", scopeCode: "outlet" });
  assert.equal(owner.scoped(r, merchant), true);
  r.scopes.deniedScopes.push({
    scopeType: "ENTERPRISE",
    scopeCode: "merchant",
  });
  assert.equal(owner.scoped(r, merchant), false);
});
test("validation evidence changes with outlet revision, outlet code and employee identity", () => {
  const item = { code: "coupon", revision: 4 },
    m = {
      code: "merchant",
      coupon: { tokenHash: "secret-hash" },
      store: { code: "outlet", revision: 2 },
    };
  const code = owner.validationCode(item, m, "expiry", "staff");
  for (const other of [
    { code: "other", revision: 2 },
    { code: "outlet", revision: 3 },
  ])
    assert.notEqual(
      owner.validationCode(item, { ...m, store: other }, "expiry", "staff"),
      code,
    );
  assert.notEqual(owner.validationCode(item, m, "expiry", "other-staff"), code);
});

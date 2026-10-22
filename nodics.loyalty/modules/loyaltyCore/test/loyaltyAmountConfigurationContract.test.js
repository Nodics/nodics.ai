/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyCore/test/loyaltyAmountConfigurationContract @description Exact unit precision comes only from the framework definition or explicit reward-type evidence. @layer test @owner loyaltyCore */
const test = require("node:test"), assert = require("node:assert/strict");
const amount = require("../src/service/defaultLoyaltyAmountService");
test("all amount operations share configured precision; missing definitions cannot recreate an inline default", t => {
  const previous = global.CONFIG;
  t.after(() => previous === undefined ? delete global.CONFIG : global.CONFIG = previous);
  const policy = structuredClone(require("../config/properties").loyalty);
  global.CONFIG = { get: key => key === "loyalty" ? policy : undefined };
  assert.equal(amount.normalize("1"), "1.00");
  policy.amount.scale = 3;
  assert.equal(amount.toMinor("1.125"), 1125n);
  assert.equal(amount.fromMinor(1125n), "1.125");
  assert.equal(amount.add("1.125", "0.005"), "1.130");
  assert.equal(amount.normalize("1", 0), "1");
  delete policy.amount.scale;
  assert.throws(() => amount.normalize("1"), { code: "ERR_LOYALTY_AMOUNT_SCALE" });
  assert.throws(() => amount.normalize("1", "2"), { code: "ERR_LOYALTY_AMOUNT_SCALE" });
  assert.equal(amount.normalize("1", 2), "1.00");
});

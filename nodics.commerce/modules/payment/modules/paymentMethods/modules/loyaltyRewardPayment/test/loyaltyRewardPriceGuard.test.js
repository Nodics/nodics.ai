/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module loyaltyRewardPayment/test/loyaltyRewardPriceGuard @description Rejects caller-controlled underpayment and unconfigured reward conversions. @layer test @owner loyaltyRewardPayment */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  method = require("../src/service/defaultLoyaltyRewardPaymentMethodService");
test("calculated price is authoritative and caller underpayment is rejected", () => {
  const base = {
    tenant: "default",
    walletCode: "wallet",
    amount: "20.00",
    currency: "POINTS",
  };
  assert.throws(
    () => method.prepare({ ...base, rewardAmount: "1" }),
    /calculated order total/,
  );
  assert.throws(
    () => method.prepare({ ...base, rewardCurrency: "AED" }),
    /calculated order currency/,
  );
  assert.throws(() => method.prepare({ ...base, amount: "0" }), /positive/);
  assert.equal(method.prepare({ ...base, rewardAmount: "20" }).amount, "20.00");
});

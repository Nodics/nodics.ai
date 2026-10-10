/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module paymentCore/test/paymentRefundExecutionContract @description Locks out former unscoped full, partial, failure, delayed and caller-selected Loyalty refund inputs before owner or provider effects. Guarded positive execution is covered in paymentRefundSafetyContract and composed Order recovery tests. @layer test @owner paymentCore */
const assert = require("node:assert/strict");
const test = require("node:test");
const refund = require("../src/service/defaultPaymentRefundExecutionService");

for (const payload of [
  { amount: "129.00", currency: "USD", providerToken: "tok_test_refund" },
  { amount: "12.50", currency: "USD", providerToken: "tok_test_refund_delay" },
  { amount: "10.00", currency: "USD", providerToken: "tok_test_refund_fail" },
  { amount: "25.00", currency: "POINTS", methodCode: "LOYALTY_REWARD", providerCode: "loyalty-reward-points", walletCode: "wallet", reversalOfEntryCode: "ledger" },
]) {
  test("unscoped refund input is not authority: " + (payload.providerToken || payload.providerCode), async () => {
    let effects = 0;
    const forbidden = async () => { effects++; throw new Error("Unexpected owner effect"); };
    global.SERVICE = {
      DefaultPaymentExecutionService: { execute: forbidden },
      DefaultPaymentTransactionService: { get: forbidden, save: forbidden },
      DefaultPaymentReconciliationService: { get: forbidden, save: forbidden },
    };
    const request = { tenant: "default", ownerId: "customer", orderCode: "order",
      idempotencyKey: "unscoped-refund", payload };
    for (let repeat = 0; repeat < 2; repeat++)
      await assert.rejects(refund.executeRefund(request), /guarded scoped Order refund approval/);
    assert.equal(effects, 0);
  });
}

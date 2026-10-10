/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyWallet/test/loyaltyTransactionSchemaParticipation @description Verifies inert schema eligibility and opaque transaction propagation without changing signed callers or enabling financial authority. @owner loyaltyWallet @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const operations = require("../src/service/defaultLoyaltyRewardOperationService");
test("Loyalty participant schemas are side-effect-safe without selecting a transaction provider", () => {
  for (const moduleName of ["loyaltyWallet", "loyaltyLedger", "loyaltyReservation", "loyaltyRedemption"]) {
    for (const schema of Object.values(require("../../" + moduleName + "/src/schemas/schemas")[moduleName])) {
      assert.deepEqual(schema.transaction, { enabled: true, sideEffects: "none" });
      assert.equal(schema.cache.enabled, false); assert.equal(schema.event.enabled, false);
    }
  }
  assert.equal(require("../config/properties").loyalty.transactions.enabled, false);
  assert.equal(require("../config/properties").loyalty.sampleCredits.enabled, false);
});
test("generated owner requests forward the exact opaque token without changing the original actor", () => {
  const token = Object.freeze({ transactionId: "opaque", moduleName: "loyaltyWallet", tenant: "tenant" });
  const request = { tenant: "tenant", authData: { code: "original", principalType: "service", permissions: ["loyalty.rewards.earn"], userGroups: [] }, transactionContext: token };
  const before = structuredClone(request.authData);
  const generated = operations.serviceRequest(request, { query: { code: "wallet" } });
  assert.equal(generated.transactionContext, token); assert.deepEqual(request.authData, before);
  assert.equal(generated.authData.code, "loyaltyRewardOperationService", "Established private storage actor remains private");
  assert.equal(operations.serviceRequest({ tenant: "tenant", authData: before }).transactionContext, undefined);
});

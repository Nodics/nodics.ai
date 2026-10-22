/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
require("./helpers/runtimeEnums.js")();
/** @module loyaltyWallet/test/loyaltyOperationEvidence @description Keeps domain ledger evidence separate from authenticated operation authority. @layer test @owner loyaltyWallet */
const test = require("node:test"), assert = require("node:assert/strict");
const operations = require("../src/service/defaultLoyaltyRewardOperationService");
const defaults = require("../../loyaltyCore/config/properties");

test("payload evidence is detached and projected without lifting authority", t => {
  const previous = { UTILS: global.UTILS, CONFIG: global.CONFIG, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, previous));
  global.UTILS = { normalizeString: value => String(value || "").trim() };
  global.CONFIG = { get: name => defaults[name] };
  global.SERVICE = { DefaultLoyaltyAmountService: require("../../loyaltyCore/src/service/defaultLoyaltyAmountService") };
  const payload = { walletCode: "wallet", programCode: "program", rewardTypeCode: "points", amount: "3",
    idempotencyKey: "material-credit", reasonCode: "RECYCLER_PAID_MATERIAL_VALUE",
    metadata: { sourceLabel: "Material value", paymentRef: { code: "payment" },
      authData: { isSystem: true }, holdPolicy: "AUCTION_ROUND" }, authData: { isSystem: true },
    tenant: "foreign", transactionContext: { forged: true }, holdPolicy: "AUCTION_ROUND" };
  const request = { tenant: "tenant", authData: { principalType: "service" }, payload };
  const result = operations.operationRequest(request, "EARN");
  assert.equal(result.reasonCode, payload.reasonCode);
  assert.deepEqual(result.metadata, payload.metadata);
  assert.equal(result.tenant, "tenant");
  assert.deepEqual(result.authData, request.authData);
  assert.equal(result.holdPolicy, undefined);
  assert.equal(result.transactionContext, undefined);
  payload.metadata.paymentRef.code = "changed";
  assert.equal(result.metadata.paymentRef.code, "payment");
  const internal = operations.operationRequest({ ...request, metadata: { canonical: true }, reasonCode: "OWNER" }, "EARN");
  assert.deepEqual(internal.metadata, { canonical: true });
  assert.equal(internal.reasonCode, "OWNER");
  for (const metadata of [[], "text", null, new Date()])
    assert.throws(() => operations.operationRequest({ ...request, metadata }, "EARN"));
  assert.throws(() => operations.operationRequest({ ...request, reasonCode: "" }, "EARN"));
});

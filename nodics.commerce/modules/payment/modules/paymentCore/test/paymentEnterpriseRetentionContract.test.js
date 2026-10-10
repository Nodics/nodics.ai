/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module paymentCore/test/paymentEnterpriseRetentionContract @description Verifies original operation enterprise and payment keys through real Payment execution with isolated persistence, without provider qualification. @layer test @owner paymentCore */
const test = require("node:test"), assert = require("node:assert/strict");
const execution = require("../src/service/defaultPaymentExecutionService");
const schemas = require("../src/schemas/schemas").paymentCore;

test("fresh authorization and capture retain original enterprise and unchanged Checkout payment keys", async () => {
  const rows = [], calls = [];
  const repository = { find: async (tenant, key) => rows.find(row => row.tenant === tenant && row.idempotencyKey === key),
    record: async model => { rows.push(structuredClone(model)); return rows.at(-1); } };
  const adapter = { code: "loyalty-reward-points", execute: async request => {
    calls.push(request); return { status: request.operation === "AUTHORIZE" ? "AUTHORIZED" : "CAPTURED", reference: request.operation === "AUTHORIZE" ? "original-reservation" : "original-buyer-debit" };
  } };
  for (const operation of ["AUTHORIZE", "CAPTURE"]) {
    const key = "original-checkout:payment" + (operation === "CAPTURE" ? ":capture" : "");
    const request = { tenant: "t", authData: { enterpriseCode: "original-merchant" }, ownerId: "buyer", orderCode: "order", cartCode: "cart",
      operation, methodCode: "LOYALTY_REWARD", amount: "12.00", currency: "POINTS", idempotencyKey: key };
    const saved = await execution.execute(request, adapter, repository);
    assert.equal(saved.enterpriseCode, "original-merchant"); assert.equal(saved.idempotencyKey, key);
    assert.equal(saved.providerReference, operation === "AUTHORIZE" ? "original-reservation" : "original-buyer-debit");
    assert.equal((await execution.execute(request, adapter, repository)).enterpriseCode, "original-merchant");
  }
  assert.equal(calls.length, 2); assert.equal(rows.length, 2);
  assert(calls.every(request => request.enterpriseCode === "original-merchant"));
  for (const schema of [schemas.paymentTransaction, schemas.paymentTransactionEntry]) {
    assert.equal(schema.definition.enterpriseCode.type, "string"); assert.equal(schema.definition.enterpriseCode.required, false);
  }
});

test("legacy stored evidence never acquires enterprise scope from a replay caller", async () => {
  const legacy = { tenant: "t", idempotencyKey: "legacy-payment", status: "CAPTURED" };
  const result = await execution.execute({ tenant: "t", enterpriseCode: "later-merchant", operation: "CAPTURE", idempotencyKey: legacy.idempotencyKey },
    { code: "loyalty-reward-points", execute: async () => assert.fail("Replay must not execute the provider") },
    { find: async () => legacy, record: async () => assert.fail("Replay must not rewrite evidence") });
  assert.equal(result.enterpriseCode, undefined); assert.equal(result, legacy);
});

test("conflicting or malformed operation enterprise aliases refuse before financial reads, dispatch and retention", async () => {
  const request = { tenant: "t", enterpriseCode: "merchant", entCode: "merchant", authData: { enterpriseCode: "merchant", entCode: "merchant" },
    operation: "CAPTURE", idempotencyKey: "capture-key", amount: "12.00", currency: "POINTS", methodCode: "LOYALTY_REWARD" };
  const adapter = { code: "loyalty-reward-points", execute: async () => assert.fail("Denied scope cannot dispatch") };
  const repository = { find: async () => assert.fail("Denied scope cannot read"), record: async () => assert.fail("Denied scope cannot persist") };
  for (const alter of [r => r.entCode = "foreign", r => r.authData.enterpriseCode = "foreign", r => r.authData.entCode = "foreign",
    r => r.enterpriseCode = "", r => r.enterpriseCode = null, r => r.authData.entCode = { code: "merchant" },
    r => r.authData.enterpriseCode = " merchant", r => r.entCode = "merchant\n", r => r.enterpriseCode = "x".repeat(129)]) {
    const changed = structuredClone(request); alter(changed);
    await assert.rejects(execution.execute(changed, adapter, repository), /enterprise scope is invalid or conflicting/);
    assert.throws(() => execution.transactionModel(changed, adapter, { status: "CAPTURED" }), /enterprise scope is invalid or conflicting/);
  }
  assert.equal(execution.operationEnterprise(request), "merchant");
  assert.equal(execution.operationEnterprise({ entCode: "merchant" }), "merchant");
  assert.equal(execution.operationEnterprise({}), undefined);
});

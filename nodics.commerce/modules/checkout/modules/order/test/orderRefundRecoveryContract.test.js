/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module order/test/orderRefundRecoveryContract @description Verifies immutable approval, captured totals, scope, owner port recovery and one refund per order through the real Order lifecycle processor. @layer test @owner order */
const test = require("node:test"),
  assert = require("node:assert/strict");
const service = require("../src/service/defaultOrderRefundRecoveryService"),
  lifecycle = require("../src/service/defaultOrderLifecycleService");
let rows,
  orders,
  phaseCalls,
  failPhase,
  eligible,
  permissions,
  scopeAllowed,
  role;
const clone = (v) => structuredClone(v);
const matches = (row, q) =>
  Object.entries(q || {}).every(([k, v]) => row[k] === v);
function store(map) {
  return {
    get: async (r) => ({
      result: [...map.values()].filter((i) => matches(i, r.query)).map(clone),
    }),
    save: async (r) => {
      if (map.has(r.model.code)) throw Error("duplicate");
      map.set(r.model.code, clone(r.model));
      return { result: r.model };
    },
    update: async (r) => {
      const row = map.get(r.query.code);
      if (!row || !matches(row, r.query)) throw Error("revision conflict");
      assert.equal(
        r.model.revision,
        row.revision + 1,
        "Order domain revision advances with its mutation",
      );
      map.set(row.code, {
        ...row,
        ...clone(r.model),
        revision: row.revision + 1,
      });
      return { result: clone(map.get(row.code)) };
    },
  };
}
function input(payload = {}) {
  return {
    tenant: "runtime",
    code: "CASE",
    authData: {
      principalType: "human",
      loginId: "moderator",
      entCode: "enterprise",
    },
    authorization: "Bearer example",
    idempotencyKey: "case-refund-command",
    payload: {
      confirmed: true,
      expectedRevision: 0,
      reason: "Approved unused purchase refund",
      ...payload,
    },
  };
}
test.beforeEach(() => {
  role = "COMMERCE";
  permissions = ["commerce.refund.execute"];
  scopeAllowed = true;
  phaseCalls = {};
  failPhase = null;
  eligible = true;
  rows = new Map([
    [
      "CASE",
      {
        code: "CASE",
        enterpriseCode: "enterprise",
        ownerId: "buyer",
        orderCode: "ORDER_1",
        requestType: "DISPUTE",
        status: "SUBMITTED",
        revision: 0,
        evidence: { requestedResolution: "REFUND" },
      },
    ],
  ]);
  orders = new Map([
    [
      "ORDER_1",
      {
        code: "ORDER_1",
        enterpriseCode: "enterprise",
        ownerId: "buyer",
        status: "PLACED",
        revision: 0,
        totalAmount: "12",
        currency: "POINTS",
        evidence: {},
      },
    ],
  ]);
  global.CONFIG = {
    get: (key) =>
      key === "runtimeRole"
        ? role
        : { refunds: { enabled: true, orderCodePrefixes: ["ORDER_"] } },
  };
  const phase = async (name) => {
    phaseCalls[name] = (phaseCalls[name] || 0) + 1;
    if (failPhase === name) {
      failPhase = null;
      throw Error("interrupted " + name);
    }
    return { status: "COMPLETED" };
  };
  global.SERVICE = {
    DefaultOrderLifecycleService: lifecycle,
    DefaultOrderLifecycleRequestService: store(rows),
    DefaultCommerceOrderService: store(orders),
    DefaultOrderOperationService: {
      entries: async () => [{ productCode: "coupon", quantity: "1" }],
    },
    DefaultOrderDisputeService: {
      staff: async (r) => {
        if (!scopeAllowed || r.authData.principalType !== "human")
          throw Error("scope denied");
        return { ...r, enterpriseCode: "enterprise" };
      },
      storage: (r) => ({ tenant: r.tenant, authData: r.authData }),
      rows: (v) => v.result || [],
      records: async (r, q) =>
        [...rows.values()]
          .filter(
            (i) =>
              i.requestType === "DISPUTE" &&
              i.enterpriseCode === r.enterpriseCode &&
              matches(i, q),
          )
          .map(clone),
    },
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: () => permissions,
      isPermissionGranted: (p, list) => list.includes(p),
    },
    DefaultPaymentRefundExecutionService: {
      orderCapture: async (r) => ({
        captureCode: "CAPTURE",
        amount: r.totalAmount,
        currency: r.currency,
      }),
      refundOrder: async () => {
        await phase("PAYMENT");
        return {
          status: "REFUND_SUCCEEDED",
          transaction: { code: "REFUND_TX" },
        };
      },
    },
    DefaultDigitalCommerceRefundService: {
      preview: async () => ({
        eligible,
        kind: "DIGITAL_COUPON",
        summary: "Revoke unused coupon",
      }),
      prepare: () => phase("PREPARE"),
      settle: () => phase("SETTLE"),
      complete: () => phase("COMPLETE"),
    },
  };
});
async function approvedInput() {
  const p = await service.preview(input());
  assert.equal(p.eligible, true);
  return input({ previewToken: p.previewToken });
}
test("reviewed captured total completes all owners once and replay retains the completed case", async () => {
  const r = await approvedInput();
  r.payload.amount = "99999";
  const result = await service.execute(r);
  assert.equal(result.status, "COMPLETED");
  assert.equal(result.amount, "12");
  assert.equal(orders.get("ORDER_1").status, "REFUNDED");
  assert.equal(rows.get("CASE").status, "REFUNDED");
  await service.execute(r);
  assert.deepEqual(phaseCalls, {
    PREPARE: 1,
    SETTLE: 1,
    PAYMENT: 1,
    COMPLETE: 1,
  });
  await assert.rejects(
    service.execute({
      ...r,
      payload: { ...r.payload, reason: "Changed approval reason" },
    }),
    /original case/,
  );
});
for (const phase of ["PREPARE", "SETTLE", "PAYMENT", "COMPLETE"])
  test(
    "interruption at " + phase + " resumes only incomplete owner steps",
    async () => {
      const r = await approvedInput();
      failPhase = phase;
      const result = await service.execute(r);
      assert.equal(result.status, "RECONCILIATION_REQUIRED");
      assert.equal(rows.get("CASE").status, "REFUND_RECONCILIATION");
      assert.notEqual(orders.get("ORDER_1").status, "REFUNDED");
      const recovered = await service.execute(r);
      assert.equal(recovered.status, "COMPLETED");
      assert.equal(recovered.reason, undefined);
      for (const completed of ["PREPARE", "SETTLE", "PAYMENT", "COMPLETE"])
        assert.equal(phaseCalls[completed], completed === phase ? 2 : 1);
    },
  );
test("stale preview, missing permission, denied scope and Staged runtime cannot execute", async () => {
  const r = await approvedInput();
  orders.get("ORDER_1").revision++;
  await assert.rejects(service.execute(r), /preview again/);
  permissions = [];
  await assert.rejects(service.execute(r), /permission/);
  scopeAllowed = false;
  await assert.rejects(service.preview(input()), /scope/);
  scopeAllowed = true;
  role = "STAGED";
  await assert.rejects(service.preview(input()), /runtime/);
  assert.deepEqual(phaseCalls, {});
});
test("ineligible coupons and unsupported captures never reach a payment operation", async () => {
  eligible = false;
  assert.equal((await service.preview(input())).eligible, false);
  await assert.rejects(service.execute(input()), /eligibility/);
  assert.deepEqual(phaseCalls, {});
  SERVICE.DefaultPaymentRefundExecutionService.orderCapture = async () => {
    throw Error("unsupported capture");
  };
  assert.match((await service.preview(input())).reason, /unsupported/);
});
test("a second review case cannot refund an already-refunded order again", async () => {
  const r = await approvedInput();
  await service.execute(r);
  rows.set("CASE_2", {
    ...clone(rows.get("CASE")),
    code: "CASE_2",
    status: "SUBMITTED",
    revision: 0,
  });
  await assert.rejects(
    service.execute({ ...input(), code: "CASE_2" }),
    /original case/,
  );
  assert.equal(phaseCalls.PAYMENT, 1);
});

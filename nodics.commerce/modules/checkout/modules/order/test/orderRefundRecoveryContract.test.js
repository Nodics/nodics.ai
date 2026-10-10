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
    get: async (r) => {
      const result = [...map.values()].filter((i) => matches(i, r.query)).map(clone);
      return { code: "SUC_FIND_00000", count: result.length, result };
    },
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
      return { code: "SUC_UPD_00000", result: { acknowledged: true, matchedCount: 1, modifiedCount: 1 } };
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
  global.CLASSES = { NodicsError: class extends Error {
    constructor(code) { super(require("../src/utils/statusDefinitions")[code]?.message || code); this.code = code; }
  } };
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
        tenant: "runtime",
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
      ...require("../src/service/defaultOrderDisputeService"),
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
      preflightOrder: async () => ({ eligible: true, captureCode: "CAPTURE", amount: "12", currency: "POINTS" }),
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
  const completedCase = clone(rows.get("CASE")), completedRows = clone([...rows]), completedOrders = clone([...orders]);
  await service.execute(r);
  assert.deepEqual(rows.get("CASE"), completedCase);
  assert.deepEqual([...rows], completedRows);
  assert.deepEqual([...orders], completedOrders);
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
test("completed replay repairs only stale original case progress once with scoped revision CAS", async () => {
  const r = await approvedInput();
  await service.execute(r);
  const refundBefore = clone([...rows.values()].find(row => row.requestType === "REFUND"));
  const orderBefore = clone([...orders]), effectsBefore = clone(phaseCalls), originalUpdate = SERVICE.DefaultOrderLifecycleRequestService.update;
  const stale = rows.get("CASE");
  stale.status = "REFUND_RECONCILIATION";
  stale.evidence.refund = { refundCode: refundBefore.code, status: "RECONCILIATION_REQUIRED" };
  stale.evidence.decision = { actor: "original-reviewer", reason: "Preserve review history" };
  const before = clone(stale), writes = [];
  SERVICE.DefaultOrderLifecycleRequestService.update = async request => {
    writes.push(clone(request));
    return originalUpdate(request);
  };
  assert.equal((await service.execute(r)).status, "COMPLETED");
  const repaired = clone(rows.get("CASE"));
  assert.equal(repaired.revision, before.revision + 1);
  assert.equal(repaired.status, "REFUNDED");
  assert.deepEqual(repaired.evidence.decision, before.evidence.decision);
  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0].query, { tenant: "runtime", code: "CASE", enterpriseCode: "enterprise",
    ownerId: "buyer", orderCode: "ORDER_1", requestType: "DISPUTE", revision: before.revision });
  assert.deepEqual(writes[0].options, { recursive: false, skipItemCache: true });
  await service.execute(r);
  assert.equal(writes.length, 1);
  assert.deepEqual(rows.get("CASE"), repaired);
  assert.deepEqual(rows.get(refundBefore.code), refundBefore);
  assert.deepEqual([...orders], orderBefore);
  assert.deepEqual(phaseCalls, effectsBefore);
});
test("completed case projection treats omitted and undefined optional reason identically without losing other evidence", async () => {
  const r = await approvedInput();
  await service.execute(r);
  rows.get("CASE").evidence.refund.reason = undefined;
  const before = clone([...rows]);
  SERVICE.DefaultOrderLifecycleRequestService.update = async () => assert.fail("Identical replay must not write");
  assert.equal((await service.execute(r)).status, "COMPLETED");
  assert.deepEqual([...rows], before);
  permissions = [];
  await assert.rejects(service.execute(r), /permission/);
});
test("completed replay accepts actual Mongo provider and generated get envelopes without case or financial writes", async () => {
  const r = await approvedInput();
  await service.execute(r);
  const before = clone([...rows]), effects = clone(phaseCalls);
  const pipeline = { ...require("../../../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService"), LOG: { debug() {} } };
  const model = { ...require("../../../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model").default,
    rawSchema: {},
    find: query => ({ toArray: async () => [...rows.values()].filter(row => matches(row, query)).map(clone) }),
    countDocuments: async query => [...rows.values()].filter(row => matches(row, query)).length };
  let generatedReads = 0;
  SERVICE.DefaultOrderLifecycleRequestService.get = request => new Promise((resolve, reject) => {
    generatedReads++;
    pipeline.executeQuery({ ...request, schemaModel: model }, {}, {
      nextSuccess: (_request, response) => resolve(response.success),
      error: (_request, _response, error) => reject(error),
    });
  });
  SERVICE.DefaultOrderLifecycleRequestService.update = async () => assert.fail("Completed replay cannot write");
  assert.equal((await service.execute(r)).status, "COMPLETED");
  assert.ok(generatedReads >= 3);
  assert.deepEqual([...rows], before);
  assert.deepEqual(phaseCalls, effects);
});
test("registered case read diagnostic masks thrown provider causes and retains completed financial evidence", async () => {
  const r = await approvedInput();
  await service.execute(r);
  const before = clone([...rows]), effects = clone(phaseCalls), get = SERVICE.DefaultOrderLifecycleRequestService.get;
  SERVICE.DefaultOrderLifecycleRequestService.get = request => {
    if (request.query.requestType === "DISPUTE") throw Error("PRIVATE_PROVIDER_CAUSE");
    return get(request);
  };
  await assert.rejects(service.execute(r), error => {
    assert.equal(error.code, "ERR_ORDER_REFUND_PROJECTION_READ");
    assert.equal(error.message.includes("PRIVATE_PROVIDER_CAUSE"), false);
    assert.equal(error.cause, undefined);
    return true;
  });
  assert.deepEqual([...rows], before);
  assert.deepEqual(phaseCalls, effects);
});
for (const [phase, code] of [["SETTLE", "ERR_ORDER_REFUND_REPLAY_AUTHORITY"], ["COMPLETE", "ERR_ORDER_REFUND_REPLAY_STATE"]]) {
  test("completed replay exposes only fixed " + code + " gate before further effects", async () => {
    const r = await approvedInput();
    await service.execute(r);
    [...rows.values()].find(row => row.requestType === "REFUND").evidence.steps[phase].status = "FAILED";
    const before = clone([...rows]), effects = clone(phaseCalls);
    await assert.rejects(service.execute(r), { code });
    assert.deepEqual([...rows], before);
    assert.deepEqual(phaseCalls, effects);
  });
}
for (const fault of ["failed", "missing-code", "missing-count", "truncated", "duplicate", "tenant", "enterpriseCode", "ownerId", "orderCode", "requestType"]) {
  test("completed replay refuses " + fault + " original-case read evidence without effects", async () => {
    const r = await approvedInput();
    await service.execute(r);
    const before = clone([...rows]), effectsBefore = clone(phaseCalls), get = SERVICE.DefaultOrderLifecycleRequestService.get;
    SERVICE.DefaultOrderLifecycleRequestService.get = async request => {
      const response = await get(request);
      if (request.query.requestType !== "DISPUTE") return response;
      assert.deepEqual(request.options, { recursive: false, skipItemCache: true });
      assert.deepEqual(request.searchOptions, { pageSize: 2, pageNumber: 1 });
      if (fault === "failed") response.code = "ERR_READ";
      else if (fault === "missing-code") delete response.code;
      else if (fault === "missing-count") delete response.count;
      else if (fault === "truncated") response.count = 10;
      else if (fault === "duplicate") { response.result.push(clone(response.result[0])); response.count = 2; }
      else response.result[0][fault] = "foreign";
      return response;
    };
    await assert.rejects(service.execute(r), { code: "ERR_ORDER_REFUND_PROJECTION_READ" });
    assert.deepEqual([...rows], before);
    assert.deepEqual(phaseCalls, effectsBefore);
  });
}
for (const ack of [{ code: "ERR_WRITE" }, { code: "SUC_UPD_00000", result: {} },
  { code: "SUC_UPD_00000", result: { acknowledged: true, matchedCount: 0, modifiedCount: 0 } },
  { code: "SUC_UPD_00000", result: { acknowledged: true, matchedCount: 1, modifiedCount: 1, code: "ERR_WRITE" } }]) {
  test("stale completed projection refuses unconfirmed generated write " + JSON.stringify(ack), async () => {
    const r = await approvedInput();
    await service.execute(r);
    rows.get("CASE").status = "REFUND_RECONCILIATION";
    const before = clone([...rows]), effectsBefore = clone(phaseCalls);
    SERVICE.DefaultOrderLifecycleRequestService.update = async () => clone(ack);
    await assert.rejects(service.execute(r), { code: "ERR_ORDER_REFUND_PROJECTION_WRITE" });
    assert.deepEqual([...rows], before);
    assert.deepEqual(phaseCalls, effectsBefore);
  });
}
test("acknowledged stale projection still requires exact persisted readback", async () => {
  const r = await approvedInput();
  await service.execute(r);
  rows.get("CASE").status = "REFUND_RECONCILIATION";
  const effectsBefore = clone(phaseCalls), originalUpdate = SERVICE.DefaultOrderLifecycleRequestService.update;
  SERVICE.DefaultOrderLifecycleRequestService.update = async request => {
    const result = await originalUpdate(request);
    rows.get("CASE").evidence.refund.amount = "999";
    return result;
  };
  await assert.rejects(service.execute(r), { code: "ERR_ORDER_REFUND_PROJECTION_READBACK" });
  assert.deepEqual(phaseCalls, effectsBefore);
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
      const preview = await service.preview(input());
      assert.equal(preview.recovery, true);
      assert.equal(preview.approvalCommandKey, r.idempotencyKey);
      assert.equal(preview.approvalReason, r.payload.reason);
      assert.equal(preview.originalCapture, undefined);
      const recovered = await service.execute(r);
      assert.equal(recovered.status, "COMPLETED");
      assert.equal(recovered.reason, undefined);
      for (const completed of ["PREPARE", "SETTLE", "PAYMENT", "COMPLETE"])
        assert.equal(phaseCalls[completed], completed === phase ? 2 : 1);
    },
  );
test("recovery preview cannot lend another case its approved command or manufacture a missing reference", async () => {
  const r = await approvedInput();
  failPhase = "PAYMENT";
  await service.execute(r);
  rows.set("CASE_2", { ...clone(rows.get("CASE")), code: "CASE_2", status: "SUBMITTED", revision: 0 });
  const other = await service.preview({ ...input(), code: "CASE_2" });
  assert.equal(other.eligible, false);
  assert.equal(other.approvalCommandKey, undefined);
  assert.equal(other.reason, "REFUND_APPROVED_UNDER_ANOTHER_CASE");
  const approval = [...rows.values()].find(row => row.requestType === "REFUND").evidence.approval;
  for (const command of [undefined, "bad key", "x".repeat(181)]) {
    approval.commandKey = command;
    const malformed = await service.preview(input());
    assert.equal(malformed.eligible, false);
    assert.equal(malformed.approvalCommandKey, undefined);
  }
});
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

test("Payment authority requires persisted approval, scoped lock and successful owner checkpoints", async () => {
  const r = await approvedInput();
  await assert.rejects(service.paymentAuthority(r, true), /approval/);
  failPhase = "PAYMENT";
  await service.execute(r);
  const authority = await service.paymentAuthority(r, true);
  assert.equal(authority.allowExecution, true);
  assert.equal(authority.totalAmount, "12");
  assert.equal(authority.originalCapture.captureCode, "CAPTURE");
  const row = rows.get(authority.refundCode);
  for (const mutate of [
    () => { permissions = []; },
    () => { row.evidence.steps.SETTLE = { status: "FAILED" }; },
    () => { orders.get("ORDER_1").evidence.refundCode = "foreign"; },
    () => { row.ownerId = "foreign"; },
  ]) {
    const savedRow = clone(row), savedOrder = clone(orders.get("ORDER_1"));
    mutate();
    await assert.rejects(service.paymentAuthority(r, true), /permission|approval/);
    Object.assign(row, savedRow); orders.set("ORDER_1", savedOrder);
    permissions = ["commerce.refund.execute"];
  }
});

test("failed domain checkpoint cannot advance to Payment or a completed refund", async () => {
  const r = await approvedInput();
  SERVICE.DefaultDigitalCommerceRefundService.settle = async () => ({ status: "FAILED" });
  assert.equal((await service.execute(r)).status, "RECONCILIATION_REQUIRED");
  assert.equal(phaseCalls.PAYMENT, undefined);
  assert.notEqual(orders.get("ORDER_1").status, "REFUNDED");
});

test("unconfirmed financial preflight cannot reach a domain owner", async () => {
  const r = await approvedInput();
  SERVICE.DefaultPaymentRefundExecutionService.preflightOrder = async () => ({ eligible: false });
  assert.equal((await service.execute(r)).status, "RECONCILIATION_REQUIRED");
  assert.deepEqual(phaseCalls, {});
});

test("unacknowledged order lock cannot reach any external owner", async () => {
  const r = await approvedInput();
  SERVICE.DefaultCommerceOrderService.update = async () => ({ code: "ERR_CONFLICT" });
  await assert.rejects(service.execute(r), /lock|persist|reconcil/i);
  assert.deepEqual(phaseCalls, {});
});

/** Connects real Order and Payment services to schema-shaped isolated persistence. @returns {Object} Provider and journal probes. */
function connectPayment() {
  const refund = require("../../../../payment/modules/paymentCore/src/service/defaultPaymentRefundExecutionService");
  const payment = require("../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService");
  const exact = require("../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService");
  const state = { calls: [], transactions: [], reconciliations: [], status: "REFUNDED", reference: "refund-ledger" };
  const captures = [{ code: "CAPTURE", tenant: "runtime", ownerId: "buyer", orderCode: "ORDER_1", status: "CAPTURED", totalAmount: "12", currency: "POINTS",
    evidence: { operation: "CAPTURE", providerCode: "loyalty-reward-points", methodCode: "LOYALTY_REWARD", walletCode: "wallet", programCode: "program", rewardTypeCode: "points", providerReference: "capture-ledger" } }];
  const get = list => async r => ({ code: "SUC_GET", result: clone(list.filter(row => Object.entries(r.query).every(([key, value]) =>
    key.split(".").reduce((v, k) => v?.[k], row) === value))) });
  const persisted = list => ({ get: get(list), save: async r => {
    // Retain only schema-owned top-level fields, as a generated owner may do.
    const row = Object.fromEntries(Object.entries(r.model).filter(([key]) => ["code", "tenant", "ownerId", "orderCode", "status", "revision", "idempotencyKey", "correlationId", "evidence", "occurredAt", "currency", "totalAmount"].includes(key)));
    list.push(clone(row)); return { code: "SUC_SAVE", result: row };
  } });
  Object.assign(SERVICE, {
    DefaultOrderRefundRecoveryService: service, DefaultPaymentRefundExecutionService: refund,
    DefaultPaymentExecutionService: payment, DefaultExactAmountService: exact,
    DefaultPaymentTransactionEntryService: { get: get(captures) },
    DefaultPaymentTransactionService: persisted(state.transactions),
    DefaultPaymentReconciliationService: persisted(state.reconciliations),
    DefaultLoyaltyRewardPaymentProviderService: { code: "loyalty-reward-points", execute: async r => {
      state.calls.push(clone(r)); return { status: state.status, reference: state.reference };
    } },
  });
  return state;
}

test("real Order and Payment bind original approval and captured identity across replay", async () => {
  const payment = connectPayment(), r = await approvedInput();
  assert.equal((await service.preview(input())).originalCapture, undefined);
  r.totalAmount = "999"; r.currency = "USD"; r.payload.amount = "999";
  assert.equal((await service.execute(r)).status, "COMPLETED");
  const completedCases = clone([...rows]), completedOrders = clone([...orders]), completedEffects = clone(phaseCalls);
  const completedTransactions = clone(payment.transactions);
  assert.equal((await service.execute({ ...r, actionCode: "RECONCILE" })).status, "COMPLETED");
  assert.deepEqual([...rows], completedCases);
  assert.deepEqual([...orders], completedOrders);
  assert.deepEqual(phaseCalls, completedEffects);
  assert.deepEqual(payment.transactions, completedTransactions);
  assert.equal(payment.calls.length, 1);
  assert.equal(payment.calls[0].amount, "12");
  assert.equal(payment.calls[0].currency, "POINTS");
  assert.equal(payment.calls[0].reversalOfEntryCode, "capture-ledger");
  await assert.rejects(service.execute({ ...r, idempotencyKey: "different-command" }), /original case/);
  permissions = [];
  await assert.rejects(SERVICE.DefaultPaymentRefundExecutionService.refundOrder(r), /permission/);
  assert.equal(payment.calls.length, 1);
});

for (const status of ["REFUND_FAILED", "REFUND_PENDING", "UNKNOWN_PROVIDER_STATE"]) {
  test("real Payment " + status + " never completes or reissues financial intent", async () => {
    const payment = connectPayment(); payment.status = status;
    const r = await approvedInput();
    for (let replay = 0; replay < 2; replay++) {
      assert.equal((await service.execute(r)).status, "RECONCILIATION_REQUIRED");
      assert.equal(orders.get("ORDER_1").status, "REFUND_PENDING");
      assert.equal(rows.get("CASE").status, "REFUND_RECONCILIATION");
    }
    assert.equal(payment.calls.length, 1);
    assert.equal(payment.reconciliations.length, 1);
    assert.equal(phaseCalls.COMPLETE, undefined);
  });
}

test("provider success without original refund receipt remains recovery work", async () => {
  const payment = connectPayment(); payment.reference = undefined;
  const r = await approvedInput();
  assert.equal((await service.execute(r)).status, "RECONCILIATION_REQUIRED");
  assert.equal(payment.transactions[0].status, "REFUND_RECONCILIATION_REQUIRED");
  assert.equal(phaseCalls.COMPLETE, undefined);
});

test("remaining authority and provider availability are checked before domain effects", async () => {
  const payment = connectPayment(), r = await approvedInput();
  payment.transactions.push({ tenant: "runtime", ownerId: "buyer", orderCode: "ORDER_1", status: "REFUND_DELAYED", totalAmount: "1", currency: "POINTS", evidence: { operation: "REFUND" } });
  assert.equal((await service.execute(r)).status, "RECONCILIATION_REQUIRED");
  assert.deepEqual(phaseCalls, {});
  assert.equal(payment.calls.length, 0);
  payment.transactions.length = 0;
  delete SERVICE.DefaultLoyaltyRewardPaymentProviderService;
  assert.equal((await service.execute(r)).status, "RECONCILIATION_REQUIRED");
  assert.deepEqual(phaseCalls, {});
});

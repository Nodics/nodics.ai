/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module order/test/orderRefundExceptionContract @description Exact Local adjudication, immutable policy, private phase admission and original financial-owner integration. @layer test @owner order */
const test = require("node:test"), assert = require("node:assert/strict"), { isDeepStrictEqual } = require("node:util");
const exception = require("../src/service/defaultOrderRefundExceptionService");
const recovery = require("../src/service/defaultOrderRefundRecoveryService");
const dispute = require("../src/service/defaultOrderDisputeService");
const digital = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceRefundService");
const entitlement = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceEntitlementService");
const promotion = require("../../../../baseCommerce/modules/promotion/src/service/defaultPromotionOperationService");
const payment = require("../../../../payment/modules/paymentCore/src/service/defaultPaymentRefundExecutionService");
const exact = require("../../../../../../nodics.foundation/modules/nCommon/src/utils/exactAmount");
const controller = require("../src/controller/defaultOrderDisputeController");
const routers = require("../src/router/routers");
const copy = value => structuredClone(value);
const at = (row, key) => key.split(".").reduce((value, part) => value?.[part], row);
const matches = (row, query) => Object.entries(query).every(([key, value]) => isDeepStrictEqual(at(row, key), value));
const failure = { code: "ERR_ORDER_REFUND_EXCEPTION" };

function fixture() {
  const request = { tenant: "t", code: "CASE", authData: { principalType: "human", loginId: "reviewer", entCode: "market" },
    authorization: "Bearer offline-fixture", idempotencyKey: "exception-original-command", payload: {
      confirmed: true, expectedRevision: 0, reason: "Explicit original unused purchase exception" } };
  const policy = { version: 1, promotionCode: "campaign", promotionRevision: 1, purchasedAt: "2026-10-01T00:00:00.000Z",
    validityDays: 365, conditions: {}, actions: { benefitType: "ITEM" }, terms: ["Original immutable terms"],
    issuerEnterpriseRef: { code: "market", type: "ISSUER" }, vendorEnterpriseRef: { code: "market", type: "MARKETPLACE_VENDOR" } };
  const row = { code: "CASE", tenant: "t", enterpriseCode: "market", ownerId: "buyer", orderCode: "ORDER_ONE",
    requestType: "DISPUTE", status: "SUBMITTED", revision: 0, evidence: { requestedResolution: "REFUND", customerComment: "Original review" } };
  const order = { tenant: "t", enterpriseCode: "market", ownerId: "buyer", code: "ORDER_ONE", status: "PLACED", revision: 0,
    totalAmount: "50.00", currency: "POINTS", evidence: {} };
  const entry = { tenant: "t", enterpriseCode: "market", ownerId: "buyer", orderCode: order.code, code: "ORDER_ONE:entry",
    productCode: "product", sku: "sku", quantity: "1", status: "PLACED" };
  const unit = { tenant: "t", enterpriseCode: "market", ownerId: "buyer", orderCode: order.code, code: "entitlement", revision: 0,
    productCode: "product", sku: "sku", status: "ACTIVE", claimStatus: "UNCLAIMED", providerOwner: "promotion", providerCode: "coupon",
    digitalDeliveryType: "COUPON_CODE", purchasePolicy: copy(policy), purchasedAt: new Date(policy.purchasedAt),
    validTo: new Date("2027-10-01T00:00:00.000Z"), evidence: {} };
  const coupon = { tenant: "t", enterpriseCode: "market", code: "coupon", revision: 1, soldTo: "buyer", orderCode: order.code,
    productCode: "product", sku: "sku", promotionCode: "campaign", status: "DELIVERED", benefitStatus: "UNCLAIMED",
    issuerEnterpriseRef: copy(policy.issuerEnterpriseRef), vendorEnterpriseRef: copy(policy.vendorEnterpriseRef),
    purchasePolicy: copy(policy), soldAt: unit.purchasedAt, validTo: unit.validTo };
  const capture = { tenant: "t", enterpriseCode: "market", ownerId: "buyer", orderCode: order.code, code: "capture",
    status: "CAPTURED", totalAmount: "50.00", currency: "POINTS", evidence: { operation: "CAPTURE", providerCode: "loyalty-reward-points",
      methodCode: "LOYALTY_REWARD", walletCode: "private-wallet", providerReference: "private-ledger" } };
  const pin = { tenant: "t", enterpriseCode: "market", ownerId: "buyer", orderCode: order.code, caseCode: row.code,
    amount: "50", currency: "POINTS", entitlementCode: unit.code, couponCode: coupon.code };
  const state = { row, order, unit, coupon, capture, pin, writes: [], revokes: 0, payments: 0, profileReads: 0,
    environment: "LOCAL", environmentName: "testLocal", role: "COMMERCE",
    config: { enabled: true, environmentNames: ["testLocal"], approvals: [pin] },
    permissions: ["commerce.dispute.review", "commerce.refund.exception.adjudicate", "commerce.refund.execute"],
    scope: { principalCode: "reviewer", scopes: [{ scopeType: "ENTERPRISE", scopeCode: "market" }], deniedScopes: [] } };
  const models = { cases: new Map([[row.code, row]]), orders: new Map([[order.code, order]]), entries: new Map([[entry.code, entry]]),
    units: new Map([[unit.code, unit]]), coupons: new Map([[coupon.code, coupon]]), captures: new Map([[capture.code, capture]]), reversals: new Map() };
  const store = name => ({ get: async r => {
    const result = [...models[name].values()].filter(row => matches(row, r.query)).map(copy);
    const value = { code: "SUC_FIND_00000", count: result.length, result };
    return state.onRead ? state.onRead(name, value, r) : value;
  }, save: async r => {
    if (models[name].has(r.model.code)) throw new Error("duplicate");
    models[name].set(r.model.code, copy(r.model)); state.writes.push({ name, model: copy(r.model) });
    return { code: "SUC_SAVE_00000", result: copy(r.model) };
  }, update: async r => {
    if (state.beforeWrite) await state.beforeWrite(name, r);
    const row = [...models[name].values()].find(row => matches(row, r.query));
    if (row) Object.assign(row, copy(r.model), { updated: new Date() });
    state.writes.push({ name, ...copy(r) });
    const value = { code: "SUC_UPDATE_00000", result: { acknowledged: true, matchedCount: row ? 1 : 0, modifiedCount: row ? 1 : 0 } };
    return state.onWrite ? state.onWrite(name, value, r) : value;
  } });
  global.CONFIG = { get: key => ({ runtimeRole: state.role, environment: { class: state.environment },
    order: { disputes: { enabled: true, orderCodePrefixes: ["ORDER_"] }, refunds: { enabled: true, orderCodePrefixes: ["ORDER_"], policyExceptions: state.config } },
    promotion: { purchasedRights: { enabled: true, qualified: true } } })[key] };
  global.NODICS = { getSelectedEnvironmentName: () => state.environmentName };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  global.SERVICE = {
    DefaultOrderRefundExceptionService: exception, DefaultOrderRefundRecoveryService: recovery, DefaultOrderDisputeService: dispute,
    DefaultOrderLifecycleService: require("../src/service/defaultOrderLifecycleService"),
    DefaultOrderLifecycleOperationService: require("../src/service/defaultOrderLifecycleOperationService"),
    DefaultOrderOperationService: require("../src/service/defaultOrderOperationService"),
    DefaultOrderLifecycleRequestService: store("cases"), DefaultCommerceOrderService: store("orders"), DefaultCommerceOrderEntryService: store("entries"),
    DefaultDigitalEntitlementService: store("units"), DefaultCouponService: store("coupons"), DefaultDigitalReversalService: store("reversals"),
    DefaultPaymentTransactionEntryService: store("captures"), DefaultDigitalCommerceEntitlementService: entitlement,
    DefaultDigitalCommerceRefundService: digital, DefaultExactAmountService: exact,
    DefaultLoggerService: { assertSensitiveRequest: () => {} },
    DefaultModuleService: { invokeModule: async () => { state.profileReads++; return state.profileResponse || { data: copy(state.scope) }; } },
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => state.permissions, isPermissionGranted: (p, grants) => grants.includes(p) },
    DefaultPromotionOperationService: { ...promotion, requireOperationalRuntime: () => {}, commitLifecycleCoupon: async (r, previous, next) => {
      assert.equal(previous.revision, coupon.revision); Object.assign(coupon, copy(next)); state.revokes++; return copy(coupon);
    } },
    DefaultPaymentRefundExecutionService: { ...payment,
      preflightOrder: async () => ({ eligible: true, captureCode: capture.code, amount: order.totalAmount, currency: order.currency }),
      refundOrder: async r => {
        await recovery.paymentAuthority(r, true); state.payments++;
        return { status: "REFUND_SUCCEEDED", transaction: { code: "original-refund" } };
      } },
  };
  return { request, state, models };
}
test.afterEach(() => { delete global.SERVICE; delete global.CONFIG; delete global.CLASSES; delete global.NODICS; });

test("default off, private management route independently requires exception permission", () => {
  assert.deepEqual(require("../config/properties").order.refunds.policyExceptions, { enabled: false, environmentNames: [], approvals: [] });
  const route = routers.order.disputes.refundException;
  assert.equal(route.key, "/disputes/:code/refund-exception"); assert.equal(route.method, "POST");
  assert.equal(route.permission, "commerce.refund.exception.adjudicate"); assert.equal(route.apiExposure, "commerceManagement");
  assert.deepEqual(route.accessGroups, ["employeeUserGroup"]); assert.deepEqual(route.requestPrivacy, { sensitive: true });
  assert.deepEqual(route.cache, { enabled: false });
});

test("exception permission is recognized by real Profile group governance without default assignment", t => {
  const auth = require("../../../../../../nodics.foundation/modules/nAuth/config/properties");
  const governance = require("../../../../../../nodics.platform/modules/profile/src/service/group/defaultUserGroupGovernanceService");
  const permission = "commerce.refund.exception.adjudicate", previous = global.CONFIG;
  t.after(() => { global.CONFIG = previous; });
  global.CONFIG = { get: key => key === "identityGovernance" ? auth.identityGovernance : undefined };
  assert(auth.identityGovernance.permissionCatalog.includes(permission));
  governance.validatePermissions([{ permissions: [permission] }]);
  for (const group of Object.values(auth.identityGovernance.migration.groupTargets))
    assert(!group.permissions?.includes(permission));
});

test("exact Local adjudication is immutable, audited, decimal-normalized and has no financial effects", async () => {
  const { request, state } = fixture(), before = copy({ unit: state.unit, coupon: state.coupon, order: state.order });
  const result = await exception.adjudicate(request);
  assert.deepEqual(result, { caseCode: "CASE", status: "SUBMITTED", revision: 1, exceptionCommandKey: request.idempotencyKey });
  assert.equal(state.row.evidence.refundPolicyException.amount, "50"); assert.equal(state.row.evidence.refundPolicyException.by, "reviewer");
  assert.equal(state.row.evidence.customerComment, "Original review"); assert.equal(state.writes.length, 1);
  assert.deepEqual(await exception.adjudicate(request), result); assert.equal(state.writes.length, 1);
  assert.deepEqual({ unit: state.unit, coupon: state.coupon, order: state.order }, before);
  assert.equal(state.payments, 0); assert.equal(state.revokes, 0); assert.equal(JSON.stringify(result).includes("private"), false);
});

test("existing refund orchestration consumes exact private adjudication, preserves terms and replays without effects", async () => {
  const { request, state, models } = fixture(), terms = copy(state.unit.purchasePolicy);
  assert.equal((await recovery.preview(request)).reason, "PURCHASE_REFUND_POLICY_REQUIRES_REVIEW");
  await exception.adjudicate(request);
  const preview = await recovery.preview(request); assert.equal(preview.eligible, true);
  const execute = { ...request, idempotencyKey: "original-refund-command", payload: { ...request.payload, expectedRevision: 1, previewToken: preview.previewToken } };
  const result = await recovery.execute(execute); assert.equal(result.status, "COMPLETED");
  assert.equal(state.payments, 1); assert.equal(state.revokes, 2); assert.equal(state.unit.status, "REVOKED");
  assert.deepEqual(state.unit.purchasePolicy, terms); assert.deepEqual(state.coupon.purchasePolicy, terms);
  const original = [...models.cases.values()].find(row => row.requestType === "REFUND");
  assert.equal(original.evidence.approval.policyException.commandKey, request.idempotencyKey);
  const revisions = copy({ case: state.row.revision, order: state.order.revision, unit: state.unit.revision, coupon: state.coupon.revision });
  await recovery.execute(execute);
  assert.deepEqual({ case: state.row.revision, order: state.order.revision, unit: state.unit.revision, coupon: state.coupon.revision }, revisions);
  assert.equal(state.payments, 1); assert.equal(state.revokes, 2);
});

for (const [name, change] of Object.entries({
  "disabled": f => { f.state.config.enabled = false; }, "nonLocal": f => { f.state.environment = "PRODUCTION"; },
  "Docker sibling": f => { f.state.environmentName = "testDockerLocal"; }, "wrong runtime": f => { f.state.role = "PLATFORM"; },
  "missing environment metadata": f => { f.state.environment = undefined; },
  "partial pin": f => { delete f.state.pin.couponCode; }, "duplicate pin": f => { f.state.config.approvals.push(copy(f.state.pin)); },
  "wrong case pin": f => { f.state.pin.caseCode = "OTHER"; }, "wrong buyer pin": f => { f.state.pin.ownerId = "other"; },
  "wrong amount pin": f => { f.state.pin.amount = "49"; }, "wrong currency pin": f => { f.state.pin.currency = "POINT"; },
  "wrong coupon pin": f => { f.state.pin.couponCode = "other"; }, "wrong entitlement pin": f => { f.state.pin.entitlementCode = "other"; },
  "missing exceptional permission": f => { f.state.permissions = ["commerce.dispute.review"]; },
  "customer principal": f => { f.request.authData.principalType = "customer"; },
  "explicit Profile DENY": f => { f.state.scope.deniedScopes = [{ scopeType: "ENTERPRISE", scopeCode: "market", permissionCode: "commerce.refund.exception.adjudicate" }]; },
  "failed Profile envelope": f => { f.state.profileResponse = { code: "ERR_SCOPE", data: f.state.scope }; },
  "nested failed Profile leaf": f => { f.state.profileResponse = { data: { code: "ERR_SCOPE", ...f.state.scope } }; },
  "stale revision": f => { f.request.payload.expectedRevision = 1; }, "unconfirmed": f => { f.request.payload.confirmed = false; },
  "caller amount": f => { f.request.payload.amount = "50"; }, "caller exception flag": f => { f.request.payload.exception = true; },
  "claimed entitlement": f => { f.state.unit.claimStatus = "CLAIMED"; }, "redeemed entitlement": f => { f.state.unit.claimStatus = "REDEEMED"; },
  "merchant evidence": f => { f.state.unit.evidence.merchantRedemption = {}; },
  "missing retained policy": f => { delete f.state.unit.purchasePolicy; },
  "explicit nonrefundable": f => { f.state.unit.purchasePolicy.refundPolicy = false; },
  "explicit normal policy": f => { f.state.unit.purchasePolicy.refundPolicy = { windowHours: 24, requestTypes: ["REFUND"] }; },
  "expired": f => { f.state.unit.validTo = new Date("2025-01-01"); },
  "coupon claimed": f => { f.state.coupon.benefitStatus = "CLAIMED"; },
  "coupon redeemed": f => { f.state.coupon.redeemedAt = new Date(); },
  "retained issuer drift": f => { f.state.coupon.issuerEnterpriseRef.code = "other"; },
  "retained vendor drift": f => { f.state.coupon.vendorEnterpriseRef.code = "other"; },
  "coupon policy drift": f => { f.state.coupon.purchasePolicy.terms.push("changed"); },
  "order lock": f => { f.state.order.evidence.refundCode = "other"; },
  "coupon lock": f => { f.state.coupon.refundReference = "other"; },
  "entitlement lock": f => { f.state.unit.evidence.refundCode = "other"; },
  "wrong capture provider": f => { f.state.capture.evidence.providerCode = "other"; },
  "wrong capture method": f => { f.state.capture.evidence.methodCode = "other"; },
  "split capture": f => { f.models.captures.set("capture2", { ...copy(f.state.capture), code: "capture2" }); },
  "multiple entitlements": f => { f.models.units.set("ent2", { ...copy(f.state.unit), code: "ent2" }); },
  "multiple entries": f => { f.models.entries.set("entry2", { ...copy([...f.models.entries.values()][0]), code: "entry2" }); },
})) test(`adjudication refuses ${name} before persistence/effects`, async () => {
  const f = fixture(); change(f); await assert.rejects(exception.adjudicate(f.request), failure);
  assert.equal(f.state.writes.length, 0); assert.equal(f.state.payments, 0); assert.equal(f.state.revokes, 0);
});

for (const kind of ["cases", "orders", "entries", "units", "coupons", "captures"]) {
  for (const defect of ["missing count", "truncated count", "failed code"]) test(`${kind} ${defect} cannot qualify`, async () => {
    const { request, state } = fixture(); state.onRead = (name, value) => {
      if (name === kind) { if (defect === "missing count") delete value.count;
        if (defect === "truncated count") value.count = 10; if (defect === "failed code") value.code = "ERR_READ"; }
      return value;
    };
    await assert.rejects(exception.adjudicate(request), failure); assert.equal(state.writes.length, 0);
  });
}

for (const ack of [ { code: "SUC_UPDATE", result: { matchedCount: 1 } },
  { code: "SUC_UPDATE", result: { acknowledged: false, matchedCount: 1 } },
  { code: "SUC_UPDATE", result: { code: "ERR_WRITE", acknowledged: true, matchedCount: 1 } } ]) {
  test("unconfirmed or failed nested write acknowledgement cannot report adjudication", async () => {
    const { request, state } = fixture(); state.onWrite = () => copy(ack);
    await assert.rejects(exception.adjudicate(request), failure); assert.equal(state.payments, 0); assert.equal(state.revokes, 0);
  });
}

test("same original command with changed reason cannot overwrite immutable adjudication", async () => {
  const { request, state } = fixture(); await exception.adjudicate(request);
  request.payload.reason = "A different exception reason";
  await assert.rejects(exception.adjudicate(request), failure); assert.equal(state.writes.length, 1);
});

test("concurrent adjudications use exact revision/evidence CAS and admit at most one", async () => {
  const { request, state } = fixture();
  const values = await Promise.allSettled([exception.adjudicate(request), exception.adjudicate({ ...request, idempotencyKey: "different-original-command" })]);
  assert.equal(values.filter(v => v.status === "fulfilled").length, 1); assert.equal(state.row.revision, 1);
  assert.equal(state.payments, 0); assert.equal(state.revokes, 0);
});

test("direct/flagged/cloned Digital preview or prepare cannot consume a persisted exception", async () => {
  const { request, state } = fixture(); await exception.adjudicate(request);
  const r = await recovery.load(request);
  assert.equal((await digital.preview({ ...r, policyException: state.row.evidence.refundPolicyException })).eligible, false);
  await assert.rejects(digital.prepare(r)); assert.equal(state.revokes, 0);
  const original = SERVICE.DefaultDigitalCommerceRefundService;
  SERVICE.DefaultDigitalCommerceRefundService = { ...original, preview: async context => original.preview({ ...context }) };
  assert.equal((await recovery.preview(request)).eligible, false); assert.equal(state.revokes, 0);
});

test("changed config, current exceptional DENY and policy drift are revalidated after adjudication", async () => {
  for (const change of [state => { state.config.enabled = false; }, state => { state.scope.deniedScopes = [{ scopeType: "GLOBAL", scopeCode: "*", permissionCode: "commerce.refund.exception.adjudicate" }]; },
    state => { state.unit.purchasePolicy.terms.push("changed"); state.coupon.purchasePolicy = copy(state.unit.purchasePolicy); }]) {
    const { request, state } = fixture(); await exception.adjudicate(request); change(state);
    assert.equal((await recovery.preview(request)).eligible, false); assert.equal(state.payments, 0); assert.equal(state.revokes, 0);
  }
});

test("delegated stock keeps issuer/vendor distinct from marketplace and validates real purchasedCampaign", async () => {
  const { request, state } = fixture();
  state.coupon.enterpriseCode = "vendor";
  state.coupon.vendorEnterpriseRef.code = "vendor";
  state.coupon.purchasePolicy.vendorEnterpriseRef.code = "vendor";
  state.unit.purchasePolicy.vendorEnterpriseRef.code = "vendor";
  assert.equal((await exception.adjudicate(request)).status, "SUBMITTED");
  assert.equal(request.authData.entCode, "market"); assert.equal(state.coupon.enterpriseCode, "vendor");
  state.coupon.vendorEnterpriseRef.code = "drift";
  assert.equal((await recovery.preview(request)).eligible, false);
});

test("configuration changed during owner evidence reads refuses before adjudication persistence", async () => {
  const { request, state } = fixture();
  state.onRead = (name, value) => {
    if (name === "captures") state.config.approvals[0].amount = "51";
    return value;
  };
  await assert.rejects(exception.adjudicate(request), failure);
  assert.equal(state.writes.length, 0);
  assert.equal(state.payments, 0);
  assert.equal(state.revokes, 0);
});

test("controller response and errors are no-store and omit private capture or policy evidence", async () => {
  const { request, state } = fixture(), headers = {};
  const http = { ...request, httpRequest: { params: { code: request.code }, body: request.payload,
    headers: { authorization: request.authorization, "idempotency-key": request.idempotencyKey } },
    httpResponse: { setHeader: (key, value) => { headers[key] = value; } } };
  assert.equal((await controller.refundException(http)).data.revision, 1); assert.equal(headers["Cache-Control"], "no-store");
  assert.equal(state.payments, 0);
  http.httpRequest.query = { amount: "50" };
  await assert.rejects(controller.refundException(http), failure);
});

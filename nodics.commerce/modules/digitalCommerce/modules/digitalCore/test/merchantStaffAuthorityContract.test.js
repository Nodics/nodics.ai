/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/test/merchantStaffAuthorityContract @description Exercises real merchant staff admission against failed Profile envelopes, conflicting signed aliases, malformed denial evidence and asynchronous caller mutation. Isolated owner ports are not native acceptance. @layer test @owner digitalCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const merchant = require("../src/service/defaultDigitalCommerceMerchantService");
const profileScopes = require("../../../../../../nodics.platform/modules/profile/src/service/identity/defaultPrincipalScopeGovernanceService");

/** Installs isolated Profile/permission ports and restores process globals. @param {Object} t Test context. @returns {Object} Signed request and mutable owner ports. */
function fixture(t) {
  const original = { CONFIG: global.CONFIG, CLASSES: global.CLASSES, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, original));
  const r = {
    tenant: "tenant", enterpriseCode: "issuer", authorization: "Bearer fixture-access",
    authData: { tenant: "tenant", enterpriseCode: "issuer", entCode: "issuer",
      principalType: "human", loginId: "employee", tokenType: "access" },
    payload: { merchantReceiptReference: "ORIGINAL" },
    scopes: { scopes: [{ scopeType: "GLOBAL", scopeCode: "*" }], deniedScopes: [] },
  };
  const value = { principalCode: "employee", principalType: "human", scopeCount: 1,
    scopes: [{ scopeType: "ENTERPRISE", scopeCode: "issuer", effect: "ALLOW" }], deniedScopes: [] };
  const state = { value, calls: [], reads: 0, respond: () => ({ code: "SUC_PROFILE", result: value }) };
  global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) { super(message); this.code = code; }
  } };
  global.CONFIG = { get: (key) => key === "runtimeRole" ? "COMMERCE" :
    key === "digitalCore" ? { merchantRedemption: { enabled: true } } : undefined };
  global.SERVICE = {
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: () => ["commerce.coupon.pos.redeem"],
      isPermissionGranted: (permission, granted) => granted.includes(permission) || granted.includes("*"),
    },
    DefaultModuleService: { invokeModule: async (request) => {
      state.calls.push(request); return state.respond();
    } },
    DefaultPromotionOperationService: { merchantCoupon: async () => {
      state.reads++; throw new Error("unexpected stock access");
    } },
  };
  return { r, state };
}

test("merchant staff resolves original bearer and issuer scope without substituting the vendor", async (t) => {
  const { r, state } = fixture(t);
  state.respond = () => ({ code: "SUC_PROFILE", result: { data: state.value } });
  const result = await merchant.staff(r);
  assert.deepEqual(result.authData, r.authData);
  assert.equal(result.enterpriseCode, "issuer");
  assert.deepEqual(result.scopes, state.value);
  assert.equal(state.calls.length, 1);
  assert.equal(state.calls[0].apiName, "/identity/scopes/me");
  assert.deepEqual(state.calls[0].header, {
    Authorization: r.authorization, "X-Enterprise-Code": "issuer",
  });
  assert.equal(state.calls[0].maxAttempts, 1);
  assert.equal(merchant.scoped(result, { enterpriseCode: "issuer" }), true);
  assert.equal(merchant.scoped(result, { enterpriseCode: "vendor" }), false);
});

for (const [name, envelope] of [
  ["failed success", (value) => ({ success: false, data: value })],
  ["negative acknowledgement", (value) => ({ acknowledged: false, data: value })],
  ["error code", (value) => ({ code: "ERR_PROFILE", result: value })],
  ["error marker", (value) => ({ error: "denied", result: value })],
  ["error list", (value) => ({ errors: ["denied"], data: value })],
  ["malformed error list", (value) => ({ errors: {}, result: value })],
  ["nested failure", (value) => ({ code: "SUC_TRANSPORT", result: { success: false, data: value } })],
  ["depth-limit failure", (value) => {
    let result = { ...value, error: "denied" };
    for (let n = 0; n < 7; n++) result = { result };
    return result;
  }],
  ["excessive depth", (value) => {
    let result = value;
    for (let n = 0; n < 8; n++) result = { result };
    return result;
  }],
]) {
  test(`merchant staff refuses ${name} before any coupon lookup`, async (t) => {
    const { r, state } = fixture(t);
    state.respond = () => envelope(state.value);
    await assert.rejects(merchant.validate(r), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
    assert.equal(state.reads, 0);
  });
}

for (const [name, change] of [
  ["request tenant alias", (r) => { r.tenantCode = "other"; }],
  ["signed tenant", (r) => { r.authData.tenant = "other"; }],
  ["signed tenant alias", (r) => { r.authData.tenantCode = "other"; }],
  ["request enterprise", (r) => { r.enterpriseCode = "vendor"; }],
  ["request enterprise alias", (r) => { r.entCode = "vendor"; }],
  ["signed enterprise alias", (r) => { r.authData.entCode = "vendor"; }],
  ["empty signed alias", (r) => { r.authData.entCode = ""; }],
  ["refresh token", (r) => { r.authData.tokenType = "refresh"; }],
  ["non-bearer transport", (r) => { r.authorization = "Basic fixture"; }],
  ["header injection", (r) => { r.authorization = "Bearer fixture\r\nX-Enterprise-Code: vendor"; }],
  ["malformed staff identity", (r) => { r.authData.loginId = " employee"; }],
]) {
  test(`merchant admission rejects ${name} before Profile or persistence`, async (t) => {
    const { r, state } = fixture(t);
    change(r);
    await assert.rejects(merchant.staff(r), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
    assert.equal(state.calls.length, 0);
    assert.equal(state.reads, 0);
  });
}

for (const [name, change] of [
  ["different principal", (v) => { v.principalCode = "another-employee"; }],
  ["different principal type", (v) => { v.principalType = "service"; }],
  ["incomplete scope count", (v) => { v.scopeCount = 2; }],
  ["missing denials", (v) => { delete v.deniedScopes; }],
  ["malformed denial", (v) => { v.deniedScopes = [null]; }],
  ["sparse denial", (v) => { v.deniedScopes = new Array(1); }],
  ["missing denial selector", (v) => { v.deniedScopes = [{ scopeType: "ENTERPRISE" }]; }],
  ["malformed denial qualifier", (v) => { v.deniedScopes = [{ scopeType: "ENTERPRISE", scopeCode: "issuer", permissionCode: {} }]; }],
  ["denial in allow list", (v) => { v.scopes[0].effect = "DENY"; }],
  ["allow in denial list", (v) => { v.deniedScopes = [{ scopeType: "ENTERPRISE", scopeCode: "issuer", effect: "ALLOW" }]; }],
  ["inactive evidence", (v) => { v.scopes[0].status = "INACTIVE"; }],
  ["unbounded evidence", (v) => { v.deniedScopes = Array(1000).fill({ scopeType: "ENTERPRISE", scopeCode: "other" }); }],
]) {
  test(`merchant admission refuses ${name}, never silently discarding a denial`, async (t) => {
    const { r, state } = fixture(t);
    change(state.value);
    await assert.rejects(merchant.staff(r), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
    assert.equal(state.reads, 0);
  });
}

test("each admission refreshes Profile authority and detaches its result from caller and response mutation", async (t) => {
  const { r, state } = fixture(t);
  let complete;
  state.respond = () => new Promise((resolve) => { complete = resolve; });
  const pending = merchant.staff(r);
  r.authData.enterpriseCode = "vendor";
  r.authData.loginId = "intruder";
  r.payload.merchantReceiptReference = "CHANGED";
  complete({ result: state.value });
  const first = await pending;
  assert.equal(first.authData.enterpriseCode, "issuer");
  assert.equal(first.authData.loginId, "employee");
  assert.equal(first.payload.merchantReceiptReference, "ORIGINAL");
  state.value.deniedScopes.push({ scopeType: "ENTERPRISE", scopeCode: "issuer" });
  assert.equal(merchant.scoped(first, { enterpriseCode: "issuer" }), true);
  state.respond = () => ({ result: state.value });
  const second = await merchant.staff({ ...first, scopes: r.scopes });
  assert.equal(merchant.scoped(second, { enterpriseCode: "issuer" }), false);
  assert.equal(state.calls.length, 2);
});

test("the supported envelope-depth boundary still validates its terminal scope result", async (t) => {
  const { r, state } = fixture(t);
  state.respond = () => {
    let result = state.value;
    for (let n = 0; n < 7; n++) result = { code: "SUC_WRAPPER", result };
    return result;
  };
  assert.equal(merchant.scoped(await merchant.staff(r), { enterpriseCode: "issuer" }), true);
});

test("actual Profile-resolved blank optional qualifiers keep their unrestricted ALLOW and DENY semantics", async (t) => {
  const { r, state } = fixture(t);
  const profile = { ...profileScopes, getPolicy: () => ({
    defaultEffect: "ALLOW", defaultStatus: "ACTIVE", defaultInheritanceMode: "DIRECT",
  }) };
  const assignment = { code: "scope", principalType: "human", principalCode: "employee",
    scopeType: "ENTERPRISE", scopeCode: "issuer", tenantCode: "tenant", enterpriseCode: "issuer",
    permissionCode: "", capabilityCode: null, effect: "ALLOW", status: "ACTIVE" };
  state.respond = () => ({ result: profile.resolveAssignments(r.authData, [assignment]) });
  assert.equal(merchant.scoped(await merchant.staff(r), { enterpriseCode: "issuer" }), true);
  state.respond = () => ({ result: profile.resolveAssignments(r.authData, [
    assignment, { ...assignment, code: "deny", effect: "DENY", permissionCode: null, capabilityCode: "" },
  ]) });
  assert.equal(merchant.scoped(await merchant.staff(r), { enterpriseCode: "issuer" }), false);
});

test("wildcard capability denial wins and enterprise-qualified Store grants cannot escape their enterprise", async (t) => {
  const { r, state } = fixture(t);
  state.value.scopes = [{ scopeType: "STORE", scopeCode: "outlet", enterpriseCode: "issuer", capabilityCode: "*" }];
  const staff = await merchant.staff(r);
  const outlet = { enterpriseCode: "issuer", store: { code: "outlet" } };
  assert.equal(merchant.scoped(staff, outlet), true);
  assert.equal(merchant.scoped(staff, { ...outlet, enterpriseCode: "vendor" }), false);
  state.value.deniedScopes = [{ scopeType: "GLOBAL", scopeCode: "*", capabilityCode: "*", permissionCode: "*" }];
  assert.equal(merchant.scoped(await merchant.staff(r), outlet), false);
});

test("missing permission owner is a typed refusal before Profile access", async (t) => {
  const { r, state } = fixture(t);
  delete SERVICE.DefaultSecuredRequestPipelineService;
  await assert.rejects(merchant.staff(r), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
  assert.equal(state.calls.length, 0);
});

/** Supplies an original coupon-backed entitlement for exact owner read regressions. @returns {Object} Persisted fixture identity. */
function purchased() {
  return { code: "entitlement", tenant: "tenant", enterpriseCode: "issuer", ownerId: "buyer@example.test",
    productCode: "product", orderCode: "order", providerOwner: "promotion", providerCode: "batch:1", revision: 1,
    status: "ACTIVE", claimStatus: "UNCLAIMED" };
}

for (const [name, patch] of [
  ["foreign tenant", { tenant: "foreign" }],
  ["absent persisted tenant", { tenant: undefined }],
  ["foreign operational enterprise", { enterpriseCode: "vendor" }],
  ["different entitlement", { code: "different" }],
  ["different provider", { providerOwner: "wasteCore" }],
  ["absent provider unit", { providerCode: undefined }],
  ["missing original order", { orderCode: undefined }],
  ["missing buyer", { ownerId: "" }],
  ["invalid revision", { revision: -1 }],
]) {
  test(`merchant entitlement read rejects ${name} even behind a successful owner response`, async (t) => {
    const { r, state } = fixture(t);
    SERVICE.DefaultDigitalCommerceEntitlementService = {
      listEntitlements: async () => [{ ...purchased(), ...patch }],
    };
    await assert.rejects(merchant.entitlement({ ...r, code: "entitlement" }, false), {
      code: "ERR_DIGITAL_MERCHANT_INVALID",
    });
    assert.equal(state.calls.length, 0);
    assert.equal(state.reads, 0);
  });
}

test("customer entitlement lookup independently verifies the persisted buyer", async (t) => {
  const { r } = fixture(t);
  SERVICE.DefaultDigitalCommerceEntitlementService = { listEntitlements: async () => [purchased()] };
  const owned = { ...r, code: "entitlement", ownerId: "buyer@example.test" };
  assert.equal((await merchant.entitlement(owned, true)).ownerId, owned.ownerId);
  await assert.rejects(merchant.entitlement({ ...owned, ownerId: "other-buyer" }, true), {
    code: "ERR_DIGITAL_MERCHANT_INVALID",
  });
});

for (const [name, patch] of [
  ["unit code", { code: "another:1" }],
  ["tenant", { tenant: "foreign" }],
  ["operational enterprise", { enterpriseCode: "vendor" }],
  ["buyer", { soldTo: "other-buyer" }],
  ["Product", { productCode: "other-product" }],
  ["original Order", { orderCode: "other-order" }],
]) {
  test(`merchant issuer lookup refuses a coupon with mismatched ${name} before reading Profile`, async (t) => {
    const { r, state } = fixture(t), item = purchased();
    SERVICE.DefaultPromotionOperationService.merchantCoupon = async () => ({
      code: item.providerCode, tenant: item.tenant, enterpriseCode: item.enterpriseCode,
      soldTo: item.ownerId, productCode: item.productCode, orderCode: item.orderCode,
      issuerEnterpriseRef: { moduleName: "profile", schemaName: "enterprise", code: "issuer" }, ...patch,
    });
    await assert.rejects(merchant.merchant(r, item), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
    assert.equal(state.calls.length, 0);
  });
}

test("merchant issuer business Tenant does not replace the unchanged routed lookup partition", async (t) => {
  const { r, state } = fixture(t), item = purchased();
  SERVICE.DefaultPromotionOperationService.merchantCoupon = async () => ({
    code: item.providerCode, tenant: item.tenant, enterpriseCode: item.enterpriseCode,
    soldTo: item.ownerId, productCode: item.productCode, orderCode: item.orderCode,
    issuerEnterpriseRef: { moduleName: "profile", schemaName: "enterprise", code: "issuer" },
  });
  state.respond = () => ({ result: [{ code: "issuer", tenant: "issuerBusinessTenant", active: true }] });
  assert.equal((await merchant.merchant(r, item)).enterpriseCode, "issuer");
  assert.equal(state.calls[0].tenant, r.tenant);
  assert.deepEqual(state.calls[0].request, { tenant: r.tenant });
  assert.deepEqual(state.calls[0].requestBody, { type: "enterprise", codes: ["issuer"] });
  state.respond = () => ({ result: [{ code: "anotherIssuer", tenant: "issuerBusinessTenant" }] });
  await assert.rejects(merchant.merchant(r, item), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
});

test("later-layer entitlement admission narrows the actual merchant read through its exported member", async (t) => {
  const { r } = fixture(t);
  SERVICE.DefaultDigitalCommerceEntitlementService = { listEntitlements: async () => [purchased()] };
  let checks = 0;
  const narrowed = { ...merchant, assertEntitlement: function (request, item, owned) {
    checks++;
    merchant.assertEntitlement.call(this, request, item, owned);
    this.fail("Customer policy requires an additional purchase review");
  } };
  await assert.rejects(narrowed.entitlement({ ...r, code: "entitlement" }, false), {
    code: "ERR_DIGITAL_MERCHANT_INVALID", message: "Customer policy requires an additional purchase review",
  });
  assert.equal(checks, 1);
});

test("merchant instruction CAS binds full original scope, lifecycle and claim state before exact readback", async (t) => {
  const { r } = fixture(t), item = purchased(), patch = { evidence: { marker: "original" } };
  let saved;
  SERVICE.DefaultDigitalCommerceEntitlementService = {
    serviceAuthData: (request) => ({ enterpriseCode: request.enterpriseCode, principalType: "service" }),
    listEntitlements: async () => [saved],
  };
  SERVICE.DefaultDigitalEntitlementService = { update: async (request) => {
    assert.deepEqual(request.query, { tenant: "tenant", enterpriseCode: "issuer", code: "entitlement",
      revision: 1, status: "ACTIVE", claimStatus: "UNCLAIMED" });
    saved = { ...item, ...request.model };
    return { code: "SUC_UPDATE", result: { acknowledged: true, matchedCount: 1 } };
  } };
  assert.equal((await merchant.update(r, item, patch)).revision, 2);
  SERVICE.DefaultDigitalEntitlementService.update = async () => ({
    code: "SUC_UPDATE", result: { acknowledged: true, matchedCount: 0 },
  });
  await assert.rejects(merchant.update(r, item, patch), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
});

for (const [name, patch] of [
  ["revision overflow", { revision: Number.MAX_SAFE_INTEGER }],
  ["revoked lifecycle", { status: "REVOKED" }],
  ["already redeemed claim", { claimStatus: "REDEEMED" }],
]) {
  test(`merchant instruction refuses ${name} before generated persistence`, async (t) => {
    const { r } = fixture(t);
    let writes = 0;
    SERVICE.DefaultDigitalEntitlementService = { update: async () => { writes++; } };
    await assert.rejects(merchant.update(r, { ...purchased(), ...patch }, { evidence: {} }), {
      code: "ERR_DIGITAL_MERCHANT_INVALID",
    });
    assert.equal(writes, 0);
  });
}

for (const key of ["providerCode", "ownerId", "productCode", "orderCode", "purchasePolicy"]) {
  test(`merchant instruction cannot acknowledge changed persisted ${key}`, async (t) => {
    const { r } = fixture(t), item = purchased(), patch = { evidence: { marker: "original" } };
    SERVICE.DefaultDigitalCommerceEntitlementService = {
      serviceAuthData: (request) => ({ enterpriseCode: request.enterpriseCode, principalType: "service" }),
      listEntitlements: async () => [{ ...item, ...patch, revision: 2,
        [key]: key === "purchasePolicy" ? { altered: true } : "changed" }],
    };
    SERVICE.DefaultDigitalEntitlementService = { update: async () => ({
      code: "SUC_UPDATE", result: { acknowledged: true, matchedCount: 1 },
    }) };
    await assert.rejects(merchant.update(r, item, patch), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
  });
}

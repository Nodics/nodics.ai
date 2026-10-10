/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/test/merchantValidationDiagnosticsContract @description Proves validation diagnostics retain only owner-minted fixed stages, never private error text. @layer test @owner digitalCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const merchant = require("../src/service/defaultDigitalCommerceMerchantService");
const controller = require("../src/controller/defaultDigitalCommerceMerchantController");
const diagnostics = require("../src/utils/merchantValidationDiagnostics");
const promotion = require("../../../../baseCommerce/modules/promotion/src/service/defaultPromotionOperationService");
const statuses = require("../src/utils/statusDefinitions");
const router = require("../../../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterOperationService");

function fixture(t) {
  const prior = { SERVICE: global.SERVICE, FACADE: global.FACADE, CLASSES: global.CLASSES, CONFIG: global.CONFIG };
  t.after(() => Object.assign(global, prior));
  global.CLASSES = { NodicsError: class extends Error {
    constructor(value) { super(typeof value === "object" ? value.message : value); this.code = value.code || value; }
  } };
  global.SERVICE = { DefaultDigitalCommerceMerchantService: merchant,
    DefaultLoggerService: { assertSensitiveRequest() {}, inheritRequestPrivacy() {} } };
  const request = { httpRequest: { body: { couponToken: "private-token" } }, httpResponse: { setHeader() {} } };
  return request;
}

test("controller emits only the fixed owner stage for an actual validation failure", async (t) => {
  const request = fixture(t), privateError = new Error("private-token private-owner-record");
  const owner = { ...merchant, staff: async () => { throw privateError; } };
  global.FACADE = { DefaultDigitalCommerceMerchantFacade: { validate: (input) => owner.validate(input) } };
  await assert.rejects(controller.validate(request), {
    code: diagnostics.codes.STAFF, message: "Merchant validation failed at owner stage STAFF",
  });
  assert.equal(merchant.validationDiagnostic(privateError), "STAFF");
  assert.equal(merchant.validationDiagnostic({ ...privateError, stage: "STAFF" }), undefined);
});

test("forged diagnostic fields and private remote messages remain masked", async (t) => {
  const request = fixture(t);
  global.FACADE = { DefaultDigitalCommerceMerchantFacade: { validate: async () => {
    throw Object.assign(new Error("private-token private-owner-record"), { stage: "RIGHTS", diagnostic: "RIGHTS" });
  } } };
  await assert.rejects(controller.validate(request), {
    code: "ERR_DIGITAL_MERCHANT_INVALID", message: "ERR_DIGITAL_MERCHANT_INVALID",
  });
});

test("a validation diagnostic is never reused by another merchant operation", async (t) => {
  const request = fixture(t), error = new Error("private-record");
  await assert.rejects(({ ...merchant, staff: async () => { throw error; } }).validate({}));
  global.FACADE = { DefaultDigitalCommerceMerchantFacade: { confirm: async () => { throw error; } } };
  await assert.rejects(controller.confirm(request), {
    code: "ERR_DIGITAL_MERCHANT_INVALID", message: "ERR_DIGITAL_MERCHANT_INVALID",
  });
});

test("only an original confirmation failure selects the private confirmation stage", async t => {
  const request = fixture(t), error = new Error("private-token private-record");
  const owner = { ...merchant, staff: async () => { throw error; } };
  global.FACADE = { DefaultDigitalCommerceMerchantFacade: { confirm: input => owner.confirm(input) } };
  await assert.rejects(controller.confirm(request), { code: diagnostics.codes["CONFIRM:AUTHORITY"],
    message: "Merchant confirmation failed at owner stage CONFIRM:AUTHORITY" });
  assert.equal(merchant.confirmationDiagnostic(error), "AUTHORITY");
  assert.equal(merchant.confirmationDiagnostic({ ...error, stage: "AUTHORITY" }), undefined);
  global.FACADE.DefaultDigitalCommerceMerchantFacade.confirm = async () => { throw Object.assign(new Error("private-record"), { stage: "AUTHORITY" }); };
  await assert.rejects(controller.confirm(request), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
});

for (const [stage, member, operation] of [
  ["ISSUER_ADMISSION", "admitDelegation"], ["COUPON", "execute", "coupon"],
  ["ENTITLEMENT", "execute", "entitlement"], ["MERCHANT", "merchant"],
  ["STORE", "withStore"], ["SCOPE", "scoped"], ["RIGHTS", "validateCoupon"],
  ["VALIDATION_BINDING", "validationCode"],
]) {
  test(`validation records ${stage} without modifying the private failure`, async (t) => {
    fixture(t);
    const error = new Error("private-token private-owner-record"),
      item = { providerCode: "coupon", status: "ACTIVE", claimStatus: "UNCLAIMED" };
    const delegation = { execute: async (request, name) => {
      if (member === "execute" && operation === name) throw error;
      return name === "coupon" ? { code: "coupon" } : item;
    } };
    const owner = { ...merchant, staff: async () => ({ payload: { couponToken: "private-token" }, authData: { loginId: "staff" } }),
      nativePricingSelected: () => false, admitDelegation: async () => true,
      delegation: () => delegation, assertEntitlement() {}, merchant: async () => ({}),
      withStore: async () => ({}), scoped: () => true, validateCoupon: async () => ({ conditions: {} }),
      summary: () => ({}), validationCode: () => "validation", pricedBinding: () => undefined };
    if (member !== "execute") owner[member] = () => { throw error; };
    await assert.rejects(owner.validate({}), (value) => value === error);
    assert.equal(merchant.validationDiagnostic(error), stage);
    assert.equal(error.message, "private-token private-owner-record");
    assert.deepEqual(Object.keys(error), []);
  });
}

for (const [admission, expected] of [["TOKEN_READ", ":TOKEN_READ"], ["private-token", ""]]) {
  test(`controller bounds Promotion admission substage ${expected || "unknown"}`, async (t) => {
    const request = fixture(t), error = new Error("private-record");
    const owner = { ...merchant, staff: async () => ({ payload: { couponToken: "private-token" } }),
      nativePricingSelected: () => false, admitDelegation: async () => { throw error; } };
    global.SERVICE.DefaultPromotionMerchantScopeService = { admissionFailureStage: (value) => value === error ? admission : undefined };
    global.FACADE = { DefaultDigitalCommerceMerchantFacade: { validate: (input) => owner.validate(input) } };
    await assert.rejects(controller.validate(request), {
      code: diagnostics.codes["ISSUER_ADMISSION" + expected], message: "Merchant validation failed at owner stage ISSUER_ADMISSION" + expected,
    });
  });
}

test("actual private router emits only registered validation statuses and not private error text", (t) => {
  fixture(t);
  global.SERVICE.DefaultLoggerService.isSensitiveRequest = () => true;
  global.SERVICE.DefaultStatusService = { get: (code) => statuses[code] };
  for (const code of Object.values(diagnostics.codes)) {
    let body, http;
    const response = { status(value) { http = value; return this; }, json(value) { body = value; } };
    assert.equal(router.sendPrivateError({}, response, { code, message: "private-token private-owner-record" }), true);
    assert.equal(http, 400);
    assert.deepEqual(body, { responseCode: "400", code, message: statuses[code].message });
  }
  assert.equal(new Set(Object.values(diagnostics.codes)).size, 87);
});

test("confirmation controller selects only the original private budget failure stage", async t => {
  const request = fixture(t), privateError = new Error("private-coupon private-transaction");
  const bridge = require("../../../../baseCommerce/modules/promotion/src/service/defaultPromotionCouponBudgetService");
  await assert.rejects(({ ...bridge, handoff: async () => { throw privateError; } }).execute({}, "COMMIT"));
  global.SERVICE.DefaultPromotionCouponBudgetService = bridge;
  global.SERVICE.DefaultDigitalCommerceMerchantService = { confirmationDiagnostic: error => error === privateError ? "REDEEM" : undefined };
  global.FACADE = { DefaultDigitalCommerceMerchantFacade: { confirm: async () => { throw privateError; } } };
  await assert.rejects(controller.confirm(request), { code: diagnostics.codes["CONFIRM:REDEEM:BUDGET_HANDOFF"],
    message: "Merchant confirmation failed at owner stage CONFIRM:REDEEM:BUDGET_HANDOFF" });
  global.FACADE.DefaultDigitalCommerceMerchantFacade.confirm = async () => { throw { ...privateError, stage: "BUDGET_HANDOFF" }; };
  await assert.rejects(controller.confirm(request), { code: "ERR_DIGITAL_MERCHANT_INVALID" });
});

for (const substage of ["COUPON_READ", "COUPON_BINDING", "CAMPAIGN", "WINDOW", "CONDITIONS", "BENEFIT"]) {
  test(`original Promotion rights failure retains only ${substage}`, async t => {
    fixture(t);
    const privateError = new Error("private-coupon private-record");
    const coupon = { soldTo: "buyer", productCode: "product", status: "DELIVERED" };
    const campaign = { status: "ACTIVE", actions: {} };
    const owner = { ...promotion, serviceAuthData: () => ({}), enterpriseQuery: (_, query) => query,
      getOne: async () => { if (substage === "COUPON_READ") throw privateError; return coupon; },
      merchantCampaign: async () => { if (substage === "CAMPAIGN") throw privateError; return campaign; },
      purchasedCampaign: (_, current) => current, assertSupportedCouponBenefit() {},
      validateMerchantConditions() { if (substage === "CONDITIONS") throw privateError; } };
    global.CONFIG = { get: () => ({ merchantBenefits: { enabled: true } }) };
    global.SERVICE.DefaultPromotionMerchantBenefitService = { validate: async () => { throw privateError; } };
    if (substage === "COUPON_BINDING") coupon.soldTo = "other";
    if (substage === "WINDOW") coupon.validTo = "invalid";
    let failure;
    await assert.rejects(owner.validateMerchantCoupon({ ownerId: "buyer", productCode: "product" }), error => {
      failure = error;
      assert.equal(promotion.merchantValidationFailureStage(error), substage);
      assert.equal(promotion.merchantValidationFailureStage({ ...error, stage: substage }), undefined);
      return true;
    });
    global.SERVICE.DefaultPromotionOperationService = promotion;
    const merchantOwner = { ...merchant, staff: async () => ({ payload: { couponToken: "private-token" } }),
      nativePricingSelected: () => false, admitDelegation: async () => true,
      delegation: () => ({ execute: async (_, action) => action === "coupon" ? { code: "coupon" } :
        { providerCode: "coupon", status: "ACTIVE", claimStatus: "UNCLAIMED" } }),
      assertEntitlement() {}, merchant: async () => ({}), withStore: async () => ({}), scoped: () => true,
      validateCoupon: async () => { throw failure; } };
    global.FACADE = { DefaultDigitalCommerceMerchantFacade: { validate: input => merchantOwner.validate(input) } };
    await assert.rejects(controller.validate({ httpRequest: { body: {} }, httpResponse: { setHeader() {} } }), {
      code: diagnostics.codes["RIGHTS:" + substage], message: "Merchant validation failed at owner stage RIGHTS:" + substage });
  });
}

for (const stage of ["RETAINED_UNIT", "COUPON_READ", "COUPON_BINDING", "ISSUER_REFERENCE", "PROFILE_READ", "PROFILE_RESULT"]) {
  test(`merchant resolution retains only the original ${stage} failure stage`, async (t) => {
    fixture(t);
    const error = new Error("private-record"), r = { enterpriseCode: "issuer" },
      item = { enterpriseCode: "issuer", tenant: "tenant", providerCode: "coupon", ownerId: "buyer", productCode: "product", orderCode: "order" },
      coupon = { code: "coupon", tenant: "tenant", enterpriseCode: "issuer", soldTo: "buyer", productCode: "product", orderCode: "order",
        issuerEnterpriseRef: { moduleName: "profile", schemaName: "enterprise", code: "issuer" } };
    global.SERVICE.DefaultPromotionOperationService = { merchantCoupon: async () => {
      if (stage === "COUPON_READ") throw error;
      return coupon;
    } };
    global.SERVICE.DefaultModuleService = { invokeModule: async () => {
      if (stage === "PROFILE_READ") throw error;
      return stage === "PROFILE_RESULT" ? { code: "ERR_PROFILE", message: "private-record" } : [{ code: "issuer", active: true }];
    } };
    if (stage === "COUPON_BINDING") coupon.orderCode = "other-order";
    if (stage === "ISSUER_REFERENCE") coupon.issuerEnterpriseRef.schemaName = "other-schema";
    const owner = { ...merchant, assertEntitlement() { if (stage === "RETAINED_UNIT") throw error; } };
    await assert.rejects(owner.merchant(r, item), (failure) => {
      assert.equal(merchant.merchantFailureStage(failure), stage);
      assert.equal(merchant.merchantFailureStage({ ...failure }), undefined);
      return true;
    });
  });
}

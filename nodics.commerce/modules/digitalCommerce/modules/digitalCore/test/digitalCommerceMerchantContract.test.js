/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module digitalCore/test/digitalCommerceMerchantContract @description Verifies the Axis-only enterprise employee coupon journey, Profile scope denial, presented-code validation, immutable receipts and interrupted redemption recovery. @layer test @owner digitalCore */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  merchant = require("../src/service/defaultDigitalCommerceMerchantService"),
  entitlements = require("../src/service/defaultDigitalCommerceEntitlementService"),
  provider = require("../src/service/defaultDigitalCommerceMerchantScreenProviderService");
let row, coupon, scope, receipts, failRedeem, permission;
const clone = (x) => structuredClone(x);
function employee(payload = {}) {
  return {
    tenant: "runtime",
    code: "entitlement",
    authData: {
      principalType: "human",
      loginId: "employee",
      entCode: "partition",
    },
    authorization: "Bearer example",
    idempotencyKey: "confirm:entitlement",
    payload: {
      confirmed: true,
      merchantReceiptReference: "SALE-123",
      ...payload,
    },
  };
}
test.beforeEach(() => {
  row = {
    code: "entitlement",
    enterpriseCode: "partition",
    ownerId: "buyer",
    status: "ACTIVE",
    claimStatus: "UNCLAIMED",
    providerOwner: "promotion",
    providerCode: "coupon",
    productCode: "product",
    orderCode: "order",
    revision: 0,
    evidence: {},
  };
  coupon = "DELIVERED";
  scope = {
    principalCode: "employee",
    scopes: [{ scopeType: "ENTERPRISE", scopeCode: "merchant-enterprise" }],
    deniedScopes: [],
  };
  receipts = new Map();
  failRedeem = false;
  permission = true;
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(c, m) {
        super(m);
        this.code = c;
      }
    },
  };
  global.CONFIG = {
    get: (key) =>
      key === "runtimeRole"
        ? "COMMERCE"
        : { merchantRedemption: { enabled: true } },
  };
  global.SERVICE = {
    DefaultDigitalCommerceEntitlementService: entitlements,
    DefaultDigitalCommerceMerchantScreenProviderService: provider,
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: () =>
        permission ? ["commerce.coupon.pos.redeem"] : [],
      isPermissionGranted: (p, g) => g.includes(p),
    },
    DefaultModuleService: {
      invokeModule: async (r) =>
        r.apiName === "/identity/scopes/me"
          ? { data: scope }
          : {
              result: [
                {
                  code: "merchant-enterprise",
                  name: "Merchant Enterprise",
                  active: true,
                },
              ],
            },
    },
    DefaultDigitalEntitlementService: {
      get: async (r) => ({
        result: Object.entries(r.query).every(
          ([k, v]) =>
            k === "tenant" || k.startsWith("evidence.") || row[k] === v,
        )
          ? [clone(row)]
          : [],
      }),
      update: async (r) => {
        if (r.query.revision !== row.revision) throw Error("revision conflict");
        assert.equal(
          r.model.revision,
          row.revision + 1,
          "Entitlement revision must advance with the command",
        );
        if (failRedeem && r.model.claimStatus === "REDEEMED") {
          failRedeem = false;
          throw Error("interrupted persistence");
        }
        row = { ...row, ...clone(r.model), revision: row.revision + 1 };
        return { result: clone(row) };
      },
    },
    DefaultDigitalDeliveryService: {
      save: async (r) => {
        receipts.set(r.model.code, clone(r.model));
        return { result: r.model };
      },
    },
    DefaultPromotionOperationService: {
      merchantCoupon: async (r) => {
        if (r.couponToken && r.couponToken !== "CUSTOMER-CODE")
          throw Error("coupon unavailable");
        return {
          code: "coupon",
          issuerEnterpriseRef: {
            moduleName: "profile",
            schemaName: "enterprise",
            code: "merchant-enterprise",
          },
          tokenHash: "secret-provider-hash",
        };
      },
      validateMerchantCoupon: async (r) => {
        assert.equal(r.ownerId, "buyer");
        assert.equal(r.productCode, "product");
        return { eligible: true, conditions: {} };
      },
      claimPurchasedCouponCode: async () => {
        assert(["DELIVERED", "CLAIMED"].includes(coupon));
        coupon = "CLAIMED";
        return { status: coupon };
      },
      redeemClaimedCouponCode: async (r) => {
        assert.equal(r.payload.targetType, "POS");
        assert(["CLAIMED", "REDEEMED"].includes(coupon));
        coupon = "REDEEMED";
        return { status: coupon };
      },
    },
  };
});
async function validated() {
  const p = await merchant.validate(employee({ couponToken: "CUSTOMER-CODE" }));
  assert.equal(p.eligible, true);
  return employee({
    expectedRevision: p.revision,
    validationCode: p.validationCode,
    validationExpiresAt: p.validationExpiresAt,
  });
}
test("enterprise employee validates the existing customer code and confirms one durable receipt without a customer claim screen", async () => {
  const r = await validated();
  assert.equal(coupon, "DELIVERED");
  const result = await merchant.confirm(r);
  assert.equal(result.claimStatus, "REDEEMED");
  assert.equal(result.merchantLabel, "Merchant Enterprise");
  assert.equal(result.merchantReceiptReference, "SALE-123");
  assert.equal(coupon, "REDEEMED");
  assert.equal(receipts.size, 1);
  assert.equal((await merchant.confirm(r)).receiptCode, result.receiptCode);
  assert.equal(
    (await merchant.validate(employee({ couponToken: "CUSTOMER-CODE" })))
      .eligible,
    false,
  );
  assert.equal(JSON.stringify(result).includes("secret-provider-hash"), false);
  assert.equal(JSON.stringify(result).includes("CUSTOMER-CODE"), false);
});
test("customer identity, missing permission and another enterprise scope cannot access fulfillment", async () => {
  await assert.rejects(
    merchant.validate({
      ...employee(),
      authData: {
        principalType: "customer",
        code: "buyer",
        entCode: "partition",
      },
    }),
    /not permitted/,
  );
  permission = false;
  await assert.rejects(
    merchant.validate(employee({ couponToken: "CUSTOMER-CODE" })),
    /not permitted/,
  );
  permission = true;
  scope.scopes = [{ scopeType: "ENTERPRISE", scopeCode: "other-enterprise" }];
  await assert.rejects(
    merchant.validate(employee({ couponToken: "CUSTOMER-CODE" })),
    /outside/,
  );
  assert.equal(coupon, "DELIVERED");
});
test("an explicit enterprise deny wins over broad staff scope", async () => {
  scope.scopes = [{ scopeType: "GLOBAL", scopeCode: "*" }];
  scope.deniedScopes = [
    { scopeType: "ENTERPRISE", scopeCode: "merchant-enterprise" },
  ];
  await assert.rejects(
    merchant.validate(employee({ couponToken: "CUSTOMER-CODE" })),
    /outside/,
  );
  assert.equal((await merchant.queue(employee())).redemptions.length, 0);
});
test("changed, expired or missing validation cannot confirm a coupon", async () => {
  const r = await validated();
  await assert.rejects(
    merchant.confirm({
      ...r,
      payload: { ...r.payload, validationCode: "forged" },
    }),
    /invalid or expired/,
  );
  await assert.rejects(
    merchant.confirm({
      ...r,
      payload: {
        ...r.payload,
        validationExpiresAt: new Date(Date.now() - 1).toISOString(),
      },
    }),
    /invalid or expired/,
  );
  row.revision++;
  await assert.rejects(merchant.confirm(r), /invalid or expired/);
  assert.equal(coupon, "DELIVERED");
  assert.equal(receipts.size, 0);
});
test("receipt and command references are immutable after confirmation", async () => {
  const r = await validated();
  await merchant.confirm(r);
  await assert.rejects(
    merchant.confirm({
      ...r,
      payload: { ...r.payload, merchantReceiptReference: "OTHER-123" },
    }),
    /original/,
  );
  await assert.rejects(
    merchant.confirm({ ...r, idempotencyKey: "other-command" }),
    /original/,
  );
  assert.equal(receipts.size, 1);
});
test("interrupted entitlement persistence resumes from the stored receipt without a new customer action", async () => {
  const r = await validated();
  failRedeem = true;
  await assert.rejects(merchant.confirm(r), /interrupted/);
  assert.equal(coupon, "REDEEMED");
  assert.equal(row.claimStatus, "CLAIMED");
  assert.equal(
    (await merchant.queue(employee())).redemptions[0].recoveryRequired,
    true,
  );
  const done = await merchant.confirm({
    ...r,
    payload: {
      ...r.payload,
      validationCode: undefined,
      validationExpiresAt: undefined,
    },
  });
  assert.equal(done.claimStatus, "REDEEMED");
  assert.equal(receipts.size, 1);
});
test("Promotion eligibility failure and an inactive issuer fail closed before claim", async () => {
  SERVICE.DefaultPromotionOperationService.validateMerchantCoupon =
    async () => {
      throw Error("campaign expired");
    };
  await assert.rejects(
    merchant.validate(employee({ couponToken: "CUSTOMER-CODE" })),
    /expired/,
  );
  SERVICE.DefaultModuleService.invokeModule = async (r) =>
    r.apiName === "/identity/scopes/me" ? { data: scope } : { result: [] };
  await assert.rejects(
    merchant.validate(employee({ couponToken: "CUSTOMER-CODE" })),
    /enterprise is unavailable/,
  );
  assert.equal(coupon, "DELIVERED");
});

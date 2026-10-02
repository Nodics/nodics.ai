/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/test/digitalCommerceRefundContract @description Verifies unused entitlement locking, Promotion authority, replay and claimed-coupon denial before a refund can complete. @layer test @owner digitalCore */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  service = require("../src/service/defaultDigitalCommerceRefundService");
let item, revocations, failComplete;
const r = {
  tenant: "runtime",
  enterpriseCode: "enterprise",
  ownerId: "buyer",
  orderCode: "ORDER",
  refundCode: "REFUND",
  entries: [{ productCode: "product", quantity: "1" }],
};
test.beforeEach(() => {
  item = {
    code: "ENT",
    tenant: r.tenant,
    enterpriseCode: r.enterpriseCode,
    ownerId: r.ownerId,
    orderCode: r.orderCode,
    providerOwner: "promotion",
    providerCode: "COUPON",
    status: "ACTIVE",
    claimStatus: "UNCLAIMED",
    productCode: "product",
    evidence: {},
  };
  revocations = [];
  failComplete = false;
  global.SERVICE = {
    DefaultDigitalCommerceEntitlementService: {
      revocationPolicy:
        require("../src/service/defaultDigitalCommerceEntitlementService")
          .revocationPolicy,
      save: async (s, _r, model) => s.save({ model }),
      listEntitlements: async () => [structuredClone(item)],
      update: async (s, r, i, p) => {
        Object.assign(item, p);
        return item;
      },
      serviceAuthData: () => ({}),
      persistenceModel: (v) => v,
    },
    DefaultDigitalEntitlementService: {},
    DefaultPromotionOperationService: {
      revokePurchasedCoupon: async (r) => {
        if (failComplete && r.complete) {
          failComplete = false;
          throw Error("promotion timeout");
        }
        revocations.push({ code: r.couponCode, complete: r.complete });
      },
    },
    DefaultDigitalReversalService: {
      save: async ({ model }) => {
        const fields = require("../src/schemas/schemas").digitalCore
          .digitalReversal.definition;
        for (const [key, field] of Object.entries(fields))
          if (field.required)
            assert.notEqual(
              model[key],
              undefined,
              "Required reversal field: " + key,
            );
        assert.equal(model.tenant, r.tenant);
        assert.equal(model.correlationId, r.refundCode);
        return model;
      },
    },
  };
});
test("unused coupon locks before payment and completes revocation with retry after Promotion interruption", async () => {
  assert.equal((await service.preview(r)).eligible, true);
  await service.prepare(r);
  assert.equal(item.status, "REFUND_PENDING");
  assert.equal(item.evidence.refundCode, "REFUND");
  failComplete = true;
  await assert.rejects(service.complete(r), /timeout/);
  assert.equal(item.status, "REFUND_PENDING");
  await service.complete(r);
  assert.equal(item.status, "REVOKED");
  await assert.rejects(
    service.prepare({ ...r, refundCode: "OTHER" }),
    /another refund/,
  );
});
test("claimed, redeemed and mixed orders are excluded without changing entitlement or coupon", async () => {
  item.claimStatus = "CLAIMED";
  assert.equal((await service.preview(r)).eligible, false);
  await assert.rejects(service.prepare(r), /manual/);
  assert.equal(revocations.length, 0);
  item.claimStatus = "REDEEMED";
  assert.equal((await service.preview(r)).eligible, false);
  item.claimStatus = "UNCLAIMED";
  assert.equal(
    (
      await service.preview({
        ...r,
        entries: [...r.entries, { productCode: "physical", quantity: "1" }],
      })
    ).eligible,
    false,
  );
});

test("multiple entries of one product match unique purchased units rather than each full product count", () => {
  const entries = [
    { productCode: "product", quantity: "1" },
    { productCode: "product", quantity: "1" },
  ];
  const items = [item, { ...item, code: "ENT2", providerCode: "COUPON2" }];
  assert.equal(service.matchesPurchaseUnits({ ...r, entries }, items), true);
  assert.equal(
    service.matchesPurchaseUnits({ ...r, entries }, [item, item]),
    false,
  );
  assert.equal(service.matchesPurchaseUnits(r, items), false);
  assert.equal(service.matchesPurchaseUnits({ ...r, entries: [] }, []), false);
});

test("a disappearing entitlement rejects prepare and completion before provider effects", async () => {
  SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements =
    async () => [];
  await assert.rejects(service.prepare(r), /incomplete or ambiguous/);
  await assert.rejects(service.complete(r), /incomplete or ambiguous/);
  assert.equal(revocations.length, 0);
});

test("an unrelated extra entitlement cannot qualify a whole-order refund", async () => {
  SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements =
    async () => [
      item,
      {
        ...item,
        code: "EXTRA",
        providerCode: "OTHER",
        productCode: "unrelated",
      },
    ];
  assert.equal((await service.preview(r)).eligible, false);
  await assert.rejects(service.prepare(r), /incomplete or ambiguous/);
  assert.equal(revocations.length, 0);
});

test("foreign owner or provider evidence cannot qualify a coupon reversal", () => {
  for (const patch of [
    { tenant: "foreign" },
    { enterpriseCode: "other" },
    { ownerId: "other" },
    { orderCode: "other" },
    { providerOwner: "other" },
  ])
    assert.equal(
      service.matchesPurchaseUnits(r, [{ ...item, ...patch }]),
      false,
    );
  assert.equal(
    service.matchesPurchaseUnits({ ...r, ownerId: undefined }, [item]),
    false,
  );
  assert.equal(
    service.matchesPurchaseUnits(
      { ...r, entries: [{ productCode: "product", quantity: true }] },
      [item],
    ),
    false,
  );
});

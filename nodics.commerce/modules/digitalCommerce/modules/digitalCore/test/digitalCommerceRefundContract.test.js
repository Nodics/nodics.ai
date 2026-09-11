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
        return {};
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

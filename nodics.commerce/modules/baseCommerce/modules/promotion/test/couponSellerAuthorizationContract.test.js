/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module promotion/test/couponSellerAuthorizationContract @description Authored consent revision, generic-write and customization regression fixtures; execution remains a joint acceptance gate. @layer test @owner promotion */
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/defaultCouponSellerAuthorizationService");
const ref = (code) => ({
  moduleName: "profile",
  schemaName: "enterprise",
  code,
});
/** Installs isolated owner doubles without database, runtime or communications. @param {Object} t Test context. @returns {Object} Customizable owner fixture. */
function fixture(t) {
  const previous = {
    CONFIG: global.CONFIG,
    SERVICE: global.SERVICE,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, previous));
  global.CONFIG = {
    get: () => ({
      sellerAuthorization: {
        enabled: true,
        qualified: true,
        maximumSellers: 10,
      },
    }),
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      /** Preserves failure text in the isolated fixture. */
      constructor(_code, message) {
        super(message);
      }
    },
  };
  global.SERVICE = {
    DefaultPromotionOperationService: { requireOperationalRuntime: () => true },
  };
  return { ...owner, activeEnterprise: async () => {}, issuer: async () => {} };
}
test("current issuer consent is required and retained reservation revision cannot revive", async (t) => {
  const service = fixture(t),
    r = { tenant: "t", enterpriseCode: "seller" },
    coupon = {
      issuerEnterpriseRef: ref("issuer"),
      vendorEnterpriseRef: ref("seller"),
      promotionCode: "offer",
    };
  let grant = {
    sellerEnterpriseCode: "seller",
    issuerEnterpriseCode: "issuer",
    status: "ACTIVE",
    revision: 1,
    expiresAt: "2099-01-01T00:00:00.000Z",
  };
  service.campaign = async () => ({
    code: "offer",
    active: true,
    status: "ACTIVE",
    issuerEnterpriseRef: ref("issuer"),
    sellerAuthorizations: [grant],
  });
  const proof = await service.authorizeSale(r, coupon);
  assert.equal(proof.grantRevision, 1);
  grant = { ...grant, status: "REVOKED", revision: 2 };
  await assert.rejects(
    service.authorizeSale(r, { ...coupon, sellerAuthorizationProof: proof }),
    /unavailable/,
  );
  grant = { ...grant, status: "ACTIVE", revision: 3 };
  await assert.rejects(
    service.authorizeSale(r, { ...coupon, sellerAuthorizationProof: proof }),
    /changed/,
  );
  await assert.rejects(
    service.authorizeSale({ ...r, enterpriseCode: "other" }, coupon),
    /does not match/,
  );
});
test("issuer review uses campaign CAS and reconciles lost acknowledgement without another write", async (t) => {
  const service = fixture(t);
  let row = { code: "offer", revision: 0, issuerEnterpriseRef: ref("issuer") },
    writes = 0;
  service.campaign = async () => row;
  global.SERVICE.DefaultPromotionOperationService = {
    serviceAuthData: () => ({}),
    requireOperationalRuntime: () => true,
  };
  global.SERVICE.DefaultPromotionService = {
    update: async (command) => {
      assert.equal(await service.protect(command), true);
      assert.equal(command.query.revision, 0);
      writes++;
      row = { ...row, ...command.model };
      throw new Error("lost acknowledgement");
    },
  };
  const r = {
    tenant: "t",
    promotionCode: "offer",
    authData: { loginId: "issuer-admin" },
    payload: {
      action: "GRANT",
      sellerEnterpriseCode: "seller",
      expiresAt: "2099-01-01T00:00:00.000Z",
      expectedRevision: 0,
      commandReference: "review-0001",
    },
  };
  const result = await service.manage(r);
  assert.equal(result.promotionRevision, 1);
  assert.equal(result.seller.status, "ACTIVE");
  assert.equal((await service.manage(r)).seller.revision, 1);
  assert.equal(writes, 1);
  await assert.rejects(
    service.manage({ ...r, payload: { ...r.payload, action: "REVOKE" } }),
    /Revocation|conflicts/,
  );
});
test("body authority flags cannot manufacture consent and coupon generic writes retain an atomic proof fence", async (t) => {
  const service = fixture(t);
  await assert.rejects(
    service.protect({
      model: { $set: { "sellerAuthorizations.0.status": "ACTIVE" } },
    }),
    /issuer command/,
  );
  assert.throws(
    () =>
      service.protectCoupon({
        model: { $unset: { sellerAuthorizationProof: true } },
      }),
    /owner-managed/,
  );
  await assert.rejects(
    service.protect({ model: { $replaceWith: { code: "offer" } } }),
    /explicit field/,
  );
  const request = { query: { code: "unit" }, model: { status: "AVAILABLE" } };
  service.protectCoupon(request);
  assert.deepEqual(request.query.sellerAuthorizationProof, { $exists: false });
  global.CONFIG.get = () => ({
    sellerAuthorization: {
      enabled: true,
      qualified: false,
      maximumSellers: 10,
    },
  });
  assert.throws(() => service.policy(), /not qualified/);
});

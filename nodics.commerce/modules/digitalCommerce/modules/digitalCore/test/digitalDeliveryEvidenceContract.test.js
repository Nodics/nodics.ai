/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/defaultDigitalCommerceEntitlementService");
const facade = require("../src/facade/defaultDigitalCommerceCustomerFacade");
const controller = require("../src/controller/defaultDigitalCommerceCustomerController");
const route = require("../src/router/routers").digitalCore.customer.deliveryEvidence;

test("Digital delivery evidence returns one safe current-owner record", async t => {
  const previous = Object.fromEntries(["SERVICE"].map(key => [key, global[key]]));
  const originals = Object.fromEntries(
    ["listContext", "ownedCustomerCoupons", "readRecords", "freshCouponOwner"].map(key => [key, owner[key]]),
  );
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key]; else global[key] = value;
    }
    Object.assign(owner, originals);
  });
  const r = {
    tenant: "default", enterpriseCode: "participant-enterprise", ownerId: "customer",
    ownerRef: { type: "CUSTOMER", code: "customer" }, authData: { principalType: "customer" },
    payload: { entitlementCode: "entitlement" },
  };
  const entitlement = {
    code: "entitlement", tenant: "default", enterpriseCode: "merchant", ownerId: "customer",
    orderCode: "order", providerOwner: "promotion", providerCode: "coupon",
  };
  owner.listContext = async () => r;
  owner.ownedCustomerCoupons = async () => [entitlement];
  owner.readRecords = async () => [{
    code: "delivery", tenant: "default", enterpriseCode: "merchant", ownerId: "customer",
    entitlementCode: "entitlement", orderCode: "order", deliveryType: "COUPON_CODE",
    providerOwner: "promotion", providerCode: "coupon", status: "DELIVERED",
    deliveredAt: "2026-10-20T10:00:00.000Z", revision: 1,
  }];
  let reauthorized = false;
  owner.freshCouponOwner = async () => { reauthorized = true; return r.ownerRef; };
  global.SERVICE = {
    DefaultLoggerService: { inheritRequestPrivacy: () => undefined },
    DefaultDigitalDeliveryService: {},
    DefaultDigitalCommerceEntitlementService: owner,
  };
  const result = await owner.deliveryEvidence({ payload: { entitlementCode: "entitlement" } });
  assert.equal(result.contractVersion, 1);
  assert.equal(result.delivery.code, "delivery");
  assert.equal(result.delivery.status, "DELIVERED");
  assert.equal(reauthorized, true);
  assert.equal(Object.hasOwn(result, "enterpriseCode"), false);
  assert.equal(route.permission, "commerce.digital.own.read");
  assert.equal(route.apiExposure, "commerceCustomer");
  assert.equal(typeof facade.deliveryEvidence, "function");
  assert.equal(typeof controller.deliveryEvidence, "function");
});

test("Digital delivery evidence refuses broad selectors and changed delivery identity", async t => {
  const originals = Object.fromEntries(
    ["listContext", "ownedCustomerCoupons", "readRecords", "freshCouponOwner"].map(key => [key, owner[key]]),
  );
  const previous = global.SERVICE;
  t.after(() => { Object.assign(owner, originals); if (previous === undefined) delete global.SERVICE; else global.SERVICE = previous; });
  await assert.rejects(
    owner.deliveryEvidence({ payload: { entitlementCode: "entitlement", orderCode: "order" } }),
  );
  const r = {
    tenant: "default", enterpriseCode: "participant-enterprise", ownerId: "customer",
    ownerRef: { type: "CUSTOMER", code: "customer" }, authData: { principalType: "customer" },
    payload: { entitlementCode: "entitlement" },
  };
  owner.listContext = async () => r;
  owner.ownedCustomerCoupons = async () => [{
    code: "entitlement", enterpriseCode: "merchant", orderCode: "order",
    providerOwner: "promotion", providerCode: "coupon",
  }];
  owner.readRecords = async () => [{
    code: "delivery", tenant: "default", enterpriseCode: "merchant", ownerId: "intruder",
    entitlementCode: "entitlement", orderCode: "order", deliveryType: "COUPON_CODE",
    providerOwner: "promotion", providerCode: "coupon", status: "DELIVERED",
    deliveredAt: "2026-10-20T10:00:00.000Z",
  }];
  owner.freshCouponOwner = async () => r.ownerRef;
  global.SERVICE = {
    DefaultLoggerService: { inheritRequestPrivacy: () => undefined },
    DefaultDigitalDeliveryService: {},
  };
  await assert.rejects(owner.deliveryEvidence({ payload: { entitlementCode: "entitlement" } }));
});

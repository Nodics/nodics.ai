/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

/**
 * @module fulfillmentCore/test/fulfillmentCustomerPolicyContract
 * @description Verifies customer-safe Fulfillment shipping and return method policies.
 * @layer test
 * @owner fulfillmentCore
 */

const properties = require("../config/properties");
const routers = require("../src/router/routers");
const controller = require("../src/controller/defaultFulfillmentCustomerController");
const service = require("../src/service/defaultFulfillmentOperationService");

test.beforeEach(() => {
  global.CONFIG = {
    get: (key) =>
      key === "fulfillmentCore" ? properties.fulfillmentCore : undefined,
  };
  global.SERVICE = { DefaultFulfillmentOperationService: service };
});

test("Fulfillment customer routes expose shipping and return methods as customer-safe policy", () => {
  assert.equal(
    routers.fulfillmentCore.customer.shippingMethods.key,
    "/shipping/methods",
  );
  assert.equal(
    routers.fulfillmentCore.customer.returnMethods.key,
    "/returns/methods",
  );
  assert.equal(routers.fulfillmentCore.customer.shippingMethods.secured, false);
  assert.equal(
    routers.fulfillmentCore.customer.shippingMethods.publicAccess,
    true,
  );
  assert.deepEqual(
    routers.fulfillmentCore.customer.shippingMethods.accessGroups,
    ["userGroup"],
  );
  assert.equal(
    routers.fulfillmentCore.customer.shippingMethods.apiExposure,
    "commerceCustomer",
  );
});

test("Fulfillment never offers commercial methods without an explicit store policy", async () => {
  assert.deepEqual((await controller.shippingMethods({})).data.methods, []);
  assert.deepEqual((await controller.returnMethods({})).data.methods, []);
});

test("Fulfillment customer API returns only the configured store methods and eligibility metadata", async () => {
  global.CONFIG = {
    get: () => ({
      customerShipping: {
        methods: [
          { code: "COURIER", requiresAddress: true, returnEligible: true },
          {
            code: "STORE_PICKUP",
            requiresAddress: false,
            returnEligible: true,
          },
        ],
        returnMethods: [{ code: "STORE_RETURN", requiresAddress: false }],
      },
    }),
  };
  const shipping = await controller.shippingMethods({});
  assert.deepEqual(
    shipping.data.methods.map((item) => item.code),
    ["COURIER", "STORE_PICKUP"],
  );
  assert.equal(
    shipping.data.methods.find((item) => item.code === "STORE_PICKUP")
      .requiresAddress,
    false,
  );
  assert.equal(
    shipping.data.methods.every((item) => item.returnEligible),
    true,
  );

  const returns = await controller.returnMethods({});
  assert.deepEqual(
    returns.data.methods.map((item) => item.code),
    ["STORE_RETURN"],
  );
});

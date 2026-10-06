/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Verifies sensitive coupon API mapping and employee-only original receipt inspection. */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const routes = require("../src/router/routers").copilotApi;
const controller = require("../src/controller/defaultCopilotController");
test("sensitive coupon routes preserve trusted identity and refuse missing privacy before delegation", async () => {
  for (const route of [
    routes.productPlans.prepareCoupon,
    routes.confirmations.couponReceipt,
  ]) {
    assert.equal(route.secured, true);
    assert.deepEqual(route.authTokenTypes, ["access"]);
    assert.deepEqual(route.accessGroups, ["employeeUserGroup"]);
    assert.equal(route.requestPrivacy.sensitive, true);
    assert.equal(route.cache.enabled, false);
    let calls = 0;
    const authData = { loginId: "employee", enterpriseCode: "ACME" };
    const headers = {};
    const request = {
      tenant: "tenant",
      authData,
      httpRequest: {
        body: {
          authData: {},
          tenant: "foreign",
          expectedRevision: 4,
          argumentsDigest: "digest",
        },
        params: { confirmationCode: "original" },
      },
      httpResponse: {
        setHeader: (key, value) => {
          headers[key] = value;
        },
      },
    };
    global.SERVICE = {
      DefaultLoggerService: {
        assertSensitiveRequest: (r) => assert.equal(r.sensitive, true),
      },
    };
    global.FACADE = {
      DefaultCopilotFacade: {
        [route.operation]: (r) => {
          calls++;
          assert.equal(r.authData, authData);
          assert.equal(r.tenant, "tenant");
          assert.equal(r.confirmationCode, "original");
          assert.equal(r.expectedRevision, 4);
          return { acknowledged: true };
        },
      },
    };
    assert.throws(() => controller[route.operation](request));
    assert.equal(calls, 0);
    request.sensitive = true;
    await controller[route.operation](request);
    assert.equal(calls, 1);
    assert.equal(headers["Cache-Control"], "no-store");
  }
});
test("merchant redemption queue is employee-only, uncached and independently data-authorized", async () => {
  const route = routes.productPlans.couponRedemptions;
  assert.equal(route.secured, true);
  assert.deepEqual(route.authTokenTypes, ["access"]);
  assert.deepEqual(route.accessGroups, ["employeeUserGroup"]);
  assert.equal(route.permission, "copilot.data.query");
  assert.equal(route.method, "GET");
  assert.equal(route.key, "/coupons/redemptions");
  assert.equal(route.cache.enabled, false);
  const headers = {};
  const request = {
    tenant: "tenant",
    authData: { loginId: "employee", enterpriseCode: "ACME" },
    httpResponse: {
      setHeader: (key, value) => {
        headers[key] = value;
      },
    },
  };
  let delegated;
  global.FACADE = {
    DefaultCopilotFacade: {
      getCouponRedemptions: async (value) => {
        delegated = value;
        return { redemptions: [] };
      },
    },
  };
  await controller.getCouponRedemptions(request);
  assert.equal(delegated, request);
  assert.equal(headers["Cache-Control"], "no-store");
});

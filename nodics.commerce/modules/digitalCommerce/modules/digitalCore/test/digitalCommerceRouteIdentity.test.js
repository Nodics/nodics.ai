/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module digitalCore/test/digitalCommerceRouteIdentity
 * @description Protects module-scoped runtime route identities from merchant/notification cross-wiring.
 * @layer test
 * @owner digitalCore
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const routes = require("../src/router/routers").digitalCore;

test("all Digital Core logical route names remain unique across groups", () => {
  const names = Object.values(routes).flatMap((group) =>
    Object.keys(group)
      .filter((name) => name !== "options")
      .map((name) => name.toLowerCase()),
  );
  assert.equal(new Set(names).size, names.length);
  assert.equal(
    routes.merchant.merchantWorkspace.key,
    "/merchant/redemptions/workspace",
  );
  assert.equal(routes.merchant.merchantWorkspace.operation, "workspace");
  assert.equal(
    routes.merchant.merchantWorkspace.permission,
    "commerce.coupon.pos.redeem",
  );
  assert.equal(
    routes.merchant.merchantWorkspace.apiExposure,
    "commerceManagement",
  );
  assert.equal(
    routes.notifications.workspace.permission,
    "commerce.digital.notification.read",
  );
  assert.equal(
    routes.notifications.workspace.apiExposure,
    "commerceNotificationManagement",
  );
});

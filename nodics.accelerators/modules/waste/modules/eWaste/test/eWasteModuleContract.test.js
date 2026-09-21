/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteModuleContract @description Guards one domain accelerator, unchanged authorization and application-neutral extension seams. @layer test @owner eWaste */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const pkg = require("../package.json");
const properties = require("../config/properties").eWaste;
const routes = require("../src/router/routers").eWaste.experience;
const originalPublic = new Set(["experience", "marketplace"]);
assert.equal(pkg.nodics.runtime.router, true);
assert.deepEqual(pkg.nodics.extends, [
  "nodics.waste",
  "nodics.rulesEngine",
]);
assert(!pkg.nodics.owns.includes("schema"));
assert(
  !fs.existsSync(path.join(__dirname, "..", "src", "schemas", "schemas.js")),
  "eWaste must persist generic reward assessments through wasteReward",
);
assert.equal(properties.marketplace.autoPublishListings, false);
assert.equal(properties.rewardValuationService, null);
assert.equal(properties.applicationCode, "EWASTE");
assert(!("register" in routes));
assert(!("contact" in routes));
for (const [name, route] of Object.entries(routes)) {
  if (
    name === "channelAuthenticationEntry" ||
    name === "channelAuthenticationLink"
  ) {
    assert.equal(
      route.controller,
      "DefaultEWasteChannelAuthenticationController",
    );
    assert.equal(route.apiExposure, "eWasteCustomer");
    assert.equal(route.handler, undefined);
    assert.equal(route.cache.enabled, false);
    if (name === "channelAuthenticationEntry") {
      assert.equal(route.secured, false);
      assert.equal(route.publicAccess, true);
    } else {
      assert.equal(route.secured, true);
      assert.deepEqual(route.authTokenTypes, ["access"]);
      assert.deepEqual(route.accessGroups, ["customerUserGroup"]);
    }
    continue;
  }
  assert.equal(route.controller, "DefaultEWasteExperienceController");
  assert.equal(route.apiExposure, "eWasteCustomer");
  if (!originalPublic.has(name)) {
    assert.equal(route.secured, true, name + " must retain authentication");
    const permission = route.permission || route.permissionConfig?.split(".").reduce(
      (value, key) => value?.[key], { eWaste: properties },
    );
    assert(typeof permission === "string" && permission.startsWith("waste."), name + " must retain a configured Waste permission");
    assert.deepEqual(route.authTokenTypes, ["access"]);
  }
}
assert.deepEqual(routes.review.accessGroups, [
  "adminGroup",
  "employeeUserGroup",
]);
assert.equal(routes.review.permission, "waste.review.approve");
assert.equal(routes.createDraft.permission, "waste.submission.create");
assert.equal(routes.purchase.permission, "waste.asset.own.read");
for (const folder of ["src", "config"]) {
  for (const entry of fs.readdirSync(path.join(__dirname, "..", folder), {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
    const text = fs.readFileSync(
      path.join(entry.parentPath, entry.name),
      "utf8",
    );
    assert(
      !/circa|CIRCA|Circa/.test(text),
      entry.name + " must not depend on an application",
    );
  }
}
console.log("eWaste domain ownership and API boundaries validated");

assert.equal(routes.verify.permission, "waste.verification.record");
assert.equal(routes.reviews.permission, "waste.review.queue.read");
assert.equal(routes.audit.permission, "waste.audit.read");

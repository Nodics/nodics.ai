/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteMarketplaceContract @description Keeps purchase mutation and recovery in common Commerce rather than a second domain payment flow. @layer test @owner eWaste */
const test = require("node:test");
const assert = require("node:assert/strict");
const marketplace = require("../src/service/defaultEWasteMarketplaceService");

test("only common Commerce owns purchase mutation and original-command recovery", () => {
  assert.equal(marketplace.purchase, undefined);
  const routes = require("../src/router/routers").eWaste;
  const definitions = Object.values(routes).flatMap(group => Object.values(group));
  assert.equal(definitions.some(route => route.key === "/marketplace/:code/purchase"), false);
  assert.equal(require("../src/controller/defaultEWasteExperienceController").purchase, undefined);
  assert.equal(require("../src/service/defaultEWasteExperienceService").purchase, undefined);
  assert.equal(typeof marketplace.purchases, "function", "Historical read access is preserved");
});
